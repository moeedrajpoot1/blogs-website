---
title: "Why Is Claude Fable 5 Currently Unavailable? What We Know"
description: "Claude Fable 5 and Mythos 5 were pulled on June 12 after a US Commerce Department order. Plain guide to what happened, why, and what to do next."
pubDate: 2026-06-16
author: "Muhammad Moeed"
tags: ["claude", "anthropic", "ai-agents"]
keywords: [
  "claude fable 5 currently unavailable",
  "why is claude fable 5 unavailable",
  "claude fable 5 suspended",
  "when is claude fable 5 coming back",
  "claude fable 5 banned",
  "anthropic fable 5 mythos 5",
  "claude mythos 5 suspended",
  "fable 5 jailbreak",
  "fable 5 commerce department",
  "fable 5 export controls"
]
featured: true
---

If you tried to use Claude Fable 5 in the last few days and got a "currently unavailable" message, you are not alone. On June 12, 2026, Anthropic turned off both Fable 5 and Mythos 5 for every user in the world. The models are still off as of June 16, 2026.

This guide explains, in plain words, what happened, why it happened, what Anthropic and the US government have actually said, what to do if your code or work was using Fable 5, and what we know (and do not know) about when the models might come back.

## The short answer

On June 12, 2026 at 5:21 PM Eastern Time, Anthropic received a letter from the US Commerce Department ordering them to stop foreign nationals from using Fable 5. Anthropic has no way to check, in real time, which user is from which country. So they had to turn the model off for everyone, all over the world. The same order also applied to Mythos 5, so that model was turned off too. Both models had only been live for three days, having launched on June 9, 2026.

## The timeline, step by step

- **June 9, 2026** — Anthropic launches Claude Fable 5 and Claude Mythos 5. Fable 5 was their new top-tier coding and reasoning model. Mythos 5 was a sister model in the same generation.
- **June 12, 2026 at 5:21 PM ET** — Anthropic receives a formal order from the US Commerce Department. The order is signed by Commerce Secretary Howard Lutnick. It bars foreign nationals from using Fable 5 and Mythos 5.
- **June 12, 2026, evening** — Anthropic disables both models for all users worldwide. They publish a short statement on their news page explaining why.
- **June 13, 2026** — Tech press covers the story. Axios had reported the Commerce Secretary's letter just before Anthropic's own announcement.
- **June 16, 2026 (today)** — Both models are still off. No restoration timeline has been announced.

The whole thing happened in three days. The models were live for the same number of days they have now been turned off.

## What the US Commerce Department actually said

The Commerce Secretary's letter cited "national security authorities" and described the action as an "export control directive." The substance of the concern, as reported by news outlets covering the letter, is that the government believed someone had found a way to "jailbreak" Fable 5 — meaning, get the model to do something the safety rules were supposed to stop.

According to administration officials quoted by reporters, "another company claimed it was able to jailbreak Mythos, alarming the administration about possible national security risks."

The letter requires Anthropic to block access to the models by any non-US person, including Anthropic's own employees who are not US citizens. It did not give Anthropic a way to identify users by nationality in real time.

## What Anthropic actually said

Anthropic's own statement is calm and direct. The key parts, in their own words:

> "The US government, citing national security authorities, has issued an export control directive to suspend all access to Fable 5 and Mythos 5."

> "We must abruptly disable Fable 5 and Mythos 5 for **all** our customers to ensure compliance."

> "We believe this is a misunderstanding and are working to restore access as soon as possible."

Anthropic also pushed back on the technical claim. They say the "jailbreak" the government was shown is "narrow and non-universal" — meaning, it only works in a specific situation, not as a general bypass. They also said the same capability is "widely available elsewhere", and named OpenAI's GPT-5.5 as a model that has the same ability without needing any special trick.

In their own description, the jailbreak "essentially consists of asking the model to read a specific codebase and fix any software flaws." In plain words: somebody asked Claude to look at some software code and find the security bugs in it. That is something many AI models can do today, including for free. Anthropic argues that turning off Fable 5 over this does not actually make anyone safer, because the same task can be done with other tools.

## Why the suspension is global, not just for foreign users

This is the question that confuses people the most. If the US order only blocks foreign nationals, why did Anthropic turn the model off for US users too?

The short answer: Anthropic has no reliable way to check, in real time, which API request is coming from a US citizen and which is coming from a foreign national. A real-time nationality check is not something they had built. Building one is not a flip of a switch.

