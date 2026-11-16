# 2026-11-15 — Site redesign prototype: 3D homepage, Services, Audio and Displays pages

The redesign is built as a **prototype first** (a published Claude artifact, not yet in Webflow). Nothing in this session changed the live Webflow site.

- Prototype: https://claude.ai/artifact/59BenDUsBszjEaKxJeZSEw (artifact `218911a6-2058-422c-9113-fe52218f7b5c`, version `1794733115-d91a`)
- Pages live in the prototype: `index.html` (3D studio homepage), `services.html` (tabbed services), `audio.html`, `displays.html`
- Copies of the pages: `ops-log/prototypes/` · build scripts and page sources: `ops-log/wip/` · how the 3D pages are built: `ops-log/ARCHITECTURE.md`

## Owner requests, in order
1. Homepage 3D studio: fix the crew and visitor figures, remove the "Visit Ctrl+P" button, no person beside the 3D printers, keep the case being pushed to the truck visible, fix the printer base flicker, make the phone layout work (the caption card covered the scene), finish the sections below the 3D scene.
2. Services: a **traditional tabbed page**, with a separate page per service. Service pages are **not rooms** and don't reuse the studio models; each one is a short scroll-driven "product film" of that service's equipment, like the first audio hero.
3. Audio page first. Open small (one speaker on a stand and a mic) so small clients aren't put off, then show the range up to the line array. Back button to Services. Models refined twice ("not refined enough").
4. Services page: the tab picker is the focus of the page (nine pictogram tiles, picked after a big-type list was rejected).
5. Apple-style: after the animation, list everything the service covers at a glance.
6. Homepage to move to the same product-film approach (built, not yet published). Auto-scroll on load was requested then cancelled.
7. Never say on the site what Possible AV doesn't do (FAQ "we don't…" entries removed).
8. Review the copy below the homepage animation; FLORA images where needed; nav needs a Home link.
9. Example projects under every service, Audio first, FLORA illustrations. They are shown as **labelled examples, not a client list**, until the owner picks real projects.
10. Nav bar readable over content (frosted bar).
11. "Or start from the result you want." links all went to the top of the page; process steps 04–05 lost their line; don't call the client's place "the room".
12. Paused the parallel sub-tasks to save usage; continue **one page at a time, publish each before the next**.
13. Displays page: the step 01→02 transition looked strange; "venue" doesn't fit companies and homes either.

## Changes
- **Homepage (studio):** rebuilt crew figures; dock loop with the pushed case; printer plinth; phone caption as a low sheet; frosted nav with Home link and phone Menu; lower sections rewritten (Where it goes with six FLORA images, Solutions, three ways to work, process, also from us, FAQ, quote).
- **Links:** Solutions rows go to the matching service tab or page; homepage service cards go to their service; quote buttons to `#quote`; Work and About show as not-yet-available instead of `href="#"`.
- **Process steps:** the rule sits on each step so wrapped rows keep their line.
- **Wording:** client's place = "space", calls to action = "project" ("Tell us about your project.", "What does your project need?", "Sound, sized to the space."). "Venue" only inside a list of place types.
- **Audio page:** small-first opening, range, flown array, wireless, directional, spatial/haptic, mixing; at-a-glance cards; four labelled example projects.
- **Displays page:** OLED TV, touch screens, transparent display, playback station, LED wall section (LED points to ledwall.nyc); at-a-glance images rendered from the page's own models; four labelled example projects (FLORA, $0.352).

## Gotchas
- A trailing `//` comment added in the middle of a long one-line code statement commented out the rest of the line (twice: the pushed case, the printer frame). Never add trailing comments in mid-line replacements.
- Artifact pages can't load remote images; images must be published files of the artifact.
- Groups placed far apart (34 m) make transitions cross empty floor, and a line-up between groups gets flown through. Displays fix: groups 12 m apart, and the range line-up scales away after the range shot.
- Release builds only include reviewed pages: `python3 mk2.py --live audio,displays`.

## Verification
- Every Displays stop checked at 1280×800 and 390×844, plus in-between frames for each transition; no page errors.
- Services, Audio and homepage rebuilt and checked after the wording and link changes.

