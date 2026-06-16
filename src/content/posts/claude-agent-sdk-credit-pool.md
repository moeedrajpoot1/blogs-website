---
title: "Claude Agent SDK Credit Pool: A Plain Guide to the June 15 Change"
description: "On June 15 Anthropic split Agent SDK billing into a separate monthly pool. Plain guide to what changed, what breaks, and how to keep your tools running."
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

On June 15, 2026, Anthropic changed how it bills Claude when you use it from code instead of from your keyboard.

If you only use Claude in your terminal, by typing prompts and reading the answers, nothing changed for you. Your subscription works the same as it always did.

But if you run the Claude Agent SDK, or `claude -p` inside a shell script, or a Claude Code GitHub Action that reviews pull requests, those calls now come out of a separate monthly pot of money. Pro plans get $20 a month for this pot. Max 5x plans get $100. Max 20x plans get $200.

When the pot is empty, those tools stop working until next month, unless you turn on overflow billing. This guide walks through what changed, what breaks, what to do about it, and a few ways to make the pot last longer.

## What changed, in plain words

The simple rule is this. If a human is sitting at the keyboard, the call still comes out of your subscription, the same as before. If your code is running on its own, the call now comes out of the new pot.

That is the whole change. Subscription rate limits did not move. API prices did not move. Anthropic just split the two kinds of usage so the automated kind is metered against a fixed monthly budget instead of sharing the interactive rate limits.

| What you are doing | Before June 15 | After June 15 |
|---|---|---|
| Typing in `claude` in your terminal | Subscription | Subscription (same as before) |
| `claude -p "..."` inside a shell script | Subscription | New monthly pot |
| Claude Agent SDK app (Python or TypeScript) | Subscription | New monthly pot |
| Claude Code GitHub Action | Subscription | New monthly pot |
| Third-party app built on the Agent SDK | Subscription | New monthly pot |
| Direct API calls with your existing API key | API billing | API billing (same as before) |

The split is on purpose. Interactive use is what people pay the subscription for. Automated use looks more like running a small piece of cloud infrastructure, so it now gets billed the same way.

## How much does the pot actually buy you

The pot uses the normal API prices. Token prices have not changed.

| Plan | Monthly pot | Pure Opus 4.7 output budget | Pure Sonnet 4.6 output budget |
|---|---|---|---|
| Pro ($20) | $20 | about 266K output tokens | about 1.3M output tokens |
| Max 5x ($100) | $100 | about 1.3M output tokens | about 6.7M output tokens |
| Max 20x ($200) | $200 | about 2.7M output tokens | about 13.3M output tokens |

A simple example so the numbers feel real. Each Claude Code review of a 500-line pull request reads a lot of code (often 100,000 to 300,000 input tokens) and writes a smaller summary back (50,000 to 150,000 output tokens). On Opus 4.7 prices, one big review like that costs roughly $5 to $16.

So in plain numbers:

- A Pro pot ($20) covers about 2 to 4 big Opus reviews per month
- A Max 5x pot ($100) covers about 6 to 20
- A Max 20x pot ($200) covers about 12 to 40

If you use Sonnet 4.6 instead of Opus, each review costs five to ten times less, so the same pot lasts much longer. The model you pick matters more than the plan you pick.

Unused pot at the end of the month is gone. It does not roll over.

## Why this matters today, not next month

If you have a Claude Code GitHub Action that runs on every pull request, your pot is being used every time someone opens one. Three or four big reviews per week on Opus 4.7 can empty a Pro pot before the month is done. The Action does not warn you. It just fails when the pot is empty.

The same thing applies to any agent that runs on its own. A nightly script that summarises a Slack channel. A bot that triages support tickets. A Discord moderator. A documentation updater that runs on a schedule. All of these were quietly paid for by your subscription before June 15. They are not now.

If you only use Claude in your terminal a few times a day, today changed nothing for you. If anything in your setup runs by itself, today is a good day to look at it.

## What breaks when the pot is empty

When the pot runs out and overflow billing is off:

