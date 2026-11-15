# Builds the New York landing pages (one per search intent): port/<k>.body.html + web/ref/<k>.html + pages/landing.json
# Same design system as the other static pages (web/page.css, web/page.ui.js). Run after build_pages.py.
import json, re
R='/home/claude/pav-hero/'; W='/home/claude/possible-av/web/'
exec(open(R+'pages/build_pages.py').read().split("P={}")[0])   # NAV, FOOT, Q, hero(), sec(), faq(), ways(), chips(), S, sv()
A={l.split()[0]:l.split()[1] for l in open(R+'port/assets.txt') if len(l.split())==2 and l.split()[0].endswith('.jpg')}
CDN='https://cdn.prod.website-files.com/6a34a7893bca7b2b60e5eac7/'
def strip(*imgs): return '<div class="abstrip">'+''.join('<img src="%s%s_%s" alt="%s" loading="lazy">'%(CDN,A[n],n,alt) for n,alt in imgs)+'</div>'
def incl(items): return '<ul class="incl abincl">'+''.join('<li><b>%s</b>%s</li>'%i for i in items)+'</ul>'
L={  # slug: label used in the NYC link list
 'av-rental-nyc':'AV rental','audio-visual-company-nyc':'Audio visual company','event-production-company-nyc':'Event production',
 'projector-rental-nyc':'Projector rental','sound-system-rental-nyc':'Sound system rental','microphone-rental-nyc':'Microphone rental',
 'tv-rental-nyc':'TV &amp; screen rental','event-lighting-rental-nyc':'Event lighting rental','stage-rental-nyc':'Stage &amp; truss rental',
 'event-wifi-rental-nyc':'Event Wi-Fi','computer-rental-nyc':'Computer rental','experiential-production-nyc':'Experiential production'}
def nyc(k,*others):
    ks=others or [x for x in L if x!=k]
    return chips([('/'+x,L[x]+' in NYC') for x in ks if x!=k])
BORO=sec('where','Where in New York','All five boroughs, <span>delivered from Brooklyn.</span>',
 ways([('Manhattan','Offices, hotels and stores','Midtown offices, hotel ballrooms, SoHo storefronts, galleries and rooftops.'),
       ('Brooklyn &amp; Queens','Close to our dock','Warehouses, studios and lofts in Brooklyn and Long Island City, minutes from where the gear is packed.'),
       ('The Bronx &amp; Staten Island','The rest of the city','Schools, campuses, parks and public spaces across the other boroughs, and Jersey City and Long Island too.')],'three'))
P={}
def page(k,title,desc,eb,h1,sub,imgs,secs,qa):
    P[k]=dict(title=title,desc=desc,eb=eb,h1=h1,sub=sub,imgs=imgs,secs=secs,qa=qa)

# ---------- 1. AV rental (hub) ----------
page('av-rental-nyc','AV Rental NYC: Audio, Video, Lighting & Screens | Possible AV',
 'AV rental in New York City with the crew included: screens, projectors, sound, microphones, lighting, staging, streaming and Wi-Fi, delivered from Brooklyn.',
 'AV rental · New York City','AV rental in NYC,<br>with the crew included.',
 'Screens, projectors, sound, microphones, lighting, staging, streaming and networks for events and installs across New York City. Delivered from Brooklyn, set up and run by our own crew.',
 [('displays-tv.jpg','An OLED TV on a rolling stand set up for an event'),('audio-systems.jpg','Event speakers and a sound system ready for a show'),('projection-laser.jpg','A laser projector set up on a stand')],
 [sec('rent','What you can rent','Everything for the event, <span>from one company.</span>',
   incl([('Video','OLED TVs, touch screens, transparent displays, playback stations and laser projectors'),('Audio','Speakers, PA systems, wireless microphones, directional speakers and mixing'),('Lighting &amp; staging','Aputure lighting, stage decks, truss and rigging, with an operator'),('Production','Live streaming, video switchers, event Wi-Fi and show computers')]),
   'Every rental goes out as a service: we deliver it, set it up, run it and take it away.'),
  sec('how','How an AV rental works','One quote, <span>one crew, one schedule.</span>',
   ways([('01','Send the brief','Where, when, how many people and what has to happen. We reply within 24 hours.'),('02','One quote','Equipment, crew and delivery on one itemized quote, line by line.'),('03','Built and tested','The system is built and tested in Brooklyn before it leaves.'),('04','Run on the day','Our crew sets up, runs the show and strikes it.')])),
  BORO,
  sec('nyc','Rentals by type','Find what you need <span>in New York.</span>',nyc('av-rental-nyc')),
  sec('svc','Our nine services','The full range.',sv('displays','projection','audio','lighting','live-video','networks','interactive','fabrication','logistics'))],
 [('Does AV rental in NYC include setup?','Yes. Every rental goes out with our crew: delivery, setup, a technician while it runs, and strike.'),
  ('Can I rent just one piece of equipment?','Yes. A single TV, projector or speaker is a normal job. It still arrives set up and tested.'),
  ('Do you deliver across all five boroughs?','Yes. We deliver from Brooklyn to Manhattan, Brooklyn, Queens, the Bronx and Staten Island, and to Jersey City and Long Island.'),
  ('What if you do not carry something?','We source it and bring it in with everything else, on the same quote and the same schedule.'),
  ('Do you rent LED walls?','LED walls are rented through our sister site, <a href="https://ledwall.nyc">ledwall.nyc</a>, and we plan them in with the rest of the AV.')])

