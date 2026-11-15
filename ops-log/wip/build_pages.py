# Builds the static (non-film) pages in the new design: port/<k>.body.html + web/ref/<k>.html, sharing web/page.css and web/page.ui.js
import re
R='/home/claude/pav-hero/'; W='/home/claude/possible-av/web/'
b=open(R+'port/services.body.html').read()
NAV=b[:b.index('</header>')+9].replace('<a class="cur" href="/services">','<a href="/services">')
FOOT=open(R+'port/about.body.html').read(); FOOT=FOOT[FOOT.index('<footer'):]
Q='''<section class="next end" id="quote">
<p class="mono eb">Get a quote</p>
<h2>Start with what you need and when.</h2>
<p class="lead">Tell us where, when, how many people and what has to happen. We reply with one quote for equipment, crew and delivery.</p>
<div class="ctas"><a class="btn" href="/get-a-quote">Get a quote →</a><a class="ghost" href="/services">All services</a></div>
</section>'''
def hero(eb,h1,sub,ctas=True):
    c='<div class="ctas"><a class="btn" href="/get-a-quote">Get a quote →</a><a class="ghost" href="/services">See the nine services</a></div>' if ctas else ''
    return '<section class="svh abh"><p class="mono">%s</p><h1>%s</h1><p class="sub">%s</p>%s</section>'%(eb,h1,sub,c)
def sec(i,eb,h2,inner,lead=''):
    return '<section class="next" id="%s">\n<p class="mono eb">%s</p>\n<h2>%s</h2>\n%s%s\n</section>'%(i,eb,h2,('<p class="lead">%s</p>\n'%lead) if lead else '',inner)
def faq(items): return '<div class="faq">\n'+'\n'.join('<details><summary>%s</summary><p>%s</p></details>'%qa for qa in items)+'\n</div>'
def ways(items,cls=''):
    return '<div class="ways%s">\n'%(' '+cls if cls else '')+'\n'.join('<div class="way"><b class="mono">%s</b><h3>%s</h3><p>%s</p></div>'%w for w in items)+'\n</div>'
def chips(links): return '<div class="chips">'+''.join('<a href="%s">%s</a>'%l for l in links)+'</div>'
S={'displays':'Displays','projection':'Projection','audio':'Audio','lighting':'Lighting &amp; staging','live-video':'Live video &amp; visuals','networks':'Networks &amp; computers','interactive':'Interactive &amp; tracking','fabrication':'Fabrication','logistics':'Logistics &amp; touring'}
sv=lambda *ks: chips([('/'+k,S[k]) for k in ks])
P={}
# ---------- Industries ----------
ind=[('brand-activation','Brand activations','Launches and activations that have to look right on the day and photograph well after.',('displays','projection','interactive','fabrication','lighting')),
 ('retail-popup','Retail pop-ups','Pop-up shops and branded units that arrive finished, with screens, light and sound built in.',('fabrication','displays','audio','networks')),
 ('museums-galleries','Museums &amp; galleries','Projection, sound and interactive pieces that serve the work, installed to stay or for a run.',('projection','audio','interactive','displays')),
 ('corporate-events','Corporate events','Keynotes, panels, town halls and offsites, on site and online.',('audio','displays','live-video','lighting','networks')),
 ('trade-shows','Trade shows','Booths that stand out on the floor and stay online when the hall network does not.',('displays','networks','fabrication','interactive'))]
cards='<div class="indl">\n'+'\n'.join('<article class="ind"><div><p class="mono">%02d</p><h3>%s</h3><p>%s</p><a class="more" href="/industry/%s">How we work for %s →</a></div>%s</article>'%(i+1,n,d,s,n.replace('&amp;','&amp;').lower(),sv(*ks)) for i,(s,n,d,ks) in enumerate(ind))+'\n</div>'
P['industries']=('Industries','Industries · five we work in','AV for the way<br>your event runs.','A brand launch, a gallery and a trade show booth need different things. We scope each one around how it actually runs, then bring and run all of it.',
 [sec('list','Who we work for','Five industries. <span>One crew for all of them.</span>',cards),
  sec('notlisted','Not on the list','Something else? <span>Tell us about it.</span>',ways([('Events','Any kind of event','Launches, parties, panels, screenings and shows, in New York and wherever the work goes.'),('Spaces','Installs that stay','Lobbies, showrooms, offices and galleries, designed, installed and handed over.')]))])
