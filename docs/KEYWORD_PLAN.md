# Keyword Plan — First 25 Articles

A topical cluster strategy targeting 4 pillar topics. Articles within a cluster link to each other, building topical authority Google rewards in 2026.

## Strategy

We're attacking 4 topical pillars with rising search volume and weak competition:

1. **Claude Code** — pillar
2. **Claude Agent SDK** — pillar
3. **MCP (Model Context Protocol)** — pillar
4. **Production RAG** — pillar

Each pillar gets 6–7 articles. Each article targets a specific long-tail keyword, links back to the pillar tag page, and links sideways to 2 sibling articles in the same cluster.

## Cluster 1: Claude Code (already started)

| # | Article | Primary keyword | Status |
|---|---|---|---|
| 1 | Claude Code Hooks: The Complete Guide | "claude code hooks" | ✅ Published |
| 2 | Claude Code Slash Commands Cheatsheet | "claude code slash commands" | TODO |
| 3 | Claude Code vs Cursor: 90 Days With Both | "claude code vs cursor" | ✅ Published |
| 4 | Claude Code Ultraplan: Hands-On Guide | "claude code ultraplan" | ✅ Published |
| 5 | Claude Code MCP Setup in 5 Minutes | "claude code mcp" | TODO |
| 6 | Best Claude Code Settings for Teams | "claude code settings.json" | TODO |
| 7 | Claude Code in Docker / CI | "claude code ci" | TODO |
| 8 | Claude Code Memory & CLAUDE.md Patterns | "claude code memory" | TODO |
| 9 | How Anthropic's Own Teams Use Claude Code | "how anthropic teams use claude code" | ✅ Published |
| 10 | Is There a Claude Code Certification? | "claude code certification" | TODO |
| 11 | Claude Code /goal and Agent View: A Practical Guide | "claude code goal command" | ✅ Published |
| 12 | Claude Code Slow or Worse? How to Diagnose and Fix It (2026) | "claude code slow" | ✅ Published |

Articles 9–11 added from Google Trends + news-peg research (May 2026): "anthropic claude code teams pdf" was a +1,400% breakout with no quality competition; "claude code certification" a +60% riser with evergreen, monetizable intent (Anthropic Academy / Coursera); /goal + Agent View are fresh from the "Code w/ Claude 2026" event (v2.1.139) with a weak SERP (changelogs + news roundups, no deep guide), published into the freshness window. Next: #10 certification (evergreen affiliate).

Article 12 (Claude Code Slow or Worse) shipped 2026-05-23 as the SECOND article of the day. Targets gap in the SERP for "claude code slow / got worse / degradation". Anthropic published the April 23 postmortem and Fortune/VentureBeat/Register covered it as news; NO tutorial-style how-to-diagnose-and-fix guide existed. Calm, both-sides tone (not pitchforks, not apologetics). Inbound links from 4 sibling Cluster 1 articles (hooks, anthropic-teams, /goal+Agent View, vs-cursor) — plus auto related-posts widget. Highest expected CTR of any article shipped so far because the query intent is acute pain ("Claude broken, what do I do").

## Cluster 2: Claude Agent SDK

| # | Article | Primary keyword | Status |
|---|---|---|---|
| 8 | Claude Agent SDK vs LangChain | "claude agent sdk vs langchain" | ✅ Published |
| 9 | Claude Agent SDK Quickstart (Python) | "claude agent sdk python" | TODO |
| 10 | Claude Agent SDK Tool Use Patterns | "claude agent sdk tools" | TODO |
| 11 | Sub-Agents with Claude Agent SDK | "claude sub agents" | TODO |
| 12 | Streaming Responses with Agent SDK | "claude agent streaming" | TODO |
| 13 | Cost Optimization with Agent SDK | "claude agent caching" | TODO |
| 14 | Production Logging with Agent SDK | "claude agent observability" | TODO |
| 14a | Claude Agent SDK vs Vercel AI SDK 6: Which to Pick (2026) | "claude agent sdk vs vercel ai sdk" | ✅ Published |
| 14b | Microsoft RAMPART for Claude Agents: A Hands-On Guide (2026) | "microsoft rampart claude agents" | ✅ Published |
| 14c | Claude Agent SDK Cost Tracking: A Practical Guide (2026) | "claude agent sdk cost tracking" | ✅ Published |

