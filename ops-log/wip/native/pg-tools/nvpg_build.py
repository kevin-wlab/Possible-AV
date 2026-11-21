"""Global nv-pg naming across page.css pages: same (original classes, native props) -> same class name.
Usage: python3 nvpg_build.py <pages_native dir> page_slug:page_id ...
Writes <slug>/style_actions.json (only classes not yet in the registry) and <slug>/el_actions.json,
and updates _nvpg_registry.json {name: {"parents": [...], "ctx": {...}}}."""
import json, sys, re, os, collections
D = sys.argv[1]
REG = os.path.join(D, '_nvpg_registry.json')
reg = json.load(open(REG)) if os.path.exists(REG) else {}
key2name = {json.dumps([v['parents'], v['ctx']], sort_keys=True): k for k, v in reg.items()}
BP = {'main': None, 'medium': 'medium', 'small': 'small', 'tiny': 'tiny'}
for arg in sys.argv[2:]:
    slug, page = arg.split(':')
    plan = json.load(open(f'{D}/{slug}/plan.json')); tree = json.load(open(f'{D}/{slug}/tree.json'))
    EL = {}
    def walk(n):
        EL[n['id']['element']] = n
        for c in n.get('children', []): walk(c)
    walk(tree)
    new = []; el_actions = []; used = set()
    for eid, c in plan['elements'].items():
        orig = list(EL[eid].get('styleNames') or [])
        ctx = plan['classes'][c]
        k = json.dumps([orig, ctx], sort_keys=True)
        if k not in key2name:
            base = re.sub(r'-\d+$', '', c); nm = base; i = 2
            while nm in reg: nm = f'{base}-{i}'; i += 1
            reg[nm] = {'parents': orig, 'ctx': ctx}; key2name[k] = nm; new.append(nm)
        nm = key2name[k]; used.add(nm)
        el_actions.append({'label': eid[-6:], 'set_style': {'id': {'component': page, 'element': eid}, 'style_names': orig + [nm]}})
    sa = []
    for nm in new:
        orig = reg[nm]['parents']; ctx = reg[nm]['ctx']
        a = {'name': nm, 'properties': [{'property_name': k, 'property_value': v} for k, v in ctx.get('main', {}).items()]}
        if orig: a['parent_style_names'] = orig
        sa.append({'label': 'c:' + nm, 'create_style': a})
        for key, props in ctx.items():
            if key == 'main': continue
            hover = key.startswith('hover:'); bp = key.split(':')[-1]
            u = {'style_name': nm, 'properties': [{'property_name': k, 'property_value': v} for k, v in props.items()]}
            if orig: u['parent_style_names'] = orig
            if BP[bp]: u['breakpoint_id'] = BP[bp]
            if hover: u['pseudo'] = 'hover'
            sa.append({'label': f'u:{nm}:{key}', 'update_style': u})
    json.dump(sa, open(f'{D}/{slug}/style_actions.json', 'w'))
    json.dump(el_actions, open(f'{D}/{slug}/el_actions.json', 'w'))
    json.dump(sorted(used), open(f'{D}/{slug}/classes_used.json', 'w'))
    print(slug, 'classes used', len(used), 'new', len(new), 'style actions', len(sa), 'elements', len(el_actions))
json.dump(reg, open(REG, 'w'), indent=1)
print('registry', len(reg))
