# Work and Blog list pages in the new design: port/<k>.body.html + web/ref/<k>.html (shared web/page.css, web/page.ui.js)
import json,re
R='/home/claude/pav-hero/'; W='/home/claude/possible-av/web/'
exec(open(R+'pages/build_pages.py').read().split('P={}')[0])   # NAV, FOOT, Q, hero, sec, faq, ways, chips
C='https://cdn.prod.website-files.com/6a34e9e5383e05c75c473463/'
WORK=[('la-secret-show-led-wall','Project · Los Angeles','Secret show LED wall, Los Angeles','A curved LED wall in a downtown LA penthouse that changed the world behind the artist as the set went on.',
  [('For','A beauty brand\'s music launch'),('We ran','The worlds behind the artist, live through the set')],
  '6af54af3114f46e82ae3d565_6af3d19307c27589ef878ee1_6af3c299c8fbb2eedeccc0e1_wlab-elf-turizo-secret-show-led-wall-audience.jpeg','A crowd watching a curved LED wall at a secret show in a downtown LA penthouse','6af54af3114f46e82ae3d565'),
 ('brand-launch-popup','Example · Brand pop-up','A pop-up that travels between cities','One kit, packed and tested in Brooklyn, set up the same way in every city.',
  [('We bring','Projection on the product wall, zoned sound, playback'),('Crew','The same technicians at every install and strike')],
  '6af3a430aeda8da98f522a6b_gen-m17dedv5kj1hj6j0pyqk7trvxn8hzvt2-0.jpeg','Illustration: a brand pop-up with a lit product wall','6af3a430aeda8da98f522a6b'),
 ('museum-interactive-gallery','Example · Gallery install','An interactive gallery that runs itself','Exhibits that respond to visitors, built for in-house staff to run.',
  [('We bring','Sensors, synchronized screens, zoned audio, the network'),('Crew','Install, training for staff, support after opening')],
  '6af3a430aeda8da98f522a61_gen-m17e5z3xpsvs85g63ba9hvmkqs8hypw1-0.jpeg','Illustration: a gallery with interactive projection','6af3a430aeda8da98f522a61'),
 ('corporate-general-session','Example · Corporate event','A full-day general session','Keynotes, panels and demos, with a backup for every signal.',
  [('We bring','Screens, live sound, a separate show network'),('Crew','Technicians on site for the whole day')],
  '6af3a430aeda8da98f522a5d_gen-m178tcd592jn882cbt4mkenxn18hzfe3-0.jpeg','Illustration: a general session stage with screens','6af3a430aeda8da98f522a5d'),
 ('retail-flagship-window','Example · Retail','A projection-mapped store window','A storefront that changes after dark, with content swapped remotely.',
  [('We bring','Weatherproof short-throw projectors, mapping, remote scheduling'),('Crew','Install, then monitoring for the run')],
  '6af3a430aeda8da98f522a70_gen-m17cj8n08ebp9dgtdhpnfxh9d18hzbjs-0.jpeg','Illustration: a lit flagship store window','6af3a430aeda8da98f522a70'),
 ('outdoor-festival-stage','Example · Outdoor stage','An outdoor main stage','Sound across a large field, video to stage-side screens and a network that holds up in a crowd.',
  [('We bring','Line-array PA, stage-side screens, a separate show network'),('Crew','Audio and video crew for the full day')],
  '6af3a430aeda8da98f522a59_gen-m17chgcjhsja4a8g1c4d4qk9pn8hz9rn-0.jpeg','Illustration: an outdoor festival stage','6af3a430aeda8da98f522a59'),
 ('corporate-lobby-install','Example · Permanent install','An interactive lobby wall','A welcome wall staff can update themselves, with quiet zoned audio.',
  [('We bring','A multi-screen wall, show control with a scheduler, cabling and network'),('Crew','Install, handover and support')],
  '6af3a430aeda8da98f522a66_gen-m17bv75q5qb0z2g0wnt0n5cqvn8hyxqb-0.jpeg','Illustration: a corporate lobby with an interactive wall','6af3a430aeda8da98f522a66')]
cards='<div class="rooms two">\n'+'\n'.join('<a class="room ex" href="/project/%s"><img src="%s%s" alt="%s" loading="lazy"><div><p class="mono">%s</p><h3>%s</h3><p>%s</p><dl>%s</dl></div></a>'%(s,C,img,alt,tag,h,p,''.join('<dt>%s</dt><dd>%s</dd>'%x for x in dl)) for s,tag,h,p,dl,img,alt,aid in WORK)+'\n</div>'
POSTS=json.load(open(R+'pages/posts.json'))
pc='<div class="posts">\n'+'\n'.join('<a class="post" href="/post/%s"><p class="mono">%s · %s</p><h3>%s</h3><p>%s</p><span class="more">Read →</span></a>'%(p['slug'],p['category'],p['read'],p['name'],p['excerpt']) for p in POSTS)+'\n</div>'
P={'work':('Work · events and installs','Work, and the way<br>we run it.','A recent project, and labelled examples of the kinds of jobs we take on. The examples are not a client list, and their pictures are illustrations.',
  [sec('list','Projects and examples','Planned, built and run <span>by the same crew.</span>',cards)]),
 'blog':('Blog · guides from the crew','Notes from<br>the load-in.','How we plan, build and run events: costs, specs and checklists, written by the people who do the work.',
  [sec('posts','Guides','Read before <span>you book.</span>',pc)])}
for k,(eb,h1,sub,secs) in P.items():
    body=NAV+'\n\n<main>\n'+hero(eb,h1,sub)+'\n'+'\n'.join(secs)+'\n'+Q+'\n</main>\n\n'+FOOT
    open(R+'port/%s.body.html'%k,'w').write(body)
    open(R+'port/%s.main.html'%k,'w').write(body[body.index('<main>'):body.index('</main>')+7])
    open(W+'ref/%s.html'%k,'w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="../page.css"></head><body>\n%s\n<script src="../page.ui.js"></script></body></html>'%body)
json.dump([[s,aid] for s,tag,h,p,dl,img,alt,aid in WORK],open(R+'pages/work_assets.json','w'))
css=open(W+'page.css').read()
if '/* work, blog */' not in css: open(W+'page.css','w').write(css+'\n'+open(R+'pages/extra.css').read())
print('ok')
