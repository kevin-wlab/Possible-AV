import json,sys,re
k,page,foot=sys.argv[1],sys.argv[2],sys.argv[3]; idx=[int(x) for x in sys.argv[4].split(',')]
F=json.load(open('port/%s.frags.json'%k)); ids=[]
def clean(h):
    for m in re.findall(r'<img[^>]*src="https://cdn\.prod\.website-files\.com/[^/]+/([0-9a-f]{24})_',h): ids.append(m)
    h=re.sub(r'\s(src|onerror)="[^"]*"(?=[^<]*?>)','',h) if False else re.sub(r'(<img[^>]*?)\s+src="[^"]*"',r'\1',h)
    return re.sub(r'\s+onerror="[^"]*"','',h)
A=[{'build_label':'f%d'%i,'parent_element_id':{'component':page,'element':foot},'creation_position':'before','html':clean(F[i]['html']),'css':F[i]['css']} for i in idx]
print(json.dumps(A,ensure_ascii=False)); print('IMGS',ids)
