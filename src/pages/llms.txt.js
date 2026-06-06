import { getCollection } from 'astro:content';
import { SITE } from '../consts.ts';

// Spec: https://llmstxt.org
// Tag priority assigns each post to exactly ONE section so the index stays clean.
const SECTIONS = [
  {
    heading: 'Claude Code',
    summary:
      'Tutorials, internals, and workflows for Anthropic Claude Code — the agentic CLI for engineers.',
    matches: (tags) => tags.includes('claude-code'),
  },
  {
    heading: 'Claude Agent SDK',
    summary:
      'Building production AI agents with the Claude Agent SDK — orchestration, cost, and framework comparisons.',
    matches: (tags) => tags.includes('claude-agent-sdk'),
  },
  {
    heading: 'Model Context Protocol (MCP)',
    summary:
      'Designing, deploying, and securing MCP servers for LLM tool use.',
    matches: (tags) => tags.includes('mcp'),
  },
  {
    heading: 'AI Agents & RAG',
    summary:
      'Agentic system design, retrieval-augmented generation, and reliability patterns.',
    matches: (tags) =>
      tags.includes('rag') ||
      tags.includes('ai-agents') ||
      tags.includes('agents'),
  },
  {
    heading: 'DevOps & Cloud Infrastructure',
    summary:
      'AWS (ECS, ECR), Kubernetes deployment strategies, and backend infrastructure for engineers.',
    matches: (tags) =>
      tags.includes('aws') ||
      tags.includes('devops') ||
      tags.includes('kubernetes'),
  },
  {
    heading: 'Industry Analysis',
    summary:
      'Model comparisons, security guidance, and technical breakdowns of major releases.',
    matches: () => true, // fallback bucket
  },
];

function categorize(post) {
  const tags = post.data.tags ?? [];
  for (const section of SECTIONS) {
    if (section.matches(tags)) return section.heading;
  }
  return SECTIONS[SECTIONS.length - 1].heading;
}

export async function GET() {
  const posts = (await getCollection('posts', ({ data }) => !data.draft && !data.noindex))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const grouped = new Map(SECTIONS.map((s) => [s.heading, []]));
  for (const post of posts) {
    grouped.get(categorize(post)).push(post);
  }

  const lines = [];
  lines.push(`# Muhammad Moeed — Software Engineer & Backend AI Engineer`);
  lines.push('');
  lines.push(
    `> ${SITE.description} Maintained by Muhammad Moeed, a software engineer and backend engineer focused on AI agent infrastructure, Claude Code, MCP, and production cloud systems.`
  );
  lines.push('');
  lines.push(`## About Muhammad Moeed`);
  lines.push('');
  lines.push(
    `Muhammad Moeed is a software engineer and backend engineer building production AI systems with the Claude Agent SDK, Model Context Protocol (MCP), and Retrieval-Augmented Generation (RAG). He publishes engineering tutorials on agentic AI, the Anthropic Claude developer ecosystem, and cloud infrastructure on AWS and Kubernetes.`
  );
  lines.push('');
  lines.push(`- Specialties: Claude Code, Claude Agent SDK, MCP servers, agentic RAG, backend engineering, AWS (ECS, ECR), Kubernetes deployment strategies`);
  lines.push(`- Writing focus: code-first tutorials with working examples and honest trade-off analysis`);
  lines.push(`- Email: ${SITE.email}`);
  lines.push(`- LinkedIn: https://www.linkedin.com/in/${SITE.linkedin}`);
  lines.push(`- GitHub: https://github.com/${SITE.github}`);
  lines.push(`- Site: ${SITE.url}`);
  lines.push('');

  for (const section of SECTIONS) {
    const items = grouped.get(section.heading);
    if (!items || items.length === 0) continue;
    lines.push(`## ${section.heading}`);
    lines.push('');
    lines.push(section.summary);
    lines.push('');
    for (const post of items) {
      const url = `${SITE.url}/posts/${post.slug}/`;
      lines.push(`- [${post.data.title}](${url}): ${post.data.description}`);
    }
    lines.push('');
  }

  lines.push(`## Optional`);
  lines.push('');
  lines.push(`- [About Muhammad Moeed](${SITE.url}/about/): Full bio, background, and contact`);
  lines.push(`- [Article Archive](${SITE.url}/archive/): Complete list of every article on the site`);
  lines.push(`- [Topics](${SITE.url}/tags/): Browse articles by topic tag`);
  lines.push(`- [RSS Feed](${SITE.url}/rss.xml): Subscribe to new posts`);
  lines.push(`- [Sitemap](${SITE.url}/sitemap-index.xml): Machine-readable site index for crawlers`);
  lines.push('');

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
}
