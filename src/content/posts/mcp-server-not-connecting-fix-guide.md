---
title: "MCP Server Not Connecting? 10 Fixes That Actually Work (2026)"
description: "Plain guide to fix MCP server not connecting in Claude Desktop, Claude Code, Cursor and VS Code. Covers error -32000, -32001, npx ENOENT, and timeouts."
pubDate: 2026-09-18
author: "Muhammad Moeed"
tags: ["claude-code", "mcp", "tutorials"]
keywords: [
  "mcp server not connecting",
  "mcp server not working",
  "mcp error -32000 connection closed",
  "mcp error -32001 request timed out",
  "spawn npx enoent",
  "claude mcp not working",
  "mcp server failed to connect",
  "mcp server disconnected",
  "mcp not working claude desktop",
  "mcp not working on windows"
]
featured: true
---

You added an MCP server to your config, restarted Claude Desktop (or Claude Code, or Cursor, or VS Code), and nothing showed up. Or the server showed up and then died with a cryptic error like `MCP error -32000: Connection closed`. Or every tool call hits `Request timed out` after 60 seconds. Or you get `spawn npx ENOENT` and no idea what "ENOENT" even means.

This guide walks through the 10 most common reasons an MCP server does not connect, with the exact error text you see, the root cause in one sentence, and the fix steps you can copy today. It works for Claude Desktop, Claude Code CLI, Cursor, and the VS Code extension on Mac, Windows, and Linux.

If you have never touched an MCP server before, start with the "What is going on" section. If you already know MCP and just want to fix an error, jump straight to the named error catalog below.

## Try these 4 things first (fixes 80% of cases)

Before you dig into a specific error, these four steps resolve the majority of MCP failures:

