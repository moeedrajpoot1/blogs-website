---
title: "Claude Agent SDK Credit Pool: June 15 Billing Change Explained"
description: "Anthropic moved Agent SDK, claude -p, and Claude Code Actions off subscriptions to a capped credit pool June 15. See the rates and overflow setup."
pubDate: 2026-06-16
author: "Muhammad Moeed"
tags: ["claude-agent-sdk", "claude-code", "tutorials"]
keywords: [
  "claude agent sdk credit pool",
  "claude agent sdk june 15 2026",
  "claude agent sdk billing change",
  "claude agent sdk overflow billing",
  "claude code github action credits",
  "claude agent sdk pricing 2026",
  "claude code billing change june 2026",
  "claude max 5x credit pool",
  "anthropic agent sdk credits",
  "claude code overflow billing",
  "agent sdk credit exhaustion fix"
]
featured: true
---

On June 15, 2026, Anthropic split how programmatic Claude usage is billed. If you run the Claude Agent SDK, `claude -p` in a shell script, a Claude Code GitHub Action, or any third-party app built on the Agent SDK, those calls no longer draw from your subscription rate limits. They draw from a separate, capped monthly credit pool: **$20 for Pro, $100 for Max 5x, $200 for Max 20x.** Interactive `claude` use in your terminal is unchanged.

The change is not a price hike. It is a usage cap on programmatic workloads. If you run a Claude Code GitHub Action on every pull request, or a long-running Agent SDK loop in production, it matters today.

This guide walks through what changed, the math, the breakage pattern, the GitHub Action YAML fix, how to enable overflow billing, and how to cut Agent SDK costs so the new pool actually lasts the month.

## What changed in three sentences

Before June 15, every call your code made to Claude through the Agent SDK, `claude -p`, or a GitHub Action drew from the same subscription rate limits as your interactive Claude Code sessions. After June 15, all programmatic calls draw from a separate monthly credit pool sized to your plan, metered at standard API rates, with no rollover. Interactive Claude Code in your terminal is unaffected, and your subscription rate limits there work exactly as before.

## What still uses the subscription and what does not

The line between subscription and credit pool is whether a human is at the keyboard.

| Workload | Before June 15 | After June 15 |
|---|---|---|
| Interactive `claude` (you typing in a terminal) | Subscription | Subscription (unchanged) |
| `claude -p "..."` in a shell script | Subscription | Agent credit pool |
| Claude Agent SDK app (Python / TypeScript) | Subscription | Agent credit pool |
| Claude Code GitHub Action | Subscription | Agent credit pool |
| Third-party app built on the Agent SDK | Subscription | Agent credit pool |
| Direct Anthropic API calls (existing API key) | API billing | API billing (unchanged) |

The split is intentional. Interactive use is what subscribers pay for. Programmatic use is closer to running a small piece of cloud infrastructure, so it gets metered like one.

## The credit pool math

The pool tracks usage against full standard API rates. Token prices have not changed.

| Plan | Monthly pool | Approx. Opus 4.7 output budget | Approx. Sonnet 4.6 output budget |
|---|---|---|---|
| Pro ($20) | $20 | ~266K output tokens | ~1.3M output tokens |
| Max 5x ($100) | $100 | ~1.3M output tokens | ~6.7M output tokens |
| Max 20x ($200) | $200 | ~2.7M output tokens | ~13.3M output tokens |

A more honest example with both input and output tokens included. A large Claude Code GitHub Action review of a 500-line pull request can read 100,000 to 300,000 input tokens and generate 50,000 to 150,000 output tokens. At Opus 4.7 rates that costs roughly $5 to $16 per review. A Pro Agent SDK pool covers about 2 to 4 of those large reviews per month, a Max 5x pool covers 6 to 20, and a Max 20x pool covers 12 to 40. Smaller reviews on Sonnet 4.6 cost five to ten times less, so the model split matters more than the plan tier in most cases.

Credits do not roll over between months. Unused budget at month end is gone.

## Why this matters today, not next month

If you have a Claude Code GitHub Action wired to run on every pull request, you are now metered against the pool. Three or four large reviews per week on Opus 4.7 can exhaust a Pro pool before the month is out. The Action does not warn you. It fails the workflow when the next call hits an empty pool.

The same applies to any Agent SDK loop running unattended: a nightly summarisation job, a Slack triage bot, a Discord moderation agent, a documentation auto-updater. They were all subsidised by your subscription before June 15. They are not now.

If you are a normal interactive user who runs `claude` in a terminal a few times a day, nothing about your day changed. If you are running anything automated, today is the day to check.

