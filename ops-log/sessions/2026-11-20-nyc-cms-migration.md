# 2026-11-20 — NYC landing pages → CMS template (native styles)

## Owner requests (in order)
1. Keep converting the site from external CSS to Webflow-native styling; verify while working.
2. Convert the 15 NYC landing pages to one CMS collection under `/nyc/` (approved). URL change accepted; **no 301 redirects** (owner can add them later).
3. Migrate one page first and show it → approved ("好的") → migrate the rest with parallel sub-agents.
4. event-production-company: put NYC in the H1.

## What was built
**Collections**
- `NYC Pages` `6b00cac53ad9cb39f6e9d34d` (slug `nyc` → URLs `/nyc/<slug>`). Single-value fields: SEO title/description, eyebrow, H1 (newline = line break), sub, CTA2 text/link, 3 images, per-section eyebrow / heading / heading-muted / lead, `has-b2/b3/related/svc` switches, quote eyebrow/heading/lead, `schema-json` (page JSON-LD).
- Repeating items live in `NYC Blocks` `6b00cac6053f1ddc0af1d8c1` (label, title, text, text-rich, link, plus page/section/order for organisation).
- One **multi-reference field per section** on NYC Pages: `blocks` (A list), `b-items`, `b2-items`, `b3-items`, `c-items`, `related-items`, `also-items`, `svc-items`, `faq-items`. (The API can't filter a list by "current item", and filters on a multi-ref-sourced list fail, so each list sources its own field; order = reference order.)

**Template** `NYC Pages Template` page `6b00cac63ad9cb39f6e9d37d`
- NX Nav + `main` (hero, image strip, sections A, B, B2, B3, C, Related, Also, Svc, FAQ, Quote) + NX Footer.
- 33 new native classes, all `nx-` prefixed (`nx-hero`, `nx-sec` + `is-first`/`is-end`, `nx-h2`, `nx-h2-muted`, `nx-incl`, `nx-way*`, `nx-chip*`, `nx-faq*`, `nx-btn`, `nx-ghost` …). Breakpoint: old 900px rules → Webflow `medium` (≤991), 520px → `tiny`.
- h2 = DOM `h2` with two bound DOM spans (main + muted); empty bound text gets `w-dyn-bind-empty` and disappears.
- Optional sections bound to the `has-*` switches. Collection empty states hidden (removing a DynamoEmpty deletes the whole list — don't).
- Strip images `loading="eager"` (above the fold).
- Head code: legacy cleanup script, Geist fonts, old `page.css` (still needed by nav/footer responsive rules), a small residual `<style>` (FAQ +/– marker, open state, FAQ link underline, ≤991 first-row border on the A list), and JSON-LD via `<template id="nx-ld">{{schema-json}}</template>` + a script that copies it into an `application/ld+json` tag (a CMS token placed directly in a script tag is HTML-escaped and breaks the JSON).
- SEO title/description bound to `seo-title` / `meta-description`.
- `NYC Blocks Template` (`6b00cac6053f1ddc0af1d8ea`) can't be drafted → `noindex,nofollow` in its head.

**Items**: 15 pages, all slugs = old slug minus `-nyc`. Tooling + source data in `ops-log/wip/native/nyc/` (`build_item.py`, `pages/*.json`, `ld/*.json`, `images.json`, `cmp_all.js`). Internal links and JSON-LD URLs to the 15 old pages rewritten to `/nyc/…`.
- FAQ answers with inline links (7) use `text-rich` instead of `text`.
- event-production-company H1: "An event production company / with everything in house." → "An NYC event production company / with everything in house."

**Links updated to /nyc/** (staged, not live until publish): nav Rentals + footer AV rental (components), /audio-visual-company-nyc (6 chips), /rental-terms (6 links), 7 blog posts (18 links in `body`). Industries / Work / Services CMS had none.

## Gotchas
- `create_collection_items` re-hosts CMS images as new assets (alt kept).
- Bindings can't be set at element creation inside a new parent; create, then `set_settings`.
- Collection list source format: `{"collectionId": <referenced collection>, "fieldSlug": "<multi-ref slug>"}`; sort direction is `ascending`/`descending`; option filters use `equals`.
- Plain-text newline renders as a literal `\n`; `white-space: pre-line` on `nx-h1` turns it into the old `<br>`.
- Old link elements sometimes have a stale `href` attribute; the real target is `settings.link.href`.

## Verification
- Sound page first: computed styles of ~40 elements diffed old vs new at 1440 / 768 / 375 → 0 differences; text, alts identical; JSON-LD parses; FAQ toggles.
- All 15 pages: same-origin iframe diff (`cmp_all.js`) on possibleav.webflow.io, old `/<x>-nyc` vs new `/nyc/<x>` at 1440/768/375 — results below.
- **Result:** 15 pages × 3 widths = 45 comparisons, all identical (computed styles of every role, section heights, total page height, section text) except the intended event-production-company H1 wording. Only noise: `h1 white-space` (pre-line vs `<br>`) and `li display` (collection items are divs).
- All 44 unique internal links on the 15 new pages return 200 on staging; JSON-LD parses and uses `/nyc/` URLs on all 15.
- Sitemap crawl of staging (91 URLs, 15 under `/nyc/`): no page links to any old `-nyc` URL any more.

## State at end of session
- Everything is published to **possibleav.webflow.io only**. possibleav.com still serves the old pages.
- The 15 old static pages are set to **draft** (staged) — they disappear (404, no redirects, owner's choice) at the next custom-domain publish, together with the `/nyc/` pages, nav/footer/blog link changes going live.
- **Next:** owner approval → full-site publish to possibleav.com + www → live check of all 15 `/nyc/` URLs and that old URLs 404.
