---
title: "How to Build a Claude Code Skill: SKILL.md Format and Setup"
description: "Build your first Claude Code skill. See the SKILL.md format, where skills live on disk, the YAML frontmatter fields, and how to test the skill."
pubDate: 2026-05-05
updatedDate: 2026-06-12
author: "Muhammad Moeed"
tags: ["claude-code", "tutorials", "ai-agents"]
keywords: [
  "claude code skills",
  "claude code skills tutorial",
  "how to use claude code skills",
  "create claude code skill",
  "claude code skill.md",
  "claude code skills vs slash commands",
  "claude code skills vs subagents",
  "claude code custom skills",
  "claude code skills examples",
  "claude code skills 2026"
]
featured: false
---

If you have spent any real time with Claude Code, you have probably noticed the same problem I did. You write the same instructions in the prompt every other day. "Use four-space indentation here." "Always run the linter after edits." "Format commit messages this way." After the third or fourth repeat, it stops feeling like a prompt and starts feeling like missing config.

Skills are how Claude Code fixes that. A skill is a small folder, with one markdown file inside, that Claude pulls into the conversation only when your request actually needs it. No setup screen. No plugin manager. Just a file in a folder and a one-line description telling Claude what it is for.

This post is a clean walkthrough for 2026. What a skill actually is, how to write your first one, where to put it, and how it compares to the two things people often confuse it with: slash commands and subagents.

## What a Claude Code Skill actually is

At the most basic level, a skill is a directory with a single file called **SKILL.md** inside it. The file has two parts.

- A short YAML frontmatter at the top, with a `name` and a `description`.
- A markdown body underneath, with the instructions Claude follows when the skill is triggered.

That is the whole spec. Everything else, examples, supporting scripts, templates, helper files, is optional and lives in the same directory.

Here is the smallest valid skill you can write:

```
.claude/skills/run-tests/
└── SKILL.md
```

```markdown
---
name: run-tests
description: Run the project's test suite using the Makefile target. Use this whenever the user asks to run tests, check tests, or verify the test suite is passing.
---

Run `make test` from the repo root. If the command fails, read the failing test
output, point out the specific assertion that broke, and ask before changing
anything in the source files.
```

That is a working skill. Drop it in `.claude/skills/run-tests/`, restart Claude Code, and the next time you say "run the tests" Claude will use this instead of guessing.

## How Claude actually picks up a skill

This is the part that confuses people most. Skills are not always-on. They are **auto-discovered**.

Here is what happens when you send a message:

1. Claude reads the descriptions of every skill it can see.
2. It compares your message to those descriptions.
3. If one matches, it pulls that skill's full content into the conversation.
4. If nothing matches, no skill is loaded and you get the default behavior.

This is why the **description does most of the heavy lifting** in any skill. It is the only thing Claude has to decide whether the skill applies. A vague description ("Helps with tests") will rarely fire. A specific one ("Runs the project's pytest suite when the user asks to run, check, or verify tests") will fire reliably.

A simple test: read your description out loud. If it does not start with a clear verb and end with a clear trigger, rewrite it.

## Where skills live

Skills sit in one of three places. The location decides who sees them.

| Location | Scope | When to use |
|---|---|---|
| `.claude/skills/<name>/` inside a repo | Project | Workflows specific to one codebase |
| `~/.claude/skills/<name>/` in your home directory | Personal | Workflows you want everywhere |
| Plugins or shared packages | Team | Skills you want to ship to others |

Project skills win when there is a conflict. So if your repo has a `run-tests` skill and your personal folder has one too, the project one is used while you are inside that repo. That is almost always what you want.

A small but important detail: skills that live inside the repo are checked into git by default. That is fine. They are usually short, they help every collaborator, and they are easier to review than long CLAUDE.md files.

## A walkthrough: build a skill from scratch

Let us write something slightly more useful than `run-tests`. Say you have a personal habit of starting every commit message with a Conventional Commit type (`feat:`, `fix:`, `chore:`). You want Claude to do the same when it commits.

### Step 1: make the directory

From the root of your project:

```bash
mkdir -p .claude/skills/conventional-commit
```

### Step 2: write SKILL.md

Open `.claude/skills/conventional-commit/SKILL.md` and put this inside:

```markdown
---
name: conventional-commit
description: Use this skill any time the user asks for a git commit, to commit changes, or to write a commit message. It writes the message in Conventional Commit format.
---

When you create a git commit, follow these rules.

1. Start the subject line with one of: feat, fix, chore, docs, refactor, test, perf.
2. Add a colon and a space, then a short imperative summary, no period.
3. Keep the subject under 70 characters.
4. If the change touches more than two files, add a one-line body that says why.

Example:

  feat: add IndexNow ping to publish workflow

  Auto-pings Bing on every push to main so new posts get indexed faster.
```

