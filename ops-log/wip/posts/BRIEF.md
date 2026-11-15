# Brief for Possible AV blog posts (shared by all writers)

Possible AV (possibleav.com) is an AV rental, installation and event production company in Brooklyn, New York. Nine services, each with a page:
/displays (OLED TVs, touch screens with Android or Windows built in, transparent displays, playback stations), /projection (Epson laser projectors up to 7,000 lumens, projection mapping, home theater), /audio (speakers, PA, wireless mics, directional speakers), /lighting (Aputure lighting, modular stage decks, truss and rigging, lighting desk + operator), /live-video (streaming, switchers), /networks (UniFi event Wi-Fi, permanent networks, computer and workstation rental), /interactive (TouchDesigner installations, sensors and body tracking, full-body motion capture and tracking, RFID/NFC, real-time 3D content), /fabrication (custom builds, pop-up shops), /logistics (own truck and crew, touring).
NYC landing pages: /av-rental-nyc, /audio-visual-company-nyc, /event-production-company-nyc, /projector-rental-nyc, /sound-system-rental-nyc, /microphone-rental-nyc, /tv-rental-nyc, /event-lighting-rental-nyc, /stage-rental-nyc, /event-wifi-rental-nyc, /computer-rental-nyc, /experiential-production-nyc. Contact: /get-a-quote. Touring: /touring-av.
Existing posts you may link (as /post/<slug>): wireless-microphones-events-nyc, hybrid-event-av-streaming-guide, dante-audio-networking-explained, projection-mapping-101, how-much-does-event-av-cost-nyc, temporary-event-network-setup-guide, how-museums-use-interactive-av-in-2026, av-checklist-for-trade-show-exhibitors, what-is-ndi-and-why-it-matters, projector-vs-led-wall-which-is-right, how-to-plan-av-for-a-popup-event, permanent-av-for-showrooms-and-lobbies, multi-city-roadshow-av-planning.

## Goal
Rank on Google for the target keywords given to you. Write the genuinely most useful page for that search: answer the query in the first paragraph ("Short answer:"), then cover what the top results cover and more, with concrete practical guidance. Use the exact target phrase in the H1/name, first paragraph, one H2, and naturally a few times; use the related phrases in H2s/body. Mention New York where it fits naturally (not stuffed).

## Hard rules (owner rules — breaking any is a failure)
- Never mention WLAB, virtual production, VP, XR, LED volume, ICVFX, film/TV shoots.
- LED walls: only "LED walls are rented through our sister site ledwall.nyc" with link https://ledwall.nyc — don't push them.
- No client names, no street address (say "Brooklyn, New York"), no Brooklyn Navy Yard, no team members.
- No invented business facts: no prices or dollar figures, no "we've done 500 events", no years in business, no stats about us, no claims of stock we didn't list above. General industry facts/typical figures (deck sizes, lumens rules of thumb, rules of thumb) are fine when phrased as typical.
- Never say what Possible AV doesn't do. If something isn't listed, say "we source it".
- Never call the client's place "the room"; use space, venue (only in a list), event, project. "conference room" as a product term is OK.
- Plain, confident, practical English. No hype words ("cutting-edge", "seamless", "elevate", "unleash"). Short paragraphs.
- Do not use em dashes excessively; normal punctuation.

## Format (match existing posts exactly)
Write ONE file: /home/claude/pav-hero/posts/<slug>.json with keys:
name (the title, ≤ 80 chars), slug, category (one of: Planning, Technical, Guides), read-time ("N min"), excerpt (≤ 160 chars), meta-title (≤ 60 chars, ends with " | Possible AV" only if it fits), meta-description (140-158 chars), related-service (one key: displays/projection/audio/lighting/live-video/networks/interactive/fabrication/logistics), image-prompt (a photoreal image description for the cover, no people's faces close-up, no logos/text, NYC event context), image-alt, faq (list of {q,a} — 4 to 6, plain text, a = 1-3 sentences), body (HTML string).
Body HTML: starts with <p><strong>Short answer:</strong> …</p>, then the literal placeholder line <p>[[IMAGE]]</p>, then a one-sentence "This guide covers…" paragraph, then H2 sections (<h2>, <p>, <ul>/<ol> with <li><strong>X</strong> — text</li>), optionally one comparison table as:
<div data-rt-embed-type="true"><table style="width:100%;border-collapse:collapse;font-size:15px;margin:8px 0 20px"><thead><tr><th style="text-align:left;border-bottom:2px solid rgba(244,243,241,.35);padding:8px">…</th>…</tr></thead><tbody><tr><td style="border-bottom:1px solid rgba(244,243,241,.14);padding:8px;vertical-align:top">…</td>…</tr></tbody></table></div>
Then <h2>Frequently asked questions</h2> with each FAQ as <h3>q</h3><p>a</p> (same text as the faq list). End with a CTA paragraph linking /get-a-quote and the main money page(s). Include 3-6 internal links total, at least 2 to the money pages named in your task with keyword-rich anchor text (e.g. "stage rental in NYC"). Do NOT include any JSON-LD script (added later). 1,100-1,600 words. Use &amp; for & in HTML.
Validate the JSON with python3 -c "import json;json.load(open(...))" before finishing. Reply with just the file path and word count.
