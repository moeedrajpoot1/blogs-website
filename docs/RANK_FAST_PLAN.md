# 30-Day Rank-Fast Plan

**Created:** 2026-06-11
**Window:** 2026-06-11 to 2026-07-11
**Owner:** Muhammad Moeed

## Starting position (GSC, 90-day)

| Metric | Value |
|---|---|
| Clicks | 19 |
| Impressions | 2.58K |
| CTR | 0.7% |
| Avg position | 11.2 (page 2) |
| Pages with clicks | 5 |

**Carrying the site:** `whatsapp-liquid-glass-design` (13 of 19 clicks, 1561 impressions)

**Five "almost there" pages** — real impressions, zero clicks. These are the rank-fast targets:

1. `claude-code-dreaming-guide` — 102 impressions
2. `claude-code-skills-complete-guide` — 100 impressions
3. `fix-cannotpullcontainererror-ecs` — 95 impressions
4. `claude-code-slow-fix` — 83 impressions
5. `what-is-aws-ecs-express-mode` — 74 impressions

## TL;DR — top moves

1. Ship 5 title and description rewrites on Day 1. Bump `updatedDate: 2026-06-11` on all 5.
2. Add a "Top guides" section on the home page linking all 5 stuck pages.
3. Add one contextual link from `whatsapp-liquid-glass-design` (only real-traffic page) into the most adjacent stuck post.
4. Verify robots.txt at the edge BEFORE editing the repo file.
5. Do one in-place depth refresh per week on the 5 stuck pages. Add 600 to 800 words of new content (visible H3 FAQ section, terminal output, version pins, screenshots), bump `updatedDate`, ping IndexNow.
6. Do NOT crosspost the 5 stuck pages to dev.to. Reserve dev.to for awareness only (MCP Apps posts).

---

## Title and description rewrites (Day 1, copy-paste ready)

### `src/content/posts/claude-code-dreaming-guide.md`

```yaml
title: "Claude Code AutoDream Explained: MEMORY.md Cleanup and the /dream Command"
description: "AutoDream cleans your Claude Code MEMORY.md between sessions. /dream runs it on demand. See what gets rewritten, where dream files live, and how to turn it off."
updatedDate: 2026-06-11
```

### `src/content/posts/claude-code-skills-complete-guide.md`

```yaml
title: "How to Build a Claude Code Skill: SKILL.md Format and Setup"
description: "Build your first Claude Code skill. See the SKILL.md format, where skills live on disk, the YAML frontmatter fields, and how to test the skill."
updatedDate: 2026-06-11
```

**Note:** Do not put "Skills vs Subagents vs Slash Commands" in this description. That cannibalizes the existing `claude-code-skills-vs-mcp-vs-subagents-vs-hooks` page which already has 1 click. Keep this page as a pure tutorial and link to the comparison page from the body.

### `src/content/posts/fix-cannotpullcontainererror-ecs.md`

```yaml
title: "CannotPullContainerError on ECS Fargate: 7 Root Causes and Fixes"
description: "Seven root causes for CannotPullContainerError on ECS Fargate: IAM, networking, image tag, architecture, disk space, Docker Hub limits, VPC endpoints. Match yours and fix it."
updatedDate: 2026-06-11
```

**Note:** No year suffix on troubleshooting queries. Users want speed-to-fix, not freshness signal.

### `src/content/posts/claude-code-slow-fix.md`

```yaml
title: "Claude Code Slow? 7 Real Fixes for /doctor, /compact, and MCP Bloat"
description: "Claude Code feels slow when context bloats, MCP tools chain in loops, or memory files grow huge. See the seven fixes that work, with /doctor and /compact walkthroughs."
updatedDate: 2026-06-11
```

**Note:** Do not use "after the Anthropic postmortem" framing unless you have a verified URL to a published postmortem with exact dates. Fabricated citation is too risky for a 3-month domain.

### `src/content/posts/what-is-aws-ecs-express-mode.md`

