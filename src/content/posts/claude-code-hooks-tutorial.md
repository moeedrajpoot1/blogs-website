---
title: "Claude Code Hooks Tutorial: Events, settings.json, and Examples"
description: "Claude Code hooks let you block risky commands, auto-format code, and inject project context. Plain guide to events, settings.json wiring, and 5 examples."
pubDate: 2026-09-02
author: "Muhammad Moeed"
tags: ["claude-code", "claude", "tutorials"]
keywords: [
  "claude code hooks tutorial",
  "claude code hooks",
  "claude code hooks settings.json",
  "claude code pretooluse hook",
  "claude code posttooluse hook",
  "claude code hook exit code 2",
  "claude code block rm command hook",
  "claude code prettier hook",
  "claude code sessionstart hook",
  "how to write claude code hook"
]
featured: true
---

If you have used Claude Code for even a week, you have probably wished for one of these three things: **"Please stop deleting files without asking me"**, **"Please run Prettier every time you edit a JS file"**, or **"Please remember the two build tools we use whenever you start a new session"**.

All three of those are exactly what a **hook** is for. A hook is a small script — a shell script, a Python script, a one-line command, or even an HTTP call — that Claude Code runs automatically at a moment you pick. Some hooks can watch. Some can decide. And a few can say **"no, do not do that"** and stop Claude in its tracks.

This guide is a beginner-friendly walk-through: what a hook actually is, the events you can hook into, how to wire one into `settings.json` correctly (with the two gotchas that trip up almost everyone), five real hooks you can copy today, and the security warning Anthropic itself puts on the docs.

## Quick answer

- **A hook is a tiny script Claude Code runs automatically at a moment you pick**, such as "before every Bash command" or "when a session starts."
- **You wire hooks up in `settings.json`** under a top-level key called `hooks`, one array per event.
- **The most common events are** `PreToolUse` (before a tool runs), `PostToolUse` (after), `UserPromptSubmit`, `SessionStart`, and `Stop`.
- **To BLOCK a Claude action from a hook, exit with code 2.** Not code 1. This is the single biggest mistake people make.
- **Hooks run with your full user permissions**, so treat them the same way you would treat any script you paste from the internet.

## What is a hook (in plain words)

Think of Claude Code as a co-worker sitting next to you. Every time they are about to do something — save a file, run a shell command, send a message — they walk past a **doorway**. A hook is a security camera you can put on any doorway.

Some cameras just record ("log every Bash command that runs"). Some cameras raise their hand ("hey, this file has `.env` in the name — do not touch it"). And some cameras hand you a note when you enter the room ("welcome back; remember, we use Bun, not npm").

The camera does not have to be a real security system. It can be:

- A **one-line shell command** (`jq -r '.tool_input.command' >> ~/.claude/log.txt`)
- A **bash or Python script** on your disk
- An **HTTP POST** to a service you run
- Even a **small model call** — Claude Code can ask another Claude to check the action for you

You pick the moment. Claude Code fires the script for you.

## The events you can hook into

Claude Code exposes more than 20 events. Here are the 8 you will actually use most often. Everything else is listed at the end for reference.

| Event | When it fires | Can it block? |
|---|---|---|
| **PreToolUse** | Before Claude runs any tool (Bash, Edit, Write, etc.) | Yes — exit 2 stops the tool |
| **PostToolUse** | After a tool call succeeds | No — the tool already ran |
| **UserPromptSubmit** | When you press Enter on a prompt | Yes — exit 2 erases the prompt |
| **SessionStart** | When a session begins or resumes | No — but its stdout is added to Claude's context |
| **SessionEnd** | When a session closes | No — cleanup only |
| **Stop** | When Claude finishes replying | Yes — exit 2 forces Claude to continue |
| **Notification** | When Claude Code sends a notification (idle, permission prompt, etc.) | No — for pinging you on your desktop |
| **PreCompact** | Right before Claude auto-compacts the conversation | Yes — exit 2 blocks the compaction |

The most powerful pair is `PreToolUse` (to block) and `PostToolUse` (to react). Almost every useful hook is one of those two.

## The `settings.json` shape

Hooks live in a top-level key called `hooks`. Each event has an array. Each array item is a **matcher group** with a filter (like `Bash`, or `Edit|Write`) and one or more scripts to run.

