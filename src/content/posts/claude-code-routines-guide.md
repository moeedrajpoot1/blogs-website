---
title: "Claude Code Routines: 7 Real Workflows You Can Set Up Today"
description: "What Claude Code Routines are, how scheduled, API, and GitHub triggers work, and seven practical workflows you can copy into your own setup this week."
pubDate: 2026-05-13
author: "Moeed Rajpoot"
tags: ["claude-code", "tutorials", "ai-agents"]
keywords: [
  "claude code routines",
  "claude code routines tutorial",
  "how to use claude routines",
  "claude code scheduled jobs",
  "claude code github trigger",
  "claude routines api",
  "claude code automation",
  "claude code cloud",
  "claude routines examples",
  "claude code 2026"
]
featured: true
---

For a long time, Claude Code felt like a power tool you had to pick up and put down. You opened the terminal, did the work, and closed it. If you wanted Claude to do something while your laptop was asleep — review a pull request, scan new issues, summarise the week — you needed a separate setup. A cron job, a GitHub Action, some glue code, and a way to keep your credentials safe.

Routines remove all of that.

A routine is a saved Claude Code configuration — a prompt, one or more repositories, and a set of connectors — that runs on Anthropic's cloud on a schedule, on demand, or in response to a GitHub event. You set it up once. You forget it. It keeps working when your laptop is closed.

This post walks through what a routine actually is, how the three trigger types work, and seven workflows I either run myself or set up for clients. Most of them save more time in a week than they took to write.

## What a routine is

The shortest possible definition: a routine is a packaged Claude Code job that runs in the cloud.

Concretely, each routine includes four things.

- A **prompt** describing the work.
- One or more **repositories** the routine should have access to.
- The **connectors** the job needs (Slack, Linear, your MCP servers, anything you have wired up).
- A **trigger** that decides when the routine runs.

When a routine fires, Anthropic spins up a fresh Claude Code session in the cloud, clones the repositories, attaches the connectors, runs the prompt, and shuts down. There is no permission prompt during the run. The session has the same capabilities as your local Claude Code — shell commands, file edits, skills, MCP — but it executes autonomously.

You can create routines from three places, and all three write to the same cloud account.

- The web app at `claude.ai/code/routines`.
- The Claude Code desktop app.
- The CLI, with `claude routines create`.

A routine created in the web shows up in the desktop app and the CLI immediately. Pick whichever surface you find easiest.

## The three trigger types

Triggers are where Routines get interesting. Each routine can have one or more.

### Scheduled

The routine runs on a recurring cadence. Hourly, nightly, weekly, or at a specific future time once. This is the closest thing to a cron job, except you describe the cadence in plain English ("every weekday at 8am UK time") and the cloud handles time zones and retries for you.

### API

Each routine gets a private HTTP endpoint and a bearer token. Send a POST and the routine runs. This is the trigger you use when something outside the Claude ecosystem needs to kick off work — a deploy script, a monitoring tool, a webhook from another service.

### GitHub

A routine attached to a repository can fire on GitHub events. Pull request opened. Pull request synchronised. Release published. Issue created. The event payload is passed into the routine's context, so the prompt can refer to "the PR that just opened" and Claude knows what that means.

You can mix them. A nightly schedule plus an on-demand API trigger is a common pattern. The routine runs every night for housekeeping, and you can also poke it manually from a script when you need it.

## Who can use them, and how many

Routines are part of the Claude Code on the web offering. The limits map onto your plan.

| Plan | Routines per day |
|---|---|
| Pro | 5 |
| Max | 15 |
| Team | 25 |
| Enterprise | 25 |

If you regularly bump against these limits, the answer is usually to combine smaller routines into bigger ones rather than upgrade plans. A single routine can do quite a lot of work in one session.

## A first routine, end to end

Before the workflow examples, here is a complete walkthrough so you can see the moving parts.

### 1. Create the routine

From the web at `claude.ai/code/routines`, click **New routine**. Give it a name like `weekly-todo-cleanup`. Pick the repository it should work in. Add any connectors it needs.

### 2. Write the prompt

The prompt is the heart of the routine. Treat it like a clear request to a teammate.

```text
Read the TODOs in this repository that match the pattern
"// TODO" or "# TODO". For each one:

1. Decide whether the surrounding code still makes sense.
2. If the TODO is stale — the referenced bug is fixed, the
   referenced function no longer exists, or the comment is
   older than 90 days with no recent commits to the file —
   remove it and add a short note to the commit.
3. Group the survivors by directory and post a summary to
   #engineering on Slack, grouped by priority.

Open a pull request titled "chore: weekly TODO cleanup"
against main. Tag @moeed for review.
```

A few things to notice. The prompt is specific. It names the patterns to look for. It defines what "stale" means. It says what to do with the survivors. Vague prompts produce vague routines.

### 3. Add a trigger

Schedule it for every Monday at 9am. Save.

### 4. Run it once by hand

