---
title: Claude Agent SDK Cost Tracking — what to do before June 15, 2026
published: true
description: How to measure what your Claude Agent SDK workload really costs before the June 15, 2026 credit change, with code, caveats, and a sizing decision.
tags: ai, claude, anthropic, tutorial
canonical_url: https://moeed.app/posts/claude-agent-sdk-cost-tracking/
cover_image: https://moeed.app/posts/claude-agent-sdk-cost-tracking-hero.png
---

On June 15, 2026 Anthropic moves Claude Agent SDK calls, `claude -p`, GitHub Actions, and third-party agents off the subscription pool and onto a separate dollar-denominated credit ($20 Pro, $100 Max 5x, $200 Max 20x), billed at standard API list prices. Interactive Claude Code in the terminal stays where it is. Everything programmatic moves.

So the question your manager is going to ask the next day stops being "are we within the subscription limit?" and starts being "what did this cost?"

The full guide is on my blog: [Claude Agent SDK Cost Tracking: A Practical Guide (2026)](https://moeed.app/posts/claude-agent-sdk-cost-tracking/). Here is the short version.

## What the SDK gives you

Every `query()` call ends with a `result` message carrying `total_cost_usd` and a `usage` object with token counts. There is also a per-model breakdown so you can see how much went to Opus versus Haiku in the same call. Same data in TypeScript and Python, slightly different field names.

## The one warning

Anthropic is very direct in the [official docs](https://code.claude.com/docs/en/agent-sdk/cost-tracking): `total_cost_usd` is a client-side estimate from a price table bundled at build time. It can drift from the real bill when:

- pricing changes
- the installed SDK does not recognise a model
- billing rules apply that the client cannot model (the June 15 credit pool, enterprise discounts, surge pricing)

Use the SDK number for budgeting. Use the [Usage and Cost API](https://platform.claude.com/docs/en/build-with-claude/usage-cost-api) or the Console for invoicing.

## A minimum viable cost log

```python
from claude_agent_sdk import query, ResultMessage
import asyncio

async def main():
    async for message in query(prompt="Summarise this project"):
        if isinstance(message, ResultMessage):
            print(f"Estimated cost: ${message.total_cost_usd or 0:.4f}")

asyncio.run(main())
```

Five lines is enough to start. Add a tag for user, model, and feature when you push it into production metrics.

## The duplicate-ID gotcha with parallel tools

When Claude uses multiple tools in parallel within one turn, the SDK emits several assistant messages that share the same `id` with identical usage. If you sum tokens across every assistant message, you triple- or quadruple-count.

Deduplicate by ID before you add:

```typescript
const seenIds = new Set<string>();
let totalInputTokens = 0;

for await (const message of query({ prompt: "..." })) {
  if (message.type === "assistant") {
    const msgId = message.message.id;
    if (!seenIds.has(msgId)) {
      seenIds.add(msgId);
      totalInputTokens += message.message.usage.input_tokens;
    }
  }
}
```

Or just read `total_cost_usd` from the final `result` message and let the SDK handle deduplication for you.

## Where the 90 percent saving really comes from

Every agent loop reads the same system prompt and the same files on every turn. The SDK turns prompt caching on automatically. Two fields to watch:

- `cache_creation_input_tokens` — billed at a higher rate, once per cache window
- `cache_read_input_tokens` — billed at roughly 10 percent of standard input

After the first turn, the cache read field dominates and the bill flattens out. On a Sonnet 4.6 agent with a 15K-token system prompt and 20 turns, that drops per-turn input cost from roughly $0.045 to roughly $0.005.

## A simple sizing decision

With one week of measured `total_cost_usd`, you can size the plan in three lines:

```
Estimated monthly = weekly_total_cost_usd * 4.33

  < $20      → Pro
  $20-$100   → Max 5x + usage credits on
  $100-$200  → Max 20x + usage credits on
  > $200     → Direct API key (or Bedrock / Vertex)
```

Two caveats:

1. Credits do not roll over. Under-spending is real waste, the same way over-spending is.
2. Bursty workloads (one monthly audit doing 80 percent of the spend in two days) often work out cheaper on direct API billing even if the totals look similar.

## What to do this week

1. Log `total_cost_usd` on every `query()` call, tagged with user, model, and feature.
2. Deduplicate assistant messages by ID before trusting per-step totals.
3. Plot `cache_read` vs `cache_create`. If reads are not dominant after turn one, your system prompt or files are changing too often.
4. Pull one week of Console data and compare to the SDK estimate.
5. Pick a plan tier. Claim your credit when Anthropic emails you. Enable usage credits for overflow.
6. Pin the SDK version in CI. Bumps silently change the bundled price table.

The full guide on my blog has the per-model breakdown code, cache TTL trade-offs, what changes after June 15 for `total_cost_usd` interpretation, and an FAQ: [Claude Agent SDK Cost Tracking: A Practical Guide (2026)](https://moeed.app/posts/claude-agent-sdk-cost-tracking/).
