---
title: "MCP Apps vs OpenAI Apps SDK: When to Pick Which (2026)"
description: "A plain guide to MCP Apps and the OpenAI Apps SDK in 2026, how they actually relate, the honest differences, code from both sides, and a clear way to pick."
pubDate: 2026-06-08
author: "Muhammad Moeed"
tags: ["mcp", "ai-agents", "tutorials"]
keywords: [
  "mcp apps vs openai apps sdk",
  "openai apps sdk vs mcp apps",
  "openai apps sdk",
  "openai apps sdk explained",
  "mcp apps",
  "build chatgpt app",
  "chatgpt app directory",
  "mcp apps tutorial",
  "what is openai apps sdk",
  "openai apps sdk pricing",
  "mcp ui vs openai ui",
  "chatgpt apps sdk vs mcp"
]
featured: true
---

If you have started building tools for AI chat hosts, you have probably hit the same fork in the road. There are two ways to add a user interface to a tool right now. The first is MCP Apps, the open standard from the Model Context Protocol. The second is the OpenAI Apps SDK, the framework OpenAI shipped for the ChatGPT app store.

They both let your tool render a UI inside the chat. They both run inside a sandboxed iframe. They both talk to your server over JSON-RPC. So the question almost every developer asks: are these competing standards, or do they work together? And which one should I build on?

This guide answers both in plain English, with code, an honest comparison table, and a simple decision tree at the end.

## The short answer (read this first)

MCP Apps and the OpenAI Apps SDK are **not competing standards**. The OpenAI Apps SDK is built on top of the Model Context Protocol. It uses MCP for the wire format, the tool definitions, the UI rendering, and the security model. It then adds a thin layer on top with ChatGPT-specific extensions: a payment hook, a store directory, and a few helpers that only run inside ChatGPT.

So the choice is not "pick one or the other." The honest framing is:

- **Build to MCP Apps first.** Your tool then works in Claude, Claude Desktop, VS Code, Goose, Postman, MCPJam, and any other host that supports the open standard.
- **Light up OpenAI Apps SDK extensions only when you need ChatGPT-specific features.** Mostly that means payments and the ChatGPT app store.

The rest of this article shows you exactly what each one is, where they overlap, where they differ, and how to make that call without guessing.

## What MCP Apps are

MCP Apps are a new extension of the Model Context Protocol, formally known as SEP-1865. They let an MCP server ship a small piece of UI to the host application. The host renders that UI inside a sandboxed iframe. The user can click, type, or interact with it like a small app embedded in the chat.

The mechanics are simple. A server registers a UI resource using the `ui://` URI scheme. A tool then points to that resource in its metadata. When the model calls the tool, the host knows to render the UI inside the iframe. Every click in that iframe sends a JSON-RPC message back to the host over `postMessage`, which the host then treats like any other tool call.

If you want the longer story, see the [MCP Apps explainer](/posts/mcp-apps-explained/). For now, three things matter:

1. MCP Apps are an **open spec.** Any host can implement them. Multiple already do.
2. The UI runs in a **sandboxed iframe.** It cannot read host data or run arbitrary scripts.
3. The communication uses the **same JSON-RPC protocol** the rest of MCP already uses.

Hosts that already support MCP Apps include Claude (web and desktop), VS Code with the GitHub Copilot extension, Goose, Postman, MCPJam, and Archestra.AI.

## What the OpenAI Apps SDK is

The OpenAI Apps SDK is OpenAI's framework for building apps that run inside ChatGPT. From the official docs: "With Apps SDK, MCP is the backbone that keeps server, model, and UI in sync."

In other words, the Apps SDK is not a new protocol. It is a framework that uses MCP. When you build an "OpenAI App," you are building an MCP server with a small amount of extra code that ChatGPT-specific features need.

A few facts to anchor it:

- It was launched alongside the ChatGPT app store. Pilot partners include Booking.com, Canva, Coursera, Figma, Expedia, Spotify, and Zillow.
- It is available on the Free, Go, Plus, and Pro plans, in markets outside the EU, UK, and Switzerland.
- The SDK itself is free to use. OpenAI plans to take a cut once developers can monetize through the directory later in 2026.
- It supports two transports: Server-Sent Events (SSE) and Streamable HTTP (recommended).
- It adds extras like `window.openai.requestCheckout()` for in-chat payments and a directory listing for app discovery.

The minimum thing you build is still an MCP server: tools, resources, prompts. The Apps SDK gives you patterns, helpers, and ChatGPT-specific hooks on top of that.

## How they actually relate

This is the part most articles miss. The OpenAI Apps SDK is layered on top of MCP, not next to it. Picture it like this:

- **MCP is the road.** A common protocol any vehicle can drive on.
- **MCP Apps are road signs and traffic lights.** A shared way to display UI on the road.
- **The OpenAI Apps SDK is a GPS app for the ChatGPT highway.** It uses the same road, follows the same signs, but adds extras only useful when you are driving in ChatGPT.

