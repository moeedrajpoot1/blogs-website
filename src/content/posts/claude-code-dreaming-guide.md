---
title: "Claude Code Dreaming Explained: A Friendly Guide to AutoDream"
description: "What Claude Code Dreaming is, how AutoDream consolidates your memory files between sessions, what the /dream command does, and when to trigger it by hand."
pubDate: 2026-05-13
author: "Muhammad Moeed"
tags: ["claude-code", "tutorials", "ai-agents"]
keywords: [
  "claude code dreaming",
  "claude code autodream",
  "claude /dream command",
  "claude code memory consolidation",
  "claude code auto dream",
  "how to use claude dreaming",
  "claude dream feature",
  "claude code memory files",
  "claude code sleep mode",
  "claude code 2026"
]
heroImage: "/posts/claude-code-dreaming-hero.png"
heroAlt: "Claude Code Dreaming Explained — AutoDream cleans MEMORY.md in the background, /dream runs it on demand"
featured: false
---

![Claude Code Dreaming Explained — AutoDream cleans MEMORY.md in the background, /dream runs it on demand](/posts/claude-code-dreaming-hero.png)

If you have used Claude Code on the same project for more than a week, you have probably watched your memory files slowly turn into a mess. A few notes here. A list of conventions there. Some half-written instructions that were urgent on Tuesday and are stale by Friday. By the time you notice, your `MEMORY.md` is a few hundred lines long and Claude is using maybe a tenth of it.

Dreaming is the feature Anthropic shipped to fix this.

A "dream" is a background pass where Claude reads its own memory, decides what is still useful, merges duplicates, drops anything stale, and writes a cleaner version back. It runs while you are not actively working. You wake up, the memory file is shorter, sharper, and Claude actually uses it again.

This guide walks through what Dreaming is in practice. What AutoDream does in the background. What the `/dream` slash command does on demand. When to trust it, when to look at the output, and the small mistakes to avoid the first few times you try it.

## What Dreaming actually is

Dreaming is best understood as memory consolidation. Claude already writes notes to memory files during a session — what you asked it to do, decisions it made, conventions you taught it. Over time those notes accumulate. Dreaming is the cleanup pass that turns scattered notes into organised knowledge.

There are two ways it runs.

- **AutoDream** runs on its own when Claude Code is idle. By default, it triggers after roughly 24 hours and 5 sessions of activity. You do not start it. You do not see it. You just notice that your memory files are tidier the next morning.
- **The `/dream` command** is the manual trigger. You run it after a big change, like a framework migration or a renamed module, and Claude consolidates immediately instead of waiting for the next idle window.

Both do the same work. The only difference is who decides when to start.

> **Dreaming is a background memory consolidation pass that reads your existing memory files, drops anything stale, merges duplicates, and rewrites them into a tighter version. It runs automatically when Claude Code is idle, and on demand when you type `/dream`.**

## Why this matters more than it sounds

You can get a long way with Claude Code without ever touching memory. The first time you start using it well, though, you write things to memory often. Project conventions. Names of internal services. The reason a certain test is skipped. The format your team uses for commit messages.

Three months in, two things happen at the same time. The memory file grows past a thousand lines, and the entries inside it start to drift. A convention you wrote in February has been replaced by a different one in April, but both are in the file. A reference to a deleted service is still there. A note about a bug is sitting next to the fix that closed it. The file is no longer a clean summary of how your project works. It is a log.

Long memory files are also less useful than people expect. When Claude pulls memory into context, more is not better. Past a certain length, the model spends attention parsing your notes instead of using them. A shorter, well-edited memory file outperforms a long, sprawling one almost every time.

Dreaming is the answer to both problems. It keeps the file short. It keeps the entries current. You stop having to babysit `MEMORY.md` by hand.

## How AutoDream works under the hood

AutoDream runs in four phases. You can think of it as a small subagent that wakes up, reads your memory, makes a plan, and rewrites the file. Each phase has one job.

### Phase 1: read everything

Claude reads every memory file in the project plus your personal `MEMORY.md`. It does not modify anything yet. It just builds a picture of what is currently there.

### Phase 2: classify

Each entry gets sorted into one of three buckets.

- **Still useful.** A real convention, a real preference, a real bit of context.
- **Stale.** References to code that no longer exists, decisions that were reversed later, or notes that were specific to one task and never meant to last.
- **Duplicate or near-duplicate.** Two entries saying the same thing from different angles. The same convention written twice, six weeks apart, with slightly different words.

### Phase 3: rewrite

Claude produces a new draft of each memory file. Stale entries are dropped. Duplicates are merged into a single canonical entry. The remaining entries get tightened up so the file is shorter without losing anything that matters.

