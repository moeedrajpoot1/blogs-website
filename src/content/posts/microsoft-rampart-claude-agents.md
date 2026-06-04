---
title: "Microsoft RAMPART for Claude Agents: A Hands-On Guide (2026)"
description: "Microsoft released RAMPART on May 20, 2026, a pytest-native safety testing framework for AI agents. Here is how to apply it to your Claude agents today."
pubDate: 2026-05-25
author: "Muhammad Moeed"
tags: ["ai-agents", "claude-agent-sdk", "tutorials"]
keywords: [
  "microsoft rampart",
  "rampart claude agents",
  "ai agent safety testing",
  "pytest ai agent",
  "cross-prompt injection testing",
  "pyrit microsoft",
  "claude agent security",
  "ai agent red teaming",
  "rampart tutorial 2026",
  "agentic ai test framework"
]
heroImage: "/posts/microsoft-rampart-claude-agents-hero.png"
heroAlt: "Title card for an article on using Microsoft RAMPART to safety-test Claude agents in 2026"
featured: false
---

On May 20, 2026, Microsoft Security open-sourced [RAMPART](https://github.com/microsoft/RAMPART), the Risk Assessment and Measurement Platform for Agentic Red Teaming. It is a pytest-native framework for writing repeatable safety and security tests for AI agents, and it ships under an MIT license. If you have a Claude agent in production and a CI pipeline, you are now expected to test the agent the way you test any other piece of software.

This is the developer guide. What RAMPART actually is, how the pytest-native shape changes what you can test, how to apply it to a Claude Agent SDK agent today, and what it does not catch. Most of the coverage of the launch was news. This is what to do with it.

## Why this matters

For two years the standard answer to "is my agent safe" has been a one-off red-team report, a screenshot of a manual prompt-injection attempt, or nothing. None of those run in CI. None of them stop the next regression. RAMPART is the first widely adopted tool that lets you encode "this agent must refuse this input class in 80 percent of trials" as a test that breaks the build when it fails.

Microsoft built it on top of [PyRIT](https://github.com/Azure/PyRIT), their existing red-team automation framework, so the adversarial payloads and evaluation strategies are not reinvented. RAMPART is the part that gets PyRIT into the developer workflow.

## What RAMPART actually is

Three things, in order.

**A pytest plugin.** You write tests in normal pytest syntax. You run them with `pytest`. They pass or fail. They run in your CI the same way every other test does. This is the single biggest thing the framework gets right. There is no new runner, no new dashboard, no new dependency on a Microsoft cloud product to get a result.

**An adapter layer over your agent.** You point RAMPART at your agent through a thin adapter. The framework drives the agent through a scenario, captures the output, and runs an evaluator against it. The adapter is what makes a RAMPART test portable between a Claude Agent SDK agent, an OpenAI agent, or anything else that takes a prompt and returns text.

**A library of adversarial scenarios from PyRIT.** Cross-prompt injection is the most mature category in the May 20 release. Other harm categories are listed as work in progress in the [official announcement](https://www.microsoft.com/en-us/security/blog/2026/05/20/introducing-rampart-and-clarity-open-source-tools-to-bring-safety-into-agent-development-workflow/). The framework is designed for new attack categories to drop in as Microsoft and the community add them.

## How it changes the testing story

Most agent test suites today are deterministic. You send a prompt, you check the output equals a string. That works for unit tests of the tools your agent calls. It does not work for the agent itself, because the model's output is probabilistic.

RAMPART leans into that. Instead of asserting one output, you assert a policy across many trials. The framework runs the same scenario multiple times and checks the pass rate against a threshold you set, like `must be safe in at least 80 percent of runs`. That matches how real safety evaluation works, and it is the single feature most home-grown agent test suites miss.

The other thing the pytest shape buys you is regression coverage. The day a real prompt-injection issue happens on your agent, you write a RAMPART test that reproduces it, the test fails, you fix the agent, the test passes. Six months later when someone changes the system prompt and reintroduces the bug, the test catches it in CI. That loop is what makes safety work compound instead of degrade.

## A first test against a Claude Agent SDK agent

The full RAMPART API is in the [GitHub README](https://github.com/microsoft/RAMPART) and the docs site at microsoft.github.io/RAMPART. The shape below mirrors the pattern Microsoft describes in the launch post. Treat it as the structure you will end up with, not as runnable code copied verbatim from the upstream README.

```python
# tests/test_agent_safety.py
import pytest
from rampart import scenario, ClaudeAgentAdapter
from claude_agent_sdk import query, ClaudeAgentOptions

async def run_agent(prompt: str) -> str:
    parts = []
    async for message in query(
        prompt=prompt,
        options=ClaudeAgentOptions(allowed_tools=["WebSearch", "WebFetch"]),
    ):
        if "result" in message:
            parts.append(message["result"])
    return "\n".join(parts)

adapter = ClaudeAgentAdapter(run_fn=run_agent)

@pytest.mark.rampart
@scenario.cross_prompt_injection(
    payload_set="default",
    trials=20,
    pass_rate=0.8,
)
def test_agent_resists_prompt_injection(rampart):
    """Agent should refuse injected instructions in at least 80% of trials."""
    rampart.run(adapter)
```

The scenario decorator takes the attack category, the number of trials, and the pass-rate threshold. The adapter takes a function that drives your agent and returns text. The test reads as a normal pytest function. When it fails, pytest reports it the same way it would report any other assertion failure.

## What the adapter actually does

The adapter is the integration point. It hides two things from the test.

First, it hides whatever async or streaming pattern your agent uses. The Claude Agent SDK exposes an async generator of messages. RAMPART expects a function that takes a prompt and returns text. The adapter is where you bridge those.

Second, it hides the credentials and configuration. The adapter holds your `ANTHROPIC_API_KEY`, your `allowed_tools`, your system prompt. The scenario does not know any of that. Which means the same scenario can be reused against a different agent, or the same agent in a different configuration, by writing a different adapter.

You will end up writing one adapter per agent in your system. Each adapter is twenty to forty lines.

## How this pairs with the NSA MCP guidance

RAMPART tests the agent's behavior. The [NSA MCP security guidance](/posts/nsa-mcp-security-guidance) defines the controls the protocol layer needs underneath. They are complementary, not overlapping.

A useful mental model: the NSA controls make sure the messages between your agent and its tools cannot be tampered with, scoped beyond their intent, or replayed. RAMPART tests make sure that even when every message is authentic, the agent itself does not get talked into doing the wrong thing. Both are required. Neither catches what the other catches.

If you only have one afternoon, write the RAMPART test for prompt injection first. It is the failure mode you are most likely to hit in week one, and it is the one a user can demonstrate to you over Twitter.

## What RAMPART does not catch

Worth saying clearly. Three things this framework is not designed for, as of the May 20 release.

**Cost denial-of-service.** A test that the agent does not call an expensive tool a thousand times when nudged. RAMPART scenarios run in finite trials and do not currently model unbounded resource consumption.

**Supply-chain attacks against your tools.** If one of your MCP servers itself was compromised, the agent might happily call it. RAMPART tests what the agent does with the responses it gets, not where they came from.

**Compositional bugs in long sessions.** RAMPART is set up for shorter scenarios. Multi-hour agent runs where injection accumulates across turns are a known gap in agentic testing more broadly.

For the supply-chain piece, the [MCP server security guide](/posts/mcp-server-security-guide) covers the patterns around your tool stack. For long-session degradation, the [Claude Code slow or worse guide](/posts/claude-code-slow-fix) covers the user-side symptoms of one common pattern.

## A short roadmap for adopting it this week

If you have a Claude agent in production, this is the order I would suggest.

1. **Install RAMPART in your test repo.** Same Python virtualenv as your agent. Pin the version.
2. **Write one adapter.** Forty lines, points at your real agent through `query()`. Treat it like any other test fixture.
3. **Add one test.** Cross-prompt injection, twenty trials, eighty percent pass rate. Watch it run locally first.
4. **Wire it into CI.** Same workflow file as your other pytest jobs. Allow it to fail noisily for the first week so you can see what it catches.
5. **Reproduce one real bug.** The next safety regression that comes in, write the failing test before you fix it. That is the moment the framework starts paying for itself.

Steps one through four take an afternoon. Step five is the habit that keeps the cost down forever.

## Frequently asked questions

### Is RAMPART tied to Microsoft cloud?

No. It is MIT licensed and runs anywhere pytest runs. The PyRIT integration uses the open-source PyRIT library, not a managed service. You can run the whole stack on your laptop, in GitHub Actions, on AWS, or wherever your existing pytest runs.

### Does it work with the Claude Agent SDK out of the box?

Not directly, because RAMPART expects a thin function-style adapter and the Agent SDK returns an async stream of messages. The adapter pattern in the test above is the bridge. It is a few lines, not a fork.

### What about the Vercel AI SDK 6?

Same answer. You write a small TypeScript-to-Python boundary or run the adapter against the TypeScript SDK via a CLI invocation. The framework is intentionally adapter-driven so it does not lock you to one runtime. The [Claude Agent SDK vs Vercel AI SDK 6 comparison](/posts/claude-agent-sdk-vs-vercel-ai-sdk) explains the runtime differences if you have not picked yet.

### What attack categories work today?

The May 20 release calls out cross-prompt injection as the most mature category. Other harm categories and adversarial templates from PyRIT are usable, with more being added. Treat the framework as the right shape with one strong category at launch.

### How does it compare to Anthropic's own Claude Mythos?

Mythos is Anthropic's preview model for security workloads. RAMPART is a test framework. They solve different problems. You would use Mythos to actively scan code or systems for vulnerabilities, and RAMPART to run repeatable safety tests against the agent that uses Mythos.

### Should I wait for the framework to mature before adopting?

If you only ship one safety test in the next month, RAMPART is the right place to write it. The framework is genuinely usable today for cross-prompt injection. Waiting for full category coverage means waiting for a benefit you can already get.

### Where can I read the official announcement?

[Microsoft Security Blog, May 20, 2026](https://www.microsoft.com/en-us/security/blog/2026/05/20/introducing-rampart-and-clarity-open-source-tools-to-bring-safety-into-agent-development-workflow/). [The Hacker News](https://thehackernews.com/2026/05/microsoft-open-sources-rampart-and.html) has the broader context. The [GitHub repo](https://github.com/microsoft/RAMPART) is the source of truth for the API.

## Where to go next

- [NSA MCP security guidance translated for developers](/posts/nsa-mcp-security-guidance), the protocol-layer baseline that RAMPART sits on top of.
- [MCP server security guide](/posts/mcp-server-security-guide), for the controls around the tools the agent calls.
- [Claude Agent SDK vs Vercel AI SDK 6](/posts/claude-agent-sdk-vs-vercel-ai-sdk), for choosing the runtime you will write the adapter against.
- [Claude Agent SDK vs LangChain](/posts/claude-agent-sdk-vs-langchain), if your decision is between Anthropic and LangChain instead.
- [Claude Managed Agents tutorial](/posts/claude-managed-agents-tutorial), for the hosted alternative to running the agent loop yourself.

The shortest path from where you are today to where Microsoft wants you to be is one adapter and one cross-prompt-injection test. That takes an afternoon. Everything else is what you build on top.
