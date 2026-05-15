// Single source of truth for site-wide constants.
// Update SITE.url to your final domain after DNS is connected.

export const SITE = {
  url: 'https://moeed.app',
  title: 'Moeed Rajpoot — Claude Code, Agent SDK & MCP Engineering',
  shortTitle: 'Moeed Rajpoot',
  description:
    'Production-grade tutorials on Claude Code, Claude Agent SDK, MCP servers, RAG, and AI agent engineering by a senior backend + AI engineer.',
  author: 'Moeed Rajpoot',
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
    'Tutorials, hooks, slash commands, and workflows for Anthropic Claude Code — the agentic CLI for engineers.',
  'claude-agent-sdk':
    'Building production AI agents with the Claude Agent SDK — tool use, memory, sub-agents, and orchestration.',
  mcp: 'Model Context Protocol — building, deploying, and connecting MCP servers to LLMs.',
  rag: 'Retrieval-augmented generation patterns: chunking, embeddings, vector DBs, and reranking that work in production.',
  'ai-agents': 'Agentic system design — planning, tool use, evals, and reliability patterns.',
  tutorials: 'Step-by-step engineering tutorials with full working code.',
};