The first run should always be a manual one. You click **Run now** from the routine page. Watch the session in the web viewer. If the prompt or the connector setup is wrong, you catch it before the scheduled run fires for real.

### 5. Iterate

The first version of most routines is not quite right. The Slack summary is too long, or the PR title is off, or the TODO heuristic is too aggressive. You read the output, tighten the prompt, and run it again. After two or three rounds, the routine becomes reliable.

## Seven workflows worth setting up

These are routines I run or have set up for clients. Each one solves a specific problem. The prompt for each is short — the magic is the trigger and the repo it sees, not the cleverness of the writing.

### 1. Nightly issue triage

**Trigger:** Schedule, daily at 7am.
**What it does:** Reads new GitHub issues from the last 24 hours. Adds labels based on content. Estimates priority based on the components touched. Posts a short summary to your team Slack channel grouped by priority.

**Why it pays off:** You walk into the office with a categorised list, not an unread inbox. The labels make the existing GitHub workflow faster too — search and filter actually work because the labels are consistent.

A trimmed version of the prompt:

```text
For every issue opened in this repo in the last 24 hours:

- Read the title and body.
- Add labels from this set: [bug, feature, docs, infra, perf].
- Set a priority label from: [p0, p1, p2, p3] based on:
  - p0: production outage or data loss
  - p1: regression in a core feature
  - p2: notable bug or feature request
  - p3: everything else
- If priority is p0 or p1, leave a comment tagging @oncall.
- Post a Slack summary to #engineering grouped by priority,
  with links to each issue.
```

### 2. PR review pre-pass

**Trigger:** GitHub, on pull request opened or synchronised.
**What it does:** Runs your team's review checklist before a human looks at the PR. Posts inline comments on mechanical issues — missing tests, unhandled errors, style violations, security smells. Adds a top-level summary so the human reviewer can focus on design.

**Why it pays off:** Humans review faster because the noise has already been filtered. PR authors get faster feedback. Reviewer fatigue drops.

This pairs well with [Claude Code skills](/posts/claude-code-skills-complete-guide) — the routine can call a project skill that encodes your specific checklist, so changing the rules is a one-file edit.

### 3. Friday changelog

**Trigger:** Schedule, every Friday at 4pm.
**What it does:** Reads all merged PRs from the past week. Groups them into "features", "fixes", "infrastructure", and "docs". Writes a short, plain-English changelog and opens a PR adding it to `CHANGELOG.md`.

**Why it pays off:** Your changelog actually gets written. The PR is small, you review it in two minutes, you merge it. Over a year, that compounds into a real document.

### 4. Stale branch sweeper

**Trigger:** Schedule, weekly.
**What it does:** Lists branches that have not had a commit in 30 days, are not the default branch, and are not referenced by an open PR. Posts the list to Slack with one-click links to delete them. (Does not delete by itself.)

**Why it pays off:** The repo stays clean. Branches do not pile up. Most teams I have set this up for delete twenty or thirty branches the first week and four or five every week after.

### 5. Dependency report

**Trigger:** Schedule, weekly. Or API, on demand.
**What it does:** Runs `npm outdated`, `pip list --outdated`, or whatever the project uses. For each outdated dependency, reads the changelog of the new version and decides whether the upgrade is patch (safe), minor (probably safe), or major (needs a careful look). Posts a summary with recommendations.

**Why it pays off:** You see the upgrade landscape at a glance instead of running commands and reading changelogs yourself. It does not perform the upgrade — it just tells you what is worth doing.

You can wire this together with an [MCP server](/posts/build-your-first-mcp-server) if you want it to fetch CVE data from your own internal advisory feed.

### 6. Customer support synthesis

**Trigger:** Schedule, daily.
**What it does:** Reads new support tickets and chat transcripts. Clusters them by topic. Writes a short brief for the engineering team listing the top five issues by volume, with example messages and any links between them.

**Why it pays off:** Engineering hears what users are actually saying. The brief is short enough to read in two minutes and specific enough to drive real changes.

This is one of the highest-leverage routines I have set up. It is also the easiest to over-engineer. Keep the brief short. Two paragraphs and five bullets, no more.

### 7. Documentation drift watch

**Trigger:** GitHub, on pull request merged to main.
**What it does:** Compares the changes in the PR against the docs. If a function signature changed, an environment variable was renamed, or a configuration option was added, flags any docs that reference the old version and proposes the update as a follow-up PR.

**Why it pays off:** Docs stop rotting. The most common reason docs go stale is that nobody notices the gap between a code change and the doc that describes it. This routine notices.

## When a routine is the wrong tool

Routines are powerful, and the temptation is to turn everything into one. Two cases where you should not.

- **Anything that needs a human decision in the middle.** A routine runs end to end without prompts. If the work has a "should I do this?" step, the answer is a [skill or a hook](/posts/claude-code-skills-vs-mcp-vs-subagents-vs-hooks) inside an interactive session, not a routine.
- **Anything safety-critical.** A routine runs autonomously with whatever connectors you give it. If a wrong run could send the wrong message to a customer, charge a credit card, or push to production, treat it like a deploy: gate it behind a human-triggered API call rather than a schedule.

