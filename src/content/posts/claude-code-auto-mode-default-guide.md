---
title: "Claude Code Auto Mode Default + Sept 1 Containment Escape Rule"
description: "On Aug 14 2026 Claude Code made auto mode the default. On Sept 1 a new Containment Escape rule blocked three risky moves. Plain non-tech guide."
pubDate: 2026-09-02
author: "Muhammad Moeed"
tags: ["claude-code", "claude", "anthropic"]
keywords: [
  "claude code auto mode default",
  "claude code auto mode",
  "how to disable claude code auto mode",
  "claude code containment escape rule",
  "claude code permission modes",
  "claude code sept 1 v2.1.257",
  "claude code auto mode safe",
  "claude code settings.json defaultMode",
  "claude code shift+tab mode",
  "claude code auto mode team settings"
]
featured: true
---

Two things changed for Claude Code users in the last three weeks, and both are easy to miss.

On **August 14, 2026**, Anthropic made "auto mode" the default for every new Claude Code session on the Pro, Max, and Team plans. That means Claude no longer stops to ask before it edits your files or runs shell commands — a smaller "checker" agent reviews each action instead. On **September 1, 2026**, in Claude Code v2.1.257, Anthropic added a new safety rule called **Containment Escape** to that checker. It blocks three risky things that auto mode used to wave through.

This guide explains, in plain words, what auto mode is, what really changed, why the September 1 rule matters even if you have never touched permission settings, and how to turn auto mode off in one command if you want to go back to the old "Claude asks first" behavior.

## Quick answer

- **Aug 14, 2026**: auto mode is now the built-in default on Pro, Max, and Team plans. Enterprise, Console API, `claude -p`, Agent SDK, Bedrock, and Vertex sessions were not changed.
- **Client versions**: you need Claude Code v2.1.228 or newer on macOS/Linux/WSL, or v2.1.233 or newer on native Windows.
- **If you already had a `defaultMode` set**: Claude Code asks you once whether to switch. If you say no, your setting stays.
- **Sept 1, 2026 (v2.1.257)**: the new **Containment Escape** rule blocks three moves in auto mode — cloud key theft, network sneak-outs, and reaching resources that belong to someone else — unless your environment file marks them as expected.
- **To go back to Manual**: run `claude --permission-mode default` for one session, or add `"defaultMode": "default"` to your `~/.claude/settings.json` for every future session.

## What auto mode actually is (in plain words)

Claude Code has always had "permission modes" — a small setting that decides how much of what Claude wants to do runs on its own, and how much stops to ask you first.

Before Aug 14, the default mode was called **Manual**. In Manual mode, Claude reads files freely, but before it edits a file, runs a shell command, or reaches the internet, it stops and shows you a prompt with an Allow / Deny choice.

**Auto mode** replaces that "stop and ask" loop with a second small model — a **classifier** — that reviews each action in a fraction of a second and decides for you. If the classifier is happy, the action runs. If it is not, the action is blocked and you see a "Denied by auto mode classifier" notice.

The verbatim wording from Anthropic's own permission-modes documentation is:

> Auto mode lets Claude execute without routine permission prompts. A separate classifier model reviews actions before they run, blocking anything that escalates beyond your request, targets unrecognized infrastructure, or appears driven by hostile content Claude read.

The classifier's calls do not count against your weekly usage limit. Anthropic confirmed that in the Week 32 what's-new digest.

## What changed on August 14

Before Aug 14, if you opened a fresh Claude Code session on a new machine and did nothing to your settings, Claude started in Manual mode. Every edit or shell command triggered a prompt.

After Aug 14, on Pro, Max, and Team plans only, the same fresh session starts in **auto mode**. Claude edits and runs commands without asking you. This is a big behavior change if you are used to seeing prompts.

Here is exactly what Anthropic said in the Aug 3–7 what's-new digest:

> Starting August 14, auto mode is the default permission mode for new sessions on Pro, Max, and Team plans. If you set a default mode yourself, it stays in place unless you accept the one-time switch prompt, and a default your organization manages doesn't change. You can still switch modes at any time.

Three fair-play rules Anthropic kept in place:

