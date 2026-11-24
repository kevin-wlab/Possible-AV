# 2026-11-23 — Crawl + AI-search (GEO) audit

Owner request: run the same 5-step SEO/GEO check on possibleav.com that was run on the sister LED site (crawler access, keywords + questions, Google vs AI results, answer-first headings, entity schema). **Audit only. No Webflow change, no publish.**

## Findings (live crawl of all 77 sitemap URLs)
1. **Crawler access: clean.** `/robots.txt` is one `Sitemap:` line (no blocks). All 77 URLs 200, no redirects, no `noindex`, self-canonical, one H1 each, titles ≤62, descriptions in range. `/llms.txt` 404. Not verified: CDN behaviour for AI bot user-agents (agent can't send one) — owner test below.
2. **Search Console (OpenSEO project, 2026-08-21 → 11-21):** top 60 queries all 0 clicks, 1–18 impressions each. Money terms sit at positions 50–80 ("av rental nyc" 71.5, "audio visual rental nyc" 68.2, "av company brooklyn new york" 50.9). Long-tail stage-size queries ("8'x12' portable stage rental brooklyn") at 50–65. Coverage is there; authority is not.
3. **Who shows up for "AV rental NYC" style questions:** directories and vendor marketplaces (event-vendor listings, wedding marketplaces, local business directories, chamber/tourism member pages), then a few long-established rental houses. possibleav.com not present. Third-party listings are the lever, more than on-page edits.
4. **Answer-first structure:** 40 of 41 non-post pages go H2 → cards/grid with no sentence in between (by design). Hero ledes exist on all but /work and 3 project pages. Blog posts open with "Short answer: …" and answer-first sections: fine. 42 of 521 H2s are questions.
5. **Schema:** `LocalBusiness` + `WebSite` on all 77. `sameAs` = Instagram only. `FAQPage` on 23 pages; **~25 pages have a visible FAQ block but no FAQPage** (15 `/nyc/*`, 5 `/industry/*`, Home, About, Services, Pricing, Touring). `BreadcrumbList` missing on 37 pages (15 `/nyc/*`, 16 `/project/*`, 5 `/industry/*`, /faq).

## Small things found on the way
- 3 posts still link `/contact` (301 → /get-a-quote): permanent-av-for-showrooms-and-lobbies, hybrid-event-av-streaming-guide, multi-city-roadshow-av-planning.
- Site script `noindexdupes` only acts on `/untitled*` paths, which were deleted 2026-11-23: dead code, can be unapplied.
- Page source on all 77 pages loads CSS/JS from jsDelivr under the GitHub account name, which contains the parent studio's name. Not visible on the page, but it is in the HTML. Owner rule says no mention or link anywhere: owner to decide (move the files to Webflow assets, or leave).

## Next
Prioritized list added to `ops-log/PROGRESS.md` → "GEO / AI-search to-do (2026-11-23)".
