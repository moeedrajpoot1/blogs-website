---
title: Claude Code Ultraplan — plan in the cloud, run anywhere
published: true
description: Ultraplan moves your Claude Code planning to the cloud while your terminal stays free. Here is what it does, how to use it, and when it actually helps.
tags: claudecode, ai, productivity, tutorial
canonical_url: https://moeed.app/posts/claude-code-ultraplan-guide/
cover_image: https://moeed.app/posts/claude-code-ultraplan-hero.png
---

The biggest annoyance with Claude Code's plan mode has always been that long plans are painful to read in a terminal. You scroll, you lose your place, you type a revision request, you scroll again. For a small change this is fine. For a forty-step migration it is awful.

Ultraplan is Anthropic's answer to that. It is a research preview feature that takes your planning task, sends it to a cloud session of Claude Code running in plan mode, and gives you a browser interface to review the plan with inline comments and section navigation. Your terminal stays free the whole time.

I have been using it for a few weeks on real work. Here is the dev.to cut: what it actually is, the three ways to launch it, and when it is worth using versus the local plan mode you already know.

## TL;DR

> Ultraplan runs plan mode in the cloud instead of in your terminal. You invoke it from the CLI, Claude drafts the plan in a remote container, and you review and refine it in a browser. When the plan is ready, you can either let Claude implement it in the same cloud session (PR opens automatically) or pull the plan back to your local machine to run yourself.

## The problem it solves

If you have used `/plan` in Claude Code, you already know the loop. You describe a task, Claude reads your repo, drafts a plan, and shows it to you. You read it, ask for changes, get a new version, repeat.

This works well for small jobs. For larger ones it falls apart in three places:

1. **The plan gets long.** A real architectural change might be twenty or thirty steps, and reading that in a scrolling terminal is harder than it should be. You cannot mark a specific paragraph and say "this part is wrong, leave the rest alone."
2. **Your terminal is stuck.** While the plan is being drafted and revised, that window is busy.
3. **Plan iteration is private to one machine.** If a teammate has feedback, you have to copy the plan into Slack or a doc and lose all the structure.

Ultraplan addresses all three. The plan lives in a web view with proper text selection, inline comments, and an outline sidebar. The terminal returns to you the moment the cloud session starts. The plan has a shareable URL.

## How it works

Three phases. Once you have run it once, it becomes second nature.

### Phase 1: provisioning

When you invoke Ultraplan, Anthropic spins up an ephemeral cloud container, clones your repository from GitHub, runs your setup script if you have one, and initializes Claude Code inside. Takes about 15–30 seconds the first time. The cost is paid against your existing Pro or Max plan — no separate line item.

### Phase 2: drafting

Claude reads the repo, thinks about your task, and writes a structured plan. While this is happening, your terminal shows a small status line and you can keep working. The status moves through:

- `◇ ultraplan` — drafting in progress
- `◇ ultraplan needs your input` — Claude has a clarifying question
- `◆ ultraplan ready` — the plan is ready for review in the browser

You can run `/tasks` at any time to see the status, open the session link, or stop the plan.

### Phase 3: review and execute

When the plan is ready, you open the browser view. This is where Ultraplan earns its keep:

- **Inline comments.** Highlight any sentence and leave a note for Claude to address.
- **Emoji reactions.** React to a section with a thumbs up or a thinking face.
- **Outline sidebar.** Jump between sections by title. For a long plan this is the difference between thirty seconds and three minutes of finding a specific step.

Once the plan looks right, you choose where to execute it: cloud (opens a PR on GitHub) or back to your terminal (full local environment access).

## Three ways to launch it

```
# 1. The slash command — most direct
/ultraplan migrate the auth service from sessions to JWTs

# 2. Keyword in a normal prompt — conversational
Help me plan a refactor of the payment service. Use ultraplan for this.

# 3. Refine a local plan in the cloud
# Start with /plan, then choose "refine with Ultraplan" from the approval dialog
```

Use method 1 when you already know cloud planning is right. Use method 2 when the task is more nuanced than a command line can express. Use method 3 when you started fast in plan mode and realized it was getting too big.

## Cloud execution vs terminal execution

This is the choice most people get wrong on their first try.

|                              | Cloud execution                     | Terminal execution               |
| ---------------------------- | ----------------------------------- | -------------------------------- |
| Environment                  | GitHub repo only, ephemeral container | Full local machine             |
| Pull request                 | Opened automatically                | You open it yourself             |
| Terminal                     | Stays free for other work           | Occupied during the run          |
| Access to local services     | None                                | Full                             |
| Best for                     | Anything fully contained in the repo | Anything that touches your machine |

If the task is a code change that only needs `git`, `npm`, and your test runner, cloud execution is the better experience. If the task needs Docker, a local database, environment variables you do not commit, or a dependency that is not on a public package registry, teleport the plan back to the terminal.

## A real example

To make this concrete, here is a task I ran through Ultraplan recently — migrating my blog's RSS feed to support JSON Feed alongside RSS 2.0.

```
/ultraplan add JSON Feed support to the RSS endpoint, keep RSS 2.0 working,
and add the recommended fields from the JSON Feed 1.1 spec
```

Provisioning took about 20 seconds. The plan was ready in about 4 minutes. While it was drafting, I went back to writing in the terminal.

The plan it produced had 11 steps. Two were wrong. The first suggested creating a new endpoint at `/feed.json` when I wanted both formats served from one endpoint with content negotiation. I highlighted the line, added a comment, the next revision fixed it. The second suggested a dependency I did not want; another comment, another revision.

When the plan looked right, I picked cloud execution because the whole change lived inside the repo. Claude ran the plan, tests passed in the container, and a pull request appeared on GitHub. Total time from invocation to merged PR: about 35 minutes, most of which I spent doing other work.

## When to use it and when not to

**Use Ultraplan when:**

- The plan is going to touch five or more files
- You want to keep your terminal free for other work
- The plan needs review from a teammate via a shared link
- You want to iterate on the plan several times

**Use local `/plan` mode when:**

- The change is small and self-contained
- You need instant iteration and the 15-second startup delay annoys you
- Your repo is not on GitHub
- Your organization has Zero Data Retention requirements
- You are on Bedrock, Vertex, or Foundry (Ultraplan is not available there)

## Requirements

Quick checklist:

- Claude Code v2.1.91 or later
- A GitHub-hosted repository
- A Claude.ai account on Pro, Max, Team, or Enterprise (free tier does not have it)

The cloud container is ephemeral — anything not committed back to the repo is gone when the session ends. If your organization has stricter data residency requirements, stay on local plan mode.

## Common questions

**Is Ultraplan free with my Claude subscription?**
It counts against your existing plan usage. No separate line item.

**Can Ultraplan use my MCP servers?**
The cloud container cannot reach local MCP servers. If the server is hosted somewhere reachable from the cloud, it can connect. For local development MCP servers, teleport the plan back to your terminal.

**How is this different from Ultrareview?**
Different phases. Ultraplan = plan before implementation. Ultrareview = code review before merge. They are designed to be used together.

---

## The full version

This is the dev.to cut. The [full version on my blog](https://moeed.app/posts/claude-code-ultraplan-guide/) goes deeper on:

- The full review interface with inline comments and emoji reactions
- Ultraplan vs Ultrareview side by side
- Limitations around Remote Control and shared plan links
- A longer FAQ

For the most part, Ultraplan is something you learn by using. Pick a task that is too big to plan comfortably in a terminal. Run it through Ultraplan once. The feature either fits your work or it does not, and you will know which after the first try.
