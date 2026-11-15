# Session log — 2026-11-13 — SEO audit + rule cleanup

Owner asked to run the same audit used on ledwall.nyc on Possible AV ("用同样逻辑看一下 possible av"). Client and agency names are left out of this public file on purpose.

## Audit (live possibleav.com, before changes)
- 41 sitemap URLs, all 200.
- **30 CMS pages** (services, industries, case studies, blog posts) rendered the title "Possible AV" with no meta description: the 4 CMS templates had no SEO binding, although every item already had `meta-title` / `meta-description` filled.
- **3 broken links** on `/service/experiential` to the hidden case-study slugs (old slugs contained client names); the FAQ named four clients.
- **Navy Yard** still on the 5 industry pages (static eyebrow on the Industries template) and in the AV Systems + Experiential service items.
- **Client names**: Home had a name marquee (6 brands/agencies/venues); the Museums industry `cases` field named two venues; Brand Activation `cases` named an agency.
- Over-length: `/industries` title 65; descriptions on `/` 177, `/services` 163, `/touring-av` 162; 3 CMS meta titles 64–67.
- **No canonical tag**, and both `possibleav.com` and `www.possibleav.com` serve the full site (no redirect) — duplicate hosts.

## Changes (site `6a34a7893bca7b2b60e5eac7`)
- **Template SEO binding** (same `{{wf {"path":"meta-title"...} }}` format as the ledwall.nyc blog template), OG copies SEO: Services template `6a34e9e6383e05c75c473484`, Industries `6a34e9e6f829ac7e5e3ace87`, Work `6a34e9e8f829ac7e5e3ad13e`, Posts `6a34e9e8383e05c75c473534`.
- **Services CMS** (`6a34e9e5383e05c75c473474`): Experiential `6af3d192f5d39050cbce0a17` — intro + FAQ: Navy Yard → Brooklyn; client FAQ answer replaced with a generic line linking `/project/la-secret-show-led-wall`, `/work`, `/touring-av`. AV Systems `6a34ea7bceef631e24b40d90` — FAQ: Navy Yard → "a Brooklyn, New York company" + link to `/touring-av`. Item-published.
- **Industries template** eyebrow `0f02a173-016f-1b12-eff0-9ba09854b174` → "Brooklyn, New York · deployed anywhere".
- **Industries CMS** (`6a34e9e6f829ac7e5e3ace11`): Brand Activation `6a34eadb206247d3c7bd34cd` — `cases` → generic, meta-title shortened; Museums `6a34eadb206247d3c7bd34d1` — `cases` → generic. Item-published.
- **Posts CMS**: meta-title shortened on `6af4219e8f192bed004b87ab` (wireless mics) and `6a34eafe7ce95e3a7c2c5c1f` (projector vs LED). Item-published.
- **Home**: removed the client-name marquee section `e268e5fe-bf5f-9d97-f5ba-f02e7cbcd4a3` (`pa-sec--tight pa-sec--dark` > `pa-marq`).
- **Static SEO**: `/industries` title → "Event, Retail, Museum & Trade Show AV in NYC | Possible AV"; descriptions trimmed under 155 on Home, Services, Touring.

## Verification (staging possibleav.webflow.io, 3 staging publishes)
- 41 URLs all 200, 0 broken internal links, 0 Navy Yard, 0 known client names in visible text, 0 generic "Possible AV" titles, 0 titles >62, 0 descriptions >160.
- Remaining name: LA cover **image filename** (known open item, owner kept the photo).
- CMS item publishes are already live; the template bindings, Home marquee removal and static SEO trims wait for a custom-domain publish (owner approval per CLAUDE.md).

## Live publish (owner: "发布", 2026-11-13 ~21:06 ET)
- Full-site publish to www.possibleav.com + possibleav.com (task `2c18b7e3-147e-40f9-8d30-b254eb0c8ab8`).
- Live crawl: 41 URLs all 200, 0 broken, 0 Navy Yard, 0 client names in visible text, 0 generic titles, 0 over-length titles/descriptions.

## Gotchas
- A staging publish can lag: static-page edits didn't show ~45s after the second publish; the third publish + cache-busted fetch showed them.
- Template SEO binding works via `bulk_update_pages` — no Designer needed.

## Open (owner)
- Webflow dashboard: set **www.possibleav.com as default domain** (apex then 301s) and **Global canonical URL** `https://www.possibleav.com` (Site settings → SEO). Not available via API.
- Thin pages still: case studies ~110–170 words, `/industries` ~140, `/services` ~180, About/Contact/Touring have the image placeholder.
- No GBP, no Search Console, no analytics tag (`googleTagIds` empty).

## Homepage redesign (curated.design direction) — live 2026-11-13 ~21:25 ET
- Owner: "学习这个网站设计 (https://curated.design/)，重新设计 possibleav" → design canvas https://claude.ai/artifact/QcLNYnUWAqd3YkLcfG7ReG → owner: "上线看看".
- Home `6a34a78c3bca7b2b60e5eae5`: inserted `.cv-page` `b765a958-8026-0457-e2a2-f0144561b14d` after the nav via `data_whtml_builder` (hero with pill badge + brief bar → /contact, industry chips → industry pages, 6-card work grid with existing FLORA covers as CSS backgrounds `cv-ph-1..6`, services, process, touring panel + stats, ledwall.nyc/WLAB cards, CTA). Removed the 8 old sections (pa-hero … final CTA). Nav and footer unchanged.
- Page head code: Inter + JetBrains Mono (Google Fonts), `body{background:#000}`.
- Style: black ground, Inter 500 tight-tracked headings, #949494 secondary, white pill CTA, #171717 chips, 28px radius cards. All classes `cv-*`.
- LA card uses the generic hero image, not the LA cover (its filename contains names).
- Live check: one H1, title unchanged, all home links 200, no Navy Yard.

### Gotchas
- whtml CSS: media queries must be exactly `screen and (max-width: 991px|767px|479px)`; no descendant selectors (`.a:hover .b` refused).
- A second whtml call that reuses an existing class name can create a duplicate (`cv-sec-1`, unstyled) — check for `-1` classes and `set_style` back.
- Fonts in whtml CSS warn "missing_font"; load them via page head code.

### Open
- Nav (mono caps, orange button) and other pages still use the old console style; restyle site-wide once the owner sends the extra business scope.
