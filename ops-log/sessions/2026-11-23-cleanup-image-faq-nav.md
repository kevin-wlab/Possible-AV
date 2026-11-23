# 2026-11-23 — LA image rename, FAQ LED answer, nav fixes, site inventory

## Owner requests (in order)
1. Continue the remaining to-dos, with subagents in parallel → site inventory + nav check (agents).
2. After the inventory report: "1 3执行，2我后面处理"
   - (1) re-upload the LA case-study image under a neutral filename, swap it in, delete the old one
   - (3) reword the /faq "Do you do LED walls?" answer (visible + FAQPage JSON-LD)
   - (2) the jsDelivr URLs under the owner's GitHub account: **owner handles later; not touched**

## Changes (Webflow site `6a34a7893bca7b2b60e5eac7`)
- **Site footer custom code** — appended `<style id="nx-navfix">` + a small script: nav z-index 70 (menu above the homepage SKIP button), stronger current-page highlight (orange left bar on mobile), current-page map (`/nyc/*`→NYC rental, `/post/*`→Blog, `/project/*`→Work, `/industry/*`→Industries, the nine service pages→Services), Escape closes the mobile menu, logo no-wrap at ≤360px, 40px min button height, scrollable dropdown, larger touch targets on ≤1100px touch screens. Existing `.pav-jump` code kept.
- **LA case study image** — new site asset `6b04a63ded68c1bc4471e42e` (`la-secret-show-led-wall.jpeg`, same picture, a JPEG comment added so Webflow wouldn't dedupe it to the old file). Work item `6af3d19707c27589ef878f3f` cover now `6b04a64fc06838007d70c06c_…la-secret-show-led-wall.jpeg`; alt text unchanged.
  - The old file (asset `6af3c299c8fbb2eedeccc0e1`) belongs to **another Webflow site** (`6af3bc0e…`), not Possible AV, so it was **not deleted**. Possible AV no longer references it.
  - A first attempt asset `6b04a61a01906f2495a53533` was deleted (unused).
- **/faq** (page `6a362c72491d6977ea71846c`) — "Do you do LED walls?" answer is now: "Yes. For LED wall panels, sizes and pricing, see our sister site ledwall.nyc. We build the signal, sound, networks and playback around the wall, on one quote." (ledwall.nyc link kept.) FAQPage JSON-LD (page schema markup) updated to the same text.
- Published to **possibleav.webflow.io only**. Custom domains not published yet (waiting for owner OK).

## Gotchas
- `create_asset` + browser POST to the S3 `uploadUrl` works (shell can't reach the CDN; the browser can). Needs the MD5 of the bytes.
- Setting a CMS image field to a new `fileId` whose bytes match an existing CMS file is silently ignored; change the bytes (e.g. JPEG COM segment) and pass the `url` only.
- `query_elements` on /faq errored ("Element does not have a configurable visibility setting"); `get_all_elements` worked, and `set_text` works on String nodes inside a paragraph with a link.
- The FAQ JSON-LD lives in page settings (schema markup), not in an embed.

## Verification (staging)
- /faq visible answer + JSON-LD match the new text; link → ledwall.nyc.
- LA case study page uses only the new image URL.
- Nav: current page highlighted on /, /work, /about; /project/* → Work, /nyc/* → NYC rental, /lighting → Services; Escape closes the menu; logo one line at 320px; nav z-index 70.

## Inventory
- `ops-log/site-inventory-2026-11-23.md` added (agent crawl of all 76 sitemap URLs + CMS + settings). Open findings are listed in PROGRESS.

## Live publish
- Owner OK → published to possibleav.com + www (15:53 ET). Live check: /faq text + JSON-LD new, LA page uses only the new image, `nx-navfix` present.

## Inventory fixes (owner: "do whatever you think needs doing") — staged, not live yet
- **Site scripts:** 13 legacy scripts (`padark1`–`10`, `seriestheme`, `seriestheme2`, `mobilenav`) unapplied site-wide. Check first: on 14 pages no `.pa-*` elements exist and none of their injected styles survive in the DOM, so computed styles were identical with them disabled (0 diffs). Kept `noindexdupes` and `pawf` (pawf loads a jsDelivr CSS under the owner's GitHub account — owner is handling those URLs). Script tags per page 19 → 7. Registrations kept (not deleted).
- **"the room" (CONTEXT rule):** NYC Blocks `6b00d53fd0bb44401d756acc` (uplighting: "A full color wash / Uplights along every wall…"), `6b00d517aefe1284261a95be` (speaker: "for large spaces"), `6b00cf1aa67a95f7c51c09d5` (sound system FAQ: "speakers sized to the space") + the matching answer in NYC Pages `6b00cef30aed3a2cc9945636` `schema-json`.
- **Homepage sound toggle:** `<a href="#" class="w-button">` replaced by a real `<button id="snd" type="button" class="snd mono">` (element `8729dd17-a6c7-4faa-7ebf-0e67b9eea811`), same children moved in. Staging: identical computed style and position, click toggles "Sound on/off".
- **Services CMS (hidden, all 301):** WLAB links removed from Experiential `capabilities`/`faq` and AV Systems `faq` (LED answer now points to ledwall.nyc only).
- **/interactive:** BreadcrumbList added to page JSON-LD (Home › Services › Interactive & tracking).
- **Blog:** BlogPosting + BreadcrumbList embed appended to the body of the 9 older posts (subagent); verified on staging, all parse. None has images or FAQ sections.
- **Not done (needs owner):** `/service/experiential` 301 → change target to `/nyc/experiential-production` in Site settings → Publishing → 301 redirects (API needs Enterprise; dashboard not signed in in the agent browser).
- **Left as is on purpose:** footer "Solutions" → `/#solutions` (valid homepage section, different from the nav "Rentals" link); H1s without "NYC" (titles/descriptions carry NYC; H1 copy is a design choice); NYC JSON-LD injected by JS (Google renders JS).
- CONTEXT.md updated (IDs, nav, design, scripts, structured data, redirect note).

## Round 3 (owner: "1-3执行，4 6 7 8你操作浏览器完成 …") — published live 2026-11-23
- **Live publish** of the inventory-fix batch + everything below (possibleav.com + www). Live check: sound `<button>`, 6 script tags on home, redirect, blog JSON-LD, /interactive breadcrumb, no "speakers for the room", deleted pages 404, sitemap 77 URLs.
- **Assets:** deleted the unused asset whose filename held a client name (`6af3d16e9b2449ac2602e638`). Deleted the old LA image asset `6af3c299c8fbb2eedeccc0e1` on the sister site (owner OK; CMS copies are separate files).
- **Blog:** the 11 posts that already had JSON-LD used `https://www.possibleav.com`; now apex `https://possibleav.com` (subagent; JSON still parses).
- **Redirect:** `/service/experiential` now → `/nyc/experiential-production`. Done in the Webflow dashboard via the owner's Chrome (delete old row + add new; rows can't be edited in place).
- **Designer (Chrome):** deleted 20 pages — `untitled`, `untitled-2/-3/-4`, `home-native-draft`, `nx-scratch`, and the 15 old `-nyc` draft pages. Each slug was checked against an allowlist before delete. Deleted the 2 Site Images items (unused on all 76 pages) and the Site Images collection + template.
- **Work CMS:** permanently deleted the 2 archived items (`…f41`, `…f43`).
- **New case study** (owner's real three-city LED job; client deliberately not named, FLORA images only): Work item `6b04ae01d4cb34c83a90ad59`, `/project/three-city-led-wall-campaign` — 1.8 mm LED walls (4×7 cabinets NY/Chicago, 4×4 LA), flown with the crew, installed in four days, four-week run. Cover asset `6b04addbde9d83bf26bc9e00`. Static card added after the LA card on /work (card `c71146f7-c7ed-49e7-4e18-83f8bbd4192e`; dl built with the WHTML builder because DOM dt/dd can't take text via the element builder; stray `class` attributes removed).
- **Touring:** FLORA load-in photo (asset `6b04addb143ba43ca7192de3`) added under "How the equipment travels" with new class `nv-tour-img` (16:9, 18px radius). Owner confirmed the "ship ahead" sentence is fine.
- FLORA: 4 images on `t2i-elote-gateway`, $0.052 each ($0.208).
- Owner said the LA cover photo is fine as is.

## Gotchas (round 3)
- Webflow pages and collections can only be deleted in the Designer UI; the Data API has no delete. Collection delete stays disabled until it has 0 items.
- `/work` cards are static elements, not a CMS list — a new Work item needs a card added by hand.
- Shell can't fetch media.flora.ai either; convert/upload images in the browser (canvas → JPEG → MD5 → `create_asset` → S3 POST).

## Round 4 — Instagram + two-way sister links (STAGED, awaiting owner OK)
Owner: "让possible和ledwall互相外链，顺便 Instagram 找个地方挂".
- NX Footer component `fcf0ee38-0d76-5cd2-c260-debfab4e501c` (27 instances, incl. home): new link `b42615c1-12ac-ef88-5425-1172da2636ee` "Instagram ↗" → https://www.instagram.com/possible.av/ (target _blank, rel noopener, class hn-plain-link), after ctrlp.studio in the "Also ours" column.
- Site head JSON-LD: LocalBusiness gets `"sameAs":["https://www.instagram.com/possible.av/"]`; rest of the head block unchanged.
- Possible AV → ledwall.nyc already linked from 16 pages + footer; the reverse (ledwall.nyc → possibleav.com) is now in body copy on its 3 event pages (logged in that repo, v5.162).
- Verified on possibleav.webflow.io: /, /faq, /audio, /blog each have 1 Instagram link + sameAs.
