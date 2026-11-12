# CLAUDE.md — Possible AV: how to work in this repo

Possible AV is the AV / projection / audio / network / experiential studio in the WLAB site family (sister to ledwall.nyc). **The live site is on Webflow** (site **Possible AV** `6a34a7893bca7b2b60e5eac7`, domains `possibleav.com` + `www.possibleav.com`). This repo holds the original React/Vite prototype (`src/`) and, from 2026-11-12, agent working notes in `ops-log/`.

## Golden rules
1. **Don't change the site code in `src/`, `public/`, `index.html` or config** unless the owner asks. The Webflow site is the live source now; the prototype is reference.
2. Notes, logs, context and progress go in **`ops-log/`**, never mixed into site files.
3. **This repo is public.** Don't commit client names, private business details, pricing negotiations, credentials or anything personal. Keep reasons for owner rules out if they're private; just write the rule.

## Start of a session
Read `ops-log/CONTEXT.md` (owner rules + IDs) → `ops-log/PROGRESS.md` (what's live, open items) → newest file in `ops-log/sessions/`.

## Doing the work
- Edit the live site through the **Webflow MCP Data API** (pages, elements, styles, CMS, assets, publish). The Designer bridge is only needed for `upload_image_by_url`; images can also be uploaded via `create_asset` + a POST to the returned S3 URL (see the ledwall.nyc repo `ops-log/sessions/2026-11-12-led-screen-services.md` for the recipe).
- Images: generate with **FLORA**.
- Follow the ledwall.nyc site's copy style and per-page section layout, but keep Possible AV's **own visual style** (lit dark "console" look, approved 2026-11).
- **Publishing:** ask the owner before a full-site publish to the custom domains.

## End of a session
1. Add `ops-log/sessions/YYYY-MM-DD-<topic>.md`: owner requests in order, every change with Webflow IDs, gotchas, verification.
2. Update `ops-log/PROGRESS.md` (and `CONTEXT.md` if a rule changed).
3. Commit on a branch (`kevin/<task>`), open a PR, then merge.
