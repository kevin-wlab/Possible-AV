# Builds the new homepage (a line-up film of one piece per service) as home.html, or into a test folder.
#   python3 mk_home.py [--test DIR]
import re, sys, os
R='/home/claude/pav-hero/'; F=R+'src/film/'
test=sys.argv[sys.argv.index('--test')+1] if '--test' in sys.argv else None
src=open(R+('src/studio.html' if os.path.exists(R+'src/studio.html') else 'index.html')).read()
css=src[:src.index('</style>')]+open(R+'src/svc2.css').read()+open(F+'film.css').read()+open(F+'home.css').read()+'</style>\n</head>\n'
low=open(R+'src/lower.html').read()
def sec(i0): a=re.search(r'<section class="next[^"]*" id="%s">'%i0,low).start(); b=low.index('</section>',a)+len('</section>'); return low[a:b]
foot=low[low.index('<footer'):]
HOME=[('displays','Displays','Screens for every space.','OLED TVs, touch screens, transparent displays and playback stations.','Rent · Buy · Install'),
 ('projection','Projection','Any surface, lit.','Projectors for events and immersive spaces, mapping on any surface, home theater.','Rent · Buy · Install'),
 ('audio','Audio','Sound, sized to the venue.','From two speakers and a microphone to a flown system for a full hall.','Rent · Buy · Install'),
 ('lighting','Lighting & staging','Light, stage and truss.','Aputure lighting, stage decks, truss and rigging.','Rent · Install'),
 ('live-video','Live video & visuals','Live, on every screen.','Live streaming, switchers and production kits, VJ and Resolume visuals.','Rent · Install'),
 ('networks','Networks & computers','The network underneath.','UniFi networks for events and buildings, workstations and custom PCs.','Rent · Buy · Install'),
 ('interactive','Interactive & tracking','Spaces that respond.','TouchDesigner, sensors, RFID, motion tracking and real-time 3D content.','Rent · Install'),
 ('fabrication','Fabrication','Built for the job.','Custom pieces, pop-up shops and large-format 3D printing.','Design · Build · Install'),
 ('logistics','Logistics & touring','We bring it.','Our truck, our cases, our crew. In New York and on the road.','Deliver · Tour')]
have=[h for h in HOME if os.path.exists(F+'models/%s.js'%h[0])]
page=lambda k: ('%s.html'%k) if os.path.exists(F+'pages/%s.js'%k) and os.path.exists(F+'pages/%s.body.html'%k) else 'services.html#%s'%k
e=lambda s:s.replace('&','&amp;')
caps='''  <div class="cap close hero on" data-s="0">
    <p class="mono">AV rental, installation and production · Brooklyn, New York</p>
    <h1>Everything your event needs. <em>One crew.</em></h1>
    <p class="sub">Screens, projection, sound, light, live video, networks, interactive, fabrication, and the truck that brings it. Rent it, buy it or have us install it.</p>
    <div class="ctas"><a class="btn" href="#quote">Get a quote →</a><a class="ghost" href="#" data-go="1">See the nine services ↓</a></div>
  </div>
'''
rail=''
for i,(k,n,hd,d,tags) in enumerate(have):
    caps+='  <div class="cap" data-s="%d" data-key="%s"><p class="mono">%02d · %s</p><h2>%s</h2><p>%s</p><div class="ctas"><a class="btn" href="%s">Explore %s →</a><span class="tags">%s</span></div></div>\n'%(i+1,k,i+1,e(n),hd,e(d),page(k),e(n.lower()),''.join('<span class="tag">%s</span>'%t for t in tags.split(' · ')))
    rail+='<a href="#" data-i="%d"><b>%02d</b><span class="nm">%s</span></a>'%(i+1,i+1,e(n.split(' &')[0]))
caps+='  <div class="cap close" data-s="%d"><p class="mono">Get a quote</p><h2>Tell us about your event.</h2><p>The date, the space and what has to happen in it. We come back with an itemized quote.</p><div class="ctas"><a class="btn" href="#quote">Get a quote →</a><a class="ghost" href="services.html">All services</a></div></div>\n'%(len(have)+1)
cards=''.join('<a class="gc w2" href="%s">%s<div class="gt"><h3>%s</h3><p>%s</p><span class="tags">%s</span></div></a>'%(page(k),('<img src="img/home-%s.jpg" alt="%s" loading="lazy">'%(k,e(n)+': '+e(d))) if os.path.exists(R+'img/home-%s.jpg'%k) else '<div class="noimg"></div>',e(n),e(d),''.join('<span class="tag">%s</span>'%t for t in tags.split(' · '))) for k,n,hd,d,tags in have)
header='''<header class="nav">
  <a class="logo" href="index.html"><span class="dot"></span>Possible AV</a>
  <nav class="links" id="menu"><a class="cur" href="index.html">Home</a><a href="services.html">Services</a><a href="#solutions">Solutions</a><a href="#industries">Industries</a><span class="soon">Work</span><span class="soon">About</span></nav>
  <a class="btn" href="#quote">Get a quote</a>
  <button class="menu" id="menuBtn" type="button" aria-expanded="false" aria-controls="menu"><i></i><i></i><span>Menu</span></button>
</header>
<script>(function(){var n=document.querySelector('.nav'),b=document.getElementById('menuBtn');function set(o){n.classList.toggle('open',o);b.setAttribute('aria-expanded',o);}b.addEventListener('click',function(e){e.stopPropagation();set(!n.classList.contains('open'));});document.addEventListener('click',function(e){if(!n.contains(e.target)||e.target.closest('.links a'))set(false);});})();</script>
'''
body='''<section class="floor film" id="floor" style="height:%dvh">
 <div class="pin">
  <canvas id="stage" aria-hidden="true"></canvas>
  <div class="fveil" aria-hidden="true"></div>
%s
  <div class="hud"><span class="mono idxl">Services</span><nav class="idx" id="rail" aria-label="Services">%s</nav></div>
 </div>
</section>

<section class="next glance" id="glance" style="border-top:0">
  <p class="mono eb">Services, at a glance</p>
  <h2>Everything we do. <span>On one screen.</span></h2>
  <div class="gl">%s</div>
  <ul class="incl"><li><b>Delivered and set up</b>by our own crew, in our own truck</li><li><b>Run on the day</b>by technicians who stay for the show</li><li><b>Struck and taken away</b>when it is over</li><li><b>Outside New York</b>the same crew travels with it</li></ul>
</section>
'''%((len(have)+2)*110,caps,rail,cards)
lower='\n\n'.join(sec(x) for x in ['industries','solutions','ways','process','also','faq','quote'])
models='\n'.join(open(F+'models/%s.js'%h[0]).read() for h in have)
module=open(F+'core.head.js').read()+'\n'+models+'\n'+open(F+'pages/home.js').read()+'\n'+open(F+'core.tail.js').read()
imp=src[src.index('<script type="importmap">'):src.index('<script type="module">')]
out=css.replace('<title>Possible AV — homepage prototype: the studio</title>','<title>Possible AV — AV rental, installation and production in Brooklyn, New York (prototype)</title>')+'<body data-page="film" data-key="home">\n'+header+body+'\n'+lower+'\n\n'+foot+'\n'+imp+'<script type="module">\n'+module+'</script>\n</body>\n</html>\n'
def loc(x): return re.sub(r'<link href="https://fonts.googleapis.com[^>]*>','',x.replace('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js','./node_modules/three/build/three.module.js').replace('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/','./node_modules/three/examples/jsm/'))
open((test or R)+'/home.html','w').write(loc(out) if test else out)
print('built home with',','.join(h[0] for h in have),len(out))
