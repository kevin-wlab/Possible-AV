# 2026-11-19 — Rental pages retargeted to rent-intent searches (no new pages)

## Owner requests (in order)
1. Study a competing NYC AV-rental site's structure and traffic; plan how to compete.
2. Prices: approximate ranges only, in the ledwall.nyc style (numbers to come from the owner). DJ gear: not now.
3. Compare their architecture to ours and say what to change.
4. "No extra pages for now — optimize the existing ones." ← this session's work.

## Approach
- Service pages (/audio, /projection, /lighting…) target service/design terms.
- The flat /xxx-rental-nyc pages target "rent" terms (speaker/PA, projector, lighting, stage, AV rentals).
- /av-rental-nyc is the rentals hub: in the nav and in every rental page's breadcrumb.

## Changes (Webflow, site 6a34a7893bca7b2b60e5eac7)
- **Nav** (component a415a5c0-3f98-ffd5-2742-9d64adf5e99c, link …e9a5): "Solutions → /#solutions" became "Rentals → /av-rental-nyc".
- **Meta titles + descriptions** (bulk_update_pages) on sound-system, audio, projection, projector-rental, lighting, event-lighting-rental, stage, av-rental, tv.
- **/sound-system-rental-nyc** (6afa011c1bf9aae0706191f2): H1 "Speaker & PA rental in NYC, with an engineer."; FAQ "How big a speaker or PA system do I need?" (guest-count rule of thumb) and "Can I rent speakers for a party in NYC?"; JSON-LD Service/FAQ/Breadcrumb synced.
- **/projector-rental-nyc** (6afa011b7bab2688e909c714): H1 second line "for events and movie nights." (…168c); FAQ q2 "Can I rent a projector and screen for a movie night?" (…f992); JSON-LD alternateName event/movie/laser projector rental, FAQ synced, breadcrumb via /av-rental-nyc.
- **/event-lighting-rental-nyc** (6afa011ef4cd507ac2475c79): H1 "Event, stage & theatrical / lighting rental in NYC." (…e648, …e64a); FAQ q1 "Do you provide an operator for stage and concert lighting?" (…7c85); JSON-LD name/alternateName (stage, theatrical, concert, uplighting), FAQ synced, breadcrumb via hub.
- **/stage-rental-nyc** (6afa011fbd094984ca50dd5e): H1 first line "Portable stage rental in NYC:" (…79f8); FAQ "What size portable stage do I need?" (…28c5); JSON-LD name "Portable stage rental…", FAQ synced, breadcrumb via hub.
- Published to possibleav.com + www (task 276679bf-5f0a-438e-a628-0a54334353a9).

## Gotchas
- Querying headings by tag "h1" returns nothing; filter by type "Heading". H1s here are String + LineBreak + String children; set_text each String to keep the break.
- FAQ answers that end in a link are a String + Link pair; only the String was left untouched this time.

## Verification
- Every set_text and the schema update returned success; schema read back matches.
- Live fetch was not possible from the cloud session (approval unanswered). Next session: check titles, H1s, nav and Rich Results on the live pages.

## Open
- Price ranges per rental page (owner to supply numbers).
- Delete the 5 draft pages (nx-scratch, untitled…untitled-4) — waiting for owner OK.
- Optional next: mic and TV rental pages get the same breadcrumb-via-hub treatment.
