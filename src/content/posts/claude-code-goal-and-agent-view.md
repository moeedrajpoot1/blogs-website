---
title: "Claude Code /goal and Agent View: A Practical Guide"
description: "What Claude Code's /goal command and Agent View do, how they work together, how to write a completion condition that holds, and when to actually use them."
pubDate: 2026-05-19
author: "Muhammad Moeed"
tags: ["claude-code", "ai-agents", "tutorials"]
keywords: ["claude code goal command", "claude code /goal", "claude code agent view", "claude code background sessions", "claude code autonomous agents", "claude code v2.1.139", "how does claude code goal work"]
heroImage: "/posts/claude-code-goal-and-agent-view-hero.png"
heroAlt: "Title card for the article Claude Code /goal and Agent View, listing the related pieces: completion condition, evaluator, background sessions, fleet view"
featured: false
---

Claude Code added two things in the May 2026 update that change how you run it without watching every step: the `/goal` command and Agent View. `/goal` lets a session keep working until a condition you wrote is true. Agent View is the screen where you watch several of those sessions at once. They are separate features, but they were built for the same workflow, so it makes sense to learn them together.

This guide explains what each one does, how the goal check actually works under the hood, how to write a condition that does not run forever, and when this is the right tool versus the autonomous options Claude Code already had. Every detail here is from the official documentation, including the parts that are easy to get wrong.

> `/goal` sets a completion condition and Claude Code keeps taking turns until a separate fast model confirms the condition is met, then it stops on its own. The check reads only what Claude has shown in the conversation; it does not run commands itself, so the condition has to be something Claude's own output can prove. Agent View is a single CLI screen that shows every running session, what each one last did, and which ones are waiting for you. It needs Claude Code v2.1.139 or later.

![Title card for the article Claude Code /goal and Agent View, listing the related pieces: completion condition, evaluator, background sessions, fleet view](/posts/claude-code-goal-and-agent-view-hero.png)

## What /goal actually does

Normally Claude Code does one turn of work and hands control back to you. You read the result, type the next instruction, and it goes again. For a task that takes twenty turns, that means twenty interruptions.

`/goal` removes those interruptions. You write one completion condition. After each turn, instead of stopping, Claude Code asks a separate model whether the condition is now true. If the answer is no, it starts another turn, using the reason it got back as guidance. If the answer is yes, the goal clears itself and you get your terminal back. It requires Claude Code v2.1.139 or later.

The important detail, and the one most write-ups skip, is **how the check works**. The evaluator is a small fast model, Haiku by default. It is sent your condition and the conversation so far, and it returns a yes or no plus a short reason. It does not run commands and it does not open files. Its entire view of the world is the text already printed in the session. This single fact decides whether your goal works or runs in circles, and the next section is about getting it right.

Under the hood, `/goal` is a wrapper around a Stop hook scoped to your session. If you have read the [hooks guide](/posts/claude-code-hooks-complete-guide), this is the prompt-based Stop hook with the setup done for you. You do not have to write any hook configuration; you just type the condition.

## Setting, checking, and clearing a goal

The same command does everything depending on what you pass it.

**Set a goal** by running `/goal` followed by the condition:

```text
/goal all tests in test/auth pass and the lint step is clean
```

Setting it starts a turn straight away with the condition as the instruction, so you do not send a separate prompt after. While it runs, a `◎ /goal active` indicator shows how long it has been going.

**Check status** by running `/goal` with nothing after it. You see the condition, how long it has run, how many turns were evaluated, the tokens spent, and the evaluator's most recent reason, so you can see what Claude is working toward next.

**Clear it early** with `/goal clear`. The words `stop`, `off`, `reset`, `none`, and `cancel` all work the same way, and starting a new conversation with `/clear` also removes it.

**Run it without sitting there** using non-interactive mode. This runs the whole loop in one command:

```bash
claude -p "/goal CHANGELOG.md has an entry for every PR merged this week"
```

