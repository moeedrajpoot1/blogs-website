---
title: "Claude Code Skills vs MCP vs Hooks vs Plugins: Decision Matrix"
description: "Claude Code has 5 real primitives: Skills, MCP, Hooks, Plugins, Subagents. Plain guide with a decision tree and Anthropic's own trigger table."
pubDate: 2026-09-18
author: "Muhammad Moeed"
tags: ["claude-code", "claude", "tutorials"]
keywords: [
  "claude code skills vs mcp",
  "claude code hooks vs skills",
  "claude code plugin vs skill",
  "claude code skills vs subagents",
  "claude code skills vs commands",
  "claude code hooks vs mcp",
  "claude code primitives decision matrix",
  "when to use skills vs hooks",
  "when to use mcp vs skills",
  "claude code plugin marketplace"
]
featured: true
---

You have written a `deploy.md` file. Or you are staring at Anthropic's docs wondering if you should install an MCP server, write a hook, or just add a slash command. This is one of the most common "which one do I use" questions on r/ClaudeAI right now, and the answer is easier than the docs make it sound.

This guide gives you a **decision tree**, Anthropic's own **trigger table** (verbatim), a **side-by-side comparison table** for every primitive, and **six "X vs Y" sections** matching the exact queries people search for. Written in plain English, if you have never shipped a Claude Code hook before, you will still know which one to pick by the end.

## Quick answer

Anthropic themselves publish a one-line rule per primitive on the "Extend Claude Code" features overview page. Copy this into a note:

- **Convention wrong twice** → CLAUDE.md
- **Keep typing the same prompt** → user-invocable Skill
- **Same playbook pasted three times** → Skill
- **Keep copying from a system Claude cannot see** → MCP server
- **Side task floods your conversation** → Subagent
- **Want it to happen every time without asking** → Hook
- **Second repo needs the same setup** → Plugin

And one enforcement rule that catches almost everyone:

> An instruction like "never edit .env" in CLAUDE.md or a skill is a request, not a guarantee. A PreToolUse hook that blocks the edit is enforcement. If a rule must hold every time, make it a hook rather than a prompt instruction.

## Wait, 5 primitives or 6? A note on slash commands

You might expect slash commands to be on this list. **They are not, anymore.** Anthropic officially merged custom slash commands into Skills. A file at `.claude/commands/deploy.md` and a folder at `.claude/skills/deploy/SKILL.md` **both** create `/deploy` and work the same way. The commands form is still supported for legacy reasons, but new content should live in `.claude/skills/`. So the real primitive count is five.

## The five primitives in plain words

### Skills

A folder with a `SKILL.md` file inside. The frontmatter has a `name` and a `description`. The Markdown body has the actual instructions Claude follows.

**Analogy:** a runbook on a shelf, not a poster on the wall. Claude only opens it when the job matches.

Claude reads the description on every turn and auto-invokes the skill if it matches. Or you type `/skill-name` yourself. The name and description are always in the context (~100 tokens per skill at session start), but the full body only loads when the skill is triggered. That is why you can drop huge reference material in a skill without burning your weekly limit.

**Best for:** repeatable procedures, style guides, deploy workflows, review checklists. Anything you keep pasting into chat.

**Worst for:** hard enforcement. If Claude decides to skip your skill's instructions, it can. Skills are a request, not a guarantee.

### MCP servers

A separate process (local or remote) that speaks the Model Context Protocol. It gives Claude Code new tools like "search the Notion database" or "run this SQL query." Auth is handled server-side, so Claude never sees your API keys.

**Analogy:** USB-C for AI. A standard socket that plugs Claude into any external system that speaks the protocol.

Anthropic's own one-liner: **"MCP handles connectivity; Skills handle expertise."** MCP gives Claude *access* to a system. A paired skill explains *how your team uses it*.

**Best for:** connecting Claude to something it cannot reach today: database, Slack, browser, internal API, GitHub, Google Drive.

**Worst for:** explaining how to do something (that is a Skill's job). Or enforcing policy (that is a Hook's job).

### Hooks

Small scripts Claude Code runs automatically at specific moments in a session: before a tool call, after a tool call, on session start, when Claude finishes replying. The harness runs them, not the model. If a hook exits with code 2, the next action is **blocked, no matter what the model wants to do**.

