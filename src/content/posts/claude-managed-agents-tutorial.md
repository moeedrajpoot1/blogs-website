---
title: "Claude Managed Agents: A Production Tutorial for 2026"
description: "Build your first Claude Managed Agent step by step: agent, environment, session, streaming events, rate limits, and the production gotchas no one mentions."
pubDate: 2026-05-09
author: "Moeed Rajpoot"
tags: ["claude-agent-sdk", "ai-agents", "tutorials"]
keywords: [
  "claude managed agents",
  "claude managed agents tutorial",
  "claude managed agents api",
  "claude managed agents quickstart",
  "claude managed agents python",
  "claude agents production",
  "anthropic managed agents",
  "managed-agents-2026-04-01",
  "claude agent sessions",
  "claude agent environments"
]
featured: false
---

If you have ever tried to ship an AI agent to production, you already know the part nobody warns you about. The model is the easy bit. The real work is the harness around it. A safe place to run code. A way to keep state. A way to stream events back. Tool execution that does not crash on the third call. A queue. Logs. Retries. By the time the agent does anything useful, you have written a small distributed system.

Claude Managed Agents is Anthropic's answer to that. You define the agent once. Anthropic runs the container, the tools, the streaming, the state. You get an API that talks in events, and the agent works inside a sandboxed cloud environment you do not have to maintain.

This post is a clean walkthrough for 2026. What Managed Agents actually is, the four concepts you need to understand, a working session you can copy and run, and the production gotchas I have hit so you do not have to.

> **TL;DR.** Claude Managed Agents is a hosted runtime for autonomous agents. You create an `agent` (model + tools), an `environment` (container template), then start a `session` and stream `events`. All requests need the `managed-agents-2026-04-01` beta header. Rate limits sit at 300 RPM for create endpoints and 600 RPM for read endpoints.

## What Claude Managed Agents actually is

Anthropic now ships two ways to build with Claude.

| | Messages API | Claude Managed Agents |
|---|---|---|
| What it is | Direct model prompting | Hosted agent harness with a sandboxed container |
| Best for | Custom loops you fully control | Long-running, multi-step tasks |
| You manage | The whole loop, sandbox, tools | Just the agent definition and the events |
| State | Stateless per request | Stateful sessions with persistent filesystem |

The Messages API is the right choice when you want fine-grained control over every model call and you already have your own infrastructure. Managed Agents is the right choice when the agent runs for minutes or hours, calls a lot of tools, and you would rather not babysit a container fleet to make that happen.

Managed Agents is currently in beta. Every endpoint requires the header `anthropic-beta: managed-agents-2026-04-01`. The official SDKs add it for you. If you are calling the API with curl, you must add it yourself or you will get a clean 4xx and waste an hour wondering why.

## The four concepts you have to understand

Managed Agents only has four moving parts. Get these right and the rest is plumbing.

| Concept | What it is | Created how often |
|---|---|---|
| **Agent** | Model, system prompt, tools, MCP servers, skills | Once per use case, then versioned |
| **Environment** | Container template: packages, networking, mounted files | Once per environment shape |
| **Session** | A running agent inside an environment, doing one task | Per task |
| **Events** | Messages between your app and the agent | Many per session |

A good way to remember it: **agent is the recipe, environment is the kitchen, session is the meal, events are the conversation while it is being cooked**. The first two you reuse. The last two are fresh every time.

## Prerequisites

You need three things before any of this works.

