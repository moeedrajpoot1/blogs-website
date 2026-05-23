---
title: "Claude Code: Skills vs MCP vs Subagents vs Hooks (2026)"
description: "A plain-English comparison of Claude Code skills, MCP servers, subagents, and hooks. When to pick each, with a decision tree, code, and common confusion."
pubDate: 2026-05-09
author: "Muhammad Moeed"
tags: ["claude-code", "tutorials", "ai-agents"]
keywords: [
  "claude code skills vs mcp",
  "claude code subagents vs hooks",
  "claude code skills vs subagents",
  "claude code hooks vs skills",
  "mcp server vs skills",
  "claude code customization",
  "when to use claude code skills",
  "when to use mcp server",
  "claude code feature comparison",
  "claude code 2026"
]
featured: false
---

If you have spent more than a week with Claude Code, you have probably hit this question. You want Claude to do something repeatable. Should it be a skill? A slash command? An MCP server? A subagent? A hook? Each one feels like it could work, the docs treat them as separate concepts, and the lines between them are genuinely fuzzy.

The reason it gets confusing is that all four sit on the same spectrum. They are different ways to extend Claude Code, but they answer different questions. Skills answer *what should Claude know*. MCP answers *what should Claude be able to do*. Subagents answer *where should the work happen*. Hooks answer *what must definitely happen*.

This post is the comparison I wish I had when I started. Plain English definitions, a decision tree you can keep in your head, real examples for each, and the gotchas I keep seeing in client codebases.

> **TL;DR.** Skills are knowledge. MCP servers are actions. Subagents are isolation. Hooks are guarantees. Most real workflows use two or three of them together — they are designed to compose, not to compete.

## The four features in one sentence each

Before any comparison, the one-line definition that actually maps to how you use them.

| Feature | One-line definition | Lives in |
|---|---|---|
| **Skill** | A markdown instruction file Claude pulls in when your message matches its trigger | `.claude/skills/<name>/SKILL.md` |
| **MCP server** | An external process Claude can call as tools over JSON-RPC | A separate binary or service |
| **Subagent** | A fresh, isolated Claude instance Claude can hand work off to | `.claude/agents/<name>.md` |
| **Hook** | A shell command the Claude Code harness runs at a lifecycle event | `settings.json` |

If you internalise one thing from this post, make it this: **skills tell Claude how to do something, MCP gives Claude the ability to do it, subagents move the work somewhere else, and hooks force something to happen no matter what Claude decides.**

## The mental model: knowledge, action, isolation, guarantee

The reason the four features look interchangeable from a distance is they all let you "extend Claude Code." The reason they are not actually interchangeable is each one extends a different layer.

### Skills extend Claude's knowledge

A skill is a piece of writing Claude reads when your request looks like it might apply. Nothing in a skill *runs*. It is just instructions. The model reads them and behaves differently as a result.

Use a skill when the answer to "what is missing" is *the model does not know how I want this done*. Commit message format. Lint policy. PR template. House style for log lines. None of these need code — they need a paragraph that reliably reaches the model at the right time. That is what a skill is for. The full walkthrough lives in the [Claude Code skills guide](/posts/claude-code-skills-complete-guide), but the short version is: a folder with a `SKILL.md`, a description that names the trigger words, and you are done.

### MCP servers extend Claude's actions

An MCP server is the opposite: nothing in it is instructions. It is purely capability. A running process that exposes tools — `query_database`, `send_slack_message`, `create_jira_ticket` — that Claude can call.

Use an MCP server when the answer to "what is missing" is *Claude needs to actually touch a system it cannot reach*. Read from your database. Post to Slack. Hit an internal API. Read a Notion page. The model already knows how to call tools — what it needs is for the tool to exist. That is what an MCP server is for. If you have not built one yet, start with [build your first MCP server](/posts/build-your-first-mcp-server) and the [best MCP servers list](/posts/best-mcp-servers-2026) for the ecosystem.

### Subagents extend Claude's context

A subagent is a separate Claude instance that runs in its own fresh context. Claude hands it a brief and gets back a summary. The subagent can have its own tools, its own permissions, even its own model.

The reason subagents exist is context pollution. If you ask the main Claude to read every file in a 50-file repo, the conversation gets buried in noisy tool output and the model gets dumber by the time you ask the real question. A subagent does that work in a side context — only the answer comes back, the noise stays behind. Use subagents when the work is heavy or noisy and you want the main conversation to stay clean.

### Hooks extend the harness, not the model

A hook is a shell command the Claude Code harness runs on a lifecycle event: before a tool runs, after a tool runs, when you submit a prompt, when Claude finishes. Hooks are not optional and not subject to the model's interpretation. If you wire one up, it runs.

