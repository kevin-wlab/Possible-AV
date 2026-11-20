# Brief: migrate old NYC landing pages into the NYC Pages CMS collection (Webflow site 6a34a7893bca7b2b60e5eac7)

Working dir: /home/claude/possible-av/ops-log/wip/native/nyc  (do NOT git commit; do NOT publish the site; do NOT touch old pages or the template).
Webflow MCP: session_id ses_3MFuvc6c0nFzzoe9cfRiBWdxG7E on every call; make your own agent_id like opus-5.5|claude-ai|<5 random chars>, keep it for all calls. Tools: mcp__Webflow__data_element_tool, mcp__Webflow__data_pages_tool, mcp__Webflow__data_cms_tool (load via ToolSearch "select:...").

Reference example (already done, verified pixel-identical): pages/sound-system-rental-nyc.json + ld/sound-system-rental-nyc.json, item 6b00cef30aed3a2cc9945636. Read both files and build_item.py first.

Per page:
1. Read the old page tree: data_element_tool get_all_elements on its page id. Structure: main > section.svh.abh (p.mono eyebrow, h1, p.sub, .ctas: btn "Get a quote →" + ghost = cta2 text/href), div.abstrip, then section.next blocks, each p.mono.eb + h2 (String text + optional Span = muted part) + optional p.lead + one of: ul.incl (li > b label + text), div.ways[.three] (div.way > b tag, h3 title, p text), div.chips (a text/href), div.faq (details > summary q + p a); last section #quote: eb, h2, p.lead, ctas.
   Text is split into several String nodes (e.g. "Speakers ", "&", " PA") — concatenate exactly, keep spaces. h2 main text keeps its trailing space when a muted span follows (e.g. "From one speaker ").
   Use the link's settings.link.href (NOT attributes.href, which can be stale) for chip/cta2 hrefs.
2. Map sections to keys in pages/<old-slug>.json (same shape as the sound example):
   a = the ul.incl section (first section; may have "lead"); b = first 2-col ways section (may have lead); b2 = 3-col ways.three section with a lead (stage only); b3 = second 2-col ways section (stage "how" only, no lead); c = the "where" ways.three section; related = section #more chips; also = section #nyc chips; svc = section #svc chips (av-rental only); faq = #qa; quote = #quote.
   av-rental has no #more (omit "related"); its #nyc section → "also", #svc → "svc".
   Omit keys that don't exist. images: take from images.json[old-slug]. seo_title/meta from get_page_metadata seo. name = page title without " NYC" suffix style, e.g. "Speaker rental".
   event-production-company-nyc ONLY: the H1 must mention NYC — insert "NYC" naturally (e.g. "... in NYC ..." / "NYC event production company ..."); report the exact old and new H1.
3. JSON-LD: data_pages_tool query_pages_schema_markup → save jsonLdSchema exactly to ld/<old-slug>.json (build_item.py rewrites old URLs to /nyc/...).
4. python3 build_item.py <old-slug> page → data_cms_tool create_collection_items on collection 6b00cac53ad9cb39f6e9d34d with that request; note item id.
   python3 build_item.py <old-slug> blocks <item-id> → create_collection_items on 6b00cac6053f1ddc0af1d8c1 (split into calls of <=40 items if needed). Collect the returned ids IN ORDER into /tmp/<old-slug>-ids.json (JSON list).
   python3 build_item.py <old-slug> refs /tmp/<old-slug>-ids.json → update_collection_items on 6b00cac53ad9cb39f6e9d34d for the page item with that fieldData.
5. Verify: list_collection_items / response shows every field set; counts of blocks per section match the old page (list items, cards, chips, FAQs). Double-check text against the tree.
Report: per page — item id, counts per section, any anomalies, and the EPC H1 change. Keep the report short.