1. **If you already had `"defaultMode"` set in your settings**, your existing choice wins by default. Claude Code asks once whether to switch — if you decline, nothing changes.
2. **If your organization manages your settings** (through an admin console or an MDM tool), that org-set default is not overridden.
3. **You can switch modes any time** during a session with Shift+Tab (or Alt+M on some Windows setups).

**Not changed** by the Aug 14 flip: Enterprise plans, Claude Console API keys, `claude -p` runs, Claude Agent SDK sessions, Amazon Bedrock, Google Cloud Agent Platform, Microsoft Foundry, Claude Platform on AWS, and the Claude apps gateway. All of these still start in Manual mode. If your team is on Enterprise, this change did not touch you.

## What changed on September 1

Auto mode's checker is smart, but it is not perfect. Since Aug 14, security researchers and internal Anthropic reviewers found three types of dangerous actions that the checker was letting through more often than it should. The Sept 1 v2.1.257 release adds a new rule called **Containment Escape** to fix that.

The exact wording from the changelog:

> Added a Containment Escape rule to auto mode so cloud metadata-credential fetches, egress evasion, and cross-tenant reach are no longer auto-approved unless your environment marks them expected.

That sentence has three technical terms — cloud metadata-credential fetches, egress evasion, and cross-tenant reach. The next three sections explain each one in plain language, with an example.

## The three things the new rule blocks

### 1. Cloud metadata-credential fetches (the "hotel front desk" attack)

If you run a cloud server on Amazon Web Services (AWS), every server has a small helper desk inside it called the **Instance Metadata Service**, or **IMDSv2** for the newer version. Think of it as the front desk of a hotel.

Guests staying in the hotel (programs running on the server) can walk up and ask for things — their room number, the WiFi password, or a **temporary key card for the hotel gym**. The desk answers only guests, because its address (`http://169.254.169.254`) can only be reached from inside the server itself. Version 2 of the service added one extra rule: before the desk tells you anything, you must first grab a short paper ticket (a session token). Without the ticket, the desk refuses.

Here is why this matters. Behind that front desk, there is a locked drawer that holds a **short-lived AWS key card** tied to the role the server plays. Anyone who reads that key can act as the server across the whole cloud account until the key expires. Someone with a leaked key can spin up expensive servers on your bill, read databases they should not, or delete backups.

An attacker who tricks your Claude Code session into asking that front desk for a key steals a real AWS credential. Before Sept 1, if the classifier saw an innocent-looking `curl http://169.254.169.254/...`, it sometimes waved it through. Now the Containment Escape rule flags the request and forces Claude to stop and ask you first, unless your environment file explicitly marks that address as expected traffic.

### 2. Egress evasion (the "walk past the bouncer" attack)

"Egress" is just a longer word for **outbound network traffic** — data leaving your machine and heading out to the internet. A well-run Claude Code sandbox has a bouncer at the door with a guest list: only these named domains are allowed out.

**Egress evasion** is when the agent tries to sneak past the bouncer instead of walking through the door legitimately. The most common trick, called **domain fronting**, works like this: the sandbox trusts whatever hostname a request claims to be for. If `github.com` is on the allow-list, code running inside the sandbox can dress up outgoing traffic to look like it is headed to `github.com`, while the traffic actually reaches a different site that shares the same content network — like showing the bouncer a guest's ID while walking a stranger in behind you.

Other flavors of the same trick: opening a tunnel or reverse shell so someone outside the sandbox can send commands back into it, or routing all traffic around your organization's proxy on purpose.

The Containment Escape rule flags this whole family of moves. Auto mode has to stop and ask before doing any of them.

### 3. Cross-tenant reach (the "different building" attack)

If you use cloud services, most of them are **multi-tenant** — many customers share the same physical infrastructure, but every customer's stuff is isolated behind an account boundary. Reaching resources that belong to a **different account** than the one you meant to use is called **cross-tenant reach**.

An easy example: your Claude Code session is helping you work in your company's AWS account. Because of a bug in a script or a poisoned instruction Claude read from a file, it tries to list S3 buckets under **someone else's account**. Nothing about that is helpful to you, and it may cost the other account money or leak information.