If you build your tool against the open MCP spec, your tool drives on every road that supports MCP. If you build only to OpenAI-specific extras, you are stuck on the ChatGPT highway and cannot drive anywhere else.

The smart move is to build for the road first, then optionally light up GPS features when you are in ChatGPT territory. We will get to exactly how that looks in code.

## Side-by-side comparison

Here is what is actually different between the two, on the dimensions developers ask about.

| Dimension | MCP Apps | OpenAI Apps SDK |
|---|---|---|
| **Governance** | Open spec under the MCP working group | Single-vendor (OpenAI) |
| **Host support** | Claude, Claude Desktop, VS Code Copilot, Goose, Postman, MCPJam, Archestra.AI, ChatGPT | ChatGPT only |
| **UI rendering** | Sandboxed iframe | Sandboxed iframe (uses MCP Apps under the hood) |
| **Security model** | Iframe sandbox + JSON-RPC audit | Same |
| **Wire protocol** | JSON-RPC over postMessage | Same |
| **Tool declaration** | `_meta.ui/resourceUri` on the tool | Same |
| **App directory / store** | None | Built into ChatGPT |
| **Payments in chat** | Not in the spec yet | `window.openai.requestCheckout()` |
| **Monetization** | Self-hosted, build your own billing | OpenAI marketplace (coming later in 2026) |
| **Distribution** | You share the URL, or hosts list it | OpenAI's app store handles discovery |
| **Cost to use** | Free | Free SDK, marketplace revenue share later |
| **Vendor lock-in** | None | High (only runs in ChatGPT) |

Notice that the first six rows are functionally identical. The last six are where the real choices are.

## The four real differences (and the rest is the same)

Strip away the marketing and there are only four things the OpenAI Apps SDK gives you that MCP Apps do not.

### 1. A store and a directory

The ChatGPT app store will list your app and surface it to ChatGPT users. The open MCP spec has nothing equivalent. There is no centralized place where users browse MCP servers, install one, and use it. Discovery on the open side happens through README files, blog posts, and direct URLs.

### 2. In-chat payments

OpenAI ships `window.openai.requestCheckout()` so your iframe can pop up a payment flow without leaving the chat. The open MCP spec has no checkout primitive today. If you want to charge a user from inside an MCP-only context, you build it yourself: a Stripe redirect, a hosted page, your own server-side flow.

This is the single biggest functional gap between the two. For tools that sell something, it matters.

### 3. Conversation-aware helpers

The OpenAI Apps SDK gives you tighter access to the surrounding conversation. Tool metadata, structured content flow, server-wide guidance for cross-tool workflows. You can build the same thing on the open side, but you build it yourself.

### 4. Distribution to ChatGPT users specifically

This is less a feature and more a market access question. ChatGPT has hundreds of millions of users. The Apps SDK is the only way to reach them through OpenAI's surface. The open MCP spec gets you reach across every other host, but not the ChatGPT user base unless ChatGPT supports a particular open server.

Everything else, the sandboxing, the iframe rendering, the JSON-RPC audit trail, the tool declarations, is the same on both sides because the OpenAI Apps SDK uses MCP for them.

## When to pick MCP Apps

Pick MCP Apps when:

- You want your tool to work in many AI hosts, not just one.
- You are building for developers, engineers, or technical users who already use Claude, VS Code, or other MCP-supporting tools.
- You want to avoid vendor lock-in.
- You do not need an app store to find users (you have a blog, GitHub, or word of mouth).
- You can handle billing on your own server or simply do not charge for the tool.
- You want to ship today without waiting for store review or approval.

This covers most developer tools, most internal company tools, and most open-source MCP servers.

## When to pick OpenAI Apps SDK

Pick the OpenAI Apps SDK when:

- Your target audience is ChatGPT users specifically. Consumer apps, lifestyle apps, anything aimed at non-developers tend to fit here.
- You need in-chat payments and do not want to build that yourself.
- You want OpenAI to handle distribution through the ChatGPT app store.
- Being ChatGPT-only is acceptable for your business.
- Your product matches what is already in the directory: travel, design, learning, music, real estate.

Booking.com, Canva, Coursera, Figma, Expedia, Spotify, and Zillow chose Apps SDK because they are consumer brands that want ChatGPT users as customers, and they need built-in commerce. Most engineering tools do not need either.

## The smart play: build to the open spec, layer the rest

The cleanest path for almost every developer is this: build your tool as a normal MCP server with MCP Apps for the UI. Your tool then runs everywhere. Inside ChatGPT, feature-detect the OpenAI extras and light them up only when present.

This is what feature detection looks like in your UI template:

```js
// Works in any MCP host
function handlePurchase(itemId) {
  if (window.openai?.requestCheckout) {
    // Running inside ChatGPT — use the built-in flow
    window.openai.requestCheckout({ itemId });
  } else {
    // Running in Claude, VS Code, or any other MCP host — fall back
    window.parent.postMessage({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: 'create_checkout_url', arguments: { itemId } }
    }, '*');
  }
}
```