Use hooks when the answer is *this must definitely happen, every time, no matter what Claude decides*. Block writes to `production.env`. Run the linter after every edit. Push a notification to Slack when Claude is idle. Anything where "the model should remember to do this" is not good enough is a hook. The full pattern set is in the [Claude Code hooks guide](/posts/claude-code-hooks-complete-guide).

## A decision tree you can keep in your head

When you are about to extend Claude Code, ask these questions in order. The first "yes" wins.

```
Does it have to run, every time, regardless of what Claude does?
  → Hook

Does Claude need to touch a system it currently cannot reach?
  → MCP server

Is the work big, noisy, or risky enough to wreck the main context?
  → Subagent

Does Claude need to know how to do something it currently does inconsistently?
  → Skill
```

You will notice the order. Hooks first because they are the only deterministic option. MCP next because adding capability is usually higher leverage than adding instructions. Subagents third for the context-pollution case. Skills last because they are the lightest tool and you usually do not need anything heavier.

## Side-by-side: how they compare on the things that matter

| | Skill | MCP server | Subagent | Hook |
|---|---|---|---|---|
| **What it adds** | Knowledge | Capability | Isolated context | Determinism |
| **Runs?** | No, it is instructions | Yes, it is a process | Yes, it is a model call | Yes, it is a shell command |
| **Triggered by** | Claude, when description matches | Claude, when it picks the tool | Claude, when it delegates | The harness, on a lifecycle event |
| **Can Claude skip it?** | Yes | Yes | Yes | No |
| **Cost** | Tiny — ~100 tokens until used | Process + tool token cost | Full context + model tokens | Whatever the script costs |
| **Best for** | Style, conventions, repeated workflows | External systems, real APIs | Heavy reads, parallel work | Guards, logging, CI gates |
| **Worst at** | Anything deterministic | Anything you do not want as an action | Quick lookups | Anything stateful or interactive |

A useful way to read that table: every row points at the same trade-off. The more deterministic and external you go, the more reliable but less flexible the feature. The more model-driven you go, the more flexible but less guaranteed.

## Real scenarios, real picks

The decision tree is the abstract version. Here are concrete situations and what I actually reach for.

### "Every commit should follow Conventional Commits format"

This is a **skill**. The model already knows how to write a commit message. It just needs a reliable nudge toward your house style. A six-line `SKILL.md` does it.

```markdown
---
name: conventional-commit
description: Use this skill any time the user asks to commit, write a commit message, or create a git commit. Format the message in Conventional Commits style.
---

Start the subject with one of: feat, fix, chore, docs, refactor, test, perf.
Add a colon, then a short imperative summary, no period. Keep under 70 characters.
```

You do not need a hook here because the cost of a slightly off commit is low and the friction of a hook (it stops the workflow) is not worth it.

### "The agent must never write secrets to a log file"

This is a **hook**, not a skill. "Never" is the keyword. A skill says "please don't" and the model usually obeys; a hook is the only way to make it actually impossible.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "scripts/check-no-secrets.sh"
          }
        ]
      }
    ]
  }
}
```

The hook runs before every `Write` call. If the file path or content trips the check, the hook exits non-zero and the write is blocked.

### "Claude needs to read tickets from our Jira"

This is an **MCP server**. There is no shortcut here — Claude cannot reach Jira without one. A skill telling Claude "use the Atlassian API" is useless if the API call has no transport.

If your team is on the Atlassian Rovo MCP, it is already wired up. If you are on a different stack, this is the easiest "first MCP server" project to ship — read-only, predictable schema, immediate value.

### "Audit our 200-file Rails monorepo for unused routes"

This is a **subagent**. If you do this in the main conversation, you are looking at 200 file reads, hundreds of grep results, and a context that becomes useless for the rest of the day. A subagent runs the same work in a fresh context, returns "here are the 14 unused routes", and your main conversation stays clean.

```markdown
---
name: route-auditor
description: Audits a Rails app for unused routes. Reads routes.rb, scans controllers, and returns the list.
tools: ["Read", "Grep", "Glob"]
---

