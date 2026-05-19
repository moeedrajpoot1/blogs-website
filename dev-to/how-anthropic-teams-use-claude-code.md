---
title: How Anthropic's own teams use Claude Code
published: true
description: A plain summary of Anthropic's internal report on how its own teams use Claude Code, plus the parts a normal developer can actually copy.
tags: claudecode, ai, productivity, tutorial
canonical_url: https://moeed.app/posts/how-anthropic-teams-use-claude-code/
---

Anthropic published a report on how its own staff use Claude Code. It comes from interviews with internal power users across ten teams, including non-technical ones like legal and marketing. A lot of people have been looking for the PDF, so here is the short version plus the parts that matter even if you are one person and not a company with a large monorepo.

The source is [How Anthropic teams use Claude Code](https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf) (PDF). This is my reading of it, not a copy.

## The report in one paragraph

Ten teams, some technical and some not. The recurring lessons are simple and consistent: write a detailed CLAUDE.md, commit checkpoints often so you can revert, treat Claude Code as a partner you iterate with rather than a one-shot machine, paste screenshots instead of describing things, and learn which tasks can run on their own versus which need you watching. The biggest jumps came from people who do not write code for a living.

## A few of the stories

- **Data Infrastructure** debugged a Kubernetes outage by pasting dashboard screenshots in and letting Claude Code walk them through the console until they found pod IP exhaustion. They also taught the finance team to run plain-text workflow files.
- **The Claude Code team** builds Claude Code with it. Edge features run in auto-accept loops to about an eighty-percent solution; core logic is watched closely. Vim mode was roughly seventy percent autonomous.
- **Security Engineering** pastes Terraform plans in and asks, in plain words, what it will do and whether they will regret it. They own about half the custom slash commands in the whole monorepo.
- **Data Science** builds React and TypeScript dashboards without reading the code, and treats messy refactors "like a slot machine": commit, let it run thirty minutes, then accept or restart fresh.
- **Growth Marketing**, a non-technical team of one, built ad-generation workflows with subagents and a Figma plugin, cutting two-hour copy tasks to fifteen minutes.
- **Legal** built a predictive-text speaking app for a family member in about an hour.

## The patterns worth keeping

These came up independently across teams doing very different work:

1. **CLAUDE.md is the highest-leverage file you have.** Three unrelated teams reached this on their own.
2. **Commit checkpoints and be willing to throw work away.** Restarting clean usually beats fixing a bad attempt.
3. **It is a partner you iterate with, not a one-shot oracle.** Give it the minimum, watch, steer.
4. **Screenshots are an input, not a fallback.**
5. **Judge the task before you pick the mode.** Edge work can run alone; core logic needs you in the room.
6. **Documentation is a first-class use, not a side effect.**
7. **Use MCP and subagents to keep things controlled and focused.**

## The honest parts

Most write-ups drop these. The RL team says a first attempt fully works only about a third of the time, and that it sometimes puts comments in odd places. Data Science says it tends toward complex solutions and has to be told to keep it simple. That is not a reason to avoid it. It is the reason the checkpoint-and-revert habit exists.

## What a solo developer can copy today

- Write a real CLAUDE.md, even a short one.
- Start risky runs from a clean git state and commit as you go.
- Automate the repetitive thing that sits behind an API first.
- Plan in a normal chat, then move the structured prompt into Claude Code.
- If a run goes sideways, revert and restart instead of wrestling it.

---

The full version on my blog goes team by team through all ten, with the specific numbers and tips for each: [How Anthropic's own teams use Claude Code](https://moeed.app/posts/how-anthropic-teams-use-claude-code/).
