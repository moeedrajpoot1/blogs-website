---
title: Claude Code slow or worse? How to diagnose and fix it in 2026
published: true
description: If Claude Code feels slower or less capable, here is how to diagnose your setup and the fixes that actually work, calmly explained with no hype.
tags: claude, ai, devtools, tutorial
canonical_url: https://moeed.app/posts/claude-code-slow-fix/
cover_image: https://moeed.app/posts/claude-code-slow-fix-hero.png
---

If Claude Code has felt slower or less capable this spring, you were not imagining it. Anthropic confirmed in an [official post mortem on April 23, 2026](https://www.infoq.com/news/2026/05/anthropic-claude-code-postmortem/) that three product changes stacked between March and April caused real, measurable quality drops. All three were reverted by April 20.

This is the short version. The full guide is on my blog: [Claude Code Slow or Worse? How to Diagnose and Fix It (2026)](https://moeed.app/posts/claude-code-slow-fix/).

## What actually happened

| Change | Landed | Reverted |
|---|---|---|
| Reasoning effort dropped from high to medium | March 4 | April 7 |
| Cache eviction bug fired every turn | March 26 | April 10 (fixed) |
| System prompt "25 words between tool calls" | April 16 | April 20 |

All resolved in `v2.1.116`. Anthropic reset usage limits as an apology.

## Three quick checks

### 1. Are you on the fixed build?

```
claude --version
```

Update if you are below `v2.1.116`. Fast mode now defaults to Opus 4.7 as of `v2.1.142` (May 14).

### 2. Run `/doctor`

It catches about 80 percent of "Claude is broken" cases. Stale install, wrong API key, broken MCP server, outdated `CLAUDE.md`, silently failing hook. Fix anything yellow or red before blaming the model.

### 3. Check status

`status.claude.com`. If it is red, stop and come back later.

## Six fixes for the rest

1. **Start fresh sooner.** Long sessions lose attention to context bloat. Run `/compact` every 30 to 45 minutes or restart.
2. **Write a real `CLAUDE.md`.** Project context that belongs in every session. Keep it under two pages.
3. **Use `/fast` only when speed matters.** Same intelligence as standard Opus 4.7, six times the cost.
4. **Put quality constraints at the end of your prompt.** Attention weight is higher there.
5. **Shrink your MCP surface.** Every connected server eats tokens before you type.
6. **Full restart.** Kill Claude Code, wait 10 to 15 minutes, start again.

## The diagnostic tree

```
version >= 2.1.116?      no → update
/doctor clean?           no → fix it
status.claude.com clean? no → wait
session > 45 minutes?    yes → /compact or restart
> 3 MCP servers?         yes → disconnect what you do not use
still bad?               → restart, then file a GitHub issue
```

Most people stop at one of the middle steps.

---

The full guide covers what each platform change did, the cost trade off of fast mode, when to file a GitHub issue, and a longer FAQ: [Claude Code Slow or Worse? How to Diagnose and Fix It (2026)](https://moeed.app/posts/claude-code-slow-fix/).
