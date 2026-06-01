---
title: "How to Build Your First MCP Server, Step by Step"
description: "A short and friendly walk through of building a Model Context Protocol server in Node.js. Plain code, no jargon, and the small mistakes to watch for."
pubDate: 2026-05-04
author: "Muhammad Moeed"
tags: ["mcp", "tutorials", "claude-code", "ai-agents"]
keywords: ["mcp server", "model context protocol", "build mcp server", "mcp tutorial", "claude mcp"]
featured: true
---

The Model Context Protocol, usually called MCP, is the simplest way to give a language model your own custom tools. Anthropic shared it openly in late 2024 and by 2026 it has become the standard for connecting AI apps to real systems.

This guide walks through building a small MCP server in Node.js. The whole thing fits in around forty lines of code, so we will go gently and explain each part. By the end you will have a server that Claude Desktop and Claude Code can talk to, and you will know how to add your own tools to it.

## What MCP is, in one paragraph

MCP is a small protocol based on JSON RPC. An MCP client, like Claude Desktop or Claude Code, connects to an MCP server. The server can offer three kinds of things to the model. Tools are functions the model can call. Resources are read only data the model can fetch. Prompts are templates the user can pick from a menu. That is the whole protocol.

Compared to writing custom tool calls inside your code each time, MCP has three nice properties. The same server works with any MCP client. The server runs in its own process, so it can be written in any language. And clients learn what tools are available on their own, so you do not have to wire up the schema by hand.

## What we are going to build

A small server called `weather-mcp` that offers one tool, `get_weather(city)`. The tool will return a simple string, and we will use the official Anthropic SDK with stdio, which is the easiest way for a client to talk to a local server.

## Step one, set up the project

Open a fresh folder and run the following.

```bash
mkdir weather-mcp && cd weather-mcp
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node tsx
npx tsc --init
```

Then open `package.json` and replace the contents with this small starter.

```json
{
  "name": "weather-mcp",
  "version": "0.1.0",
  "type": "module",
  "bin": { "weather-mcp": "dist/index.js" },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts"
  }
}
```

In `tsconfig.json`, set `module` to `ESNext`, `target` to `ES2022`, `moduleResolution` to `Bundler`, and `outDir` to `dist`. The other defaults are fine.

## Step two, write the server

Create `src/index.ts` and paste in the following.

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const server = new Server(
  { name: 'weather-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

// Tell clients what tools we offer.
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_weather',
      description: 'Get current weather for a city.',
      inputSchema: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name, for example Lahore.' },
        },
        required: ['city'],
      },
    },
  ],
}));

// Handle a call to the tool.
const GetWeatherInput = z.object({ city: z.string().min(1) });

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'get_weather') {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
  const { city } = GetWeatherInput.parse(request.params.arguments);

  // Replace this with a real API call when you are ready.
  const weather = `Weather in ${city}: 28C, partly cloudy.`;

  return {
    content: [{ type: 'text', text: weather }],
  };
});

// Start listening on stdio.
const transport = new StdioServerTransport();
await server.connect(transport);
```

That is the whole server. About forty lines, including imports.

## Step three, run a quick test

Build the project and start it.

```bash
npm run build
node dist/index.js
```

The server is now sitting quietly, waiting for messages on its standard input. To check that it works without involving Claude, send it a small probe.

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

You should see a response that lists your `get_weather` tool. If you do, the server is healthy.

## Step four, connect it to Claude Desktop

Find the Claude Desktop config file. On macOS it is at `~/Library/Application Support/Claude/claude_desktop_config.json`. Open it and add your server.

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/absolute/path/to/weather-mcp/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop. You should see a small plug icon. Click it, and your `weather` server should be in the list. Now ask Claude something like *what is the weather in Karachi*, and it will quietly call your tool and use the result in its reply.

## Step five, connect it to Claude Code

In Claude Code there are two ways. The quickest is from the command line.

```bash
claude mcp add weather node /absolute/path/to/weather-mcp/dist/index.js
```

Or you can edit `~/.claude/settings.json` directly.

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/absolute/path/to/weather-mcp/dist/index.js"]
    }
  }
}
```

Restart Claude Code, run `/mcp`, and your tool should appear.

## The three small mistakes everyone makes

These are the issues I see most often when teams build their first server.

**Logging to standard output breaks the protocol.** MCP uses stdio for the JSON RPC traffic, which means anything you print with `console.log` becomes a corrupted message. Claude will fail in a way that does not produce a useful error. Always use `console.error` for any logging, since that goes to standard error and does not interfere.

**Forgetting to validate inputs.** The model can pass anything in as arguments, including types you did not expect. Validate every input with Zod or a similar tool. If the server crashes, the whole tool goes offline until Claude restarts.

**Not handling slow tools.** If your tool takes more than ten seconds, the user just stares at a blank screen. Either keep tools quick, or send progress notifications back so the user knows something is happening.

## When MCP is the right choice

Use MCP when the tool is going to be reused. If the same tool needs to work in Claude Desktop, in Claude Code, and in Cursor, MCP is by far the cleanest path. It is also a good fit when the tool needs persistent state, since the server can hold caches and connections in memory.

For a one off script, you may want a Claude Code [hook](/posts/claude-code-hooks-complete-guide) instead. For a tool that lives only inside your own product, the [Claude Agent SDK](/posts/claude-agent-sdk-vs-langchain) is often a better home.

## What to build after the hello world

Real MCP servers I have shipped tend to fall into a few patterns.

A database query server with a small allowed list of read only queries. An internal API wrapper that injects auth tokens server side, so the model never sees them. A vector search server over a private knowledge base. A deploy server that requires a Slack approval before it runs.

The pattern is always the same. Declare your tools, validate the inputs, return text. The forty line example above gets you remarkably far before you need anything more.

## Where to go next

- [Claude Code hooks: a friendly guide](/posts/claude-code-hooks-complete-guide), for the simpler kind of automation that does not need a server at all.
- [Claude Agent SDK vs LangChain](/posts/claude-agent-sdk-vs-langchain), for when you want to embed an agent inside your own product.
- [MCP server security: auth, rate limits, audit logs](/posts/mcp-server-security-guide), the next thing to read before you take any MCP server to production.
- [NSA MCP security guidance, translated for developers](/posts/nsa-mcp-security-guidance), the four named controls every production MCP server should ship.
- [Agentic RAG with the Claude Agent SDK and pgvector](/posts/agentic-rag-tutorial), if the data your tools return is going to come from a vector store.

Once you have shipped your first MCP server, you will likely find five more places where one fits. Start with something small, like the weather example. Get it into Claude. Watch it work. Then keep adding.
