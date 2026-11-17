# PROGRESS — Possible AV

Last updated: 2026-11-16 (SEO pass, address, homepage 3D performance; see sessions/2026-11-16-seo-and-3d-performance.md).

## Live
- Site is on Webflow and live on possibleav.com (last publish 2026-11-12, per Webflow).
- **NYC local SEO** (2026-11-11/12): NYC-focused SEO titles and descriptions on all 9 static pages (Home's were empty before), NYC in the H1s of Home, Industries, Work and Contact, and a site-wide `LocalBusiness` JSON-LD. *Live check 2026-11-12: Home title and H1 confirmed. JSON-LD not checked in the live `<head>`.*
- **Touring & Out-of-Town AV page** `/touring-av` (2026-11-12): "Touring" nav item after Work on every page, inline links from Home, About and Services, included in the sitemap. *Live check 2026-11-12: nav item and H1 confirmed on Home and Touring; sitemap API confirms the page is included.*
- **Brooklyn, New York wording** (2026-11-12): Navy Yard and the street address removed from footers, Home stats and eyebrows, Contact, FAQ, SEO descriptions and JSON-LD. *Live check 2026-11-12: Home has no Navy Yard mention. Other pages were checked via the API only.*
- **No client names on visible pages** (2026-11-12): Touring copy is generic. The LA case study is renamed with generic labels. The Times Square and New Orleans case studies are hidden (unpublished, archived, cards removed). *Live check 2026-11-12: Home, Touring and Work show no client names; Work lists 7 cards.*

- **SEO audit cleanup** (2026-11-13): CMS template SEO bound to item meta fields (30 pages had the bare title "Possible AV"); Navy Yard and client names removed from Experiential, AV Systems, industries and the Home marquee; broken links to hidden case studies fixed; long titles/descriptions trimmed. *Live 2026-11-13; live crawl clean (41/41 200, 0 broken, 0 Navy Yard, 0 client names, 0 generic titles).*

## Live changes 2026-11-15
- **/get-a-quote** (Webflow page `6af97b78d8e68fc36722099d`) live with the native Webflow form; old-style for now, to be rebuilt in the new design.

## Redesign on Webflow (staged on possibleav.webflow.io, custom domains not published yet)
- Native Webflow elements with the prototype's class names; the stylesheet, 3D and small scripts load from this repo via jsDelivr (`web/`). Method and tools: `ops-log/wip/` (port.py, frag.py, acts.py, code.py, guard.html).
- Done and checked element by element against `web/ref/` at 1280 and 390 wide: Home, Services, Audio, Displays, Projection, Lighting & staging, Fabrication, Networks & computers, Live video & visuals, Interactive & tracking, Logistics & touring, About (new design, owner rules), Industries, FAQ, Pricing, Touring, Contact, Work, Blog, the Work / Blog / Industries / old Services templates, Get a Quote (native form restyled). Shared components NX Nav / NX Footer.
- Every page and template is in the new design and LIVE on possibleav.com + www (published 2026-11-15 12:49 ET at the owner's request). Home is the 3D studio (restored 12:52 at the owner's request; the product-film home files stay unused in web/home.*). Open: 301s for the old /service/* URLs (now short pointer pages); what to do with the six Work examples.
- New pages carry a head guard that removes the old site-wide theme scripts' styles; remove the guard once the old registered scripts are taken off the site.
- Waiting on the owner: publish to the custom domains now (old pages still in the old style) or after the remaining pages.

## Redesign prototype
- Prototype: https://claude.ai/artifact/59BenDUsBszjEaKxJeZSEw — 3D studio homepage, tabbed Services page, Audio and Displays service pages (2026-11-15).
- Service pages are built and published one at a time: Audio, Displays, Projection, Lighting, Fabrication, Networks, Live video, Interactive, Logistics done (all nine). Then the homepage moves to the same product-film style.
- Example projects on service pages are labelled examples with illustrations until the owner picks real projects.

## Decided in earlier sessions (verify against the live site before relying on it)
- Visual direction: lit dark "console" style, applied to all pages.
- Contact email: wlab@wlab.tech.
- Experiential service + experiential projects move over from the WLAB site.
- Positioning: NYC first, plus a Touring & Out-of-Town AV page. *(Built and live 2026-11-12; see above.)*
- `ops-log/` + root `CLAUDE.md` added 2026-11-12.

## Open items
- Earlier sessions (rebuild, restyles, Experiential move) weren't logged here. Next session: audit the live Webflow pages against `CONTEXT.md` and record what's actually done.
- Placeholder copy and FLORA images to be replaced with real content by the owner. This includes the "STUDIO / INVENTORY IMAGE" placeholder on About and Touring.
- (Superseded 2026-11-13: no WLAB mention or link on Possible AV.) Navy Yard and client names: Home, Touring and Work are confirmed clean live; recheck About, Services, Industries, Contact, Pricing, FAQ, Blog and the blog posts on the live site.
- Sitemap: the Touring page is confirmed included (2026-11-12). The 4 draft duplicate pages (`untitled`…`untitled-4`) are excluded; delete them if they aren't needed.
- **The LA case-study cover photo** shows a name on a banner, and its file URL contains names. The owner kept the photo for now; replacing or cropping it and re-uploading under a generic filename would finish the job.
- **Two archived Work CMS items** (Times Square, New Orleans) can be permanently deleted in the Webflow dashboard if wanted. Old case-study URLs 404 on purpose (no redirects).
- **Phone number** missing from the site and the JSON-LD.
- ~~Duplicate hosts~~ Done 2026-11-16: apex is the default domain, www 301s to it, global canonical = https://possibleav.com.
- **Touring page:** confirm the "larger systems ship ahead to the venue" line with the owner, and add a real tour photo.
- **Mobile nav:** check the layout with 8 items.
- **More out-of-town case studies** (only LA is visible now), written without client names.

## Next steps (suggested)
- Give each sister site its own keyword focus so shared copy doesn't compete: ledwall.nyc = LED walls, Possible AV = event / experiential AV, WLAB = virtual production / mocap.
- Venue-specific case-study pages (e.g. "AV at <NYC venue>") and NYC service-area pages.
- Google Business Profile (likely as a service-area business with the address hidden), plus local citations.
- Submit the sitemap / request indexing in Google Search Console after major changes.

- 2026-11-15: Work's six seed projects are labelled examples (no invented figures). Owner to replace them with real projects when ready.
- Scratch page `nx-scratch` (draft) can be deleted in the Designer; the API has no page delete.

- Prototype source (src/, scene.js, mk*.py, index.html) is kept in `ops-log/wip/prototype/`; the port scripts in `ops-log/wip/`.

- 2026-11-15 14:00: Blog + Touring back in nav and footer (shared components); NYC SEO pass (hero sub-lines, meta, LocalBusiness/WebSite/FAQPage JSON-LD, canonical to possibleav.com); old /service/* redirect by script. Open: set the default domain + real 301s in Webflow hosting settings; submit sitemap in Search Console.

- 2026-11-15: Homepage low-performance fallback (lite mode): static version after 6 s without the 3D, on low-end devices, or with `?lite`. Home code at `@1ddbea1`; verified on staging. Live publish waiting for owner OK.
- 2026-11-15 16:30: Motion capture added to /interactive (+ Services, Home); /stage-rental-nyc rewritten for stage decks/risers/portable stages; 7 new SEO blog posts for uncovered services (stage, uplighting, motion capture, kiosks, projector sizing, corporate production, PA sizing). Open: GBP + Search Console indexing for the stage page.
- 2026-11-15 18:00: Fixed the chip rail on the 3D subpages (and home): clicks were also caught by Webflow's built-in #anchor smooth scroll, which scrolled back to #floor. Rail handlers now stopPropagation (port.py).
- 2026-11-15 18:15: /interactive stop 03 now has a performer in the middle (Michelle, samba, like the home page) with glowing joint markers, camera rays locking on, and a live skeleton screen behind; the calibration wand is gone.
- 2026-11-15 18:35: /interactive "Motion capture" card image replaced with a new render of the performer scene (asset 6afa3f60039917d9185dd107, web/img/interactive-mocap-v2.jpg). Note: the element alt still says "Motion tracking cameras…" (API cannot set element alt); the asset alt is updated.

## 2026-11-16
- SEO pass live: titles/descriptions, Service/FAQ/Breadcrumb JSON-LD on service pages, real 301s for /service/*, sitemap cleaned (71 apex URLs), noindex on /contact and the service template, Google verification ID fixed.
- Address 63 Flushing Ave, Brooklyn, NY 11205 in the footer and LocalBusiness JSON-LD; "Crews travel." removed.
- Homepage 3D performance live (`0ef7cda`): ~40 fps with stalls → steady 60 fps; ~6,400 → ~1,100 draw calls. Lite timeout 5 s.
- Service-page performance pass reverted; scheduled for Wed 2026-11-18 with skip / back-to-top buttons, Displays spacing and better lite versions.
- Still open (off-site): submit the sitemap in Google Search Console and Bing, Google Business Profile with the same address, phone number on the site, directory listings.
- 2026-11-17: Home 3D looked blurry/jagged (1.5x render, no MSAA on Retina, governor dropping quality during loading). Now full 2x + MSAA, shadows every 2 frames; governor starts 2.5 s after loading, needs ~1.5 s of slow frames, steps back up when fast. Live at `dcaabd1`: 60 fps on an M2 Pro at 2048x1536.
