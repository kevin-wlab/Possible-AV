# Possible AV

Marketing site for **Possible AV** — professional AV systems, projection, audio engineering, and network infrastructure. Brooklyn Navy Yard–based, deployed globally. Part of the WLAB ecosystem; sister studio to [ledwall.nyc](https://ledwall.nyc).

> **We show up anywhere. We make it work.**

## Stack

- **React 18 + Vite** (same stack as `ledwall-nyc`)
- **react-router-dom** for client-side routing
- Plain CSS design system in [`src/styles/global.css`](src/styles/global.css) (class prefix `pa-`)
- Fonts: Fraunces (display) · Hanken Grotesk (body) · Space Mono (technical)

## Workflow

Same as ledwall.nyc: **code lives here in GitHub → the site is rebuilt/hosted on Webflow.** This repo is the source of truth for structure and copy. Content is kept in `src/data/*` so it maps 1:1 to Webflow CMS collections during the Webflow build.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Sitemap

```
/                         Homepage
/services                 Services overview
/services/:slug           av-systems · projection · audio · network · interactive-experience
/industries               Industries overview
/industries/:slug         brand-activation · retail-popup · museums-galleries · corporate-events · trade-shows
/work                     Case studies (filterable)
/work/:slug               Case study detail
/about                    About
/blog                     Blog index
/blog/:slug               Blog post
/contact                  Contact + quote form
```

## Content (→ Webflow CMS collections)

| File | Collection | Notes |
|------|------------|-------|
| `src/data/site.js` | Globals | nav, contact, stats, clients, sister studio |
| `src/data/services.js` | Services | 5 items |
| `src/data/industries.js` | Industries | 5 items |
| `src/data/work.js` | Work | **placeholder** projects — swap for real cases |
| `src/data/posts.js` | Blog Posts | 6 SEO drafts |

## To confirm / fill in

- Real contact email + phone (currently `hello@possibleav.com`, no phone) — see `src/data/site.js`
- Real domain
- Real case studies + images (work entries are flagged `placeholder: true`)
- All `IMAGE` / `PHOTO` blocks are intentional placeholders for real media

## LED walls

LED video wall work is intentionally **funneled to ledwall.nyc** throughout the site (home card, services overview, several service/industry pages, the projection blog post, and contact).