Anthropic chose to follow the order in the safest possible way, which is to turn the model off for everyone. As they put it, this includes their own "foreign national Anthropic employees." Turning the model off is the only way to be sure they are not breaking the order.

## What is a "jailbreak", in plain words

A jailbreak is when somebody finds a clever way to make an AI model do something its safety training was supposed to prevent. Most jailbreaks are tricks of phrasing or context — for example, asking the model to roleplay as a fictional character that does not have any rules.

The specific jailbreak in this case was unusual. According to Anthropic, it works by asking the model to read a piece of software code and find security weaknesses in it. The government's worry seems to be that a foreign attacker could use this to find weaknesses in important software faster than they otherwise could.

Anthropic's pushback is that:
- The same task can be done with many other AI models, including free ones
- The vulnerabilities the model finds are usually already known and minor
- Calling this a "jailbreak" is a stretch — the model is doing what it was built to do (read code and help)

Whether you agree with the government or with Anthropic, the underlying technical work — asking an AI to read code and look for bugs — is a normal everyday use of these tools.

## When will Claude Fable 5 come back? The honest answer

**Nobody has said.** Anthropic has not given any date or even a rough window. As of June 16, 2026, four days after the suspension, there is no announced timeline.

What we do know:

- Anthropic is talking with the government. They say they "believe this is a misunderstanding" and are "working to restore access as soon as possible."
- The government has not publicly walked back the order.
- Anthropic would have to either get the order withdrawn, or build a system that can reliably tell who is a US person and who is not. Neither is a one-day fix.

If you want a guess: the fastest path is the government clarifying or narrowing the order. That could happen in days or weeks. The slower path is Anthropic building nationality filtering, which would take weeks or months. The slowest path is the order standing and the models staying off for a long time.

If you need Fable 5 specifically for ongoing work, plan as if it is not coming back this month. If it does come back sooner, that is a bonus.

## What about Mythos 5

Mythos 5 was suspended at the same time, for the same reason, in the same way. The news has focused on Fable 5 because it was the headline coding model, but Mythos 5 is in the same situation.

Mythos 5 sits in the same model family as Fable 5 but was aimed at slightly different work (longer reasoning chains, agentic tasks). Users who built on Mythos 5 are in the same boat as Fable 5 users — the model is off, no return date, no clear next step except to switch.

## What to do if your code used Fable 5

If you have an Agent SDK app, a Claude Code workflow, or a service in production that called `claude-fable-5`, your calls have been failing since June 12. Here is the practical playbook.

### Step 1: Switch the model ID

The simplest fix is to swap the model name. The closest still-available models are:

- **Opus 4.8** — `claude-opus-4-8`. The top-tier model still on the menu. Closest match to Fable 5 on most coding tasks.
- **Sonnet 4.6** — `claude-sonnet-4-6`. Mid-tier, much cheaper, fine for most everyday work.
- **Haiku 4.5** — `claude-haiku-4-5`. Smallest and cheapest, good for triage and simple tasks.

Pick Opus 4.8 if your code was relying on Fable 5's reasoning and coding strength. Drop down to Sonnet or Haiku for cheaper work.

### Step 2: Re-test your prompts

Different models behave a little differently. The system prompts and tool-call patterns that worked well on Fable 5 may need small tweaks on Opus 4.8. Run your test suite if you have one. If you don't have one, walk through your top three or four real use cases by hand and check the output is still good.

### Step 3: Check your max_tokens and context window settings

If your app was set up to use Fable 5's specific context window or max output tokens, those values may need to change for Opus 4.8. Check the official model card for the limits and update your code.

### Step 4: Have a fallback ready

If Fable 5 comes back next week and you want to switch back, build the switch as a config value, not a hardcoded model name. Something like:

```python
import os
MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-4-8")
```

That way you flip back by changing one environment variable instead of redeploying code.

### Step 5: Add an error message for end users

If your app shows AI output to end users, add a short note explaining the change. Something simple like "We are using Claude Opus 4.8 while Fable 5 is temporarily unavailable." Users feel better when they know what is going on.

## Which Claude models still work today

For the record, the following models are unaffected by the June 12 order and remain available:

| Model | Model ID | Notes |
|---|---|---|
| Opus 4.8 | `claude-opus-4-8` | Top-tier, available |
| Opus 4.7 | `claude-opus-4-7` | Previous-generation top-tier, available |
| Sonnet 4.6 | `claude-sonnet-4-6` | Mid-tier, available |
| Haiku 4.5 | `claude-haiku-4-5` | Cheapest tier, available |
| Fable 5 | `claude-fable-5` | **Suspended** since June 12, 2026 |
| Mythos 5 | `claude-mythos-5` | **Suspended** since June 12, 2026 |

If you are using Claude Code interactively (typing in your terminal), it works fine. Claude Code never used Fable 5 by default — it sits on Opus.

## Frequently asked questions

### Why is Claude Fable 5 currently unavailable?

Claude Fable 5 was suspended on June 12, 2026, after the US Commerce Department issued an order requiring Anthropic to block access for any foreign national. Anthropic has no way to filter users by nationality in real time, so they had to disable the model for everyone worldwide.

### Why was Fable 5 banned?

It was not banned in the usual sense — it was suspended under a US Commerce Department export-control order. The government cited national security and said they believed someone had found a way to "jailbreak" the model. Anthropic disagrees with the technical claim but had to comply with the order.

### When is Claude Fable 5 coming back?

Anthropic has not announced a return date. They have said they believe the situation is "a misunderstanding" and are "working to restore access as soon as possible." There is no timeline as of June 16, 2026. Plan as if it is not coming back this month and treat any earlier return as a bonus.

### When is Fable coming back?

Same as above. No timeline has been announced. Watch the Anthropic news page (anthropic.com/news) for updates.

### Is Fable 5 coming back?

Probably yes, eventually, in some form. Anthropic is publicly working on restoring access. The most likely paths are: the government narrows or withdraws the order, or Anthropic builds a system that can verify user nationality. Both take time.

### What is Fable 5 and Mythos 5?

Fable 5 was Anthropic's top-tier coding and reasoning model, launched June 9, 2026. Mythos 5 was a sister model in the same generation, aimed at longer reasoning chains and agentic work. Both were turned off three days later by the June 12 Commerce Department order.

### Why was Fable 5 suspended worldwide if the order only covered foreign users?

Anthropic has no way to check, in real time, which user is a US citizen and which is not. Building that kind of nationality check is not a quick fix. The safest way to comply with the order, while they figure out next steps, is to turn the model off for everyone.

### What can I use instead of Fable 5 today?

The closest substitute is Opus 4.8 (`claude-opus-4-8`). For cheaper work, Sonnet 4.6 or Haiku 4.5 also work fine. Switch the model ID in your code and re-test your prompts.

### Does this affect Claude in my terminal or Claude Code?

No. Claude Code uses Opus, not Fable 5. Your interactive Claude Code sessions in the terminal are not affected. Your Claude Code GitHub Actions are also fine if they are configured to use Opus or Sonnet.

### Will my Anthropic API key still work?

Yes. Your API key is fine. It just cannot call the `claude-fable-5` or `claude-mythos-5` model IDs while the suspension is in effect. All other model IDs (Opus, Sonnet, Haiku) work as normal.

## What to watch for next

Three signals would tell you Fable 5 is on the way back:

1. **A new Anthropic news post.** Anthropic has said they will publish an update. Watch [anthropic.com/news](https://www.anthropic.com/news).
2. **A clarification from the US Commerce Department.** If the government narrows or withdraws the order, that would clear the fastest path.
3. **A new product launch from Anthropic** that adds nationality verification at the user level. This would be a sign they are building the slower path.

If none of these happen in the next two to three weeks, plan for the longer absence and finish your migration to Opus 4.8.

## A short closing thought

Days like this one are why every production AI setup needs a fallback model and a single config value to switch between models. Hardcoding a single model ID into your code is the kind of decision that feels fine for months and then costs you a weekend.

If you build on AI, build it so any model can be swapped out in a config change, not a code change. Today the suspended model is Fable 5. Next time it might be a different model, from a different provider, for a different reason. The fix is the same either way.

For related reads, the [Claude Agent SDK Credit Pool guide](/posts/claude-agent-sdk-credit-pool) covers the June 15 billing change that landed three days after the Fable 5 suspension (Anthropic had a busy week), and the [Claude Agent SDK vs LangChain comparison](/posts/claude-agent-sdk-vs-langchain) covers the case where you want one library that lets you swap models without rewriting your code.