1. **Fully quit the client, then relaunch.** On macOS use Cmd+Q. On Windows right-click the tray icon and click Quit. Closing the window is not enough. Config file changes only load on a cold start.
2. **Check your config file with a JSON linter.** A single missing comma, an unescaped Windows backslash, or the wrong top-level key silently breaks the whole file. No error dialog appears, no servers register.
3. **Replace bare `npx` with an absolute path.** On Mac/Linux run `which npx` in your terminal and paste the full path (something like `/Users/you/.nvm/versions/node/v22.14.0/bin/npx`) into your config. On Windows use `cmd /c npx` or point directly at `node.exe`.
4. **Check the logs.** On Mac: `tail -F ~/Library/Logs/Claude/mcp*.log`. On Windows: open `%APPDATA%\Claude\logs\` in Explorer. In Claude Code CLI: launch with `claude --debug=mcp` and read `~/.claude/debug/<session-id>.txt`.

If steps 1 to 4 do not fix it, find your exact error message in the catalog below.

## What is going on (a plain-words intro)

Skip this section if you already know MCP.

**MCP** is short for **Model Context Protocol**. It is an open standard that lets an AI app (Claude Desktop, Claude Code, Cursor, VS Code) talk to external tool servers (filesystem, GitHub, databases, Slack) in a standard way.

An **MCP server** is a small program that sits between the AI and the outside world. It can be:

- A **local process** the client launches on your machine, usually with a command like `npx some-mcp-server`. This is called the **stdio transport**, because the AI talks to the server through its standard input and output pipes.
- A **remote HTTP endpoint** the client connects to over the network. This is called **Streamable HTTP** in the current spec. The older HTTP+SSE transport is deprecated.

When you edit a config file to add a server, the AI client tries to **spawn** (start) the local server or **connect** to the remote one. It then runs a **handshake**: the client sends its version and capabilities, the server sends back its tool list.

If any step fails, you see one of the errors below. Most failures happen at spawn time (the server binary was not found) or during the handshake (the server crashed before it could reply).

Beginner terms in one line each:

- **stdio**: standard input/output. How the client talks to a local server.
- **spawn**: start a child process. When it fails, you see `spawn npx ENOENT` or `spawn EINVAL`.
- **PATH**: the list of folders your operating system searches when it looks for a command like `npx` or `node`.
- **JSON-RPC**: the message format MCP uses. Error codes like `-32000`, `-32601`, and `-32700` come from the JSON-RPC standard.
- **npx / uvx**: launchers that download and run a Node.js (npx) or Python (uvx) package on the fly. Most MCP install snippets use them, which is why broken npx breaks almost every server.

## The 10 most common MCP errors and how to fix them

Each section below has the exact error text, the root cause in one sentence, and the fix steps.

### 1. `MCP error -32000: Connection closed`

**Root cause:** the MCP server process died or the transport closed before the handshake finished. Usually because the server wrote plain-text output to stdout, crashed on startup, or a required environment variable was missing.

**Fix:**

1. Open the per-server log at `~/Library/Logs/Claude/mcp-server-<NAME>.log` on macOS, or `%APPDATA%\Claude\logs\mcp-server-<NAME>.log` on Windows. Read the last 20 lines.
2. Run the exact `command` and `args` from your config in a plain terminal. If it fails there, it will fail inside the client. This isolates "server broken" from "config wrong".
3. Confirm your server logs to **stderr only**, never stdout. Any stdout text corrupts the JSON-RPC stream and shows as `-32000`.
4. Add missing environment variables to a per-server `env: {...}` block in the config. Stdio servers do not inherit your shell environment.
5. Fully quit and relaunch the client after saving.

### 2. `MCP error -32001: Request timed out`

**Root cause:** the tool call did not return within the MCP timeout window. Claude Code hard-capped HTTP calls at ~60 seconds until v2.1.149. Claude Desktop on Windows enforces a 4-minute overall cutoff.

**Fix:**

1. Upgrade Claude Code to v2.1.149 or newer so `MCP_TOOL_TIMEOUT` is actually honored on HTTP and SSE transports.
2. Set `MCP_TIMEOUT` before launching (for example, `export MCP_TIMEOUT=120000` for 120 seconds). The effective ceiling is the greater of 60s, the per-server tool timeout, and `MCP_TIMEOUT`.
3. For long-running jobs, have the server send progress notifications. The TypeScript SDK v1.9+ resets the 60s clock on each notification.
4. If Claude Desktop on Windows hits the 4-minute silent cancel even after the job finished, split the operation into smaller tool calls.
5. For stdio servers, confirm the child process is not blocked on stdin, network, or an interactive auth prompt.

### 3. `spawn npx ENOENT`

**This is the single most common MCP setup error.** Referenced across 30+ MCP repos.

**Root cause:** the client tried to launch bare `npx` but the operating system could not find it on the PATH the client was launched with. Almost always caused by Node being installed via nvm, nvm-windows, mise, fnm, or volta, whose `bin` directories are only exported for interactive shells.

**Fix (macOS/Linux):**

1. In your terminal, run `which npx`. Copy the output (something like `/Users/you/.nvm/versions/node/v22.14.0/bin/npx`).
2. Paste that full path as the `command` in your config, replacing the word `npx`.
3. Do not use `~` in the JSON path. JSON is not shell-expanded. Write `/Users/you/...` explicitly.

**Fix (Windows):**

1. Change `"command": "npx"` to `"command": "cmd", "args": ["/c", "npx", "-y", ...]`.
2. Or point directly at `C:\\Program Files\\nodejs\\node.exe` with the absolute path to the server script.
3. Escape all backslashes in JSON: `C:\\Users\\name`, not `C:\Users\name`.

**Alternative fix (both platforms):** add a per-server `env: {"PATH": "/Users/you/.nvm/versions/node/v22.14.0/bin:/usr/bin:/bin"}` block so the child process inherits a working PATH.

After any of these, fully quit and relaunch the client.

### 4. `spawn EINVAL` (Windows only)

**Root cause:** Node's `child_process.spawn()` cannot resolve `.cmd` or `.bat` shims (like `npx.cmd`) without `shell: true`. Passing bare `npx` gives `ENOENT` and passing `npx.cmd` gives `EINVAL`.

**Fix:**

1. Wrap the command with `cmd /c`: `"command": "cmd", "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-filesystem", "C:\\path"]`.
2. Or point directly at `node.exe` and pass the absolute path to the server's `dist/index.js`.
3. Escape all backslashes in JSON.
4. Fully quit Claude from the system tray (not just close the window) and relaunch.

### 5. `Server transport closed unexpectedly, this is likely due to the process exiting early`

**Root cause:** the MCP child process exited (crashed, threw, or was killed) between spawn and the first JSON-RPC exchange.

**Fix:**

1. Follow the log message's own advice: add `console.error()` (JavaScript) or `print(..., file=sys.stderr)` (Python) statements to your server so failures land in `mcp-server-<NAME>.log`.
2. Run the exact command from your config in a terminal to reproduce the crash.
3. Check that every environment variable the server needs (API keys, database URLs) is set in the per-server `env` block.
4. For Python servers, confirm you are on a supported Python version and the virtual environment is actually activated by the command you configured.
5. For Windows Smart App Control blocks (`uv.exe` and similar), unblock the binary in Windows Security > App & browser control.

### 6. `Could not attach to MCP server <NAME>` (Claude Desktop UI popup)

**Root cause:** Claude Desktop failed to attach its Protocol client to the started server. Sometimes even when the server is running and tools still work. Frequently caused by two servers sharing one Protocol instance, or by the UtilityProcess spawn timing out.

**Fix:**

1. First, ignore the popup if `/mcp` shows the server as Connected and tools still work. The popup is often cosmetic.
2. If tools genuinely do not work, fully quit Claude (Cmd+Q on macOS, tray > Quit on Windows) and cold-launch.
3. Reduce concurrent servers to isolate the offender. The `"Already connected to a transport"` log line confirms a Protocol-instance conflict.
4. On Windows check the paired `UtilityProcess spawn timeout` log. Claude Desktop hardcodes a 5-second spawn timeout. Simplify the launch command (skip heavy shell wrappers) so the server responds inside 5 seconds.

### 7. `MCP error -32601: Method not found`

**Root cause:** the client called an MCP method the server did not implement (often `resources/list`, `prompts/list`, or `elicit`). Very common with the VS Code Claude Code extension probing optional methods on servers that only expose tools.

**Fix:**

1. Update the server SDK to the latest version. Older TypeScript SDK builds did not stub every optional endpoint.
2. If you cannot update, add empty handlers for the optional endpoints (return empty arrays for `resources/list` and `prompts/list`).
3. If it is a third-party server, open an issue on their repo referencing MCP spec `2026-07-28`.
4. The error is usually harmless if the server's core tools still work. Confirm with `/mcp` or `claude mcp list`.

### 8. `MCP error -32602: Invalid params`

**Root cause:** the client sent a request with missing or wrong-typed parameters. Also fires during initialization if the server rejects your protocol version.

**Fix:**

1. Read the log line right before the error. It usually names the offending field.
2. Confirm client and server are on compatible MCP protocol versions. Older servers may reject `2026-07-28` clients; newer servers may reject `2025-03-26` clients.
3. If it fires on a specific tool, check that the tool's argument schema matches what the client sent. Re-generate the schema on the server side.
4. For AWS MCP proxy or similar chained transports, confirm both hops speak the same version.

### 9. `Failed to connect` (in `claude mcp list` output)

**Root cause:** the Claude Code CLI could not complete the MCP handshake for that server. The status column shows `Failed to connect` or `Failed to spawn` or `Pending approval`.

**Fix:**

1. If it says `Failed to spawn`: the binary was not found. Apply the `spawn npx ENOENT` fix (section 3).
2. If it says `Failed to connect`: the binary launched but the handshake failed. Apply the `-32000` fix (section 1).
3. If it says `Pending approval`: a project-scope `.mcp.json` was found but you dismissed the approval prompt. Run `/mcp` in the session to re-approve.
4. Verify precedence: local scope in `~/.claude.json` shadows project scope in `.mcp.json`. Run `claude mcp get <name>` to see which config the CLI is actually using.

### 10. `authorization with MCP server failed` / `Error POSTing to endpoint (HTTP 401)`

**Root cause:** OAuth token expired, was revoked, or the `offline_access` scope was missing so no refresh token was ever issued.

**Fix:**

1. Re-authenticate: run `/mcp` in Claude Code and re-approve the server, or click Reconnect in Claude Desktop.
2. If it re-fails every hour, the server did not request the `offline_access` scope. Ask the server maintainer to add it.
3. For remote MCP behind a corporate firewall, check that the auth endpoint is on your allow-list. Cloudflare and AWS WAF sometimes block MCP OAuth flows silently.
4. If you get `401 after successful auth`, the bearer token expired mid-session. This is expected around the 1-hour mark. Re-auth from `/mcp`.
5. Note: the `2026-07-28` spec deprecates OAuth 2.0 Dynamic Client Registration in favor of Client ID Metadata Documents. Some newer servers require the CIMD flow.

## Per-platform gotchas

### Claude Desktop on macOS

- Config file lives at `~/Library/Application Support/Claude/claude_desktop_config.json`. Open it via Settings > Developer > Edit Config.
- Logs at `~/Library/Logs/Claude/` (`mcp.log` plus one `mcp-server-<NAME>.log` per server). Follow with `tail -n 20 -F ~/Library/Logs/Claude/mcp*.log`.
- Closing the window does not reload config. You must Cmd+Q and relaunch.
- GUI apps launch with a minimal PATH (`/usr/bin:/bin:/usr/sbin:/sbin`) that excludes `/opt/homebrew/bin` and `~/.nvm/versions/node/*/bin`. Bare `npx` fails. Use absolute paths.
- On macOS 26.6+ with Apple Silicon, stdio MCP servers do not auto-reconnect after sleep/wake. Tools silently disappear and a full session restart is required.

### Claude Desktop on Windows

- Standalone `.exe` installer: config at `%APPDATA%\Claude\claude_desktop_config.json`.
- **MSIX / Microsoft Store install reads a virtualized path**: `C:\Users\<user>\AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json`. The Edit Config button opens the wrong file. Never symlink the MSIX path back to `%APPDATA%\Claude`. That produces a blank white screen.
- Backslashes must be doubled in JSON: `C:\\Users\\name`, not `C:\Users\name`. A single backslash silently breaks the whole file.
- Bare `npx` fails with `spawn npx ENOENT`. Use `{"command":"cmd","args":["/c","npx",...]}` or point directly at `node.exe`.
- Hardcoded 5-second UtilityProcess spawn timeout for stdio servers. Also a 4-minute overall cutoff for tool results.
- Closing the window is not enough. Right-click the tray icon > Quit, or kill all `Claude.exe` in Task Manager.
- The filesystem MCP server rejects Windows paths containing spaces. Use DOS 8.3 short names or a space-free directory.

### Claude Code CLI

- Project scope: `.mcp.json` at the repo root, top-level key `mcpServers`. Must be at the root, not inside `.claude/`.
- Local and user scopes live in `~/.claude.json`.
- Precedence: Local > Project > User > Plugin-provided. A local-scope entry silently shadows project-scope.
- Relative paths in `command`/`args` resolve against your current working directory (where you launched `claude`), not the file's location. Always absolute.
- New project `.mcp.json` requires one-time approval via `/mcp`. If dismissed the server stays `Pending approval`.
- Enable debug logs with `claude --debug=mcp`. Output at `~/.claude/debug/<session-id>.txt`.
- Diagnose with `/mcp`, `claude mcp list`, `claude mcp get <name>`, and `claude doctor`.
- Before v2.1.149, HTTP MCP tool calls were hard-capped at ~60 seconds regardless of `MCP_TIMEOUT`.

### VS Code (with Claude Code extension or Copilot Chat)

- VS Code MCP config: workspace `.vscode/mcp.json` (checked into git) or user `%APPDATA%\Code\User\mcp.json`.
- **Top-level key is `servers`, not `mcpServers`.** Pasting a Claude config here silently fails.
- The Claude Code VS Code extension does not read VS Code's `mcp.json`. You must duplicate the config in `~/.claude.json`.
- Cold-startup handshake can silently time out. Developer > Reload Window usually fixes it.

### Cursor

- Project config `.cursor/mcp.json` (wins over global) or global `~/.cursor/mcp.json`. Key is `mcpServers` (like Claude, unlike VS Code).
- Widely reported "stuck on loading tools" state. Reload the window or restart Cursor.
- Same `spawn npx ENOENT` and Windows `cmd /c` requirements as Claude Desktop.

### Node.js with NVM, mise, or fnm

- GUI-launched clients do not source `~/.zshrc` or `~/.bashrc`, so nvm's PATH extension is invisible. Bare `npx` fails.
- Fix: paste the output of `which npx` as the `command`. This also pins the Node version so a later `nvm use` cannot break the server.
- Global npm packages are per-Node-version. After `nvm install v22`, previously installed MCP servers are gone until you reinstall.
- Some MCP servers now require Node 22+. MCP Inspector itself requires Node 22.19.0+.
- Tilde (`~`) paths do not work in JSON. Write `/Users/name/...` or `/home/name/...` explicitly.

### Corporate networks, proxies, and OAuth

- Proxies, WAFs (Cloudflare, AWS WAF), and firewalls can silently block remote MCP requests. Check proxy or WAF logs and allow-list the MCP domain.
- Most MCP clients do not support explicit `HTTPS_PROXY` config. You may need a system-level proxy or a VPN.
- OAuth bearer tokens are typically valid ~1 hour. `401 after successful auth` usually means the token expired. Re-auth from `/mcp`.
- Missing `offline_access` scope means no refresh token was issued. You will re-auth every hour.

## The 7-step diagnostic checklist

If your specific error is not in the catalog, run through this checklist in order. It catches almost every case:

1. **Fully quit and cold-relaunch the client.** Cmd+Q on macOS, tray > Quit on Windows.
2. **Validate the config file with a JSON linter.** Confirm the top-level key (`mcpServers` for Claude, `servers` for VS Code) and that all Windows paths use double backslashes or forward slashes.
3. **Run `/mcp` in Claude Code, or `claude mcp list` in a shell.** Read the per-server status. `Failed to connect` means handshake failed. `Failed to spawn` means the OS could not find the binary. `Pending approval` means the `.mcp.json` project prompt was dismissed.
4. **Run the exact `command` + `args` from your config in a plain terminal.** If it fails there, it will fail inside the client. This isolates "server broken" from "config wrong" from "Node not installed".
5. **Check the logs.** macOS: `tail -n 20 -F ~/Library/Logs/Claude/mcp*.log`. Windows: `type "%APPDATA%\Claude\logs\mcp*.log"`. Claude Code: launch with `claude --debug=mcp` and read `~/.claude/debug/<session-id>.txt`.
6. **Replace bare `npx` with an absolute path.** macOS/Linux: paste the output of `which npx`. Windows: wrap as `{"command":"cmd","args":["/c","npx",...]}` or point directly at `C:\\Program Files\\nodejs\\node.exe`.
7. **Drive the server directly with the MCP Inspector.** Run `npx @modelcontextprotocol/inspector <your command>`. Requires Node 22.19.0+. If the Inspector connects and lists tools, the server is fine and the problem is your client config.

## FAQs

### Why is my MCP server not connecting to Claude Desktop?

Nine times out of ten the fix is one of these four: (1) you closed the Claude Desktop window instead of fully quitting the app (config only reloads on Cmd+Q or tray > Quit); (2) your JSON config has a syntax error like a missing comma or an unescaped Windows backslash; (3) you used bare `npx` but the app launched with a PATH that does not include your nvm bin directory; (4) the server itself crashes on startup and the failure is hiding in the per-server log at `~/Library/Logs/Claude/mcp-server-<NAME>.log`.

### What does MCP error -32000 connection closed mean?

The MCP server process died or the transport closed before the handshake finished. Usually because the server wrote plain-text output to stdout (which corrupts the JSON-RPC stream), crashed on startup, or a required environment variable was missing from the per-server `env` block. Read the last 20 lines of `mcp-server-<NAME>.log` for the real crash reason.

### How do I fix MCP error -32001 request timed out?

Two most common causes: (1) you are on Claude Code older than v2.1.149, which hard-capped HTTP MCP calls at ~60 seconds regardless of `MCP_TIMEOUT`. Upgrade. (2) Your tool call genuinely takes longer than the limit. Set `MCP_TIMEOUT=120000` (120 seconds) before launching, or have the server emit progress notifications so the 60s clock resets on each one.

### How do I fix `spawn npx ENOENT`?

The client cannot find `npx` because it launched with a PATH that excludes your nvm (or mise, fnm, volta) bin directory. On Mac/Linux: run `which npx` in your terminal, then paste the full absolute path as the `command` in your config. On Windows: change `"command": "npx"` to `"command": "cmd", "args": ["/c", "npx", "-y", ...]`, or point directly at `node.exe`. Never use `~` in JSON paths; JSON is not shell-expanded.

### Where are Claude Desktop MCP logs on Mac and Windows?

Mac: `~/Library/Logs/Claude/`. Files: `mcp.log` (client-side) and one `mcp-server-<NAME>.log` per server. Follow live: `tail -n 20 -F ~/Library/Logs/Claude/mcp*.log`. Windows (standalone install): `%APPDATA%\Claude\logs\`. Windows (MSIX / Microsoft Store install): the config lives at a virtualized path under `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\logs\`.

### Why does my MCP server work in the terminal but not in Claude?

Terminal shells source `~/.zshrc` or `~/.bashrc` and inherit your full PATH. GUI apps like Claude Desktop launch with a minimal PATH that does not include nvm, mise, or Homebrew paths. Fix: use the absolute path from `which npx` in your config, or add a per-server `env: {"PATH": "..."}` block that lists your Node bin directory.

### How do I use MCP Inspector to debug a broken server?

Run `npx @modelcontextprotocol/inspector <your server command>` from a terminal. This opens a web UI that speaks the MCP protocol directly to your server. If Inspector connects and lists the tools, your server is healthy and the problem is your client config. If Inspector fails the same way Claude does, your server is broken. Requires Node 22.19.0 or newer.

### Why does `claude mcp list` show no servers configured?

Three usual causes: (1) your `.mcp.json` is in the wrong folder. It must be at the repo root, not inside `.claude/`. (2) You typed the wrong top-level key. Claude Code uses `mcpServers`, VS Code uses `servers`. Copy-paste from the wrong docs breaks silently. (3) A local-scope entry in `~/.claude.json` is shadowing your project scope. Run `claude mcp get <name>` to see which config the CLI is actually using.

## What we still do not know

- Exact percentage of users hitting each error class. Anthropic does not publish issue-frequency telemetry.
- Whether the Windows 4-minute cutoff (issue #44032) has been changed in any release after being closed as "invalid". No official confirmation.
- The exact Claude Code release that removed the HTTP 60-second timeout. Third-party blogs cite v2.1.149 via PR history, but Anthropic's changelog does not name a specific version.

## Where to go next

- [Claude Code Skills vs MCP vs Hooks vs Plugins](/posts/claude-code-skills-vs-mcp-vs-hooks-vs-plugins): where MCP fits alongside the other four Claude Code primitives.
- [MCP Apps vs OpenAI Apps SDK](/posts/mcp-apps-vs-openai-apps-sdk): how MCP compares to the closest alternative protocol.
- [Claude Code Hooks Tutorial](/posts/claude-code-hooks-tutorial): the layer above MCP that runs on every tool call.
- [Claude Code Auto Mode + Containment Escape](/posts/claude-code-auto-mode-default-guide): the security rules that decide when MCP tool calls need approval.
- [Claude Code Slow Fix](/posts/claude-code-slow-fix): the wider cost and performance guide that pairs with MCP debugging.

**Last updated: September 18, 2026.** I will re-check this page when the next Claude Code release changes MCP behavior, or when the `2026-07-28` spec's deprecation window closes.
