# Session log — 2026-11-12 — Touring page, Brooklyn wording, client names removed

Continues `2026-11-11-nyc-local-seo.md`. Ran 2026-11-12 from ~00:00 to ~00:50 New York time (05:00–05:50 UTC). Client, artist and collaborator names are left out of this public file on purpose.

## 1. Owner requests and decisions (in order)
1. Keep the NYC focus on Home, About and Services, add one line to each saying the crew flies in with the gear, and link to the out-of-town work. **"Don't mention the Navy Yard for the address, just say New York."**
2. Also build the proposed page **"Touring & Out-of-Town AV"**: how the gear travels and how a multi-city tour runs (one kit, one playbook, several cities), aimed at searches like "AV company that travels" and "touring AV crew".
3. **"But mention that we're a Brooklyn company."** → Agent settled on "Brooklyn, New York" everywhere *(the exact wording was the agent's choice; inferred to satisfy both instructions)*.
4. **"Don't mention clients."** (The owner's reason is private and left out.)
5. Agent asked whether to anonymize the older case studies, which also named clients. Owner: **use generic labels** (泛称).
6. Owner sent a screenshot of two Work cards: **the left one (LA) gets renamed only, so keep its photo. The right one (Times Square) is removed entirely.**
7. **"Touring needs an entry in the menu too"**, and remove the New Orleans entry from the Touring page's city list.
8. **"Hide the French Quarter haunted house too"** (the New Orleans case study).
9. Owner asked for this ops-log update.

## 2. Changes to the live site
Site `6a34a7893bca7b2b60e5eac7`. Element IDs are given as `element` inside the page's `component` (= page ID).

### Brooklyn, New York wording (Navy Yard and street address removed)
- **Footer on every static page.** The `pa-mono-meta` line now reads "Brooklyn, New York — Available everywhere." and the copyright reads "© Possible AV. Brooklyn, New York."
  - Home `242676a8-a4b8-9b0f-3fa1-994eaee910fe` / `…9112d`
  - About `dea41eb9-637c-9b1e-f854-456a79f5d85e` / `…d88d`
  - Services `cdc736f7-80b3-f819-d6ce-5babd124d9f8` / `…da27`
  - Industries `4893a07c-e1ab-61e6-0b35-bba17acdbe60` / `…be8f`
  - Work `65806f2d-d059-97a7-2396-5814d36c18f6` / `…1925`
  - Blog `72eff154-eb6f-02bb-ecb5-b7e94fd080af` / `…80de`
  - Pricing `6359dff3-fbf1-f32c-dbd8-466bf07a34e9` / `…351c`
  - FAQ `bcc3781d-46f6-a3c7-c954-5ad6055aa122` / `…a155`
  - Contact `220da038-bbd9-08a3-b2ec-03fc95a08f6e`
- **Home**
  - Stat number `7777375f-5fee-d504-b0b7-f3e97642bd81` = "Brooklyn"; stat label `4ca45eae-69e5-3ae6-a1fe-873bd4fcbf04` = "New York home base" (previously a Navy Yard label).
  - Eyebrow `ec7d56fc-6c14-57ec-b0c6-fca00cfe1992` = "Brooklyn, New York · crews fly anywhere".
  - Hero eyebrow `5d0b151c-f253-4d18-7ae9-d34def197175` = "AV systems · projection · audio · network — Brooklyn, NY, deployed anywhere".
  - Hero sub `5d0b151c-f253-4d18-7ae9-d34def19717b`: "…travel with it…" → "…fly it to your city…".
  - The "prep every case before it leaves Brooklyn" line `036f7ad1-06b5-c743-6f6d-9b97262a911f` was set to New York, then back to Brooklyn.
- **Contact**
  - h3 `73d14464-f068-db79-96a1-7c0a63385a0a` = "Brooklyn, NY".
  - Meta line `220da038-bbd9-08a3-b2ec-03fc95a08f3f` = "A Brooklyn, New York company serving all five boroughs. Outside NYC, our crew flies in with the gear." (This replaced the full street address added the night before.)
- **FAQ:** answer `a1a9a105-a9ff-9fe9-3ead-53c68da5827b`, which said the company was based in the Navy Yard, now reads "We're a Brooklyn, New York company. We cover all five boroughs, and outside NYC our crew flies in with the gear — nationally and globally."
- **SEO**
  - Home description → "Brooklyn, New York AV production company — … with crews that fly anywhere."
  - About title → "About Possible AV — Brooklyn, New York AV Production Company"; description → "…serving all five boroughs and flying crews nationwide. Part of WLAB, sister studio to ledwall.nyc."
- **Site head JSON-LD** (rewritten): `LocalBusiness` with address = Brooklyn, NY, US and **no street or ZIP**. areaServed now includes Country "United States". knowsAbout now includes "Touring AV".

### Touring & Out-of-Town AV page
- **Created:** page `6af5488a42e3ba43c291bc3f`, slug **`/touring-av`**, built with `create_page` + `duplicateOf` About (`6a34f3bdbee39509ab20e532`).
  - SEO title: "Touring & Out-of-Town AV Crew from New York | Possible AV".
  - Description (final): "A Brooklyn, New York AV company that travels. We pack our own gear, fly the crew in, and run events and multi-city tours in Chicago, LA, San Francisco and beyond."
- **Copy.** Element IDs are the same as on About.
  - Hero: eyebrow "Touring & out-of-town AV · Brooklyn, New York"; H1 "A touring AV crew from New York — one kit, one playbook, every city."
  - "How the gear travels — 03 steps" (cards):
    - Built and tested before it leaves (Brooklyn shop).
    - Packed to fly with the crew (road cases sized for checked baggage; larger systems ship ahead).
    - The same crew, load-in to strike.
  - "Multi-city tours — How we run them": "Three cities. One kit." One LED wall toured New York, Chicago and Los Angeles with one set of panels and one playbook.
  - "Where the crew has flown" stats: Chicago (Multi-city LED tour), Los Angeles (LED tour · live music launch), San Francisco (Brand pop-up).
  - Callout plus one button to the LA case study.
  - CTA: "Tell us the city. We'll bring the system."
- **Removed from the Touring page** after owner requests 4 and 7:
  - Client names in the tour copy and stat labels.
  - The New Orleans stat block `3053b098-7534-9836-3bb6-3cfe420fed25`.
  - The New Orleans case-study button `ceba2613-8e8b-181b-d6d3-b601cbb4c87e`.
  - New Orleans in the lede and the SEO description (replaced with San Francisco).
  - The remaining button `3341151f-7cd1-e1d9-59ca-1b2c238ec1fd` links to `/project/la-secret-show-led-wall`.
- **The "STUDIO / INVENTORY IMAGE" placeholder** inherited from About is still on the page.

### Links to Touring
- **Inline paragraphs** (`data_whtml_builder`, class `pa-lede`, link to `/touring-av`):
  - Home `b69ae298-22d6-9f3a-3836-08c4a4100996`, after the hero sub.
  - About `7081793d-5762-abe7-f201-51d86704c88d`, after the hero lede.
  - Services `00001b14-31a9-e149-f76b-b88b976188e6`, after the hero lede.
- **Nav item "Touring"** (`<a class="pa-nav-link" href="/touring-av">`), inserted after "Work". The nav is hand-built on every page, not a shared component, so it was added to 13 pages:

  | Page | Inserted element |
  |---|---|
  | Home | `0f3d84f8-7d79-58ee-b4f5-7e8485b2fa84` |
  | Services | `b53b90c3-abdb-8890-5d73-2fbb8431e467` |
  | Industries | `29d472a5-7e28-c1c1-38f2-c18f87d7806c` |
  | Work | `34d6f922-5745-727d-0c0b-1cdc72bb6c37` |
  | Blog | `9cf8d8dd-6513-46ca-e624-4a91dd88f5e3` |
  | About | `97110083-b039-401b-9873-9770f516d27f` |
  | Contact | `854cf3cf-b4bc-67c8-6fd3-1570e84f035f` |
  | Pricing | `095c7c23-6588-9b98-3668-2a445623f279` |
  | FAQ | `8414fa67-d7b0-aea7-1c6f-b6180491ecf8` |
  | Touring | `90173e6d-ab37-d84d-8020-0561949ee63c` |
  | Blog post template `6a34e9e8383e05c75c473534` | `cac3e0cd-2115-6937-bebe-9f5abfdfcf3f` |
  | Work template `6a34e9e8f829ac7e5e3ad13e` | `21683304-472b-766e-270f-0cff52b8bb86` |
  | Industries template `6a34e9e6f829ac7e5e3ace87` | `a9308caa-08e6-9769-014d-c9ac0862e8c3` |
  | Services template `6a34e9e6383e05c75c473484` | `e9088fec-9056-3af7-1ebd-aec26d29413e` |

  The four draft duplicate pages and the Site Images template were not changed.

### Case studies: generic client labels and hidden items
Work collection `6a34e9e7f829ac7e5e3acee3`.
- **LA item `6af3d19707c27589ef878f3f`.**
  - Renamed "Secret show LED wall, Los Angeles", slug **`la-secret-show-led-wall`**.
  - `client-type` set to "Beauty brand".
  - Summary, background, did-list, meta-title and meta-description rewritten without artist, brand or agency names.
  - Cover: kept the same photo, with new alt text. Setting it again created a new file entry `6af54af3114f46e82ae3d565`.
- **Times Square item `6af3d19707c27589ef878f41`.** It was first renamed generically (slug `times-square-interactive-led-wall`, "Restaurant brand", cover removed). Then, per owner request 6, it was **unpublished and archived**.
- **New Orleans item `6af3d19707c27589ef878f43`.** It was first renamed generically ("French Quarter haunted house", slug `new-orleans-haunted-house`, "Spirits brand"). Then, per owner request 8, it was **unpublished and archived**.
- **Old slugs.** All three items' previous slugs contained project, artist or brand names. Those URLs now 404, and no redirects were added on purpose.
- **Work page static cards:**
  - LA card `ad8d1984-3036-3c3d-e0da-8f5c3c480988`: title `…480984` = "Secret show LED wall, Los Angeles"; link → `/project/la-secret-show-led-wall`. Thumb `…48097f`: the class `pa-cover-7` was removed by mistake, then restored, so it is `pa-work-thumb` + `pa-cover-7`.
  - Times Square card `1e88df62-c6f4-60b5-dec6-3ec1c3a8b92c`: **removed**.
  - New Orleans card `263b7379-5b40-4ce6-fcb1-2fd21b4e9cae`: **removed**.

### Publishes
All were full-site publishes to `www.possibleav.com`, `possibleav.com` and the Webflow subdomain, on 2026-11-12 (times are UTC):

| Approx. time (UTC) | Task | After |
|---|---|---|
| ~05:05 | `1a1018e8-b89b-4eee-b919-dc7d34f2922a` | Brooklyn wording, Touring page, inline links |
| ~05:10 | `37733129-a55c-4bba-a6a3-3ab660b577e5` | Client names removed from Touring |
| ~05:13 | `a17b7501-4b23-49aa-93f7-6d862b13fc5a` | Generic case studies, Times Square removed |
| ~05:18 | `1820c348-fcfb-4c1b-90e7-7e1171b361e2` | Nav item, New Orleans hidden |

## 3. Owner rules that came up
- Describe the company as **Brooklyn, New York**. No Navy Yard and no street address, on the site or in the schema.
- **No client names anywhere.** That includes artists, agencies and collaborators named in case-study copy, image alt text and slugs. Use generic labels such as "Beauty brand".
- A case study the owner wants gone is **hidden** (unpublished, archived, card removed). It isn't rewritten.
- **Touring** has its own nav item, placed after Work, on every page.

## 4. Gotchas and workarounds
- **`create_page` with `duplicateOf` keeps every element ID.** Only the component (page) ID changes, so About's element IDs work directly on the Touring page.
- **`data_whtml_builder` worked** for inserting paragraphs and nav links. Each action needs a `build_label`, and the existing class is reused when `class="pa-lede"` / `"pa-nav-link"` is passed without CSS. *(Relevant to the ledwall.nyc field-guide note that says "never whtml_builder"; it worked here.)*
- **Searching nav links:** `query_elements` with `element_filter: {style: "pa-nav-link", text: "Work"}` returns nothing, because the text sits in a child String node. Filter by style only and read `settings.link.href`.
- **Permanent CMS delete** (`delete_collection_items`) was **denied by the agent's permission classifier** ("Irreversible Deletion"). That denial also stopped the other actions in the same batch. Workaround: `unpublish_collection_items`, then `update_collection_items` with `isArchived: true`.
- **`asset_tool > upload_image_by_url` failed:** the Designer bridge wasn't running. It was meant to re-upload the LA cover under a generic filename, so that filename still contains names.
- **`element_snapshot_tool`** returned `{"status":false}`, also with no Designer open.
- **CMS image file IDs are not asset IDs.** `get_asset_preview` on a cover `fileId` returns 404.
- **Thumbnails are CSS classes:** the Work page thumbnails get their images from combo classes (`pa-cover-7`, `pa-cover-8`), not from image elements.
- **WebFetch:** `https://www.possibleav.com/touring-av` returned client_error twice right after publishing, while `https://possibleav.com/touring-av` loaded fine later.

## 5. Verification (2026-11-12, ~00:50 New York time)
- **WebFetch of live pages:**
  - `www.possibleav.com/`: SEO title matches; the nav shows Services, Industries, Work, **Touring**, Pricing, About, Blog; the H1 matches; no Navy Yard, no New Orleans; the "see how touring works" link resolves to `/touring-av`.
  - `possibleav.com/touring-av`: the H1 matches, the nav includes Touring, and there are no client names and no New Orleans.
  - `www.possibleav.com/work`: seven cards (multi-city pop-up, museum gallery, general session, retail window, festival stage, lobby, LA secret show). No client names, no New Orleans, no Times Square.
- **Sitemap API:** `/touring-av` has `includeInSitemap: true`. The live Work items list shows 7 items, and the two archived ones are absent.
- **Not verified:**
  - Live text of About, Services, Contact, FAQ, Pricing, Industries and Blog.
  - That the JSON-LD renders in the live `<head>`.
  - Mobile nav layout with 8 items.
  - The visual result of the inserted `pa-lede` paragraphs.
  - That the old case-study URLs return 404.

## 6. Open items left
- **LA case-study cover:** the photo visibly shows a name on the banner, and the image's file URL contains names. The owner chose to keep the photo; it can be swapped or cropped and re-uploaded under a generic filename (needs the Designer bridge or `create_asset` + S3 upload).
- **Archived items:** the two archived Work items can be permanently deleted from the Webflow dashboard if the owner wants (the API delete was blocked).
- **Touring page claims and photo:** the claim "larger systems ship ahead to the venue" was the agent's wording and hasn't been confirmed by the owner. The image placeholder still needs a real photo.
- **Mobile nav:** check it with the extra item.
- **Out-of-town case studies:** only LA is visible now. Add more as the owner provides details, written without client names.
