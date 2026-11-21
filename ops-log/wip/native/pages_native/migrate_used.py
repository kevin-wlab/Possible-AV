"""Plan a move of one page's external CSS into native Webflow classes.

Input: the page's element tree (get_all_elements JSON) and its stylesheet.
Output (plan.json): for every element in the migrated region, one native class
name and that class's properties per breakpoint/hover; plus residual.css, the
rules that must stay in custom code (JS states, lite mode, pseudo-elements,
rules that also match elements outside the region).

Usage: python3 migrate.py tree.json web/studio.css out_dir [region_selector] [class_prefix]
"""
import json, re, sys, collections, os
import tinycss2
from lxml import etree
from cssselect import GenericTranslator, SelectorError
from cssselect.parser import parse as css_parse

tree_path, css_path, out_dir = sys.argv[1:4]
REGION = sys.argv[4] if len(sys.argv) > 4 else 'section.next'
PREFIX = sys.argv[5] if len(sys.argv) > 5 else 'hn'
# optional: comma list of classes JS toggles at runtime on body/html (e.g. 'end,top').
# Rules using them are applied natively (static state) AND kept in residual (runtime state).
DUAL = [c for c in (sys.argv[6].split(',') if len(sys.argv) > 6 else []) if c]
DUAL_RE = re.compile(r'\.(' + '|'.join(map(re.escape, DUAL)) + r')(?![\w-])') if DUAL else None

# ---------- tree -> DOM ----------
TAGMAP = {'Paragraph': 'p', 'Link': 'a', 'Span': 'span', 'ListItem': 'li', 'Image': 'img',
          'Emphasized': 'em', 'Strong': 'strong', 'Body': 'body',
          # native form elements
          'FormWrapper': 'div', 'FormForm': 'form', 'FormBlockLabel': 'label', 'FormTextInput': 'input',
          'FormTextarea': 'textarea', 'FormButton': 'input', 'FormSuccessMessage': 'div',
          'FormErrorMessage': 'div', 'FormSelect': 'select', '': 'br'}
