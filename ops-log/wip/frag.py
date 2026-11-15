# splits port/<page>.body.html into top-level elements and pairs each with neutral single-class rules (keeps class names on import)
import re, sys, json
from html.parser import HTMLParser
VOID={'img','br','hr','input','meta','link','source','wbr','path','circle','rect','line','polyline','polygon','ellipse'}
def tops(h):
    out=[]; depth=0; start=None
    for m in re.finditer(r'<(/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(/?)>',h):
        close,tag,self_=m.group(1),m.group(2).lower(),m.group(4)
        if close: depth-=1
        elif tag in VOID or self_: 
            if depth==0: out.append(h[m.start():m.end()])
            continue
        else:
            if depth==0: start=m.start()
            depth+=1
        if close and depth==0: out.append(h[start:m.end()])
    return out
def css_for(f): 
    cl=sorted({c for m in re.findall(r'class="([^"]*)"',f) for c in m.split()})
    return ' '.join('.%s{box-sizing:border-box}'%c for c in cl)
k=sys.argv[1]; h=open('/home/claude/pav-hero/port/%s.body.html'%k).read()
fr=[{'html':re.sub(r'\n\s*','\n',t).strip(),'css':css_for(t)} for t in tops(h)]
json.dump(fr,open('/home/claude/pav-hero/port/%s.frags.json'%k,'w'))
for i,f in enumerate(fr): print(i,len(f['html']),f['html'][:70].replace('\n',' '))