# ---------- FAQ ----------
P['faq']=('FAQ','Questions · the work, logistics, pricing','Straight answers<br>before you book.','What we do, how a job runs and what it costs. If your question is not here, ask us.',
 [sec('work','About the work','What we do.',faq([('What does Possible AV do?','AV rental, installation and production: displays, projection, audio, lighting and staging, live video, networks, interactive, fabrication, and the logistics to bring it all, done in house by one crew.'),
   ('Do you own your equipment?','We own our core equipment and run it ourselves. Anything we do not carry, we source and bring in with everything else.'),
   ('Do you do LED walls?','LED walls are handled by our sister site, <a href="https://ledwall.nyc">ledwall.nyc</a>. We handle everything around them: signal, sound, networks and playback.'),
   ('Can you make content, or just bring equipment?','Both. Content, 3D and custom builds are made in house, and we play back content your team provides. If Resolume or TouchDesigner does it, we do it.')])),
  sec('logistics','Logistics','How a job runs.',faq([('Where do you work?','We are based in Brooklyn, New York. For work outside New York, the same crew travels with the equipment.'),
   ('How far ahead should we book?','As early as you can, especially for large or multi-city work. Tight timelines are worth a message too: tell us the date.'),
   ('Do you handle load-in and strike?','Yes. Our own truck and crew deliver, set up, run the event and take everything away.'),
   ('What if the venue is tricky?','We check power, rigging and access early and plan around them before the day.')])),
  sec('pricing','Pricing and booking','What it costs.',faq([('How much does it cost?','It depends on scale, crew, show days and the venue. See <a href="/pricing">pricing</a> for starting points, then send your project for a quote.'),
   ('How do I get a quote?','Use the <a href="/get-a-quote">quote form</a> with the space, the dates and what has to happen. The clearer the brief, the faster the quote.'),
   ('Do you do permanent installs?','Yes: lobbies, showrooms, offices and galleries, including cabling, networks, equipment, training and support after.')]))])
# ---------- Pricing ----------
tiers='<div class="tiers">\n'+'\n'.join('<div class="tier"><b class="mono">%s</b><h3>%s</h3><p class="tp">%s</p><ul>%s</ul><a class="btn" href="/get-a-quote">Get a quote →</a></div>'%(a,b2,c,''.join('<li>%s</li>'%x for x in d)) for a,b2,c,d in [
 ('Event day','From $2,500','Single-day events and activations.',['A technician on site','Core display and audio package','Same-day setup and strike']),
 ('Production','From $8,000','Multi-day events and full productions.',['System design for the event','A crew across services','Projection, interactive and live video','On site for the full run']),
 ('Permanent install','Quoted per project','Lobbies, showrooms, offices and galleries.',['Site visit and design','Cabling and networks','Equipment supplied and installed','Training, documentation and support'])])+'\n</div>'
P['pricing']=('Pricing','Pricing · event day, production, install','Starting points,<br>quoted line by line.','Every job is scoped to your space, dates and goals. Here is where each kind of project starts, what is included, and what moves the number.',
 [sec('tiers','Starting points','Three ways we work.',tiers),
  sec('included','What the price covers','Included, <span>and quoted as separate lines.</span>',ways([('Included','In every quote','System design, the equipment, prep and testing in Brooklyn, delivery in New York, setup and strike, and a technician on site while it runs.'),('Separate lines','Quoted clearly','Travel and freight outside New York, content made for the project, venue or union labor, rigging and power, extra show days, and LED walls through ledwall.nyc.')])),
  sec('drivers','What moves the number','Scale, crew, time and the venue.','<ul class="incl abincl"><li><b>Scale</b>the size of the display, sound and lighting systems</li><li><b>Crew and days</b>how many people, and how many show days</li><li><b>Setup window</b>how long there is to build and strike</li><li><b>Venue</b>power, rigging and access</li></ul>'),
  sec('pfaq','Questions','Pricing, briefly.',faq([('Is a technician included?','Yes. Every event quote includes a technician on site. Productions include a crew for the full run.'),('Do you charge for travel?','Work outside New York lists travel and freight as their own lines, so you can see what the distance adds.'),('How do we get an exact number?','Send the space, the dates and what has to happen. We reply with an itemized quote.')]))])
