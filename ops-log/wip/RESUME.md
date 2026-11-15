# Resume here (paused 2026-11-15 03:35 ET)

Live prototype: artifact `218911a6-2058-422c-9113-fe52218f7b5c`, version `1794733115-d91a`, read=public
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
| projection, live-video, interactive, logistics | – | – | – | not started |

Brief for each page: AGENT_BRIEF.md. Test: `ft.sh <slot> <page> stops|cam|thumb|glance` (never pipe into tail/head).

## Plan agreed
1. Finish displays, lighting, fabrication, networks; review closely; add labelled example projects (FLORA $0.088/img); publish.
2. Build the new homepage film (mk_home.py) from the finished pages; then the remaining four pages.

## Notes for the next pages
- Space groups ~12 m apart (const DG=12), not S, so the next item slides in as the last leaves; make any line-up step aside (scale away) after the range shot.
- Wording: "space" / "project", never "room"; "venue" only in a list of place types.