Press Ctrl+C to stop a non-interactive goal before it finishes. One more useful behavior: if a session ends while a goal is still active, resuming that session with `--resume` or `--continue` brings the condition back, though the turn count, timer, and token baseline start fresh. A goal that was already met or cleared does not come back.

## How to write a condition that holds up

Because the evaluator only sees the text in the session, the condition has to be something Claude can prove by what it prints. "All tests in `test/auth` pass" works, because Claude runs the tests and the result appears in the transcript for the evaluator to read. "The code is good" does not work, because nothing Claude prints proves it.

A condition that survives many turns usually has three parts:

- **One measurable end state.** A test result, a build exit code, a file count, an empty queue. Something with a clear yes or no.
- **A stated check.** How Claude should prove it, such as `npm test exits 0` or `git status is clean`. You are telling it what evidence to put in the transcript.
- **The constraints that matter.** Anything that must not change along the way, like "no other test file is modified".

The condition can be up to 4,000 characters, so there is room to be specific. There is also a simple way to stop a goal from running forever: put a limit in the condition itself, such as `or stop after 20 turns`. Claude reports progress against that clause every turn, and the evaluator judges it from the conversation like everything else. For any goal you are not watching closely, add a clause like this. It is the difference between a task that ends and a task that keeps spending tokens.

## /goal compared to the autonomous options you already had

Claude Code already had a few ways to keep working without you. They are not the same thing, and picking the wrong one is a common mistake. Here is the official comparison, in plain terms:

| Approach | Next turn starts when | Stops when |
|---|---|---|
| `/goal` | The previous turn finishes | A model confirms the condition is met |
| `/loop` | A time interval passes | You stop it, or Claude decides it is done |
| Stop hook | The previous turn finishes | Your own script or prompt decides |
| Auto mode | (within a single turn) | Claude judges the work done |

The short version: use `/goal` when there is a clear finish line a model can confirm from the transcript. Use [`/loop`](/posts/claude-code-routines-guide) when you want something re-run on a time interval rather than until a condition holds. Use a Stop hook when you need your own deterministic script to decide. Auto mode is a different layer: it removes the per-tool approval prompts inside a turn, while `/goal` removes the per-turn stop. They are meant to be used together, auto mode so each turn runs without clicking approve, `/goal` so the turns keep coming until the work is done.

This is also different from [Claude Code Outcomes](/posts/claude-code-outcomes-guide), which grades an agent's work against a rubric. `/goal` is a yes-or-no gate on a single condition, not a graded score. If you want quality scoring, that is Outcomes; if you want a session to keep going until one thing is true, that is `/goal`.

## Agent View: the screen for watching all of this

Once a session can run on its own for a long time, you naturally want to run more than one. Before, that meant several terminal tabs, maybe a tmux grid, and keeping track in your head of which one needed you. Agent View replaces that.

It is a single screen in the CLI that shows your running sessions as a list. Each row shows the session, whether Claude needs your input, the contents of its last response, and when you last interacted with it. You open it by pressing the left arrow from any session, or by running `claude agents` from the terminal.

Sessions show a status: **Running** when working, **Blocked** when waiting on you for a decision or input, and **Done** when finished and ready for review. You can select a session to peek at its last turn. If it is blocked on a decision, you answer inline right there and it continues. When you want the full transcript, press Enter to attach to that session directly. The point is that you only step into a session when it actually needs you, instead of watching all of them.

Agent View is a research preview, available on Pro, Max, Team, Enterprise, and the Claude API plans. Usual rate limits apply.

## Background sessions tie the two together

The piece that connects `/goal` and Agent View is background sessions. A session running a goal does not need your terminal, so you can send it to the background and free the terminal for something else.

Two ways to do that:

- Run `/bg` inside an active session to send the current one to the background.
- Start one already in the background with `claude --bg` followed by the task, which begins a fresh session without attaching to it.

