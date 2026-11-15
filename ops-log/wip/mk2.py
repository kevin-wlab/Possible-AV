# Builds services.html (plain tabbed page) and audio.html (scroll film) next to index.html.
#   python3 mk2.py            -> release files here (CDN three.js)
#   python3 mk2.py --test DIR -> local-three copies of all pages in DIR
import re, sys
R='/home/claude/pav-hero/'
test=sys.argv[sys.argv.index('--test')+1] if '--test' in sys.argv else None
h=open(R+'index.html').read()
css=h[:h.index('</style>')]+open(R+'src/svc2.css').read()+open(R+'src/film/film.css').read()+'</style>\n</head>\n'
low=open(R+'src/lower.html').read()
def sec(i0): a=re.search(r'<section class="next[^"]*" id="%s">'%i0,low).start(); b=low.index('</section>',a)+len('</section>'); return low[a:b]
foot=low[low.index('<footer'):]
def header(cur): return '''<header class="nav">
  <a class="logo" href="index.html"><span class="dot"></span>Possible AV</a>
  <nav class="links" id="menu"><a href="index.html">Home</a><a class="cur" href="services.html">Services</a><a href="index.html#solutions">Solutions</a><a href="index.html#industries">Industries</a><span class="soon">Work</span><span class="soon">About</span></nav>
  <a class="btn" href="#quote">Get a quote</a>
  <button class="menu" id="menuBtn" type="button" aria-expanded="false" aria-controls="menu"><i></i><i></i><span>Menu</span></button>
</header>
<script>(function(){var n=document.querySelector('.nav'),b=document.getElementById('menuBtn');function set(o){n.classList.toggle('open',o);b.setAttribute('aria-expanded',o);}b.addEventListener('click',function(e){e.stopPropagation();set(!n.classList.contains('open'));});document.addEventListener('click',function(e){if(!n.contains(e.target)||e.target.closest('.links a'))set(false);});})();</script>
'''
F=R+'src/film/'
import os, json
# every service that has a page: its scene (pages/<key>.js), its markup (pages/<key>.body.html) and the model files it needs
SVC=[
 ('displays','Displays','Displays','Rent · Buy · Install','OLED TVs, touchscreens with Android or Windows built in, transparent displays and multi-screen playback stations.',None,[
  ('OLED TV rental','OLED TVs on floor stands or mounts, delivered and set up for booths, lounges and stages.',None),
  ('Touch screen rental','Touch displays with Android or Windows built in, on a stand or as a kiosk, running your app or one we build.',None),
  ('Transparent displays','See-through screens that put motion graphics in front of a real product.',None),
  ('Playback stations','Screens on truss or stands with players and a control position, looping content for the whole run.',None),
  ('LED walls','LED video walls go up with the same crew. Sizes, specs and pricing are on our LED site.',('ledwall.nyc','https://ledwall.nyc'))]),
 ('projection','Projection','Projection','Rent · Buy · Install','Projectors for events, trade shows and immersive spaces, mapping on any surface, and home theater.',None,[
  ('Projector rental','Projectors, lenses and screens for events, trade shows and immersive spaces, hung and aligned by us.',None),
  ('Projection mapping','Content fitted to walls, objects, sets and architecture, including irregular and sculptural surfaces.',None),
  ('Home theater','A projector, screen and sound at home: rented for a night or installed for good.',None)]),
 ('audio','Audio','Audio','Rent · Buy · Install','Sound systems, wireless microphones, directional speakers, spatial audio and haptic seating.','audio.html',[
  ('Sound system rental','Line arrays, subs and fills sized to the venue, with an engineer at the console.',None),
  ('Wireless microphones','Handheld, lavalier and headset wireless for panels, presenters and performers.',None),
  ('Directional speakers','Sound that stays in one spot: the person underneath hears it, the person beside them does not. To rent or to buy.',None),
  ('Spatial audio & haptic seating','Sound placed around the audience, and seating that moves with the low end.',None),
  ('Mixing & engineers','Consoles and the audio engineers who run them, with our system or yours.',None)]),
 ('lighting','Lighting & staging','Lighting & staging','Rent · Install','Aputure lighting, stage decks, truss and rigging, and the stage work around them.',None,[
  ('Event lighting','Aputure fixtures for stages, venues and camera, placed, focused and run by us.',None),
  ('Stage decks','Modular stage decks in the size and height the venue needs, built and levelled.',None),
  ('Truss & rigging','Ground-supported and flown truss for lights, screens, speakers and projectors.',None),
  ('Lighting control','A lighting desk and an operator for the show.',None)]),
 ('live-video','Live video & visuals','Live video','Rent · Install','Live streaming, switchers and production kits, and VJ and Resolume visuals.',None,[
  ('Live streaming','Cameras, encoding and a crew to put the event online.',None),
  ('Switchers & production kits','Video switchers and portable production kits, rented with or without an operator.',None),
  ('VJ & live visuals','Live and audio-reactive visuals, playback and show control. If Resolume does it, we do it.',None),
  ('Hybrid events','Remote speakers and remote audiences in the same show as the audience on site.',None)]),
 ('networks','Networks & computers','Networks','Rent · Buy · Install','UniFi networks for events and for buildings, and computers and workstations to rent or own.',None,[
  ('Event Wi-Fi','A UniFi network brought in for the event: access points, switching and someone watching it.',None),
  ('Permanent network installs','UniFi networks designed, installed and handed over in your space.',None),
  ('Computer & workstation rental','Workstations and show computers for the run of the event.',None),
  ('Custom PCs & workstations','Workstations built to order, to buy.',None)]),
 ('interactive','Interactive & tracking','Interactive','Rent · Install','TouchDesigner, sensors, RFID, motion tracking and the 3D content that reacts to them.',None,[
  ('Interactive installations','Floors, walls and whole spaces that respond to people, built in TouchDesigner.',None),
  ('Sensors & body tracking','Cameras and sensors that follow people without anything worn.',None),
  ('Motion tracking systems','Tracking systems rented, installed and run for events and installs.',None),
  ('RFID & NFC triggers','Tap an object or a badge and the space responds.',None),
  ('3D & real-time content','3D modeling and real-time content that follows the performer or the visitor.',None)]),
 ('fabrication','Fabrication','Fabrication','Design · Build · Install','Custom builds, branded pieces and pop-up shops, designed, 3D-printed and assembled in house, with the screens, light and sound already built in.',None,[
  ('Custom fabrication','One-off pieces made for the job: housings, plinths, props and mounts.',None),
  ('Pop-up shops & retail units','A branded unit that arrives finished, with display, light and sound inside it.',None),
  ('Large-format 3D printing','Pieces printed at furniture scale, and small-batch runs on the print farm.',('ctrlp.studio','https://ctrlp.studio'))]),
 ('logistics','Logistics & touring','Logistics','Deliver · Tour','We case it, truck it and load it in ourselves. For work outside New York, the same crew travels with the gear.',None,[
  ('Delivery, load-in & strike','Our truck and our crew, from the dock to the venue and back.',None),
  ('Touring & multi-city','The same system and the same people in every city on the run.',None)]),
]
e=lambda s:s.replace('&','&amp;')
# a service has a page when src/film/pages/<key>.js and <key>.body.html exist. It always gets its own models file; a first-line comment "// @models: audio,displays" pulls in others
FILM={}
for _k,_n,*_ in SVC:
    pj=F+'pages/%s.js'%_k
    if os.path.exists(pj) and os.path.exists(F+'pages/%s.body.html'%_k) and os.path.exists(F+'models/%s.js'%_k):
        mm=re.search(r'@models:\s*([\w\-, ]+)',open(pj).read()[:400]); extra=[x.strip() for x in mm.group(1).split(',')] if mm else []
        FILM[_k]=(_n,[x for x in dict.fromkeys(extra+[_k]) if os.path.exists(F+'models/%s.js'%x)])