Here is the shape, with three real hooks wired at once — a `rm` blocker, a Prettier formatter, and a cleanup script on Stop:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.sh",
            "timeout": 600
          }
        ]
      },
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/lint-check.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/cleanup.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

A few things worth knowing:

- **`type` is required.** Values: `command`, `http`, `mcp_tool`, `prompt`, or `agent`. If you forget it, the hook is silently dropped (a real GitHub issue people file over and over).
- **`matcher` filters which tools trigger the hook.** For tool events, it matches the tool name. `Bash`, `Edit`, `Write`, `mcp__github__*` all work. On events like `SessionStart` or `Notification`, the matcher matches something else (see below).
- **`if` is a finer-grained filter** using the same syntax as Claude Code's permission rules. `Bash(rm *)` fires the hook only when the Bash command starts with `rm`. It only works on tool events.
- **`timeout` is in seconds.** Default is 600 for command/http/mcp_tool hooks. A timed-out `PreToolUse` hook does **not** block the tool — the tool just runs.
- **`$CLAUDE_PROJECT_DIR` is an environment variable Claude Code exports** so your hook scripts can use paths that work no matter where the user runs Claude from.

## Exit code 2 — the one big gotcha

This is the mistake almost everyone makes on their first hook. **Exit code 1 does not block.** Only exit code 2 does.

- **Exit 0** = success. If your hook wrote JSON to stdout, Claude Code parses it. Otherwise it does nothing.
- **Exit 1** = a normal Unix "failure" code — but Claude Code treats it as **non-blocking**. Your action proceeds.
- **Exit 2** = block. Claude Code stops the action and sends the stderr line back to Claude as the reason.

So the pattern for a hook that says "no" is:

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')
if [[ "$COMMAND" == rm* ]]; then
  echo "Blocked: rm commands are not allowed" >&2
  exit 2
fi
exit 0
```

The `>&2` sends the message to stderr, not stdout. That is how Claude gets the reason.

## Matcher syntax — the second big gotcha

The matcher field looks simple, but it flips modes based on the characters inside it:

- If the matcher contains **only letters, digits, underscore, hyphen, spaces, commas, or pipes** — it is treated as an exact match. `Bash`, `Edit|Write`, `Edit, Write` all work as literal names.
- If the matcher contains **any other character** (`.`, `*`, `^`, `[`, `]`) — it switches to unanchored JavaScript regex.

That flip catches people. `Edit.*` looks harmless, but it is a regex — and because it is unanchored, it matches both `Edit` **and** `NotebookEdit`. If you want an exact regex match, use `^Edit$`.

Comma separators need Claude Code v2.1.191 or newer. Hyphens in exact-match names need v2.1.195 or newer.

Also worth knowing: the matcher matches **different things on different events**. On `PreToolUse`, `PostToolUse`, and friends it matches the tool name. On `SessionStart` it matches the source (`startup`, `resume`, `clear`, `compact`, `fork`). On `Notification` it matches the notification type. Events like `UserPromptSubmit`, `Stop`, `MessageDisplay`, and `CwdChanged` have **no matcher support at all** — putting one in is silently ignored.

## Five hooks you can copy today

### 1. Auto-format every file Claude edits (Prettier)

**Purpose:** every time Claude edits or writes a file, run Prettier on it so the diff stays consistent with your team style.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

**How it works:** `jq -r` pulls the file path out of the JSON that Claude Code passes on stdin. `xargs` hands it to `npx prettier --write`. Requires `jq` on your PATH.

**Caveat:** this catches `Edit` and `Write` tool calls, not files that Bash writes with `echo >> foo.js`. Add a `FileChanged` hook if you want to catch every write.

### 2. Block edits to protected files (`.env`, lockfiles, `.git/`)

**Purpose:** stop Claude from ever touching secrets, lockfiles, or the `.git` directory — even in acceptEdits mode.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/protect-files.sh"
          }
        ]
      }
    ]
  }
}
```

Script `.claude/hooks/protect-files.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
FILE_PATH="${FILE_PATH//\\//}"   # normalize Windows backslashes
PROTECTED_PATTERNS=(".env" "package-lock.json" ".git/")
for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$pattern'" >&2
    exit 2
  fi
done
exit 0
```

Do not forget `chmod +x .claude/hooks/protect-files.sh`. Only catches `Edit`/`Write` — a `Bash(echo >> .env)` bypasses this unless you also add a `Bash` matcher.

