# Possible AV redesign — plan from 33 reference sites (2026-11-13)

Sources: teardown files A–L + 00-my-notes in this folder (Fontsight, Vendredi, Resflow, VS Goods, Aren, Subframe, Imogen, Pendictive, Krea 3, MotionSites, MeltKit, Planes, Inflight, UXfolio, Jana Sundar, AskAiRank, Harish, Authier, Motion Grid, By Association Only, Pryzm, Bridge, Dappled, Palette, TypeSafe, Kosinov, Lué, juanmnl, Raul Brito, YOIN, Loaf, Piszczek, Longitude, Basement, Butter).

## The one idea
The whole site is **a show running on a control console**. Every reference that works commits to one world from top to bottom (Dappled = a walk, TypeSafe = an OS, Basement = a room). For an AV company the world is the console / the show call: dark field, things light up when they come on, sections are channels, the process is a cue sequence. This replaces both earlier attempts (gallery-chrome copy and reskinned old layout).

## Recurring patterns (how many sites used them)
- One accent colour on near-black, everything else from media — Basement, Raul, Piszczek, Planes, Pryzm, BAO, Longitude, Loaf, Motion Grid, Bridge, YOIN (11)
- Mono labels/eyebrows as metadata — Aren, AskAiRank, Piszczek, Pryzm, TypeSafe, Planes, Lué, Butter, Dappled (9)
- Sticky stacking cards for services/models — Raul, UXfolio, Vendredi, Basement (4)
- Giant wordmark footer — Krea, Planes, MeltKit, Subframe, Basement, Bridge, Raul ("let's talk"), Fontsight (8)
- Signal-flow / node graph as explainer — Raul (hero), Pryzm, Authier, Dappled (4) → literally an AV signal chain
- Stats strip with hairline dividers — Piszczek, Pendictive, Krea (3)
- Word-by-word scroll reveal — Vendredi, Raul, Lué, Motion Grid, Subframe, Butter (6)
- Hairline capability matrix — Pendictive 4×4, Piszczek 12 tiles, Aren 3×2, Harish (4)
- Persistent conversion element — Krea bottom section-nav pill, Longitude fixed "Start a project", Lué sticky CTA (3)
- Project page = sticky spec sidebar + gallery — Basement; spec panels + chips — Piszczek; meta header — Longitude

## Design system
- **Ground:** #0A0A0B; raised #111113 / #18181B; hairlines rgba(237,237,232,.10); film grain overlay 3%.
- **Text:** #EDEDE8 / #A1A19A / #6E6E68 (three tiers, YOIN/Raul).
- **One accent = "on-air amber" #FFB224** (tally light). Only for: lit words, live dots, active states, primary button, numbers. Everything else colourless; colour comes from show photos.
- **Type:** Geist 600 display, tracking −0.045em, line-height 0.92 (Basement/Raul/Planes); Geist 400 body 17px; Geist Mono 12px uppercase +0.08em for labels, channel numbers, specs.
- **Shape:** 20px radius cards, 999px pills, 1px hairlines; rounded inset media frames (Vendredi/Longitude).
- **Motion:** CSS/IntersectionObserver only (Webflow-portable): word light-up, story-bar media, signal pulse along wires, sticky stack, marquee. Respect reduced motion. No preloader, no WebGL.

## Homepage, top to bottom
0. **Top bar** — wordmark · centre live "BROOKLYN, NY · 21:48 ET" clock (Lué) · Work / Services / Touring / About · amber "Request a quote" pill. Header blurs on scroll.
1. **Hero "lit from the dark"** (juanmnl + Lué + Longitude): H1 "Event & installation AV in New York" where words light up amber one by one like fixtures; behind/under it an inset rounded media frame cycling 5 real show photos with story progress bars; event-type pills (Loaf): Brand activations · Corporate · Museums · Retail · Trade shows · Touring.
2. **Stats strip** (Piszczek/Pendictive): 50+ projects · 15+ cities · NYC home base · One crew, design to strike (only figures already on the site).
3. **Signal flow — "How the room is wired"** (Raul/Pryzm/Authier): SOURCES (playback, cameras, mics) → PROCESSING (switching, media server, DSP, network) → OUTPUTS (projection, displays, PA, stream, interactive); thin wires with node dots and an amber pulse travelling along them; each output node links to its service page; ledwall.nyc node for LED walls *with WLAB link*.
4. **Selected work** (Loaf/Longitude + Piszczek): staggered reel of 4 projects, captions always visible: mono meta "NEW YORK · AV SYSTEMS · PROJECTION · AUDIO", 2-line title, inset 3-stat spec strip from the CMS facts (e.g. "3 cities · 36 hr install · 0 downtime"), "View project →".
5. **Services as channels** (Raul/UXfolio sticky stack): CH 01–06 cards (AV Systems, Projection, Audio, Network, Interactive, Experiential), each: channel number, two-tone title, one-line promise, spec chips, photo, link. Cards stack as you scroll.
6. **Show call — process** (Butter/Motion Grid auto-advancing + juanmnl 1/4 counter): STANDBY → GO: 01 Brief · 02 Design & pack · 03 Load-in & run · 04 Strike; left list with progress bar, right media.
7. **Capability matrix** (Pendictive/Piszczek): 4×3 hairline grid of concrete capabilities (projection mapping, edge blending, line-array PA, wireless/RF coordination, Dante audio networking, NDI video, show networks & Wi-Fi, media servers, interactive sensors, control systems, livestream feeds, permanent installs), hover lights the cell amber.
8. **Touring band** (Dappled/Kosinov): "Outside New York, the crew flies in with the gear." + city pills (only cities already claimed on the site) + link /touring-av.
9. **Sister studios** — ledwall.nyc + WLAB cards (rule: ledwall mention always with WLAB).
10. **FAQ** two-column (MeltKit/Pryzm): heading left, accordion right (real FAQ content from /faq).
11. **Close** — big "Tell us the room. We'll bring the system." + amber quote pill + email; **giant "Possible AV" wordmark footer** with 4-column index (Services / Company / Touring / Sister studios) and legal line.
Persistent: **bottom section-nav pill** (Krea) with scroll-spy: Work · Services · Process · Touring · [Request a quote].

## Inner pages (after homepage approval)
- **/work** (Basement): Grid / Rows toggle + filters by service; Rows = Project | Services | City | Year | View →.
- **/project/** (Basement + Piszczek + Longitude): sticky left spec sidebar (Client type, City, Year, Services, scope facts, narrative, more projects) + right gallery alternating 2-up / full-width + "What we ran" chip panel.
- **/service/** (Piszczek long-form): eyebrow pill → H1 → lede → spec table → H2s with mono kickers → FAQ → related work → quote CTA.

## Owner rules kept
No client names, no Navy Yard, no street address, no team intro; "Brooklyn, New York"; wlab@wlab.tech; ledwall.nyc always with WLAB; real figures only; NYC-first SEO titles/H1 kept.
