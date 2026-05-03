# Content Authoring Guide

How to write articles for moeed.app that rank, read well, and convert.

## File location

All articles live in `src/content/posts/your-slug.md`.

The slug becomes the URL: `src/content/posts/mcp-tutorial.md` → `https://moeed.app/posts/mcp-tutorial`.

**Slug rules:**
- Lowercase, hyphens only (no underscores)
- 3–6 words max
- Include the **primary keyword** you're targeting
- Don't put dates in the slug (the article should be evergreen)

## Frontmatter template

Copy-paste this and fill it in:

```yaml
---
title: "Primary Keyword: Specific Promise to Reader (Year)"
description: "Write a real meta description, 120-160 characters, mentioning the primary keyword once. This is what appears in Google results."
pubDate: 2026-05-04
updatedDate: 2026-06-15  # optional, add when revising
author: "Moeed Rajpoot"
tags: ["claude-code", "tutorials", "ai-agents"]
keywords: ["primary keyword", "secondary keyword", "long-tail variation"]
featured: false  # set true for 1-2 cornerstone articles
draft: false     # set true while writing
canonicalUrl: "https://example.com/original"  # only if cross-posted
---
```

The Zod schema in `src/content/config.ts` will reject your build if:
- Title is < 10 or > 70 characters (Google truncates around 60)
- Description is < 50 or > 160 characters

This is intentional — every article ships with valid SEO metadata or it doesn't ship.

## Article structure that ranks in 2026

```
H1 (= title in frontmatter, auto-rendered)

[Hook paragraph — answer or promise in first 2 sentences]

[Optional: TL;DR blockquote for AI Overviews to cite]

## H2 — primary subtopic
Body...

### H3 — sub-subtopic
Body...

## H2 — next subtopic
...

## Common questions (FAQ-style H2 with H3 questions)
[3–5 short Q&As — Google extracts these for "People also ask"]

## Next steps
[2–3 internal links to related articles]
```

## SEO essentials per article

- **Primary keyword** in: title, first paragraph, one H2, URL slug, meta description
- **2–3 internal links** to other articles on the site (build topical clusters)
- **1–2 external links** to authoritative sources (docs, RFCs, papers)
- **Word count:** 1,500–3,500 for tutorials. Quality matters more than length.
- **Code blocks** must specify language: ` ```python` not just ` ``` `
- **Images:** if used, always include descriptive alt text (accessibility + SEO)

## Voice guidelines

- Write like you're explaining to a competent peer, not teaching a beginner
- First person OK ("I shipped this", "I learned"), opinion + experience signals expertise
- No fluff intros ("In today's fast-paced world of AI...")
- Get to the point in sentence 2
- Show working code, real numbers, real gotchas

## What gets penalized in 2026

Google's helpful content system specifically demotes:

- Mass AI-generated content (use AI to assist, never publish raw output)
- Thin pages (< 800 words on a topic that warrants 2,000)
- Articles with no first-hand experience signal
- Generic listicles ("10 best AI tools" with no real comparison)

## Publishing workflow

```bash
# 1. Write
vim src/content/posts/your-slug.md

# 2. Preview
npm run dev

# 3. Run SEO checklist (see docs/SEO_CHECKLIST.md)

# 4. Set draft: false in frontmatter

# 5. Commit + push
git add src/content/posts/your-slug.md
git commit -m "post: your slug"
git push

# 6. Cloudflare Pages auto-deploys in ~60 seconds
```

## Updating an old article

1. Set `updatedDate` in frontmatter to today
2. Make changes
3. The PostLayout will display "Updated <date>" automatically
4. JSON-LD schema includes `dateModified` so Google knows it's fresh
5. After major updates, resubmit URL in Google Search Console for faster reindexing

## Internal linking strategy

Every new article should link to:
- 2–3 existing articles on related subtopics
- The relevant **tag page** (e.g. `/tags/claude-code`)

Every new article should be linked **from**:
- At least one existing article (go back and add the link after publishing)

This creates topical clusters Google rewards.