**Analogy:** git pre-commit hooks or middleware. The system runs them on an event regardless of what anyone else says.

**Best for:** rules that must hold every time. Block `.env` writes. Run Prettier after every edit. Send a Slack notification when Claude finishes. Reject any Bash command starting with `rm -rf`.



**Worst for:** anything the model should interpret or adapt. Hooks are deterministic and blind. Also invisible to Claude, if you want the user to browse or discover it, use a skill or a slash command.

For a deep dive: [Claude Code Hooks Tutorial](/posts/claude-code-hooks-tutorial).

### Plugins

A folder with a `.claude-plugin/plugin.json` manifest that bundles skills, hooks, commands, MCP servers, and subagents into one installable package. Distributed through marketplaces like `claude-plugins-official`. Installed with `/plugin install <name>@<marketplace>`.

**Analogy:** an npm package or a VS Code extension for Claude Code. The packaging wrapper around everything else.

**Best for:** sharing a working setup across multiple repos, teammates, or a public marketplace. Versioning, semver dependencies, namespaced skills like `/my-plugin:deploy`.

**Worst for:** quick personal iteration. Start standalone in `.claude/`, and convert to a plugin only when you are ready to share.

### Subagents

A separate Claude session with its own context window, its own system prompt, its own tool access, and its own model. It runs a side task and returns only a summary to the main conversation.

**Analogy:** a junior researcher you send off with a task. They come back with a one-page brief, not the whole stack of PDFs.

**Best for:** side tasks that would flood main context: log grepping, file scanning, exploratory reads, big-repo searches. Also for parallelism if you want two workstreams at once.

**Worst for:** iterative work where you need frequent back-and-forth. Non-fork subagents start fresh with no history, no output style, no CLAUDE.md, you lose all that. For work where planning, implementation, and testing must share state, stay in the main conversation.

## Head-to-head comparison table

| Dimension | Skills | MCP | Hooks | Plugins | Subagents |
|---|---|---|---|---|---|
| **Token cost** | ~100 tokens each at start; <5k body on invoke | Tool names at start; schemas on demand; 25k output cap per call | Zero (command/http); prompt hooks = 1 LLM call | Sum of what it bundles | Own context window |
| **When it loads** | Metadata always; body on invoke | Server connects at session start | On the specific lifecycle event | When enabled | On delegation |
| **Can it block an action** | No | No | **Yes** (exit code 2) | Only via bundled hooks | No |
| **Config location** | `.claude/skills/<name>/SKILL.md` | `.mcp.json` or `~/.claude.json` | `settings.json` `hooks` block | `.claude-plugin/plugin.json` | `.claude/agents/<name>.md` |
| **Install method** | Drop a file | `claude mcp add <name> <url>` | Edit `settings.json` | `/plugin install <name>@<market>` | Drop a Markdown file |
| **Discoverable to Claude** | Yes (via description) | Yes (via tool pool) | **No** (invisible) | Via bundled parts | Yes (via description) |
| **Portable across surfaces** | No (Claude Code only) | Protocol yes, config no | Claude Code only | Claude Code only | Claude Code only |
| **Security scope** | Additive instructions | Sandboxed on API; full network in CC | Runs with your shell privileges | Marketplace-vetted commit SHAs | Own permissions + tool pool |

## Six "X vs Y" comparisons (in plain words)

### Skills vs MCP

**Key difference:** Skills are instructions Claude reads. MCP is a wire protocol that gives Claude *tools* to reach external systems.

- **Pick a Skill when** you are explaining how to do something: a workflow, a style guide, a checklist.
- **Pick MCP when** Claude needs to reach something outside its sandbox: a database, Slack, a browser, an internal API.
- **Use them together:** install the Notion MCP server for *access*, and write a Skill that explains your team's Notion schema and naming rules for *expertise*.

### Skills vs Hooks

**Key difference:** A Skill is a request Claude *may* follow or override. A Hook is deterministic, the harness runs it on the event, whether Claude wants it to or not.

- **Pick a Skill when** you want Claude to read and interpret procedural knowledge: deploy checklists, code review rules.
- **Pick a Hook when** the action must happen every time: lint after every edit, block `.env` writes, notify on Stop.
- **Use them together:** a skill can walk Claude through a deploy checklist; a `PreToolUse` hook can block writes to `terraform.tfvars` even if the skill forgets to mention it.

