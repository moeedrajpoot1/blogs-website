---
title: "Claude Agent SDK Cost Tracking: A Practical Guide (2026)"
description: "How to measure what your Claude Agent SDK workload really costs before the June 15, 2026 credit change, with code, caveats, and a sizing decision."
pubDate: 2026-06-05
author: "Muhammad Moeed"
tags: ["claude-agent-sdk", "tutorials"]
keywords: [
  "claude agent sdk cost tracking",
  "claude agent sdk cost",
  "claude agent sdk pricing",
  "claude agent sdk billing june 15",
  "total_cost_usd claude",
  "claude code cost monitoring",
  "claude agent sdk credits",
  "anthropic agent sdk usage",
  "claude prompt caching cost",
  "claude api cost calculator"
]
heroImage: "/posts/claude-agent-sdk-cost-tracking-hero.png"
heroAlt: "Title card for the article Claude Agent SDK Cost Tracking, showing four panels for total_cost_usd, modelUsage, cache reads, and the Usage and Cost API"
featured: true
---

If you run anything on the Claude Agent SDK, June 15, 2026 is going to change the question your manager asks you. The question stops being "are we within the subscription limit?" and starts being "what did this cost?" On that day Anthropic moves Agent SDK calls, `claude -p`, GitHub Actions, and third-party agents off the subscription pool and onto a separate dollar-denominated credit, billed at standard API list prices. The interactive terminal stays where it is. Everything programmatic moves.

The first thing you will want, the night before the change, is a number. Not the news summary, not the migration playbook. A number for your own workload. The official cost tracking story in the SDK is good enough to give you that number, but only if you understand the gotchas. This is the developer's guide to measuring what you actually spend, the caveats you have to respect, and how to use the result to pick the right plan.

## What the SDK gives you, in one paragraph

Every `query()` call ends with a `result` message. That message carries a `total_cost_usd` field and a `usage` object with token counts. The result also carries a per-model breakdown so you can see, for instance, how much went to Opus versus Haiku in the same call. Both the TypeScript SDK and the Python SDK expose the same data, with slightly different field names. This is the right surface for budgeting, for dashboards, and for deciding which plan you need. It is not the right surface for billing your customers.

## The one warning to internalise