```yaml
title: "What is AWS ECS Express Mode? (vs Fargate and App Runner)"
description: "AWS ECS Express Mode runs one container image and builds the load balancer, HTTPS URL, auto scaling, and CloudWatch monitoring for you. See the inputs, limits, and when to pick it over Fargate or App Runner."
updatedDate: 2026-06-11
```

**Note:** This page already ranks #9 on the definitional query. Keep "What is" to preserve that signal. The parenthetical opens the comparison SERP without losing existing rank.

---

## Week 1 (Days 1-7): Title rewrites, technical quick wins, depth refresh #1

- [ ] **Day 1 (90 min) — Ship the 5 title rewrites above.** Commit. IndexNow auto-pings on commit. Then in GSC URL Inspection > Request Indexing on each of the 5 URLs.
- [ ] **Day 2 (60 min) — Verify robots.txt at the edge:**
      ```
      curl -A 'ClaudeBot' https://moeed.app/robots.txt
      curl -A 'GPTBot' https://moeed.app/robots.txt
      ```
      If response matches the repo file, leave it alone. If Cloudflare rewrites at edge, fix at Cloudflare dashboard (Security > Bots > AI Scrapers and Crawlers), not in the repo.
- [ ] **Day 2 — Ship the `_headers` file** (see "Headers file" section below).
- [ ] **Day 3 (60 min) — Add "Top guides" section** on the home page (`src/pages/index.astro`) linking all 5 stuck pages. Use keyword-matched anchor text (see "Internal link map" section).
- [ ] **Day 3 — Add 1 contextual link** from `whatsapp-liquid-glass-design.md` into the most thematically adjacent stuck post.
- [ ] **Day 4 (3-4 hrs) — Depth refresh #1: `fix-cannotpullcontainererror-ecs.md`.**
  - 100-word "5 most common causes" numbered list above the fold
  - 7 visible H3 FAQs (the literal substrings users paste: "no space left on device", "pull access denied", "toomanyrequests", "i/o timeout", "image manifest not found")
  - Ready-to-paste AWS CLI commands (`aws ecr get-login-password`, `aws ec2 describe-route-tables`, security group egress check)
  - Screenshot of the exact CloudWatch log line
  - Decision flowchart (EC2 vs Fargate vs ECR vs Docker Hub branches)
  - Bump `updatedDate`. Commit. Ping IndexNow.
- [ ] **Day 5 (30 min) — Delete deprecated meta tags** from `src/components/SEO.astro`:
  - Remove `<meta name="title">` line
  - Remove `<meta name="keywords">` line
  - Both ignored by Google since 2009.
- [ ] **Day 5 — Tag pages:** do NOT blanket noindex. With 43 indexed pages there is crawl budget surplus. Instead expand `TAG_DESCRIPTIONS` in `src/consts.ts` to 80-120 words per tag for: `claude-code`, `mcp`, `agent-sdk`, `aws-ecs`, `deployment`, `ai-agents`.
- [ ] **Day 6 (30 min) — One dev.to crosspost (awareness only):** `mcp-apps-vs-openai-apps-sdk`. 400-word teaser, NOT full article. End with "Read full guide on moeed.app". Tags: `#claude #mcp #ai #anthropic`.
- [ ] **Day 7 (15 min) — Check GSC.** Look for recrawl signal on the 5 refreshed pages. Bing should reflect IndexNow within 24-48 hours.

### Headers file (Day 2)

Create `public/_headers`:

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: browsing-topics=(), geolocation=(), camera=(), microphone=()

