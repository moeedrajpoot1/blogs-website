---
title: "Claude Code Outcomes: A Friendly Guide to Rubric-Graded Agents"
description: "How Claude Code Outcomes work, why a separate grading agent improves agent quality, and how to write a rubric that catches the failures you actually care about."
pubDate: 2026-05-13
author: "Moeed Rajpoot"
tags: ["claude-code", "tutorials", "ai-agents"]
keywords: [
  "claude code outcomes",
  "claude code outcomes tutorial",
  "claude code rubric",
  "rubric graded agents",
  "claude code grading agent",
  "claude code quality threshold",
  "claude agent eval",
  "agent self check",
  "claude code 2026 features",
  "code with claude 2026"
]
featured: false
---

If you have spent time pushing Claude Code on real work, you have probably hit the same problem I have. The agent does the task. The output looks fine on the surface. You scroll through it, find a small but real mistake on line forty, and now you are stuck in the loop of "almost right, ask again, almost right, ask again". The model is not bad. It just does not know what you actually meant by "done".

Outcomes are how Claude Code fixes that.

An outcome is a rubric — a short, written description of what success looks like for a task — paired with a separate grading agent that checks the work against the rubric after the main agent thinks it is finished. If the work fails the rubric, the grading agent says exactly why, and the main agent gets another pass with that feedback in hand. You stop being the unpaid quality-assurance step.

This post is a friendly walkthrough of what Outcomes are, why the design works, how to write a rubric that catches the failures you actually care about, and the small mistakes to avoid the first few times you try it.

## What an Outcome actually is

An Outcome has three parts.

- A **rubric**. A short document describing what "done" means for a task.
- A **grading agent**. A separate Claude session that scores work against the rubric.
- A **threshold**. The minimum grade the main agent's output has to clear before the work is accepted.

The flow is straightforward.

1. You attach an outcome to a task or a routine.
2. The main agent does the work.
3. The grading agent reads the output, the original task, and the rubric — but not the main agent's reasoning.
4. The grader produces a grade and a written critique.
5. If the grade meets the threshold, you get the output. If it does not, the critique is fed back to the main agent for another pass.

The interesting part is step three. The grader does not see the main agent's chain of thought, only the result. That separation matters more than it sounds.

> **An Outcome is a rubric plus a separate grading agent that scores the main agent's output against the rubric, without seeing the main agent's reasoning. Work that fails the rubric is sent back for another pass with the critique attached.**

## Why a separate grader works better than self-check

The first time you read about Outcomes, the natural question is: why not just ask the same agent to grade its own work?

Two reasons.

The first is anchoring. An agent that has just spent a long context window producing an answer is biased toward thinking that answer is right. Its working memory is full of the steps it took to get there. Self-grading in that state is closer to defending the work than evaluating it. A fresh grader, with no investment in the path, evaluates the destination on its own terms.

The second is exposure. The main agent saw the task, the tools, the partial results, the dead ends. The grading agent sees only what a downstream consumer of the work would see — the final output and the original task. That is the right vantage point for "is this good enough". If a flaw is invisible to the grader, it is also invisible to whoever ends up using the work.

A useful way to think about it. The main agent is the writer. The grading agent is the first reader. Writers are not good editors of their own first drafts. Readers are.

## A small example

Suppose you have a routine that updates your changelog every Friday. The main agent reads the merged PRs from the week, groups them into categories, and writes the changelog entry. Without an outcome, you get whatever the agent produced, and you spot the problems when you read the PR.

With an outcome, you attach a rubric.

```markdown
# Outcome: Friday changelog quality

The changelog entry is accepted if all of the following are true.

1. Every merged PR from the period appears exactly once.
2. Each entry is one line, starts with a verb, and ends with no period.
3. Entries are grouped under exactly these headings, in this order:
   ## Features, ## Fixes, ## Infrastructure, ## Docs.
4. No marketing language. No emojis. No "we are excited to ...".
5. The entry links to the PR number in the form (#1234).

Score 0 to 100. Threshold = 90.
Anything below threshold must list the specific rule it violates.
```

Now when the routine runs, the grading agent checks the output. If the changelog has emojis or skipped a PR, it kicks back to the main agent with a specific note: "Rule 1 violation: PR #1247 is missing. Rule 4 violation: line in ## Features uses marketing language." The main agent has another pass. You read a clean output instead of fixing one.

## When Outcomes earn their keep

Outcomes are not free. The grading agent is a second model call, with its own latency and cost. So the question is when the extra step is worth the price.

Three patterns where Outcomes consistently pay off.

### 1. Repeated tasks where consistency matters

