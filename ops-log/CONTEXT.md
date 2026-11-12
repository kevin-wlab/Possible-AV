# CONTEXT — Possible AV

Last updated: 2026-11-12 (positioning, address, client-name and Touring rules added from the NYC SEO / Touring sessions). Rules below were set by the owner.

## Where things live
- **Live site:** Webflow site **Possible AV** `6a34a7893bca7b2b60e5eac7` → `possibleav.com`, `www.possibleav.com`.
- **This repo:** original React/Vite prototype (`src/`, data in `src/data/*`) + `ops-log/`.
- **Sister sites (same Webflow workspace):** ledwall.nyc (`LED Wall` `6a2cd60ebc4f022611e7ff75`), WLAB (`WLab` `6af3bc0e06a985ae036fb21b`).
- **Key Webflow IDs:**
  - Pages: Home `6a34a78c3bca7b2b60e5eae5`, Services `6a34f354a49eba40de650fca`, Industries `6a34f3b99c1be9130cf3fded`, Work `6a34f3ba57b83eec23383965`, Blog `6a34f3bc44d27a821e001a14`, About `6a34f3bdbee39509ab20e532`, Contact `6a34f3be5b5b4820028975eb`, Pricing `6a362c70161ad75e9e266882`, FAQ `6a362c72491d6977ea71846c`, **Touring & Out-of-Town AV `6af5488a42e3ba43c291bc3f` (`/touring-av`, added 2026-11-12)**.
  - CMS template pages: post `6a34e9e8383e05c75c473534`, project `6a34e9e8f829ac7e5e3ad13e`, industry `6a34e9e6f829ac7e5e3ace87`, service `6a34e9e6383e05c75c473484`.
  - Work CMS collection: `6a34e9e7f829ac7e5e3acee3` (URLs `/project/<slug>`).
- **Nav and footer are hand-built on every page, not a shared component.** A nav or footer change has to be made on all 9 static pages plus the Touring page and the 4 CMS templates.
- **Structured data:** a site-wide `LocalBusiness` JSON-LD block lives in the site head custom code (Brooklyn, NY; areaServed = NYC boroughs, Jersey City, Long Island, United States; parentOrganization WLAB Innovations Inc.).

## Design
- The site family (ledwall.nyc → Possible AV → WLAB) shares copywriting style and per-page section layout, but **each site has its own visual style**.
- Possible AV direction: **lit dark "console" look** — the approved version sits between the two earlier glow versions, slightly brightened, applied to all pages. Rejected: a matte glow-free restyle (worse) and an earlier palette that looked too "AI-generated". Avoid large blocks of flat solid color.
- Photos are generated with FLORA. Site content is placeholder for now; the owner will replace it.

## Positioning and copy rules
- NYC is the main focus: page titles, H1s and descriptions target New York / NYC searches. A separate **Touring & Out-of-Town AV** page (`/touring-av`) covers jobs where the crew flies to other cities. It has its own nav item placed right after "Work" on every page, and Home, About and Services each carry a one-line link to it.
- Describe the company as **a Brooklyn, New York company** ("Brooklyn, New York" / "Brooklyn, NY"). Do not mention the Brooklyn Navy Yard, and **don't publish a street address**, on the site or in the schema. (On 2026-11-11 the full street address was briefly put on Contact and in the JSON-LD; removed 2026-11-12.)
- **Do not name clients** anywhere on the site. This includes artists, agencies and collaborators in case-study copy, image alt text and URL slugs. Use generic labels ("Beauty brand", "Spirits brand"). When the owner wants a case study gone, hide it (unpublish + archive the CMS item, remove its static card on `/work`) rather than rewriting it.
- **Don't introduce the team** on the site.
- Contact email: **wlab@wlab.tech** (replaced hello@possibleav.com).
- **Experiential** lives on Possible AV (moved from the WLAB site), along with the experiential projects moved over from WLAB.
- Include a friendly link to WLAB. **Every mention of ledwall.nyc must also mention and link WLAB** — a footer link alone isn't enough.
- Links between sister sites must use the **real domains**, never `*.webflow.io`.
- Keep the sitemap complete when pages are added.
