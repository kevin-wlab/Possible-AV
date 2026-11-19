# 2026-11-19 — Homepage below-the-3D sections moved to native Webflow classes (test page)

## Owner requests (in order)
1. Why do the new P1 pages have no layout / old design? → page custom code (head/footer) is NOT copied by `create_page duplicateOf`. Fixed by copying the template's head + footer code to the 5 pages and republishing.
2. "Why custom code? I asked to move to Webflow native as much as possible." → agreed to migrate.
3. "先换首页" — start with the homepage. "记得边做边查" — verify while working.

## Approach
- Work on a duplicate: page `home-native-draft` (ID 6aff70fd4e4c46c1bd66a4f6), noindex, out of the sitemap, SEO title "Home native test (noindex)".
- Scope: the 9 `section.next` blocks below the 3D floor (#services, #turnkey, #industries, #solutions, #ways, #process, #also, #faq, #quote). The 3D floor, nav, footer, lite mode, JS states, pseudo-elements and keyframes stay in external CSS.
- Each element keeps its original classes; an `hn-*` combo class (or a plain `hn-*` class on elements that had none) carries the native styles. So residual CSS and JS hooks keep working.
- Tooling in `ops-log/wip/native/`: `migrate.py` (parse studio.css, match rules to the element tree, cascade per breakpoint/hover, group into classes, write plan.json + residual.css) and `actions.py` (turn the plan into Webflow style + set_style actions).
- Breakpoints: CSS 900 → medium (≤991), 760 → small, 520 → tiny. The `max-width:1200px` rule has no Webflow equivalent, so for `.grid`, `.steps`, `.ways` the base holds the ≤1200 values and the `large` breakpoint (≥1280) holds the wide values. Only 1201–1279px differs from the old site (3 columns instead of 5).

## Changes
- 49 `hn-*` classes created (site-global; only used on the test page). 269 elements got class assignments.
- `web/studio-residual.css` (18 KB, was 22 KB) committed on branch `kevin/home-native` at 0f481ee; test page head loads it from jsDelivr instead of studio.css. Footer code unchanged (studio.ui.js@87cadf2 + lite timeout).
- Site published twice (owner approved the publish for the test page).

## Verification
- API: all 269 planned class assignments read back from get_all_elements, 0 mismatches.
- Browser: computed styles (30 properties) + box sizes of every element in `section.next`, test page vs live homepage, at 1280 / 1100 / 768 / 390: **0 differences** at all four after the 1200px fix (first pass at 768 showed `.steps` row-gap 36 vs 30).
- Screenshots at 1280: 3D floor loads (`__pavReady` true), services grid matches.

## Gotchas
- `duplicateOf` does not copy page head/footer custom code.
- Publishing takes ~20–30 s before the new `webflow.shared.*.css` is served; re-check after that.
- update_style results only echo the breakpoint touched.

## Next
- Owner OK → swap into the real homepage: apply the same class assignments to homepage 6a34a78c3bca7b2b60e5eae5 (element IDs are the same as on the duplicate), switch its head CSS to studio-residual.css, publish, re-run the diff. Then delete the test page.
- Then the other page templates (page.css pages) the same way.
