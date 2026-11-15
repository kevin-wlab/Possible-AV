# Splits each built prototype page into what Webflow needs:
#   web/<page>.css   every <style> block of the page, verbatim (the page looks exactly like the prototype)
#   web/<page>.js    the 3D module (film/studio), importmap kept separately in web/<page>.importmap.json
#   web/<page>.ui.js the small classic scripts (menu toggle, services tabs)
#   port/<page>.body.html  the body markup with scripts removed and links rewritten to live URLs (fed to Webflow as native elements)
import re, json, os, sys
R='/home/claude/pav-hero/'; W='/home/claude/possible-av/web/'; P=R+'port/'; os.makedirs(P,exist_ok=True)
LIVE=['audio','displays','projection','lighting','fabrication','networks','live-video','interactive','logistics']
HOMEIMG={'audio':'audio-systems','displays':'displays-transparent','projection':'projection-mapping','lighting':'lighting-package','fabrication':'fabrication-popup','networks':'networks-wifi','live-video':'live-video-stream','interactive':'interactive-floor','logistics':'logistics-dock'}  # homepage card picture per service  # service pages that are finished and go on Webflow
PAGES=dict([('home','home.html'),('studio','index.html'),('services','services.html')]+[(k,k+'.html') for k in LIVE])
LINK=[(r'https://www\.possibleav\.com/get-a-quote','/get-a-quote'),(r'index\.html#','/#'),(r'index\.html','/'),(r'services\.html#','/services#'),(r'services\.html','/services'),
      (r'('+'|'.join(LIVE)+r')\.html','/\\1')]
def links(h):
    def fix(m):
        v=m.group(2)
        for a,b in LINK:
            if re.fullmatch(a+r'.*',v): v=re.sub('^'+a,b,v); break
        return m.group(1)+v+'"'
    h=re.sub(r'(href=")([^"]*)"',fix,h)
    h=h.replace(' target="_top"','')
    h=h.replace('<span class="soon">Work</span>','<a href="/work">Work</a>').replace('<span class="soon">About</span>','<a href="/about">About</a>')
    h=h.replace('<a href="/#quote">Contact</a>','<a href="/get-a-quote">Contact</a>')
    return h