The Containment Escape rule catches this and forces a manual approval before Claude proceeds.

## The six permission modes (short reference)

Auto mode is one of six. Here is what each one does in one line each:

| Mode | Config value | What it does | Risk |
|---|---|---|---|
| **Manual** | `default` | Reads files freely; asks before every edit, shell command, or network call. | Low |
| **acceptEdits** | `acceptEdits` | Reads and edits files freely; asks before other shell or network actions. | Medium |
| **Plan** | `plan` | Reads files and safe shell commands to explore. Writes a plan first, blocks edits until you approve it. | Low |
| **Auto** | `auto` | The new default on Pro/Max/Team. Runs actions without asking, with a classifier checking each one. | High |
| **dontAsk** | `dontAsk` | Auto-denies anything not on your explicit allow-list. Useful for very tight sandboxes. | Low |
| **bypassPermissions** | `bypassPermissions` | Disables all safety checks. Only for isolated VMs or containers with no internet. | High |

The docs carry a plain warning on auto mode: **"Auto mode reduces permission prompts but does not guarantee safety."** Treat it like a driver assist, not self-driving.

## How to turn off auto mode

You have five easy places to do this, going from smallest scope (one session) to biggest (the whole team).

**1. One session, one command.** In the terminal, start Claude with the mode you want:

```bash
claude --permission-mode default
# or the friendlier alias (v2.1.200+):
claude --permission-mode manual
```

**2. One session, keyboard.** Once you are inside a session, press **Shift+Tab** to cycle out of auto. From auto, the first press takes you to Manual. On some native-Windows setups without VT input, use **Alt+M** instead.

There is no `/automode`, `/manual`, or `/nomode` slash command. Asking Claude in chat to change permission mode does not work either — it is a client setting, not a chat instruction.

**3. Every session on your machine.** Open `~/.claude/settings.json` and add:

```json
{
  "permissions": {
    "defaultMode": "default"
  },
  "disableAutoMode": "disable"
}
```

`disableAutoMode` also removes auto from the Shift+Tab cycle so you cannot land in it by accident. **Value is the string `"disable"`, not the boolean `true`** — a common mistake.

**4. One project, everyone who works on it.** Add the same block to `.claude/settings.json` in the project root (which you commit to git) or `.claude/settings.local.json` (which stays on your machine). Note that project-scope settings can steer AWAY from auto, but they cannot turn auto ON — that must come from user or managed scope.

**5. Every seat in the team (admin only).** Deploy this `managed-settings.json` via MDM or the claude.ai admin console:

```json
{
  "permissions": {
    "defaultMode": "default",
    "disableAutoMode": "disable",
    "disableBypassPermissionsMode": "disable",
    "deny": [
      "Bash(curl *169.254.169.254*)",
      "Bash(*169.254.169.254*)"
    ]
  }
}
```

This does four things at once:

- Starts every session in Manual mode.
- Removes auto from the Shift+Tab cycle for everyone.
- Blocks any admin from re-enabling bypassPermissions mode downstream.
- **Adds a hard deny on the AWS metadata endpoint** — belt-and-suspenders defense on top of IMDSv2 and the new Containment Escape rule. This deny works in every mode, including bypassPermissions.

Managed settings sit at the top of the settings chain. They override user, project, and CLI settings.

## When auto mode falls back on its own

If you are on a session where auto mode is not available (an unsupported model, a mode-disabled config, or an Anthropic-side pause), Claude Code **silently falls back to Manual**. You do not get an error — the session just starts in Manual instead. This is by design, so a downgrade never blocks you from working. Check your status bar to be sure which mode you are in: it shows `⏵⏵ auto mode on` in auto and `⏸ manual mode on` in Manual.

## FAQs

### What is auto mode in Claude Code?

Auto mode is a permission mode where Claude Code runs edits and shell commands without asking you first. A separate small model (a "classifier") reviews each action before it happens and blocks the ones it thinks are unsafe. It became the default on Aug 14, 2026 for Pro, Max, and Team plans.

### How do I disable auto mode in Claude Code?

