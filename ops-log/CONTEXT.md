# CONTEXT — Possible AV

Last updated: 2026-11-16 (address rule, domains, redirects). Earlier: 2026-11-15 (nav/footer components, structured data, NYC SEO pass). Earlier: 2026-11-12 (positioning, address, client-name and Touring rules added from the NYC SEO / Touring sessions). Rules below were set by the owner.

## Where things live
- **Live site:** Webflow site **Possible AV** `6a34a7893bca7b2b60e5eac7` → `possibleav.com`, `www.possibleav.com`.
- **This repo:** original React/Vite prototype (`src/`, data in `src/data/*`) + `ops-log/`.
- **Sister sites (same Webflow workspace):** ledwall.nyc (`LED Wall` `6a2cd60ebc4f022611e7ff75`), WLAB (`WLab` `6af3bc0e06a985ae036fb21b`).
- **Key Webflow IDs:**
  - Pages: Home `6a34a78c3bca7b2b60e5eae5`, Services `6a34f354a49eba40de650fca`, Industries `6a34f3b99c1be9130cf3fded`, Work `6a34f3ba57b83eec23383965`, Blog `6a34f3bc44d27a821e001a14`, About `6a34f3bdbee39509ab20e532`, Contact `6a34f3be5b5b4820028975eb`, Pricing `6a362c70161ad75e9e266882`, FAQ `6a362c72491d6977ea71846c`, **Touring & Out-of-Town AV `6af5488a42e3ba43c291bc3f` (`/touring-av`, added 2026-11-12)**.
  - CMS template pages: post `6a34e9e8383e05c75c473534`, project `6a34e9e8f829ac7e5e3ad13e`, industry `6a34e9e6f829ac7e5e3ace87`, service `6a34e9e6383e05c75c473484`.
  - Work CMS collection: `6a34e9e7f829ac7e5e3acee3` (URLs `/project/<slug>`).
- **Nav and footer are shared components (new design, 2026-11-15):** NX Nav `a415a5c0-3f98-ffd5-2742-9d64adf5e99c`, NX Footer `fcf0ee38-0d76-5cd2-c260-debfab4e501c`. One edit changes every page. Nav order: Home, Services, Solutions, Industries (/industries), Work, Touring, Blog, About. The Blog link must stay in the nav and footer.
- **Structured data:** site head custom code holds one JSON-LD graph: `LocalBusiness` (63 Flushing Ave, Brooklyn, NY 11205; areaServed = NYC boroughs, Jersey City, Long Island, United States; an OfferCatalog of the nine service pages) + `WebSite`. The WLAB parentOrganization was removed 2026-11-15. Default domain is possibleav.com (www 301s to it) and the global canonical URL is https://possibleav.com (2026-11-16). FAQ page has its own FAQPage JSON-LD (page settings). Blog posts carry their own BlogPosting JSON-LD in the body.
- **Old /service/* URLs** have real 301s (Hosting → Redirects, 2026-11-16): audio→/audio, projection→/projection, network→/networks, interactive-experience→/interactive, experiential→/experiential-production-nyc, av-systems→/services. The redirect API needs Enterprise, so manage them in the dashboard.

## Design
- The site family (ledwall.nyc → Possible AV → WLAB) shares copywriting style and per-page section layout, but **each site has its own visual style**.
- **2026-11-13: owner moved the homepage to a curated.design-style direction** (black, Inter, pill buttons, 28px image cards; classes `cv-*`). Other pages still use the earlier style until restyled.
- Earlier Possible AV direction: **lit dark "console" look** — the approved version sits between the two earlier glow versions, slightly brightened, applied to all pages. Rejected: a matte glow-free restyle (worse) and an earlier palette that looked too "AI-generated". Avoid large blocks of flat solid color.
- Photos are generated with FLORA. Site content is placeholder for now; the owner will replace it.

## Positioning and copy rules
- NYC is the main focus: page titles, H1s and descriptions target New York / NYC searches. A separate **Touring & Out-of-Town AV** page (`/touring-av`) covers jobs where the crew flies to other cities. It has its own nav item placed right after "Work" on every page, and Home, About and Services each carry a one-line link to it.
- Describe the company as **a Brooklyn, New York company** ("Brooklyn, New York" / "Brooklyn, NY"). Do not mention the Brooklyn Navy Yard. **Business address: 63 Flushing Ave, Brooklyn, NY 11205** (owner, 2026-11-16) — shown in the footer and the LocalBusiness JSON-LD; use exactly this for listings.
- **Do not name clients** anywhere on the site. This includes artists, agencies and collaborators in case-study copy, image alt text and URL slugs. Use generic labels ("Beauty brand", "Spirits brand"). When the owner wants a case study gone, hide it (unpublish + archive the CMS item, remove its static card on `/work`) rather than rewriting it.
- **Don't introduce the team** on the site.
- Contact email: **contact@possibleav.com** (owner, 2026-11-15; replaced wlab@wlab.tech, which replaced hello@possibleav.com).
- **Experiential** lives on Possible AV (moved from the WLAB site), along with the experiential projects moved over from WLAB.
- **Don't mention or link WLAB anywhere on Possible AV** (owner, 2026-11-13; replaces the earlier "link WLAB with every ledwall.nyc mention" rule). LED walls point to ledwall.nyc only. Contact email is contact@possibleav.com (2026-11-15). Possible AV offers motion tracking / motion capture itself.
- Links between sister sites must use the **real domains**, never `*.webflow.io`.
- Keep the sitemap complete when pages are added.
- Never say on the site what Possible AV does not do or does not offer (owner, 2026-11-15): no "we don't" FAQ entries, no exclusion lists. If something is not carried, the line is that we source it.

- Do not call the client's location "the room" on the site (owner, 2026-11-15): say space or project (clients include companies and homes, not only events); "venue" only as one item in a list of place types. "Conference room" as a product term is fine.
- No placeholder links (`href="#"`) on the site: every link goes somewhere real or is not a link.
