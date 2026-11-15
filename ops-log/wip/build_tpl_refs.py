# Reference pages for the two CMS templates (project, post), one item each, for chk('project/<slug>') / chk('post/<slug>')
import json
R='/home/claude/pav-hero/'; W='/home/claude/possible-av/web/'
exec(open(R+'pages/build_pages.py').read().split('P={}')[0])
def page(body,depth=2):
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="../../page.css"></head><body>\n%s\n<script src="../../page.ui.js"></script></body></html>'%body
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
print('ok')
