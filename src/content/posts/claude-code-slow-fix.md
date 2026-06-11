---
title: "Claude Code Slow? 7 Real Fixes for /doctor, /compact, and MCP Bloat"
description: "Claude Code feels slow when context bloats, MCP tools chain in loops, or memory files grow. See the seven fixes with /doctor and /compact walkthroughs."
pubDate: 2026-05-23
updatedDate: 2026-06-12
author: "Muhammad Moeed"
tags: ["claude-code", "tutorials"]
keywords: [
  "claude code slow",
  "claude code got worse",
  "claude code performance issues",
  "claude code degradation 2026",
  "claude code degraded fix",
  "claude code postmortem",
  "claude code quality drop",
  "claude code doctor command",
  "claude code compact",
  "claude code fast mode opus 4.7"
]
heroImage: "/posts/claude-code-slow-fix-hero.png"
heroAlt: "Title card for an article on diagnosing and fixing Claude Code performance issues in 2026"
featured: false
---

If you have noticed Claude Code feeling slower, dumber, or just off this spring, you are not imagining it. There was a real, measurable, six week period from March into April 2026 where Claude Code's quality dropped, Anthropic confirmed it in an [official post mortem on April 23](https://www.infoq.com/news/2026/05/anthropic-claude-code-postmortem/), and the company shipped fixes by April 20. The conversation about it is still going strong on Reddit, X, and dev forums in May because some users are still seeing odd behavior even after the fixes landed.

This is the calm version. What actually happened, how to tell if your specific setup is the problem or the platform is, and the small set of changes that fix most cases. No pitchforks, no apologetics, just the practical part.

## What actually happened, in three sentences

Anthropic stacked three product changes on top of each other between March 4 and April 16, 2026. Each looked harmless on its own. Together they made Claude Code measurably worse for six weeks before the company unwound all three.

| Change | When it landed | When it was reverted |
|---|---|---|
| Default reasoning effort dropped from high to medium | March 4 | April 7 |
| Cache eviction bug fired on every turn instead of after one idle hour | March 26 | April 10 (fixed) |
| System prompt added strict verbosity limits, "25 words between tool calls" | April 16 | April 20 |

All three were resolved by **April 20, 2026 (v2.1.116)**, and Anthropic reset usage limits for all subscribers as an apology. So if you are reading this in late May or later, the platform itself is in a much better state than it was in March. What is left is the part inside your own setup.

## How to tell if your Claude Code is degraded today

Three quick checks before you blame the platform.

### 1. Check your version

Open a terminal and run:

```
claude --version
```

If you are not on at least `v2.1.116`, update. Most of the platform fixes shipped in that release and the ones since. The Opus 4.7 fast mode default landed in `v2.1.142` on May 14.

```
npm install -g @anthropic-ai/claude-code
```

### 2. Run `/doctor`

Inside Claude Code, run:

```
/doctor
```

It surfaces about 80 percent of the configuration issues that cause "Claude is broken" complaints. Things like a stale install, a misconfigured MCP server eating context, a missing API key, an outdated CLAUDE.md path, or a hook that is silently failing. Read the output line by line and fix anything that is yellow or red before you blame the model.

### 3. Check Claude status

