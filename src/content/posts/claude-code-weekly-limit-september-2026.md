---
title: "Claude Code Weekly Limit Cut on Sept 14, 2026: What to Do"
description: "Anthropic's +50% Claude Code weekly promo ends Sept 13 and a smaller +25% base takes over Sept 14. Plain guide with per-plan numbers and workarounds."
pubDate: 2026-09-02
author: "Muhammad Moeed"
tags: ["claude-code", "claude", "anthropic"]
keywords: [
  "claude code weekly limit september 2026",
  "claude code weekly limit cut",
  "anthropic weekly limit 25 percent",
  "claude code september 14 change",
  "claude code +50% promo ends",
  "claude code max weekly limit",
  "claude code /usage command",
  "claude code weekly limit reset",
  "claude code alternative to weekly cap",
  "claude code bedrock vertex switch"
]
featured: true
---

If you pay for Claude Code, your weekly limit is about to shrink. On Sept 13, 2026 at 11:59 PM PT, Anthropic's temporary +50% promo ends. On Sept 14, a smaller +25% permanent base takes over. Compared to what you have this week, that is about a 17% cut.

This guide gives you the per-plan numbers, what stays the same, how to check your own limit, and the workarounds people are already using.

## Quick answer

- **Old promo** (May 13 to Sept 13, 2026): weekly limit was baseline × 1.50
- **New permanent base** (Sept 14, 2026 onward): weekly limit is baseline × 1.25
- **Net change vs today**: about −17% (the math is 1.25 ÷ 1.50 = 0.833)
- **Net change vs pre-promo**: +25%
- **The 5-hour rolling window**: no change
- **Plans affected**: Pro, Max 5x, Max 20x, Team, and legacy seat-based Enterprise
- **Free plan and new consumption-based Enterprise**: not affected

## Before and after: per-plan weekly limits

Anthropic has never published raw token counts. The hour ranges below come from its July 28, 2025 announcement (via TechCrunch), with the +50% and +25% multipliers applied.

| Plan | Baseline (pre-promo) | Today (promo, ends Sept 13) | From Sept 14 (new base) |
|---|---|---|---|
| **Pro ($20/mo)** | 40–80 hrs Sonnet | 60–120 hrs Sonnet | 50–100 hrs Sonnet |
| **Max 5x ($100/mo)** | 140–280 hrs Sonnet + 15–35 hrs Opus | 210–420 hrs Sonnet + 22.5–52.5 hrs Opus | 175–350 hrs Sonnet + 18.75–43.75 hrs Opus |
| **Max 20x ($200/mo)** | 240–480 hrs Sonnet + 24–40 hrs Opus | 360–720 hrs Sonnet + 36–60 hrs Opus | 300–600 hrs Sonnet + 30–50 hrs Opus |
| **Team** | Standard seat = 1.25× Pro; Premium seat = 6.25× Pro (per session) | Same multipliers, on top of +50% Pro base | Same multipliers, on top of +25% Pro base |
| **Enterprise** | Legacy seat-based: matches seat tier. New consumption-based: no cap | Only legacy seat-based got the +50% | Only legacy seat-based gets the +25% |

Two things to note:

1. Hour ranges are wide because usage depends on your codebase size and how much cache reuse your session gets.
2. The Max 20x plan is only about 1.7× the weekly cap of Max 5x, not 4×. The "20x" multiplier applies to the 5-hour session window only. A user lawsuit over this framing was filed against Anthropic in late August 2026.

## What Anthropic actually said

Here is the wording from the @ClaudeDevs tweet on Aug 29, 2026:

> Starting September 14, we're permanently raising standard weekly limits in Claude Code by 25% for Pro, Max, Team, and seat-based Enterprise plans. Until then, the current 50% increase will be in place. Compared to today, this works out to a 17% reduction in weekly limits on Claude Code.

The support article (dated Aug 18, 2026) is even shorter:

> This promotion increases weekly usage limits only. 5-hour usage limits are not affected by this promotion.

So the plain version is: **the weekly cap goes down, the 5-hour window does not change.**

## The math in one line

Think of your baseline weekly limit as 1.00.

- During the promo (now): you get 1.50.
- After Sept 14: you get 1.25.
- 1.25 ÷ 1.50 = 0.833, so you keep 83% of your current limit. That is a 17% cut.
- But 1.25 is still 25% more than the 1.00 you had before May 2026.

Both framings are true. Which one matters to you depends on when you started paying.

## What changes for each plan

