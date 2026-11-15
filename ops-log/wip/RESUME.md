# Resume here

## FIRST (owner, 2026-11-15 04:31): the redesign goes LIVE on Webflow, not just the prototype
The owner is redoing the whole site; the new design is what should be on possibleav.com. Before more service pages:
1. Rebuild /get-a-quote (Webflow page `6af97b78d8e68fc36722099d`, live since 04:30 in the OLD style) in the NEW design, keeping the native Webflow form (form name "Possible AV Project Inquiry", fields Name, Email, Company, Event Type="What do you need?", Location and Date="Where and when", Budget Range, Message). Use data_whtml_builder with the prototype's CSS tokens (bg #ECE9E3, ink #1A1A18, amber #E8892D, Geist/Geist Mono) and the frosted nav.
2. Port the finished prototype pages into Webflow (staging first, then publish): Home (studio 3D homepage or the product-film one), Services, Audio, Displays, Projection. 3D: page-level custom code / HTML embed loading three.js from cdn.jsdelivr.net with the models inlined; images uploaded as Webflow assets.
3. Site-wide: footer still says "WLAB ↗" / "WLAB Virtual Production ↗" and the old Contact page mentions WLAB; remove (owner rule: no WLAB on Possible AV). Contact email wlab@wlab.tech stays.
Then continue the remaining service pages one at a time.


Live prototype: artifact `218911a6-2058-422c-9113-fe52218f7b5c`, version `1794735156-3c81`, read=public
(republish with shared_live "public", artifact_title "Possible AV — homepage prototype: the studio").
Live pages: index.html (3D studio homepage), services.html, audio.html. Release build: `python3 mk2.py --live audio[,key…]`.

## Done and live
- Solutions rows link to real targets; homepage card links go to services.html#<key> / audio.html; quote buttons → #quote.
- Process step lines fixed (rule on each li).
- "room" → venue / space / event everywhere (rule also in AGENT_BRIEF.md and ops-log/CONTEXT.md to add).

## Service pages: stopped mid-way, files kept (src/film/…)
| page | model | page module | body copy | state |
|---|---|---|---|---|
| displays | done | done | done | **LIVE** (v12, 4 example projects) |
| lighting | 45 KB | started | partial | needs finish |
| fabrication | 45 KB | started | written | needs finish + review |
| networks | 49 KB | – | – | model only |
| projection | done | done | done | **LIVE** (v13.1: panels mapping + object mapping) |
| live-video, interactive, logistics | – | – | – | not started |

Brief for each page: AGENT_BRIEF.md. Test: `ft.sh <slot> <page> stops|cam|thumb|glance` (never pipe into tail/head).

## Plan agreed
1. Finish displays, lighting, fabrication, networks; review closely; add labelled example projects (FLORA $0.088/img); publish.
2. Build the new homepage film (mk_home.py) from the finished pages; then the remaining four pages.

## Notes for the next pages
- Space groups ~12 m apart (const DG=12), not S, so the next item slides in as the last leaves; make any line-up step aside (scale away) after the range shot.
- Wording: "space" / "project", never "room"; "venue" only in a list of place types.
- Owner facts (2026-11-15): Epson laser projectors at 7,000 lumens; projection use cases include immersive exhibitions; projectors hung from ceiling/truss mapping one picture across screens of different sizes (owner project reference); turnkey/all in-house is a main selling point.