Article 14c (Claude Agent SDK Cost Tracking) shipped 2026-06-05. Pegged to the June 15, 2026 billing change where Agent SDK / `claude -p` / GitHub Actions / third-party agents move off the subscription pool onto a per-user dollar credit ($20 Pro / $100 Max 5x / $200 Max 20x). The general "what changes June 15" SERP is saturated with 10+ news pieces (FindSkill decision table, BuildThisNow mechanics, ApiYi 5-key-points, ThePlanetTools migration playbook, etc.) — so this piece deliberately AVOIDS that crowded keyword and targets the under-served `claude agent sdk cost tracking` lane (only Anthropic docs + 2 weak competitors), then captures spillover from the billing-change panic via long-tail keywords. Format = developer tutorial with Python+TypeScript code, the duplicate-message-ID parallel-tool gotcha, cache math (`cache_read_input_tokens` at ~10% of input rate), a 3-line plan-sizing formula, and an explicit warning that `total_cost_usd` is a client-side estimate and the Cost API is authoritative. Inbound links from 5 sibling articles (vercel SDK, langchain, managed-agents, microsoft-rampart, claude-code-slow-fix) plus auto related-posts widget. STRATEGIC RATIONALE: GSC shows we are stuck at avg pos 10.8 across the Claude cluster. Publishing more page-2-ranking articles won't fix that. This piece targets an EMPTY SERP we can plausibly rank page 1 within days, AND it strengthens the Cluster 2 internal-linking graph to pull existing Agent SDK posts up.

Article 14b (Microsoft RAMPART for Claude Agents) shipped 2026-05-25. Same SERP-gap pattern as NSA MCP: 9+ news articles, ZERO developer-translation tutorial. Translates Microsoft's May 20, 2026 RAMPART release into a hands-on guide for Claude Agent SDK users with adapter code pattern, CI roadmap, and explicit caveats on what RAMPART does NOT catch. Pairs as companion article to NSA MCP guidance (both AI security, mutual cluster reinforcement). Inbound links from 4 sibling articles (nsa-mcp-security-guidance, mcp-server-security-guide, agent-sdk-vs-vercel, agent-sdk-vs-langchain) plus auto related-posts widget. Enterprise dev audience = highest sponsorship/consulting lead potential alongside NSA MCP.

Article 14a (Claude Agent SDK vs Vercel AI SDK 6) shipped 2026-05-23. Comparison format = high CTR (decision-stage developers click every result). Vercel AI SDK 6 launched 2025-12-22 with the first real Agent abstraction; SERP for "claude agent sdk vs vercel ai sdk" had only one quality Medium piece + Vercel's own launch post. Completes the Agent SDK comparison trio with the LangChain article. Internal-links into agent-sdk-vs-langchain, claude-managed-agents-tutorial, build-your-first-mcp-server, claude-code-hooks-complete-guide, agentic-rag-tutorial.

## Cluster 3: MCP

| # | Article | Primary keyword | Status |
|---|---|---|---|
| 15 | How to Build Your First MCP Server | "build mcp server" | ✅ Published |
| 16 | MCP Server in Python (FastMCP) | "fastmcp tutorial" | TODO |
| 17 | Deploying MCP Servers to Production | "mcp server deploy" | TODO |
| 18 | MCP Authentication Patterns | "mcp auth" | TODO |
| 19 | Top 10 MCP Servers Worth Using | "best mcp servers" | TODO |
| 20 | MCP Resources vs Tools vs Prompts | "mcp resources tutorial" | TODO |
| 20a | NSA MCP Security Guidance: A Developer's Action List (2026) | "nsa mcp security" | ✅ Published |

Article 20a (NSA MCP Security Guidance) shipped 2026-05-24. News-peg article on the NSA Cybersecurity Information Sheet published May 20, 2026. SERP had 10 journalism summaries but ZERO developer-translation tutorial — that was the gap. Translates the abstract NSA threats into a concrete 6-item action list. Tone is calm, both-sides, with explicit caveats on what NSA guidance does NOT cover. Inbound links from 3 MCP cluster siblings (mcp-server-security-guide, build-your-first-mcp-server, best-mcp-servers-2026) plus auto related-posts widget. Enterprise/security-team audience = strongest consulting/sponsorship lead potential of any article so far.