### 3. Audit-log every Bash command Claude runs

**Purpose:** an append-only ledger, one Bash command per line. Useful for post-mortems and for spotting habits that waste tokens.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' >> ~/.claude/command-log.txt"
          }
        ]
      }
    ]
  }
}
```

**Caveat:** it is audit-only, not prevention. And the log grows forever — add `logrotate` if you use it long-term.

### 4. Re-inject project context after auto-compaction

**Purpose:** after Claude auto-compacts a long session, some project rules quietly drop out of context. This hook re-injects them.

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: use Bun, not npm. Run bun test before committing. Current sprint: auth refactor.'"
          }
        ]
      }
    ]
  }
}
```

Anything the hook writes to stdout is added to Claude's next context. Swap `echo` for `git log --oneline -5` or `git status -sb` if you want dynamic context.

**Caveat:** `SessionStart` cannot be blocked. For every-session context, `CLAUDE.md` is still the right tool. For environment variables, use `$CLAUDE_ENV_FILE`.

### 5. Desktop notification when Claude needs your attention

**Purpose:** while you are on a different tab and Claude hits a permission prompt or finishes a task, ping your OS notification system.

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

**Platform swaps:**
- Linux: `notify-send 'Claude Code' 'Claude Code needs your attention'` (needs `libnotify-bin`).
- Windows: PowerShell `[System.Windows.Forms.MessageBox]::Show(...)`.

**Caveat on macOS:** osascript notifications go through Script Editor. Grant Script Editor notification permission in System Settings → Notifications, or it fails silently. Also narrow the matcher — an empty matcher fires on every notification type, including `auth_success` and every `quota_auto_resume` event.

## The security warning

Read this twice. From Anthropic's own docs, paraphrased:

**Hooks run with your full user permissions.** A hook can `rm -rf` your home directory, upload your `.ssh/` folder, or drop a login credential grabber into `~/.bashrc`. Claude Code does not sandbox hooks.

Two important protections are built in:

1. **The first time you open a project with `hooks` defined in `.claude/settings.json`, Claude Code shows a trust dialog.** If you say no, none of the project's hooks run.
2. **Non-interactive `-p` and Agent SDK sessions skip that trust dialog** and will run project-committed hooks in folders you have never opened interactively. Review `.claude/` before you point `claude -p` at an unfamiliar repo. Or pass `--settings '{"disableAllHooks": true}'` to disable them all.

Also good to know: hooks **merge** across scopes (user + shared project + local project + managed) instead of overriding. So a project-scoped hook does not "win" over your user-scoped hook — both run in parallel. Exact duplicates are deduplicated so they run once.

## Common mistakes (from GitHub issues + subreddit posts)

- **Exit 1 to block.** Does not work. Only exit 2 blocks. If you forget this, your "safety" hook does nothing.
- **`Edit.*` as a matcher.** Matches `NotebookEdit` too, because the `.` makes it a regex. Use `^Edit$` for exact regex, or the plain string `Edit`.
- **Forgetting `type`.** A hook without `type` is silently dropped.
- **Plain-text stdout with exit 0 to block.** Does not block. The action proceeds. Use exit 2, or output JSON with `hookSpecificOutput.permissionDecision = "deny"`.
- **`$CLAUDE_PROJECT_DIR` in a git worktree.** It stays at the original repo root even after Claude enters a worktree. Read `cwd` from the stdin JSON if you need the actual current directory.
- **Reading `/dev/tty` from a hook.** Hooks run in their own session with no controlling terminal. Use `systemMessage` or `terminalSequence` output instead.
- **Placing `.claude/settings.json` in a subdirectory instead of the repo root.** Hooks are silently absent.
- **Windows backslash paths in `command`.** Bash eats the backslashes and the hook never executes. Use forward slashes or `${CLAUDE_PROJECT_DIR}`.

## FAQs

### What is a hook in Claude Code?

A hook is a small script Claude Code runs automatically at a specific moment — before a tool runs, after a tool runs, when a session starts, when Claude finishes replying, etc. Some events let you **block** the next action if the hook exits with code 2. You wire hooks in a `hooks` block inside `settings.json`.

### How do I create a Claude Code hook?