# ---------- 2. Audio visual company ----------
page('audio-visual-company-nyc','Audio Visual Company in NYC: Rental, Install & Production | Possible AV',
 'A Brooklyn, New York audio visual company: AV rental for events, AV installation for offices, showrooms and homes, and full production, all in house.',
 'Audio visual company · Brooklyn, New York','An audio visual company<br>that does the whole job.',
 'Possible AV is an AV company in Brooklyn, New York. We rent, sell and install audio, video, lighting and network systems, and run them for events, offices, showrooms and homes across the city.',
 [('room-corporate.jpg','A corporate event set up with screens and stage lighting'),('networks-rack.jpg','A network and AV equipment rack built for an install'),('interactive-ex-lobby.jpg','An interactive display installed in a lobby')],
 [sec('what','What an AV company does for you','Rent it, buy it, <span>or have it installed.</span>',
   ways([('Rent','AV for events','Screens, sound, lighting, streaming and networks, delivered and run by our crew.'),('Install','AV that stays','Conference room AV, lobby and showroom displays, home theater and networks, installed and handed over.'),('Produce','The whole show','Planning, content, fabrication and the crew to run it, for launches, conferences and exhibitions.')],'three')),
  sec('inhouse','All in house','Nine services, <span>one team.</span>',
   incl([('Video','Displays, touch screens, projectors and projection mapping'),('Audio &amp; light','Sound systems, microphones, lighting and staging'),('Systems','Event Wi-Fi, UniFi networks, show computers and streaming'),('Build','Interactive installations, fabrication and our own truck')])),
  sec('install','AV installation in New York','Systems built <span>to run every day.</span>',
   ways([('Offices','Conference rooms','Displays, cameras, microphones and one-button control for meeting spaces.'),('Brands','Lobbies and showrooms','Commercial displays, interactive pieces and background audio that look built in.'),('Homes','Home theater','Projectors, screens and sound for a home, installed and set up.'),('Networks','UniFi installs','Wi-Fi and cabling for offices and buildings, with the AV on its own network.')])),
  BORO,
  sec('nyc','In New York','Popular searches.',nyc('audio-visual-company-nyc','av-rental-nyc','event-production-company-nyc','projector-rental-nyc','sound-system-rental-nyc','tv-rental-nyc','event-wifi-rental-nyc'))],
 [('What does an audio visual company do?','It supplies and runs the screens, sound, lighting and networks for events, and designs and installs AV systems for offices, showrooms and homes. Possible AV does both, in house.'),
  ('Do you install AV in offices?','Yes: conference rooms, lobbies and showrooms, including displays, audio, control, cabling and the network, with training and support after.'),
  ('Do you install home theater in New York?','Yes. We supply and install projectors, screens and sound for homes, and set the system up so it is easy to use.'),
  ('Where are you based?','Brooklyn, New York. We work across the five boroughs, and the same crew travels for work outside the city.'),
  ('How do we start?','Send the space, the dates and what it has to do through the <a href="/get-a-quote">quote form</a>. We reply within 24 hours.')])

