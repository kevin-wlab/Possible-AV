"""Nav/footer: keep only properties no @media / state rule changes, so native classes never fight the stylesheet's breakpoints."""
import json, re, glob, tinycss2
from lxml import etree
from cssselect import GenericTranslator
T=json.load(open('navfoot/tree.json')); plan=json.load(open('navfoot/out_home/plan.json'))
TAG={'Paragraph':'p','Link':'a','Span':'span','Body':'body'}
def tag(n):
    s=n.get('settings') or {}
    return s.get('tag') or TAG.get(n['type'],'div')
def build(n,p):
    if n['type']=='String': return
    e=etree.SubElement(p,tag(n)) if p is not None else etree.Element('body')
    e.set('data-eid',n['id']['element'])
    if n.get('styleNames'): e.set('class',' '.join(n['styleNames']))
    for k,v in (n.get('attributes') or {}).items():
        if k in('id','href'): e.set(k,v)
    for c in n.get('children',[]): build(c,e)
    return e
html=etree.Element('html'); html.append(build(T,None))
LONG={'padding':['padding-top','padding-right','padding-bottom','padding-left'],'margin':['margin-top','margin-right','margin-bottom','margin-left'],'gap':['grid-column-gap','grid-row-gap'],'border':['border-top-width','border-top-style','border-top-color','border-right-width','border-right-style','border-right-color','border-bottom-width','border-bottom-style','border-bottom-color','border-left-width','border-left-style','border-left-color'],'border-bottom':['border-bottom-width','border-bottom-style','border-bottom-color'],'inset':['top','right','bottom','left'],'flex':['flex-grow','flex-shrink','flex-basis'],'background':['background-color','background-image'],'border-radius':['border-top-left-radius','border-top-right-radius','border-bottom-left-radius','border-bottom-right-radius'],'row-gap':['grid-row-gap'],'column-gap':['grid-column-gap']}
def props(block):
    out=set()
    for d in tinycss2.parse_declaration_list(block,skip_comments=True,skip_whitespace=True):
        if d.type!='declaration': continue
        out.update(LONG.get(d.lower_name,[d.lower_name]))
    return out
bad={}  # eid -> props touched by media or state rules
def scan(rules,in_media):
    for r in rules:
        if r.type=='at-rule' and r.content is not None and r.lower_at_keyword in('media','supports'):
            scan(tinycss2.parse_rule_list(r.content,skip_comments=True,skip_whitespace=True),True); continue
        if r.type!='qualified-rule': continue
        sel=tinycss2.serialize(r.prelude).strip()
        for s in sel.split(','):
            s=s.strip(); state=bool(re.search(r'\.(open|on|scrolled|lite|hot|in|show|active)\b|html\.|::?(before|after|hover|focus)',s))
            if not(in_media or state): continue
            base=re.sub(r'::?[a-z-]+(\([^)]*\))?','',s); base=re.sub(r'\.(open|on|scrolled|hot|in|show|active|lite)\b','',base)
            try: xp=GenericTranslator().css_to_xpath(base)
            except Exception: continue
            for e in html.xpath(xp):
                bad.setdefault(e.get('data-eid'),set()).update(props(r.content))
for f in glob.glob('../../../web/*.css'):
    scan(tinycss2.parse_stylesheet(open(f).read(),skip_comments=True,skip_whitespace=True),False)
# per class: union of bad props over its elements
cls_bad={}
for eid,c in plan['elements'].items(): cls_bad.setdefault(c,set()).update(bad.get(eid,set()))
newc={}
for c,ctx in plan['classes'].items():
    nb=cls_bad.get(c,set())|{p for k,v in ctx.items() if k not in('main','hover:main') for p in v}
    m={k:v for k,v in ctx.get('main',{}).items() if k not in nb and k!='font'}
    h={k:v for k,v in ctx.get('hover:main',{}).items() if k not in nb}
    newc[c]={'main':m, **({'hover:main':h} if h else {})}
    print(c,'kept',len(m),'dropped',sorted(set(ctx.get('main',{}))-set(m)))
plan['classes']=newc
json.dump(plan,open('navfoot/plan_filtered.json','w'))
