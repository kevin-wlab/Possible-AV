# Brief: move one Webflow page's external CSS to native Webflow classes (Possible AV, site 6a34a7893bca7b2b60e5eac7)

Goal: page looks/behaves EXACTLY the same, but every style that Webflow can express natively lives in Webflow classes; only what can't (JS state classes like .on/.open/html.lite, pseudo-elements, keyframes, >=1100px tweaks, 3D/canvas UI, rules also hitting nav/footer) stays as residual CSS. Verify with an in-page A/B diff = 0.

Rules: do NOT publish to custom domains (possibleav.com) — staging only (publish_site with customDomains [] and publishToWebflowSubdomain true; max 1 publish/min site-wide, other agents also publish — on rate-limit wait 60s and retry). Do NOT git commit. Do NOT touch the NX Nav / NX Footer components, other pages, or classes with other prefixes. Never rename/delete existing classes. Keep every element's existing classes (native class is added as a combo on top). Repo is public: no client names in files.
Webflow MCP: session_id ses_3MFuvc6c0nFzzoe9cfRiBWdxG7E on every call; your own agent_id like opus-5.5|claude-ai|<5 chars>, constant. Load tools with ToolSearch (select:mcp__Webflow__data_element_tool,mcp__Webflow__data_style_tool,mcp__Webflow__data_scripts_tool,mcp__Webflow__data_sites_tool,mcp__Webflow__data_pages_tool). Browser for verification: mcp__remote-devices__Claude_Browser__* (built-in browser; other agents share it — open your OWN tab with preview_start and pass its tabId on every call; close it when done; don't resize other tabs; resize_window applies per tab).

Tooling (dir /home/claude/possible-av/ops-log/wip/native, see the homepage precedent in ../../sessions/2026-11-19-home-native-migration.md):
- migrate.py tree.json <css> out_dir "<region css selector>" <prefix>  → out_dir/plan.json + out_dir/residual.css
- actions.py tree.json <page_id> out_dir → out_dir/style_actions.json + el_actions.json (create_style/update_style + set_style batches)
- abcheck2.js — in-page A/B (set window.AB first, see header). Source CSS for each page is in srccss/<name>.css (exact version currently live).

Steps per page:
1. data_element_tool get_all_elements → save to <out_dir>/tree.json (out_dir = pages_native/<page-slug>/). Read the page head/footer code (data_scripts_tool get_page_freeform_code) and keep a copy in out_dir/head_before.html.
2. Choose the region selector = all static content outside nav/footer component instances and outside JS/3D-driven parts (e.g. 'main section.next, main section.svh, main .abstrip' — inspect the tree/CSS). Prefix: given in your assignment.
3. Run migrate.py, then actions.py. Sanity-check plan (class count, residual size). Fix the tooling only if needed for your page and keep fixes backward compatible.
4. Apply style_actions (data_style_tool, batches of ~25) then el_actions (data_element_tool set_style, batches of ~40). Retry transient "Conflict" errors. Read back the tree and confirm every planned assignment is present.
5. Head code: replace the <link rel=stylesheet ...web/<name>.css> with <style id="nx-residual">…residual.css…</style> (keep everything else in head/footer code exactly). If the head would exceed Webflow's custom code limit, stop and report instead.
6. Publish to staging, wait ~30s, open https://possibleav.webflow.io/<page-path> in your tab, set window.AB={scope:'<region selector>', prefix:'<prefix>-', newSel:'style#nx-residual', oldCss:'https://cdn.jsdelivr.net/gh/kevin-wlab/possible-av@<sha>/web/<name>.css'} and run abcheck2.js (paste its contents) at widths 1440, 1100, 768, 390 (resize_window your tab with width/height, reload, rerun). Target: 0 differences. Also run it with scope 'body' once at 1440 to make sure nav/footer/3D parts didn't change. If differences: fix (usually a breakpoint mapping or a rule that should stay residual), re-publish, re-check.
7. Also eyeball one screenshot per page at 1440 and 390 (3D pages: wait for load).
Report briefly per page: page id, prefix, #classes, #elements, residual size (bytes) vs original, A/B results per width, anything left unresolved.