# ---------- 3. Event production company ----------
page('event-production-company-nyc','Event Production Company in NYC | Possible AV',
 'A New York event production company with the AV, lighting, staging, streaming, fabrication and crew in house, for launches, conferences, galas and activations.',
 'Event production · New York City','An event production company<br>with everything in house.',
 'Launches, conferences, parties, galas and brand activations across New York. We plan the show, build the set, bring the AV and run it on the night, with one crew from the first call to the strike.',
 [('lighting-ex-launch.jpg','A product launch with stage lighting and screens'),('live-video-ex-conference.jpg','A conference with cameras and a live stream'),('logistics-ex-loadin.jpg','The crew loading equipment in for an event')],
 [sec('scope','What we produce','From the plan <span>to the strike.</span>',
   incl([('Plan','Layout, run of show, power and access, and one schedule for everyone'),('Build','Sets, stages, props and branded pieces from our own shop'),('Bring','AV, lighting, staging, streaming and Wi-Fi on our own truck'),('Run','Show operators and a crew lead on site for the whole event')])),
  sec('events','Events we produce','For the way <span>your event runs.</span>',
   ways([('Launches','Product launches and press events','A hero moment on screens, light and sound, built to photograph well.'),('Corporate','Conferences and town halls','Stage, screens, microphones and streaming, with a backup for every signal.'),('Parties','Galas and holiday parties','Lighting, sound and visuals for the night, set up and struck around the space.'),('Brands','Activations and pop-ups','Interactive pieces, fabricated units and AV, the same in every city.')])),
  BORO,
  sec('more','Related','Services behind <span>every production.</span>',sv('lighting','audio','live-video','fabrication','interactive','logistics')),
  sec('nyc','In New York','More ways to book.',nyc('event-production-company-nyc','av-rental-nyc','stage-rental-nyc','event-lighting-rental-nyc','experiential-production-nyc','audio-visual-company-nyc'))],
 [('What does an event production company do?','It plans and runs the technical side of an event: staging, lighting, sound, screens, streaming and the crew. Possible AV also builds sets and interactive pieces in house.'),
  ('Do you work with event planners and agencies?','Yes. We work for brands directly, and with planners and agencies who set the creative and want one team to deliver it.'),
  ('Can you produce an event outside New York?','Yes. The same crew and equipment travel from Brooklyn. See <a href="/touring-av">touring and out-of-town AV</a>.'),
  ('How far ahead should we book?','As early as you can, especially for large events. Tight timelines are worth a message too: tell us the date.'),
  ('Do you include LED walls?','LED walls come from our sister site, <a href="https://ledwall.nyc">ledwall.nyc</a>, and we plan them into the same production.')])

# ---------- 4. Projector rental ----------
page('projector-rental-nyc','Projector Rental NYC: Laser Projectors & Screens | Possible AV',
 'Projector and screen rental in New York City: Epson laser projectors up to 7,000 lumens, screens and projection mapping, delivered, set up and run by our crew.',
 'Projector rental · New York City','Projector rental in NYC,<br>set up and focused.',
 'Epson laser projectors up to 7,000 lumens, screens of every size and projection mapping for events, exhibitions and homes. We bring them, hang or stand them, focus them and stay to run the show.',
 [('projection-laser.jpg','An Epson laser projector set up for an event'),('projection-screens.jpg','Projection on screens of different sizes'),('projection-mapping.jpg','Projection mapping across several screens')],
 [sec('rent','What you can rent','Projectors and screens <span>for any space.</span>',
   incl([('Laser projectors','Epson laser projectors up to 7,000 lumens, for lit spaces and big screens'),('Compact projectors','Smaller projectors and pull-up screens for meetings and talks'),('Screens','Front and rear projection screens, sized to the space'),('Mapping','Projection mapping on walls, objects and irregular surfaces')])),
  sec('how','How it works','Bright enough, <span>in the right place.</span>',
   ways([('01','Tell us the space','The size of the image, the light in the space and where the audience sits.'),('02','We spec it','The projector, lens and screen that fit, with the throw worked out.'),('03','Set up and focused','Hung, stacked or ceiling mounted, aligned and tested before doors.'),('04','Run and struck','A technician runs playback and takes it all away after.')])),
  BORO,
  sec('more','Related','More on projection.',chips([('/projection','Projection service'),('/post/projector-vs-led-wall-which-is-right','Projector vs LED wall'),('/post/projection-mapping-101','Projection mapping 101')])),
  sec('nyc','In New York','Also for rent.',nyc('projector-rental-nyc','av-rental-nyc','tv-rental-nyc','sound-system-rental-nyc','event-lighting-rental-nyc'))],
 [('How bright a projector do I need?','It depends on the image size and how much light is in the space. For lit spaces and large screens we use Epson laser projectors up to 7,000 lumens; tell us the space and we will spec it.'),
  ('Do you rent a projector with a screen?','Yes. Projectors go out with the screen, stands or rigging, cabling and playback the job needs.'),
  ('Can you project on a building or an object?','Yes. Projection mapping on walls, objects and irregular surfaces is part of our <a href="/projection">projection</a> work.'),
  ('Is setup included with a projector rental?','Yes. We deliver, set up, focus and test it, and a technician can stay to run it.'),
  ('Do you install home theater projectors?','Yes. We rent projectors for home use and install home theater systems in New York.')])