If a routine runs every week and the output is consumed by a downstream process (a CI step, a Slack notification, a doc file), small inconsistencies accumulate. An outcome that enforces format keeps the output consumable session after session.

### 2. Tasks with a clear "done" definition

Some tasks are well-specified. Write a migration script that adds a column. Open a PR with this exact structure. Generate a report grouped by these categories. When "done" has a checkable shape, a rubric maps onto it cleanly.

### 3. Work that goes out to other people

Pull request descriptions, customer-facing summaries, generated docs — anything where you are not the only reader. The cost of a low-quality output is higher when other people see it, so the grader earns its place.

Three patterns where Outcomes are usually overkill.

- **One-off explorations.** If you are poking around a codebase and asking questions, a rubric is friction.
- **Creative or open-ended work.** "Sketch three ideas for the homepage" does not have a 0-to-100 grade. Outcomes flatten work that benefits from being open.
- **Latency-sensitive interactions.** An interactive session with a grading pass after every step would feel terrible. Save outcomes for batch or routine work.

## Writing a rubric that does the work

The rubric is where most of the value lives. A vague rubric will rubber-stamp bad work. A tight rubric will catch real issues. After writing rubrics for a few routines, three rules keep me from drifting.

### Be specific, not aspirational

Bad:

> The output should be clear and high quality.

Good:

> Every paragraph is under five sentences. Every sentence is under thirty words. No paragraph repeats a fact stated in an earlier paragraph.

The bad version is something the grader cannot verify. The good version it can. A rubric is a set of checks, not a set of values.

### Use the rules a careful reviewer would use

Imagine the most careful person on your team reading the output. What would they comment on? Write those comments down as rules. That is your rubric. You are encoding their judgment, not inventing a new one.

### Number the rules and tie failures to them

A grade with no explanation is useless. A grade with "rule 3 violation: line 42 uses passive voice" is debuggable. Number your rules, tell the grader to cite the rule number on any failure, and you can fix the rubric or the prompt with confidence.

### Pick a threshold that allows real failures through

If your threshold is 100, every grader hiccup becomes a re-run. If your threshold is 60, the rubric is decorative. Most of my routines run at 85 or 90 — high enough to catch the real failures, low enough to absorb the noise of a grading model with a slightly different sense of style.

## A few rubric templates to start from

These are starting points, not finished rubrics. Adapt them to the work you actually do.

### Pull request description

```markdown
# Outcome: PR description quality

1. Has exactly three sections, in order: ## Summary, ## Changes, ## Test plan.
2. ## Summary is one paragraph, three to five sentences, plain English.
3. ## Changes is a bulleted list, one bullet per logical change.
4. ## Test plan is a checklist a reviewer can run, with copy-pastable commands.
5. No emojis. No phrases starting with "This PR".
6. Mentions every file path that was modified.

Score 0 to 100. Threshold = 90.
```

### Bug report triage

```markdown
# Outcome: Bug triage quality

1. Every bug has a one-line summary, the affected component, and a priority.
2. Priority is one of [p0, p1, p2, p3] per the policy in TRIAGE.md.
3. p0 and p1 bugs include the user impact in one sentence.
4. Duplicate bugs are linked to the canonical issue.
5. The summary does not include the original ticket text verbatim.

Score 0 to 100. Threshold = 85.
```

### Customer support synthesis

```markdown
# Outcome: Weekly support brief

1. Top 5 topics by volume, ordered. Each has a one-line description.
2. Each topic has 2-3 representative quotes from real tickets.
3. No customer name or PII appears in the brief.
4. The brief is under 400 words.
5. Each topic notes whether volume is up, down, or flat versus the previous week.

Score 0 to 100. Threshold = 90.
```

The shape repeats. Numbered rules. Specific, checkable assertions. A reasonable threshold. The grader can do real work against any of these.

## How Outcomes interact with other Claude Code features

Outcomes are most useful when you combine them with the other features released in 2026.

### Outcomes + Routines

This is the obvious pairing. A scheduled job is exactly the case where a rubric pays for itself, because the same task runs over and over and small drift accumulates. I attach outcomes to almost every [routine](/posts/claude-code-routines-guide) I run.

### Outcomes + Skills

A [skill](/posts/claude-code-skills-complete-guide) describes how to do a task. An outcome describes what a good result looks like. They are complementary. The skill is the recipe. The outcome is the taster at the end of the line.

A neat pattern: keep the rubric inside the skill folder, so the rule for "what good looks like" travels with the rule for "how to do it". When the skill changes, the rubric is right next to it.

### Outcomes + Subagents

