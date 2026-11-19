"""Plan a move of one page's external CSS into native Webflow classes.

Input: the page's element tree (get_all_elements JSON) and its stylesheet.
Output (plan.json): for every element in the migrated region, one native class
name and that class's properties per breakpoint/hover; plus residual.css, the
rules that must stay in custom code (JS states, lite mode, pseudo-elements,
rules that also match elements outside the region).

Usage: python3 migrate.py tree.json web/studio.css out_dir [region_selector]
"""
import json, re, sys, collections
import tinycss2
from lxml import etree
from cssselect import GenericTranslator, SelectorError
from cssselect.parser import parse as css_parse

tree_path, css_path, out_dir = sys.argv[1:4]
REGION = sys.argv[4] if len(sys.argv) > 4 else 'section.next'

# ---------- tree -> DOM ----------
TAGMAP = {'Paragraph': 'p', 'Link': 'a', 'Span': 'span', 'ListItem': 'li', 'Image': 'img',
          'Emphasized': 'em', 'Strong': 'strong', 'Body': 'body'}
root_json = json.load(open(tree_path))
EL = {}

def tag_of(n):
    t = n['type']; s = n.get('settings') or {}
    if t == 'Heading': return 'h%d' % s.get('headingLevel', 2)
    if t in ('Block', 'DOM', 'List'): return s.get('tag') or ('ul' if t == 'List' else 'div')
    if t == 'ComponentInstance': return 'div'
    return TAGMAP.get(t, 'span')

def build(n, parent):
    if n['type'] == 'String':
        if len(parent):
            last = parent[-1]; last.tail = (last.tail or '') + n.get('textContent', '')
        else:
            parent.text = (parent.text or '') + n.get('textContent', '')
        return
    e = etree.SubElement(parent, tag_of(n)) if parent is not None else etree.Element('body')
    eid = n['id']['element']; e.set('data-eid', eid); EL[eid] = n
    cls = n.get('styleNames') or []
    if n['type'] == 'ComponentInstance': cls = ['__component']
    if cls: e.set('class', ' '.join(cls))
    for k, v in (n.get('attributes') or {}).items():
        if k in ('id', 'href', 'type', 'data-i'): e.set(k, str(v))
    for c in n.get('children', []): build(c, e)
    return e

html = etree.Element('html')
body = build(root_json, None); html.append(body)
region_nodes = set()
for sec in html.xpath(GenericTranslator().css_to_xpath(REGION)):
    for d in sec.iter(): region_nodes.add(d)
outside = set(html.iter()) - region_nodes

# ---------- CSS ----------
css = open(css_path).read()
rules = tinycss2.parse_stylesheet(css, skip_comments=True, skip_whitespace=True)
VARS = {}
items = []  # (order, media, selector_text, decls(list of (prop,val,imp)))
order = [0]

def decls_of(block):
    out = []
    for d in tinycss2.parse_declaration_list(block, skip_comments=True, skip_whitespace=True):
        if d.type != 'declaration': continue
        out.append((d.lower_name, tinycss2.serialize(d.value).strip(), d.important))
    return out

def walk(rs, media):
    for r in rs:
        if r.type == 'qualified-rule':
            sel = tinycss2.serialize(r.prelude).strip()
            ds = decls_of(r.content)
            if sel == ':root':
                for p, v, _ in ds:
                    if p.startswith('--'): VARS[p] = v
            order[0] += 1
            items.append((order[0], media, sel, ds))
        elif r.type == 'at-rule':
            kw = r.lower_at_keyword
            pre = tinycss2.serialize(r.prelude).strip()
            if kw in ('media', 'supports'):
                inner = tinycss2.parse_rule_list(r.content, skip_comments=True, skip_whitespace=True)
                walk(inner, f'@{kw} {pre}')
            else:
                order[0] += 1; items.append((order[0], f'@{kw} {pre}', None, tinycss2.serialize(r.content)))
walk(rules, '')

def resolve(v):
    for _ in range(5):
        v2 = re.sub(r'var\((--[\w-]+)(?:\s*,\s*([^)]+))?\)', lambda m: VARS.get(m.group(1), m.group(2) or m.group(0)), v)
        if v2 == v: break
        v = v2
    return v