Quickest way: run `claude --permission-mode default` (or `--permission-mode manual` on v2.1.200 or newer). For every future session, add `"defaultMode": "default"` and `"disableAutoMode": "disable"` under `permissions` in `~/.claude/settings.json`. For the whole team, put those keys in `managed-settings.json`.

### What is the Containment Escape rule and what version added it?

It is a safety rule added to auto mode in **Claude Code v2.1.257 on September 1, 2026**. It blocks three types of actions from running without your approval: fetching cloud metadata credentials (like AWS IMDSv2 reads), evading the sandbox's outbound network rules (like domain fronting), and reaching resources that belong to a different cloud tenant.

### How do I whitelist cloud metadata credential fetches (IMDSv2) in auto mode?

Anthropic has not published the exact syntax on the docs site yet. The `auto-mode-config` page directs users to run `claude auto-mode defaults --label "Containment Escape"` (v2.1.208+) locally to print the current rule text, then to mark specific destinations as expected in the environment file. If you actually need this, please test in a sandbox first and file an issue on `anthropics/claude-code` if the exact key name is missing.

### What is egress evasion in Claude Code auto mode?

Egress evasion is any trick that lets your Claude Code agent send outbound traffic while sneaking past the sandbox's allowed-domains list. The most common example is **domain fronting**: labeling a request as if it is going to a permitted domain when it is actually reaching a different one that shares a content-delivery network. The Sept 1 rule flags this whole family and forces a manual approval.

### Does auto mode work on Claude Enterprise or the Claude API?

**No, and no.** The Aug 14 default flip only affected Pro, Max, and Team plans in the CLI or the VS Code extension. Enterprise plans, Claude Console API keys, `claude -p` runs, the Claude Agent SDK, Amazon Bedrock, Google Cloud Agent Platform, Microsoft Foundry, Claude Platform on AWS, and the Claude apps gateway all still start in Manual mode by default.

### How do I set the default mode for my whole Claude Code team via settings.json?

Deploy `managed-settings.json` through MDM or the claude.ai admin console. Managed settings sit above every other scope. The block that turns off auto mode team-wide is:

```json
{
  "permissions": {
    "defaultMode": "default",
    "disableAutoMode": "disable"
  }
}
```

### Is Claude Code auto mode safe for production repos?

The honest answer is "safer than before Sept 1, but the docs still say not to trust it blindly." The Sept 1 Containment Escape rule closes three real security holes, but the docs explicitly warn: **"Auto mode reduces permission prompts but does not guarantee safety."** For production repos where a wrong action costs money, revenue, or trust, most teams keep Manual or acceptEdits as the default and only opt into auto for isolated dev work.

## What we still do not know

- The full internal text of the Containment Escape rule (which exact metadata IPs it names, which tunneling tools) is not published on docs.claude.com. To see it, run `claude auto-mode defaults --label "Containment Escape"` on v2.1.208 or newer.
- The exact key name and syntax for marking a destination as "expected" in the environment file is not documented on the pages we could verify.
- The `code.claude.com/docs/en/security` page had no mention of the Containment Escape rule as of Sept 2, 2026. The changelog bullet is the only official surface right now.
- Whether individual Pro/Max users saw an in-app banner separate from the one-time switch prompt on Aug 14 is not documented.

I will update this page as Anthropic publishes more detail, or once a v2.1.258+ release adds the missing pieces.

## Where to go next

- [Claude Code Weekly Limit Guide](/posts/claude-code-weekly-limit-september-2026) — the other Sept 2026 change every paid Claude Code user should know.
- [Claude Code Skills Complete Guide](/posts/claude-code-skills-complete-guide) — how skills, hooks, and settings.json fit together.
- [Claude Code Slow Fix](/posts/claude-code-slow-fix) — the session-habits guide that pairs with permission modes for cost control.
- [Claude Agent SDK Credit Pool](/posts/claude-agent-sdk-credit-pool) — the SDK never got the Aug 14 flip, and here is what that means for your bill.

**Last updated: September 2, 2026.** I will re-check when v2.1.258 ships or when Anthropic publishes the Containment Escape rule on the security page.