# ---------- 5. Sound system rental ----------
page('sound-system-rental-nyc','Sound System & Speaker Rental NYC | Possible AV',
 'Sound system, PA and speaker rental in New York City, from one speaker and a mic to a flown line array, with an engineer to set it up and mix the show.',
 'Sound system rental · New York City','Sound system rental in NYC,<br>with an engineer.',
 'Speakers, PA systems, mixers and microphones for talks, parties, launches and concerts across New York. We size the system to the space, set it up, mix the show and take it away.',
 [('audio-systems.jpg','A speaker system set up for an event'),('audio-console.jpg','A mixing console run by an audio engineer'),('audio-directional.jpg','A directional speaker for focused sound')],
 [sec('rent','What you can rent','From one speaker <span>to a line array.</span>',
   incl([('Speakers &amp; PA','Powered speakers, subwoofers and PA systems up to a flown line array'),('Microphones','Wireless handhelds, headsets and lavaliers'),('Mixing','Mixers and an engineer to run the sound live'),('Special audio','Directional speakers and spatial audio for exhibitions and installs')])),
  sec('sizes','Sized to the space','Pick the job, <span>we size the system.</span>',
   ways([('Small','A talk or a dinner','Two speakers and a microphone, set up and checked before guests arrive.'),('Medium','A party or a launch','A full PA with subwoofers and wireless microphones, mixed live.'),('Large','A concert or general session','A flown or stacked system for a full hall, with monitors and an engineer.'),('Install','Sound that stays','Background and zoned audio for stores, lobbies and offices.')])),
  BORO,
  sec('more','Related','More on audio.',chips([('/audio','Audio service'),('/microphone-rental-nyc','Microphone rental in NYC'),('/post/dante-audio-networking-explained','Dante audio networking')])),
  sec('nyc','In New York','Also for rent.',nyc('sound-system-rental-nyc','av-rental-nyc','microphone-rental-nyc','event-lighting-rental-nyc','stage-rental-nyc'))],
 [('How big a sound system do I need?','It depends on the space, the number of guests and what is on the program: speech, background music or a live band. Tell us those and we will size the system.'),
  ('Does a sound system rental come with an engineer?','Yes. We set it up and check it, and an engineer can stay to mix the show.'),
  ('Can I rent just speakers for a party?','Yes. A pair of speakers with a microphone is a normal job, delivered and set up.'),
  ('Do you rent directional speakers?','Yes. We rent and sell directional speakers for exhibitions, stores and installs where the sound has to stay in one spot.'),
  ('Do you install sound systems?','Yes. Background and zoned audio for stores, lobbies, offices and homes, installed and handed over.')])