## Not done / next
- Service pages still to build, one at a time: Projection (next), Lighting, Live video, Networks, Interactive, Fabrication, Logistics. Partial work for Lighting, Networks and Fabrication is in `ops-log/wip/`.
- New homepage film once more services are done.
- Owner to confirm: Rent / Buy / Install tags per service; LED walls card tags; Audio copy listed in the Audio page notes.
- Real case studies: waiting for the owner to choose which projects can be shown.
- Then: build in Webflow (staging first), ask before publishing to the custom domains.

## Later the same night (04:00–04:35)
- **Projection page** live in the prototype: compact projector + pull-up screen, range, 7,000-lumen Epson laser projectors (owner fact), mapping one picture across three panels of different sizes from projectors hung on a truss (owner's own project as the reference), mapping on objects (two twisted columns, edges traced then filled), home theater with a rising screen; at-a-glance cards; five labelled examples (FLORA, $0.44 total).
- **Homepage:** new "Turnkey" section (one call, the whole job, every part in-house) + hero line; owner: turnkey is a main selling point.
- **Get a Quote page on the LIVE Webflow site:** page `6af97b78d8e68fc36722099d`, slug `/get-a-quote`, duplicated from Contact so it keeps the native Webflow form "Possible AV Project Inquiry". Copy rewritten (no "room", no WLAB/virtual production, no turning small jobs away); labels "What do you need?", "Where and when", "Tell us about the project"; WLAB link removed from the LED card. Site published twice to possibleav.com + www (only change since the Nov 14 publish). Every prototype "Get a quote" button now opens this page.
- **Owner direction (04:31):** the redesign itself should go live on Webflow, not stay a prototype. Next session starts by rebuilding /get-a-quote in the new design, then porting Home, Services, Audio, Displays, Projection into Webflow. See `ops-log/wip/RESUME.md`.
- **Still on the live site:** footer "WLAB ↗" / "WLAB Virtual Production ↗" links and WLAB mentions on Contact and About SEO text.
- Scheduled: the session resumes at 07:21 ET.

## Webflow port (afternoon)
Owner: the redesign replaces the whole site, as native Webflow elements, matching the prototype exactly, checked before reporting.
- Pages built natively with data_whtml_builder (prototype markup and class names, neutral single-class CSS so classes are kept), images linked with set_image_asset, page code = head guard + Geist fonts + `web/<page>.css` + import map, footer = `web/<page>.ui.js` + `web/<page>.js` (3D).
- Displays `6af9a6c59d106ee114ca64c8`, Projection `6af9a6c6e699303789abd33a`, Audio `6af9a6cae699303789abd3d9`: new pages. Services `6a34f354a49eba40de650fca`, Home `6a34a78c3bca7b2b60e5eae5`, Get a Quote `6af97b78d8e68fc36722099d`: old content removed after the new content was in.
- Get a Quote: the existing native form ("Possible AV Project Inquiry") moved into the new layout; classes ql / qi / qsend / qmsg (+ bad); hints set by quote.ui.js only where Webflow's default placeholder is still there (placeholders can't be set through the API).
- About SEO description: WLAB removed.
- NX Nav Menu link: href `#menu`, role=button (was a placeholder link).

Gotchas
- The old site-wide registered scripts (pawf, seriestheme, padark1-10) inject `!important` styles on every page. New pages remove them with an inline head script (guard.html).
- webflow.css base styles (body 14px/20px, h1-h6 sizes and margins, p/ul margins, ul padding 40px, img inline-block) beat the prototype's `*` reset; every web/*.css now starts with a reset back to browser defaults.
- whtml turns <button> into a.w-button with href="#": service tiles are now real links (`#displays` etc.), menu button gets `#menu`.
- The prototype's lazy images make an unloaded reference look shorter; the checker forces eager loading on both sides.
- Placeholder links in the film pages (`href="#" data-go/data-i`) now point at `#floor` (source fixed too).

Verification: built-in browser on possibleav.webflow.io, two iframes (Webflow page vs web/ref/<page>.html), computed styles and rects of every element compared at 1280x800 and 390x844; only difference is the nav highlighting the current section. Screenshots checked for the 3D stops and the quote page.