Anthropic is very direct about this in the [official cost-tracking docs](https://code.claude.com/docs/en/agent-sdk/cost-tracking):

> The `total_cost_usd` and `costUSD` fields are client-side estimates, not authoritative billing data. The SDK computes them locally from a price table bundled at build time.

That means three real failure modes. The bundled price table can lag a pricing change. An older SDK version can fail to recognise a new model. The June 15 credit pool, surge pricing, or any future enterprise discount is invisible to the local calculation. The number you print to your terminal is good to about two significant figures for budgeting. It is not your invoice.

For your invoice, you have the [Usage and Cost API](https://platform.claude.com/docs/en/build-with-claude/usage-cost-api) and the Usage page inside the Claude Console. Use the SDK number to plan. Use the Console number to settle.

## A minimum viable cost log

Here is the smallest piece of code that does something useful. It runs one `query()` call and prints the total estimated cost when the call finishes.

```python
from claude_agent_sdk import query, ResultMessage
import asyncio

async def main():
    async for message in query(prompt="Summarise this project"):
        if isinstance(message, ResultMessage):
            print(f"Estimated cost: ${message.total_cost_usd or 0:.4f}")

asyncio.run(main())
```

The TypeScript version is the same shape.

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({ prompt: "Summarise this project" })) {
  if (message.type === "result") {
    console.log(`Estimated cost: $${message.total_cost_usd}`);
  }
}
```

Five lines is enough to start. From here, the question becomes how to scope it correctly and how not to lie to yourself with the number.

## The duplicate-ID gotcha with parallel tools

The first real trap. When Claude uses several tools in parallel within one turn, the SDK emits several assistant messages that share the same nested message `id` with identical usage data. If you accumulate input and output tokens by simply iterating over every assistant message, you will count those tokens three or four times. Your "spend" graph will look two to three times worse than reality, and you will overpay for the next plan tier on bad data.

The fix is to deduplicate by ID before you add.

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const seenIds = new Set<string>();
let totalInputTokens = 0;
let totalOutputTokens = 0;

for await (const message of query({ prompt: "Summarise this project" })) {
  if (message.type === "assistant") {
    const msgId = message.message.id;
    if (!seenIds.has(msgId)) {
      seenIds.add(msgId);
      totalInputTokens += message.message.usage.input_tokens;
      totalOutputTokens += message.message.usage.output_tokens;
    }
  }
}
```

If you only need the running total in dollars and you do not care about per-step breakdowns, ignore the assistant messages entirely and read `total_cost_usd` off the final `result` message. The SDK has already deduplicated for you in that field.

## Per-model breakdowns: where the money really went

In any non-trivial agent, you are probably running more than one model. Opus on the planning loop, Haiku on the sub-agents, maybe Sonnet on a tool call. The `result` message includes a `modelUsage` map (`model_usage` in Python) that splits cost by model.

```typescript
for await (const message of query({ prompt: "Run a codebase audit" })) {
  if (message.type !== "result") continue;
  for (const [model, usage] of Object.entries(message.modelUsage)) {
    console.log(`${model}: $${usage.costUSD.toFixed(4)}`);
    console.log(`  in: ${usage.inputTokens}, out: ${usage.outputTokens}`);
    console.log(`  cache read: ${usage.cacheReadInputTokens}`);
    console.log(`  cache create: ${usage.cacheCreationInputTokens}`);
  }
}
```

This view is where the actual optimisation lives. When you see a small agent spending the majority of its dollars on the planner model, the right move is usually to move more of the work into sub-agents on a cheaper model. The [Claude Agent SDK vs LangChain comparison](/posts/claude-agent-sdk-vs-langchain) walks through how sub-agent context isolation works in the SDK if you have not used it yet.

## Cache tokens, and where the ninety percent saving really comes from

Every agent loop reads the same system prompt and the same files on every turn. Without caching that is the largest single line on your bill. With caching it is one of the smallest. The SDK turns prompt caching on for you automatically. You do not configure it. You just have to read the right fields to see what it is doing.

Each `usage` object carries two cache-specific fields:

- `cache_creation_input_tokens`: the tokens written to cache on this turn, billed at a higher rate than standard input.
- `cache_read_input_tokens`: the tokens served from cache on this turn, billed at roughly ten percent of the standard input rate.

So the real input cost on a steady-state agent is `input_tokens` (full price) + `cache_creation_input_tokens` (premium, once per cache window) + `cache_read_input_tokens` (at ten percent). Once you are past the first turn, the third number dominates, and the bill flattens out.

A practical number. On a Sonnet 4.6 agent with a fifteen thousand token system prompt and twenty turns in a session, cached input lowers the per-turn input cost from roughly $0.045 to roughly $0.005. Over the session that is around 80 cents saved, which sounds small until you multiply by every session your CI runs in a day.

If your workload runs short sessions with gaps longer than five minutes between them, the default cache TTL expires and you pay full input rates on every new session. Anthropic added the `ENABLE_PROMPT_CACHING_1H` environment variable so you can stretch the cache window to one hour for API key and Bedrock workloads. The trade is that cache writes get more expensive. The break-even is usually around two to three reads per write.

Subscription users on Pro and Max already get the one-hour TTL automatically. So for most readers the right move is to leave the variable alone, watch the cache read field grow over time, and trust the SDK to do the work.

## Accumulating cost across multiple calls

There is no session-level total in the SDK. Each `query()` call emits its own `total_cost_usd`. If your application runs many calls inside a multi-turn session, or one call per user, you have to keep the running total yourself.

```python
from claude_agent_sdk import query, ResultMessage
import asyncio

async def main():
    total_spend = 0.0
    prompts = [
        "Read the files in src/ and summarise the architecture",
        "List all exported functions in src/auth.ts",
    ]
    for prompt in prompts:
        async for message in query(prompt=prompt):
            if isinstance(message, ResultMessage):
                cost = message.total_cost_usd or 0
                total_spend += cost
                print(f"This call: ${cost:.4f}")
    print(f"Total spend: ${total_spend:.4f}")

asyncio.run(main())
```

Once you are doing this in production, push the per-call total into whatever you already use for metrics. Stamp each call with the user identity, the model that handled it, and the route or feature that triggered it. You want to slice cost by feature later when the bill is real money.

Failed calls still consume tokens. Both success and error result messages carry the same `usage` and `total_cost_usd`, so read them on every outcome and stop pretending failures are free.

## What changes for cost tracking on June 15

Three concrete things shift.

**The SDK number stops being the only number you care about.** Before June 15 the SDK total either fits inside your subscription pool or it does not. After June 15 the SDK total has to fit inside the new Agent SDK credit (twenty dollars on Pro, one hundred on Max 5x, two hundred on Max 20x, two hundred on Enterprise seat-based) before any overflow flows to usage credits at full API rates. So the question your dashboard has to answer is not just "how much did we spend" but "how close are we to the credit ceiling for this user this month?"

**Credits do not roll over.** Anything you do not spend in a month is gone on the first of the next month. So under-spending is real waste, the same way over-spending is. Sizing the plan correctly matters more than it used to.

**The SDK is still blind to all of this.** `total_cost_usd` does not know whether your call was paid by a subscription credit, a usage credit, or a direct API key. It just multiplies the tokens by the bundled price table. For the credit balance you need the Usage page in the Console or the Usage and Cost API. Treat the SDK as the running estimate and treat the Console as the truth source. If they disagree by more than a few percent, trust the Console.

For the wider mechanics of what moves and what does not, the [official Anthropic help article](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan) is the right reference.

## A small sizing decision for the next month

If you have one week of measured `total_cost_usd` data from a representative load, you can size the right plan in three lines.

```
Estimated monthly Agent SDK spend = weekly_total_cost_usd * 4.33

  < $20    → Pro is enough. Watch the trend monthly.
  $20-$100 → Max 5x. Enable usage credits as a small overflow.
  $100-$200 → Max 20x. Enable usage credits.
  > $200   → Direct API key, billed straight to a project budget,
             possibly via Bedrock or Vertex if you want the cloud relationship.
```

Two caveats. First, the credit refreshes per user, so if you have a team of five each running their own automations, you have five times the headroom. Second, if your usage is bursty (one large monthly audit job that does 80 percent of the spend in two days), Max 20x can still be the wrong shape, because you are paying a flat monthly fee against a workload that only fires twice a month. In that pattern, a direct API key billed per use is often the cheaper answer even if the total dollars look similar.

If you want to plan a sub-agent budget instead of a flat one, the [Claude Agent SDK vs Vercel AI SDK 6 comparison](/posts/claude-agent-sdk-vs-vercel-ai-sdk) covers how Vercel's pricing model handles routed agents, and the [Claude Code slow-fix guide](/posts/claude-code-slow-fix) covers how to spot a runaway agent loop early, before it eats half a month of credit in one afternoon.

## What to do this week

A short list to clear before June 15.

1. **Instrument the result message.** Add a single log line for `total_cost_usd` on every `query()` call. Tag it with user, model, and feature. Twenty minutes of work.
2. **Deduplicate assistant messages by ID** before you trust any per-step token totals.
3. **Plot cache read versus cache create.** If cache reads are not the dominant input number after the first turn, your system prompt or your files are changing too often. Investigate before you upsize the plan.
4. **Pull one week of Console data** so you can compare it against the SDK estimate and learn how far apart they run for your workload.
5. **Decide the plan tier** from the simple formula above. Claim your credit when Anthropic emails you. Decide whether to enable usage credits for overflow.
6. **Pin the SDK version** in CI. Bumping the SDK silently changes the bundled price table and can shift your historical numbers by a few percent.

If you can only do one of these this week, do the first. Logging the cost per call is what turns the June 15 change from a panic into a clean decision.

## What the SDK does not cover

It is worth saying out loud. Cost tracking is one piece of running an Agent SDK workload responsibly. A few things sit alongside it.

**Safety testing.** The [Microsoft RAMPART hands-on guide for Claude agents](/posts/microsoft-rampart-claude-agents) covers pytest-native scenarios for prompt injection and other runtime failures. Tokens spent on a hijacked tool call still count against your credit.

**Server hygiene.** If your agent talks to MCP servers, the [NSA MCP security guidance translation](/posts/nsa-mcp-security-guidance) and the broader [MCP server security guide](/posts/mcp-server-security-guide) cover the controls that protect both the message and the audit trail.

**Runaway loops.** A misbehaving agent can drain a month of credit in an afternoon. The diagnose-and-fix moves in the [Claude Code slow-fix guide](/posts/claude-code-slow-fix) apply to Agent SDK workloads too.

## Frequently asked questions

### Is `total_cost_usd` accurate enough to bill customers?

No. Anthropic explicitly says it is a client-side estimate from a bundled price table and you should not trigger financial decisions from it. For invoicing, use the Usage and Cost API on the server side and reconcile to the Console.

### Does the SDK total include cache reads at the discounted rate?

Yes. The bundled price table knows about `cache_read_input_tokens` and `cache_creation_input_tokens` and multiplies each by the right rate. So the dollar total reflects the saving. You just have to read the cache fields separately if you want to see the saving as a percentage.

### What happens when my Agent SDK credit runs out on June 15 and after?

If you have enabled usage credits, overflow flows there at standard API rates. If you have not enabled usage credits, the SDK call is rejected and your automation halts until the next billing cycle. The toggle is opt-in. It is worth turning on for any production workload.

### Will my interactive Claude Code in the terminal also get billed against the new credit?

No. Anthropic kept that on the subscription pool. The Agent SDK credit only applies to programmatic usage: the SDK in your own Python or TypeScript projects, `claude -p`, GitHub Actions, and third-party apps authenticating through your subscription.

### What about Claude on Bedrock or Vertex?

Those keep using your AWS or GCP bill, not the new Agent SDK credit. If your workload is already on Bedrock or Vertex, June 15 changes nothing for you on the billing side. The `total_cost_usd` field still works, with the same client-side estimate caveat.

### Why did my SDK estimate disagree with the Console by a few cents?

Three common reasons. The SDK version is older than the latest price change. The model you used does not match anything in the bundled table and is being approximated. Or your workload is on a billing rule (an enterprise discount, the credit pool, surge pricing) that the client cannot see. None of these is a bug. Treat the Console as authoritative.

## Where to go next

- [Claude Agent SDK vs LangChain: an honest comparison](/posts/claude-agent-sdk-vs-langchain), if you are still weighing the runtime decision before you sink time into instrumentation.
- [Claude Agent SDK vs Vercel AI SDK 6](/posts/claude-agent-sdk-vs-vercel-ai-sdk), for the TypeScript-first alternative and how its pricing model compares.
- [How to build your first MCP server](/posts/build-your-first-mcp-server), to see how tool cost flows through the same `total_cost_usd` field.
- [Microsoft RAMPART for Claude agents](/posts/microsoft-rampart-claude-agents), for the testing side that prevents runaway loops from eating your credit.
- [Claude Code slow or worse, diagnose and fix](/posts/claude-code-slow-fix), for the practical playbook when an agent starts costing more than it should.

The shortest path from where you are today to a calm June 15 is to log `total_cost_usd` for one week, pull the Console number alongside it, and pick a plan from the simple formula above. Two hours of work, and your team stops guessing.
