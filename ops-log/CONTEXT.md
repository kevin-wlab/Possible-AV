# CONTEXT — Possible AV

Last updated: 2026-11-16 (address rule, domains, redirects). Earlier: 2026-11-15 (nav/footer components, structured data, NYC SEO pass). Earlier: 2026-11-12 (positioning, address, client-name and Touring rules added from the NYC SEO / Touring sessions). Rules below were set by the owner.

## Where things live
- **Live site:** Webflow site **Possible AV** `6a34a7893bca7b2b60e5eac7` → `possibleav.com`, `www.possibleav.com`.
- **This repo:** original React/Vite prototype (`src/`, data in `src/data/*`) + `ops-log/`.
- **Sister sites (same Webflow workspace):** ledwall.nyc (`LED Wall` `6a2cd60ebc4f022611e7ff75`), WLAB (`WLab` `6af3bc0e06a985ae036fb21b`).
- **Key Webflow IDs:**
  - Pages: Home `6a34a78c3bca7b2b60e5eae5`, Services `6a34f354a49eba40de650fca`, Industries `6a34f3b99c1be9130cf3fded`, Work `6a34f3ba57b83eec23383965`, Blog `6a34f3bc44d27a821e001a14`, About `6a34f3bdbee39509ab20e532`, Contact `6a34f3be5b5b4820028975eb`, Pricing `6a362c70161ad75e9e266882`, FAQ `6a362c72491d6977ea71846c`, **Touring & Out-of-Town AV `6af5488a42e3ba43c291bc3f` (`/touring-av`, added 2026-11-12)**, Get a Quote `6af97b78d8e68fc36722099d`, Audio Visual Company NYC `6afa011afe7c8e4cef5177a6` (`/audio-visual-company-nyc`), Rental Terms `6aff6c89b046f1fa36efdfa9`.
  - Service pages: Displays `6af9a6c59d106ee114ca64c8`, Projection `6af9a6c6e699303789abd33a`, Audio `6af9a6cae699303789abd3d9`, Lighting `6af9b2f937d7fb834f3f6e33`, Fabrication `6af9b7a30d2c80a7e329f28d`, Networks `6af9bb66072856e73f5ee163`, Live video `6af9c0ab47d68d8c7ce5f08b`, Interactive `6af9c4d92742afeb22aafb4d`, Logistics `6af9c9136be449de58147c70`.
  - CMS template pages: post `6a34e9e8383e05c75c473534`, project `6a34e9e8f829ac7e5e3ad13e`, industry `6a34e9e6f829ac7e5e3ace87`, NYC pages `6b00cac63ad9cb39f6e9d37d` (`/nyc/<slug>`), service `6a34e9e6383e05c75c473484` (not live: every `/service/*` 301s).
  - Collections: Services `6a34e9e5383e05c75c473474`, Industries `6a34e9e6f829ac7e5e3ace11`, Blog Posts `6a34e9e8383e05c75c47352e`, Site Images `6af3a7ad5116596c5b7fe558` (unused), NYC Pages `6b00cac53ad9cb39f6e9d34d`, NYC Blocks `6b00cac6053f1ddc0af1d8c1`.
  - Work CMS collection: `6a34e9e7f829ac7e5e3acee3` (URLs `/project/<slug>`).
- **Nav and footer are shared components (new design, 2026-11-15):** NX Nav `a415a5c0-3f98-ffd5-2742-9d64adf5e99c`, NX Footer `fcf0ee38-0d76-5cd2-c260-debfab4e501c`. One edit changes every page. Nav order: Home, Services, Rentals (/nyc/av-rental), Industries (/industries), Work, Touring, Blog, About. Footer also links ledwall.nyc and ctrlp.studio (owner's sister brands). The Blog link must stay in the nav and footer.
- **Structured data:** site head custom code holds one JSON-LD graph: `LocalBusiness` (63 Flushing Ave, Brooklyn, NY 11205; areaServed = NYC boroughs, Jersey City, Long Island, United States; an OfferCatalog of the nine service pages) + `WebSite`. The WLAB parentOrganization was removed 2026-11-15. Default domain is possibleav.com (www 301s to it) and the global canonical URL is https://possibleav.com (2026-11-16). FAQ page has its own FAQPage JSON-LD (page settings). Blog posts carry their own BlogPosting + BreadcrumbList (+ FAQPage when the post has FAQs) JSON-LD as an embed at the end of the body (all 20 since 2026-11-23). NYC pages carry Service/FAQPage/BreadcrumbList from the `schema-json` field (injected by JS). Service pages have it in page settings.
- **Old /service/* URLs** have real 301s (Hosting → Redirects, 2026-11-16): audio→/audio, projection→/projection, network→/networks, interactive-experience→/interactive, experiential→/experiential-production-nyc (**dead since the 2026-11-20 /nyc/ move; owner to change it to /nyc/experiential-production**), av-systems→/services. The redirect API needs Enterprise, so manage them in the dashboard.

## Design
- The site family (ledwall.nyc → Possible AV → WLAB) shares copywriting style and per-page section layout, but **each site has its own visual style**.
- **Design now (2026-11-23):** homepage = 3D studio floor with native `hn-*` classes (+ `studio-residual.css` from jsDelivr); every other page = the same light console style with native `nv-*` / `nx-*` / `nv-pg-*` classes and a small inline `nx-residual`. (The 2026-11-13 `cv-*` curated.design homepage was replaced.)
- **Site scripts:** only `pawf` (loads an old base CSS from jsDelivr) and `noindexdupes` remain applied site-wide (2026-11-23); 13 legacy `padark*` / `seriestheme*` / `mobilenav` scripts were unapplied after a check showed no effect.
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