# release builds only publish pages that have been reviewed: python3 mk2.py --live audio,displays   (test builds take whatever exists)
_live=sys.argv[sys.argv.index('--live')+1].split(',') if '--live' in sys.argv else (None if '--test' in sys.argv else ['audio'])
if _live is not None: FILM={k:v for k,v in FILM.items() if k in _live}
ICON={
 'displays':'<rect x="6" y="9" width="36" height="22" rx="2.5"/><path d="M24 31v7M15 39h18"/>',
 'projection':'<rect x="4" y="20" width="22" height="13" rx="2.5"/><circle cx="13" cy="26.5" r="3.6"/><path d="M26 23.5l16-8M26 29.5l16 8M43 12v29M8 33v3M22 33v3"/>',
 'audio':'<rect x="13" y="5" width="22" height="38" rx="3"/><circle cx="24" cy="29.5" r="7"/><circle cx="24" cy="13.5" r="3"/>',
 'lighting':'<path d="M17 8h14l3 11H14zM24 4v4M16 25l-4 12M24 26v12M32 25l4 12M7 42h34"/>',
 'live-video':'<rect x="5" y="14" width="26" height="20" rx="3"/><path d="M31 21l12-6v18l-12-6"/><circle cx="12" cy="21" r="1.7" fill="currentColor" stroke="none"/>',
 'networks':'<path d="M7 19a24 24 0 0 1 34 0M13.5 25.5a15 15 0 0 1 21 0"/><circle cx="24" cy="32" r="3.2"/><path d="M24 35.2V42M14 42h20"/>',
 'interactive':'<circle cx="24" cy="24" r="3.2"/><circle cx="24" cy="24" r="10"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6"/>',
 'fabrication':'<path d="M24 5l16 9v19l-16 9-16-9V14z"/><path d="M8 14l16 9 16-9M24 23v19"/><path d="M8 24l16 9M8 29l16 9" opacity=".5"/>',
 'logistics':'<path d="M4 12h24v21H4zM28 19h9l7 8v6H28"/><circle cx="12" cy="35" r="4.2" fill="var(--tile)"/><circle cx="35" cy="35" r="4.2" fill="var(--tile)"/>',
}
tabs=''; panels=''
for i,(k,n,short,tags,d,page,items) in enumerate(SVC):
    cta=('<a class="btn" href="%s.html">Open the %s page →</a>'%(k,e(n))) if k in FILM else '<span class="btn off">%s page in progress</span>'%e(n)
    li=''.join('<li><b>%02d</b><h3>%s</h3>%s<p>%s</p></li>'%(j+1,e(t),('<a class="ext" href="%s">%s ↗</a>'%(x[1],x[0])) if x else '',e(dd)) for j,(t,dd,x) in enumerate(items))
    tabs+='<button type="button" class="tile" role="tab" id="t-%s" data-k="%s" aria-controls="p-%s" aria-selected="false"><b>%02d</b><svg viewBox="0 0 48 48" aria-hidden="true">%s</svg><span class="full">%s</span><span class="shrt">%s</span></button>'%(k,k,k,i+1,ICON[k],e(n),e(short))
    panels+='''<section class="tpanel" id="p-%s" role="tabpanel" aria-labelledby="t-%s">
  <div class="pl"><p class="mono">%02d / 09</p><h2>%s</h2><p class="lede">%s</p><div class="tags">%s</div><div class="ctas">%s<a class="ghost" href="#quote">Get a quote</a></div></div>
  <ul class="plist">%s</ul>
</section>
'''%(k,k,i+1,e(n),e(d),''.join('<span class="tag">%s</span>'%t for t in tags.split(' · ')),cta,li)
script='''<script>(function(){var bs=[].slice.call(document.querySelectorAll('.tile')),ps=[].slice.call(document.querySelectorAll('.tpanel'));
function show(k,user){var i=bs.findIndex(function(b){return b.dataset.k===k});if(i<0)i=0;bs.forEach(function(b,j){b.setAttribute('aria-selected',j===i);b.tabIndex=j===i?0:-1;});ps.forEach(function(p,j){p.classList.toggle('on',j===i);});
if(user){try{history.replaceState(null,'','#'+bs[i].dataset.k);}catch(e){}}}
bs.forEach(function(b,j){b.addEventListener('click',function(){show(b.dataset.k,true);});b.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){var n=bs[(j+d+bs.length)%%bs.length];n.focus();show(n.dataset.k,true);}});});
addEventListener('hashchange',function(){show(location.hash.slice(1));});show(location.hash.slice(1));})();</script>'''.replace('%%','%')
svc=css.replace('<title>Possible AV — homepage prototype: the studio</title>','<title>Services · Possible AV (prototype)</title>')+'<body data-page="services">\n'+header('services')+'''<main>
<section class="svh"><p class="mono">Services</p><h1>What does your event need?</h1><p class="sub">Nine services, one crew. Pick one to see what is in it.</p></section>
<div class="svw"><div class="tiles" role="tablist" aria-label="Services">'''+tabs+'</div>\n'+panels+'</div>\n</main>\n'+script+'\n'+'\n\n'.join([sec('ways'),sec('process'),sec('faq'),sec('quote')]).replace('href="services.html">Browse services','href="index.html">Back to the studio')+'\n\n'+foot+'\n</body>\n</html>\n'
def film(page,models): return open(F+'core.head.js').read()+'\n'+'\n'.join(open(F+'models/%s.js'%k).read() for k in models)+'\n'+open(F+'pages/%s.js'%page).read()+'\n'+open(F+'core.tail.js').read()
imp=h[h.index('<script type="importmap">'):h.index('<script type="module">')]
def filmpage(k): name,models=FILM[k]; return css.replace('<title>Possible AV — homepage prototype: the studio</title>','<title>%s · Possible AV (prototype)</title>'%name)+'<body data-page="film" data-key="%s">\n'%k+header('services')+'<a class="backb" href="services.html#%s">← Services</a>\n'%k+open(F+'pages/%s.body.html'%k).read().replace('<a class="backb" href="services.html#audio">← Services</a>\n','')+'\n'+sec('quote').replace('href="services.html">Browse services','href="services.html#%s">All services'%k)+'\n\n'+foot+'\n'+imp+'<script type="module">\n'+film(k,models)+'</script>\n</body>\n</html>\n'
only=sys.argv[sys.argv.index('--only')+1].split(',') if '--only' in sys.argv else None
def loc(x): return re.sub(r'<link href="https://fonts.googleapis.com[^>]*>','',x.replace('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js','./node_modules/three/build/three.module.js').replace('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/','./node_modules/three/examples/jsm/'))
pages={k:filmpage(k) for k in FILM if not only or k in only}
out=test or R
for k,v in pages.items(): open(out+'/%s.html'%k,'w').write(loc(v) if test else v)
if not only:
    open(out+'/services.html','w').write(loc(svc) if test else svc)
    if test: open(test+'/index.html','w').write(loc(h))
print('built','test' if test else 'release','pages:',','.join(pages),'| services' if not only else '')