# ---------- 6. Microphone rental ----------
page('microphone-rental-nyc','Wireless Microphone Rental NYC | Possible AV',
 'Wireless microphone rental in New York City: handhelds, headsets and lavaliers, with frequency coordination, spares and a technician on site.',
 'Microphone rental · New York City','Wireless microphone rental<br>in NYC.',
 'Handheld, headset and lavalier microphones for panels, keynotes, galas and shows across New York. Coordinated for crowded New York airwaves, with spares on the table and a technician to fit and run them.',
 [('audio-mics.jpg','Wireless microphones and receivers prepared for a show'),('audio-ex-panel.jpg','A panel discussion with wireless microphones'),('lighting-ex-panel.jpg','Panelists on stage under event lighting')],
 [sec('rent','What you can rent','The right mic <span>for each voice.</span>',
   incl([('Handhelds','For hosts, toasts and audience questions'),('Headsets','For keynotes and presenters who move'),('Lavaliers','For panels, interviews and on-camera work'),('The rest','Receivers, a mixer and speakers, or a feed into the house system')])),
  sec('why','Why New York is harder','Coordinated, <span>checked, with spares.</span>',
   ways([('Scan','On site first','We scan the airwaves where the show happens and pick clean frequencies.'),('Spares','One more than you need','A tested spare on the table turns a dropped mic into a ten-second swap.'),('Batteries','Fresh for every show','Fresh batteries or charged packs, swapped at every long break.'),('Wrangler','Someone backstage','A technician fits headsets and lavs and hands off on cue.')])),
  BORO,
  sec('more','Related','More on microphones.',chips([('/post/wireless-microphones-events-nyc','How many wireless mics you need'),('/audio','Audio service'),('/sound-system-rental-nyc','Sound system rental in NYC')])),
  sec('nyc','In New York','Also for rent.',nyc('microphone-rental-nyc','sound-system-rental-nyc','av-rental-nyc','stage-rental-nyc'))],
 [('How many wireless microphones do I need?','One for each voice that can be live at the same moment, plus a spare. Our <a href="/post/wireless-microphones-events-nyc">wireless microphone guide</a> walks through common programs.'),
  ('Can I rent microphones without a sound system?','Yes. We can feed the microphones into the system already in your space, or bring speakers and a mixer as well.'),
  ('Headset, lavalier or handheld?','Handhelds are the most forgiving, headsets keep the level steady for presenters who move, and lavaliers are the most discreet. We will suggest a mix for your program.'),
  ('Is a technician included?','Yes. A technician sets up and checks every channel, and can stay to run them during the event.')])

# ---------- 7. TV & screen rental ----------
page('tv-rental-nyc','TV & Screen Rental NYC: OLED, Touch & Transparent | Possible AV',
 'TV and screen rental in New York City: OLED TVs, touch screens with Android or Windows, transparent displays and kiosks, delivered and set up by our crew.',
 'TV &amp; screen rental · New York City','TV and screen rental<br>in NYC.',
 'OLED TVs, touch screens, transparent displays and playback stations for events, trade shows, offices and pop-ups across New York. Delivered on stands or mounted, loaded with your content and set up by our crew.',
 [('displays-tv.jpg','An OLED TV on a rolling stand'),('displays-touch.jpg','A touch screen kiosk showing interactive content'),('displays-transparent.jpg','A transparent display in a retail setting')],
 [sec('rent','What you can rent','Screens <span>that arrive ready.</span>',
   incl([('OLED TVs','On rolling stands, floor stands or wall mounts'),('Touch screens','With built-in Android or Windows, for kiosks and check-in'),('Transparent displays','For windows, products and showcases'),('Playback','Players and multi-screen playback stations, loaded with your files')])),
  sec('how','How it works','Content in, <span>screens on.</span>',
   ways([('01','Send the content','Video, slides or an interactive app, and the size and number of screens.'),('02','We prepare it','Content loaded, formats checked, everything tested in Brooklyn.'),('03','Delivered and set','Stands, mounts and cabling set up on site, playback started.'),('04','Picked up','We take it all away at the end, or leave it installed.')])),
  BORO,
  sec('more','Related','More on displays.',chips([('/displays','Displays service'),('/post/projector-vs-led-wall-which-is-right','Projector vs LED wall'),('https://ledwall.nyc','LED walls on ledwall.nyc')])),
  sec('nyc','In New York','Also for rent.',nyc('tv-rental-nyc','av-rental-nyc','projector-rental-nyc','computer-rental-nyc','event-wifi-rental-nyc'))],
 [('Can I rent a TV for one day?','Yes. Single-day TV rentals for events and meetings are a normal job, delivered and set up.'),
  ('Do you rent touch screens?','Yes. Touch screens with built-in Android or Windows, for kiosks, check-in, product catalogs and interactive pieces.'),
  ('Do you load the content?','Yes. Send the files and we load and test them before the screens leave Brooklyn.'),
  ('Can screens be wall mounted?','Yes. Screens go out on stands or mounted to the wall, depending on the space.'),
  ('Do you sell screens as well?','Yes. We sell and install touch screens and displays for offices, stores and showrooms.')])