**Pro ($20/mo)**: You go from about 60–120 hours of Sonnet per week to about 50–100. If you spend most of your week in Sonnet, expect to hit the wall one day earlier than usual.

**Max 5x ($100/mo)**: Sonnet drops from ~210–420 hrs to ~175–350 hrs. Opus drops from ~22–52 hrs to ~19–44 hrs. Heavy Opus users feel this first.

**Max 20x ($200/mo)**: Sonnet drops from ~360–720 hrs to ~300–600 hrs. Opus drops from ~36–60 hrs to ~30–50 hrs. Community math on Hacker News shows that two Max 5x seats now give more total weekly capacity than one Max 20x.

**Team**: The seat multipliers (Standard 1.25×, Premium 6.25×) stay the same. They now sit on top of a smaller Pro base, so total weekly hours per seat drop by the same 17%.

**Enterprise**: If you are on the new consumption-based Enterprise, nothing changes. If you are on legacy seat-based Enterprise, your Premium seats follow the same +25% base.

## What stays the same

- The **5-hour rolling window** is not touched. Your session-level cap is the same.
- The **weekly reset schedule** is still a rolling 7-day window per user.
- The **Opus vs Sonnet split** is still shown separately in `/usage`.
- **Free plan users** are not affected. This change is paid plans only.

## How to check your own weekly limit

Run `/usage` inside Claude Code (v2.1.251 or newer). You get a Session block at the top plus a plan-usage view underneath.

The Session block looks like this:

```
Session
Total cost:            $0.55
Total duration (API):  6m 20s
Total duration (wall): 6h 33m 10s
Total code changes:    0 lines added, 0 lines removed
Usage by model:
   claude-sonnet-4-6:  1.2k input, 5.3k output, 940.0k cache read, 50.0k cache write ($0.55)
Prompt cache (main):   14 requests · 91% of input tokens from cache · 2 misses ...
```

Below the Session block, on paid plans, you see:

- Attribution shares (which skills, subagents, plugins, and MCP servers used your tokens)
- Behavior flags (anything above 10% of recent usage)
- Loops rows (heaviest scheduled tasks)

Press `w` to switch from the last 24 hours view to the last 7 days view. Press `d` to switch back. Press `r` to retry if the plan-limits endpoint is rate-limited.

If your bars look normal today, come back on Sept 14 and compare. Same session, same codebase, same prompt style — you should see the weekly percent bar climb faster.

## What to do before Sept 14

You have about 12 days. Here is the short list.

**1. Take a screenshot of your `/usage` output today.** Save it. On Sept 14, take another one. Compare. That is the only way to see the real impact on your own workload.

**2. Move automation off your subscription.** Anything you run on a schedule (nightly reviews, CI hooks, `/loop` tasks) should move to the [Claude Agent SDK](/posts/claude-agent-sdk-credit-pool). The SDK uses an API key, so its tokens do not count against your Claude Code weekly cap.

**3. Turn on usage credits.** In Settings > Usage, enable usage credits. It does not charge you unless you actually spill past the weekly cap. When you do, you pay standard API rates on the overflow instead of losing access.

**4. Learn the model switch.** Use `/model` inside a session. Sonnet handles most coding well and costs less than Opus. Reserve Opus for hard architecture work. If a subagent does a simple task, set `model: haiku` in its config.

**5. Set the 1-hour prompt cache TTL** if you use long sessions. Add `promptCacheTtl: '1h'` to your config or set `CLAUDE_CODE_PROMPT_CACHE_TTL=1h`. The default is 5 minutes, which resets the cache more often and costs you tokens.

## Workarounds people are already using

From the Reddit and Hacker News threads on the Aug 29 announcement:

**Route through Amazon Bedrock or Google Vertex.** Set `CLAUDE_CODE_USE_BEDROCK=1` (with `AWS_REGION`) or `CLAUDE_CODE_USE_VERTEX=1`. Tokens are billed to your cloud account, not your Anthropic subscription. Your weekly cap becomes your cloud budget.

**Run two Max 5x seats instead of one Max 20x.** Community math shows two $100 plans give more total weekly capacity per dollar than one $200 plan. A community tool at github.com/realiti4/claude-swap helps swap between accounts mid-session with `/login`.

**Try a different provider for background tasks.** Users in the HN thread are moving background and automation work to Z.ai (GLM), Kimi 2.5 with OpenCode Go, DeepSeek, Google Gemini, or OpenAI Codex. Some report Codex resets weekly limits more often.

