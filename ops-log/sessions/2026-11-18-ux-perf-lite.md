# 2026-11-18 (00:00–01:30) — Buttons, Displays spacing, homepage lite redesign, service-page performance and lite

Done in a live session ahead of the 05:00 scheduled run, at the owner's request ("提前完成").

## Owner requests, in order
1. Home 3D was "blurry with jagged edges" after the first performance pass: find a balance (2026-11-17 evening).
2. Use spare credit to finish parts of the Wednesday plan early: skip / back-to-top buttons, Displays spacing, homepage lite redo, service-page performance, service-page lite.

## Changes
- **Home render quality** (`dcaabd1`): full 2x render on Retina, MSAA always on, shadows every 2 frames; governor starts 2.5 s after loading, steps down only after ~1.5 s of >26 ms frames, steps back up (max twice) on <14 ms frames. 60 fps at 2048×1536 on an M2 Pro.
- **Skip / Top buttons** (site footer custom code, `.pav-jump`): "Skip ↓" under the nav (top right) on pages with `#floor`, jumps to `#glance` or the next section; hidden in lite. "Top ↑" bottom right after the 3D section (or after 1.5 screens). Safe-area aware.
- **Displays moved inward** (`ca36714`): LAYOUT (-13.8, 5.0) → (-11.2, 2.2), ~10.6 m from Fabrication; the camera stop follows the bay.
- **Homepage lite redesign** (`87cadf2`): two-column hero with the studio still in a floating frame, "Walk the studio" divider, two-column station cards with images, dark closing card, scroll-in motion; single column under 900 px. Stills re-rendered with the new layout.
- **Copy**: two homepage lines that said what we "don't carry" rewritten positively (Webflow String elements on the home page).
- **Service-page performance** (`ce9e7d7`): on each page's previous live code, shadows refresh every 2nd frame (autoUpdate off) and the same patient governor; sharpness unchanged. /audio: 831 → ~330 shadow draws per frame.
- **Service-page lite** (all nine pages): each `<page>.ui.js` now decides lite (no WebGL, Save-Data, ≤2 GB, ≤2 cores, `?lite`, slow first frames, or not rendering after 5 s) and only then injects `<page>.js`, so three.js never downloads in lite. The page JS reports frames (`__pavTick`) and stops when lite. Lite layout in `<page>.css`, same design as the homepage lite; one still per stop (`web/img/<page>-lite-<n>.jpg`). Webflow page footers now hold only the ui script.

## Gotchas
- Headless render of the stills: serve the repo locally, point the importmap at a local three@0.160.0, open `web/ref/<page>.html#snap` (the camera snaps instead of easing; without it the slow software renderer lags a whole stop behind), override `navigator.hardwareConcurrency/deviceMemory` (the container has 2 cores and would trigger lite), and pick each stop from the active `.cap.on` rather than evenly spaced scroll positions. Hide `.back` and the nav, and mask the top-left corner before cropping.
- The "blank" /interactive frame is mid-transition between stops 12 m apart, not a bug.
- `document.write` previews: Webflow can reset the html class, so add `lite` by hand to preview.

## Verification
- Home: desktop 1280 and 375 px, normal and lite.
- Service pages (3D): all nine render on the new performance commit (desktop).
- Service-page lite: local headless check at 1280 and 375 px with `?lite` (no module script loaded, layout and stills correct).
