# Pre-Publish SEO Checklist

Run through this before flipping `draft: false` on any article.

## Frontmatter

- [ ] Title is 50–60 characters and includes primary keyword near the start
- [ ] Description is 120–160 characters and includes primary keyword once
- [ ] `pubDate` set
- [ ] `tags` includes 2–4 relevant tags (matches existing taxonomy where possible)
- [ ] `keywords` array has 3–5 search terms

## URL & slug

- [ ] Slug is lowercase, hyphenated, 3–6 words
- [ ] Slug contains primary keyword
- [ ] No date or year in slug

## Content structure

- [ ] First sentence directly addresses the search intent
- [ ] Primary keyword appears in first 100 words
- [ ] At least 3 H2 sections
- [ ] At least one H2 is a question matching a real search query
- [ ] Optional but recommended: a TL;DR blockquote near the top
- [ ] Optional but recommended: an FAQ-style "Common questions" H2 near the end

## Internal & external links

- [ ] 2+ internal links to other articles on this site
- [ ] 1+ link to relevant tag page
- [ ] 1–2 external links to authoritative sources (docs, RFCs)
- [ ] All links use descriptive anchor text (NOT "click here")

## Code & media

- [ ] All code blocks specify a language (` ```python`, not ` ``` `)
- [ ] All images have meaningful `alt` attributes
- [ ] Code samples are tested and runnable

## E-E-A-T signals (very important in 2026)

- [ ] First-person experience visible ("I shipped this", "I measured", "I migrated")
- [ ] Concrete numbers, configs, or measurements shown
- [ ] Real "gotcha" / failure mode included (proves you actually built it)
- [ ] Author bio appears (auto via PostLayout)

## Technical SEO (auto-handled by the framework — verify in dev)

- [ ] `<title>` tag is correct (view source)
- [ ] Meta description renders correctly
- [ ] Canonical URL points to correct path
- [ ] Open Graph image displays in [opengraph.xyz](https://www.opengraph.xyz)
- [ ] JSON-LD Article schema validates in [schema.org validator](https://validator.schema.org)
- [ ] Mobile preview looks good (Chrome DevTools device mode)
- [ ] Lighthouse score: Performance ≥ 95, SEO = 100, A11y ≥ 95

## Distribution (after publishing)

- [ ] Submit URL in Google Search Console → Request indexing
- [ ] Submit URL in Bing Webmaster Tools
- [ ] Post link on Twitter/X with thread summarizing the article
- [ ] Post on LinkedIn with a different angle (avoid duplicate text)
- [ ] Cross-post to dev.to (set `canonicalUrl` to your blog URL)
- [ ] Submit to Hacker News if pillar content
- [ ] Share in 1–2 relevant Reddit / Discord communities (provide value, don't spam)

## 30 days later

- [ ] Check Search Console: is it indexed? Any impressions?
- [ ] Check what queries it's appearing for — update title/H2s if mismatch
- [ ] If not ranking after 60 days: improve the article OR build more topical authority around it (write 2 supporting articles linking to it)