### Phase 4: write back

The new draft replaces the old file. The previous version is kept as a backup so you can diff or revert if something looks off.

The whole pass usually takes a few minutes for a typical project. It happens in the background. Your next session opens against the cleaner file.

## Using AutoDream — the default workflow

For most projects, the right thing to do is leave AutoDream on and let it run. The defaults are sensible. You will rarely need to intervene.

A reasonable rhythm looks like this.

1. Work normally for a few days. Claude writes to memory as you go.
2. AutoDream fires overnight after the trigger condition is met (24 hours of activity, at least 5 sessions).
3. The next morning, your memory files are tidier. You can skim the diff if you want, or not.
4. Repeat.

The only thing worth doing on your side is to occasionally read what AutoDream produced. Not every time. Maybe once a week. You are looking for two things: that nothing important got dropped, and that the entries that remain are written in a way you agree with. Treat it like reviewing a junior teammate's edits — usually fine, occasionally worth a small correction.

## Using `/dream` — the manual workflow

Sometimes you do not want to wait. The most common case is a structural change to the project. You renamed half the directories. You migrated from one framework to another. You replaced your test runner. The memory file is now full of references to things that no longer exist, and Claude will keep using those references until the next dream.

That is when you type `/dream`.

```
> /dream
Reading memory files...
Found 47 entries across MEMORY.md and 3 topic files.
Classifying entries (still-useful / stale / duplicate)...
12 stale, 6 duplicates, 29 still useful.
Rewriting MEMORY.md...
Saved backup to MEMORY.md.bak
Done. Memory consolidated.
```

That output is illustrative — the exact wording will differ across versions — but the shape is right. You get a count of what was kept, what was dropped, and a backup of the previous state. The whole thing takes a minute or two on a normal project.

A small note. The `/dream` command is being rolled out gradually, so on some accounts it may not be available yet. If `/dream` does not work for you, you can ask Claude in plain English: "consolidate my memory files" or "run a dream cycle". Claude does the same thing under the hood.

## When to trigger a dream by hand

A few moments are worth the small interruption of running `/dream`.

- **After a big refactor.** Renamed modules, restructured folders, changed your build tool. Old references in memory turn into noise after a change like this. A dream cleans them out in one pass.
- **After a framework migration.** You moved from Vue to Svelte, from Express to Fastify, from one ORM to another. The same logic — your memory has accumulated assumptions that are now wrong.
- **Before sharing the project with a new collaborator.** A clean memory file is much easier for someone else to read than a six-month log. A dream right before handoff is a small kindness.
- **When Claude starts behaving oddly.** If Claude is making suggestions that feel out of date or applying conventions you no longer use, the memory is probably stale. A dream usually fixes it.

For everything else, leave AutoDream alone.

## AutoDream vs `/dream` vs editing memory by hand

This is the question I get most often. Here is how I think about the three options in practice.

| Method | When to use | Cost |
|---|---|---|
| **AutoDream** | Default. Day-to-day projects you do not want to think about. | Zero. Runs while you sleep. |
| **`/dream`** | After a big change, before a handoff, or when memory feels stale. | A minute or two on demand. |
| **Edit by hand** | When you disagree with something Claude wrote, or when you want to add precise wording. | Real time, but full control. |

A useful rule of thumb. If the issue is "the file is messy", that is a job for AutoDream or `/dream`. If the issue is "the file is wrong", that is a job for you. Memory consolidation cleans up the file. It does not fix bad source material.

## A small example: before and after

Suppose you started a project in March and your `MEMORY.md` now looks something like this:

```markdown
- The auth service lives in /src/auth.
- We use bcrypt for password hashing.
- Auth has been moved to /server/auth in April.
- Use bcrypt rounds = 12.
- The session tokens expire after 1 hour.
- We switched from bcrypt to argon2 in May.
- Session tokens are now 30 minutes by default.
- Use argon2id with parallelism = 4.
- Don't put session tokens in localStorage.
- We use argon2 (id mode).
```

After a dream cycle, that becomes:

```markdown
- The auth service lives in /server/auth.
- Use argon2id for password hashing with parallelism = 4.
- Session tokens expire after 30 minutes.
- Do not store session tokens in localStorage.
```

Four lines instead of ten. No contradictions. No stale references. Same project knowledge, much easier for Claude to use in the next session.

## Where Dreaming fits with the rest of Claude Code

Dreaming is one of several memory and context features that landed in 2026. They all play different roles, and the easiest mistake is to confuse them.

