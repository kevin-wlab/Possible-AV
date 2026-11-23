# 2026-11-20 — All remaining pages moved to native Webflow classes (staged)

## Owner request
"先转完" — finish converting every remaining page from external CSS to Webflow-native classes before anything else.

## What was done (staging = possibleav.webflow.io only; possibleav.com not published yet)
Same method as the homepage (sessions/2026-11-19-home-native-migration.md): `migrate.py` matches the page stylesheet to the element tree, cascades per breakpoint/hover, groups into classes; each element keeps its old classes and gets a native combo class on top; what Webflow can't express stays as an inline `<style id="nx-residual">` in the page head (replacing the jsDelivr `<link>`). Done by 5 parallel sub-agents, each verified with an in-page A/B (native vs old stylesheet).

| Pages | Prefix | Residual (inline) vs old CSS | A/B |
|---|---|---|---|
| /displays /projection /audio | nv-displays / nv-projection / nv-audio | ~29 KB vs 33 KB each | 0 diffs @1440/1100/768/390 |
| /lighting /fabrication /networks | nv-lighting / nv-fab / nv-networks | ~29 KB vs 33 KB | 0 |
| /live-video /interactive /logistics | nv-livevideo / nv-interactive / nv-logistics | ~29 KB vs 33 KB | 0 |
| /services /about /get-a-quote /contact | nv-services / nv-about / nv-quote / nv-contact | 4.8–6.9 KB vs 28–30 KB | 0 (also 700) |
| /industries /work /blog /pricing /faq /touring-av /audio-visual-company-nyc /rental-terms + Blog/Work/Industries/Services templates | shared `nv-pg` (84 classes, same style = same class across pages) | 3.5–5.8 KB vs 34 KB | 0 (Services template: structure only — /service/* 301s) |
| NYC Pages template | nx- (already native) | 3.4 KB vs 34 KB page.css | 0 @1440/768/390, menu open too |

- Film (3D) pages: only `section.next` is native; the 3D film/canvas/captions/index/rail, lite mode, keyframes, pseudo-elements, ≥1100px rules stay residual (that's why ~29 KB remains). Lite-mode image `url(img/…)` paths rewritten to absolute jsDelivr @c902b74 URLs.
- Homepage unchanged (still loads studio-residual.css from jsDelivr).
- Sitemap crawl of staging: 76 URLs all 200; none loads an external page stylesheet any more except the homepage.

## Known/accepted
- 901–991px shows the tablet layout (Webflow tablet = ≤991, old CSS = ≤900), as on the homepage.
- Hover states are kept in residual where a state rule touches the property; hovers aren't covered by the A/B.
- Nav/footer: base styles native since 2026-11-19; their responsive + open-menu rules stay residual on every page (the JS toggles `.nav.open`; moving the 900px switch to Webflow's 991 would change behaviour) — deliberately left.

## Tooling (ops-log/wip/native/)
migrate.py (+ opt-in flags: NX_PIN_WIDE, NX_BG_FULL, NX_LOCK_STATE, NX_KEEP_BP, NX_COMPONENTS, NX_RICH, NX_PIN_LONGHAND, 6th arg state classes), actions.py, abcheck2.js, prune_residual.py, savetree.py, pg-tools/ (cross-page nv-pg naming + prune), per-page artefacts in pages_native/<page>/ (tree, plan, residual, actions, head before/after).

## Gotchas
- Webflow write rate limit (~12–15 style writes) shared across agents; batch ~20 with 30–60 s waits.
- The shared browser pane has one tab per session; agents must use same-origin iframes for width checks.
- When a residual rule (`.next h2`) must stay for rich text, any native class it would outrank needs the specific rule kept too (`.end h2`).

## Next
- Owner OK → full-site publish to possibleav.com + www → live crawl (all 200, no external CSS) + spot A/B on a few pages.
- **Published** 2026-11-23 15:35 ET (owner: "发布"). Live: 76 URLs 200, no external page CSS except the homepage's studio-residual.css; spot A/B on /lighting, /services, /blog at 1440 = 0 diffs.
