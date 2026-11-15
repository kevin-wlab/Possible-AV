# web/ — files the live Webflow site loads

The new Possible AV design runs on Webflow as native, editable elements. What Webflow cannot hold natively is loaded from here through jsDelivr (`https://cdn.jsdelivr.net/gh/kevin-wlab/possible-av@<commit>/web/...`):

- `<page>.css` — the page's stylesheet, exactly as in the prototype, so the live page looks the same.
- `<page>.js` + `<page>.importmap.json` — the 3D film for the page (three.js).
- `<page>.ui.js` — small scripts (menu toggle, service tabs).
- `img/` — source images; the live site uses the copies uploaded to Webflow's asset library.

Built from the prototype sources by `port.py` (in the working folder, see ops-log/wip). Don't edit these by hand; rebuild and recommit, then update the commit hash in the Webflow page custom code.