- Interactive `claude` in your terminal keeps working the same way.
- Automated tools (`claude -p`, Agent SDK, GitHub Action) start returning errors.
- The error is a 402-style response, and the message inside says something about the credit pool by name.
- For a GitHub Action, the workflow step fails. The next pull request also fails. This keeps happening until you either wait for next month, turn on overflow, or change the token to a regular API key.

The split between "interactive still works" and "automated is failing" can be confusing for a few minutes the first time you see it. If you can still run `claude` in your terminal but your GitHub Action is failing on the same account, you are out of pot money. You are not actually being rate limited.

## How to spot pot exhaustion in your code

The Anthropic SDK throws a normal API error when the pot is empty. The status code is `429`, which is the same code used for normal rate limits. The difference is in the error message: it mentions the credit pool by name. Treat the two as different problems.

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
        # The pot is empty. Don't retry blindly — either stop, show a
        # clear error, or switch to a separate billable API key.
        handle_credit_exhaustion()
    elif e.status_code == 429:
        # Normal rate limit. Wait and try again.
        backoff_and_retry()
    else:
        raise
```

If you do not split these two cases, a retry loop on an empty pot will just keep trying against a wall. The empty-pot case should stop and show an error, not retry.

## How to turn on overflow billing

Overflow billing lets your automated tools keep working after the pot is empty. The extra usage goes straight to your payment method at normal API prices. Without overflow, the call just fails.

Steps:

1. Open https://console.anthropic.com
2. Go to Settings, then Billing
3. Turn on "Allow overflow for Agent SDK"
4. Save

After it is on, the pot empties first, then any more usage bills at API prices. There is no cap unless you add a budget alert (Console, then Usage, then Set a budget). For real agent apps that cannot afford to stop in the middle of the month, overflow plus a budget alert at 80% of what you expect to use is a safe default.

For a serious production agent app, the cleanest option is often to skip the pot entirely and use a regular Anthropic API key. That removes the link between your subscription and the app, and you get plain direct billing again, the same as before June 15.

## The GitHub Action YAML that breaks, and the fix

Before June 15, this workflow ran forever under your subscription:

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

After June 15, the same workflow still runs, but every review takes money from the new pot. When the pot is empty, the next pull request fails the step.

The simplest fix is to switch the token to a regular Anthropic API key (one that bills directly and has overflow on):

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
          # Stop a runaway review from eating your account
          CLAUDE_MAX_TURNS: "30"
          CLAUDE_MAX_TOKENS: "4096"
```

The two limits in the second example are optional, but they are how most teams who lost a $200 review story stop the same thing from happening again. A loop with no `max_turns` can keep calling tools until something forces it to stop.

## A short checklist for the next billing cycle

Run through this once and the new structure stops being a surprise.

1. Open the Anthropic Console, then Billing, and read your current pot balance.
2. Open Usage, set the filter to the last 30 days, and split the cost by model and by source.
3. Sort the calls into two buckets: interactive (free under subscription) and automated (now uses the pot).
4. If your automated usage last month was bigger than your pot, you have three choices: upgrade the plan, turn on overflow, or move that work to a separate API key.
5. Add a budget alert at 80% of what you expect to use this month.
6. Change your error-handling code so empty-pot errors are treated differently from normal rate limits.
7. Open your top three GitHub Actions and confirm each one uses an API key you are happy to bill against, not a subscription token, if you want them to keep running after the pot is gone.

The owners I have seen caught most off guard by this were running a Claude Code GitHub Action on every push across several busy repos. The fix was not a bigger plan. It was the model split below.

## How to make the pot last longer

The pot is not generous if you run everything on Opus 4.7. It is fine if you treat it as a budget and send each piece of work to the right model.