# ---------- 8. Event lighting ----------
page('event-lighting-rental-nyc','Event Lighting Rental NYC | Possible AV',
 'Event lighting rental in New York City: Aputure lights, stage and wash lighting, a lighting desk and an operator, for galas, launches, panels and parties.',
 'Event lighting rental · New York City','Event lighting rental<br>in NYC.',
 'Aputure lighting for stages, panels, interviews, galas and parties across New York. Rigged on stands or truss, focused on the people who matter and run from a lighting desk by our crew.',
 [('lighting-event.jpg','Event lighting on a stage'),('lighting-package.jpg','A lighting package with stands and fixtures'),('lighting-desk.jpg','A lighting desk with an operator')],
 [sec('rent','What you can rent','Light for the people <span>and the space.</span>',
   incl([('Stage light','Key and fill for presenters and panels'),('Wash &amp; color','Color for walls, the space and the dance floor'),('Rigging','Stands, truss and the rigging to hang it safely'),('Control','A lighting desk with an operator for the show')])),
  sec('uses','Where it is used','The right look <span>for each event.</span>',
   ways([('Panels','Talks and town halls','Even, flattering light that also reads on camera and the stream.'),('Galas','Dinners and parties','Warm, colored light for the space and the dance floor.'),('Launches','Product moments','A lit reveal and a set that photographs well.'),('Video','Interviews and content','Soft key light for a shoot inside your event.')])),
  BORO,
  sec('more','Related','More on lighting.',chips([('/lighting','Lighting &amp; staging service'),('/stage-rental-nyc','Stage &amp; truss rental in NYC')])),
  sec('nyc','In New York','Also for rent.',nyc('event-lighting-rental-nyc','stage-rental-nyc','sound-system-rental-nyc','av-rental-nyc','event-production-company-nyc'))],
 [('Do you provide an operator with the lighting?','Yes. A lighting operator can run the desk for the whole event, and the crew sets up and strikes.'),
  ('Can the lighting work on camera?','Yes. We light panels and talks so they look right in the space and on the stream.'),
  ('Can you hang lights from truss?','Yes. Truss and rigging go out with the lighting when the space calls for it.'),
  ('Do you also rent a stage?','Yes. Stage decks, truss and lighting can come together; see <a href="/stage-rental-nyc">stage rental</a>.')])

# ---------- 9. Stage rental ----------
page('stage-rental-nyc','Stage & Truss Rental NYC: Staging for Events | Possible AV',
 'Stage, staging and truss rental in New York City: modular stage decks, stairs, skirting, truss and rigging, built and struck by our crew.',
 'Stage &amp; truss rental · New York City','Stage and truss rental<br>in NYC.',
 'Modular stage decks, truss and rigging for talks, launches, galas and shows across New York. Built level and solid by our crew, with the lighting, sound and screens that go on it.',
 [('lighting-decks.jpg','Modular stage decks being built for an event'),('lighting-truss.jpg','Truss set up for event lighting'),('lighting-ex-townhall.jpg','A town hall on a stage with lighting')],
 [sec('rent','What you can rent','A level stage, <span>built on site.</span>',
   incl([('Stage decks','Modular decks at the size and height the event needs'),('Finishing','Stairs, skirting and edges for a clean look'),('Truss','Goal posts and truss for lights, screens and signs'),('On the stage','Lighting, sound, screens and microphones from the same crew')])),
  sec('how','How it works','Measured, built, <span>then struck.</span>',
   ways([('01','Size it','The stage size and height for the audience and the program.'),('02','Check access','Load-in, floor and ceiling checked before the day.'),('03','Built level','Decks, stairs, skirting and truss built and checked by our crew.'),('04','Struck on time','Taken down and out when the event ends.')])),
  BORO,
  sec('more','Related','More on staging.',chips([('/lighting','Lighting &amp; staging service'),('/event-lighting-rental-nyc','Event lighting rental in NYC')])),
  sec('nyc','In New York','Also for rent.',nyc('stage-rental-nyc','event-lighting-rental-nyc','sound-system-rental-nyc','av-rental-nyc','event-production-company-nyc'))],
 [('What size stage do I need?','It depends on how many people are on it and how far back the audience goes. Tell us the program and the headcount and we will size it.'),
  ('Do you set up and take down the stage?','Yes. Our crew builds the stage on site and strikes it at the end.'),
  ('Can lighting and screens go on the stage?','Yes. Lighting, sound, screens and microphones come from the same crew, planned with the stage.'),
  ('Do you rent truss on its own?','Yes. Truss and rigging can be rented for lights, screens or signs, set up by our crew.')])

