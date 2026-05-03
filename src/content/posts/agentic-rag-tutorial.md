---
title: "Agentic RAG: A Friendly Tutorial With Real Code"
description: "Learn what agentic RAG is, how it differs from traditional RAG, and how to build one with the Claude Agent SDK and pgvector. Step by step, with full code."
pubDate: 2026-05-04
author: "Moeed Rajpoot"
tags: ["rag", "ai-agents", "tutorials", "claude-agent-sdk"]
keywords: ["agentic rag tutorial", "agentic rag vs rag", "agentic rag claude", "agentic rag python", "agentic rag pgvector"]
featured: false
---

If you have built a RAG system before, you may have noticed a pattern. The system always retrieves, even when it does not need to. It always retrieves the same number of chunks. It always reads them in the same order. The retrieval step is fixed, and the language model has to deal with whatever comes back.

Agentic RAG is a small but useful idea on top of this. Instead of retrieving on a fixed schedule, the language model decides when to retrieve, what to search for, and whether the results are good enough. The retrieval becomes a tool the model can call as many or as few times as needed.

This post walks through what agentic RAG is, when it is worth using, and how to build a small but real one with the Claude Agent SDK and pgvector. By the end you will have a working system you can adapt to your own data.

If RAG itself is new to you, you may want to start with a basic RAG tutorial first. This post assumes you have built or read about a simple RAG pipeline before.

## What agentic RAG is

In a traditional RAG pipeline, the steps are fixed.

```
user question
    -> embed the question
    -> search the vector store
    -> retrieve top k chunks
    -> stuff chunks into the prompt
    -> language model writes the answer
```

Every question goes through the same pipeline. If the user asks something the database does not know, the model still gets fed irrelevant chunks. If the question needs information from three different searches, the pipeline only does one.

In agentic RAG, the language model is in charge of retrieval. The flow is more like this.

```
user question
    -> language model thinks about what is needed
    -> calls a search tool, looks at results
    -> decides whether to search again
    -> when satisfied, writes the answer
```

The retrieval becomes a tool, just like any other. The model can call it once, twice, or not at all. It can rephrase the search query if the first attempt returned poor results. It can search across multiple knowledge bases. It can check the freshness of a result and ask for an update.

This shift, from a fixed pipeline to a tool the model uses on demand, is the whole idea.

## When agentic RAG is worth it

Agentic RAG is more flexible but also more expensive. The model makes more calls, and each tool call adds latency. So it is not always the right choice.

Agentic RAG is worth using when:

- Your questions vary a lot in what they need. Some need one search, some need five.
- Your knowledge base is split across multiple stores (a vector DB, a SQL DB, an API).
- You want the model to refine its query based on what it gets back.
- Recall on the first try is not great, and a second search with a better query helps.
- The answer needs to combine retrieval with reasoning, not just a citation.

Traditional RAG is enough when:

- Most questions follow a similar shape (a customer support FAQ, a single product).
- The knowledge base is small and well organised.
- Latency matters more than depth (chat that should reply in under a second).
- Cost is the main constraint and quality is acceptable.

If you are not sure, start with traditional RAG and switch to agentic RAG if you see the model struggling with multi step questions.

## What we are going to build

A small agentic RAG system that can answer questions about a set of articles. It will:

- Store article chunks in a Postgres database with pgvector
- Expose a `search_articles` tool to the language model
- Let the model search as many times as it needs to answer
- Return a final answer with citations to the source articles

We will use Python, the Claude Agent SDK, and pgvector. The whole thing is around 150 lines of code.

## Step one, set up the environment

Create a new folder and a Python virtual environment.

```bash
mkdir agentic-rag && cd agentic-rag
python -m venv venv
source venv/bin/activate
pip install claude-agent-sdk psycopg[binary] pgvector openai
```

We use the Claude Agent SDK for the model, and the OpenAI SDK only for embeddings (you can swap this for Voyage or Cohere if you prefer). Postgres with pgvector handles the vector search.

Set your environment variables.

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-...
export DATABASE_URL=postgresql://user:pass@localhost:5432/agentic_rag
```

Make sure your Postgres has pgvector installed. On a modern install, this is one SQL command.

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Step two, set up the database

Create a small schema. Two tables, one for articles and one for chunks. Each chunk has an embedding column.

```sql
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chunks (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id),
    content TEXT NOT NULL,
    embedding vector(1536)
);

CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
```

The `vector(1536)` matches the dimension of OpenAI's `text-embedding-3-small` model. If you use a different embedding model, change this number.

The HNSW index lets us run vector searches quickly. For a small project (under 100,000 chunks) you can skip the index and the queries will still be fast.

## Step three, ingest some content

Write a small script that takes an article, splits it into chunks, embeds each chunk, and stores everything.

```python
# ingest.py
import os
import psycopg
from openai import OpenAI

openai_client = OpenAI()
db = psycopg.connect(os.environ["DATABASE_URL"])

def chunk_text(text: str, size: int = 800, overlap: int = 100) -> list[str]:
    """Simple sliding window chunker. Good enough for most cases."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

def embed(text: str) -> list[float]:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding

def ingest_article(title: str, url: str, body: str) -> None:
    with db.cursor() as cur:
        cur.execute(
            "INSERT INTO articles (title, url) VALUES (%s, %s) RETURNING id",
            (title, url),
        )
        article_id = cur.fetchone()[0]
        for chunk in chunk_text(body):
            embedding = embed(chunk)
            cur.execute(
                "INSERT INTO chunks (article_id, content, embedding) VALUES (%s, %s, %s)",
                (article_id, chunk, embedding),
            )
        db.commit()
        print(f"Ingested article {article_id}: {title}")

if __name__ == "__main__":
    ingest_article(
        title="Why we picked Postgres",
        url="https://example.com/postgres",
        body="A long article about choosing a database...",
    )
```

Run it for each article you want to add. For a real project you would loop over a folder of files or call this from your CMS.

## Step four, write the search tool

Now the interesting part. Define a `search_articles` function and turn it into a tool the language model can call.

```python
# search.py
import os
import psycopg
from openai import OpenAI
from claude_agent_sdk import tool

openai_client = OpenAI()
db = psycopg.connect(os.environ["DATABASE_URL"])

def embed(text: str) -> list[float]:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding

@tool
def search_articles(query: str, max_results: int = 5) -> str:
    """Search the article database for content related to a query.

    Returns up to max_results chunks of text, each with the article title,
    URL, and the relevant text. Use this whenever you need to find information
    about a topic. You can call it multiple times with different queries.
    """
    query_embedding = embed(query)

    with db.cursor() as cur:
        cur.execute(
            """
            SELECT a.title, a.url, c.content,
                   1 - (c.embedding <=> %s::vector) AS score
            FROM chunks c
            JOIN articles a ON c.article_id = a.id
            ORDER BY c.embedding <=> %s::vector
            LIMIT %s
            """,
            (query_embedding, query_embedding, max_results),
        )
        rows = cur.fetchall()

    if not rows:
        return "No matching content found."

    formatted = []
    for title, url, content, score in rows:
        formatted.append(
            f"[Source: {title} ({url}), score: {score:.2f}]\n{content}"
        )
    return "\n\n---\n\n".join(formatted)
```

A few things to notice in this tool.

The docstring is the tool description that the language model reads. It is not just a comment. It is the model's only guide on when and how to use the tool. So write it clearly.

The `<=>` operator in the SQL is pgvector's cosine distance. Lower numbers mean closer matches. We sort by distance and convert to a similarity score for readability.

The function returns a single string. The model reads that string and decides what to do next. So we format it in a way that is easy to read and includes the source info we want it to cite.

## Step five, wire up the agent

Now bring it all together with the Claude Agent SDK.

```python
# agent.py
from claude_agent_sdk import Agent
from search import search_articles

agent = Agent(
    model="claude-opus-4-7",
    system=(
        "You are a research assistant. When the user asks a question, "
        "use the search_articles tool to find relevant information before answering. "
        "If the first search returns poor results, try rephrasing the query and "
        "searching again. Always cite your sources by including the article title "
        "and URL in your answer."
    ),
    tools=[search_articles],
)

def answer(question: str) -> str:
    result = agent.run(question)
    return result.final_text

if __name__ == "__main__":
    question = "Why might a team choose Postgres for a new product?"
    print(answer(question))
```

That is the whole agent. Less than ten lines of actual logic. The Claude Agent SDK handles the loop of model call, tool call, model call, and so on, until the model decides it has enough information to answer.

## Step six, see it work

Run the agent.

```bash
python agent.py
```

If you ingested the example article from step three, you should see something like this in the model's behaviour.

1. Model calls `search_articles("postgres for new product")` and reads the results.
2. The first results may be too generic, so the model calls again with a better query, like `search_articles("postgres reliability scale advantages")`.
3. With the second batch, it has enough to write a clear answer with citations.

You can add some logging to see this happen. The Claude Agent SDK logs each tool call by default if you set the right level.

```python
import logging
logging.basicConfig(level=logging.INFO)
```

## Common pitfalls

A few things tend to go wrong the first time people build agentic RAG. Here are the ones I see most often.

**Tool descriptions that are too vague.** If the docstring just says "search articles", the model has no idea when to call it. Be specific. Tell the model what the database contains, what kinds of queries work well, and when not to use the tool.

**No limits on retries.** A model can sometimes get stuck in a loop, calling the same search over and over. The Claude Agent SDK has a default loop limit, but you should still write tools that fail fast if a query is malformed.

**Returning too much text per search.** If each search returns 5 chunks of 800 characters, that is 4,000 characters per call. After three searches, you have eaten 12,000 characters of context. Tune `max_results` and chunk size with this in mind.

**Forgetting to cite sources.** Without instruction, the model may use the search results but not mention where they came from. Always include "always cite your sources" in the system prompt, and make sure the tool output makes the source easy to copy.

**No re ranking.** Vector search is good but not perfect. For higher quality, run a small re ranker (like Cohere Rerank or Voyage Rerank) on the top 20 results, then return the top 5 to the model. This adds about 100ms but improves answer quality noticeably.

## Production considerations

If you take this from a tutorial to a real product, three things matter most.

**Cost.** Each tool call is a round trip to the model. A typical agentic RAG answer uses 2 to 4 search calls plus the final answer. With Claude Opus 4.7, a long session can run a few cents. Use Claude Sonnet 4.6 for most calls and only escalate to Opus when needed. Prompt caching, which is on by default in the Agent SDK, also makes a big difference.

**Latency.** Each tool call adds 300 to 800ms. A two search answer is around 3 to 5 seconds, which feels slow in a chat interface. To improve this, stream the answer to the user, and consider running cheap searches in parallel when the model can call them at once.

**Logging and evaluation.** Save every search query, every result, and the final answer. You will need this to debug bad answers and to measure improvement over time. Tools like Langfuse or Helicone make this easier without writing your own pipeline.

There is a deeper article in this comparison of [Claude Agent SDK and LangChain](/posts/claude-agent-sdk-vs-langchain) that covers more of the production tradeoffs.

## Cost and performance numbers

Rough numbers from a recent project I built using this exact pattern.

| Metric | Value |
|---|---|
| Articles ingested | 1,200 |
| Chunks total | 24,000 |
| Avg searches per question | 2.3 |
| Avg time to answer | 4.1 seconds |
| Avg cost per question (Opus) | $0.04 |
| Avg cost per question (Sonnet routed) | $0.011 |

These numbers will vary based on your data and questions. They are meant only as a rough sense of what to expect.

## Common questions

**Can I use this without Anthropic models?**
Yes. The same pattern works with GPT-5 or any model with tool use. Swap the agent runtime for OpenAI's Responses API or LangGraph. The search tool is portable.

**What if my data is in multiple sources?**
Define multiple search tools, one per source. The model will pick the right one based on the docstring. So you might have `search_articles`, `search_support_tickets`, and `search_database` all available, and the model uses whichever fits the question.

**Do I need to use pgvector?**
No. Pinecone, Weaviate, Qdrant, or any vector DB works. Pgvector is just a good default if your team already runs Postgres.

**How do I keep the index up to date?**
Run a small worker that watches for new content and re embeds changed chunks. For most apps, a daily cron job is enough.

**Can the agent decide not to search?**
Yes, and it should. For simple questions like "what is your return policy" where the answer is in the system prompt, the model should answer directly without calling the search tool. A clear system prompt tells it when to skip retrieval.

## Where to go next

Once your basic agentic RAG works, the natural next steps are:

- Add a re ranker for better top results
- Add a second tool that searches your SQL data
- Add a hybrid search (vector plus BM25) for better recall on rare terms
- Switch the embedding model to Voyage or Cohere for slightly better quality

If you are building this inside a larger agent product, the [Claude Agent SDK comparison](/posts/claude-agent-sdk-vs-langchain) and the [MCP server tutorial](/posts/build-your-first-mcp-server) are both good follow ups. You can wrap your agentic RAG as an MCP server and let other tools (Claude Code, Claude Desktop, Cursor) all use it.

Agentic RAG is not a magic bullet. For simple cases, traditional RAG is enough. But for the cases where it shines, multi step reasoning over multiple sources, with refinement, the experience is a real step up. Try it on your own data, measure it against a fixed pipeline, and let the numbers tell you which one fits your use.
