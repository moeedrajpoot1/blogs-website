---
title: "Top 15 MCP Servers Worth Installing in 2026"
description: "A friendly, hands-picked list of the best MCP servers to use in 2026, with notes on what each one does, who it is for, and when it actually helps."
pubDate: 2026-05-04
author: "Muhammad Moeed"
tags: ["mcp", "ai-agents", "tutorials", "claude-code"]
keywords: ["best mcp servers 2026", "mcp servers list", "claude mcp servers", "mcp server examples", "top mcp servers"]
featured: false
---

The Model Context Protocol, also called MCP, has had a quiet but very steady year. What started as a small standard from Anthropic in late 2024 is now the way most developers connect language models to real systems. By May 2026, there are hundreds of MCP servers available, and the list grows every week. The problem is no longer finding one. The problem is choosing which ones are worth your time.

This post is a careful, opinionated list of fifteen MCP servers that I either use myself or have set up for clients in real projects. The list is organised by what the server is for, so you can scan straight to the section that matches your work. Each entry has a short note on what the server does, what it is good at, and where it can be a little annoying.

If you are completely new to MCP, you may want to read [how to build your first MCP server](/posts/build-your-first-mcp-server) first. It explains the basics in about ten minutes. The rest of this post assumes you know what an MCP server is and how to add one to a client like Claude Desktop or Claude Code.

## How I picked these

I had three rules while making this list.

First, the server has to do something an agent genuinely cannot do well from a normal API call. Wrapping an API in MCP is not always useful. The good ones add either context, persistent state, or safety on top.

Second, it has to work today, in May 2026. A few servers that were popular in early 2025 have been retired or no longer keep up with the protocol. They are not on this list.

Third, I leaned toward servers that are well documented and stable. A clever server that breaks every other week is not worth the maintenance.

## The list at a glance

| # | Server | Best for |
|---|---|---|
| 1 | Filesystem | Letting an agent read and edit local files safely |
| 2 | GitHub | Reading repos, opening PRs, checking issues |
| 3 | Context7 | Up to date library documentation in your prompt |
| 4 | Sentry | Pulling in error data for debugging |
| 5 | Cloudflare | Managing DNS, Pages, and Workers from chat |
| 6 | PostgreSQL | Read only SQL queries against your database |
| 7 | MongoDB | Querying document collections |
| 8 | Redis | Cache and key value lookups |
| 9 | Slack | Reading channels, posting summaries |
| 10 | Notion | Searching and updating Notion pages |
| 11 | Linear | Issue tracking from a chat interface |
| 12 | Google Drive | Reading docs, sheets, and slides |
| 13 | Puppeteer | Browser automation for scraping or testing |
| 14 | Firecrawl | Web scraping with clean markdown output |
| 15 | Memory | Persistent memory that survives across sessions |

## Code and developer tools

These five servers are the ones I install on every dev machine. Together they cover most of the day to day work I do with Claude Code.

### 1. Filesystem (official)

The Filesystem server lets an agent read, write, and edit files inside a folder you choose. It is the foundation of most coding workflows.

What I like about it is the safety. You give it a list of allowed directories, and it will not touch anything outside them. So even if an agent goes off plan, it cannot delete your home folder.

Use it when: you want an agent to work with a local project but you do not want to grant full shell access. Pair it with a [Claude Code hook](/posts/claude-code-hooks-complete-guide) that runs Prettier or your linter after every edit, and the workflow is hard to beat.

Where it can be annoying: it does not handle very large binary files well. For images and videos you are better off referencing them with a URL.

### 2. GitHub (official)

The GitHub MCP server is one of the most polished. It can list issues, read pull request diffs, leave comments, create branches, and open PRs. With a personal access token in scope, you can have an agent fully participate in your repo without giving it shell access.

Use it when: you want to triage issues from chat, draft PR descriptions, or have an agent review a colleague's PR before you do.

Where it can be annoying: rate limits. If you give an agent free reign and it tries to read fifty issues at once, you will hit the API limit. A small wrapper script that batches calls helps.

### 3. Context7 (community)

This one is quietly excellent. Context7 fetches the latest documentation for popular libraries (React, Astro, Django, FastAPI, and many more) and pulls it into the agent's context as it works. So instead of the model guessing the API of a library based on training data from a year ago, it has the current docs in front of it.

