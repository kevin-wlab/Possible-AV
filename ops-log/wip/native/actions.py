"""Turn plan.json into Webflow data_style_tool / data_element_tool action batches."""
import json, sys, collections
plan = json.load(open('out/plan.json')); tree = json.load(open(sys.argv[1])); page = sys.argv[2]
EL = {}
def walk(n):
    EL[n['id']['element']] = n
    for c in n.get('children', []): walk(c)
walk(tree)
# split classes whose elements carry different original class lists
by = collections.defaultdict(set)
for eid, c in plan['elements'].items():
    by[c].add(tuple(EL[eid].get('styleNames') or []))
final_el = {}; final_cls = {}
for eid, c in plan['elements'].items():
    orig = tuple(EL[eid].get('styleNames') or [])
    name = c if len(by[c]) == 1 else f"{c}-{'-'.join(orig) or 'x'}"
    final_el[eid] = (list(orig), name)
    final_cls[(orig, name)] = plan['classes'][c]
BP = {'main': None, 'medium': 'medium', 'small': 'small', 'tiny': 'tiny'}
style_actions = []
for (orig, name), ctx in final_cls.items():
    base = ctx.get('main', {})
    a = {'name': name, 'properties': [{'property_name': k, 'property_value': v} for k, v in base.items()]}
    if orig: a['parent_style_names'] = list(orig)
    style_actions.append({'label': 'c:' + name, 'create_style': a})
    for key, props in ctx.items():
        if key == 'main': continue
        hover = key.startswith('hover:'); bp = key.split(':')[-1]
        u = {'style_name': name, 'properties': [{'property_name': k, 'property_value': v} for k, v in props.items()]}
        if orig: u['parent_style_names'] = list(orig)
        if BP[bp]: u['breakpoint_id'] = BP[bp]
        if hover: u['pseudo'] = 'hover'
        style_actions.append({'label': f'u:{name}:{key}', 'update_style': u})
el_actions = [{'label': eid[-6:], 'set_style': {'id': {'component': page, 'element': eid}, 'style_names': orig + [name]}}
              for eid, (orig, name) in final_el.items()]
json.dump(style_actions, open('out/style_actions.json', 'w'))
json.dump(el_actions, open('out/el_actions.json', 'w'))
print(len(style_actions), 'style actions;', len(el_actions), 'element actions;', len(final_cls), 'classes')