# RichText renders as a div; NX_RICH=1 adds generated children (no data-eid) so rules that also style
# CMS rich-text content (p, h2, a, .prose li...) are detected as hitting non-region elements and stay residual.
TAGMAP.setdefault('RichText', 'div')
RICH_KIDS = ['p>a,strong,em,code', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul>li', 'ol>li', 'figure>img,figcaption', 'blockquote', 'table>tr>th,td', 'hr', 'img']
# Optional: NX_COMPONENTS=navfoot/tree.json splices the real nav/footer component trees in place of
# their instances, so tag selectors (a, h1, p...) that also hit nav/footer stay residual.
import os
COMP = {}
if os.environ.get('NX_COMPONENTS'):
    for _c in json.load(open(os.environ['NX_COMPONENTS'])).get('children', []):
        COMP[_c['id']['component']] = _c
root_json = json.load(open(tree_path))
EL = {}

def tag_of(n):
    t = n['type']; s = n.get('settings') or {}
    if t == 'Heading': return 'h%d' % s.get('headingLevel', 2)
    if t in ('Block', 'DOM', 'List'): return s.get('tag') or ('ul' if t == 'List' else 'div')
    if t == 'ComponentInstance': return 'div'
    return TAGMAP.get(t, 'span')

def build(n, parent):
    if n['type'] == 'ComponentInstance' and (n.get('instanceDetails') or {}).get('id') in COMP:
        n = COMP[n['instanceDetails']['id']]
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
    if n['type'] == 'RichText' and os.environ.get('NX_RICH') == '1':
        for spec_ in RICH_KIDS:
            parts = spec_.split('>'); cur = e
            for i, tg in enumerate(parts):
                tags = tg.split(',')
                for t2 in tags[1:] if i == len(parts) - 1 else []:
                    etree.SubElement(cur, t2)
                cur = etree.SubElement(cur, tags[0])
                if i < len(parts) - 1 and len(tags) > 1:
                    for t2 in tags[1:]: etree.SubElement(cur.getparent(), t2)
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
# NX_PIN_WIDE=1 (opt-in): properties that a wide-screen media rule (>=1100px / min-width, kept in custom code)
# sets on a region element are not made native for that element (a combo class would out-rank the residual
# rule); the plain rules setting those properties stay in residual.css instead, so every width stays exact.
import os
PIN_WIDE = os.environ.get('NX_PIN_WIDE') == '1'
pinned = collections.defaultdict(set)
pin_src = []   # (order, media, part, decls, matched eids) of plain rules, for re-emitting pinned props
residual = []   # (order, media, selector, decls) kept in custom code
# NX_LOCK_STATE=1 (opt-in): same idea as NX_PIN_WIDE for runtime-state rules (.on, [aria-selected], :focus,
# :hover inside a selector...). Their base element's properties stay in residual so a native combo class
# (higher specificity) never beats the state rule. Compared by longhand, so border vs border-color etc. match.
LOCK_STATE = os.environ.get('NX_LOCK_STATE') == '1'
spinned = collections.defaultdict(set)
ALLCLS = set(c for e in html.iter() for c in (e.get('class') or '').split())
def state_base(part):
    t = re.sub(r':hover\s*$', '', part)
    out = []
    for tok in re.split(r'(\s*[>+~]\s*|\s+)', t):
        if not tok.strip() or re.fullmatch(r'\s*[>+~]\s*', tok):
            out.append(tok); continue
        c = re.sub(r':(hover|focus|focus-visible|focus-within|active|checked|target|visited|disabled|placeholder-shown)(?![\w-])', '', tok)
        c = re.sub(r'\[(?!(href|type|id)\b)[^\]]*\]', '', c)
        c = re.sub(r'\.([\w-]+)', lambda m: m.group(0) if m.group(1) in ALLCLS else '', c)
        if not c: return None
        out.append(c)
    b = ''.join(out)
    return b if b != t else None
for o, media, sel, ds in items:
    if sel is None:
        residual.append((o, media, None, ds)); continue
    bp = media_bp(media)
    keep_parts = []
    for part in [p.strip() for p in sel.split(',')]:
        hover = False; test = part
        if bp is None and PIN_WIDE and '::' not in part and 'html.lite' not in part and ':hover' not in part \
                and part not in ('*', 'html', 'body', 'html,body', ':root'):
            try:
                for m in html.xpath(GenericTranslator().css_to_xpath(part)):
                    if m in region_nodes and m.get('data-eid'):
                        pinned[m.get('data-eid')].update(p for p, _, _ in ds if not p.startswith('--'))
            except SelectorError:
                pass
        if LOCK_STATE and bp is not None and '::' not in part and 'html.lite' not in part:
            _b = state_base(part)
            if _b:
                try:
                    for m in html.xpath(GenericTranslator().css_to_xpath(_b)):
                        if m in region_nodes and m.get('data-eid'):
                            spinned[m.get('data-eid')].update(p for p, _, _ in ds if not p.startswith('--'))
                except SelectorError:
                    pass
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
        if len(in_r) != len(matched) or (DUAL_RE and DUAL_RE.search(part)):
            keep_parts.append(part)                  # also styles nav/floor/footer: keep it too
        sp = spec(part)
        if in_r: pin_src.append((o, media, part + (':hover' if hover else ''), ds, [m.get('data-eid') for m in in_r]))
        for m in in_r:
            for p, v, imp in ds:
                if p.startswith('--'): continue
                hits[m.get('data-eid')].append((bp, hover, sp, o, p, resolve(v), imp))
    if keep_parts:
        residual.append((o, media, ', '.join(keep_parts), ds))

def _apply_pinned():
    # compared by longhand (NX_PIN_LONGHAND=1), so e.g. a wide rule's row-gap also pins a plain rule's gap
    lh = os.environ.get('NX_PIN_LONGHAND') == '1'
    L = (lambda p, v='0': set(x for x, _ in expand(p, v))) if lh else (lambda p, v='0': {p})
    PN = {e: set().union(*[L(p) for p in ps]) for e, ps in pinned.items()}
    for eid in list(hits):
        if eid in PN:
            hits[eid] = [h for h in hits[eid] if not (L(h[4], h[5]) & PN[eid])]
    for o, media, part, ds, eids in pin_src:
        props = set().union(*[PN.get(e, set()) for e in eids])
        keep = [d for d in ds if L(d[0], d[1]) & props]
        if keep:
            residual.append((o, media, part, keep))
    residual.sort(key=lambda r: r[0])
    print('pinned', {EL[e].get('styleNames') and ' '.join(EL[e]['styleNames']) or e: sorted(v) for e, v in pinned.items()})

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
            # shorthand also resets colour to currentColor (computed value differs otherwise)
            return [x for s in sides for x in ((f'border-{s}-style', 'none'), (f'border-{s}-color', 'currentColor'))]
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
        full = os.environ.get('NX_BG_FULL') == '1'   # shorthand also resets the other half
        if re.fullmatch(r'(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|[a-z]+)', v):
            return [('background-color', v)] + ([('background-image', 'none')] if full else [])
        return [('background-image', v)] + ([('background-color', 'transparent')] if full else [])
    if p == 'font' and v != 'inherit':
        m = re.fullmatch(r'(?:(italic|normal)\s+)?(?:(\d{3}|bold|normal)\s+)?([\d.]+(?:px|em|rem))(?:/(\S+))?\s+(.+)', v)
        if m:
            return [('font-style', m.group(1) or 'normal'), ('font-weight', m.group(2) or 'normal'), ('font-size', m.group(3)),
                    ('line-height', m.group(4) or 'normal'), ('font-family', m.group(5))]
    if p == 'overflow' and len(v.split()) == 1:
        return [('overflow-x', v), ('overflow-y', v)] if False else [('overflow', v)]
    if p == 'list-style' and v == 'none': return [('list-style-type', 'none')]
    if p == 'font' and v == 'inherit':
        return [('font-family', 'inherit'), ('font-size', 'inherit'), ('font-weight', 'inherit'), ('line-height', 'inherit')]
    if p == 'font':
        # "[style] [weight] size[/line-height] family" -> longhands (shorthand resets line-height to normal)
        m = re.fullmatch(r'\s*(?:(italic|normal)\s+)?(?:(\d{3}|bold|normal)\s+)?([\d.]+(?:px|em|rem|%))(?:/([\d.]+(?:px|em|rem|%)?))?\s+(.+)', v)
        if m:
            return [('font-style', m.group(1) or 'normal'), ('font-weight', m.group(2) or '400'), ('font-size', m.group(3)),
                    ('line-height', m.group(4) or 'normal'), ('font-family', m.group(5).strip())]
    return [(p, v)]

if pinned:
    _apply_pinned()

if spinned:
    def _lh(p, v='0'): return set(x for x, _ in expand(p, v))
    SP = {e: set().union(*[_lh(p) for p in ps]) for e, ps in spinned.items()}
    for eid in list(hits):
        if eid in SP:
            hits[eid] = [h for h in hits[eid] if not (_lh(h[4], h[5]) & SP[eid])]
    for o, media, part, ds, eids in pin_src:
        props = set().union(*[SP.get(e, set()) for e in eids])
        keep = [d for d in ds if _lh(d[0], d[1]) & props]
        if keep and not any(r[0] == o and r[2] == part for r in residual):
            residual.append((o, media, part, keep))
    residual.sort(key=lambda r: r[0])
    print('state-locked', {EL[e].get('styleNames') and ' '.join(EL[e]['styleNames']) or e: sorted(v) for e, v in spinned.items()})

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
    base = f'{PREFIX}-{acls}-{own}' if acls and acls != own else f'{PREFIX}-{own}'
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