This is the same idea as progressive enhancement on the web. Build for the lowest common denominator first. If the host has extras, use them. If not, degrade to the open path.

You get reach across every MCP host, and you get the ChatGPT-specific upside when you happen to be running in ChatGPT.

## What the code actually looks like

Here is a minimum MCP server with an MCP App. The server registers a UI template, defines a tool that points to that template, and lets the host handle rendering.

```ts
// MCP Apps: server side
server.registerResource({
  uri: 'ui://invoices/card',
  name: 'Invoice Card',
  mimeType: 'text/html+mcp'
});

server.registerTool({
  name: 'show_invoice',
  description: 'Display an invoice card for the user.',
  inputSchema: {
    type: 'object',
    properties: { invoiceId: { type: 'string' } }
  },
  _meta: {
    'ui/resourceUri': 'ui://invoices/card'
  }
});
```

The matching HTML template lives at `ui://invoices/card`. It runs in the host's sandboxed iframe and talks back through `postMessage`.

```html
<!-- The UI template the iframe renders -->
<div id="invoice-card">
  <h2>Invoice #<span id="number"></span></h2>
  <p>Total: <span id="total"></span></p>
  <button id="pay">Pay now</button>
</div>

<script>
  document.getElementById('pay').addEventListener('click', () => {
    window.parent.postMessage({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: 'create_checkout_url', arguments: {} }
    }, '*');
  });
</script>
```

Now here is the change you add only if you also want native ChatGPT checkout. The server-side code stays exactly the same. The only change is the click handler in the template, the feature-detection block from earlier.

```js
document.getElementById('pay').addEventListener('click', () => {
  if (window.openai?.requestCheckout) {
    window.openai.requestCheckout({ /* ChatGPT-only path */ });
  } else {
    window.parent.postMessage({ /* open MCP path */ }, '*');
  }
});
```

Same server. Same template. The UI adapts to where it is running.

## A simple decision tree

If you are still unsure which to pick, walk through these in order.

1. **Is your audience ChatGPT users specifically?** If yes and only yes, pick the OpenAI Apps SDK.
2. **Do you need in-chat payments and want to avoid building your own flow?** If yes, pick the OpenAI Apps SDK.
3. **Do you want your tool to also work in Claude, VS Code, Goose, and other MCP hosts?** If yes, build to MCP Apps first.
4. **Do you want to avoid being tied to one vendor's product?** If yes, build to MCP Apps.

For most developer tools, the answers point to MCP Apps with optional OpenAI extras layered on top. For most consumer apps with built-in commerce, the answers point to the OpenAI Apps SDK with MCP under the hood.

## Things to watch out for

Two pitfalls catch developers off guard.

The first is **treating `window.openai` as always present.** It only exists inside ChatGPT. If you call it without checking, your iframe breaks on every other host. Always feature-detect.

The second is **assuming your OpenAI app will work in Claude.** Just because the underlying protocol is MCP does not mean every host renders the same way. Claude and ChatGPT have different consent prompts, different iframe sandbox attributes, and different default styles. Test on every host you plan to support.

For broader MCP security context, see [MCP Server Security: Auth, Rate Limits, Audit Logs](/posts/mcp-server-security-guide/). It covers the threat model that applies to both standards equally.

## What this means for the rest of 2026

The 2026-07-28 MCP spec finalizes MCP Apps as a first-class extension. The OpenAI Apps SDK is in preview today and will open up monetization later this year. Expect both sides to grow.

The bet I would make: open MCP becomes the shared base across hosts, and each host adds its own narrow extension on top. Anthropic will likely add more to Claude. Microsoft will add more for VS Code. OpenAI will add more for ChatGPT. The ones that build to the open base will run everywhere. The ones that build only to vendor extras will be stuck where they started.

This is the same shape as the web. HTML is the base. Vendor extensions exist but degrade gracefully. The teams that ship to the open standard reach the most people.

## Closing thoughts

The honest answer to "MCP Apps or OpenAI Apps SDK?" is "both, layered properly." Build your server to MCP. Render your UI with MCP Apps. If you happen to also be in ChatGPT, light up the OpenAI extras for that case. Your tool then works everywhere, and you get the ChatGPT-specific benefits when you are there.

If you only have time for one decision today, the safe one is to start with MCP Apps. You can always add Apps SDK extensions later. The reverse is much harder, because building only to OpenAI's extras commits you to a single host and a single audience.

For the deeper dive into how MCP Apps work under the hood, the templates, the lifecycle, the security model, see the [MCP Apps explainer](/posts/mcp-apps-explained/). For everything else MCP-related, the [MCP server security guide](/posts/mcp-server-security-guide/), the [top 15 MCP servers worth installing in 2026](/posts/best-mcp-servers-2026/), and the [build-your-first-MCP-server tutorial](/posts/build-your-first-mcp-server/) are good next steps.

The protocol layer is open. The vendor layer is optional. Build on the open layer, and you keep your options open.