1. An Anthropic [Console account](https://console.anthropic.com/) with an API key.
2. The Anthropic SDK in your language. I will use Python in this post; Node, Go, Java, Ruby, and C# all work the same way.
3. The beta header on every request. The SDK sets it for you. Curl callers, set it manually.

```bash
pip install anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
```

That is the entire setup. No infrastructure, no Docker, no queue.

## Step 1: create the agent

The agent is the long-lived definition of *what* you are building. Model, system prompt, tools.

```python
from anthropic import Anthropic

client = Anthropic()

agent = client.beta.agents.create(
    name="Coding Assistant",
    model="claude-opus-4-7",
    system="You are a careful coding assistant. Write small, well-tested code. Ask before deleting files.",
    tools=[
        {"type": "agent_toolset_20260401"},
    ],
)

print(f"Agent ID: {agent.id}, version: {agent.version}")
```

A few things worth pointing out.

- `agent_toolset_20260401` is a single line that turns on the full pre-built kit: bash, file read/write/edit, glob, grep, web search, web fetch. You almost always want it.
- Agents are versioned. Every time you change the system prompt or tools, a new version is created and the old one keeps working. This matters in production. You can pin a session to a specific agent version so a deploy of a new prompt does not break a session that is already running.
- Save the `agent.id` somewhere persistent. You reference it from every session.

## Step 2: create the environment

The environment is the container the agent runs inside. You are configuring the box, not the agent.

```python
environment = client.beta.environments.create(
    name="quickstart-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)

print(f"Environment ID: {environment.id}")
```

`networking.type` is the part most people get wrong on the first try. `unrestricted` lets the agent reach any host. That is fine for prototypes and absolutely wrong for production. For real workloads, you should be restricting outbound traffic to the hosts the agent actually needs. Even for a coding agent, that is usually your git host, your package registry, and not much else.

Environments are reusable. You do not need a new one per session. One coding environment, one data-science environment, one browser-automation environment, and you are done.

## Step 3: start a session

A session is a running instance of the agent inside the environment. One task per session is the rule of thumb.

```python
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    title="Generate a Fibonacci script",
)

print(f"Session ID: {session.id}")
```

Sessions hold state. The container's filesystem persists across events inside the same session, and the conversation history is server-side. That is the whole point: you can come back to a session, send another message, and the agent picks up where it left off. It also means sessions cost real money to keep around. Close them when you are done.

## Step 4: send events and stream the response

Now the actual work. You open a stream, send a `user.message` event, and read events as they come back.

```python
with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(
        session.id,
        events=[
            {
                "type": "user.message",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Create a Python script that generates the first "
                            "20 Fibonacci numbers and saves them to fibonacci.txt"
                        ),
                    },
                ],
            },
        ],
    )

    for event in stream:
        match event.type:
            case "agent.message":
                for block in event.content:
                    print(block.text, end="")
            case "agent.tool_use":
                print(f"\n[Using tool: {event.name}]")
            case "session.status_idle":
                print("\n\nAgent finished.")
                break
```

What you should see in the output is the agent thinking out loud, calling `write` to create the file, calling `bash` to run it, then a `session.status_idle` event when there is nothing left to do.

A subtle but important detail: the API buffers events until the stream attaches. That is why the example opens the stream before sending the user message. If you send the message first and the stream connects late, you will still get every event, but you might see them all arrive in a burst instead of as a stream. Open the stream first.

## What is happening under the hood

When you send a user event, Managed Agents does five things.

1. Provisions a container based on your environment config (or reuses a warm one).
2. Runs the Claude agent loop, deciding which tool to call next.
3. Executes tools inside the container — file writes, bash, web fetches.
4. Streams events to your stream as they happen.
5. Emits `session.status_idle` when the agent has nothing more to do, so you know it is safe to close.

You can also send another `user.message` mid-flight. The agent will see it as a steering message and adjust. This is genuinely useful — it lets you nudge the agent without restarting the session.

## Production: the things that bite you

I have run Managed Agents on real workloads. Here is what nobody tells you in the quickstart.

### Rate limits are tight enough to plan around

Managed Agents has its own rate limits, separate from the Messages API:

| Endpoint type | Limit |
|---|---|
| Create endpoints (agents, sessions, environments, events) | **300 requests / minute** |
| Read endpoints (retrieve, list, stream) | **600 requests / minute** |

Three hundred RPM on create is generous for most setups, but if you are spinning up sessions in a fan-out pattern — one session per uploaded file, for example — you will hit it. Put a queue in front of session creation and back off cleanly.

### Container time is part of the cost

You are paying for two things: model tokens and container time. Idle sessions still cost. If you forget a session and it sits around for an hour, the meter is running. Build session cleanup into your shutdown path:

```python
client.beta.sessions.delete(session.id)
```

### Network restrictions are how you stay safe

`networking.type: unrestricted` is the default in every example, including this one. Do not ship that to production. The MCP and tooling docs let you allowlist specific hostnames. Use that. An agent with bash and unrestricted egress is a small RCE waiting to happen.

### Pin agent versions in long-running flows

Agents are versioned for a reason. If you push a new system prompt while a session is running, you do not want it to swap mid-task. Reference the specific version when starting sessions for production runs:

```python
session = client.beta.sessions.create(
    agent={"id": agent.id, "version": agent.version},
    environment_id=environment.id,
)
```

### Webhooks beat polling

For long-running sessions, do not sit on the stream the entire time. Use the webhook configuration in production to get notified when the agent goes idle, then fetch the result. Your servers will thank you.

### Outcomes and multiagent are research preview

Two of the most-asked-about features — `outcomes` (structured task results) and `multiagent` (one agent coordinating others) — are still research preview and require separate access. If you are pitching either of those internally, request access first and do not bake them into a roadmap that needs to ship next week.

## A small but realistic example

Here is the smallest Managed Agents script that does something a non-engineer can recognise as useful: take a CSV path, summarise it, and write the summary back as a new file.

```python
from anthropic import Anthropic

client = Anthropic()

agent = client.beta.agents.create(
    name="CSV Summariser",
    model="claude-opus-4-7",
    system=(
        "You read a CSV file the user gives you, write a short summary of its "
        "rows and columns, and save the summary to summary.md in the same folder. "
        "Do not modify the original file."
    ),
    tools=[{"type": "agent_toolset_20260401"}],
)

environment = client.beta.environments.create(
    name="data-env",
    config={"type": "cloud", "networking": {"type": "unrestricted"}},
)

session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    title="Summarise sales.csv",
)

with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(
        session.id,
        events=[{
            "type": "user.message",
            "content": [{
                "type": "text",
                "text": "There is a sales.csv in the working directory. Summarise it.",
            }],
        }],
    )

    for event in stream:
        if event.type == "session.status_idle":
            break

client.beta.sessions.delete(session.id)
```

Sixty lines, one file, no infrastructure. This is the part that earns Managed Agents a place in your stack.

## Common questions

**Do I need to use the Agent SDK or is the Anthropic SDK enough?**
The Anthropic SDK is enough for Managed Agents. The [Claude Agent SDK](/posts/claude-agent-sdk-vs-langchain) is for building your own loop with the Messages API. They are complementary, not redundant.

**Can I attach my own MCP servers to a Managed Agent?**
Yes. You can declare MCP servers as part of the agent definition, and the harness will start them inside the environment for you. If you are new to MCP, start with the [first MCP server tutorial](/posts/build-your-first-mcp-server).

**How is this different from the Claude Code CLI?**
Claude Code is the CLI you use on your own machine. Managed Agents is a hosted API for running agents in the cloud. Same model, very different product. Anthropic's branding guidelines explicitly ask you not to label your Managed Agent product as "Claude Code".

**What model can I use?**
Any of the current Claude models. For most agentic workloads, `claude-opus-4-7` is the default. For shorter tasks, `claude-sonnet-4-6` is cheaper and fast enough.

**Where does the container actually run?**
Inside Anthropic's managed cloud. You do not get to pick the region. If data residency matters for your workload, that is the question to put to your account team before you build on it.

**How long can a session run?**
Long. Hours is fine for the right workload. The constraint is not a hard timeout but cost — the container is billed for the time it is alive.

**Can I attach files to the environment?**
Yes. Environments support mounted files in their config. Put your prompts, datasets, and config there rather than re-uploading them on every session.

## Where to go from there

Managed Agents is the easiest production path Anthropic has shipped. The pattern is small enough to fit in your head: agent, environment, session, events. Once you have one running, the rest is shaping the system prompt, tightening the network policy, and wiring up the right tools.

If you want to go deeper, four places I would point you next:

- The [first MCP server walkthrough](/posts/build-your-first-mcp-server) for plugging your own tools into the agent.
- The [Claude Agent SDK vs LangChain comparison](/posts/claude-agent-sdk-vs-langchain) and the [Claude Agent SDK vs Vercel AI SDK 6 comparison](/posts/claude-agent-sdk-vs-vercel-ai-sdk) for picking the right harness when you outgrow the managed runtime.
- The [Claude Code skills guide](/posts/claude-code-skills-complete-guide) and the [hooks guide](/posts/claude-code-hooks-complete-guide) — both translate cleanly to skills you can attach to a Managed Agent.
- The [agentic RAG tutorial](/posts/agentic-rag-tutorial) for the most common knowledge-retrieval pattern these agents end up needing.
- The [Claude Code Outcomes guide](/posts/claude-code-outcomes-guide) for adding a rubric-graded check on the agent's output so quality is measurable, not just felt.

The ecosystem around all of this is moving fast. The stable parts are the four concepts above. Build your first session today, and you have a foundation that survives most of the changes still on the roadmap.

For the official spec, the [Claude Managed Agents overview](https://platform.claude.com/docs/en/managed-agents/overview) and [quickstart](https://platform.claude.com/docs/en/managed-agents/quickstart) are the canonical references — bookmark them, they are the only docs that will not lie to you when something changes.
