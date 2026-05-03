# moeed-blog

Technical blog by **Moeed Rajpoot** — Claude Code, Claude Agent SDK, MCP servers, and AI agent engineering. Built with Astro, hosted on Cloudflare Pages, monetized through affiliate + sponsorship + lead-gen (not display ads).

## Stack

| Layer | Tool | Why |
|---|---|---|
| Framework | **Astro 5** | Best static-site generator for content sites in 2026 |
| Styling | **Tailwind + Typography plugin** | Fast, production-ready prose styling |
| Content | **Markdown / MDX** in `src/content/posts/` | Git-versioned, AI-editable |
| Search | **Pagefind** | Static, instant, zero-runtime |
| Sitemap | **@astrojs/sitemap** | Auto-generated on build |
| RSS | **@astrojs/rss** | Standard syndication |
| Hosting | **Cloudflare Pages** | Free, global CDN, auto-deploy on push |
| Analytics | **Cloudflare Web Analytics** | Free, privacy-friendly, no cookies |

## Quick start

```bash
cd moeed-blog
npm install
npm run dev          # http://localhost:4321
npm run build        # produces dist/ + Pagefind index
npm run preview      # local preview of production build
```

## Project layout

```
moeed-blog/
├── public/                       # static files (robots.txt, favicon, OG image)
├── src/
│   ├── consts.ts                 # site-wide config — change SITE.url here
│   ├── content/
│   │   ├── config.ts             # Zod schema enforcing article frontmatter
│   │   └── posts/                # ← write articles here as .md
│   ├── components/
│   │   ├── SEO.astro             # all meta tags (OG, Twitter, robots)
│   │   ├── ArticleSchema.astro   # JSON-LD BlogPosting
│   │   ├── PersonSchema.astro    # JSON-LD Person (author E-E-A-T)
│   │   ├── Breadcrumb.astro      # nav + JSON-LD BreadcrumbList
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── PostCard.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro      # all pages
│   │   └── PostLayout.astro      # individual articles
│   └── pages/
│       ├── index.astro           # home
│       ├── archive.astro         # all articles, grouped by year
│       ├── about.astro
│       ├── 404.astro
│       ├── rss.xml.js            # /rss.xml
│       ├── posts/[slug].astro    # individual article pages
│       └── tags/
│           ├── index.astro       # all tags
│           └── [tag].astro       # one tag page
└── docs/
    ├── CONTENT_GUIDE.md          # how to write a new article
    └── SEO_CHECKLIST.md          # pre-publish SEO checklist
```

## Writing a new article

1. Create `src/content/posts/your-slug.md`
2. Add frontmatter (see `docs/CONTENT_GUIDE.md` for full template)
3. Write content in markdown
4. `npm run dev` to preview
5. `git commit && git push` — Cloudflare auto-deploys

The frontmatter schema is enforced by Zod in `src/content/config.ts` — your build will fail if the title is too long, the description is missing, etc. This is intentional: it forces consistent SEO hygiene across every article.

## Deploy to Cloudflare Pages

1. Push this repo to GitHub.
2. Go to [Cloudflare Pages](https://pages.cloudflare.com) → **Create project** → connect GitHub.
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** `20`
4. Add custom domain `moeed.app` (Cloudflare auto-handles SSL).
5. Done. Every `git push` to `main` deploys in ~60 seconds.

## Pre-launch checklist

- [ ] Update `SITE.url` in `src/consts.ts` to final domain
- [ ] Replace `public/og-default.png` with a real 1200×630 image
- [ ] Update social handles in `src/consts.ts`
- [ ] Submit `https://moeed.app/sitemap-index.xml` to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Add Cloudflare Web Analytics snippet (paste in `BaseLayout.astro` head)
- [ ] Set up Buttondown/ConvertKit for newsletter signups
- [ ] Verify domain in `robots.txt` once domain is final

## Monetization roadmap

| Phase | Months | Revenue mix | Target |
|---|---|---|---|
| 1 | 0–6 | Build authority | $0 |
| 2 | 6–9 | Affiliate links (Cursor, Pinecone, etc.) | $50–200/mo |
| 3 | 9–12 | + sponsored articles | $300–500/mo |
| 4 | 12+ | + courses / consulting leads | $1K+/mo |

Display ads explicitly **not** in the plan — dev audiences ad-block at 40–60%, RPM is too low to justify the UX hit.