### Step 3: try it

Restart Claude Code (or just open a new conversation). Say "commit these changes". Claude should pull in the skill, follow the format, and you should see a commit subject that matches the rules.

If it does not fire, the description is the first thing to fix. Make the trigger words match what you actually say to Claude.

## Skills vs slash commands vs subagents

This is the question I get most often, and the line is genuinely fuzzy because the three features have grown closer over time. Here is how I think about them in practice.

### Skills

- Auto-discovered. Claude decides when to use them based on your message.
- Live inside the main conversation, so the work stays visible and you can intervene.
- Best for: repeated workflows you do not want to type out, like commit formatting, test running, or PR conventions.

### Slash commands

- You invoke them by hand, with `/command-name`.
- Same file format as skills now, in fact a single skill file gives you both an auto-trigger and a `/run-tests` slash command for free.
- Best for: explicit triggers when you want full control over when something runs.

### Subagents

- Spawned by Claude into a **separate, fresh context** with their own tools and memory.
- They do not see your conversation. They get a brief from Claude and report back.
- Best for: heavy or noisy work you want to keep out of your main context, like searching the whole repo, running long evals, or summarising a large diff.

A useful rule of thumb. If the work is small and should stay in front of you, that is a skill. If the work is big and should run in a side process, that is a subagent. If you specifically want a typed entry point, slash command.

For more on the subagent side, the [hooks guide on this site](/posts/claude-code-hooks-complete-guide) covers the shell-level lifecycle that pairs well with skill-based workflows.

## Three small skills that pay for themselves

These are skills I have on most of my repos. None of them are clever. All of them save real time.

### 1. `lint-after-edit`

```markdown
---
name: lint-after-edit
description: Run the project's linter after any code edit. Use any time the user asks Claude to edit, refactor, fix, or modify a source file.
---

After completing any edit to a .ts, .tsx, .js, or .py file, run `npm run lint`
(or `ruff check .` for Python). If the lint fails, fix the warnings before
reporting that the edit is done.
```

The reason this works is that "edit a source file" is a very common trigger. The skill fires almost every coding session and you stop seeing lint failures land in commits.

### 2. `pr-description`

```markdown
---
name: pr-description
description: Write a pull request description from the current branch's commits. Use any time the user asks for a PR description, PR body, or pull request summary.
---

Read `git log main..HEAD` and write a PR description in this format.

## Summary
One short paragraph, no marketing language.

## Changes
- One bullet per logical change, not per commit.

## Test plan
- A checklist a reviewer can run.

Do not include emojis, do not start lines with "This PR".
```

The "do not" lines matter. Negative instructions are how you stop Claude from drifting back to its defaults.

### 3. `clean-imports`

```markdown
---
name: clean-imports
description: Remove unused imports and sort the rest. Use any time the user asks to clean imports, sort imports, or tidy imports in a file.
---

For each file the user asks to clean:

1. Remove imports that are not referenced anywhere in the file.
2. Sort what remains by: standard library, then third-party, then local.
3. Group each section with a blank line between them.

Do not touch import side effects (imports with no name).
```

Skill, slash command, and auto-trigger all in one file. Same content. Three ways to invoke it.

## Best practices that actually matter

After writing dozens of skills for myself and clients, three rules stand out.

### One skill, one job

The most common mistake is the mega-skill. A single SKILL.md trying to handle commits, PRs, branch naming, and changelog updates all at once. Mega-skills load late, fire less reliably, and confuse Claude when two parts conflict. Split them. A skill should fit on one screen.

### Write the description like a trigger, not a label

Bad:

> A skill for working with tests.

Good:

> Run the project's pytest suite when the user asks to run tests, check tests, or verify the test suite is passing.

The good version names the verbs Claude needs to spot. "Run", "check", "verify" — those are the words a user actually types.

### Keep instructions imperative

Skills that read like documentation ("This skill is responsible for...") fire less reliably than skills that read like instructions ("Run X. Then Y. If Z, do W.") Direct verbs map cleanly to actions.

### Resist the urge to over-script

You can ship Python or shell scripts inside a skill folder, and sometimes that is right. But for most workflows, plain markdown instructions are enough and easier to maintain. Use scripts when the work is genuinely deterministic, not just because you can.

## Common mistakes

A few patterns I see again and again.