- **Use Haiku for the small steps and Opus only for the hard ones.** Haiku 4.5 costs about 15 times less than Opus on output. The step that decides "which files should I read" or "which tool should I call next" almost never needs Opus. Save Opus for the part that writes the final answer.
- **Turn on prompt caching with a 5-minute timeout.** If your agent loop sends the same context many times, prompt caching is the obvious win. Cached input tokens cost a fraction of fresh ones, and turning it on is one extra parameter on the call.
- **Use the Batch API for work that does not need to be instant.** If a job can wait a few minutes, the Batch API is half price. Good fits: nightly summaries, evals, large dataset labelling.
- **Set a small `max_tokens` cap.** An agent writing 4096 tokens when 512 would have done the job is paying for waste. Set the cap on every call.
- **Look at your spend by model.** The Anthropic Console Usage tab shows where the money goes. If 80% of your pot is going to Opus calls that produce one-line answers, that is the first thing to fix.

For more on how to instrument an Agent SDK app so you can see where each token goes, see the [Claude Agent SDK cost tracking guide](/posts/claude-agent-sdk-cost-tracking). Those patterns matter more now that the pot is a fixed monthly budget instead of a soft rate limit.

## Frequently asked questions

### What is the Claude Agent SDK credit pool?

The Agent SDK credit pool is a separate monthly budget that all automated Claude usage takes from after June 15, 2026. Pro plans get $20, Max 5x plans get $100, and Max 20x plans get $200. It is metered at normal API prices, does not roll over, and applies to the Agent SDK, `claude -p`, Claude Code GitHub Actions, and any third-party app built on the Agent SDK.

### Does the June 15 billing change affect interactive Claude Code?

No. Interactive `claude` in your terminal still uses your subscription rate limits, the same as before. Only automated usage moves to the new pot.

### What happens when the Agent SDK credit pool runs out?

Without overflow billing on, the next automated call returns a 402-style error, and your Agent SDK app, `claude -p` script, or GitHub Action fails. With overflow on, more usage carries on at normal API prices and bills your payment method directly.

### How do I turn on overflow billing for the Agent SDK?

Open the Anthropic Console, go to Settings, then Billing, and turn on "Allow overflow for Agent SDK". Save. Then add a budget alert under Usage so you get a warning before a runaway agent eats your account.

### Can I keep using my subscription token in a GitHub Action?

Yes, but those calls now take money from the pot instead of your interactive rate limits. When the pot is empty, the Action fails. For real production workflows, the cleaner pattern is a regular Anthropic API key with overflow on or a budget cap set.

### Why did Anthropic make the June 15 change?

Anthropic has said the change splits interactive subscription use from automated workloads. Some accounts were running Agent SDK loops 24 hours a day at a real cost much higher than the flat subscription rate. Splitting the two kinds of use lets the interactive subscription stay the same while automated use is billed closer to its real cost.

### How do I tell pot exhaustion apart from a rate limit in code?

The pot exhaustion error is a `429` status with a body that mentions the credit pool by name. Check the body text for "credit pool" (or the specific error code Anthropic ships with the response) and branch your error handling so an empty pot does not trigger a normal rate-limit retry loop.

### Should I upgrade my plan or turn on overflow?

Upgrade the plan if your steady automated usage is over the pot every month and you want a predictable bill. Turn on overflow if your usage is uneven and a small monthly spillover is cheaper than the next plan tier. Many teams do both.

## Where to go next

For the bigger view of Agent SDK billing, see the [Claude Agent SDK cost tracking guide](/posts/claude-agent-sdk-cost-tracking). To compare other agent frameworks before you commit deeper, the [Claude Agent SDK vs LangChain](/posts/claude-agent-sdk-vs-langchain) and [Claude Agent SDK vs Vercel AI SDK 6](/posts/claude-agent-sdk-vs-vercel-ai-sdk) comparisons cover when each one is the right pick. If your Agent SDK app is also a Claude Code user, the [Claude Code Skills practical guide](/posts/claude-code-skills-complete-guide) covers how to use skills to keep model behavior tight so you stop re-prompting (and re-paying) for the same instructions.

The short version. The June 15 change is not a price hike. It is a cap on automated usage. If you only use Claude in your terminal, your day did not change. If you run agents in production or a Claude Code GitHub Action on every pull request, the pot matters today. Open the Anthropic Console, check your balance, turn on overflow if you cannot risk a mid-month failure, and split your work so Haiku does the small steps and Opus does the hard ones. The interactive Claude Code experience you have been paying for has not changed at all.
