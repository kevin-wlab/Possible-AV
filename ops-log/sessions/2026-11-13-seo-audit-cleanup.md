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

## Gotchas
- A staging publish can lag: static-page edits didn't show ~45s after the second publish; the third publish + cache-busted fetch showed them.
- Template SEO binding works via `bulk_update_pages` — no Designer needed.

## Open (owner)
- Approve the custom-domain publish.
- Webflow dashboard: set **www.possibleav.com as default domain** (apex then 301s) and **Global canonical URL** `https://www.possibleav.com` (Site settings → SEO). Not available via API.
- Thin pages still: case studies ~110–170 words, `/industries` ~140, `/services` ~180, About/Contact/Touring have the image placeholder.
- No GBP, no Search Console, no analytics tag (`googleTagIds` empty).
