// Single source of truth for site-wide constants.
// Update SITE.url to your final domain after DNS is connected.

export const SITE = {
  url: 'https://moeed.app',
  title: 'Muhammad Moeed — Claude Code, Agent SDK & MCP Engineering',
  shortTitle: 'Muhammad Moeed',
  description:
    'Production-grade tutorials on Claude Code, Claude Agent SDK, MCP servers, RAG, and AI agent engineering by a senior backend + AI engineer.',
  author: 'Muhammad Moeed',
  email: 'moeedrajpoot1@gmail.com',
  github: 'moeedrajpoot1',
  linkedin: 'moeed-rajpoot',
  twitter: 'moeedrajpoot',
  locale: 'en-US',
  ogImage: '/og-default.png',
  themeColor: '#0b1020',
} as const;

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/archive', label: 'Articles' },
  { href: '/tags', label: 'Topics' },
  { href: '/about', label: 'About' },
] as const;

export const TAG_DESCRIPTIONS: Record<string, string> = {
  'claude-code':
    'Tutorials and reference guides for Anthropic Claude Code, the agentic command-line tool for software engineers. Articles in this section cover hooks, slash commands, skills, subagents, memory files, the /doctor and /compact commands, and the workflows that hold up in real repos. Every guide is written from real use on production codebases, with named version numbers, exact terminal output, and the actual error messages users hit. If you are new to Claude Code, start with the basics and work outward to the hooks and skills sections.',
  'claude-agent-sdk':
    'Building production AI agents with the Claude Agent SDK in Python and TypeScript. Articles in this section cover tool use, memory, subagents, prompt caching, batch processing, the credit pool billing model, cost tracking, and the differences between the Agent SDK, LangChain, and the Vercel AI SDK. The goal of each guide is to get you from a working hello-world agent to a service you can ship and bill for, without skipping the boring parts (auth, retries, observability, evals).',
  mcp: 'Model Context Protocol guides for engineers building or running MCP servers. Articles in this section cover the 2026-07-28 spec, MCP Apps and the ui:// scheme, how MCP compares to the OpenAI Apps SDK, the OAuth 2.1 changes, the streamable HTTP transport, server security (rate limits, auth, audit logs), the NSA security guidance, and which MCP servers are worth installing in 2026. Each post is written for engineers who want to ship, not just read announcements.',
  rag: 'Retrieval-augmented generation patterns that survive real users. Articles in this section cover chunking strategies, embedding model choice, vector databases (pgvector, Qdrant, Pinecone, Weaviate), reranking, hybrid search, query rewriting, evals, and the operational reality of running RAG in production. The focus is on patterns that work past the demo, including how to measure retrieval quality, when to skip RAG entirely, and how to combine retrieval with tool use in an agentic pipeline.',
  'ai-agents':
    'Agentic system design for production. Articles in this section cover planning, tool use, evals, reliability, memory, multi-agent orchestration, prompt patterns that survive iteration, and the rails (timeouts, budgets, audit logs) that keep agents from going off the rails. Posts compare frameworks where it matters and tell you when a framework is the wrong answer. If you are deciding between a skill, an MCP server, a subagent, and a hook, the comparison guides in this section are the place to start.',
  tutorials:
    'Step-by-step engineering tutorials with working code. Articles in this section walk through real deploys (ECS, ECR, Fargate, App Runner), real integrations (Claude Code skills, MCP servers, Agent SDK workflows), and real debugging sessions (CannotPullContainerError, Claude Code slowness, MEMORY.md cleanup). Each tutorial is end-to-end: prerequisites, exact commands, expected output, and what to check when something goes wrong. If a guide promises a 10-minute walkthrough, it means 10 minutes of real time, not idealised time.',
};