# ---------- 10. Event Wi-Fi ----------
page('event-wifi-rental-nyc','Event Wi-Fi & Internet Rental NYC | Possible AV',
 'Temporary event Wi-Fi in New York City: access points, switching and a separate show network, with backup internet and monitoring while the event runs.',
 'Event Wi-Fi · New York City','Event Wi-Fi in NYC<br>that holds up.',
 'Temporary Wi-Fi and wired networks for conferences, trade shows, pop-ups and productions across New York. Show traffic kept apart from guest traffic, a backup line ready, and someone watching it the whole time.',
 [('networks-wifi.jpg','A Wi-Fi access point set up for an event'),('networks-rack.jpg','Network switching in a rack'),('networks-ex-conference.jpg','A conference running on a temporary network')],
 [sec('rent','What we set up','A network <span>built for the event.</span>',
   incl([('Wi-Fi','Access points placed for the number of devices, not just the size of the space'),('Wired','Switches and cabling for playback, streaming, check-in and payments'),('Separation','Show, production and guest traffic on their own networks'),('Backup','A second internet path and monitoring during the event')])),
  sec('how','How it works','Planned, tested, <span>watched.</span>',
   ways([('01','Count the devices','Guests, staff, screens, cameras and point-of-sale.'),('02','Plan the network','Access points, switching and the internet line, with a backup.'),('03','Test before doors','Every network and the failover tested on site.'),('04','Watched live','Monitored through the event, then packed out.')])),
  BORO,
  sec('more','Related','More on networks.',chips([('/networks','Networks &amp; computers service'),('/post/temporary-event-network-setup-guide','Event network setup guide'),('/computer-rental-nyc','Computer rental in NYC')])),
  sec('nyc','In New York','Also for rent.',nyc('event-wifi-rental-nyc','computer-rental-nyc','av-rental-nyc','tv-rental-nyc'))],
 [('Why not use the building Wi-Fi?','You cannot control it or see into it, and it is shared with everyone else. When streaming, check-in and payments depend on it, a network of your own is safer.'),
  ('Can you provide internet for an event?','We plan the internet connection with the space, add a backup path, and build the Wi-Fi and wired network on top.'),
  ('Do you install permanent networks?','Yes. UniFi networks for offices and buildings, with structured cabling and support.'),
  ('Is someone on site during the event?','Yes. The network is monitored while the event runs, with a technician on hand.')])

# ---------- 11. Computer rental ----------
page('computer-rental-nyc','Computer & Workstation Rental NYC | Possible AV',
 'Computer and workstation rental in New York City: show computers, playback machines and high-end workstations for events and productions, set up by our crew.',
 'Computer rental · New York City','Computer and workstation<br>rental in NYC.',
 'Show computers, playback machines and high-end workstations for events, exhibitions and productions across New York. Configured for the job, delivered and set up, and custom PCs built to order if you want to keep them.',
 [('networks-workstation.jpg','A high-end workstation set up for a production'),('networks-pc.jpg','A custom-built PC'),('networks-ex-control.jpg','A control desk with show computers')],
 [sec('rent','What you can rent','Machines <span>that run the show.</span>',
   incl([('Show computers','For playback, slides, graphics and show control'),('Workstations','High-end machines for real-time 3D, TouchDesigner and video'),('Check-in','Machines and screens for registration and kiosks'),('Custom PCs','Built to order and sold, configured for your software')])),
  sec('how','How it works','Configured, <span>then delivered.</span>',
   ways([('01','Tell us the software','What has to run, and how many machines.'),('02','Configured','Software, settings and your files set up before delivery.'),('03','Set up on site','Connected to screens, the network and the show.'),('04','Back to us','Picked up at the end and wiped.')])),
  BORO,
  sec('more','Related','More on computers.',chips([('/networks','Networks &amp; computers service'),('/event-wifi-rental-nyc','Event Wi-Fi in NYC'),('/tv-rental-nyc','TV &amp; screen rental in NYC')])),
  sec('nyc','In New York','Also for rent.',nyc('computer-rental-nyc','event-wifi-rental-nyc','tv-rental-nyc','av-rental-nyc'))],
 [('What computers do you rent?','Show computers for playback and presentations, and high-end workstations for real-time 3D, TouchDesigner and video work.'),
  ('Do you set the computers up?','Yes. We configure them for your software before delivery and connect them on site.'),
  ('Can I buy a workstation instead?','Yes. We build and sell custom PCs and workstations configured for your work.'),
  ('Do you rent computers for exhibitions?','Yes. Playback and interactive machines for exhibitions, galleries and installs, set to start on their own each day.')])