### Skills vs Plugins

**Key difference:** A Skill is the *content* (one folder with a `SKILL.md`). A Plugin is the *packaging* layer that bundles skills + hooks + subagents + MCP + slash commands for sharing.

- **Pick a Skill (standalone)** when you are one person or one team iterating quickly. Just drop files in `.claude/skills/`.
- **Pick a Plugin when** a second repo, a teammate, or a marketplace needs to install the same setup with versioning.
- Anthropic's guidance: **start standalone, convert to plugin when you are ready to share.**

### Skills vs Subagents

**Key difference:** A Skill loads content *into your main context* and its instructions persist across turns. A Subagent runs in its own *isolated* context and returns only a summary.

- **Pick a Skill when** the workflow needs iterative back-and-forth in the main conversation.
- **Pick a Subagent when** the side task would flood main context with logs, search results, or file contents you will not reference again. Also when you need parallelism or isolation.
- **Common mistake:** using a non-fork subagent for planning + implementation + testing. The subagent starts fresh with no history, planning context is lost. Stay in the main conversation for stateful work.

### Skills vs Commands

**Same primitive now.** A file at `.claude/commands/deploy.md` and a folder at `.claude/skills/deploy/SKILL.md` both create `/deploy`.

- **Always use the Skills form for new content.** It supports YAML frontmatter, bundled resources, and model auto-invocation via the description.
- The `.claude/commands/` form still works for legacy repos, but it is not being extended.

### Hooks vs MCP

**Key difference:** MCP adds new tools Claude can *choose* to call. Hooks are harness-side interceptors that run *automatically* on lifecycle events and can block or transform behavior. They live on different layers of the agentic loop, MCP extends capabilities, Hooks enforce policy.

- **Pick a Hook when** you need deterministic behavior on an event.
- **Pick MCP when** you need Claude to reach a system it cannot touch today.
- **Use them together:** an MCP server exposes a `send_slack_message` tool; a `PostToolUse` hook on that tool logs every notification to your audit trail.

## The decision tree

Adapted from Anthropic's own features-overview + hooks-guide + sub-agents docs. Read top to bottom and stop at the first `IF` that matches:

```
IF you want a rule to ALWAYS hold regardless of what the model decides
   -> HOOK (PreToolUse; exit code 2 is unconditional)

ELSE IF Claude needs to reach a system it literally cannot touch
   -> MCP SERVER (connectivity)
   -> and pair it with a SKILL that explains YOUR team's conventions

ELSE IF you keep pasting the same procedure or reference into chat
   -> SKILL
   -> Invoke via /skill-name, or let Claude auto-invoke via its description

ELSE IF the side task would flood main context with output
       you will not reference again
   -> SUBAGENT (own context window, returns only summary)
   -> BUT if the task needs iterative back-and-forth, stay in main context

ELSE IF you have skills + hooks + subagents + MCP that a second
       repo or teammate also needs
   -> PLUGIN (packaging + versioning + marketplace distribution)

ELSE IF the wrong convention has been used twice in the same repo
   -> CLAUDE.md (keep under 200 lines; move procedures out to skills)
```

## Common confusions (and how to avoid them)

**"I put 'never edit .env' in CLAUDE.md, why did Claude still edit it?"** CLAUDE.md and Skills are requests the model can override. Only a `PreToolUse` hook is real enforcement. This is Anthropic's own wording.

**"I installed a Notion MCP server but Claude still fumbles our schema."** MCP handles connectivity; you also need a Skill that explains your team's schema and naming rules. Access without expertise fails.

**"My CLAUDE.md is 800 lines and Claude is ignoring most of it."** Anthropic's best-practices doc explicitly caps CLAUDE.md at ~200 lines and warns that bloated files cause the model to skip instructions. Move procedural content into Skills.

**"Skills save tokens at execution, right?"** No. The saving is at session *start*, only the ~100-token description is loaded until the skill is triggered. Once invoked, a Skill's body sits in context like any other message.

**"Are slash commands and skills different things?"** Not anymore. Slash commands were merged into Skills. `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` both produce `/deploy`.