- **CLAUDE.md** is for always-on project context. Conventions that should be active every session.
- **Memory files** (`MEMORY.md` and topic files) are for cumulative notes — facts and decisions Claude collects over time.
- **[Skills](/posts/claude-code-skills-complete-guide)** are triggered workflows. They fire when a user message matches their description.
- **[Hooks](/posts/claude-code-hooks-complete-guide)** are shell commands that run on lifecycle events.
- **Dreaming** is the maintenance pass that keeps memory files clean.

A simple way to think about it: CLAUDE.md is what you teach the model on day one. Memory is what the model learns from working with you. Dreaming is what keeps the second thing usable over the long run.

If you also use [subagents](/posts/claude-code-skills-vs-mcp-vs-subagents-vs-hooks), it is worth knowing that subagents do not share your main memory file. They get their own scratch context for the task. So a dream only affects what your main session sees, not anything a subagent is doing in parallel.

## Common mistakes the first few times

A few patterns I have seen on my own setup and on client projects.

- **Disabling AutoDream because of one bad pass.** AutoDream occasionally drops something you wished it had kept. The right response is usually to add the dropped fact back by hand, not to turn the feature off. The average across a hundred passes is strongly net positive.
- **Treating `/dream` as a fix for bad memory.** If your memory file has wrong information, dreaming will keep the wrong information — just in a tidier form. Fix the source first.
- **Running `/dream` in the middle of a task.** Memory consolidation rewrites files that Claude is using. If you run it mid-task, the rest of the conversation may briefly reference an older version. Save it for between tasks.
- **Ignoring the backup file.** Every dream writes a `.bak` of the previous memory. If you do not like the result, you can revert. Most people forget the backup is there.
- **Expecting it to merge across projects.** Dreaming runs per project (and once across your personal memory). It does not pool memory across all your repos.

## Best practices that actually matter

Three rules I follow after a few months with this feature.

### Read the diff once a week

Not every dream. Just one a week. You are checking that nothing important is being quietly dropped and that the writing style matches what you want. A two-minute skim catches drift early.

### Keep CLAUDE.md and memory separate

Resist the urge to copy stable conventions into memory and unstable notes into CLAUDE.md. The split exists for a reason. CLAUDE.md stays small and always-on. Memory grows and is consolidated. Mixing them weakens both.

### Pair Dreaming with Skills

If a piece of guidance is a stable workflow ("always run lint after edit"), promote it from memory into a [skill](/posts/claude-code-skills-complete-guide). Skills are explicit, versioned, and shared with your team. Memory is meant to be ephemeral on a longer timescale. Dreaming makes the ephemeral side sustainable. Skills make the stable side reliable.

## Frequently asked questions

**What is Claude Code Dreaming?**
It is a background pass that consolidates your memory files. It reads what Claude has written to `MEMORY.md` and any topic files, drops stale entries, merges duplicates, and rewrites a cleaner version.

**What does AutoDream mean?**
AutoDream is the automatic mode. It runs when Claude Code is idle and certain conditions are met, usually a day of activity and at least five sessions. You do not start it.

**What does the `/dream` command do?**
It triggers a dream cycle on demand. Same work as AutoDream, but it runs immediately instead of waiting for the next idle window.

**Will Dreaming delete my memory?**
No. It rewrites the file to be shorter and cleaner. A backup of the previous version is saved next to the file so you can diff or revert.

**Is Dreaming safe to use on a shared project?**
Yes. Project memory files are committed to git in most setups. After a dream, you see the diff like any other change and decide whether to merge it. Personal memory in `~/.claude/` is not shared.

**Does Dreaming work with subagents?**
Dreaming only affects your main session's memory. Subagents run in separate, fresh contexts and do not share that file.

**How is Dreaming different from CLAUDE.md?**
CLAUDE.md is always-on context that you write by hand. Memory files are cumulative notes Claude collects during sessions. Dreaming is the maintenance pass for the second.

**Can I turn AutoDream off?**
Yes, in Claude Code settings. Most people are better off leaving it on and reviewing the diff occasionally.

## A short closing thought

The thing that surprised me about Dreaming is how quietly useful it is. You do not notice the feature on day one. You notice it three weeks later when you realise your memory file is still readable, still relevant, and still under a few hundred lines — without you ever having tidied it.

If you have a project where Claude already writes to memory, just leave AutoDream on for a couple of weeks and see what it does. The first time you run `/dream` after a big refactor and the noise goes away, you will understand why this is the feature people are quietly excited about.

When you are ready to push memory further, the natural next step is to lift stable habits into [skills](/posts/claude-code-skills-complete-guide), wire shell-level enforcement through [hooks](/posts/claude-code-hooks-complete-guide), and offload heavy research into [subagents](/posts/claude-code-skills-vs-mcp-vs-subagents-vs-hooks). Dreaming sits underneath all of that — the maintenance layer that keeps the rest sustainable.