**Turn off subagent forking.** If you are on an experimental agent-teams build, subagent forking can multiply your token spend by roughly 7×. Leave `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` off and cap concurrency with `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`.

**Turn off auto mode.** If auto mode runs long autonomous loops, you burn weekly capacity fast. Set `permissions.disableAutoMode='disable'` or `defaultMode='default'` so Claude pauses for approval instead.

**Save `/compact` for real breaks.** `/compact` itself costs tokens because it re-reads history. Use `/clear` (free) between unrelated tasks and `/compact` only when you want to keep the conversation continuity.

More background on session-level habits is in the [Claude Code slow fix guide](/posts/claude-code-slow-fix) and the [Agent SDK cost tracking guide](/posts/claude-agent-sdk-cost-tracking).

## FAQs

### When exactly does the Claude Code +50% weekly-limit promo end in 2026?

The promo ends on **September 13, 2026 at 11:59 PM PT**, per Anthropic's support article. The new permanent +25% base takes over on September 14, 2026.

### Is the "25% permanent raise" really a 17% cut for current users?

Both are true. Compared to your pre-May 2026 baseline, the new limit is +25%. Compared to what you have this week (baseline × 1.50), the new limit (baseline × 1.25) is about 17% lower. Anthropic's own tweet uses the "17% reduction" framing.

### Which plans are affected — Pro, Max 5x, Max 20x, Team, Enterprise?

All paid consumer plans get the +25% base: Pro, Max 5x, Max 20x, Team, and legacy seat-based Enterprise. Free plan and the newer consumption-based Enterprise are not affected.

### How do I check my Claude Code weekly limit and reset time with /usage?

Run `/usage` inside Claude Code v2.1.251 or newer. You get a Session block plus a plan-usage view. Press `w` for the 7-day view, `d` for the 24-hour view, and `r` to retry if the plan-limits endpoint fails.

### What happens when I hit the weekly limit — can I still use Opus or Sonnet?

If you hit the **overall weekly cap**, `/model` does not help — you are locked out of all models until the reset. If you hit a **model-specific cap** (like "Opus limit reached"), switching to another family with `/model` keeps you working. Usage credits (Settings > Usage) let you keep going at standard API rates.

### How do I avoid getting throttled after September 14, 2026?

Four steps: move automation to the Agent SDK, turn on usage credits, default to Sonnet with `/model`, and route heavy workloads through Bedrock or Vertex so tokens hit your cloud budget instead of your subscription cap.

### Does the change affect the 5-hour rolling window too, or only the weekly cap?

Weekly cap only. Anthropic's support article states plainly: "5-hour usage limits are not affected by this promotion." The permanent +25% raise on Sept 14 also refers only to the weekly cap.

### Should I move heavy workloads to the Agent SDK credit pool or Bedrock?

Both work, but they solve different problems. The [Claude Agent SDK](/posts/claude-agent-sdk-credit-pool) fits scheduled background jobs (API key auth, per-token billing). Bedrock or Vertex fits teams that want cloud-console spend controls and IAM policies. Either one takes the workload off your Claude Code weekly cap.

## What we still do not know

Anthropic did not publish raw token numbers, so a lot is still guesswork:

- Exact weekly token counts per plan
- Whether the +25% applies uniformly to Sonnet and Opus caps, or only one
- Whether Team seat multipliers now sit on the new base or the old base
- What the "exciting changes" Anthropic teased in the same tweet actually are
- What happens to the current-week counter for users who straddle Sept 13/14
- Whether the WSJ-reported false-advertising lawsuit against Max 20x will force disclosure

I will update this page once Anthropic publishes an official numbers table or the lawsuit produces one.

## Where to go next

- [Claude Agent SDK credit pool guide](/posts/claude-agent-sdk-credit-pool) — how the API-key billing pool works, and why moving automation there gets it off your weekly cap.
- [Claude Code Ultraplan guide](/posts/claude-code-ultraplan-guide) — how plan mode and session structure affect cost.
- [Claude Code slow fix guide](/posts/claude-code-slow-fix) — session-level habits that stretch the same weekly budget further.
- [Agent SDK cost tracking guide](/posts/claude-agent-sdk-cost-tracking) — what to measure so the Sept 14 shift is not a surprise on your bill.

**Last updated: September 2, 2026.** I will re-check on Sept 14 and update the per-plan numbers if Anthropic publishes a real table, or if community `/usage` reports show the derived math is off.