A useful rule of thumb. If the work is bounded, reversible, and the cost of a bad run is small, a routine is great. If any of those three is not true, slow down and add a human in the loop.

## How Routines fit with the rest of the stack

Routines are not a replacement for the local features of Claude Code. They sit alongside them.

- **[Skills](/posts/claude-code-skills-complete-guide)** are triggered workflows inside a session. A routine can call them.
- **[Hooks](/posts/claude-code-hooks-complete-guide)** are shell commands on lifecycle events. They run inside a session, not in routines.
- **[Subagents](/posts/claude-code-skills-vs-mcp-vs-subagents-vs-hooks)** are isolated contexts inside a session. A routine is itself one big session.
- **[MCP servers](/posts/build-your-first-mcp-server)** are the integration layer. Routines can use the same MCP servers you have locally.
- **[Managed Agents](/posts/claude-managed-agents-tutorial)** are the API-first cousin of routines. If you are building a product on Claude rather than automating your own work, that is the path.

A simple way to think about it. Skills, hooks, and subagents are for the work you do *with* Claude Code. Routines are for the work you want Claude Code to do *without you*.

## Best practices that have held up

A few things I keep coming back to.

### Start with one routine, not a portfolio

The first routine is the one you will tune the most. Do that work on one job, not five. Once it is reliable, copying the pattern to the next one takes minutes.

### Treat the prompt like a small spec

Vague prompts produce flaky routines. Tight prompts produce reliable ones. Spend ten minutes on the prompt for a routine you will run weekly for a year. The cost-benefit is obvious.

### Log everything to a place you will actually read

A routine that posts to a Slack channel you mute is a routine you do not benefit from. Send output to a channel or an inbox you check. Otherwise the routine is a tree falling in an empty forest.

### Review the run log once a week

Routines drift. APIs change, repos restructure, the world moves. A two-minute weekly review of recent runs catches most issues before they pile up.

### Use API triggers as the safety hatch

For any routine with non-trivial side effects, prefer API triggers over schedules. A schedule that runs while you are on holiday and goes wrong is a story you will tell for years. An API endpoint you only call when you mean to is a tool.

## Common mistakes

- **Connectors set up at the wrong scope.** Routine-level connectors live with the routine. Personal connectors do not transfer to scheduled runs. The most common "why isn't this working" is a personal connector that the cloud session cannot see.
- **No dry run.** First runs should be manual. Always. The cost of a bad scheduled run on a Monday morning is much higher than the cost of clicking "Run now" once.
- **Mega-routines.** One routine doing five different jobs is harder to debug than five routines doing one job each. Split them.
- **Forgetting time zones.** The cloud is on UTC. "Every weekday at 8am" can mean different things to different routines. Be explicit.
- **Treating routines like cron.** A cron job runs a deterministic command. A routine runs a Claude session, which is probabilistic. Two runs of the same routine can produce slightly different outputs. Design for that — the wrapping logic (PRs, comments, summaries) should be the deterministic part.

## Frequently asked questions

**What is a Claude Code routine?**
A saved Claude Code configuration — prompt, repositories, connectors — that runs on Anthropic's cloud on a schedule, an API call, or a GitHub event.

**How is it different from Claude Code on the desktop?**
Desktop runs interactively, with you in the loop. Routines run autonomously in the cloud. The capabilities are largely the same.

**Are routines free?**
They count against the daily routine limit on your plan: 5 a day on Pro, 15 on Max, 25 on Team and Enterprise.

**Can I trigger a routine from a webhook?**
Yes. Every routine has a private API endpoint and bearer token. A webhook can POST to that endpoint to fire the routine.

**Can routines call my MCP servers?**
Yes. Add the connector at the routine level and the cloud session attaches it like a local one. Make sure the MCP server is reachable from the internet, since the cloud session will not see anything on `localhost`.

**Can routines modify the repository?**
Yes, including opening pull requests, leaving comments, and pushing branches. The routine acts with the permissions you grant it.

**How do I see what a routine did?**
Each run has a session log you can open from the routines dashboard. The log shows the prompts, tool calls, and outputs, just like a local session.

**Can I share a routine with my team?**
Yes, if your plan supports shared routines. Otherwise, exporting the prompt and connector setup and re-creating it in a teammate's account works too.

## A short closing thought

The thing routines change is not the work Claude Code can do. It is whether that work happens when you are not there.

A weekly changelog you intend to write rarely gets written. A weekly changelog that writes itself and opens a PR for your review does. Multiply that across triage, review, dependency reports, and docs drift, and the change is not a productivity boost — it is a different relationship with your repo. You stop being the only person who notices.

If you have not set one up yet, the issue triage routine is the best place to start. Pick a repo. Write the prompt. Run it manually once. Schedule it for 7am tomorrow. You will know within two days whether it earns its place. Most do.