**"Is a Plugin a runtime primitive?"** No, it is a packaging layer. What actually runs are the skills, hooks, MCP servers, subagents, and commands inside it.

**"I put my planning in a subagent and it forgot everything."** A non-fork subagent starts fresh with no history, no CLAUDE.md, no output style. Use it only for side tasks that do not need the parent's context. For stateful multi-phase work, stay in the main conversation.

## FAQs

### What is the difference between Claude Code skills and MCP servers?

Skills are instructions Claude reads (procedural knowledge, style guides, workflows). MCP is a protocol that gives Claude *tools* to reach external systems (database, Slack, browser). Anthropic's own line: "MCP handles connectivity; Skills handle expertise." Use them together, install the MCP server for access, write a skill that explains your team's schema.

### What is the difference between Claude Code hooks and skills?

A Skill is a request Claude may follow or override. A Hook is deterministic, the harness runs it on a lifecycle event, whether Claude wants it to or not. If a rule must hold every time (block `.env`, run linter after every edit), it must be a hook. If it is guidance you want the model to interpret, it is a skill.

### What is the difference between Claude Code plugins and skills?

A Skill is the content (one folder with `SKILL.md`). A Plugin is the packaging that bundles skills + hooks + subagents + MCP servers + slash commands into one installable unit with versioning. Start standalone in `.claude/`, convert to a plugin when you want to share across repos or a marketplace.

### What is the difference between Claude Code skills and subagents?

A Skill loads its content into your main context and persists across turns. A Subagent runs in its own isolated context window and returns only a summary. Use a Skill for iterative back-and-forth. Use a Subagent when the side task would flood main context with logs, file contents, or search results you will not reference again.

### Are slash commands still separate from skills?

No. Anthropic merged custom slash commands into Skills. Both `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` produce `/deploy` and work the same way. New content should live in the Skills form; the legacy commands form is still supported but not being extended.

### Do Claude Code hooks work in bypassPermissions mode?

Yes. Even when Claude Code runs with `--dangerously-skip-permissions`, a `PreToolUse` hook that exits with code 2 still blocks the tool. Hooks are enforcement above the permissions layer.

### How much do MCP servers cost in Claude Code tokens?

Anthropic does not publish a per-server figure. Community estimates put tool-schema overhead at a few hundred to ~3,500 tokens per server, and heavy multi-server setups can consume 18,000-42,000+ tokens per turn from schemas alone. MCP tool *output* is capped at 25,000 tokens (`MAX_MCP_OUTPUT_TOKENS`) with a warning at 10,000.

### Can I put a hook inside a skill?

Yes. Skills can declare hooks in their YAML frontmatter. When the skill is invoked, its hooks register too. Same for allowed-tools, a skill can pre-approve certain tools while active. This makes skills a convenient way to ship a mini-plugin (instructions + hooks + tool grants) without going through the full plugin format.

## What we still do not know

- Exact per-server context overhead for a connected MCP server, no official figure.
- Order-of-fire when a user prompt arrives: whether `UserPromptSubmit` fires before or after skill matching. Docs say only "before Claude processes", pairwise ordering is not stated.
- Per-invocation token price for a subagent. Docs describe context sizing and the 15k combined-description warning but no cost formula.
- Whether subagents launched via the Task tool inherit `PreToolUse` hooks, GitHub issue #27661 says no; docs say yes. Unresolved.

## Where to go next

- [Claude Code Hooks Tutorial](/posts/claude-code-hooks-tutorial): deep dive on the 25+ hook events and the exit-code-2 rule.
- [Claude Code Skills Complete Guide](/posts/claude-code-skills-complete-guide): how to write and share a Skill.
- [MCP Apps vs OpenAI Apps SDK](/posts/mcp-apps-vs-openai-apps-sdk): MCP explained against the closest alternative.
- [Claude Code Auto Mode + Containment Escape](/posts/claude-code-auto-mode-default-guide): how hooks and permission modes sit on top of each other.
- [Claude Code Weekly Limit Cut Sept 14](/posts/claude-code-weekly-limit-september-2026): why the token-cost differences between primitives now matter more than they used to.

**Last updated: September 18, 2026.** I will re-check this page when Anthropic publishes an official per-server MCP overhead figure or clarifies subagent hook inheritance.
