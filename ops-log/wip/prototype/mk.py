# Builds the two prototype pages from the shared scene module.
#   python3 mk.py                        -> index.html + services.html here (CDN three.js), all rooms
#   python3 mk.py --test DIR --only a,b  -> DIR/index.html + DIR/services.html with local three.js, only rooms a and b spliced in
import re, sys, glob, os
R='/home/claude/pav-hero/'
arg=lambda k: sys.argv[sys.argv.index(k)+1] if k in sys.argv else None
test, only = arg('--test'), arg('--only')
rooms=''
for f in sorted(glob.glob(R+'src/rooms/*.js')):
    k=os.path.basename(f)[:-3]
    if only and k not in only.split(','): continue
    rooms+='// ---- room: %s ----\n'%k+open(f).read().rstrip()+'\n'
s=open(R+'scene.js').read(); assert s.count('/*ROOMS*/')==1; s=s.replace('/*ROOMS*/',rooms)
h=open(R+'index.html').read()
i=h.index('<script type="module">\n')+len('<script type="module">\n'); j=h.rindex('</script>')
h=h[:i]+s+h[j:]
head=h[:h.index('</style>')]+open(R+'src/svc.css').read()+'</style>\n</head>\n'
head=head.replace('<title>Possible AV — homepage prototype: the studio</title>','<title>Possible AV — services prototype</title>')
low=open(R+'src/lower.html').read()
def sec(i0): a=re.search(r'<section class="next[^"]*" id="%s">'%i0,low).start(); b=low.index('</section>',a)+len('</section>'); return low[a:b]
foot=low[low.index('<footer'):]
lower='\n\n'.join([sec('ways'),sec('process'),sec('faq'),sec('quote')]).replace('<section class="next" id="ways">','<section class="next" id="ways" style="border-top:0">').replace('href="services.html">Browse services','href="index.html">Back to the studio')
tail=h[h.index('<script type="importmap">'):]
svc=head+open(R+'src/svc.body.html').read()+'\n'+lower+'\n\n'+foot+'\n'+tail
if test:
    def loc(x): return re.sub(r'<link href="https://fonts.googleapis.com[^>]*>','',x.replace('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js','./node_modules/three/build/three.module.js').replace('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/','./node_modules/three/examples/jsm/'))
    open(test+'/index.html','w').write(loc(h)); open(test+'/services.html','w').write(loc(svc))
else:
    open(R+'index.html','w').write(h)   # services.html is now the plain tabbed page built by mk2.py
print('built', 'test' if test else 'release', 'rooms:', only or 'all', len(h), len(svc))
