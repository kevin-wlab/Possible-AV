"""Drop residual rules that cannot match anything on this page (other pages' bits: 3D floor, cards, films...).
A selector part is kept if every class/id it names exists in the page tree (nav/footer spliced in via
NX_COMPONENTS), is a runtime state class toggled by JS, or is a Webflow runtime class (w-*).
Usage: NX_COMPONENTS=navfoot/tree.json python3 prune_residual.py tree.json residual.css out.css"""
import sys, re, json, os, tinycss2
tree, src, dst = sys.argv[1:4]
STATE = {'on', 'open', 'off', 'cur', 'hot', 'lite', 'end', 'all', 'close', 'in', 'show', 'active', 'scrolled', 'nx'}
COMP = {}
if os.environ.get('NX_COMPONENTS'):
    for c in json.load(open(os.environ['NX_COMPONENTS'])).get('children', []): COMP[c['id']['component']] = c
cls, ids = set(), set()
def walk(n):
    if n.get('type') == 'ComponentInstance' and (n.get('instanceDetails') or {}).get('id') in COMP:
        n = COMP[n['instanceDetails']['id']]
    cls.update(n.get('styleNames') or [])
    a = n.get('attributes') or {}
    if a.get('id'): ids.add(a['id'])
    if a.get('class'): cls.update(a['class'].split())
    for c in n.get('children', []): walk(c)
walk(json.load(open(tree)))
def ok(part):
    p = re.sub(r'::?[\w-]+(\([^)]*\))?', '', part)          # pseudos are irrelevant for existence
    p = re.sub(r'\[[^\]]*\]', '', p)
    for c in re.findall(r'\.([\w-]+)', p):
        if c not in cls and c not in STATE and not c.startswith('w-'): return False
    for i in re.findall(r'#([\w-]+)', p):
        if i not in ids: return False
    return True
out = []; kept = dropped = 0
for r in tinycss2.parse_stylesheet(open(src).read(), skip_comments=True, skip_whitespace=True):
    if r.type == 'at-rule' and r.lower_at_keyword == 'media':
        inner = tinycss2.parse_rule_list(r.content, skip_comments=True, skip_whitespace=True)
        keep_inner = []
        for q in inner:
            parts = [x.strip() for x in tinycss2.serialize(q.prelude).split(',')]
            good = [x for x in parts if ok(x)]
            if good: keep_inner.append(', '.join(good) + '{' + tinycss2.serialize(q.content) + '}'); kept += 1
            else: dropped += 1
        if keep_inner: out.append('@media ' + tinycss2.serialize(r.prelude).strip() + '{' + ''.join(keep_inner) + '}')
    elif r.type == 'at-rule':
        out.append(tinycss2.serialize([r])); kept += 1
    elif r.type == 'qualified-rule':
        parts = [x.strip() for x in tinycss2.serialize(r.prelude).split(',')]
        good = [x for x in parts if ok(x)]
        if good: out.append(', '.join(good) + '{' + tinycss2.serialize(r.content) + '}'); kept += 1
        else: dropped += 1
open(dst, 'w').write('\n'.join(out) + '\n')
print(dst, 'kept', kept, 'dropped', dropped, os.path.getsize(src), '->', os.path.getsize(dst))
