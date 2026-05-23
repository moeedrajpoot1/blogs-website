---
title: "How Anthropic's Own Teams Use Claude Code"
description: "A plain-English breakdown of Anthropic's internal report on how its own teams use Claude Code: the real workflows, the numbers, and what you can copy."
pubDate: 2026-05-19
author: "Moeed Rajpoot"
tags: ["claude-code", "ai-agents", "tutorials"]
keywords: ["how anthropic teams use claude code", "anthropic claude code teams pdf", "claude code workflows", "claude code use cases", "how anthropic uses claude code", "claude code best practices", "claude code at anthropic"]
heroImage: "/posts/how-anthropic-teams-use-claude-code-hero.png"
heroAlt: "Title card for the article How Anthropic's own teams use Claude Code, with the ten internal teams covered listed below the title"
featured: false
---

Anthropic put out a report on how its own staff use Claude Code. It is based on interviews with their internal power users across ten teams, and it is one of the few honest looks at what daily use actually looks like inside the company that builds the tool. A lot of people have been searching for the PDF, so this article does two things: it gives you a clear summary of what is in it, and then it pulls out the parts that are useful even if you are one person and not a company with a large monorepo.

The original document is [How Anthropic teams use Claude Code](https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf) (PDF). What follows is my reading of it, not a copy of it.

> Anthropic interviewed Claude Code power users on ten internal teams, including non-technical ones like legal and marketing. The recurring lessons are simple: write a detailed CLAUDE.md, commit checkpoints often so you can revert, treat Claude Code as a partner you iterate with rather than a one-shot machine, paste screenshots instead of describing things, and learn which tasks can run on their own versus which need you watching. The biggest jumps in productivity came from people who were not engineers.

