---
title: "Claude Code Hooks: A Friendly Guide for Beginners"
description: "Hooks let Claude Code run small commands before and after it does things. This guide explains what they are, how to set them up, and the few mistakes to avoid."
pubDate: 2026-05-04
author: "Moeed Rajpoot"
tags: ["claude-code", "tutorials", "ai-agents"]
keywords: ["claude code hooks", "claude code settings.json", "PreToolUse hook", "PostToolUse", "claude code automation"]
featured: true
---

If you have started using Claude Code on a real project, you may notice that some things you want it to do every time get forgotten. You may have asked it to format your files after editing, or to skip risky commands, and it does well for a while and then drifts.

Hooks are the simple fix for this.

A hook is just a small shell command that the Claude Code app runs for you when something happens. Before a tool runs, after a file gets edited, when the session ends, and so on. Because the app runs them and not the model, hooks are reliable. The model cannot forget them.

This guide walks through hooks step by step. By the end you will have a working format on save hook, you will know all the events you can hook into, and you will know the few small mistakes that trip up most people the first time.

> A hook is a shell command that runs automatically when an event happens in Claude Code. It lives in `settings.json`, it runs in your terminal, and it is the most dependable way to make Claude Code follow a rule every time.

## What hooks are good for

Hooks are useful when you want something to happen every single time, with no exceptions. A few examples that real teams use:

- Run Prettier or Black on a file the moment Claude saves it.
- Block dangerous shell commands before they run.
- Run your tests when a session ends, so nothing broken slips through.
- Add small bits of context to every prompt, like the list of open issues.
- Send a quick message to Slack when a long task finishes.

If you have ever written something like *please always do X* in your `CLAUDE.md` file and felt that the model ignores it half the time, that is a sign you need a hook for that rule instead.

## Where hooks live

Hooks are written inside a file called `settings.json`. There are three of these and they layer on top of each other:

```
~/.claude/settings.json              your personal settings
<repo>/.claude/settings.json         settings shared with your team
<repo>/.claude/settings.local.json   personal overrides (kept out of git)
```

The order is simple. Project settings beat user settings. Local settings beat both. So you can ship one shared `.claude/settings.json` for the whole team, while keeping your own quirks in `settings.local.json`.

## Your first hook in five minutes

Here is a small starter that runs Prettier on any file Claude edits or writes. Drop this into `.claude/settings.json` in any JavaScript or TypeScript project.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=\"$CLAUDE_TOOL_INPUT_file_path\"; case \"$FILE\" in *.ts|*.tsx|*.js|*.jsx|*.json|*.md) npx prettier --write \"$FILE\" 2>/dev/null ;; esac"
          }
        ]
      }
    ]
  }
}
```

What this does, in plain words: every time Claude finishes editing or writing a file, the hook checks if the file is something Prettier knows about. If it is, the hook runs Prettier on it. From now on, Claude cannot leave the codebase unformatted.

The piece that says `$CLAUDE_TOOL_INPUT_file_path` is how the app passes the file name into your hook. Each tool has its own arguments, and you can read them inside the hook with these environment variables.

## All the events you can hook into

You do not need to memorize this list. Just keep it nearby for when an idea comes up.

| Event | When it fires | A common use |
|---|---|---|
| `PreToolUse` | Before a tool runs | Block a risky command |
| `PostToolUse` | After a tool finishes | Format a file, run a linter |
| `UserPromptSubmit` | When you press enter on a prompt | Add context to the prompt |
| `Stop` | When the session ends | Run tests, save a draft commit |
| `SubagentStop` | When a sub agent finishes | Collect its results |
| `Notification` | When the app shows a message | Forward it to Slack |

Of these, the two you will use most are `PreToolUse` and `PostToolUse`. They cover almost every workflow rule.

## Blocking a risky command

This is the hook that has saved me the most stress. It tells Claude Code to refuse a few specific shell commands.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "CMD=\"$CLAUDE_TOOL_INPUT_command\"; case \"$CMD\" in *\"rm -rf\"*|*\"--no-verify\"*|*\"git push --force\"*) echo \"Blocked: $CMD\"; exit 2 ;; esac"
          }
        ]
      }
    ]
  }
}
```