## Cluster 4: Production RAG

| # | Article | Primary keyword | Status |
|---|---|---|---|
| 21 | RAG Architecture for Production | "production rag" | TODO |
| 22 | Pinecone vs Weaviate vs Qdrant 2026 | "pinecone vs weaviate vs qdrant" | TODO |
| 23 | Hybrid Search: BM25 + Embeddings | "hybrid search rag" | TODO |
| 24 | Reranking Strategies that Actually Work | "rag reranking" | TODO |
| 25 | RAG Evaluation: Metrics that Matter | "rag evaluation" | TODO |

## Cluster 5: AWS / DevOps

Second content pillar, backed by first-hand DevOps experience (real E-E-A-T, not keyword-chasing). The ECS guide is the pillar; siblings link back to it and sideways to each other. This cluster also has the strongest affiliate potential after RAG, since DevOps readers have budget authority.

| # | Article | Primary keyword | Status |
|---|---|---|---|
| 26 | What Is AWS ECS and How It Works (Beginner Guide) | "what is aws ecs" | ✅ Published |
| 27 | What Is AWS ECR and How It Works | "what is aws ecr" | ✅ Published |
| 28 | ECS vs EKS: Which One to Pick | "ecs vs eks" | TODO |
| 29 | Fargate vs EC2 Launch Type: Cost Breakdown | "fargate vs ec2 cost" | TODO |
| 30 | Deploy a Docker Container to ECS Fargate | "deploy docker to ecs fargate" | TODO |
| 31 | ECS CI/CD with GitHub Actions | "ecs github actions deploy" | TODO |
| 32 | CannotPullContainerError in ECS: 7 Causes and Fixes (2026) | "cannotpullcontainererror ecs" | ✅ Published |
| 33 | ECS Networking: VPC, Subnets, ALB Explained | "ecs networking explained" | TODO |
| 34 | What Is AWS ECS Express Mode (and When to Use It) | "what is aws ecs express mode" | ✅ Published |
| 35 | AWS Copilot CLI End of Support: Migration Guide for 2026 | "aws copilot cli end of support" | ✅ Published |

Article 34 added from May 2026 trend research: ECS Express Mode (re:Invent 2025 feature, adoption rising through 2026) had a weak SERP (AWS docs + conference recaps, no quality beginner explainer) and slots straight into the ECS pillar for fast indexing.

Article 35 added on the AWS Copilot CLI end-of-support news peg (hard deadline June 12, 2026). Near-empty SERP outside the AWS deprecation notice itself. AWS officially recommends migrating to ECS Express Mode (#34) or AWS CDK L3 constructs, so this article funnels readers directly into the Express Mode pillar piece. Bottom-of-funnel migration intent — higher conversion potential than informational searches.

Article 32 (CannotPullContainerError) shipped 2026-05-20 as a click-optimized piece: error troubleshooting has the highest CTR format in tech (frustrated developers click every result). Steady search demand (not deadline-bound), weak SERP dominated by fragmented Stack Overflow threads. Pillar internal-link from this post into ECS / ECR / Express Mode / Copilot EOL — strengthens topical cluster signal across Cluster 5.

## Affiliate opportunities by cluster

| Cluster | Affiliate programs |
|---|---|
| Claude Code | (no direct affiliate) — sponsorship potential |
| Agent SDK | Anthropic credits via partner programs, observability tools |
| MCP | Tooling vendors building MCP servers |
| RAG | **Pinecone**, **Weaviate**, **Qdrant Cloud**, **Voyage AI**, **Cohere** — $50–200/conversion |
| AWS / DevOps | **Better Stack**, **Datadog**, **Vantage**, **CloudZero**, **Pulumi**, **Spacelift**, **Snyk** — recurring commissions; the Fargate-vs-EC2 cost post is the natural placement for cost tools |

The RAG cluster has the strongest affiliate revenue potential, with AWS/DevOps a close second. Prioritize publishing those once 2 articles in each other cluster are live.

## Publishing cadence

- **Months 1–3:** 2 articles/week → reach 24 articles
- **Months 4–6:** 1 article/week + update cycle on top 5 performers
- **Months 6+:** 1 deep article every 2 weeks + 1 short take per week

Quality compounds. 50 great articles outrank 500 mediocre ones in 2026.
