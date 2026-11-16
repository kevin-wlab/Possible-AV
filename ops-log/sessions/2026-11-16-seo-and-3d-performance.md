# 2026-11-16 — SEO pass, address, 3D performance (homepage), Wednesday plan

## Owner requests, in order
1. Evaluate the site's SEO across its business lines, then optimize.
2. Fix the sitemap.
3. Business address on the site: 63 Flushing Ave, Brooklyn, NY 11205.
4. Remove "Crews travel." from the footer.
5. Schedule for Wed 2026-11-18 05:00 ET: move the homepage Displays station away from Fabrication, skip-animation ("go down") buttons on Home and the nine service pages, back-to-top buttons, mobile fit.
6. Low-performance switch at 5 s instead of 6 s (now); a less bare lite version (Wednesday).
7. Find out why the 3D lags on many devices, then fix it now.
8. Service-page performance changes stopped mid-way: do them Wednesday. Homepage changes stay.

## Changes
### SEO (published)
- 23 page titles (≤60 chars) and descriptions (≤160) rewritten and de-duplicated; service hubs are service-focused, `/xxx-rental-nyc` pages rental-focused.
- Service + FAQPage + BreadcrumbList JSON-LD on displays, projection, audio, lighting, live-video, networks, fabrication, logistics; Service + Breadcrumb on touring. FAQ text mirrors the visible `details/summary`.
- Real 301s (dashboard, Hosting → Redirects): `/service/audio`→`/audio`, `/service/projection`→`/projection`, `/service/network`→`/networks`, `/service/interactive-experience`→`/interactive`, `/service/experiential`→`/experiential-production-nyc`, `/service/av-systems`→`/services`.
- Default domain = `possibleav.com` (www 301s to apex); Global canonical URL = `https://possibleav.com`.
- Sitemap: service CMS items and `/contact` excluded; "use global canonical URL for sitemap entries" on. Live sitemap: 71 URLs, all apex.
- `/contact` and the service template: `<meta name="robots" content="noindex, follow">`.
- Google site verification field held the full `google-site-verification=…` string; now the bare ID.
- LocalBusiness JSON-LD (site head) has a PostalAddress: 63 Flushing Ave, Brooklyn, NY 11205, US.
- NX Footer (`fcf0ee38-0d76-5cd2-c260-debfab4e501c`) address string (`…e5024`) = "63 Flushing Ave, Brooklyn, NY 11205"; "Crews travel." removed.

### Homepage 3D performance (live, commit `0ef7cda`, branch `kevin/perf-3d`)
Diagnosis on an M2 Pro before: ~40 fps with ~450 ms stalls; 6,385 draw calls / 4.2M triangles per frame, of which the shadow pass was 4,079 calls / 2.8M triangles (4096² PCFSoft, updated every frame); 2,445 meshes; plant pots 57k tris each ×9; sheen chairs 23.5k ×10; DPR-2 canvas with MSAA.

`web/studio.js` changes:
- Render scale capped at 1.5× (tiers 1.5 / 1.15 / 1); MSAA only on ≤1.25× screens.
- Shadow map 2048 (1024 under 800 px wide), `autoUpdate=false`, refreshed every 3 / 6 / 12 frames by tier.
- Quality governor in `frame()`: EMA frame time > 24 ms steps down a tier.
- Pot (>30k tris) rebuilt as a lathe of its outline (~1.6k tris); MeshPhysical → MeshStandard (cached).
- Skinned crew frustum-culled with enlarged bounds.
- `bakeStatic()`: after all models load (+600 ms), merges static opaque meshes per material and 10 m cell (189 merged groups; originals hidden). Skipped with `#nobake`. `window.__pavPerf` reports counts.
- Includes the chip-rail `stopPropagation` fix.

After: steady 60 fps, worst frame 17.7 ms; overview ~930 screen + ~170 shadow draw calls. Visual compare at stops 4 and 8 identical.

Homepage footer: the lite timeout is now 5 s (inline `setTimeout(…__pavGoLite('timeout')…,5000)` after `studio.ui.js`).

### Service pages (reverted)
- Commit `0ef7cda` also has a first pass for the nine service pages (1.5× cap, MSAA off on hi-DPI, shadows every other frame, governor). /audio measured 831 → 413 shadow draw calls.
- Published briefly, then reverted at the owner's request: eight pages back on `bf8daa0`, /interactive on `e8b7660`. Verified live after publish.
- /interactive on the new commit showed an empty 3D stage; on the old commit it renders. Cause not found yet — check before reshipping.

## Gotchas
- Webflow publish limit: once per minute (429 otherwise).
- Redirects API needs Enterprise; use the dashboard.
- Test a commit without publishing: fetch the page HTML, replace `possible-av@<hash>`, `document.open/write`.
- Draw-call measurement: wrap `WebGL2RenderingContext.prototype.draw*`, track `bindFramebuffer` (non-null target = shadow pass).

## Scheduled
- Wed 2026-11-18 05:00 ET task: Displays spacing, skip / back-to-top buttons, better lite versions (Home + service pages, 5 s), mobile, and the service-page performance pass on top of `kevin/perf-3d`.

## Verification
- Live HTML references: Home `0ef7cda`; displays/projection/audio/lighting/live-video/networks/fabrication/logistics `bf8daa0`; interactive `e8b7660`.
- /interactive renders its 3D on `e8b7660` (screenshot).