def media_bp(media):
    if media == '': return 'main'
    m = re.fullmatch(r'@media \(max-width:\s*(\d+)px\)', media)
    if not m: return None
    w = int(m.group(1))
    if w >= 1100: return None          # large-desktop tweaks: keep custom
    if w >= 800: return 'medium'       # 900 -> Webflow tablet (<=991)
    if w >= 600: return 'small'        # 760 -> landscape phone (<=767)
    return 'tiny'                      # 520 -> portrait phone (<=479)

def spec(sel):
    try:
        return css_parse(sel)[0].specificity()
    except Exception:
        return (0, 0, 0)

# per element: list of (bp, hover, specificity, order, prop, val, important)
hits = collections.defaultdict(list)
residual = []   # (order, media, selector, decls) kept in custom code
for o, media, sel, ds in items:
    if sel is None:
        residual.append((o, media, None, ds)); continue
    bp = media_bp(media)
    keep_parts = []
    for part in [p.strip() for p in sel.split(',')]:
        hover = False; test = part
        if '::' in part or 'html.lite' in part or bp is None or part in ('*', 'html', 'body', 'html,body', ':root'):
            keep_parts.append(part); continue
        if re.search(r':hover\s*$', part):
            hover = True; test = re.sub(r':hover\s*$', '', part)
        elif ':hover' in part:
            keep_parts.append(part); continue
        try:
            xp = GenericTranslator().css_to_xpath(test)
        except SelectorError:
            keep_parts.append(part); continue
        matched = html.xpath(xp)
        if not matched:
            keep_parts.append(part); continue        # state rules (.on/.open), other pages' bits
        in_r = [m for m in matched if m in region_nodes and m.get('data-eid')]
        if len(in_r) != len(matched):
            keep_parts.append(part)                  # also styles nav/floor/footer: keep it too
        sp = spec(part)
        for m in in_r:
            for p, v, imp in ds:
                if p.startswith('--'): continue
                hits[m.get('data-eid')].append((bp, hover, sp, o, p, resolve(v), imp))
    if keep_parts:
        residual.append((o, media, ', '.join(keep_parts), ds))

# ---------- shorthand expansion to Webflow longhands ----------
def box(v):
    t = v.split()
    if len(t) == 1: t = t * 4
    elif len(t) == 2: t = [t[0], t[1], t[0], t[1]]
    elif len(t) == 3: t = [t[0], t[1], t[2], t[1]]
    return t[:4]

def expand(p, v):
    if p in ('margin', 'padding'):
        t = box(v); return [(f'{p}-{s}', x) for s, x in zip(('top', 'right', 'bottom', 'left'), t)]
    if p == 'inset':
        t = box(v); return list(zip(('top', 'right', 'bottom', 'left'), t))
    if p == 'border-radius' and '/' not in v:
        t = box(v); return [(f'border-{c}-radius', x) for c, x in zip(('top-left', 'top-right', 'bottom-right', 'bottom-left'), t)]
    if p == 'gap':
        t = v.split(); r = t[0]; c = t[1] if len(t) > 1 else t[0]
        return [('grid-row-gap', r), ('grid-column-gap', c)]
    if p in ('border', 'border-top', 'border-right', 'border-bottom', 'border-left'):
        sides = ('top', 'right', 'bottom', 'left') if p == 'border' else (p.split('-')[1],)
        if v in ('0', 'none'):
            return [(f'border-{s}-style', 'none') for s in sides]
        t = v.split(); w = '1px'; st = 'solid'; col = 'currentColor'
        rest = []
        for x in re.findall(r'rgba?\([^)]*\)|\S+', v):
            if re.fullmatch(r'[\d.]+(px|em|rem)?', x): w = x
            elif x in ('solid', 'dashed', 'dotted', 'none', 'double'): st = x
            else: col = x
        out = []
        for s in sides: out += [(f'border-{s}-width', w), (f'border-{s}-style', st), (f'border-{s}-color', col)]
        return out
    if p == 'border-color':
        return [(f'border-{s}-color', v) for s in ('top', 'right', 'bottom', 'left')]
    if p == 'border-width':
        t = box(v); return [(f'border-{s}-width', x) for s, x in zip(('top', 'right', 'bottom', 'left'), t)]
    if p == 'flex':
        if v == 'none': return [('flex-grow', '0'), ('flex-shrink', '0'), ('flex-basis', 'auto')]
        if v == '1': return [('flex-grow', '1'), ('flex-shrink', '1'), ('flex-basis', '0%')]
        t = v.split()
        if len(t) == 3: return [('flex-grow', t[0]), ('flex-shrink', t[1]), ('flex-basis', t[2])]
    if p == 'background':
        if re.fullmatch(r'(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|[a-z]+)', v): return [('background-color', v)]
        return [('background-image', v)]
    if p == 'overflow' and len(v.split()) == 1:
        return [('overflow-x', v), ('overflow-y', v)] if False else [('overflow', v)]
    if p == 'list-style' and v == 'none': return [('list-style-type', 'none')]
    if p == 'font' and v == 'inherit':
        return [('font-family', 'inherit'), ('font-size', 'inherit'), ('font-weight', 'inherit'), ('line-height', 'inherit')]
    return [(p, v)]