for k,f in PAGES.items():
    s=open(R+f).read()
    css='\n'.join(re.findall(r'<style>(.*?)</style>',s,re.S))
    css=css.replace('body[data-key=%s]'%k,'body')
    RESET="/* Webflow base styles reset to the browser defaults the prototype was built on */\nhtml{height:auto}body{font-size:16px;line-height:normal;min-height:0;margin:0}h1,h2,h3,h4,h5,h6,p,ul,ol,figure,blockquote,label,figcaption{margin:0;padding:0}h1,h2,h3,h4,h5,h6{font-weight:bold;line-height:normal}h1{font-size:2em}h2{font-size:1.5em}h3{font-size:1.17em}h4{font-size:1em}h5{font-size:.83em}h6{font-size:.67em}blockquote{border:0;font-size:inherit;line-height:inherit}label{font-weight:inherit;display:inline}figcaption{text-align:inherit}img{vertical-align:baseline;max-width:none;display:inline}canvas{vertical-align:baseline;display:inline}\n"
    open(W+k+'.css','w').write(RESET+css)
    im=re.search(r'<script type="importmap">(.*?)</script>',s,re.S)
    if im: open(W+k+'.importmap.json','w').write(im.group(1).strip())
    mod=re.search(r'<script type="module">(.*?)</script>',s,re.S)
    if mod: open(W+k+'.js','w').write(mod.group(1))
    ui=re.findall(r'<script>(.*?)</script>',s,re.S)
    NAV="(function(){var p=location.pathname.replace(/\\/$/,'')||'/',m={'/':'/','/services':'/services',"+''.join("'/%s':'/services',"%k for k in LIVE)+"'/work':'/work','/about':'/about'},t=m[p];document.querySelectorAll('.nav .links a').forEach(function(a){a.classList.toggle('cur',a.getAttribute('href')===t);});})();"
    open(W+k+'.ui.js','w').write((NAV+'\n'+'\n'.join(ui)).replace('function(e){e.stopPropagation();set(!n','function(e){e.preventDefault();e.stopPropagation();set(!n'))
    body=s[s.index('<body'):s.rindex('</body>')]
    battrs=re.match(r'<body([^>]*)>',body).group(1); body=body[body.index('>')+1:]
    body=re.sub(r'<script[^>]*>.*?</script>','',body,flags=re.S)
    extra=''
    for m in re.finditer(r'<([a-z]+)([^>]*?) id="([a-z0-9-]+)"([^>]*?) style="([^"]*)"',body): extra+='#%s{%s}\n'%(m.group(3),m.group(5))
    body=re.sub(r'(<[a-z]+[^>]*? id="[a-z0-9-]+"[^>]*?) style="[^"]*"',r'\1',body)
    body=body.replace(' style="text-decoration:underline;text-underline-offset:3px"',' class="ul"')
    # any other inline style becomes a small class (Webflow keeps classes, not style attributes)
    seen={}
    def _st(m):
        st=m.group(2)
        if st not in seen: seen[st]='ps%d'%(len(seen)+1)
        c=seen[st]; tag=m.group(1)
        if ' class="' in tag: return tag.replace(' class="',' class="%s '%c,1)
        return tag+' class="%s"'%c
    body=re.sub(r'(<[a-z]+[^>]*?) style="([^"]*)"',_st,body)
    for st,c in seen.items(): extra+='.%s{%s}\n'%(c,st)
    if 'class="ul"' in body: extra+='.ul{text-decoration:underline;text-underline-offset:3px}\n'
    if extra: open(W+k+'.css','a').write('\n/* inline styles moved out of the markup */\n'+extra)
    for hk,hv in HOMEIMG.items(): body=body.replace('img/home-%s.jpg'%hk,'img/%s.jpg'%hv)
    body=links(body)
    if k=='studio': body=body.replace('id="focus"','id="focusl"')
    if k=='studio': body=re.sub(r'href="/services#('+'|'.join(LIVE)+r')"',r'href="/\1"',body)
    A=dict(l.split() for l in open(P+'assets.txt') if l.strip())
    body=re.sub(r'src="img/([a-z0-9-]+\.jpg)"',lambda m:'src="https://cdn.prod.website-files.com/6a34a7893bca7b2b60e5eac7/%s_%s"'%(A[m.group(1)],m.group(1)) if m.group(1) in A else m.group(0),body)
    # Webflow turns <button> into a.w-button with href="#": make the service tiles real links to their deep-link hash instead
    def _tile(m):
        at=re.sub(r'\s*type="button"','',m.group(1)); kk=re.search(r'data-k="([^"]+)"',at).group(1)
        return '<a href="#%s"%s>'%(kk,at)
    if 'class="tiles"' in body:
        body=re.sub(r'<button((?:(?!>).)*class="tile"(?:(?!>).)*)>',_tile,body)
        i=body.index('class="tiles"'); j=body.index('</div>',i); body=body[:i]+body[i:j].replace('</button>','</a>')+body[j:]
    body=body.replace('href="#" data-','href="#floor" data-')
    open(P+k+'.body.html','w').write(body.strip())
    open(P+k+'.bodyattrs','w').write(battrs.strip())
    print(k,'css',len(css),'js',len(mod.group(1)) if mod else 0,'body',len(body),'attrs',battrs.strip()[:60])

# Webflow refuses the element id 'focus': the studio uses 'focusl' instead
W2=W+'studio.'
for ext in ['js','css']:
    t=open(W2+ext).read(); t=t.replace("getElementById('focus')","getElementById('focusl')").replace('#focus{','#focusl{').replace('#focus,','#focusl,').replace('#focus ','#focusl ')
    open(W2+ext,'w').write(t)