# ---------- Touring ----------
P['touring-av']=('Touring','Touring and out-of-town · from Brooklyn, New York','A crew from New York,<br>in every city.','Possible AV is a Brooklyn, New York AV company that travels. We pack our own equipment, the crew comes with it, and the show runs the same way in every city as it does at home.',
 [sec('how','How the equipment travels','Built in Brooklyn. <span>Run anywhere.</span>','<ul class="incl abincl"><li><b>Built and tested first</b>every system is built, labelled and run end to end at our studio before it is packed</li><li><b>Packed to travel</b>in our own cases, travelling with the crew or shipped ahead to the venue</li><li><b>The same crew</b>the people who built it set it up, run the show and pack it out</li><li><b>One quote</b>with travel and freight as their own lines</li></ul>'),
  sec('tours','Multi-city','One system, <span>the same in every city.</span>',ways([('Tours','A run of cities','The same system and the same people at every stop, set up the same way each time.'),('One-offs','A show out of town','One event in another city, with the crew and equipment from New York.')]),'We have taken shows from New York to Chicago, Los Angeles and San Francisco.'),
  sec('tfaq','Questions','Touring, briefly.',faq([('Which cities do you work in?','New York, and wherever the work goes. The crew travels with the equipment.'),('How does the equipment get there?','In our own cases, travelling with the crew or shipped ahead, depending on the size of the system.'),('Is travel included in the quote?','Travel and freight are quoted as their own lines, so you can see what the distance adds.')])),
  '<section class="next" id="logi"><p class="mono eb">See also</p><h2>Logistics &amp; touring.</h2><div class="chips"><a href="/logistics">Logistics &amp; touring service</a><a href="/work">Work</a></div></section>'])
for k,(title,eb,h1,sub,secs) in P.items():
    body=NAV+'\n\n<main>\n'+hero(eb,h1,sub)+'\n'+'\n'.join(secs)+'\n'+Q+'\n</main>\n\n'+FOOT
    open(R+'port/%s.body.html'%k,'w').write(body)
    h='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="../page.css"></head><body>\n%s\n<script src="../page.ui.js"></script></body></html>'%body
    open(W+'ref/%s.html'%k,'w').write(h)
css=open(W+'about.css').read()+'''
/* static pages: industries, pricing */
.indl{display:grid;grid-template-columns:1fr;gap:10px;margin-top:40px}
.ind{display:grid;grid-template-columns:1.2fr 1fr;gap:28px;align-items:center;border:1px solid var(--line);border-radius:20px;padding:26px 28px;background:rgba(255,255,255,.28)}
.ind h3{font-size:26px;letter-spacing:-.025em;font-weight:600;margin:8px 0 8px}
.ind p{font-size:15px;line-height:1.5;color:var(--ink2);max-width:520px}
.ind .mono{color:var(--ink3);font-size:12px}
.ind .more{display:inline-block;margin-top:14px;font-size:14.5px;font-weight:600;color:var(--ink);text-decoration:none;border-bottom:1px solid var(--a)}
.ind .chips{margin-top:0;justify-content:flex-end}
.tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:40px}
.tier{border:1px solid var(--line);border-radius:20px;padding:26px 26px 28px;display:flex;flex-direction:column;gap:10px;background:rgba(255,255,255,.3)}
.tier b{color:var(--a)}
.tier h3{font-size:34px;letter-spacing:-.03em;font-weight:600}
.tier .tp{font-size:15px;color:var(--ink2)}
.tier ul{list-style:none;margin:8px 0 18px;border-top:1px solid var(--line)}
.tier li{padding:10px 0;border-bottom:1px solid var(--line);font-size:14.5px;color:var(--ink2)}
.tier .btn{margin-top:auto;align-self:flex-start}
@media (max-width:900px){.ind{grid-template-columns:1fr;gap:14px;padding:20px}.ind .chips{justify-content:flex-start}.tiers{grid-template-columns:1fr}.tier h3{font-size:28px}}
'''
open(W+'page.css','w').write(css+'\n'+open(R+'pages/extra.css').read())
ui=open(W+'about.ui.js').read().replace("'/about':'/about'}","'/about':'/about','/industries':'/#industries','/faq':'/about','/pricing':'/about','/touring-av':'/services'}")
open(W+'page.ui.js','w').write(ui)
print('ok', list(P))