## Live video & visuals page (evening)
- New film page `live-video`: camcorder on a fluid-head tripod cabled to a small switcher, monitor and encoder on a case (opening); the range (one camera / two cameras and a switcher / flypack with cameras and a PTZ); 01 streaming (tally and encoder go LIVE, a pulse runs down the lead, program on the screen behind); 02 flypack lid lifts to a multiview; 03 VJ laptop and pad controller with audio-reactive visuals growing on the screen; 04 hybrid panel table with a PTZ on a pole and remote guests arriving on the screen.
- Copy follows the facts list (Resolume named; no numbers). Four labelled example projects with FLORA illustrations (talk, conference, launch party, hybrid panel).
- Webflow page `6af9c0ab47d68d8c7ce5f08b` (slug live-video), nav/footer instances, 9 image assets, page code at the release commit. Homepage: Live video caption inserted as 05, Networks and Fabrication renumbered 06/07, close caption data-s 8, rail rebuilt, card added. Services: the "page in progress" placeholder replaced by a link to the page.
- Staging publish only; element-by-element check clean at 1280 and 390 for Live video, Home and Services (only accepted difference: nav highlight).

## Interactive & tracking page (evening)
- New film page `interactive` (8 stops): portrait screen with a sensor on top (opening); the range (one screen / interactive floor / three-screen space); 01 interactive floor under a truss goal post, footprints appearing step by step with the content following; 02 depth sensor with its view opening out and floor tiles lighting where someone stands; 03 six tracking cameras around a taped area, the wand lifting and rays meeting its markers; 04 badge tapping a reader on a plinth, the screen answering; 05 a sculpture drawing itself in wireframe and filling in, rendered live on a screen.
- Webflow page `6af9c4d92742afeb22aafb4d` (slug interactive), 10 image assets (6 stills, 4 labelled FLORA examples). Homepage: Interactive caption 07, Fabrication 08, close 9, rail and card. Services: placeholder replaced by a link.
- Staging publish only; check clean at 1280 and 390 for Interactive, Home and Services.

## Logistics & touring page (evening)
- New film page `logistics` (6 stops): a flight case with two more stacked on a dolly (opening); the range (cases / stack / box truck); 01 the truck backed up to our loading dock, door rolling up and cases rolling out; 01 at the door, the liftgate lowering a case and another case opening; 02 a touring route out of New York with a small truck travelling it.
- Webflow page `6af9c9136be449de58147c70` (slug logistics), 7 image assets (4 stills, 3 labelled FLORA examples). Homepage: Logistics caption 09, close 10, rail and card. Services: placeholder replaced by a link. All nine service pages are now on staging.
- Staging publish only; check clean at 1280 and 390 for Logistics, Home and Services.

## About page in the new design (evening)
- Rebuilt `/about` (page `6a34f3bdbee39509ab20e532`) in the new design: hero "One crew for the whole job.", an image strip, Turnkey (plan, make, bring, run), the nine services as tiles linking to their pages, New York and on the road, rent/buy/install, FAQ, quote. Follows the owner's About rules: no team, no street address, no WLAB, no client names, no numbers.
- Files: `web/about.css`, `web/about.ui.js`, `web/ref/about.html`. Staged; check clean at 1280 and 390.
- Contact SEO description no longer mentions WLAB; Services SEO title and description now list all nine services.
- Footer (NX Footer component) and the booked-with chips on every service page now link straight to the service pages instead of Services tabs; sources updated to match. Verified on staging.

## Industries, FAQ, Pricing, Touring in the new design (night)
- Rebuilt in place, same slugs, native elements with NX Nav / NX Footer: Industries `6a34f3b99c1be9130cf3fded`, FAQ `6a362c72491d6977ea71846c`, Pricing `6a362c70161ad75e9e266882`, Touring `6af5488a42e3ba43c291bc3f`. Old `pa-*` elements removed after the new content was in.
- Built by `pages/build_pages.py` (copy in `ops-log/wip/`): body files, `web/ref/<page>.html`, one shared `web/page.css` (About rules + industry list, tiers, "more" blocks) and `web/page.ui.js`.
- Page code: guard + Geist fonts + `web/page.css` in the head, `web/page.ui.js` in the footer, at commit fc9869f.
- Copy: LED walls only as "through ledwall.nyc" (FAQ answer, Pricing extras); no WLAB, VP, client names, street address or numbers. Text scan of all four pages on staging found none.
- Staging publish only; element-by-element check clean at 1280 and 390 for all four (only accepted difference: nav highlight).

