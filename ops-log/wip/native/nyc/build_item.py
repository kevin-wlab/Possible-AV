"""Turn pages/<old-slug>.json (+ ld/<old-slug>.json) into CMS payloads for NYC Pages / NYC Blocks."""
import json,sys,re
OLD=['sound-system-rental-nyc','speaker-rental-nyc','uplighting-rental-nyc','outdoor-movie-rental-nyc','rental-packages-nyc','projector-rental-nyc','tv-rental-nyc','microphone-rental-nyc','event-lighting-rental-nyc','event-wifi-rental-nyc','computer-rental-nyc','stage-rental-nyc','experiential-production-nyc','event-production-company-nyc','av-rental-nyc']
def new_slug(o): return o[:-4]
def fix_url(u):
    for o in OLD:
        u=re.sub(r'(https://possibleav\.com)?/'+o+r'(?![\w-])', lambda m:(m.group(1) or '')+'/nyc/'+new_slug(o), u)
    return u
SEC={'a':'ffff5048190cc2682febeb0b45ecb98b','b':'f74f883c5f3e4245d1f1fd6fa8975f3b','b2':'46f95ceb101ba91d867cd3607ddd6667','b3':'544c6560c82457bc54a74f32ec1f4cb5','c':'a99fc6a3a03bc065bf3790e66002c3f7','related':'9f1cd4206f745bfcb6f37fa112402921','also':'a70a7ad1fb2a1224ba44b7037d84abe1','svc':'b26b7b41b8b1b4f0af5e4735e7ed93d0','faq':'b2f0654e81e04569b51886e7fe2d147b'}
MR={'a':'blocks','b':'b-items','b2':'b2-items','b3':'b3-items','c':'c-items','related':'related-items','also':'also-items','svc':'svc-items','faq':'faq-items'}
def page_fields(d,ld):
    s=new_slug(d['old_slug'])
    f={'name':d['name'],'slug':s,'seo-title':d['seo_title'],'meta-description':d['meta'],'eyebrow':d['eyebrow'],'h1':d['h1'],'sub':d['sub'],
       'cta2-text':d['cta2'][0],'cta2-link':fix_url(d['cta2'][1]),'has-images':True,
       'schema-json':fix_url(json.dumps(ld,ensure_ascii=False,separators=(',',':')))}
    for i,(aid,url,alt) in enumerate(d['images'],1): f[f'image-{i}']={'fileId':aid,'url':url,'alt':alt}
    for k,pre in [('a','a'),('b','b'),('b2','b2'),('b3','b3'),('c','c'),('related','related'),('also','also'),('svc','svc')]:
        if k in d:
            f[pre+'-eyebrow']=d[k]['eb']; f[pre+'-heading']=d[k]['h']; f[pre+'-heading-muted']=d[k].get('hm','')
            if pre in('a','b','b2') : f[pre+'-lead']=d[k].get('lead','')
    f['faq-eyebrow']=d['faq']['eb']; f['faq-heading']=d['faq']['h']
    f['quote-eyebrow']=d['quote']['eb']; f['quote-heading']=d['quote']['h']; f['quote-lead']=d['quote']['lead']
    f['has-b2']='b2' in d; f['has-b3']='b3' in d; f['has-related']='related' in d; f['has-svc']='svc' in d
    return f
def blocks(d,page_id):
    s=new_slug(d['old_slug']); out=[]
    for k in SEC:
        if k not in d: continue
        for i,it in enumerate(d[k]['items'],1):
            f={'name':f'{s} · {k} · {i}','slug':f'{s}-{k}-{i}','page':page_id,'section':SEC[k],'order':i,'label':it[0]}
            if k=='a': f['text']=it[1]
            elif k in('b','b2','b3','c'): f['title']=it[1]; f['text']=it[2]
            elif k in('related','also','svc'): f['link']=fix_url(it[1])
            elif k=='faq': f['text']=it[1]
            out.append((k,f))
    return out
if __name__=='__main__':
    old=sys.argv[1]; step=sys.argv[2]
    d=json.load(open(f'pages/{old}.json')); ld=json.load(open(f'ld/{old}.json'))
    if step=='page': print(json.dumps({"items":[{"isDraft":False,"fieldData":page_fields(d,ld)}]},ensure_ascii=False))
    elif step=='blocks': print(json.dumps({"items":[{"isDraft":False,"fieldData":f} for k,f in blocks(d,sys.argv[3])]},ensure_ascii=False))
    elif step=='refs':
        ids=json.load(open(sys.argv[3]))  # list of created block ids in same order as blocks()
        bl=blocks(d,'x'); refs={}
        for (k,f),i in zip(bl,ids): refs.setdefault(MR[k],[]).append(i)
        print(json.dumps(refs))