## The breakage pattern when the pool runs out

When the credit pool is exhausted and overflow is not enabled:

- Subscription tools (interactive `claude` in your terminal) keep working as before.
- Programmatic tools (`claude -p`, Agent SDK, GitHub Action) start returning an error on the next call.
- The error is a 402-style response with a body that explicitly names the credit pool.
- For a GitHub Action, the workflow step fails. The next pull request also fails until either the next billing cycle, or you enable overflow, or you upgrade the plan.

The interactive vs. programmatic asymmetry can be confusing to debug for a few minutes. If you can still run `claude` in your terminal but your GitHub Action is failing on the same account, you are out of pool credits, not actually rate limited at the model level.

## Detecting credit exhaustion in code

The Anthropic SDK raises a regular API error when the pool is empty. The error code is the same 429 family that classic rate limits use, but the body carries a distinct message naming the credit pool. Treat them as two different cases.

```python
from anthropic import Anthropic, APIStatusError

client = Anthropic()

try:
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello"}],
    )
except APIStatusError as e:
    body = str(e)
    if e.status_code == 429 and "credit pool" in body.lower():
        # The agent credit pool is exhausted. Don't retry blindly —
        # either fail loud, switch to a billable API key, or stop the job.
        handle_credit_exhaustion()
    elif e.status_code == 429:
        # Classic rate limit. Backoff and retry.
        backoff_and_retry()
    else:
        raise
```

If you do not split these two cases, a backoff-and-retry loop on credit exhaustion will burn your remaining minutes against a wall. The exhaustion case should fail loud or hand off to a billable API key, not retry.

## How to set up overflow billing

Overflow billing lets programmatic usage continue past the pool by billing the surplus directly to your payment method at standard API rates. Without overflow, the call simply fails.

1. Open https://console.anthropic.com.
2. Go to Settings, then Billing.
3. Toggle "Allow overflow for Agent SDK."
4. Save.

After overflow is enabled, the pool drains first, then any additional usage bills at API rates. There is no cap unless you add a budget alert (Console, Usage, Set a budget). For production agent apps that cannot tolerate a mid-month failure, overflow plus a budget alert at 80 percent of your monthly expectation is the safe default.

If you maintain a serious agent app, the cleanest path is often to skip the credit pool entirely and run that app on a regular Anthropic API key. That removes the pool coupling and gives you the same direct billing you had before June 15.

## The GitHub Action YAML pattern that breaks vs. the fix

Before June 15, this workflow ran indefinitely under your subscription rate limits.

```yaml
name: Claude Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Claude Code review
        uses: anthropics/claude-code-action@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_SUBSCRIPTION_TOKEN }}
```

After June 15, the same workflow still runs, but every review draws from the Agent SDK credit pool. When the pool empties, the next pull request triggers a failed step.

The minimum fix is to switch the token to a billable Anthropic API key with overflow already covered:

```yaml
name: Claude Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Claude Code review
        uses: anthropics/claude-code-action@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
        env:
          # Cap the per-run cost so a runaway review cannot exhaust your account
          CLAUDE_MAX_TURNS: "30"
          CLAUDE_MAX_TOKENS: "4096"
```

The two environment caps in the second example are not strictly required, but they are how most teams who hit a single $200 review story stop the same thing from happening again. A runaway agent with no `max_turns` can loop tool calls until something forces a stop.

## A pragmatic checklist before the next billing cycle

Run through these once and the new structure stops being a surprise.

1. Open the Anthropic Console, Billing, and read your current credit pool balance.
2. Open Usage, filter to the last 30 days, and split the spend by model and by source.
3. Identify which calls were interactive (free under subscription) and which were programmatic (now metered).
4. If programmatic usage in the last 30 days exceeds your pool, decide which fix applies: upgrade the plan, enable overflow, or move that workload to a billable API key.
5. Add a budget alert in the Console at 80 percent of your monthly expectation.
6. Update your error handling code to detect credit-pool exhaustion as a distinct case from classic rate limits.
7. Walk the GitHub Action workflows in your top three repos and confirm each one points at a billable API key, not a subscription token, if you want them to keep running past the pool.

The owners I have seen most rattled by this change were running a Claude Code GitHub Action on every push to several busy repos. The fix for them was the model split below, not a plan upgrade.

## How to cut Agent SDK costs so the pool actually lasts

The Agent SDK credit pool is not generous if you run Opus 4.7 on everything. It is fine if you treat it as a budget and route work accordingly.

