---
title: NSA MCP Security Guidance — a developer's action list (2026)
published: true
description: The NSA published MCP security guidance on May 20, 2026. Here are the four named controls, the threats they address, and what to do in your server today.
tags: mcp, security, ai, devops
canonical_url: https://moeed.app/posts/nsa-mcp-security-guidance/
cover_image: https://moeed.app/posts/nsa-mcp-security-guidance-hero.png
---

On May 20, 2026, the NSA's AI Security Center published an MCP security Cybersecurity Information Sheet. It is the first government-grade baseline for MCP, and enterprise security reviews will quietly ask you to follow it within weeks.

This is the short version. The full developer translation is on my blog: [NSA MCP Security Guidance: A Developer's Action List (2026)](https://moeed.app/posts/nsa-mcp-security-guidance/).

## The four threats the NSA names

1. **Prompt injection at protocol scale** — agents persist session credentials across many tool calls, so one poisoned document compromises a whole session
2. **In-transit tampering through gateways** — any gateway that terminates TLS can read or modify messages
3. **Audit trail gaps** — capturing only conversation but not individual tool calls leaves a forensic gap
4. **Gateway compromise** — a substituted malicious gateway speaks the protocol correctly while reading and modifying every message

## The four controls the NSA expects

| # | Control | What to do this week |
|---|---|---|
| 1 | Cryptographic message integrity | Sign every MCP message with JWS or equivalent. Verifiable through gateways. |
| 2 | Least-privilege tool-call scoping | No long-lived session tokens. Per-call credentials with minimum scope. |
| 3 | Tamper-evident audit | Log every tool invocation. Chain entries cryptographically. |
| 4 | End-to-end trust chains | Gateway is a trust boundary, not a pass-through. Verify identity at every hop. |

## The action list

```
1. Sign every message              (JWS body signatures, not just TLS)
2. Scope every tool call           (per-call creds, not session creds)
3. Log every invocation            (chained hashes, append-only)
4. Verify every hop                (mTLS, workload identity, or signed JWT)
5. Pin your gateway identity       (clients verify before sending)
6. Plan for the 2026-07-28 spec    (protocol-layer signing is coming)
```

Start with item 3. Tamper-evident logging is the cheapest to ship and gives you forensic capability no matter what else you have or have not done.

## What this does NOT cover

- Tool description trust (a tool can lie about what it does)
- Cost denial-of-service (NSA controls help you detect, not prevent)
- Supply chain (the MCP server binary itself can be malicious)

For those, see the [broader MCP server security guide](https://moeed.app/posts/mcp-server-security-guide/).

---

The full guide explains each control in depth, the AWS mapping (IAM, QLDB, CloudTrail, Verified Permissions), and a longer FAQ: [NSA MCP Security Guidance: A Developer's Action List (2026)](https://moeed.app/posts/nsa-mcp-security-guidance/).