# ---------- cascade per element ----------
CTX = ['main', 'medium', 'small', 'tiny']
plan_el = {}
for eid, hs in hits.items():
    out = {}
    for hover in (False, True):
        acc = {}
        for bp in CTX:
            # rules from this bp and wider bps cascade together (desktop-first)
            pool = [h for h in hs if h[1] == hover and CTX.index(h[0]) <= CTX.index(bp)]
            win = {}
            for bpp, hv, sp, o, p, v, imp in sorted(pool, key=lambda h: (h[6], CTX.index(h[0]) if False else 0, h[2], h[3])):
                for pp, vv in expand(p, v):
                    win[pp] = vv
            # recompute strictly by cascade: important > specificity > order (media rules come later in file anyway)
            win = {}
            for bpp, hv, sp, o, p, v, imp in sorted(pool, key=lambda h: (h[6], h[2], h[3])):
                for pp, vv in expand(p, v):
                    win[pp] = vv
            prev = acc.get(CTX[CTX.index(bp) - 1]) if bp != 'main' else None
            acc[bp] = win
            key = ('hover:' if hover else '') + bp
            if prev is None:
                if win: out[key] = win
            else:
                diff = {k: v for k, v in win.items() if prev.get(k) != v}
                if diff: out[key] = diff
    if out: plan_el[eid] = out

# ---------- group into classes ----------
def role_name(e):
    eid = e.get('data-eid'); n = EL[eid]
    cls = (n.get('styleNames') or [])
    own = cls[0] if cls else e.tag
    anc = e.getparent(); acls = None
    while anc is not None and anc not in (body,):
        c = (anc.get('class') or '').split()
        if c and c[0] not in ('next',): acls = c[0]; break
        if c and c[0] == 'next': acls = anc.get('id') or 'next'; break
        anc = anc.getparent()
    base = f'hn-{acls}-{own}' if acls and acls != own else f'hn-{own}'
    return re.sub(r'[^a-zA-Z0-9-]', '-', base)

sig2cls = {}; used = collections.Counter(); el_class = {}
for e in html.iter():
    eid = e.get('data-eid')
    if not eid or e not in region_nodes: continue
    props = plan_el.get(eid)
    if not props: continue
    sig = json.dumps(props, sort_keys=True)
    if sig not in sig2cls:
        nm = role_name(e)
        if used[nm]: nm = f'{nm}-{used[nm] + 1}'
        used[role_name(e)] += 1
        sig2cls[sig] = nm
    el_class[eid] = sig2cls[sig]

classes = {v: json.loads(k) for k, v in sig2cls.items()}

# ---------- residual css ----------
def ser_decls(ds):
    if isinstance(ds, str): return ds
    return ';'.join(f'{p}:{v}' + (' !important' if imp else '') for p, v, imp in ds)
res_out = []
for o, media, sel, ds in residual:
    if sel is None:
        res_out.append(f'{media}{{{ds}}}'); continue
    rule = f'{sel}{{{ser_decls(ds)}}}'
    res_out.append(f'{media}{{{rule}}}' if media else rule)

json.dump({'classes': classes, 'elements': el_class,
           'unstyled_region_elements': [e.get('data-eid') for e in region_nodes if e.get('data-eid') and e.get('data-eid') not in el_class]},
          open(f'{out_dir}/plan.json', 'w'), indent=1)
open(f'{out_dir}/residual.css', 'w').write('\n'.join(res_out) + '\n')
print('classes', len(classes), 'elements', len(el_class), 'residual rules', len(res_out),
      'orig rules', len([i for i in items]))
