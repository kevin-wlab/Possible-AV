# PROGRESS — Possible AV

Last updated: 2026-11-13 (SEO audit + rule cleanup; see sessions/2026-11-13-seo-audit-cleanup.md).

## Live
- Site is on Webflow and live on possibleav.com (last publish 2026-11-12, per Webflow).
- **NYC local SEO** (2026-11-11/12): NYC-focused SEO titles and descriptions on all 9 static pages (Home's were empty before), NYC in the H1s of Home, Industries, Work and Contact, and a site-wide `LocalBusiness` JSON-LD. *Live check 2026-11-12: Home title and H1 confirmed. JSON-LD not checked in the live `<head>`.*
- **Touring & Out-of-Town AV page** `/touring-av` (2026-11-12): "Touring" nav item after Work on every page, inline links from Home, About and Services, included in the sitemap. *Live check 2026-11-12: nav item and H1 confirmed on Home and Touring; sitemap API confirms the page is included.*
- **Brooklyn, New York wording** (2026-11-12): Navy Yard and the street address removed from footers, Home stats and eyebrows, Contact, FAQ, SEO descriptions and JSON-LD. *Live check 2026-11-12: Home has no Navy Yard mention. Other pages were checked via the API only.*
- **No client names on visible pages** (2026-11-12): Touring copy is generic. The LA case study is renamed with generic labels. The Times Square and New Orleans case studies are hidden (unpublished, archived, cards removed). *Live check 2026-11-12: Home, Touring and Work show no client names; Work lists 7 cards.*

- **SEO audit cleanup** (2026-11-13): CMS template SEO bound to item meta fields (30 pages had the bare title "Possible AV"); Navy Yard and client names removed from Experiential, AV Systems, industries and the Home marquee; broken links to hidden case studies fixed; long titles/descriptions trimmed. *Live 2026-11-13; live crawl clean (41/41 200, 0 broken, 0 Navy Yard, 0 client names, 0 generic titles).*

## Decided in earlier sessions (verify against the live site before relying on it)
- Visual direction: lit dark "console" style, applied to all pages.
- Contact email: wlab@wlab.tech.
- Experiential service + experiential projects move over from the WLAB site.
- Positioning: NYC first, plus a Touring & Out-of-Town AV page. *(Built and live 2026-11-12; see above.)*
- `ops-log/` + root `CLAUDE.md` added 2026-11-12.

## Open items
- Earlier sessions (rebuild, restyles, Experiential move) weren't logged here. Next session: audit the live Webflow pages against `CONTEXT.md` and record what's actually done.
- Placeholder copy and FLORA images to be replaced with real content by the owner. This includes the "STUDIO / INVENTORY IMAGE" placeholder on About and Touring.
- Check that every ledwall.nyc mention also mentions and links WLAB. Navy Yard and client names: Home, Touring and Work are confirmed clean live; recheck About, Services, Industries, Contact, Pricing, FAQ, Blog and the blog posts on the live site.
- Sitemap: the Touring page is confirmed included (2026-11-12). The 4 draft duplicate pages (`untitled`…`untitled-4`) are excluded; delete them if they aren't needed.
- **The LA case-study cover photo** shows a name on a banner, and its file URL contains names. The owner kept the photo for now; replacing or cropping it and re-uploading under a generic filename would finish the job.
- **Two archived Work CMS items** (Times Square, New Orleans) can be permanently deleted in the Webflow dashboard if wanted. Old case-study URLs 404 on purpose (no redirects).
- **Phone number** missing from the site and the JSON-LD.
- **Duplicate hosts:** apex and www both serve the site with no canonical. Owner: set www as default domain + Global canonical URL in Webflow dashboard.
- **Touring page:** confirm the "larger systems ship ahead to the venue" line with the owner, and add a real tour photo.
- **Mobile nav:** check the layout with 8 items.
- **More out-of-town case studies** (only LA is visible now), written without client names.

## Next steps (suggested)
- Give each sister site its own keyword focus so shared copy doesn't compete: ledwall.nyc = LED walls, Possible AV = event / experiential AV, WLAB = virtual production / mocap.
- Venue-specific case-study pages (e.g. "AV at <NYC venue>") and NYC service-area pages.
- Google Business Profile (likely as a service-area business with the address hidden), plus local citations.
- Submit the sitemap / request indexing in Google Search Console after major changes.