- **Description is too generic.** If yours starts with "A skill that helps with...", it will rarely fire. Rewrite it to start with a verb.
- **Skill is in the wrong folder.** `~/.claude/skills/` is for personal skills across all projects. `.claude/skills/` is for the current project only. Mixing them up is the most common reason a skill "is not picked up."
- **Trying to replace CLAUDE.md.** Skills are for repeated, triggered workflows. CLAUDE.md is for always-on context like project conventions. They complement each other.
- **Forgetting to restart Claude Code.** Skills are loaded on session start. If you add one mid-conversation, end the session and start a new one.
- **Putting secrets inside SKILL.md.** Skills are committed to git in most setups. Treat them like source code, not config.

## Frequently asked questions

### Where do Claude Code skills live?

Project skills live inside the repo at `.claude/skills/<skill-name>/SKILL.md`. Personal skills live at `~/.claude/skills/<skill-name>/SKILL.md`. Plugin-shipped skills live wherever the plugin is installed. Project skills win over personal ones when there is a name conflict, which is almost always what you want inside a repo.

### What is SKILL.md?

SKILL.md is the single file that defines a Claude Code skill. It has two parts: a YAML frontmatter at the top with `name` and `description`, and a markdown body underneath with the instructions Claude follows when the skill triggers. The filename is exact and case-sensitive. Everything else in the skill folder — supporting scripts, templates, helper files — is optional.

### How do I test a Claude Code skill?

Restart Claude Code (skills load on session start), then send a prompt that contains the trigger words named in the skill's `description` field. If the skill loads, Claude follows the instructions in the body. If it does not load, the most common cause is a vague description that does not match the words you actually type. Read the description out loud; it should start with a clear verb and end with a clear trigger phrase.

### Claude Code skills vs slash commands — what is the difference?

A skill file is also a slash command. The same SKILL.md gives you both auto-discovery and a `/skill-name` invocation. Slash commands are the manual entry point. Skills are the auto-discovered side of the same thing. Use the slash command when you want explicit control over when something runs; lean on auto-discovery when the workflow should fire any time the trigger words show up.

### Claude Code skills vs subagents — when to use which?

Subagents run in a fresh, isolated context with their own tools and memory. Skills run inside your current conversation and stay visible. Use a skill when the work is small and should stay in front of you (commit formatting, lint runs, PR templates). Use a subagent when the work is large and should run as a side process (repo-wide search, long evals, summarising a 5,000-line diff).

### Do I need to restart Claude Code after adding a skill?

Yes. New skills are picked up when a session starts. End the conversation and open a new one to load them. If you keep editing a skill and it does not seem to fire, double-check that you restarted the session, not just refreshed the terminal.

### Can a Claude Code skill use external scripts?

Yes. You can ship shell or Python scripts inside the skill folder and reference them from SKILL.md. For most workflows, plain markdown instructions are enough and easier to maintain. Use scripts when the work is genuinely deterministic, not just because you can.

### Does this work in Claude Chat or only in Claude Code?

The same SKILL.md format works across Claude Code, Claude Chat, and Claude Cowork. Each product looks for skills in its own location, but the file format is identical, so a well-written skill is portable.

### Should I put skills in CLAUDE.md instead?

No. CLAUDE.md is for always-on project context — architecture, style, common commands. Skills are for triggered workflows that should only load when relevant. Loading every workflow into CLAUDE.md bloats the main context and slows the model down. If you have skills that drift into CLAUDE.md, the [Claude Code Skills vs MCP vs Subagents vs Hooks comparison](/posts/claude-code-skills-vs-mcp-vs-subagents-vs-hooks) explains where each primitive belongs.

## A short closing thought

The reason skills matter is not that they are clever. It is that they remove the small, repeated friction of telling Claude the same thing every day. A good skill is short, targeted, and almost invisible: you stop noticing it because the work just gets done the way you wanted.

Start with one. The smallest one you can think of. A commit format, a lint rule, a PR template. Once one is working, write the next one. Within a week or two you will have a folder of small files that quietly shape how Claude works on your project, and you will wonder how you ever managed without them.

If you are extending Claude Code with [hooks for shell-level enforcement](/posts/claude-code-hooks-complete-guide) or [building MCP servers for richer integrations](/posts/build-your-first-mcp-server), skills sit comfortably between the two: lighter than a server, more flexible than a hook, and easier to share across a team than either.

Two related reads if you want to round out the picture. [Claude Code Dreaming](/posts/claude-code-dreaming-guide) explains the maintenance layer that keeps your memory and skill notes coherent across sessions. [Claude Code Outcomes](/posts/claude-code-outcomes-guide) explains how to add a rubric-graded check so a skill's output is judged on more than vibes.