When a `PreToolUse` hook exits with status `2`, the app blocks the tool call and tells the model what happened. The model then knows what it tried, sees the error, and picks a different path. Any other non zero exit is treated as a normal error and the call still goes through, so use exit `2` only when you really mean *do not run this*.

A small safety note. Never paste `$CLAUDE_TOOL_INPUT_*` straight into a shell expression without quotes. The model can put anything in there. Use `case` matching or fixed string searches instead of fancy patterns.

## Adding context to every prompt

This one is a small trick that surprises people the first time they see it. You can have a hook run when you submit a prompt, and whatever it prints gets added to your message before Claude reads it.

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "gh issue list --limit 5 --json number,title --jq '.[]| \"#\\(.number) \\(.title)\"'"
          }
        ]
      }
    ]
  }
}
```

Now every time you ask Claude something, it sees the latest five open issues from GitHub at the top of your message. You can do the same with your task list, your last few git commits, or any internal note you want the model to be aware of.

## A clean way to organize hooks

Once you have more than two or three hooks, the JSON gets noisy. The pattern most teams settle on is to keep small shell scripts in `.claude/hooks/` and just call them from the JSON.

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": ".claude/hooks/block-dangerous.sh" }] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": ".claude/hooks/format.sh" }] },
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": ".claude/hooks/typecheck.sh" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": ".claude/hooks/run-tests.sh" }] }
    ]
  }
}
```

Each script becomes a small file the team can review and improve. You can also write hooks in Python or Node if shell is not your favorite language. The `command` field is just a normal shell line, so anything you can run from your terminal is fair game.

## When a hook is the right tool

There are three ways to teach Claude Code to do something. They are not equal.

| Approach | How reliable | When to use it |
|---|---|---|
| Memory or `CLAUDE.md` notes | Low. The model can ignore it. | Style preferences and gentle context. |
| Slash commands | Medium. You have to remember to call it. | A task you do often by hand. |
| Hooks | High. The app runs them every time. | Anything that must happen, every time. |

A simple rule of thumb: if you find yourself adding a sentence to `CLAUDE.md` that starts with the word *always*, it probably wants to be a hook.

## Common questions

**Do hooks run for every tool, including read only ones?**
Only the ones you ask for. The `matcher` field decides. If you set `"matcher": "Edit|Write"`, the hook only fires for those two. Leave `matcher` out and it fires for every tool.

**Can a hook send something back to the model?**
Yes. Anything a `PreToolUse` or `UserPromptSubmit` hook prints to standard output gets added to the conversation as extra context. `PostToolUse` output shows up in the transcript.

**Can hooks be written in Python?**
Yes. The `command` field runs in your shell, so `python .claude/hooks/lint.py` works the same as a bash one liner. Use whatever language you are fastest in.

**Is it safe to commit hooks to git?**
Yes, and it is the recommended pattern. Commit `.claude/settings.json` and any scripts in `.claude/hooks/`. Keep secrets and personal preferences in `.claude/settings.local.json` instead, and add that file to your `.gitignore`.

## Where to go next

Hooks pair well with two other Claude Code features.

- The [Claude Agent SDK and how it compares to LangChain](/posts/claude-agent-sdk-vs-langchain) for when you want to build your own version of Claude Code into a product.
- [How to build your first MCP server](/posts/build-your-first-mcp-server) if you want to give Claude Code custom tools.

Once you have written three or four hooks, the editor starts to feel less like a stranger and more like a tool that knows your team. That is the whole point. Spend an hour on hooks today, and your future self will quietly thank you for the next year.