Three steps: (1) pick an event (`PreToolUse`, `PostToolUse`, `SessionStart`, etc.), (2) write a script that reads the hook JSON from stdin, does its work, and exits with 0 or 2, (3) add the script's path to `.claude/settings.json` under `hooks` → your event name → a matcher group. See the five copy-paste examples above.

### What is the difference between exit code 1 and exit code 2 in Claude Code hooks?

**Exit 2 blocks. Exit 1 does not.** Even though exit 1 is the normal Unix "failure" code, Claude Code treats it as non-blocking and lets the action proceed. If you want your hook to actually stop something, use `exit 2` after printing the reason to stderr.

### Where does the `hooks` key go in Claude Code `settings.json`?

At the top level, alongside `permissions` and other settings. You can put it in `.claude/settings.json` (shared with the team via git), `.claude/settings.local.json` (your machine only), `~/.claude/settings.json` (every project on your machine), or a managed `managed-settings.json` (team-wide). Unlike normal settings, hooks **merge** across scopes rather than overriding — all matching hooks run in parallel.

### How do I block a Bash `rm` command in Claude Code?

Wire a `PreToolUse` hook with `matcher: "Bash"` (or add an `if: "Bash(rm *)"` filter). Have the script read `.tool_input.command` from stdin JSON, check for `rm` at the start, print `"Blocked: rm commands are not allowed"` to stderr, and `exit 2`. Full example is in "Five hooks you can copy today" above.

### Do Claude Code hooks run in `bypassPermissions` mode?

Yes — this is important. Even when Claude Code is running in `bypassPermissions` mode (or with `--dangerously-skip-permissions`), a `PreToolUse` hook that exits 2 still blocks the tool. Hooks are a layer above permissions.

### Do hooks fire for subagents (Task-spawned)?

Sometimes. GitHub issue #88441 reports user `PreToolUse` hooks do not fire for Bash calls inside subagents on some versions. Test in your specific version before assuming subagent Bash is covered.

### How many hooks can I have on one event?

As many as you want. All matching hooks across all settings scopes (user, shared project, local project, managed) run **in parallel** for the same event. Exact duplicates are deduplicated so they only fire once.

## What we still do not know

- The per-event minimum Claude Code version. Anthropic's reference table has that column empty for every event. Only specific matcher values have documented minimums (`quota_auto_resume_*` needs v2.1.234+, comma separators need v2.1.191+, hyphens in exact-match names need v2.1.195+).
- Whether the `PermissionRequest` hook actually fires in `--print` mode. Docs say yes; GitHub issue #88328 (as of v2.1.237) says no.
- The full output-JSON schema for a few less-common events (`TaskCompleted`, `WorktreeCreate`, `MessageDisplay`, `FileChanged`). Anthropic documents the input side but not always the output side.

## The full list of hook events (for reference)

Beyond the 8 above, Claude Code as of Sept 2026 also exposes: `Setup`, `UserPromptExpansion`, `PermissionRequest`, `PermissionDenied`, `PostToolUseFailure`, `PostToolBatch`, `MessageDisplay`, `SubagentStart`, `SubagentStop`, `TaskCreated`, `TaskCompleted`, `StopFailure`, `TeammateIdle`, `InstructionsLoaded`, `ConfigChange`, `CwdChanged`, `FileChanged`, `PreCompact`, `PostCompact`, `PreModelSwitch`, `PostModelSwitch`, `WorktreeCreate`, `WorktreeRemove`, `DirectoryAdded`, `SessionEnd`. Most of these are for tooling authors and MCP server developers — start with the 8 in the main table.

## Where to go next

- [Claude Code Skills Complete Guide](/posts/claude-code-skills-complete-guide) — hooks and skills often ship together in a plugin; here is how skills are structured.
- [Claude Code Auto Mode Default + Sept 1 Containment Escape Rule](/posts/claude-code-auto-mode-default-guide) — hooks are the layer above permission modes; this is how the two fit together.
- [Claude Code Weekly Limit Cut on Sept 14](/posts/claude-code-weekly-limit-september-2026) — hooks that turn off subagent forking or auto mode can save you real tokens.
- [Claude Code Slow Fix](/posts/claude-code-slow-fix) — the wider "make Claude Code cheaper and faster" guide that pairs well with hooks.

**Last updated: September 2, 2026.** I will re-check when Anthropic publishes per-event minimum versions or the missing output schemas.