/posts/*
  Cache-Control: public, max-age=600, s-maxage=600

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/*.woff2
  Cache-Control: public, max-age=31536000, immutable
```

Short `s-maxage=600` (10 minutes) avoids serving stale HTML to Googlebot after `updatedDate` bumps.

---

## Week 2 (Days 8-14): Depth refresh #2, real backlinks, internal links

- [ ] **Day 8 (3-4 hrs) — Depth refresh #2: `claude-code-skills-complete-guide.md`.**
  - Working SKILL.md example with YAML frontmatter walked through line by line
  - 5 visible H3 FAQs ("where do Claude Code skills live", "what is SKILL.md", "how to test a Claude Code skill", "claude code skills vs slash commands", "claude code skills vs subagents")
  - Comparison table at the bottom that LINKS to `claude-code-skills-vs-mcp-vs-subagents-vs-hooks` rather than duplicating it
  - Bump `updatedDate: 2026-06-18`. Commit. Ping IndexNow.
- [ ] **Day 9 (90 min) — Internal link pass.** Add the 19 internal links from the "Internal link map" section below.
- [ ] **Day 10 (45 min) — Real backlink #1: r/ClaudeAI.** Reddit-native decision-tree post: "When to use a Claude Code skill vs an MCP server vs a subagent vs a hook — decision tree". Body is 300-400 words of the actual decision tree. Link the longer version at the bottom. Engage with comments for 2 hours.
- [ ] **Day 11 (30 min) — Real backlink #2: Stack Overflow.** Find one open question tagged `amazon-ecs` with "CannotPullContainerError". Write a complete answer (IAM execution role, NAT gateway / VPC endpoints, image tag check). Link to `fix-cannotpullcontainererror-ecs` at the bottom.
- [ ] **Day 12 (30 min) — Real backlink #3: anthropics/claude-code Discussions.** Find one open question about Claude Code performance, MEMORY.md, or skills. Write a useful answer first, then link the relevant guide as supporting material. Dofollow link from the official repo.
- [ ] **Day 13 (30 min) — Real backlink #4: hesreallyhim/awesome-claude-code.** Read CONTRIBUTING.md and CODE_OF_CONDUCT.md first. Open a "resource recommendation" ISSUE (NOT a PR — they use automation). Submit ONE guide only: `claude-code-skills-complete-guide`. Wait 4-6 weeks before submitting a second.
- [ ] **Day 14 (20 min) — Real backlink #5: MCP Show and Tell.** Post under https://github.com/orgs/modelcontextprotocol/discussions/categories/show-and-tell with the title "Plain-English explainer for MCP Apps". Lead with the problem it solves. Link at the bottom. Reply to comments.

### Why only 5 backlinks, not 12

The 12-awesome-list PR plan was dropped after the adversarial review. Eleven of those targets are off-format (server lists, agent lists) that reject tutorial-only PRs. Twelve submissions in 12 days from one GitHub account looks like a coordinated campaign. The 5 above (Reddit, SO, anthropics Discussions, hesreallyhim, MCP Show and Tell) carry more weight than 12 buried awesome-list entries combined.

---

## Week 3 (Days 15-21): Depth refresh #3, 2 new articles, community

- [ ] **Day 15 (3 hrs) — Depth refresh #3: `what-is-aws-ecs-express-mode.md`.**
  - Pricing example with VERIFIED numbers (look up current Fargate vCPU + memory + ALB hourly + LCU rates from AWS docs — do NOT invent "$20-30/month")
  - "When to graduate off Express Mode" section
  - 5-minute first-deploy walkthrough with a real Dockerfile
  - 4-5 visible H3 FAQs ("ECS Express Mode vs Fargate", "ECS Express Mode vs App Runner", "What does ECS Express Mode build for you", "Can I use my own VPC")
  - Bump `updatedDate: 2026-06-25`. Commit. Ping IndexNow.
- [ ] **Day 16-17 (1.5 days) — New article #1:** `ecs-express-mode-first-deploy.md`
  - Title: "Deploy a Container on ECS Express Mode: From Docker Image to HTTPS URL"
  - 1800-2200 words
  - Primary query: `ecs express mode tutorial`
  - Include: working Dockerfile, exact CLI commands, screenshot of the AWS console, monthly cost from your real account
  - Internal links to: `what-is-aws-ecs-express-mode`, `what-is-aws-ecs`, `what-is-aws-ecr`, `fix-cannotpullcontainererror-ecs`, `deployment-strategies-explained`
- [ ] **Day 18 (3 hrs) — Depth refresh #4: `claude-code-slow-fix.md`.**
  - Benchmark table (timed `/compact` before/after on a real session — run it once and record)
  - `/doctor` walkthrough with screenshot
  - When to `/clear` vs `/compact` vs new session decision tree
  - 5 visible H3 FAQs ("why is Claude Code slow", "how do I run /doctor", "what does /compact do", "claude code high memory usage", "claude code freezing")
  - Drop any reference to a postmortem unless verified with a URL
  - Bump `updatedDate: 2026-06-28`
- [ ] **Day 19-20 (1.5 days)** — Two parallel tasks:
  1. Expand `claude-code-skills-vs-mcp-vs-subagents-vs-hooks` with a "7 real decision examples" section (1000 words). Bump `updatedDate`.
  2. Depth refresh #5: `claude-code-dreaming-guide.md`. Add 600-800 words covering MEMORY.md inspection walkthrough, file diffs, FAQs.
- [ ] **Day 21 (60 min) — Reddit r/aws + r/devops:**
  - r/aws: technical breakdown of "ECS Express Mode vs Fargate vs App Runner — which I picked for a small Claude agent service". Link `what-is-aws-ecs-express-mode` at the bottom.
  - r/devops: walkthrough of fixing CannotPullContainerError on Fargate. Link `fix-cannotpullcontainererror-ecs` at the bottom.
  - Engage with comments for 2 hours after each post.

---

## Week 4 (Days 22-30): Compound, measure, double down

- [ ] **Day 22 (60 min) — GSC and Bing audit.**
  - Compare last 7 days vs prior 7 days for the 5 stuck pages
  - Look for position movement (even 11 to 8 is huge — that is the page-1 transition)
  - Check impression delta — depth refresh + freshness should lift impressions on at least 3 of 5
  - Check Coverage for new "Crawled — currently not indexed" warnings
  - In Bing Webmaster Tools: confirm IndexNow indexed all 5 stuck pages and the new ECS Express tutorial
- [ ] **Day 23 (3 hrs) — Double down on whichever page moved most.** Add another 400-600 words and one more H3 FAQ. Google rewards iterated improvement on pages responding to refresh signals.
- [ ] **Day 24 (1.5 days) — New article #2:** `deploy-mcp-server-ecs-fargate.md`
  - Title: "Deploy a Streamable HTTP MCP Server on ECS Fargate"
  - 1200-1500 words
  - Primary query: `deploy mcp server ecs fargate`
  - Skip OAuth, CDK, and cost breakdown — those become separate posts in Week 5+ ONLY if Week 4 shows ranking signal
  - Internal links to: `build-your-first-mcp-server`, `what-is-aws-ecs`, `what-is-aws-ecr`, `fix-cannotpullcontainererror-ecs`, `what-is-aws-ecs-express-mode`
- [ ] **Day 26 (10 min + 4 hrs if it lands) — Hacker News submission.** `fix-cannotpullcontainererror-ecs` OR `mcp-apps-vs-openai-apps-sdk` (whichever has more depth). Best time: Tuesday or Wednesday, 9-12 ET. Factual title ("Fixing CannotPullContainerError on ECS Fargate: the 7 causes I hit in production"). If it lands the front page, reply to every comment for the first 2 hours.
- [ ] **Day 27 (20 min) — Hashnode crosspost** of `fix-cannotpullcontainererror-ecs` with the `originalArticleURL` field set to the moeed.app URL. Hashnode's canonical compliance is stronger than dev.to's. Tags: `claude`, `aws`, `devops`, `docker`.
- [ ] **Day 28 (30 min) — Apply to Level Up Coding on Medium.** Via about-page contact link. Pitch a republish of `claude-code-outcomes-guide` with canonical link set in Story Settings to moeed.app. If accepted, opens an ongoing Medium publication channel for Google Discover.
- [ ] **Day 29 (30 min) — Second Stack Overflow answer.** Find one question tagged `claude-ai` or `model-context-protocol`. Write a complete answer. Link the relevant guide at the bottom.
- [ ] **Day 30 (60 min) — Final measurement and Week 5+ plan.**
  - Total clicks last 30 days vs prior 30 days
  - Click-bearing pages: how many of the 5 stuck pages converted from 0 clicks to >0?
  - Average position: did 11.2 drop to 9 or below?
  - Top queries: any new queries the rewritten titles pulled?
  - Pick TOP 2 pages by impression growth → queue them for Week 5 in-place expansion (another 600 words each)
  - Pick BOTTOM 1 page (still zero clicks despite refresh) → queue it for a targeted Reddit thread or guest mention in Week 5

---

## Internal link map (Day 9)

Pick a natural spot in each source post, do not force the link into the intro.

| From post | To post | Anchor text |
|---|---|---|
| `claude-code-skills-vs-mcp-vs-subagents-vs-hooks` | `claude-code-skills-complete-guide` | Claude Code Skills practical guide |
| `claude-code-hooks-complete-guide` | `claude-code-skills-complete-guide` | complete guide to Claude Code Skills |
| `claude-code-outcomes-guide` | `claude-code-skills-complete-guide` | Claude Code Skills complete guide |
| `how-anthropic-teams-use-claude-code` | `claude-code-skills-complete-guide` | writing your first Claude Code Skill |
| `claude-code-routines-guide` | `claude-code-dreaming-guide` | Claude Code Dreaming and AutoDream |
| `claude-code-outcomes-guide` | `claude-code-dreaming-guide` | Claude Code Dreaming guide |
| `claude-code-slow-fix` | `claude-code-dreaming-guide` | how Claude Code Dreaming works |
| `claude-code-ultraplan-guide` | `claude-code-dreaming-guide` | Claude Code Dreaming explained |
| `what-is-aws-ecs` | `fix-cannotpullcontainererror-ecs` | CannotPullContainerError in ECS: 7 causes and fixes |
| `what-is-aws-ecr` | `fix-cannotpullcontainererror-ecs` | fix CannotPullContainerError in ECS |
| `what-is-aws-ecs-express-mode` | `fix-cannotpullcontainererror-ecs` | CannotPullContainerError fixes for ECS |
| `deployment-strategies-explained` | `fix-cannotpullcontainererror-ecs` | diagnose CannotPullContainerError in ECS |
| `aws-copilot-cli-end-of-support` | `fix-cannotpullcontainererror-ecs` | CannotPullContainerError causes and fixes |
| `claude-code-outcomes-guide` | `claude-code-slow-fix` | fix Claude Code when it feels slow |
| `claude-code-ultraplan-guide` | `claude-code-slow-fix` | diagnose and fix Claude Code slowness |
| `how-anthropic-teams-use-claude-code` | `claude-code-slow-fix` | how to diagnose Claude Code performance issues |
| `claude-code-vs-cursor` | `claude-code-slow-fix` | fix Claude Code when it feels slow |
| `what-is-aws-ecs` | `what-is-aws-ecs-express-mode` | what AWS ECS Express Mode is and when to use it |
| `what-is-aws-ecr` | `what-is-aws-ecs-express-mode` | AWS ECS Express Mode guide |
| `deployment-strategies-explained` | `what-is-aws-ecs-express-mode` | AWS ECS Express Mode explained |
| `aws-copilot-cli-end-of-support` | `what-is-aws-ecs-express-mode` | AWS ECS Express Mode as the Copilot replacement |

---

## Honest 30-day projection

| Metric | Today | Realistic Day 30 | Stretch Day 30 |
|---|---|---|---|
| Clicks (90d) | 19 | 30-45 | 60+ |
| Pages with clicks | 5 | 8-11 | 12+ |
| Average position | 11.2 | 9-10 | 8 or better |
| Impressions (90d) | 2.58K | 3.5K-4.5K | 5K+ |
| Stuck pages converting to 1+ clicks | 0 | 2-3 | 4 |

These are honest numbers for a 3-month domain in a competitive niche. Title rewrites and depth refreshes do not cause breakout growth in 30 days even when executed well. The 30-day improvement is the leading indicator. Breakout typically lands in months 4-6 if topical depth and internal linking compound.

## What will NOT move in 30 days

- The home page will not rank for "Claude Code" or "MCP servers" as head terms. Anthropic and DR 80+ outlets own those SERPs.
- 30 awesome lists will not replace one editorial mention in Search Engine Land, The Pragmatic Engineer, Latent Space, or Simon Willison's blog. Pursue those in months 4-6 with original research, not now.
- FAQ rich snippets are gone. Google deprecated them in August 2023 for most sites. Visible FAQ content on the page still helps (AIO citation, user satisfaction) but expect zero rich snippet treatment.
- llms.txt is not a Google ranking signal. Keep it for agent routing only.

## What needs 60-90 days

- One editorial mention from a DR 80+ AI engineering outlet. Path: publish one piece of original research (a benchmark, a cost breakdown with real numbers, a security finding) in months 2-3, then pitch Qwoted / Featured.com / Source of Sources every week.
- A YouTube + blog embed pair. A 4-minute screen recording of "fixing CannotPullContainerError on ECS Fargate" embedded at the top of the matching post yields a measurable lift. One per quarter is realistic.
- A `/claude-code/` and `/aws-ecs/` cluster pillar page with 10+ internal links each.
- Per-post OG images at build time (Satori or @vercel/og). The whatsapp post carries clicks largely because of its visual hook. Per-post OG images will 2-3x social CTR. Schedule for month 2.

---

## Skip list (if time is tight)

Drop in this order:

1. ALL dev.to crossposts of stuck pages. The canonical claim does not hold off-domain on dev.to. Only the awareness teaser on Day 6 stays.
2. ALL awesome-list PRs except hesreallyhim/awesome-claude-code (Day 13).
3. Per-post OG image build pipeline. High impact but week-long work. Schedule for month 2.
4. New article #3 on Day 24 (MCP server on ECS Fargate) if any depth refresh fell behind. New articles start at position 50+. Refreshes lift pages already in the index. Always refresh first.
5. Noindex tag pages. With 43 indexed pages and crawl budget surplus, thin tag page risk is overstated. Just expand `TAG_DESCRIPTIONS` for the top 6 tags.

**Keep no matter what:** the 5 title rewrites (Day 1), the `_headers` file (Day 2), the homepage hub (Day 3), the 4 depth refreshes (Days 4, 8, 15, 18), the internal link pass (Day 9), the Reddit r/ClaudeAI post (Day 10), the GSC audit (Day 22).

---

## One final note on writing quality

Plain ESL English wins this niche right now. The 2026 Core Updates hammered thin, AI-feeling, keyword-stuffed posts. The 5 stuck pages must show:

- Named tools with version numbers
- Real terminal output and exact error messages
- Dated events with verifiable sources
- Dollar figures from your own bills (not invented)
- Configurations that actually ran on your machine
- Screenshots of the real console or terminal

These are the Experience signals that 2026 Google rewards. You are a working backend engineer building real services. That authenticity, written in short clear sentences with no buzzwords, is the entire competitive moat against the AI-generated content flood.

---

## Progress log

Use this section to record what was done each day and what moved in GSC.

### Week 1
- 2026-06-11 — Day 1 done. Title + description rewritten on all 5 stuck pages. `updatedDate: 2026-06-11` added. Commit `8f4f885`. IndexNow auto-fired. GSC URL inspection requested for all 5 URLs.
- 2026-06-12 — Day 2 done. Edge curl test confirmed Cloudflare prepends a managed robots.txt block above the repo file, blocking ClaudeBot specifically (anthropic-ai, OAI-SearchBot, ChatGPT-User, PerplexityBot still allowed). Manual fix needed in Cloudflare dashboard — Security > Bots > AI Scrapers and Crawlers. Added `public/_headers` (HSTS preload, X-Frame-Options, Permissions-Policy, cache rules for posts/_astro/woff2/png/svg). Commit `cd86700`. Cloudflare AI Crawl Control dashboard confirmed setup is correct on moeed.app — 612 AI crawler requests in 24h (+149.8%), Anthropic family 53 allowed, OpenAI 23 allowed. Decision: leave Managed robots.txt ON.
- 2026-06-12 — Day 3 done. Added "Top guides" section on home page (`src/pages/index.astro`) linking all 5 stuck pages with keyword-matched anchor text. Commit `8446dc3`. Removed `noindex: true` from whatsapp-liquid-glass-design.md so the page passes PageRank and joins sitemap + llms.txt. Commit `53edb77`. Owner manually requested indexing in GSC for all 5 stuck URLs + homepage + whatsapp page. HSTS preload confirmed already in place via the .app TLD (no submission needed).
- 2026-06-12 — Day 5 done. Removed deprecated `<meta name="title">` and `<meta name="keywords">` from `src/components/SEO.astro`. Expanded `TAG_DESCRIPTIONS` in `src/consts.ts` from one-liners to 80-120 word intros for all 6 tags (claude-code, claude-agent-sdk, mcp, rag, ai-agents, tutorials). Commit `2740068`.
- 2026-06-12 — Day 9 done. Added 14 keyword-matched internal links from 11 existing posts to the 4 main stuck pages (skills-complete-guide, dreaming-guide, slow-fix, fix-cannotpullcontainererror-ecs) and 1 link to what-is-aws-ecs-express-mode. 5 links from the original plan were already present and skipped. All insertions are contextual within existing closing sections, not appended bare related lists. Commit `50cc115`. Source posts touched: aws-copilot-cli-end-of-support, claude-code-hooks-complete-guide, claude-code-outcomes-guide, claude-code-skills-vs-mcp-vs-subagents-vs-hooks, claude-code-slow-fix, claude-code-ultraplan-guide, claude-code-vs-cursor, how-anthropic-teams-use-claude-code, what-is-aws-ecr, what-is-aws-ecs-express-mode, what-is-aws-ecs.
- 2026-06-12 — Days 4, 8, 18 done (depth refresh batch). Commit `aff962a`. Added to `fix-cannotpullcontainererror-ecs`: a "Quick error message lookup" table mapping literal error substrings to the seven causes + 6 new H3 FAQs matching literal user queries ("no space left on device", "pull access denied", "toomanyrequests", "i/o timeout", "failed to resolve ref", "Context canceled in VPC endpoint setup"). Added to `claude-code-skills-complete-guide`: converted 7 bold-question FAQs to H3 format and added 2 new H3 FAQs ("What is SKILL.md?", "How do I test a Claude Code skill?"). Added to `claude-code-slow-fix`: a "When to /clear, /compact, or start a new session" decision table + 5 new H3 FAQs ("Why is Claude Code slow?", "How do I run /doctor?", "What does /compact do?", "Why does Claude Code use so much memory?", "Why is Claude Code freezing?"). All three pages bumped `updatedDate: 2026-06-12`. Owner still needs to add real screenshots (CloudWatch log line on ECS post, /doctor output on slow-fix post) when at machine; content is shipped without them.
- 2026-06-12 — Day 6 done. Owner published the dev.to teaser crosspost of `mcp-apps-vs-openai-apps-sdk` with 400-word body and `canonical_url` pointing to moeed.app. Tags: claude, mcp, ai, anthropic.
- 2026-06-16 — GSC check at Day 4 post-rewrite: clicks 19→23 (+21%), impressions 2.58K→3K, CTR 0.7→0.8%, position 11.2→11.4 (slight wobble normal during re-evaluation). On track for the Day 30 projection (30-45 clicks).
- 2026-06-16 — New article published: `claude-agent-sdk-credit-pool.md`. Topic was identified by a trend research agent — the June 15 Anthropic billing change is the highest-ROI rank-fast topic in flight. Article is 2300 words, includes a "What changed" table, credit pool math table, GitHub Action YAML before/after, overflow billing setup steps, 8 H3 FAQs matching literal search queries. Linked reciprocally from `claude-agent-sdk-cost-tracking`. Commit `8c7b772`. Topic-fit angle: only article in the niche taking the engineer-focused "here is the YAML that breaks" angle (competitors are marketer-tone explainers).
- 2026-06-16 — Humanized rewrite of the credit pool article — replaced jargon with plain ESL words, swapped "credit pool" for "pot of money" metaphor in body (kept "credit pool" in title/keywords for SEO), shortened sentences. Plagiarism check passed: 13/13 distinctive phrases unique. Commit `6307951`.
- 2026-06-16 — Second new article published: `claude-fable-5-unavailable.md` (2400 words). Identified via owner's Google Trends data — "claude fable 5 is currently unavailable why" was a BREAKOUT query, "when is fable coming back" / "why fable 5 banned" all rising +40-50%. Research agent + WebFetch on 3 primary sources (Anthropic news page, 9to5Mac, MarkTechPost) gave the factual bulletproofing. Article structure: 3-sentence AIO answer, timeline, Commerce Dept quotes, Anthropic verbatim statements, plain-English jailbreak explanation, 5-step migration playbook to Opus 4.8, 10 H3 FAQs matching literal rising queries. Featured: true. Commit `4e5baf9`. Plagiarism check: 12/12 phrases unique, clean.
- 2026-06-16 — Reciprocal link added from `claude-agent-sdk-credit-pool.md` "Where to go next" section pointing to `claude-fable-5-unavailable`. Both June 16 articles now link to each other for cluster reinforcement.
- 2026-06-16 — Dev.to teaser drafted for Fable 5 article (delivered to owner in chat, ~410 words, canonical_url to moeed.app, tags: claude/ai/anthropic/llm). Cover image discussion: owner decided to publish without a cover image since Anthropic's primary news page is text-only and no quick visual option exists. Decision logged: ship for speed over polish.

## Current status snapshot (end of 2026-06-16 session)

**Published articles since plan start:** 2 new (credit pool, Fable 5) + depth refreshes on 5 stuck pages + 14 internal links across 11 posts.

**Site totals:** ~34 posts published, all on moeed.app + indexed.

**Pending owner manual tasks (carry to next session):**
- Request indexing in GSC for the 2 new URLs (`/posts/claude-agent-sdk-credit-pool/`, `/posts/claude-fable-5-unavailable/`)
- Publish dev.to Fable 5 teaser (markdown delivered in chat)
- Reddit r/ClaudeAI post (profile setup still blocked — try mobile app)
- One Stack Overflow answer on `amazon-ecs` "CannotPullContainerError"
- Open issue on `hesreallyhim/awesome-claude-code` recommending the skills-complete-guide
- Add real screenshots to fix-cannotpullcontainererror-ecs (CloudWatch log) and claude-code-slow-fix (/doctor output)

**Trends to monitor for next article:**
- Fable 5 / Mythos 5 return announcement (Anthropic news page)
- Any new US Commerce Department clarification on the order
- MCP 2026-07-28 spec finalisation (rising every week until July 28)
- Claude Code release notes (v2.1.178+ rolling out new permission syntax)
- 2026-06-13 — ...
- 2026-06-14 — ...
- 2026-06-15 — ...
- 2026-06-16 — ...
- 2026-06-17 — ...

### Week 2
- 2026-06-18 — ...
- 2026-06-19 — ...
- 2026-06-20 — ...
- 2026-06-21 — ...
- 2026-06-22 — ...
- 2026-06-23 — ...
- 2026-06-24 — ...

### Week 3
- 2026-06-25 — ...
- 2026-06-26 — ...
- 2026-06-27 — ...
- 2026-06-28 — ...
- 2026-06-29 — ...
- 2026-06-30 — ...
- 2026-07-01 — ...

### Week 4
- 2026-07-02 — ...
- 2026-07-03 — ...
- 2026-07-04 — ...
- 2026-07-05 — ...
- 2026-07-06 — ...
- 2026-07-07 — ...
- 2026-07-08 — ...
- 2026-07-09 — ...
- 2026-07-10 — ...
- 2026-07-11 — final measurement
