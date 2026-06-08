---
title: "MCP Apps Explained: Interactive UIs for MCP Servers (2026)"
description: "What MCP Apps are, how they let MCP servers ship interactive UIs to hosts, the security model, and what to prepare for before the July 28 spec lands."
pubDate: 2026-06-08
author: "Muhammad Moeed"
tags: ["mcp", "tutorials", "ai-agents"]
keywords: [
  "mcp apps",
  "what are mcp apps",
  "mcp apps explained",
  "mcp apps tutorial",
  "mcp interactive ui",
  "build mcp app",
  "model context protocol apps",
  "mcp ui iframe",
  "sep-1865",
  "mcp 2026-07-28 spec",
  "mcp apps guide",
  "mcp ui template"
]
featured: true
---

Most MCP servers today do one thing well. They take a request from a model, run some code, and return a string of text. That works for plenty of cases. A weather lookup. A database query. A file read.

But the moment your tool needs to show the user something visual, like a chart, a map, a form to fill in, or a small dashboard, you hit a wall. The server cannot render anything. It can only return data.

MCP Apps are how the protocol is closing that gap.

This guide walks through what MCP Apps are, why they exist, how the new sandboxed UI flow works, and what to be ready for before the July 28, 2026 spec lands. If you are weighing MCP Apps against the OpenAI Apps SDK for ChatGPT, see [MCP Apps vs OpenAI Apps SDK: When to Pick Which](/posts/mcp-apps-vs-openai-apps-sdk/) for the direct comparison.

## What MCP Apps are, in plain English

MCP Apps let a Model Context Protocol server send a small piece of UI to the host application. The host shows that UI inside a sandboxed iframe. The user can click, type, or interact with it as if it were a small app embedded in the chat.

Think of it like this. Before MCP Apps, your server could send back a sentence saying "your invoice total is $1,432." With MCP Apps, the same server can send back a real invoice card with line items, a date picker, and a "pay now" button. The model still calls the tool the same way. The host now has something visual to render for the user.

The official entry for this feature is SEP-1865 in the Model Context Protocol specification.

## Why MCP Apps exist

Three problems pushed the protocol in this direction.

First, some interactions are visual by nature. Picking a date from a calendar is easier than typing one. Choosing items from a list is faster than describing them. Reading a chart is clearer than reading numbers in a sentence.

Second, some answers are richer when shown as a small UI. A dashboard with five metrics is hard to fit into a paragraph. A chart that updates as new data arrives cannot be captured in text at all.

Third, before MCP Apps, every host that wanted to render something nice had to come up with its own way. One host might parse a JSON response and draw a custom card. Another host would only show the raw text. There was no shared way for a server to say "here is the UI I want for this tool."

MCP Apps fix that by giving the protocol a clean, shared way to ship UI from a server to a host.

## How MCP Apps fit with the rest of MCP

It helps to know how a normal MCP server is built first. If you have not built one yet, you can [start with the basic MCP server tutorial](/posts/build-your-first-mcp-server/) and come back here.

A normal MCP server has three main things:

- **Resources**: data the model can read.
- **Tools**: functions the model can call.
- **Prompts**: pre-written prompts the model can pick from.

MCP Apps add a new layer on top of tools. A tool can now declare a UI template that it owns. When the tool is called, the response can either be the usual text or JSON, or it can be a render request that tells the host to show the UI.

The UI template is plain HTML. The server registers it with the host ahead of time. The host downloads it, looks at it, and decides whether it is safe to render. When the tool returns a render request later, the host already has the template ready.

This is the part that matters. The UI is not pushed at the user out of nowhere. It has been declared, downloaded, cached, and reviewed before the model even calls the tool.

## The render flow, step by step

Here is what happens when a tool with a UI is called.

1. The server registers a UI template when it starts up. The template is HTML.
2. The host downloads the template, caches it, and runs a security review.
3. Later, the model calls the tool on the server.
4. The tool returns a response that says "render template X with this data."
5. The host loads the template in a sandboxed iframe and passes in the data.
6. The user sees the UI and interacts with it: clicks, typing, submitting.
7. The UI sends a message back to the host using the same JSON-RPC base protocol that MCP already uses for everything else.
8. The host treats that message like any other tool call. It goes through the same audit log, the same consent prompts, the same security checks.

The important takeaway: a click in the iframe is not magic. It is just another tool call moving through the same protocol. Nothing new on the security side. Nothing new on the auditing side. Just one more way for the model and the server to talk to each other through the host.

## The security model

This is where the spec spends a lot of care, and where MCP Apps differ from other "let the server send HTML" attempts.

- **The iframe is sandboxed.** The UI cannot read host data, run arbitrary scripts on the host page, or reach into other tabs. The browser's sandbox keeps the rendered template isolated.
- **Templates are declared ahead of time.** The host has the HTML before the user ever sees it. That means the host can cache, scan, and security-review the template at install time, not at render time.
- **All actions go through JSON-RPC.** There is no side channel from the iframe to the host. Every click, every form submit, every action maps to a JSON-RPC message that the host can log and gate.
- **The same consent model applies.** If a click would call a tool that needs user permission, the user gets the same permission prompt they would for any direct tool call.