If you are spawning [subagents](/posts/claude-code-skills-vs-mcp-vs-subagents-vs-hooks) for parallel work, an outcome attached to each subagent's task gives the parent a clean signal — pass or fail — instead of having to read every subagent's output in detail. The parent only intervenes when a grade is below threshold.

### Outcomes + Managed Agents

If you are building a product on top of Claude with [Managed Agents](/posts/claude-managed-agents-tutorial), Outcomes are part of the same surface area. A grading agent is just another agent run, and you can wire them into your control flow the same way.

## How many retries is too many?

The first time you set up an outcome, the natural question is: if the output fails the rubric, how many times should it try again?

The answer in practice is small. One or two retries. Past that, you usually have a prompt problem, not a grader problem.

A common pattern is: try, grade, if fail try again with the critique, grade again, if still failing return the best of the two with the critique attached. You read the result and decide what to do. Letting an agent retry five or six times against the same rubric burns tokens and rarely produces better work than the second pass.

If a routine is consistently failing on the second pass, that is a signal to fix the prompt or the rubric, not to increase retries. The grader is doing its job. The work upstream of it is the problem.

## Common mistakes the first few times

A few patterns I keep seeing.

- **Rubrics that grade for style only.** "The output should be friendly and clear" is not a check. The grader will rubber-stamp anything that does not actively offend it. Mix style rules with concrete correctness rules.
- **Rubrics that grade for things the agent cannot control.** "The output should match real customer data perfectly." If the input data is noisy, no rubric can produce a high grade. Rubrics measure execution, not luck.
- **Threshold set too high.** 100 means every run is a re-run. The grading model has its own taste. Leave room.
- **Forgetting that the grader is an LLM.** It can hallucinate failures. If you see a re-run that looks fine to you and the critique is wrong, the bug is in the grading prompt, not the work.
- **Treating the grade as ground truth.** The grade is a useful signal, not gospel. For high-stakes work, a human still reads. Outcomes raise the floor; they do not replace the ceiling.

## Best practices that hold up

After a couple of months living with Outcomes on a half-dozen routines, three habits keep paying back.

### Keep rubrics short

A rubric of fifty rules is harder to satisfy and harder to debug than a rubric of seven. Pick the seven things that actually matter to a careful reader. Drop the rest.

### Version the rubric next to the prompt

If the prompt and the rubric live in the same place — a folder, a skill, a routine — you can edit them together. When the rubric stops fitting the work, you fix it right there.

### Read a few failures in full

Once a week, open a run where the grade was below threshold and read the critique. Sometimes the critique is right and the prompt needs work. Sometimes the critique is wrong and the rubric needs work. Either way, you learn.

## Frequently asked questions

**What is Claude Code Outcomes?**
A grading mechanism. You attach a rubric to a task, a separate Claude agent grades the output against the rubric, and the work is retried if the grade falls below a threshold.

**Why is the grading agent separate?**
Because the main agent is anchored to its own work. A fresh agent, without exposure to the main agent's reasoning, evaluates the output more like a downstream reader would.

**Does the grader see the original task?**
Yes. The grader sees the task and the output. It does not see the main agent's intermediate steps.

**How do I write a good rubric?**
Numbered, specific, checkable rules. Style rules and correctness rules mixed. A threshold below 100, usually 85 or 90.

**How many retries should I allow?**
One or two in most cases. Past that, the prompt or the rubric is the problem, not the run count.

**Does this work with Routines?**
Yes, and it is one of the best pairings. Routines run autonomously, and a rubric keeps them from drifting.

**Will Outcomes slow down a session?**
The grading agent adds one extra call per pass, so yes. For routines and batch work it is well worth it. For interactive work it is usually not.

**Can I disable Outcomes for a single run?**
Yes. You can opt out per task if you want. Most people leave them on for routines and off for interactive sessions.

## A short closing thought

The shift Outcomes makes is small to describe and large to feel. Before, you were the grader. Every output came to you, and you decided if it was good enough. After, the model has a written sense of "good enough", and you only read the work that already passed.

The freed time goes somewhere — usually into work you actually wanted to do. The freed attention goes somewhere too — usually into the rubric itself, which becomes a sharper, more honest description of what your team actually values. Writing the rubric is, in a quiet way, one of the most useful exercises an engineering team can do. Outcomes just give you a reason to finally write it down.

If you are running [routines](/posts/claude-code-routines-guide) without rubrics, that is the natural place to start. Pick the routine you trust least. Write five numbered rules describing what a good run looks like. Set a threshold of 85. Re-run it. Read the first failure. The path from there is short.