Use it when: you are working with a library that changes often, or one that has had a major version bump in the last six months.

Where it can be annoying: it can use a fair amount of context if the docs are long. I recommend pairing it with a hook that only triggers when a relevant import is detected in the file.

### 4. Sentry

The Sentry MCP server lets you pull error reports straight into a debugging session. You ask the agent to look at the latest errors in your service, and it can read the stack traces, the breadcrumbs, and the user context, then suggest a fix.

Use it when: you are tired of copy pasting stack traces from the Sentry web UI into your editor.

Where it can be annoying: it works best when your project already has good error grouping. If your Sentry is full of noise, the agent will struggle to find signal too.

### 5. Cloudflare (official)

Cloudflare's own MCP server lets you manage Pages projects, Workers, DNS records, and KV storage from a chat. So if you are setting up a new domain, you can ask an agent to walk through it instead of clicking through the dashboard.

Use it when: you have a few Cloudflare resources and want to automate small admin tasks. Useful for deploying a static site, adding DNS records, or rotating a secret.

Where it can be annoying: like all admin tools, you should keep the credentials read only or scoped to one project. Do not give an agent your full account token.

## Databases

You only need one of these three at a time. Pick the one that matches the data store you actually use.

### 6. PostgreSQL (official)

The Postgres MCP server is read only by default, which is exactly what you want when an LLM is in the loop. The agent can run `SELECT` queries, look at schemas, and explore your data, but it cannot delete a table by accident.

Use it when: you want to ask data questions in plain English without writing the SQL yourself, or when you are building an internal analytics tool.

Where it can be annoying: large query results will overflow context. Use `LIMIT` aggressively, or wrap the server with a small adapter that summarises before returning.

### 7. MongoDB

Same idea as the Postgres server, but for document stores. It can query collections, look at indexes, and explore aggregation pipelines.

Use it when: your team uses MongoDB and you want a friendly query interface.

Where it can be annoying: MongoDB schemas are flexible, which means the agent sometimes needs more help understanding what fields a collection has. A good description of the data in your prompt makes a big difference.

### 8. Redis

The Redis server is small and focused. It does `GET`, `SET`, key listing, and TTL inspection. That is it.

Use it when: you want to debug cache state during development, or build small admin tools around your Redis.

Where it can be annoying: it really is small. For anything beyond simple lookups you will want a custom server.

## Productivity tools

The next four are not for code. They are for the work around the work.

### 9. Slack

The Slack MCP server can read channel history, search messages, and post replies. With it, you can ask an agent to summarise yesterday's discussion in a channel before a standup, or to draft a status update based on what your team posted.

Use it when: your team lives on Slack and you want help triaging the firehose.

Where it can be annoying: you must be careful with the token's scope. Read only is the right default. Posting to channels should require explicit confirmation.

### 10. Notion

The Notion server can search workspaces, read pages, and update them. It is one of the more polished community servers, and the team behind it has kept up with Notion's API changes.

Use it when: your knowledge base lives in Notion. It pairs nicely with the Linear server below, since you can move from a customer note in Notion to a tracked issue in Linear in one step.

Where it can be annoying: Notion's API is rate limited, and large documents can take a moment to load. Patience helps.

### 11. Linear

The Linear server reads issues, creates new ones, updates status, and posts comments. If your team uses Linear for project tracking, this is the one to install.

Use it when: you spend more time updating Linear than doing the actual work the issue describes.

Where it can be annoying: workflows are hard for an agent to model. Telling it the rules of your team's process (which issues need triage, which go straight to in progress, and so on) takes a small bit of prompt setup.

### 12. Google Drive

The Drive server can list files, read documents, search across a workspace, and even export sheets. It is one of the official ones from Anthropic and feels stable.

Use it when: your team's writing lives in Google Docs and you want an agent that can pull from it.

Where it can be annoying: the OAuth setup is the longest of any server on this list. Budget about ten minutes the first time.

## Web and browser

These two come up whenever an agent needs to look at something on the open web.

### 13. Puppeteer

The Puppeteer server gives an agent a real headless browser. It can navigate to a URL, click buttons, fill forms, and take screenshots. It is the right choice when you need full control of a page.

Use it when: you are scraping a site that needs login, or you are running a browser based test from a conversation.