The result is that MCP Apps do not change the security boundary. The host is still in charge. The audit trail is still complete. The user is still asked before anything risky happens.

For background on why MCP security matters and the threats hosts need to watch for, see [MCP Server Security: Auth, Rate Limits, Audit Logs](/posts/mcp-server-security-guide/) and the [NSA's MCP security guidance for developers](/posts/nsa-mcp-security-guidance/).

## What MCP Apps look like in practice

The spec keeps the door open for any kind of UI a server wants to ship. Here are the patterns that fit well.

- **A search results card** with sortable rows and a "open in new tab" button.
- **A booking form** with a date picker, time slots, and a confirmation step.
- **A small chart** that animates as fresh data arrives.
- **A multi-step setup wizard** inside the chat.
- **An image cropper** so the user can mark a region before the model processes it.
- **A code diff viewer** with accept and reject buttons for each hunk.
- **A dashboard** with a few numbers, a sparkline, and a refresh button.

The pattern across these: each one is a moment where text alone would be clunky. MCP Apps cover the cases where a small UI is just a better fit.

## When to use MCP Apps, and when not to

Use them when:

- The user needs to give structured input. Forms, pickers, sliders, range selectors.
- The output is visual. Charts, tables, dashboards, image previews.
- The interaction needs multiple steps that would feel awkward as a back-and-forth conversation.
- The data is dense, and a UI compresses it better than text would.

Skip them when:

- The answer is one or two sentences of text.
- The interaction is single-shot and needs no clicks.
- You are still prototyping the tool itself. Text is faster to ship than HTML, and you can always add a UI later.

Most MCP tools should still return plain responses. MCP Apps are an option for the cases where text is the wrong format, not a replacement for normal tool returns.

## How MCP Apps pair with the new Tasks extension

The July 28 spec also introduces a Tasks extension. Tasks are for long-running work. A tool kicks off a background job and returns a task handle. The client can poll the task, get updates, and cancel it if needed.

Tasks and MCP Apps work well together. A tool can start a long-running task and return a small UI that polls for status. The user sees a progress bar, gets live updates, and has a cancel button if they change their mind.

Without the UI, the user would have to ask the model to check on the task. With the UI, the status is right there.

## What to prepare for before the spec ships

The 2026-07-28 release candidate is out, but the final spec ships on July 28, 2026. Until then, here is what to track.

- **The method names and message shapes may still change.** The release candidate is close to final, but not final. Wait for the official spec before writing production code against the exact JSON-RPC shapes.
- **Sandboxing details may tighten.** Browser security is a moving target. Expect the sandbox attributes and content security policy guidance to firm up before release.
- **Hosts will need to update.** Older hosts will not know how to render the new templates. Tools that return a render request to an old host should still include a text fallback so the experience does not break.

If you maintain an MCP server today, you can start thinking about which of your tools would feel better with a small UI. The implementation work will be small once the spec is final: you write an HTML template, register it with the server, and return a render request from your tool.

If you build an MCP host, the work is heavier. Hosts have to handle template downloads, security review, sandboxing, and the routing between iframe actions and tool calls. Most of the engineering for MCP Apps lives on the host side.

For a fuller view of which MCP servers are worth installing today and which features they support, see [the top 15 MCP servers worth installing in 2026](/posts/best-mcp-servers-2026/).

## What MCP Apps mean for the bigger picture

Until now, MCP servers all looked roughly the same from the user's side. Requests in, text out. The host did its best to render that text nicely. Some did it well. Some did it poorly. None of them did it the same way.

MCP Apps move the responsibility. The server now controls the UI, but only within a sandbox the host fully owns. The host still decides what to render, when to render it, and whether to allow the actions that come out of it.

The result is a cleaner split. Servers know their data and how it should be shown. Hosts know how to keep the user safe. The protocol gives both sides a shared way to talk about UIs without either side losing control.

The protocol staying stateless under the hood means all of this scales the same way it does today. UI templates are just one more thing the server registers at startup. The rendering happens in the host. There is no extra session, no extra state, no extra coordination.

## Closing thoughts

MCP Apps are a small but useful addition. The protocol has been strong at the wire format and the security model from the start. What it has been missing is a clean way for a server to say "this answer is better as a UI than as text," without losing the host's control over what runs and what does not.

The path forward is short. If you have an MCP server, look at your tools and pick one or two where text feels like the wrong format. Those are the first candidates for a small HTML template when the spec ships on July 28.

If you have not built an MCP server yet, [the basic step-by-step tutorial](/posts/build-your-first-mcp-server/) is still the place to start. Once you are comfortable with tools, resources, and prompts, MCP Apps will feel like a natural next step rather than a separate skill.

The full 2026-07-28 release candidate also covers the Tasks extension, the Extensions framework, authorization hardening, and a formal deprecation policy. MCP Apps are one piece of a larger shift toward a more stable, more composable protocol. The full release notes are worth a read once the final version drops on July 28, 2026.

If your tool is aimed at ChatGPT users in particular, also read [MCP Apps vs OpenAI Apps SDK: When to Pick Which](/posts/mcp-apps-vs-openai-apps-sdk/). The OpenAI Apps SDK is built on top of MCP Apps and adds a payment hook and the ChatGPT app store on top, so picking between them is mostly a question of where your users actually live.