# ---------- 12. Experiential production ----------
page('experiential-production-nyc','Experiential Production & Interactive Experiences NYC | Possible AV',
 'Experiential production in New York City: interactive installations, immersive projection, fabrication and the AV to run them, built in Brooklyn.',
 'Experiential production · New York City','Experiential production<br>in NYC, built in Brooklyn.',
 'Interactive installations, immersive projection, pop-up builds and the technology behind them, for brands, museums and events across New York. Designed, built and tested in Brooklyn, then installed and run by our crew.',
 [('interactive-floor.jpg','An interactive projected floor'),('interactive-ex-exhibit.jpg','An interactive exhibit in a gallery'),('fabrication-ex-popup.jpg','A fabricated pop-up shop unit')],
 [sec('what','What we make','Experiences <span>people step into.</span>',
   incl([('Interactive','Floors, walls and screens built in TouchDesigner, with sensors and body tracking'),('Immersive','Projection mapping and spatial audio across whole spaces'),('Fabrication','Sets, pop-up units, props and large-format 3D printing'),('Run','Installed, tested and run on site by our crew')])),
  sec('for','Who it is for','Brands, museums <span>and events.</span>',
   ways([('Brands','Activations and launches','A hero piece people walk up to, photograph and share.'),('Retail','Pop-ups and windows','Units and windows that arrive finished, with the tech built in.'),('Culture','Exhibitions and galleries','Immersive and interactive pieces that run every day.'),('Events','Parties and conferences','A moment in the program that people remember.')])),
  BORO,
  sec('more','Related','Services behind <span>the experience.</span>',sv('interactive','projection','fabrication','audio','displays')),
  sec('nyc','In New York','More ways to book.',nyc('experiential-production-nyc','event-production-company-nyc','projector-rental-nyc','audio-visual-company-nyc'))],
 [('What is experiential production?','Building the physical experience: the interactive pieces, the set, the projection and sound, and the crew that installs and runs it.'),
  ('Do you design the experience or build what an agency designed?','Both. Some projects come with creative direction from an agency or studio; on others we take it from the first sketch.'),
  ('Can people interact with the piece?','Yes. We build interactive floors, walls and screens with sensors, body tracking and RFID or NFC triggers.'),
  ('Can it be tested before the event?','Yes. Pieces are built and tested in Brooklyn before they are installed.'),
  ('Can the experience travel?','Yes. The same build and crew can go to several cities. See <a href="/touring-av">touring</a>.')])

# ---------- write ----------
out={}
for k,p in P.items():
    secs=[strip(*p['imgs'])]+p['secs']+[sec('qa','Questions','%s, briefly.'%L[k],faq(p['qa']))]
    body=NAV+'\n\n<main>\n'+hero(p['eb'],p['h1'],p['sub'])+'\n'+'\n'.join(secs)+'\n'+Q+'\n</main>\n\n'+FOOT
    open(R+'port/%s.body.html'%k,'w').write(body)
    h='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="../page.css"></head><body>\n%s\n<script src="../page.ui.js"></script></body></html>'%body
    open(W+'ref/%s.html'%k,'w').write(h)
    strip_tags=lambda t: re.sub(r'<[^>]+>','',t).replace('&amp;','&')
    out[k]=dict(title=p['title'],desc=p['desc'],faq={"@context":"https://schema.org","@type":"FAQPage","@id":"https://possibleav.com/%s#faq"%k,"mainEntity":[{"@type":"Question","name":strip_tags(q),"acceptedAnswer":{"@type":"Answer","text":strip_tags(a)}} for q,a in p['qa']]})
json.dump(out,open(R+'pages/landing.json','w'),ensure_ascii=False,indent=1)
print('ok',len(P),[ (k,len(p['title']),len(p['desc'])) for k,p in P.items()])
