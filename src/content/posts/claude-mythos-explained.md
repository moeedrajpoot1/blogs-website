---
title: "Claude Mythos Explained: Who Has Access and Why It Matters"
description: "What Claude Mythos is, who got access through Project Glasswing, the zero-days it has already found, and what its arrival means for security teams in 2026."
pubDate: 2026-05-05
author: "Moeed Rajpoot"
tags: ["claude-agent-sdk", "ai-agents", "tutorials"]
keywords: [
  "claude mythos",
  "claude mythos explained",
  "anthropic mythos",
  "who has access to mythos",
  "project glasswing",
  "mythos vulnerability",
  "mythos security",
  "mythos ai model",
  "claude mythos preview",
  "mythos zero day"
]
heroImage: "/posts/claude-mythos-hero.jpg"
heroAlt: "Claude Mythos: a new frontier in AI safety and security from Anthropic"
featured: false
---

![Claude Mythos: a new frontier in AI safety and security from Anthropic](/posts/claude-mythos-hero.jpg)

Anthropic [announced Claude Mythos](https://red.anthropic.com/2026/mythos-preview/) on 7 April 2026, and the security side of the industry has not really been quiet since. The short version is this. Mythos is a new model from Anthropic that is unusually good at finding software vulnerabilities. So good that the company has chosen not to ship it as a public product. Access is being handed to a small group of partners, on conditions, under a program called Project Glasswing.

If you have been seeing the words "mythos", "who has access to mythos", "mythos vulnerability" all over your timeline this week, this post is the plain explanation. What it is, what it has already found, who actually has the keys, and what it means if you are anywhere near security or platform engineering in 2026.

## What Claude Mythos actually is

Mythos is a general-purpose Claude model with one distinctive trait. It is built and trained with a strong focus on agentic security work. That means searching code for flaws, building working exploits, chaining bugs together, and reasoning about systems the way a senior offensive engineer does.

Anthropic's framing is careful. Mythos is not pitched as a hacking tool. It is pitched as the defensive flip side of the same capability, where the skill that lets you write an exploit is also the skill that lets you spot one before it ships. The catch is that the gap between those two uses is thin, and the way the launch is shaped is mostly an answer to that thinness.

Concretely, the Mythos preview can:

- Find zero-day vulnerabilities in operating systems, browsers, and common open-source libraries.
- Build working exploit chains, including JIT heap sprays, ROP chains, and sandbox escapes.
- Reverse engineer closed-source binaries.
- Spot logic flaws in cryptography libraries and web applications.
- String multiple smaller bugs together into a privilege escalation that none of them would cause on their own.

Picture the work a strong offensive engineer gets paid to do across an entire year. That is roughly what one Mythos run does across thousands of codebases in parallel.

## What it has already found

This is the part that turned heads in the security community.

According to Anthropic's published preview, Mythos has already turned up:

- A **27-year-old bug in OpenBSD**.
- A **16-year-old vulnerability in FFmpeg**.
- A **17-year-old remote code execution flaw in FreeBSD**.
- "Thousands" of additional high and critical severity zero-days, currently going through responsible disclosure with affected vendors.

For context, OpenBSD and FreeBSD are some of the most carefully audited codebases in the world. They get reviewed by professional security researchers, by university teams, by individuals doing it for sport. A 27-year-old hole in OpenBSD is the kind of finding that, before Mythos, would have made a career.

A second number worth knowing. Anthropic ran a sample of 198 of Mythos' findings past human validators and reported an **89% agreement rate** on severity. That is not a marketing chart. It means the model is not just generating noise. The thing it labels critical is, four times out of five, actually critical.

If you wanted a single sentence to take away, it is this. The bottleneck on vulnerability discovery has historically been smart people with time. Mythos turns that into smart software with API quota. The shape of the problem changes from there.

## Who has access to Mythos

This is the most-searched question of the week, and the honest answer is "not you and not me." The preview is not generally available. There is no waitlist on anthropic.com. There is no API tier you can pay into.

What there is, instead, is **Project Glasswing**. This is the program Anthropic set up to put Mythos in the hands of organisations that need it to defend their systems and the systems most of the internet depends on.

Project Glasswing has two layers.

### The 12 primary partners

A core group of twelve large technology and security companies. Anthropic has named some of these publicly. The list of those publicly named so far includes:

- Amazon
- Apple
- Broadcom
- Cisco
- CrowdStrike
- The Linux Foundation
- Microsoft
- Palo Alto Networks

[According to TechCrunch's coverage](https://techcrunch.com/2026/04/07/anthropic-mythos-ai-model-preview-security/), there are four more partners in the primary twelve that have not yet been named publicly. The selection logic is straightforward. These are the companies whose code, hardware, or security products underpin the systems most other organisations rely on.

![Project Glasswing partner diagram showing the eight publicly named Claude Mythos partners — AWS, Apple, Broadcom, Microsoft, Cisco, Palo Alto Networks, CrowdStrike, and The Linux Foundation — along with four unnamed partner slots](/posts/claude-mythos-glasswing-partners.jpg)

### Around 40 additional organisations

Beyond the primary twelve, Anthropic has granted **monitored access to roughly 40 more organisations** that build or maintain critical software. Think open-source maintainers, infrastructure projects, security research groups. They get the model under tighter logging and review than the primary partners, and the use cases they are allowed to pursue are narrower.

### Around $100 million in usage credits

The program is reportedly backed by roughly **$100 million in usage credits** from Anthropic. That figure is not a discount or a marketing line. It is what it costs to run a model this expensive against thousands of large codebases, and Anthropic appears to be absorbing that cost so partners are not deciding whether to scan based on a budget meeting.

### Why not just sell it

The question naturally follows. If Mythos works, why not put it on the API and let everyone pay for it.

Anthropic's stated reason is that the gap between offensive and defensive capability matters more than any single product launch. If Mythos is generally available, every motivated attacker has a tool that finds zero-days at scale. If Mythos is in the hands of vendors and infrastructure maintainers first, those vendors get a window to patch before anyone else can swing it. Project Glasswing is, in effect, an attempt to spend the gap on defence.

You can argue with the choice. Plenty of researchers have. But the logic is internally consistent and it is the first time a frontier lab has gated a model release this seriously on dual-use grounds rather than just product readiness.

## Why this matters for the rest of us

Even if you will not touch Mythos directly, the next twelve months are going to feel its effects. Three of those effects are worth thinking about now.

### The patch wave is coming

The vulnerabilities Mythos has already found are inside the responsible disclosure pipeline. Over the next few months, you will see security advisories from OpenBSD, FreeBSD, FFmpeg, and a long list of other projects show up at a higher rate than usual. Many of these will be quietly serious. A few will be the sort that move oncall rotations.

If you run servers, watch the advisories more carefully than usual. If you ship software that includes any of these projects as dependencies, expect updates that are not optional.

### The economics of vulnerability research are shifting

Bug bounty programs, security consultancies, and the small number of professional vulnerability researchers all priced their work around scarcity. Finding a real zero-day is hard, takes weeks, and cannot be parallelised. Mythos changes that math for the partners that hold it. For everyone else, the math has not changed yet, but the ceiling above it just got higher.

I think we will see the bounty market sort itself out within a year. Severity-based rewards for "anyone could run a tool and find this" bugs will shrink. Rewards for novel exploitation chains, which are still genuinely creative work, will grow. The middle disappears.

### Defensive AI catches up to offensive AI in production

For the past two years, the conversation has been about AI helping attackers. Mythos shifts the centre of gravity. The first place a model this strong is being deployed is inside large vendors' codebases, hunting for problems before attackers see them. That is not the only direction the technology will go, but it is the first direction Anthropic has chosen to push it, and the rest of the industry will respond.

If you build security tools, the bar just moved. Static analysis vendors are already in conversations about how to integrate Mythos-style capability without turning their products into the same dual-use risk Anthropic was trying to avoid.

## How Mythos fits next to the other Claude models

Quick clarification, since "clause mythos" is itself a trending search and most of those people are just mistyping.

Mythos is a separate model inside the Claude family. It does not replace Claude Opus or Claude Sonnet, and it is not what your Claude Code session is running on. The general-purpose Claude models you may already use through Claude Code, the Anthropic SDK, or claude.ai keep their own release cadence. If you are building agents or coding assistants today, you are not waiting on Mythos for anything. You are using Opus or Sonnet, and that work continues exactly as before.

Mythos sits beside those models, on a different release track, with a much narrower distribution. Treat it as a research-grade defensive capability, not a developer product.

## What Project Glasswing partners are likely doing with it

The partners are not publishing playbooks, and Anthropic has not detailed each engagement. But the choice of companies in the primary group tells you most of what you need to know. Three patterns are reasonable to expect.

- **Scanning their own first-party code.** The largest partners ship some of the largest commercial codebases on Earth. Pointing Mythos at internal kernels, hypervisors, and core services is the obvious first move and the one that justifies a partnership on internal grounds alone.
- **Scanning critical open source.** The Linux Foundation's place on the list signals that widely-used open-source dependencies are squarely in scope. Expect a steady drip of CVEs from common libraries through 2026.
- **Improving detection products.** Security vendors like CrowdStrike and Palo Alto Networks make their money on detection. Mythos-generated exploit data is the kind of training input those models need, which is a different use case from "find the bug" and arguably the more durable one.

None of this has been confirmed in line-item detail. But if you work anywhere that depends on the products these vendors ship, the safe assumption for the rest of the year is that what you rely on is being audited by something far stronger than what audited it last year.

## Common questions

**Can I get access to Claude Mythos?**
Not as an individual or a small company. Access is limited to Project Glasswing's 12 primary partners and roughly 40 additional organisations vetted by Anthropic. There is no public sign-up.

**Is Mythos available through the Anthropic API?**
No. The standard Anthropic API exposes the general-purpose Claude models. Mythos is on a separate, gated track.

**Will Mythos eventually be released publicly?**
Anthropic has not committed to a date. The current line is that broader release will be considered when defensive uptake of the early findings is far enough along that public availability does not hand attackers a sudden advantage. Read that as "not soon."

**Does Mythos replace Claude Opus or Sonnet?**
No. It is a separate model with a different purpose. The general-purpose Claude line continues on its own schedule.

**Is using Mythos legal in security work?**
For the partners that have it, yes, under the contractual terms Anthropic set. There is no public version to be legal or illegal about.

**How is Mythos different from existing AI security tools?**
Existing tools, including Cursor's new security review feature, Bugbot, and various GitHub-side scanners, focus on known vulnerability patterns and code review against rules. Mythos searches for unknown vulnerabilities, including ones whose pattern has never been seen before. The two are complementary, not the same category.

**What should my company do about all this?**
Three things. Update aggressively over the next six months as advisories land. Audit the dependencies you ship for the OpenBSD, FreeBSD, FFmpeg, and similar projects that are already in Mythos' disclosure pipeline. And review your own incident response posture, because the rate of important advisories is going up whether you are ready or not.

## Closing thought

Most AI launches in 2026 are about the next generation of chat. Mythos is not that. It is the first frontier model whose primary purpose is finding holes in the software the world runs on, and the first whose initial release was structured more like a public-health intervention than a product drop.

Whether you think Project Glasswing is the right answer or not, the pattern it sets is going to show up again. Capability is moving faster than the markets and processes built around it. The labs are starting to ship the response to that reality, not just the capability itself.

If you want a fuller picture of where Anthropic's models sit relative to the rest of the field, the [Claude Opus 4.7 vs GPT-5 comparison](/posts/claude-opus-4-7-vs-gpt-5) on this site walks through the developer-facing models you actually can build with today. For the agent and tool-use side of the same family, the [Claude Agent SDK vs LangChain piece](/posts/claude-agent-sdk-vs-langchain) is the better starting point. More on the broader [AI agents](/tags/ai-agents) topic on this site for follow-up reading.

Mythos is the headline this week. The rest of the Claude lineup is still where the day-to-day work happens.