![Title card for the article How Anthropic's own teams use Claude Code, with the ten internal teams covered listed below the title](/posts/how-anthropic-teams-use-claude-code-hero.png)

## What this report actually is

It is not marketing. It reads like a set of internal interviews written up honestly, including the parts that did not work. Ten teams are covered. Some are what you would expect, like the team that builds Claude Code itself. Others are not: the legal department and a one-person growth marketing team are in here, and their sections are some of the most interesting because they show what the tool does in hands that do not write code for a living.

I will go team by team, keep each one short, and then spend the second half on the patterns that repeat, because the patterns are the part worth keeping.

## Data Infrastructure

This team organizes company data. The story people quote most is a Kubernetes outage: clusters stopped scheduling new pods, and instead of pulling in the networking team, they pasted dashboard screenshots into Claude Code and let it walk them through the cloud console one menu at a time until they found the real cause, which was pod IP address exhaustion. It then gave them the exact commands to add a new IP pool.

They also taught the finance team to write plain-text files describing a data workflow in normal English, then run those files through Claude Code to execute the whole thing. People with no coding background could describe steps like "query this dashboard, run these queries, produce an Excel file" and get a working result. New hires use Claude Code to find their way around a large codebase by reading the CLAUDE.md files. Their headline tips: write detailed CLAUDE.md files, use an MCP server instead of a raw CLI when the data is sensitive so access stays controlled, and run sessions where team members show each other how they actually use the tool.

## Product Development (the Claude Code team)

The team that builds Claude Code uses it to build Claude Code. For work on the edges of the product they turn on auto-accept mode and set up a loop where Claude writes code, runs the tests, and keeps going on its own. They let it reach roughly an eighty-percent solution, then take over for the finish. The safety habit they stress is starting from a clean git state and committing checkpoints often, so a wrong turn is a quick revert rather than a mess.

For core business logic they do the opposite and work synchronously, watching it closely with detailed prompts. One often-cited result: Vim key bindings for Claude Code were built mostly by Claude, with the team estimating about seventy percent of the final code came from its own autonomous work. Their main tip is to set up self-checking loops where Claude runs the build, tests, and linter itself, and to learn the difference between tasks that are safe to run unattended and tasks that need you in the room.

## Security Engineering

This team feeds Claude Code stack traces and asks it to trace the control flow through the codebase during incidents. Work that used to take ten to fifteen minutes of manual scanning now takes about five. For infrastructure changes they paste the Terraform plan in and ask, in plain words, what it is going to do and whether they are going to regret it, which makes the security review faster.

They also use it heavily for writing, not just code: it turns scattered docs into runbooks and troubleshooting guides they then reuse as context. A detail that stands out: this one team accounts for about half of all the custom slash commands in the entire monorepo. Their tips are to lean on custom slash commands, to let Claude work and commit as it goes rather than asking narrow one-line questions, and to use it for documentation by giving it writing samples so the output is usable straight away.

## Inference

This team runs the memory system behind Claude's responses, and several members are new to machine learning. They use Claude Code to find which files call a given function, to generate unit tests that include the edge cases they would have missed, and, importantly, to explain machine-learning concepts. Research that used to take an hour of searching now takes ten to twenty minutes, which they describe as roughly an eighty-percent cut. They also have it write test logic in languages they do not know, like Rust, so they do not have to learn a language just to test something. Their advice is practical: first check whether it answers faster than a search engine, start with small code-generation tasks to build trust, then hand it your test writing.

## Data Science and ML Engineering

These teams need good visualization tools but do not want to become front-end developers. They let Claude Code build entire React and TypeScript dashboards, in one case a roughly five-thousand-line TypeScript app, without reading the code themselves, because a visualization app is self-contained and low-risk. For messy refactors and merge conflicts they describe a method worth remembering: commit the current state, let Claude run for about thirty minutes, then either accept the result or throw it away and start fresh. They call this treating it "like a slot machine," and their point is that restarting clean usually beats arguing with a half-wrong attempt. They also moved from throwaway Jupyter notebooks to permanent dashboards they reuse. Second tip: when it overcomplicates something, stop it and ask for a simpler approach, because it tends toward complex solutions by default.

## API Knowledge

This team works on features like PDF support, citations, and web search. They use Claude Code as the first thing they open for any task, asking it which files to look at before they start. It gives them the confidence to fix bugs in unfamiliar parts of the codebase instead of waiting on someone else, and because it runs the latest model snapshots, it doubles as their way of noticing model behavior changes early. Their main tip is the one I would underline for everyone: treat it as a partner you iterate with, not a machine you expect to one-shot the answer, and start with the minimum information rather than front-loading a long explanation.

## Growth Marketing

This is a non-technical team of one, and it is the section I would read first if you are not an engineer. They built an agentic workflow that reads a CSV of existing ads with performance data, finds the weak ones, and writes new variations that fit strict character limits, using two separate subagents, one for headlines and one for descriptions. They built a Figma plugin that generates up to a hundred ad variations by swapping copy, turning hours of manual work into a fraction of a second per batch. They built an MCP server connected to the Meta Ads API so they can ask about campaign performance inside the Claude desktop app. Ad copy that took two hours now takes fifteen minutes. Their tips: look for repetitive work behind an API, split a complex job into focused subagents instead of one giant prompt, and plan the whole thing in a normal Claude chat first before handing the structured prompt to Claude Code.

## Product Design

Designers on this team make front-end and state-management changes directly instead of writing a spec and waiting on engineers. They paste a mockup image in and get a working prototype back, which engineers can then build on. They use it to map out error states and edge cases during design, so problems surface earlier. One concrete example: removing "research preview" wording across the whole codebase, coordinated with legal in real time, took two thirty-minute calls instead of a week. They report having Figma and Claude Code open most of the day. Their tips are honest about the rough edges: get an engineer to help with the first repository setup, write a memory file that says you are a designer who wants small incremental changes and clear explanations, and paste screenshots constantly.

## RL Engineering

This team is the most candid about limits, which is why it matters. They let Claude Code write most of the code for small and medium features while they supervise, ask it to add tests after they make a change, and use it to summarize call stacks instead of reading them by hand. They are clear that debugging results are mixed and that a first attempt fully works only about one-third of the time, so they keep a checkpoint-heavy workflow and revert often. A specific tip: put exact instructions in CLAUDE.md to stop repeated mistakes, for example telling it which test command to use and not to change directories unnecessarily. Their approach is to try a quick one-shot first, and only switch to slow guided collaboration if that fails.

## Legal

The legal team found Claude Code on their own. One member built, in about an hour, a predictive-text speaking app for a family member with a medical condition, using native speech-to-text and voice banks, because existing accessibility tools had gaps. Others built a "phone tree" to route people to the right lawyer and small G Suite apps to track legal review status with a button click instead of a spreadsheet. Their working style is the two-step one that comes up again and again: plan and think in a normal Claude chat, then move to Claude Code and ask it to go one step at a time. As product lawyers, they also flag the obvious risk early: deep MCP integrations touch sensitive systems, and security caution will be a real constraint.

## The patterns that show up on almost every team

If you only keep one section, keep this one. These came up independently across teams that do very different work, which is what makes them worth trusting.

1. **CLAUDE.md is the highest-leverage file you have.** Data Infrastructure, RL Engineering, and Product Design all arrived at the same conclusion separately: the more clearly you write down your tools, conventions, and the kind of help you want, the better the output, and it stays better.
2. **Commit checkpoints and be willing to throw work away.** Clean git state before a run, frequent commits during it, and a fast revert when it goes wrong. The Data Science "let it run thirty minutes, then accept or restart" rule is the same idea: restarting clean usually beats fixing a bad attempt.
3. **It is a partner you iterate with, not a one-shot oracle.** The teams that expected a perfect first answer were disappointed. The teams that gave it the minimum, watched, and steered got the value.
4. **Screenshots are an input, not a fallback.** Dashboards, mockups, error screens, interface targets. Several teams paste images as a normal first step.
5. **Judge the task before you choose the mode.** Edge-of-the-product and prototype work can run on its own. Core business logic needs you watching. Knowing which is which is a skill the product team calls out by name.
6. **Documentation is a first-class use, not a side effect.** Turning scattered docs into runbooks, summarizing a session, generating comments. Some teams get as much value here as from code.
7. **Use MCP and subagents to keep things controlled and focused.** An MCP server instead of a raw CLI when data is sensitive. Separate subagents instead of one prompt that tries to do everything.
8. **The largest jumps came from people who do not code.** Finance, marketing, design, and legal describe entirely new abilities, not just faster versions of old ones.

## What you can take from this if you are not Anthropic

You do not need a giant monorepo or ten teams to use almost any of this. The habits scale down cleanly:

- Write a real CLAUDE.md for your project today, even a short one. Tools, test command, conventions, and the kind of changes you want.
- Start every risky run from a clean git state and commit as you go. This single habit is what makes autonomous runs safe.
- When something is repetitive and sits behind an API, that is your first automation candidate, exactly like the one-person marketing team found.
- Plan in a normal chat, then move the structured prompt into Claude Code. The legal team's two-step process works for solo developers too.
- If a run goes sideways, do not wrestle it. Revert and restart with a better prompt. It is usually faster.

If you want to go deeper on the building blocks these teams keep mentioning, I have separate guides on [CLAUDE.md and hooks](/posts/claude-code-hooks-complete-guide), [Skills](/posts/claude-code-skills-complete-guide), [how skills, MCP, subagents and hooks differ](/posts/claude-code-skills-vs-mcp-vs-subagents-vs-hooks), and [building your first MCP server](/posts/build-your-first-mcp-server).

## The honest parts, kept in

Most write-ups of this report drop the limitations. They are the most useful part for setting expectations. The RL team says a first attempt fully works only about a third of the time. They also note it sometimes puts comments in odd places and makes questionable organization choices. The Data Science team says it tends toward complex solutions and has to be told to do something simpler. Debugging is described as mixed, not magic. None of this is a reason to avoid the tool. It is the reason the checkpoint-and-revert habit exists, and why the teams that do well treat it as a fast collaborator they supervise rather than something they hand a task and walk away from.

## Frequently asked questions

### Is the report public, and where is the PDF?

Yes. Anthropic published it as a PDF, [How Anthropic teams use Claude Code](https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf). This article is a summary and analysis of it, not a replacement for reading it.

### Do you need to be a developer to use Claude Code like these teams do?

No. The legal and growth marketing sections are explicitly about non-technical staff building working tools. Designers make code changes directly. The common starting point for them is getting an engineer to help with first setup, then writing a memory file that explains they want small steps and clear explanations.

### What is the single biggest takeaway?

A detailed CLAUDE.md plus a commit-often, revert-freely habit. Almost every other lesson in the report depends on those two being in place.

### Does any of this apply to a solo developer or small team?

Yes, most of it. Nothing about CLAUDE.md, checkpoints, screenshot input, planning in chat first, or the restart-instead-of-fix rule needs scale. The team-specific parts are the monorepo navigation and cross-team self-service.

### What is CLAUDE.md?

It is a file Claude Code reads automatically that holds your project's context: tools, conventions, test commands, and how you want it to behave. There is a full walkthrough in the [hooks and CLAUDE.md guide](/posts/claude-code-hooks-complete-guide).

## Where to go next

The report is a good map of what is possible. The next step is making one change to your own setup, not ten. Pick the weakest part of your current Claude Code use, write or improve your CLAUDE.md, or adopt the checkpoint habit, and add the next piece once that one is automatic. If you are choosing a tool in the first place, the [Claude Code vs Cursor comparison](/posts/claude-code-vs-cursor) covers where each one fits, and the [Ultraplan guide](/posts/claude-code-ultraplan-guide) covers planning larger work before any of this autonomy is worth turning on. If Claude Code feels slower than it used to, the [diagnose and fix guide](/posts/claude-code-slow-fix) walks through what was actually broken in spring 2026 and what is left in your own setup.
