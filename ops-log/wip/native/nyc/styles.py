import json
INK='#1a1a18';INK2='#55524c';INK3='#8a867e';LINE='rgba(26,26,24,.14)';BG='#ece9e3';BG2='#e3dfd7';A='#e8892d'
MONO=[('font-family','"Geist Mono", ui-monospace, monospace'),('font-size','12px'),('letter-spacing','.04em'),('text-transform','uppercase'),('color',INK2)]
def b(w,s,c): return [(f'border-{x}-width',w) for x in('top','right','bottom','left')]+[(f'border-{x}-style',s) for x in('top','right','bottom','left')]+[(f'border-{x}-color',c) for x in('top','right','bottom','left')]
def r(v): return [(f'border-{x}-radius',v) for x in('top-left','top-right','bottom-left','bottom-right')]
def p(t,ri,bo,l): return [('padding-top',t),('padding-right',ri),('padding-bottom',bo),('padding-left',l)]
def gap(v): return [('grid-row-gap',v),('grid-column-gap',v)]
S=[]  # (name, parents, props, bp, pseudo)
def add(n,props,parents=None,bp=None,pseudo=None): S.append(dict(name=n,parents=parents or [],props=props,bp=bp,pseudo=pseudo))
add('nx-hero',p('128px','28px','34px','28px'))
add('nx-hero',p('96px','20px','22px','20px'),bp='medium')
add('nx-mono',MONO)
add('nx-h1',[('margin-top','14px'),('font-size','clamp(40px, 5vw, 76px)'),('line-height','.95'),('letter-spacing','-.045em'),('font-weight','600')])
add('nx-sub',[('margin-top','14px'),('font-size','17px'),('line-height','1.5'),('color',INK2),('max-width','640px')])
add('nx-ctas',[('display','flex'),('flex-wrap','wrap'),('align-items','center'),('margin-top','24px')]+gap('10px'))
add('is-hero',[('margin-top','26px')],parents=['nx-ctas'])
add('nx-btn',[('display','inline-flex'),('align-items','center'),('background-color',INK),('color',BG),('font-size','14px'),('font-weight','500'),('white-space','nowrap'),('text-decoration','none'),('transition','transform .2s')]+gap('8px')+p('11px','18px','11px','18px')+r('999px'))
add('nx-btn',[('transform','translateY(-1px)')],pseudo='hover')
add('nx-ghost',[('display','inline-flex'),('align-items','center'),('background-color','rgba(236,233,227,.6)'),('backdrop-filter','blur(6px)'),('color','inherit'),('font-size','14px'),('font-weight','500'),('white-space','nowrap'),('text-decoration','none')]+gap('8px')+p('11px','18px','11px','18px')+r('999px')+b('1px','solid',LINE))
add('nx-strip',[('display','grid'),('grid-template-columns','1.4fr 1fr 1fr')]+gap('10px')+p('10px','28px','0px','28px'))
add('nx-strip',[('grid-template-columns','1fr 1fr')]+gap('6px')+p('6px','14px','0px','14px'),bp='medium')
add('nx-strip-img',[('display','block'),('width','100%'),('max-width','none'),('aspect-ratio','4 / 3'),('object-fit','cover'),('background-color',BG2),('vertical-align','baseline')]+r('18px'))
add('is-first',[('aspect-ratio','auto'),('height','100%')],parents=['nx-strip-img'])
add('is-first',[('aspect-ratio','4 / 3'),('height','auto'),('grid-column-start','1'),('grid-column-end','-1')],parents=['nx-strip-img'],bp='medium')
add('nx-sec',[('position','relative'),('z-index','6'),('background-color',BG),('border-top-width','1px'),('border-top-style','solid'),('border-top-color',LINE)]+p('88px','28px','110px','28px'))
add('nx-sec',p('56px','20px','72px','20px'),bp='medium')
add('is-first',[('padding-top','96px')],parents=['nx-sec'])
add('is-first',[('padding-top','64px')],parents=['nx-sec'],bp='medium')
add('is-end',[('padding-bottom','120px')],parents=['nx-sec'])
add('is-end',[('padding-bottom','72px')],parents=['nx-sec'],bp='medium')
add('nx-eb',MONO+[('margin-bottom','18px')])
add('nx-h2',[('font-size','clamp(32px, 4vw, 56px)'),('letter-spacing','-.035em'),('line-height','1'),('font-weight','600'),('max-width','820px'),('margin-top','0px'),('margin-bottom','0px')])
add('is-end',[('font-size','clamp(40px, 6vw, 92px)')],parents=['nx-h2'])
add('nx-h2-muted',[('color',INK3)])
add('nx-lead',[('margin-top','18px'),('font-size','18px'),('line-height','1.5'),('color',INK2),('max-width','560px')])
add('nx-incl',[('display','grid'),('grid-template-columns','repeat(4, 1fr)'),('margin-top','14px'),('background-color',BG2)]+gap('0px')+b('1px','solid',LINE)+r('20px'))
add('nx-incl',[('grid-template-columns','1fr 1fr')],bp='medium')
add('nx-incl-li',[('font-size','14.5px'),('line-height','1.45'),('color',INK2),('border-left-width','1px'),('border-left-style','solid'),('border-left-color',LINE)]+p('20px','22px','20px','22px'))
add('nx-incl-li',[('border-left-width','0px')],pseudo='first-child')
add('nx-incl-li',[('font-size','13px'),('border-top-width','1px'),('border-top-style','solid'),('border-top-color',LINE)]+p('14px','14px','14px','14px'),bp='medium')
add('nx-incl-li',[('border-left-width','0px')],bp='medium',pseudo='nth-child(odd)')
add('nx-incl-b',[('display','block'),('color',INK),('font-size','16px'),('font-weight','600'),('letter-spacing','-.01em'),('margin-bottom','6px')])
add('nx-ways',[('display','grid'),('grid-template-columns','1fr 1fr'),('margin-top','44px')]+gap('14px'))
add('nx-ways',[('grid-template-columns','1fr')],bp='medium')
add('is-three',[('grid-template-columns','repeat(3, 1fr)')],parents=['nx-ways'])
add('is-three',[('grid-template-columns','1fr')],parents=['nx-ways'],bp='medium')
add('nx-way',[('display','flex'),('flex-direction','column'),('background-color','rgba(255,255,255,.28)')]+gap('10px')+b('1px','solid',LINE)+r('14px')+p('22px','22px','26px','22px'))
add('nx-way-tag',MONO+[('color',A),('font-weight','700')])
add('nx-way-h3',[('font-size','21px'),('letter-spacing','-.02em'),('font-weight','600'),('line-height','normal'),('margin-top','0px'),('margin-bottom','0px')])
add('nx-way-p',[('font-size','14.5px'),('line-height','1.55'),('color',INK2)])
add('nx-chips',[('display','flex'),('flex-wrap','wrap'),('margin-top','28px')]+gap('8px'))
add('nx-chip',[('display','block'),('color','inherit'),('text-decoration','none'),('font-size','15px'),('transition','background-color .2s, color .2s')]+b('1px','solid',LINE)+r('999px')+p('10px','16px','10px','16px'))
add('nx-chip',[('background-color',INK),('color',BG)],pseudo='hover')
add('nx-faq',[('margin-top','40px'),('border-top-width','1px'),('border-top-style','solid'),('border-top-color',LINE),('max-width','900px')])
add('nx-faq-d',[('border-bottom-width','1px'),('border-bottom-style','solid'),('border-bottom-color',LINE)])
add('nx-faq-q',[('display','flex'),('justify-content','space-between'),('cursor','pointer'),('font-size','19px'),('font-weight','500'),('letter-spacing','-.01em'),('list-style-type','none')]+gap('16px')+p('18px','4px','18px','4px'))
add('nx-faq-q',[('font-size','17px')],bp='tiny')
add('nx-faq-a',[('font-size','14.5px'),('line-height','1.55'),('color',INK2),('max-width','720px')]+p('0px','4px','20px','4px'))
json.dump(S,open('styles.json','w'),indent=0)
# build tool actions: create (base) then updates
seen=set();acts=[]
for i,s in enumerate(S):
    key=(s['name'],tuple(s['parents']))
    props=[{'property_name':k,'property_value':v} for k,v in s['props']]
    if key not in seen and not s['bp'] and not s['pseudo']:
        seen.add(key); a={'create_style':{'name':s['name'],'properties':props}}
        if s['parents']: a['create_style']['parent_style_names']=s['parents']
    else:
        u={'style_name':s['name'],'properties':props}
        if s['parents']: u['parent_style_names']=s['parents']
        if s['bp']: u['breakpoint_id']=s['bp']
        if s['pseudo']: u['pseudo']=s['pseudo']
        a={'update_style':u}
    a['label']=f"{i}-{s['name']}"; acts.append(a)
json.dump(acts,open('style_actions.json','w'))
print(len(acts))