Where it can be annoying: it is heavier than a simple HTTP fetcher. If all you want is the readable text of a page, the next entry is lighter.

### 14. Firecrawl

Firecrawl scrapes a web page and returns clean markdown. It handles redirects, follows simple JavaScript, and strips out ads, navigation, and other clutter. The result is exactly the kind of input a language model wants.

Use it when: you want to read a long article inside an agent without all the noise. Or when you are building a research helper that needs to look across many pages quickly.

Where it can be annoying: some sites block crawlers. Firecrawl has caching and politeness features, but it is not magic.

## Memory and reasoning

One last server, but an important one.

### 15. Memory (official)

The Memory server is one of the more interesting community contributions. It gives an agent a small persistent memory that survives across sessions. So things you tell the agent about yourself, your preferences, or your project are remembered the next time you talk to it.

Use it when: you want a more personalised assistant. Especially useful for daily workflows where you would otherwise have to re explain context every morning.

Where it can be annoying: it is tempting to dump everything into memory, but quality matters more than quantity. Keep memories short, specific, and meaningful. Long, vague memories make the agent slower and less helpful.

## How to install any MCP server

Most of the servers on this list use the same install pattern. The exact details are in each server's README, but the general flow is short. Here are the steps.

### Step 1, find the install command

Each server's repository has an install command, usually in the form `npx -y some-mcp-server` or `python -m some_mcp_server`. Copy it.

### Step 2, add it to your client config

For Claude Desktop, open `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, or the equivalent location on your platform. Add the server under `mcpServers` like this.

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/projects"]
    }
  }
}
```

For Claude Code, you can use the command line.

```bash
claude mcp add filesystem npx -y @modelcontextprotocol/server-filesystem /Users/you/projects
```

### Step 3, set any required tokens

Most servers that touch a third party service need a token. Set it as an environment variable in the same config block.

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_yourTokenHere"
      }
    }
  }
}
```

Keep these tokens out of git. A `.gitignore`d local config is the right home for them.

### Step 4, restart your client

Restart Claude Desktop or Claude Code. You should see the server appear in the list of available MCP servers. If it does not show up, the logs will tell you what went wrong, usually a typo in the path or a missing token.

## A small piece of advice

It is easy to install a dozen servers and feel productive. In practice, the agents I work with day to day usually have three to five active at any time. More than that and the model's context fills up with tool descriptions, and the quality of replies drops.

Start with two or three from this list. Live with them for a week. Add more only when you find a specific job none of your current servers can do.

## Common questions

**Are MCP servers safe to install?**
Most are, but treat them like any other software you run. Look at the README, check who maintains the project, and prefer official servers when one exists. Run community servers with care, especially if they have access to your credentials.

**Will MCP servers work with models other than Claude?**
Yes. The protocol is open. By 2026 it is supported by Cursor, Cline, Windsurf, and a growing number of other clients. The same server you set up once works in all of them.

**Can I write my own MCP server?**
Absolutely. If you have a service that the public servers do not support, writing your own takes a few hours. The [first MCP server tutorial](/posts/build-your-first-mcp-server) walks through it end to end.

**Do MCP servers cost extra?**
The servers themselves are free. You may pay for the underlying service (Sentry, Notion, Postgres hosting, and so on), and you will pay your model provider for the tokens used to call the tools. The protocol does not add any cost on top.

## Where to go next

If you found a server here that you want to set up, the next step depends on what kind of work you do.

For coding workflows, look at the [Claude Code hooks guide](/posts/claude-code-hooks-complete-guide) and pair a hook with the Filesystem and GitHub servers above.

For agent product work, the [Claude Agent SDK vs LangChain comparison](/posts/claude-agent-sdk-vs-langchain) and the [Claude Agent SDK vs Vercel AI SDK 6 comparison](/posts/claude-agent-sdk-vs-vercel-ai-sdk) explain how to pick a runtime and wire MCP servers into your own agent, instead of inside Claude Desktop.

Before any of these touch production, read the [MCP server security guide](/posts/mcp-server-security-guide). The single most common mistake on new MCP servers is shipping them without auth, rate limits, or an audit trail.

The MCP ecosystem moves quickly. I update this list every few months, so if you are reading this in late 2026 or 2027, do check the date at the top of the post and treat older entries as a starting point rather than the final word.
