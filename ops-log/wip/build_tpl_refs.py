# Reference pages for the two CMS templates (project, post), one item each, for chk('project/<slug>') / chk('post/<slug>')
import json
R='/home/claude/pav-hero/'; W='/home/claude/possible-av/web/'
exec(open(R+'pages/build_pages.py').read().split('P={}')[0])
def page(body,depth=2):
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="../page.css"></head><body>\n%s\n<script src="../page.ui.js"></script></body></html>'%body
D=json.load(open(R+'pages/tpl_items.json'))
for it in D['project']:
    m=('<main><section class="svh abh"><p class="mono">Work</p><h1>%(name)s</h1><p class="sub">%(summary)s</p></section>'
       '<div class="casecover"><img src="%(cover)s" alt="%(alt)s" class="cover"></div>'
       '<section class="next" id="background"><p class="mono eb">Background</p><div class="prose">%(background)s</div></section>'
       '<section class="next" id="work"><p class="mono eb">The work</p><div class="prose">%(did)s</div></section>'
       '<section class="next" id="glance"><p class="mono eb">At a glance</p><div class="prose facts">%(facts)s</div></section>'
       '<section class="next end" id="quote"><p class="mono eb">Get a quote</p><h2>Have a job like this?</h2><p class="lead">Tell us where, when, how many people and what has to happen. We reply with one quote for equipment, crew and delivery.</p><div class="ctas"><a class="btn" href="/get-a-quote">Get a quote →</a><a class="ghost" href="/work">More work</a></div></section></main>')%it
    open(W+'ref/project/%s.html'%it['slug'],'w').write(page(NAV+'\n'+m+'\n'+FOOT))
for it in D['post']:
    m=('<main><section class="svh abh"><div class="pmeta"><p class="mono">%(category)s</p><p class="mono">%(read)s</p></div><h1>%(name)s</h1><p class="sub">%(excerpt)s</p></section>'
       '<section class="next" id="article"><div class="prose">%(body)s</div></section>'
       '<section class="next end" id="quote"><p class="mono eb">Get a quote</p><h2>Planning something like this?</h2><p class="lead">Tell us where, when, how many people and what has to happen. We reply with one quote for equipment, crew and delivery.</p><div class="ctas"><a class="btn" href="/get-a-quote">Get a quote →</a><a class="ghost" href="/blog">More guides</a></div></section></main>')%it
    open(W+'ref/post/%s.html'%it['slug'],'w').write(page(NAV+'\n'+m+'\n'+FOOT))
Q2=lambda h2,g: '<section class="next end" id="quote"><p class="mono eb">Get a quote</p><h2>%s</h2><p class="lead">Tell us where, when, how many people and what has to happen. We reply with one quote for equipment, crew and delivery.</p><div class="ctas"><a class="btn" href="/get-a-quote">Get a quote →</a><a class="ghost" href="/services">All services</a></div></section>'%h2
CH='<div class="chips"><a href="/displays">Displays</a><a href="/projection">Projection</a><a href="/audio">Audio</a><a href="/lighting">Lighting &amp; staging</a><a href="/live-video">Live video &amp; visuals</a><a href="/networks">Networks &amp; computers</a><a href="/interactive">Interactive &amp; tracking</a><a href="/fabrication">Fabrication</a><a href="/logistics">Logistics &amp; touring</a></div>'
import os
for it in D.get('industry',[]):
    os.makedirs(W+'ref/industry',exist_ok=True)
    m=('<main><section class="svh abh"><p class="mono">Industries</p><h1>%(h1)s</h1><p class="sub">%(sub)s</p><div class="ctas"><a class="btn" href="/get-a-quote">Get a quote →</a><a class="ghost" href="/industries">All industries</a></div></section>'
       '<section class="next" id="challenge"><p class="mono eb">The challenge</p><h2>What makes this kind of job hard.</h2><div class="prose">%(challenge)s</div></section>'
       '<section class="next" id="offer"><p class="mono eb">What we bring</p><h2>Everything it needs, <span>from one crew.</span></h2><div class="prose">%(offer)s</div></section>'
       '<section class="next" id="why"><p class="mono eb">Why one crew</p><h2>One crew instead of three vendors.</h2><div class="ways three"><div class="way"><b class="mono">01</b><h3>We own the equipment</h3><p>The system leaves Brooklyn packed and tested. No chasing local rentals in a city we have never worked in.</p></div><div class="way"><b class="mono">02</b><h3>One point of contact</h3><p>Screens, sound, light, networks and builds from one team, so there is one call to make.</p></div><div class="way"><b class="mono">03</b><h3>We stay on site</h3><p>The people who plan the system build it and run it, in New York or wherever the job is.</p></div></div></section>'
       '<section class="next" id="scope"><p class="mono eb">Typical jobs</p><h2>What we usually build.</h2><p class="lead">%(scope)s</p></section>'
       '<section class="next" id="ifaq"><p class="mono eb">Questions</p><h2>Before you book.</h2><div class="prose">%(faq)s</div></section>')%it
    open(W+'ref/industry/%s.html'%it['slug'],'w').write(page(NAV+'\n'+m+Q2('Tell us what you are planning.',0)+'</main>\n'+FOOT))
for it in D.get('service',[]):
    os.makedirs(W+'ref/service',exist_ok=True)
    m=('<main><section class="svh abh"><p class="mono">Services</p><h1>%(h1)s</h1><p class="sub">%(sub)s</p><div class="ctas"><a class="btn" href="/services">See the nine services →</a><a class="ghost" href="/get-a-quote">Get a quote</a></div></section>'
       '<section class="next" id="moved"><p class="mono eb">Where to find it</p><h2>Each service now has <span>its own page.</span></h2>'+CH+'</section>')%it
    open(W+'ref/service/%s.html'%it['slug'],'w').write(page(NAV+'\n'+m+Q2('Start with what you need and when.',0)+'</main>\n'+FOOT))
print('ok')
