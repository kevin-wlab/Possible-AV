# Resume here

## FIRST (owner, 2026-11-15 04:31): the redesign goes LIVE on Webflow, not just the prototype
**Owner, 04:34: the new site REPLACES the whole of possibleav.com.** Every live page moves to the new design, not only the pages built so far:
Home, Services (+ the nine service pages), Industries, Work (+ CMS Work template), About, Blog (+ post template), FAQ, Pricing, Touring, Contact, Get a Quote, Services/Industries CMS templates, 404.
**Owner, 05:09: About page must be done too (new design).** Rules for it: no team introductions, no Navy Yard or street address (company is "Brooklyn, New York"), no WLAB mention or link, no client names, no invented numbers; lead with turnkey / everything in-house, the nine services, NYC + travelling crew. Also fix its SEO description, which still says "Part of WLAB, sister studio to ledwall.nyc".
**Owner, 04:38: also finish the six unfinished service pages** (Lighting, Live video, Networks, Interactive, Fabrication, Logistics), each built to the same standard as Audio/Displays/Projection, then put on Webflow the same way and checked against the prototype before publishing. Order: (1) shared nav/footer + Get a Quote + Home + Services + Audio/Displays/Projection on Webflow, (2) the six service pages one at a time, each straight onto Webflow when done, (3) the remaining site pages (Industries, Work, About, Blog, FAQ, Pricing, Touring, Contact) in the new design.
**Owner, 04:37: it must look EXACTLY like the prototype ("完全不走样"), and every problem must be fixed before reporting.** For each page: publish to the webflow.io subdomain first, screenshot it at 1280x800 and 390x844 at the same scroll stops as the prototype (ft.sh / filmshot.py, and the built-in browser for the live URL), compare side by side with the prototype (fonts, spacing, colours, nav, captions over the 3D, transitions, at-a-glance, examples, footer, form), fix every difference, then publish to the custom domains. Report to the owner only after the comparison is clean, with the before/after evidence.
**Owner, 04:36: wants to keep editing in Webflow → USE THE HYBRID ROUTE (supersedes the embed-only plan below).** Feed the prototype's own HTML + CSS through data_whtml_builder so every text, image, card, button, FAQ, nav and footer becomes a NATIVE, editable Webflow element with classes (no redesign, same markup). Keep custom attributes (data-s, data-i, data-go) so the scripts still find the captions and rail. Only the 3D canvas and its scripts stay as code: an empty Embed holding <canvas id="stage">, plus page custom code loading three.js and the page's model/film JS from jsDelivr (public repo). Images → Webflow assets so they can be swapped in the Designer. Native Webflow form on Get a Quote. Verify whtml keeps attributes and the CSS classes; if an attribute is dropped, set it with data_element_tool > set_attributes.
**Owner, 04:35: asked whether it can go up directly instead of being rebuilt. Answer given: yes. Default plan unless the owner says otherwise:** each page in Webflow = one HTML Embed with the page markup + page custom code loading the CSS/JS from the public GitHub repo via jsDelivr (cdn.jsdelivr.net/gh/kevin-wlab/possible-av@<commit>/web/...), images uploaded as Webflow assets (or served the same way). Keep slugs + SEO titles in page settings. Get a Quote: keep the native Webflow form element (style it with the same CSS), not a form inside the embed. CMS pages (Blog/Work templates) stay native Webflow, restyled with the same CSS. Check Webflow embed/custom-code size limits first and split large scripts into hosted files.
Fallback plan (only if the direct route fails): one shared design system in Webflow (styles from the prototype: bg #ECE9E3, ink #1A1A18, amber #E8892D, Geist/Geist Mono, frosted nav, footer without WLAB), rebuild each page in it, keep URLs/slugs and SEO titles (they carry the NYC SEO work), keep the native form. Work in Webflow without publishing until Home + Services + Get a Quote + the shared nav/footer are done, then publish; after that publish page by page as each is finished. Delete the 4 draft duplicate pages (untitled…untitled-4) only after asking.

The owner is redoing the whole site; the new design is what should be on possibleav.com. Before more service pages:
1. Rebuild /get-a-quote (Webflow page `6af97b78d8e68fc36722099d`, live since 04:30 in the OLD style) in the NEW design, keeping the native Webflow form (form name "Possible AV Project Inquiry", fields Name, Email, Company, Event Type="What do you need?", Location and Date="Where and when", Budget Range, Message). Use data_whtml_builder with the prototype's CSS tokens (bg #ECE9E3, ink #1A1A18, amber #E8892D, Geist/Geist Mono) and the frosted nav.
2. Port the finished prototype pages into Webflow (staging first, then publish): Home (studio 3D homepage or the product-film one), Services, Audio, Displays, Projection. 3D: page-level custom code / HTML embed loading three.js from cdn.jsdelivr.net with the models inlined; images uploaded as Webflow assets.
3. Site-wide: footer still says "WLAB ↗" / "WLAB Virtual Production ↗" and the old Contact page mentions WLAB; remove (owner rule: no WLAB on Possible AV). Contact email wlab@wlab.tech stays.
Then continue the remaining service pages one at a time.


## Webflow port status (2026-11-15, later)
Method (tools in possible-av/ops-log/wip/): `port.py` (split prototype → web/<k>.css/.js/.ui.js + port/<k>.body.html; prepends a reset of Webflow's base styles; tiles/menu buttons → real links), `frag.py <k>` (top-level fragments + neutral class CSS), `acts.py <k> <pageId> <anchorId> <idx>` (whtml actions, img src stripped, prints asset ids in order → set_image_asset), `code.py <k> <sha>` (page head/footer code: guard.html + fonts + css + importmap / ui.js + module js). guard.html removes the old site-wide theme scripts' styles (pawf, seriestheme, padark1-10) on new pages; drop it once the old registered scripts are removed site-wide.
Check: built-in browser on possibleav.webflow.io, two iframes (Webflow page vs web/ref/<k>.html from jsDelivr), compare computed styles + rects of every element (`cmp`), at 1280x800 and 390x844, plus screenshots. Only accepted difference: nav highlights the current section.
| page | Webflow page id | state |
|---|---|---|
| Displays | 6af9a6c59d106ee114ca64c8 | native, staged, check clean |
| Projection | 6af9a6c6e699303789abd33a | native, staged, check clean |
| Audio | 6af9a6cae699303789abd3d9 | native, staged, check clean |
| Services | 6a34f354a49eba40de650fca | old content replaced, staged, check clean (old ref with buttons) |
| Home | 6a34a78c3bca7b2b60e5eae5 | old cd-root replaced, staged, check clean |
| Get a Quote | 6af97b78d8e68fc36722099d | new design (web/quote.css), native form moved in, classes ql/qi/qsend/qmsg, placeholders set by quote.ui.js only when Webflow default; staged |
About SEO description fixed (no WLAB). 13:05 asked owner: publish custom domains now (mixed old/new) or after About etc.; default = wait, keep building.
| Lighting & staging | 6af9b2f937d7fb834f3f6e33 | NEW: film rebuilt with LG=12 spacing + sets shown only near their stop + range scales in/out; glance stills + 4 FLORA examples; staged, check clean desktop+phone. Home film/glance and Services tab updated to include it. |
| Fabrication | 6af9b7a30d2c80a7e329f28d | NEW: sets 13 m apart, chair moved out of the text, farm moved out; stills + 4 FLORA examples; staged, check clean desktop+phone. Home caption/rail/card + Services link added in place (no full re-import). |
| Networks & computers | 6af9bb66072856e73f5ee163 | NEW: event kit / range / rack / workstation / tower film, NG=12; stills + 4 FLORA examples; staged at sha 3a5d683, check clean desktop+phone; Home caption 05 + card, Services link added. |
| Live video & visuals | 6af9c0ab47d68d8c7ce5f08b | NEW (slug live-video): camcorder on tripod + stream kit / range / streaming with LIVE tally + signal pulse / flypack lid lifts to multiview / VJ laptop + pads + audio-reactive screen / hybrid panel with PTZ and remote tiles. LG=12. 5 stills + 4 FLORA examples. Staged at sha 800c094, check clean desktop+phone. Home: caption 05 inserted (ad811dca), Networks→06, Fabrication→07, close→8, rail relinked, card ee124b63. Services: placeholder replaced by button ebcc5029. |
| Interactive & tracking | 6af9c4d92742afeb22aafb4d | NEW (slug interactive), 8 stops (IG=12): portrait screen + sensor / range / interactive floor under truss goal post with footprints / depth sensor frustum + floor tiles / 6 mocap cameras + wand + rays / RFID reader + badge + welcome screen / torus-knot sculpture wireframe→solid + render screen. Uses @models: live-video (lvBigScreen, lvCase). 6 stills + 4 FLORA examples. Staged at sha d5b6579, check clean desktop+phone. Home: caption 07 (2165ce0d), Fabrication→08, close→9, rail 6d618297/807de58e, card 05f4abe1. Services button 215e2a67. |
| Logistics & touring | 6af9c9136be449de58147c70 | NEW (slug logistics), 6 stops (GG=16, #floor 690vh): case + stacked dolly / range (cases, stack, box truck) / truck at our dock, door rolls up, cases roll out (island rotated -0.9) / liftgate lowers a case at the door + open case / touring route with NEW YORK pin and mini truck. 4 stills + 3 FLORA examples. Staged at sha 166c054, check clean desktop+phone. Home: caption 09 (dbd8269d), close→10, rail 86f757d4, card 6013d8aa. Services button 37b9561b. |
**All nine service pages are on Webflow staging.** Follow-up: chips on Lighting/Fabrication/Networks/Live video/Interactive pages still link /services#<key> for later pages; works, but could point to the pages directly (update source bodies + Webflow links together so ref check stays clean).
New-page recipe: finish src/film/pages/<k>.*, add k to LIVE in port.py and mk_home.py, img/home-<k>.jpg + port.py mapping, `./release.sh "msg"` (build+port+ref+commit → sha), upload stills/examples from the browser with ops-log/wip/upload-helper.js (only name,id,date,signature needed from create_asset; shell can't reach media.flora.ai or website-files), append ids to port/assets.txt, create page, nav/footer instances, frag.py + acts.py, set_image_asset, code.py <k> <sha>, update every page's code to the new sha, staging publish, chk() at 1280 and 390.
Custom domains NOT published yet (old site still live there). Nav component Menu link → #menu, role=button.

Live prototype: artifact `218911a6-2058-422c-9113-fe52218f7b5c`, version `1794735156-3c81`, read=public
(republish with shared_live "public", artifact_title "Possible AV — homepage prototype: the studio").
Live pages: index.html (3D studio homepage), services.html, audio.html. Release build: `python3 mk2.py --live audio[,key…]`.

## Done and live
- Solutions rows link to real targets; homepage card links go to services.html#<key> / audio.html; quote buttons → #quote.
- Process step lines fixed (rule on each li).
- "room" → venue / space / event everywhere (rule also in AGENT_BRIEF.md and ops-log/CONTEXT.md to add).

## Service pages: stopped mid-way, files kept (src/film/…)
| page | model | page module | body copy | state |
|---|---|---|---|---|
| displays | done | done | done | **LIVE** (v12, 4 example projects) |
| lighting | 45 KB | started | partial | needs finish |
| fabrication | 45 KB | started | written | needs finish + review |
| networks | 49 KB | – | – | model only |
| projection | done | done | done | **LIVE** (v13.1: panels mapping + object mapping) |
| live-video | done | done | done | **on Webflow staging** |
| interactive | done | done | done | **on Webflow staging** |
| logistics | done | done | done | **on Webflow staging** |

Brief for each page: AGENT_BRIEF.md. Test: `ft.sh <slot> <page> stops|cam|thumb|glance` (never pipe into tail/head).

## Plan agreed
1. Finish displays, lighting, fabrication, networks; review closely; add labelled example projects (FLORA $0.088/img); publish.
2. Build the new homepage film (mk_home.py) from the finished pages; then the remaining four pages.

## Notes for the next pages
- Space groups ~12 m apart (const DG=12), not S, so the next item slides in as the last leaves; make any line-up step aside (scale away) after the range shot.
- Wording: "space" / "project", never "room"; "venue" only in a list of place types.
- Owner facts (2026-11-15): Epson laser projectors at 7,000 lumens; projection use cases include immersive exhibitions; projectors hung from ceiling/truss mapping one picture across screens of different sizes (owner project reference); turnkey/all in-house is a main selling point.
