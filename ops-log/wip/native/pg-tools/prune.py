"""Drop residual rules that can never match on this page.
A selector part is kept if it (or its runtime-state-stripped form) matches an element of the page tree
(nav/footer component trees grafted in, CMS rich text given synthetic children), or is global
(*, html, body, :root), a pseudo-element of such a match, or a non-style at-rule other than unused @keyframes.
Usage: python3 prune.py tree.json residual.css navfoot_tree.json out.css"""
import sys, re, json, tinycss2
from lxml import etree
from cssselect import GenericTranslator, SelectorError
tree_path, css_path, comp_path, out_path = sys.argv[1:5]
COMP = {c['id']['component']: c for c in json.load(open(comp_path)).get('children', [])}
TAGMAP = {'Paragraph': 'p', 'Link': 'a', 'Span': 'span', 'ListItem': 'li', 'Image': 'img', 'Emphasized': 'em',
          'Strong': 'strong', 'Body': 'body', '': 'br', 'RichText': 'div'}
RICH = ['p', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'figure', 'img', 'figcaption',
        'blockquote', 'table', 'tr', 'th', 'td', 'hr', 'code']
def tag_of(n):
    t = n['type']; s = n.get('settings') or {}
    if t == 'Heading': return 'h%d' % s.get('headingLevel', 2)
    if t in ('Block', 'DOM', 'List'): return s.get('tag') or ('ul' if t == 'List' else 'div')
    if t == 'ComponentInstance': return 'div'
    return TAGMAP.get(t, 'span')
def build(n, parent):
    if n['type'] == 'ComponentInstance' and (n.get('instanceDetails') or {}).get('id') in COMP:
        n = COMP[n['instanceDetails']['id']]
    if n['type'] == 'String': return
    e = etree.SubElement(parent, tag_of(n)) if parent is not None else etree.Element('body')
    if n.get('styleNames'): e.set('class', ' '.join(n['styleNames']))
    for k, v in (n.get('attributes') or {}).items():
        if k in ('id', 'href', 'type'): e.set(k, str(v))
    for c in n.get('children', []): build(c, e)
    if n['type'] == 'RichText':
        # nested so that descendant combos (ul li a, ol li ...) also match
        p = etree.SubElement(e, 'p'); etree.SubElement(p, 'a'); etree.SubElement(p, 'strong'); etree.SubElement(p, 'em'); etree.SubElement(p, 'code')
        for h in ('h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'img'): etree.SubElement(e, h)
        for l in ('ul', 'ol'):
            L = etree.SubElement(e, l); li = etree.SubElement(L, 'li'); etree.SubElement(li, 'a'); etree.SubElement(li, 'strong'); etree.SubElement(L, 'li')
        f = etree.SubElement(e, 'figure'); etree.SubElement(f, 'img'); etree.SubElement(f, 'figcaption')
        t = etree.SubElement(e, 'table'); tr = etree.SubElement(t, 'tr'); etree.SubElement(tr, 'th'); etree.SubElement(tr, 'td')
    return e
html = etree.Element('html'); html.set('class', 'nx'); body = build(json.load(open(tree_path)), None); html.append(body)
ALLCLS = set(c for e in html.iter() for c in (e.get('class') or '').split())
GT = GenericTranslator()
def matches(sel):
    try: return bool(html.xpath(GT.css_to_xpath(sel)))
    except SelectorError: return True   # unknown syntax: keep
    except Exception: return True
def strip_state(part):
    t = re.sub(r'::?(before|after|-webkit-[\w-]+|marker|placeholder|selection)\b(\([^)]*\))?', '', part)
    out = []
    for tok in re.split(r'(\s*[>+~]\s*|\s+)', t):
        if not tok.strip() or re.fullmatch(r'\s*[>+~]\s*', tok): out.append(tok); continue
        c = re.sub(r':(hover|focus|focus-visible|focus-within|active|checked|target|visited|disabled|placeholder-shown)(?![\w-])', '', tok)
        c = re.sub(r'\[(?!(href|type|id)\b)[^\]]*\]', '', c)
        # classes that only appear at runtime (.open, .cur, .lite, .on ...) are dropped from the test
        c = re.sub(r'\.([\w-]+)', lambda m: m.group(0) if m.group(1) in ALLCLS or m.group(1) == 'nx' else ('' if m.group(1) in RUNTIME else '.__never__'), c)
        if c == '': c = '*'
        out.append(c)
    return ''.join(out).strip()
RUNTIME = {'open', 'cur', 'lite', 'on', 'off', 'hot', 'close'}
GLOBAL = {'*', 'html', 'body', ':root', 'html,body', 'html, body'}
used_kf = set(); kept = 0; dropped = 0
def keep_part(p):
    p = p.strip()
    if p in GLOBAL: return True
    return matches(strip_state(p))
out = []
def walk(rules, depth=0):
    global kept, dropped
    res = []
    for r in rules:
        if r.type == 'qualified-rule':
            parts = [p.strip() for p in tinycss2.serialize(r.prelude).split(',')]
            kp = [p for p in parts if keep_part(p)]
            if kp:
                body = tinycss2.serialize(r.content).strip()
                for m in re.finditer(r'animation(?:-name)?\s*:\s*([\w-]+)', body): used_kf.add(m.group(1))
                res.append(','.join(kp) + '{' + body + '}'); kept += 1
            else:
                dropped += 1
        elif r.type == 'at-rule':
            kw = r.lower_at_keyword; pre = tinycss2.serialize(r.prelude).strip()
            if kw in ('media', 'supports'):
                inner = walk(tinycss2.parse_rule_list(r.content, skip_comments=True, skip_whitespace=True), depth + 1)
                if inner: res.append(f'@{kw} {pre}{{' + ''.join(inner) + '}')
            else:
                res.append(('KF', pre, f'@{kw} {pre}{{' + tinycss2.serialize(r.content).strip() + '}') if kw == 'keyframes' else f'@{kw} {pre}{{' + tinycss2.serialize(r.content).strip() + '}')
    return res
res = walk(tinycss2.parse_stylesheet(open(css_path).read(), skip_comments=True, skip_whitespace=True))
final = []
for x in res:
    if isinstance(x, tuple):
        if x[1] in used_kf: final.append(x[2])
    else: final.append(x)
css = '\n'.join(final) + '\n'
open(out_path, 'w').write(css)
print('kept', kept, 'dropped', dropped, 'bytes', len(css))