Put together, the workflow is: start a few tasks with `/goal` and a sensible turn limit, send them to the background, and use Agent View as the dashboard. Each one runs until its condition is met. You check in only when a row turns Blocked or Done. That is the whole loop, and it is why these features make more sense learned as one thing than three.

## Requirements and limits worth knowing first

- **Version.** `/goal` needs Claude Code v2.1.139 or later. Agent View arrived in the same update.
- **Trust and hooks.** `/goal` only runs in a workspace where you have accepted the trust dialog, because the evaluator is part of the hooks system. It is also unavailable if `disableAllHooks` is set at any settings level, or if `allowManagedHooksOnly` is set in managed settings. In each case it tells you why rather than failing quietly.
- **One goal per session.** Setting a new goal replaces the old one. There is no goal inside a goal and no queue of goals.
- **The evaluator cannot act.** It does not call tools. It only judges what is already in the conversation. Conditions that depend on something Claude never surfaced will never be marked done.
- **Cost.** The evaluation runs on the small fast model for your provider and is usually small next to the main work, but it is not zero, since it runs after every turn. A turn limit in the condition keeps this bounded.

## When to use it, and when not to

**Good fits**, all from the kind of work the documentation describes:

- Migrating a module to a new API until every call site compiles and the tests pass
- Implementing a design doc until all of its acceptance criteria hold
- Splitting a large file into smaller modules until each is under a size budget
- Working through a labeled issue backlog until the queue is empty

What these share is a finish line that shows up in the transcript on its own.

**Poor fits:**

- Tasks with no clear end state, where "done" is a judgment call. The evaluator needs something concrete.
- Anything whose completion cannot appear in the conversation. If Claude cannot show it, the evaluator cannot confirm it.
- Open-ended exploration. If you do not know what done looks like, you cannot write the condition, and a plain interactive session is better.

For large work, a good order is to plan it first and only then turn on autonomy. The [Ultraplan guide](/posts/claude-code-ultraplan-guide) covers planning a big change before you run it, which pairs well with handing the agreed plan to a goal.

## Frequently asked questions

### What is the /goal command in Claude Code?

It sets a completion condition and Claude Code keeps taking turns until a separate fast model confirms, from the conversation, that the condition is met. Then it stops on its own. It needs v2.1.139 or later.

### How is /goal different from plan mode?

Plan mode is about deciding what to do before doing it. `/goal` is about not stopping until a stated end state is reached. They are complementary: plan the change, then set a goal to carry it out.

### How is /goal different from Claude Code Outcomes?

Outcomes grades work against a rubric and gives you a score. `/goal` is a single yes-or-no condition that decides whether the session keeps going. Use Outcomes for quality scoring, `/goal` for "keep going until this one thing is true". The [Outcomes guide](/posts/claude-code-outcomes-guide) covers the grading approach.

### Does /goal cost extra?

There is no separate fee, but the evaluator runs after every turn on your small fast model, so it adds some token use. It is usually small next to the main turns. A turn limit in the condition keeps it predictable.

### How do I open Agent View?

Press the left arrow from any session, or run `claude agents` from the terminal. It lists your sessions with their status and last response.

### Is Agent View free?

It is a research preview on Pro, Max, Team, Enterprise, and the Claude API plans, and the usual rate limits apply.

## Where to go next

`/goal` is a thin layer over a Stop hook, so if you want to control the evaluation yourself, the [hooks guide](/posts/claude-code-hooks-complete-guide) is the deeper version. If what you actually want is scheduled work rather than work that runs until a condition holds, [Routines](/posts/claude-code-routines-guide) is the better fit. And if a goal session feels slower or less capable than it used to, the [Claude Code slow or worse diagnose and fix guide](/posts/claude-code-slow-fix) is the right first stop. Start with one goal, give it a turn limit, watch it once in Agent View, and add a second only after the first one ends the way you expected.