Open [status.claude.com](https://status.claude.com/) in a tab. If there is an active incident, your weird session is the platform, not you, and the right move is to stop and come back in twenty minutes.

If all three checks pass and Claude still feels off, the problem is now likely in your session, your config, or your usage pattern. The next sections deal with each of those.

## Six fixes that work for most people

Ordered by how often they fix it, not by how clever they are.

### Fix 1, start fresh conversations sooner

A single Claude Code conversation grows context fast. Once you cross sixty or seventy percent of the model's context window, quality drops in a predictable way. Information in the middle of the window gets less attention than information at the start or end. You will see Claude forget earlier decisions, repeat work, or hallucinate file paths it already read.

The simple fix is to start fresh more often. End the session, archive what you have, and start a new one with a short hand off note. If you are mid task and do not want to lose the context, run `/compact` to summarize the older turns in place. You keep the goal and the decisions, you drop the noisy tool traces.

I aim to compact or restart every thirty to forty five minutes of real work. It feels wasteful at first. It is not.

### Fix 2, write a real CLAUDE.md

Half the "Claude keeps forgetting" complaints turn out to be that the project never told Claude what to remember.

Drop a `CLAUDE.md` into your project root with the things that should always be in context. Architecture summary. Coding style. Common pitfalls. The two or three commands you run most often. Anything Claude needs to reach for on every task. Once it is in `CLAUDE.md`, you do not have to re paste it into every new session, and `/compact` keeps it across the boundary.

If you already have a `CLAUDE.md` and it is more than two pages, it is too long. Trim it. Long memory files dilute attention, not concentrate it.

### Fix 3, use `/fast` only when you actually need speed

Fast mode is roughly two and a half times faster on output tokens than standard Opus 4.7. The intelligence and context window are the same, but the cost is six times higher (six times input, six times output). On May 14, 2026, Anthropic made Opus 4.7 the default for fast mode in [v2.1.142](https://code.claude.com/docs/en/fast-mode), which is a real improvement over the old 4.6 default.

The honest pattern is this. Use fast mode for short interactive turns where waiting feels painful. Switch back to standard for long autonomous runs where the bill is going to matter. Toggle with `/fast`. Run `/fast` again to check the current state.

If you have been running everything in fast mode without realizing it, that is your bill spike right there, and it is not a quality fix.

### Fix 4, be explicit about quality at the end of your prompt

Constraints at the end of the prompt get more attention weight than constraints buried in the middle. So if you want Claude to follow your style guide, write tests first, or not commit failing code, put that as the last instruction in your prompt, not the first one in your system prompt.

This is not magic. It is the same attention pattern that hurt you in the long conversation case, used the other way. Cheap to try.

### Fix 5, shrink the MCP surface

Every connected MCP server adds tool definitions to your context window. Five servers can eat thousands of tokens before you have typed anything. If you are seeing slow first responses or strange tool selection, run `/doctor`, look at what is connected, and disconnect anything you are not actively using this week.

If you are new to MCP, the [first MCP server walkthrough](/posts/build-your-first-mcp-server) explains the moving parts, and the [best MCP servers for 2026](/posts/best-mcp-servers-2026) list calls out the ones worth keeping versus the ones that just add weight.

### Fix 6, a full restart

If the session feels broken in a way that does not respond to any of the above, close Claude Code completely, wait ten to fifteen minutes, and start again. This sounds like the "turn it off and on again" cliche because it mostly is. Occasionally a session ends up on a bad routing instance or with a corrupted local cache, and a clean start gets you out of it.

## A short diagnostic tree

When something feels wrong, walk this tree before you spend an hour rewriting prompts.

```
Is `claude --version` >= 2.1.116?
  No  → update first
  Yes → continue

Does `/doctor` show anything yellow or red?
  Yes → fix that first
  No  → continue

Is status.claude.com clean?
  No  → stop, come back later
  Yes → continue

Has this conversation been running > 45 minutes?
  Yes → run /compact, or start fresh
  No  → continue

Are more than 3 MCP servers connected?
  Yes → disconnect what you are not using today
  No  → continue

Still bad?
  → full restart, then file a GitHub issue with the version, /doctor output, and the smallest reproducible session
```

Most people stop at one of the middle steps.

## What changed in the platform itself, post April 20

So you know what is now in the box.

- **Reasoning effort is back to high by default.** The March 4 change is gone. Reverted [April 7](https://www.infoq.com/news/2026/05/anthropic-claude-code-postmortem/).
- **The cache eviction bug is fixed.** No more full cache miss every turn after April 10.
- **The "25 words between tool calls" instruction is gone.** Reverted April 20 after evals showed a measurable quality drop.
- **Opus 4.7 is the new fast mode default.** Shipped May 14 in v2.1.142.
- **Anthropic reset usage limits** for all subscribers as an apology when v2.1.116 landed.

Anthropic's own commitment going forward is to require staff to use the same public builds users get, run broader eval suites before changing the system prompt, and stage rollouts more carefully. The transparency in the post mortem was, honestly, the right move, even if the underlying mistake took too long to catch.

## When the fix is not on your side

After all of the above, if you still see consistently lower quality than you remember from January or February, two things are worth doing.

**File a GitHub issue** at the [claude-code repo](https://github.com/anthropics/claude-code/issues) with three things: your exact version, your `/doctor` output, and the smallest session you can reproduce the issue in. Posts that include those three things tend to get a response from Anthropic engineers within a day or two. Posts that just say "Claude is bad now" do not.

**Keep a fallback in your pocket.** Not because Claude is broken, but because every model has bad days. The [Claude Agent SDK vs Vercel AI SDK 6](/posts/claude-agent-sdk-vs-vercel-ai-sdk) comparison covers the case where you want one library that lets you swap models. Even if you stay on Claude ninety nine percent of the time, having an out for the one bad afternoon is cheap insurance.

## When to /clear, /compact, or start a new session

These three look similar but solve different problems. Picking the lightest action that works keeps your skills, MCP servers, and memory file loaded across the boundary.

| Action | What it does | When to use it |
|---|---|---|
| `/compact` | Summarises older turns in place and replaces them with the summary. Same session, smaller context. | Mid-task and you want to keep the goal but drop the noisy tool traces. |
| `/clear` | Wipes the conversation but keeps the same terminal, skills, and MCP connections loaded. | The topic is done and you want to start clean without restarting the CLI. |
| New session | Closes the CLI process and starts a fresh one. | Switching projects, switching repos, after a freeze that did not respond to `/clear`, or after upgrading Claude Code. |

A normal week looks like two or three `/compact` calls per session, one `/clear` when the topic ends, and a new session when you change repos. If you find yourself restarting the CLI every hour, the cause is usually a misbehaving MCP server or a runaway hook — `/doctor` will spot it.

## Frequently asked questions

### Why is Claude Code slow?

The two most common causes are context bloat (long sessions with too much loaded into the conversation) and tool-call chains where MCP servers or subagents call each other in a loop. The fix is usually `/compact` or a fresh session, then trimming the MCP servers you are not actively using this week. Anthropic also confirmed a server-side degradation in spring 2026, which was fixed by April 20, 2026 — the platform itself is back to the January baseline.

### How do I run /doctor in Claude Code?

Type `/doctor` inside an active Claude Code session, or run `claude doctor` in your terminal. It reports your version, model, memory file size, loaded skills, MCP servers, active hooks, and authentication state. Anything red or yellow is a slowness suspect; fix those first before blaming the model.

### What does /compact do in Claude Code?

`/compact` summarises the current conversation in place and replaces the older turns with that summary. You keep the goal and the decisions, you drop the noisy tool traces. The result is a smaller context window, which makes the next responses faster and often sharper. Use it once a session crosses about thirty messages, or any time `/doctor` flags context size as the bottleneck.

### Why does Claude Code use so much memory?

High memory use usually traces back to one of three things: a large `MEMORY.md` file, several connected MCP servers, or a long conversation that has not been compacted. Run `/doctor` first to see all three at once. If `MEMORY.md` is over two pages, let [AutoDream](/posts/claude-code-dreaming-guide/) clean it. If three or more MCP servers are connected, disconnect the ones you are not using this week.

### Why is Claude Code freezing?

A freeze is almost always a stuck tool call, not the model itself hanging. The most common cases are an MCP server that does not return, a hook script that hangs on a network call, or a tool waiting for confirmation that never arrives. Cancel the turn, then start a fresh session with `/doctor` to spot the failing tool. If the same MCP server hangs across sessions, disable it and file a bug on its repo.

### Is Claude Code actually worse than it was in January 2026?

On most measures, no, not as of late May. The three regressions Anthropic introduced in March were all reverted by April 20. The platform is back to the January baseline on Opus 4.7. Some users still report subjective drops, which usually trace back to a configuration issue or context bloat in long sessions.

### What does the `/doctor` command actually check?

It checks your install, your authentication, your active MCP servers, your project's `CLAUDE.md`, your hooks, your skills, and your current model and mode settings. It does not check the platform itself, that is what status.claude.com is for. Run both.

### Should I use Opus 4.7 fast mode?

Use it for short interactive sessions where waiting hurts. Avoid it for long autonomous runs where the six times cost will land hard in your bill. The intelligence is the same as standard Opus 4.7, you are paying only for the speed.

### Will starting fresh sessions every 45 minutes lose my work?

No, if you use `/compact` and a real `CLAUDE.md`. `/compact` summarizes the conversation in place so you keep the decisions and lose the noise. `CLAUDE.md` carries the project context across new sessions for free. The [Claude Code hooks guide](/posts/claude-code-hooks-complete-guide) and the [Claude Code outcomes guide](/posts/claude-code-outcomes-guide) cover the rest of the patterns for keeping long work coherent.

### What was the caching bug exactly?

An optimization meant to clear stale "thinking" content after a one hour idle session was instead firing on every turn for the rest of the session. In long sessions, this meant a full cache miss on the next message, which silently burned through rate limits. Anthropic patched it on April 10.

### Where is the official post mortem?

Anthropic published a detailed account on April 23, 2026. The [InfoQ summary](https://www.infoq.com/news/2026/05/anthropic-claude-code-postmortem/) has the timeline, and [Fortune](https://fortune.com/2026/04/24/anthropic-engineering-missteps-claude-code-performance-decline-user-backlash/) covers the user backlash that pushed it out.

### My team complains Claude is slow at 2pm Pacific. Is that a thing?

Yes, peak hours hit infrastructure harder, and you will see longer first response times. Some users have reported notably better performance late at night or early morning. This is normal cloud behavior, not a Claude specific failure.

## Where to go next

- [Claude Code hooks complete guide](/posts/claude-code-hooks-complete-guide), because a well placed hook saves more re prompts than any model change.
- [Claude Code outcomes guide](/posts/claude-code-outcomes-guide), for measuring quality with rubrics instead of guessing.
- [How Anthropic teams use Claude Code](/posts/how-anthropic-teams-use-claude-code), for the prompt and workflow patterns that hold up in long projects.
- [Claude Code vs Cursor: 90 days with both](/posts/claude-code-vs-cursor), if you want a calm comparison for when to reach for which.
- [Claude Code Skills practical guide](/posts/claude-code-skills-complete-guide), to move repeated context out of every prompt and into reusable skill files.
- [Claude Agent SDK cost tracking guide](/posts/claude-agent-sdk-cost-tracking), because the June 15, 2026 credit change makes a slow or runaway session cost real dollars, not just patience.
- [How Claude Code AutoDream works](/posts/claude-code-dreaming-guide/), so AutoDream can compact your `MEMORY.md` between sessions and stop the file from bloating context.

The honest summary is that Claude Code in late May 2026 is in a much better place than it was in March. Update your install, run `/doctor`, keep your sessions short, and write a real `CLAUDE.md`. Most "Claude got worse" cases I have seen since the April fixes were one of those four things, not the platform.