Read config/routes.rb. For each route, find the controller#action.
For each action, grep for any reference. Return a list of actions
that are referenced nowhere outside their own controller.
```

### "After every edit, run the linter and only commit if it passes"

Two pieces of work, two features. The "run the linter" part is a **skill** — Claude can do it, you just want consistency. The "only commit if it passes" part is a **hook** — that is a guarantee, not a guideline. They compose.

## How they compose

Most production setups use three or four of these together. Here is a pattern I see often.

A team has a coding agent. The agent uses a **skill** that defines their PR description format. It uses an **MCP server** to fetch ticket context from Linear. It uses a **subagent** for any task that needs to read more than a handful of files. And it uses a **hook** to enforce that no test file is ever modified by the agent — only created or read.

That is four features doing four different jobs. Trying to collapse any of them into a different feature would either make it less reliable or pollute the main context.

The right question is rarely "should I use a skill or an MCP server?" — it is "what does this specific extension need to be: knowledge, action, isolation, or guarantee?" Once you answer that, the feature picks itself.

## The five mistakes I keep seeing

After auditing a couple of dozen Claude Code setups, the same five mistakes show up.

### Putting capabilities into a skill

If your `SKILL.md` says "use curl to fetch from our API", that is a skill pretending to be an MCP server. It will work sometimes and fail unpredictably. Build the MCP server.

### Putting guarantees into a skill

"Never delete files in `data/`" inside a skill is a wish, not a rule. Claude will obey it most of the time and forget the one time you really needed it to remember. Move the rule into a `PreToolUse` hook with a matcher on `data/`.

### Using a subagent for small lookups

Subagents pay for themselves on heavy work. For a quick "what does this function do" lookup, the cost of spinning up a fresh context is greater than the cost of doing it in the main one. Save subagents for genuinely big tasks.

### Building an MCP server for something a skill could do

If the work is "format this output a certain way" or "follow this commit convention", you do not need a server. You need a paragraph. MCP servers are for capability the model does not have, not for behaviour the model already has but does inconsistently.

### Treating CLAUDE.md as a substitute for any of the four

CLAUDE.md is for *always-on* context. Project conventions, tech stack, the things every conversation in this repo should start with. It is not the place to put workflows ("when committing, do X"), capabilities ("query the database"), or guarantees ("block edits to production.yml"). Putting all four in CLAUDE.md bloats the main context and makes none of it reliable.

## Common questions

**Is a skill the same as a slash command?**
Almost. A skill file gives you both an auto-discovered skill and a `/skill-name` slash command for free. Slash commands are the manual entry point; skills are the auto side. Same file, two ways to invoke.

**When should I use a hook instead of a skill?**
When the cost of forgetting is high. Skills rely on the model picking them up. Hooks always run. Use a hook when "the model should remember" is not a strong enough guarantee.

**Do MCP servers and skills work together?**
Yes, and this is one of the most useful patterns. A skill says "when the user asks for X, call the `lookup_customer` tool then format the result like this." The skill is the methodology; the MCP tool is the action.

**Does a subagent see my conversation?**
No. That is the whole point. It gets a brief from Claude and reports back. Anything you want it to know has to be in the brief or in a file it can read.

**Can a hook call Claude?**
The hook itself is just a shell command, so technically yes — you could shell out to the Anthropic API or to Claude Code itself. In practice, hooks should be short, deterministic, and not depend on a model. Use them for guards and logging, not for new model calls.

**Where do I store secrets — skill, MCP, subagent, or hook?**
None of them. Secrets go in environment variables or a secrets manager that your MCP server or hook reads from. Skills are checked into git, subagents are read by Claude, and hook scripts get logged. Treat all four as untrusted for secrets.

**Which one should I learn first?**
Skills. They are the lightest, fastest to write, and teach you the most about how Claude actually picks things up. From there, the path I usually recommend is: skill → hook → MCP server → subagent.

## A short closing thought

The whole point of having four features is that "extending an AI agent" is not one problem — it is four. Knowledge, action, isolation, and guarantee. Each one needs a different shape of solution, and the projects that go well are the ones that pick the right shape early.

If you are setting up Claude Code on a new repo today, the order I would suggest is the same as the decision tree. Start with a `CLAUDE.md` for always-on context. Add one or two **skills** for the conventions you keep repeating. Add one **hook** for the rule you cannot afford to forget. Add one **MCP server** when there is a system Claude clearly cannot reach. Reach for **subagents** when, and only when, you start seeing context pollution from heavy tasks.

Three of those changes can ship this week. The fourth comes when you actually need it. That is the right pace.

## Where to go next

Once you have the four primitives in place, two more pieces fill out the picture for serious use.

- [Claude Code Ultraplan](/posts/claude-code-ultraplan-guide) takes the planning phase to the cloud, which matters once tasks get too large to plan comfortably in a terminal.
- [Claude Code Outcomes](/posts/claude-code-outcomes-guide) adds a rubric-graded check so the agent's work is judged on real criteria, not just "looks fine to me."
- [Claude Code vs Cursor](/posts/claude-code-vs-cursor) is worth a read if you are still picking a primary AI coding tool.