- **Use Haiku 4.5 for triage and Opus 4.7 for synthesis.** Haiku is roughly 15 times cheaper for output tokens. A triage step that decides which files to read or which tool to call almost never needs Opus. Save Opus for the synthesis pass that writes the final answer.
- **Enable prompt caching with a 5-minute TTL.** Agent SDK loops that re-send the same context for many turns are the textbook case for prompt caching. The cost saving on cached input tokens is large, and the integration is one parameter on the call.
- **Move non-interactive work to the Batch API.** If a job can wait minutes rather than seconds, the Batch API is half price. Nightly summarisation, evals, large dataset labelling — all good fits.
- **Cap `max_tokens`.** An agent generating 4096 tokens when the answer needed 512 is straight waste. Set the cap on every call.
- **Profile your spend.** The Anthropic Console Usage tab breaks spend down by model. If 80 percent of your pool is going to Opus calls that produce one-line responses, that is the first thing to fix.

For deeper instrumentation patterns, see the [Claude Agent SDK cost tracking guide](/posts/claude-agent-sdk-cost-tracking). The patterns it covers (per-call cost logging, per-tool-call budgets, weekly burn reports) become more important now that the pool is a fixed budget instead of a soft rate limit.

## Frequently asked questions

### What is the Claude Agent SDK credit pool?

The Agent SDK credit pool is a separate monthly budget that all programmatic Claude usage draws from after June 15, 2026. Pro plans get $20, Max 5x plans get $100, Max 20x plans get $200. It is metered at standard API rates, does not roll over, and applies to the Agent SDK, `claude -p`, Claude Code GitHub Actions, and third-party Agent SDK apps.

### Does the June 15 billing change affect interactive Claude Code?

No. Interactive `claude` use in your terminal still draws from your subscription rate limits exactly as before. Only programmatic usage moves to the credit pool.

### What happens when the Agent SDK credit pool runs out?

Without overflow billing enabled, your next programmatic API call returns a 402-style error and your Agent SDK app, `claude -p` script, or GitHub Action fails. With overflow enabled, additional usage continues at standard API rates billed directly to your payment method.

### How do I enable overflow billing for the Agent SDK?

Open the Anthropic Console, go to Settings, then Billing, and toggle "Allow overflow for Agent SDK." Save. Add a budget alert under Usage so you get a warning before a runaway agent exhausts your account.

### Can I keep using my subscription token in a GitHub Action?

Yes, but the calls now draw from the Agent SDK credit pool instead of your interactive limits. When the pool empties, the Action fails. For production workflows, the cleaner pattern is a regular Anthropic API key with overflow billing or a budget cap.

### Why did Anthropic make the June 15 change?

Anthropic has said the change separates interactive subscriber usage from programmatic workloads, which were being run 24/7 by some accounts at an actual cost far higher than the flat subscription rate. The structural separation lets interactive subscription pricing stay where it is, while programmatic usage is metered closer to the underlying cost.

### How do I detect credit-pool exhaustion in my Agent SDK code?

The exhaustion error is a 429-family status code with an error body that explicitly mentions the credit pool. Check the body string for "credit pool" or the specific error code Anthropic ships with the response, and branch your error handling so an exhaustion does not trigger a regular rate-limit retry loop.

### Should I upgrade my plan or enable overflow?

Upgrade the plan if your steady-state programmatic usage is reliably above the pool every month and you want a predictable bill. Enable overflow if your usage is bursty and a small monthly spillover is cheaper than the next plan tier. Many teams do both.

## Where to go next

For the longer view of Agent SDK billing, see the [Claude Agent SDK cost tracking guide](/posts/claude-agent-sdk-cost-tracking). For comparison with other agent frameworks before you commit any deeper, the [Claude Agent SDK vs LangChain](/posts/claude-agent-sdk-vs-langchain) and [Claude Agent SDK vs Vercel AI SDK 6](/posts/claude-agent-sdk-vs-vercel-ai-sdk) comparisons cover when each one is the right tool. If your Agent SDK app is also a Claude Code user, the [Claude Code Skills practical guide](/posts/claude-code-skills-complete-guide) covers how to bound model behavior with skills so you stop re-prompting (and re-paying) for the same instructions.

The summary is short. The June 15 change is not a price hike. It is a cap on programmatic usage. If you run agents in production or a Claude Code GitHub Action on every pull request, the credit pool matters today. Open the Anthropic Console, confirm your balance, enable overflow if you cannot tolerate a mid-month failure, and split your model use so Haiku does the triage and Opus does the work. The interactive Claude Code experience you have been paying for has not changed at all.
