import json,os,sys
k,sha=sys.argv[1],sys.argv[2]; W='/home/claude/possible-av/web/'; C='https://cdn.jsdelivr.net/gh/kevin-wlab/possible-av@%s/web/'%sha
g=open('port/guard.html').read().strip()
head=g+'\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="%s%s.css">'%(C,k)
if os.path.exists(W+k+'.importmap.json'): head+='\n<script type="importmap">%s</script>'%open(W+k+'.importmap.json').read().strip()
foot='<script src="%s%s.ui.js"></script>'%(C,k)
if os.path.exists(W+k+'.js'): foot+='\n<script type="module" src="%s%s.js"></script>'%(C,k)
print(json.dumps({'head':head,'foot':foot}))
