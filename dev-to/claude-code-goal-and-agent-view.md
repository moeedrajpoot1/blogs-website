---
title: Claude Code /goal and Agent View, explained
published: true
description: What Claude Code's /goal command and Agent View do, how the goal check actually works, and how to write a condition that does not run forever.
tags: claudecode, ai, productivity, tutorial
canonical_url: https://moeed.app/posts/claude-code-goal-and-agent-view/
cover_image: https://moeed.app/posts/claude-code-goal-and-agent-view-hero.png
---

The May 2026 Claude Code update added two features for running it without watching every step: the `/goal` command and Agent View. They are separate, but built for the same workflow, so here they are together. Everything below is from the official docs. The full version is on my blog: [Claude Code /goal and Agent View: A Practical Guide](https://moeed.app/posts/claude-code-goal-and-agent-view/).

## What /goal does

You write one completion condition. After each turn, instead of stopping, Claude Code asks a separate model whether the condition is true. No, it takes another turn, using the reason as guidance. Yes, the goal clears and you get your terminal back. Requires v2.1.139 or later.

You set one by running `/goal` followed by the condition, for example: `/goal all tests in test/auth pass and the lint step is clean`.

Running `/goal` with no argument shows status. `/goal clear` stops it early. It also runs non-interactively with `claude -p "/goal CHANGELOG.md has an entry for every PR merged this week"`.

## The detail most posts skip

The evaluator is a small fast model (Haiku by default). It does **not** run commands or open files. It only judges the text already in the session. So the condition has to be something Claude can prove by what it prints. "All tests in test/auth pass" works because the test output lands in the transcript. "The code is good" never will.

A condition that holds up has one measurable end state, a stated check (how Claude proves it), and the constraints that must not change. It can be up to 4,000 characters. Add a clause like "or stop after 20 turns" so it does not run forever. That one clause is the difference between a task that ends and a task that quietly keeps spending tokens.

## How it compares

- `/goal`: next turn after the previous finishes; stops when a model confirms the condition.
- `/loop`: next turn on a time interval.
- Stop hook: your own script decides. (`/goal` is actually a thin wrapper over a session-scoped Stop hook.)
- Auto mode: removes per-tool approvals inside a turn. Complementary: auto mode plus `/goal` means turns run unattended and keep coming until done.

## Agent View

Once a session runs on its own, you want several. Agent View is one CLI screen listing your sessions: status, last response, when you last touched it. Open it with the left arrow from any session, or by running `claude agents`. Statuses are Running, Blocked (needs you), and Done. Peek at a session, answer inline if it is blocked, press Enter to attach fully.

Background sessions connect the two: `/bg` sends the current session to the background, and `claude --bg [task]` starts one already detached. Start a few goals with turn limits, background them, watch the fleet in Agent View, and step in only on Blocked or Done.

Agent View is a research preview on Pro, Max, Team, Enterprise, and Claude API plans.

---

The full guide covers writing conditions in depth, the requirements and limits, when not to use it, and how it differs from Outcomes and plan mode: [Claude Code /goal and Agent View: A Practical Guide](https://moeed.app/posts/claude-code-goal-and-agent-view/).