## Contact, Work, Blog and the four CMS templates (night)
- **Contact** `6a34f3be5b5b4820028975eb`: new layout like Get a Quote. The page's own native form ("Possible AV Project Inquiry") was moved into it and restyled (ql / qi / qsend / qmsg); side cards: email (wlab@wlab.tech, unchanged), Brooklyn, New York, LED walls via ledwall.nyc; quick answers. The old "LED walls & virtual production / WLAB" card is gone. Uses `web/quote.css`; added `.qform .w-form{margin:0}` (Webflow's 15px form margin), Get a Quote updated to the same CSS.
- **Work** `6a34f3ba57b83eec23383965`: one real project (LA) and six cards labelled "Example". The seven images were uploaded as site assets (CMS images are not in the asset library): work-la-secret-show `6af9d121fc8459c2b77f53fd`, work-ex-popup `6af9d121b2985e17b83a0c18`, -gallery `6af9d121a8707557077d460e`, -session `6af9d121b2985e17b83a0c6d`, -window `6af9d122987f038cef8a8400`, -stage `6af9d12262ce94d871315fdd`, -lobby `6af9d125994d262a71379878`. SEO title/description no longer say "case studies".
- **Work CMS**: the six seed projects (made up in June, AI pictures) are now marked as examples in their text ("An example of the kind of job we take on, not a past client. The picture is an illustration."), with names, summaries, facts and SEO rewritten without invented figures (no 1,000 seats, 99.9%, 5,000+, 36 hrs, zero downtime, Fortune 500). LA item: "room" → "space", old service link → /live-video.
- **Blog** `6a34f3bc44d27a821e001a14`: 13 post cards in the new design.
- **Blog CMS**: WLAB and virtual production removed from three posts (permanent installs, roadshow, projector vs LED; LED pricing now points to ledwall.nyc). "room" reworded in all posts (hybrid post renamed "...without losing the live audience", JSON-LD updated to match). Old /service/* links point to the new pages.
- **Templates rebuilt** (CMS-bound elements moved into the new layout, new classes cover / prose / prose.facts created): Work `6a34e9e8f829ac7e5e3ad13e`, Blog `6a34e9e8383e05c75c473534`, Industries `6a34e9e6f829ac7e5e3ace87`, old Services `6a34e9e6383e05c75c473484` (now a short page pointing to the nine service pages; their other CMS fields are no longer shown).
- **Industries CMS**: all five rewritten (no WLAB / VP, no "zero failures", no "1,000-seat", no "Javits"/client lists; the Cases field emptied and no longer shown).
- **Old Services CMS**: headline, subtitle and SEO for the six items now point to the new pages. The URLs stay live until the owner decides on 301s.
- **Interactive**: example text "A room that changes…" → "A space that changes…" (Webflow and source).
- All page.css pages and templates now load `web/page.css` / `page.ui.js` at e219dd2.
- Files: `pages/build_cms_pages.py` (work, blog), `pages/build_tpl_refs.py` + `pages/tpl_items.json` (refs for project, post, industry, service), `pages/extra.css` (appended to page.css by build_pages.py), `chk.js` (the checker, now saved), `upload-helper.js` gained `prepUrl()`.

Gotchas
- whtml can't link CMS images (they are not site assets): upload copies with prepUrl + create_asset + upload, then set_image_asset.
- set_style needs the class to exist: create it first (create_style, neutral box-sizing).
- Webflow's rich text adds a clearfix (::before/::after) that stops margin collapse; `.prose` hides it.
- The checker's ref for a template lives in ref/<collection>/<slug>.html and links ../page.css (paths resolve against ref/).
- CMS update responses echo the whole body; long posts are expensive to edit.

Verification: staging only. chk clean at 1280 and 390 (only the nav highlight differs) for Contact, Work, Blog, Industries, FAQ, Pricing, Touring, project/corporate-general-session, post/dante-audio-networking-explained, industry/trade-shows, service/projection. Scan of all 51 sitemap URLs + /contact + /get-a-quote: all 200, no old-design elements, no WLAB / virtual production / VP / XR / "room" (outside "conference room") / Navy Yard / Fortune 500, no links to wlab.tech or /service/*.
- Owner request (12:41): removed the sentence "An example of the kind of job we take on, not a past client. The picture is an illustration." from the six Work example items. The "Example" labels on the Work cards, the Work intro and the "Example:" SEO titles are unchanged.
- 12:49 owner: "全部上线possible av" → full publish to possibleav.com + www.possibleav.com (+ webflow.io). Live check: all 51 sitemap URLs + /contact + /get-a-quote return 200 in the new design, no old-design elements; the only "wlab" text is the contact email wlab@wlab.tech (kept by rule). Home 3D loads.
- Owner also asked to remove every "Example" label from Work; not done (it would present the six made-up projects as real past work). Offered instead: take them off Work, or keep them under a "what we can do" framing. Waiting for the owner's choice.
- 12:52 owner: restore the studio homepage (he had not asked for the product-film homepage). Home `6a34a78c3bca7b2b60e5eae5` now carries the studio from the prototype `index.html` (port key `studio`: web/studio.css / .js / .ui.js / ref/studio.html; film sections removed, NX Nav/Footer kept; 6 "where it goes" pictures already in assets: room-activation `6af9a6063cf5c6a6012b7368`, room-corporate `6af9a607f3d4385110560dea`, room-tradeshow `6af9a60888c2e2af9d1f8daf`, room-popup `6af9a6075edbd2a5411a7a90`, room-gallery `6af9a607b58fe075438f1387`, room-office `6af9a6075edbd2a5411a7a74`). The studio scene loads its 3D models from `web/models/` (copied from the prototype). Service links in the studio point to the nine service pages. The product-film home files (web/home.*) are kept, unused.
- Gotcha: Webflow drops/refuses the element id `focus`; the studio uses `focusl` (port.py renames it in the body, JS and CSS).
- chk.js: optional 4th argument = ref name (chk('home',w,h,'studio')), and it now also compares top-level body sections (the studio has no <main>).
- Checked on staging: 555 elements identical at 1280 and 390 (only the nav highlight), all 7 models load, scroll walk works. Published live to possibleav.com + www; live home confirmed on studio.js with models loading.
- 13:38 owner: sync to GitHub. Prototype source copied to `ops-log/wip/prototype/` (src/, scene.js, mk.py, mk2.py, mk_home.py, ft.sh, index.html); the stale `ops-log/wip/film/` copy replaced by it; RESUME and AGENT_BRIEF refreshed.

## 13:39–14:00 Sitemap, Blog link, NYC SEO pass (owner: "sitemap换了吗", "是不是blog没了", "这样对我们的排名可不友好，而且记得针对纽约优化")
- Sitemap: Webflow regenerates it on publish; 51 URLs, all new pages present. Old `/service/*` stubs still listed (duplicates of the nine service pages).
- Blog had no link in the new nav or footer (and Touring had lost its nav item). Fixed in the shared components:
  - NX Nav: Industries → `/industries`; added Touring (`79e60085-81fd-abc8-d139-8423aa9f9a8e`) and Blog (`4ee82651-e568-1ce8-6f58-178d78545785`) after Work.
  - NX Footer, Company column: Industries → `/industries`; added Touring (`18f4f2fc-9099-7cb6-2709-ce0371a12d22`) and Blog (`8723002b-f3c0-4b24-9c03-1d0ae7d88e6f`).
  - Checked at 1280, 910 (just above the 900px fold) and 375 (menu shows all 8 items).
- "New York" added to the hero sub-line (`.sub`) on Home, Services, the 8 service pages that lacked it, Industries, Blog, FAQ, Pricing. H1s unchanged (design copy). Prototype/ref copies get the same text through `seo_patch.py`, now run by `release.sh`.
- Site head JSON-LD rewritten: LocalBusiness (no WLAB parent, no street address) + OfferCatalog of the nine services + WebSite, plus a script canonical to https://possibleav.com (both hosts served 200 with no canonical).
- FAQ page: FAQPage JSON-LD from the 11 visible Q&As.
- Meta: Home, FAQ, Blog, Pricing (dropped "venue") titles/descriptions; 5 blog posts got NYC meta titles/descriptions, the cost post a new description.
- Old `/service/*`: script redirect + canonical in the service template head (API 301s need Enterprise).
- Noticed the owner edited Work/Audio/Contact in the Designer at 13:41–13:44 and published; their Work sub-line and project titles differ from web/ref now (left as the owner set them).
- Staging (possibleav.webflow.io) verified: nav/footer links on 23 pages, sub-lines, JSON-LD parses, no WLAB/VP strings, /service/audio lands on /audio.

## 13:54–14:20 New York landing pages (owner: "纽约的landing page记得做，目的是抢排名")
- Keyword research (OpenSEO, new project `42fb9f74-270f-401d-a2df-da22805fd952`, US market) on ~120 NYC AV terms. Built one page per search intent with real volume and low difficulty.
- 12 pages, duplicated from Touring (keeps NX Nav/Footer), main content replaced via whtml, images = existing site assets, page code = page.css/page.ui.js @ e219dd2, JSON-LD per page = Service + FAQPage + BreadcrumbList:
  | slug | page id |
  |---|---|
  | av-rental-nyc (hub) | 6afa00f8d98a23420890ffaf |
  | audio-visual-company-nyc | 6afa011afe7c8e4cef5177a6 |
  | event-production-company-nyc | 6afa011b54018f285f6a86a6 |
  | projector-rental-nyc | 6afa011b7bab2688e909c714 |
  | sound-system-rental-nyc | 6afa011c1bf9aae0706191f2 |
  | microphone-rental-nyc | 6afa011c1bf9aae070619220 |
  | tv-rental-nyc | 6afa011cec02739cec2082c1 |
  | event-lighting-rental-nyc | 6afa011ef4cd507ac2475c79 |
  | stage-rental-nyc | 6afa011fbd094984ca50dd5e |
  | event-wifi-rental-nyc | 6afa011fd92dd50d9e3aef6d |
  | computer-rental-nyc | 6afa0120feb61fc6e33c6fa3 |
  | experiential-production-nyc | 6afa01201bf9aae07061935e |
- Source: `pages/build_landing.py` (copy in ops-log/wip) → port/<slug>.body.html + web/ref/<slug>.html + pages/landing.json (titles, descriptions, FAQ schema). Run by release.sh.
- Footer component: added "AV rental NYC" → /av-rental-nyc (`0742f1e4-be72-2b90-43c2-46d004ca1a94`) so the hub links to all 11 others from every page.
- Gotchas: `bulk_update_pages` ignored `draft:false`; `update_page_settings` per page worked. Duplicated pages keep element ids (component = new page id) but not page custom code. Strip image ids = strip element id minus 3/2/1 (hex).
- Not built on purpose: 3D printing NYC (goes to ctrlp.studio), LED wall rental (ledwall.nyc), camera rental (film gear, not this business), laptop rental (not confirmed in scope).
- Staging verified: 12 × 200, 9 sections, 3 images, JSON-LD parses, 29 internal links all 200, no banned words.

## Homepage low-performance fallback ("lite" mode), 2026-11-15
Owner request: if the homepage 3D hasn't loaded after a set time, switch to a version for low-performance devices. (Pricing work postponed by the owner.)

- `web/studio.ui.js` now decides before three.js loads and then injects `studio.js` itself (so the home footer holds only `studio.ui.js`; `code.py` skips the module tag for studio).
- Goes lite straight away (three.js never downloads) when: no WebGL, Save-Data on, deviceMemory ≤ 2 GB, ≤ 2 CPU cores, or the URL has `?lite` / `#lite`.
- Otherwise: lite after **6 s** (was 7 s; owner changed it the same day) if the scene hasn't rendered (`LITE_MS` in `port.py`), or if frames 30–120 average over 55 ms (~18 fps). The frame count resets after a >400 ms gap so a background tab doesn't trigger it.
- Lite layout: canvas, labels and HUD hidden; hero over a static studio render; the 9 system cards become a normal scroll list, each with its own still (`web/img/studio-lite-0..10.jpg`, mobile hero crop `studio-lite-0m.jpg`; renders from `ops-log/wip/render_lite.py`). When it switches mid-load, the 3D renderer is disposed and the page scrolls to the top.
- Webflow home page `6a34a78c3bca7b2b60e5eae5`: head + footer code set to `possible-av@1ddbea1`.
- Verified on staging: normal path (3D ready, not lite), `?lite` on 375 px mobile and 1280 desktop, and a forced switch after load (`window.__pavGoLite()`): canvas hidden, page at top, no console errors.

## 16:00 Motion capture, stage deck rental, blog gaps (owner: "tracking子页面没有出现motion capture，补上…stage deck rental能够快速的跑起来…blog…覆盖所有类型的业务…抢排名")
Keyword data (OpenSEO project 42fb9f74…, US): "stage deck rental" 50/mo but the cluster around it is large and KD 0: rent a stage 4,400, portable stage 2,900, stage platform 1,900, stage risers 1,600, stage decks 720, portable stage rental 590, stage platform rental 480, riser rental 260, stage rental nyc 210, staging rental nyc 210, stage rental prices 140. SERP for "stage rental nyc" is local party-rental sites with deck sizes/heights/risers/skirting; no strong content page.
- **Interactive & tracking** `6af9c4d92742afeb22aafb4d`: section 03 → "Motion capture & tracking" / "Every movement, captured." / full-body capture copy; rail and glance card → "Motion capture"; example line, hero sub-line; FAQ "Can you rent a motion capture system?" + new "Can motion capture drive visuals live?". SEO title "Interactive Installations & Motion Capture in NYC". New page JSON-LD: Service + FAQPage. (Image alt left as "Motion tracking cameras…": the API's set_attributes fails on alt.)
- Services page interactive tab and the homepage (3 lines + the "Motion capture" spoke link) now say motion capture. Source: mk2.py, index.html, mk_home.py, src/film/pages/interactive.body.html.
- **Stage page** `6afa011fbd094984ca50dd5e` rewritten for the stage-deck cluster: title "Stage Rental NYC: Stage Decks, Risers & Portable Stages", H1 "Stage rental in NYC: decks, risers, platforms.", what-you-can-rent (stage deck rental, risers & platforms, portable stages, stairs/skirting/railings, runways, truss), new "Stage sizes" (8×8 / 8×16 / 12×16 / 16×24 ft, decks typically 4×8 ft) and "Stage height" sections, 7 FAQs, Service JSON-LD with alternateName (stage deck / riser / portable stage / platform rental). Anchors pointing to it now say "Stage rental in NYC" / "Stage deck rental in NYC".
- **7 new blog posts** (CMS, written by parallel writers from ops-log/wip/posts/BRIEF.md, checked for rules; FLORA covers, rehosted by Webflow; each with BlogPosting + Breadcrumb + FAQPage JSON-LD; cards added to /blog):
  | slug | target | links to |
  |---|---|---|
  | stage-deck-sizes-guide | stage decks, portable stage, stage risers, rent a stage | /stage-rental-nyc |
  | what-is-uplighting-event-guide | what is uplighting, uplighting for events | /event-lighting-rental-nyc |
  | markerless-vs-marker-motion-capture | markerless motion capture, how motion capture works | /interactive |
  | touch-screen-kiosk-rental-events | touch screen kiosk, touch screen rental | /tv-rental-nyc, /displays |
  | projector-screen-size-lumens-guide | projector screen size, lumens | /projector-rental-nyc |
  | corporate-event-production-nyc-guide | corporate event production | /event-production-company-nyc |
  | event-sound-system-guide | sound system for event, speaker rental | /sound-system-rental-nyc |
  Item ids: 6afa20ad73cad3669b114f46, 6afa20e62cba349a27a2bb09, 6afa211bf610cfffbefedd00, 6afa2151f610cfffbefee938, 6afa2188f37ee29748e091fa, 6afa21bc8216f97f3a859d94, 6afa21f59eb44edc3250f017.
- Money pages link back to their guide (Related chips): stage, event lighting, projector, sound system, TV rental.
- Staging: 16 URLs 200, all JSON-LD parses, no banned words.
- Owner-side to speed up stage ranking: Google Business Profile with a "Stage rental"/"Audio visual equipment rental service" category and photos of decks; request indexing of /stage-rental-nyc in Search Console.

## Contact email → contact@possibleav.com (owner, 2026-11-15)
- Site head JSON-LD `email` → contact@possibleav.com (same edit: motion capture added to the interactive OfferCatalog + knowsAbout).
- Get a Quote (`6af97b78d8e68fc36722099d`) mailto Link `f0474a58-…6e89` and Contact (`6a34f3be5b5b4820028975eb`) mailto Link `0ca0ca60-…456f`: href + text updated.
- Form-fail message on both pages: old Block `05b3543f-…f043` can't take set_text (its child is a String) → inserted new div after it (`c07e8d3b-…ae79` quote, `a616012d-…f541` contact), removed the old one.
- CONTEXT.md contact-email rule updated. Staging scan: 71/71 sitemap pages carry the new address, 0 carry the old one.
- Open: head JSON-LD still has a `streetAddress`; flagged to owner (no-street-address rule).
