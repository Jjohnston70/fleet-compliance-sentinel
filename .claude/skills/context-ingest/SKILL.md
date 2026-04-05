---
name: context-ingest
description: Process and integrate context updates into Pipeline Penny's working memory. Use this skill whenever the user drops in a daily chat summary, email digest, journal entry, text message summary, or any unstructured context update. Triggers on phrases like "here's today's summary," "email digest," "journal entry," "chat summary," "context update," "here's what happened today," "daily briefing," "catch you up," or when the user pastes in a block of summarized information from emails, chats, texts, or personal reflections. Also triggers when markdown files are uploaded containing summaries or journal content.
---

# Context Ingest — Penny's Memory Update System

## Overview

This skill processes raw context updates — email digests, chat summaries, journal entries, text message summaries — and integrates them into Pipeline Penny's working awareness. It extracts actionable intelligence, tracks deadlines, identifies patterns, and maintains a running picture of what's happening across Jacob's business, personal life, and initiatives.

## When to Use This Skill

Trigger when:
- User pastes an email digest or daily email summary
- User uploads a markdown file with chat summaries
- User drops in a journal entry or personal reflection
- User shares text message summaries
- User says "here's today's update" or "catch you up" or "daily briefing"
- Any unstructured block of context that should update Penny's awareness

## How to Process Context Updates

### Step 1: Identify the Source Type

Read the incoming content and classify it:

| Source Type | Indicators |
|---|---|
| Email Digest | Subject lines, sender names, billing info, solicitations, newsletters |
| Chat Summary | "We discussed," "Claude and I worked on," "decisions made," AI tool references |
| Journal Entry | First person, reflective tone, personal thoughts, emotional content, ideas |
| Text/Message Summary | Short exchanges, names, quick decisions, scheduling |
| Mixed | Multiple types in one dump — separate and process each |

### Step 2: Extract and Categorize

For every context update, extract into these categories:

**ACTION ITEMS** — Things that need to be done, with deadlines if mentioned
```
- [DEADLINE: 2026-03-05] GovTribe trial ending — decide whether to continue
- [DEADLINE: 2026-03-05] Loom trial ending — add payment or cancel ($24/mo)
- [NO DEADLINE] Follow up with Eric Liebold re: AIMS tool when timing is better
```

**OPPORTUNITIES** — Business leads, government solicitations, partnerships, events
```
- Keith Curtis offering $500k revolving line of credit — zero fees to apply
- RFP FAAA 2026000156 "Evidence-Informed Strategy Technical Assistance Support" — amended
- BBB Small Business Week Awards nominations open — May 4-8, 2026
```

**FINANCIAL** — Billing, subscriptions, invoices, revenue, expenses
```
- Google Workspace invoice: $29.41/month (Voice Starter license)
- Loom Business + AI: $24/mo if continuing after trial
```

**INTELLIGENCE** — Market trends, industry news, competitive info, strategic insights
```
- AI Daily Brief: "The Month AI Woke Up" — autonomous agents rising, SaaS disruption
- Companies hiring AI trainers across all industries (job search observation)
```

**EVENTS** — Upcoming dates, deadlines, meetings, conferences
```
- 2026-03-03: ChatGPT Basics (Virtual)
- 2026-03-04: Intro to Social Impact (Virtual)
- 2026-03-04: Vibe Coding Workshop (In Person)
- 2026-03-17: Harnessing AI for Small Businesses (In Person)
```

**RELATIONSHIPS** — Updates on contacts, clients, partners, network
```
- Eric Liebold: Not ready for new tools right now, uses online training + Zoom
- Keith Curtis: Offering financing, warm relationship
- Jack Milliken (GovTribe): Pushing for demo before trial ends
```

**PERSONAL/JOURNAL** — Reflections, ideas, emotional state, health, family
```
- Process these with care. Don't summarize away the feeling.
- Capture the insight, not just the information.
- Flag anything that suggests Jacob needs support, rest, or a different approach.
```

**PROJECT STATUS** — Updates on active projects and initiatives
```
- Buddy Button: Submitted to VA late Jan. 100% complete. Awaiting response. Railway deployment removed. Discord bot deployed.
- FOB: Vision document drafted. Three-layer community resilience platform defined.
- PipelineX: Architecture clarified — Penny is runtime, modules are installed per client.
```

### Step 3: Respond with Organized Summary

After processing, respond with:

1. **Quick Hits** — The 3-5 most important things from this update (action items with nearest deadlines first)
2. **Full Breakdown** — Organized by category (only categories that have content)
3. **Connections** — Anything that connects to current projects, recent conversations, or strategic direction
4. **Flags** — Deadlines approaching, risks, things that need attention, contradictions with previous context

### Step 4: Suggest Memory Updates

If the context contains information that should persist in Claude's memory system, suggest specific memory edits:
```
Suggested memory updates:
- "Buddy Button submitted to VA January 2026, awaiting response"
- "GovTribe trial ends March 5, 2026"
- "Keith Curtis offered $500k revolving credit line"
```

Ask Jacob if he wants these added before making changes.

## Processing Rules

**For Email Digests:**
- Separate signal from noise. Marketing emails and newsletters get a one-liner at most.
- Government solicitations get full tracking (RFP number, title, status, deadline if visible)
- Billing items get exact amounts and dates
- Business opportunities get contact name, what's offered, and next step

**For Chat Summaries:**
- Capture decisions made, not just topics discussed
- Track ideas generated (especially Jacob's eureka moments — those are gold)
- Note any technical architecture decisions or framework changes
- Flag unfinished threads that need follow-up

**For Journal Entries:**
- Respect the tone. If Jacob is venting, acknowledge it before organizing.
- Extract actionable insights but don't strip the humanity out of it.
- Look for patterns — recurring frustrations, recurring ideas, energy shifts
- Never judge. Never diagnose. Just listen, organize, and reflect back.

**For Text/Message Summaries:**
- Quick decisions and commitments get tracked as action items
- Relationship context gets updated (who said what, what they need)
- Scheduling gets flagged for calendar awareness

## Template: Daily Context Drop

Jacob can use this format for quick daily updates, or just dump text and let Penny sort it:

```markdown
## Date: YYYY-MM-DD

### Emails
[paste email digest or summary]

### Chats
[paste AI chat summaries or key conversation notes]

### Texts/Messages
[paste key text exchanges or summaries]

### Journal
[whatever's on your mind — no format required]

### Other
[anything else — articles read, ideas, observations]
```

## Template: Quick Journal Entry

```markdown
## Journal: YYYY-MM-DD

[Just write. No structure needed. Penny will sort it.]
```

## Integration with Other Skills

- **documentation skill** — When context updates reveal information that should go into TNDS documentation, flag it
- **direction-protocol** — When email digests contain lead or opportunity signals, flag for Direction Protocol evaluation
- **world-model-mapper** — When journal entries or chat summaries reveal system design insights, connect to relevant module mapping
- **bearing-check** — When context reveals a decision point, suggest running the Bearing Check framework

## What This Skill Does NOT Do

- It does not store raw content permanently. It processes and extracts.
- It does not make decisions for Jacob. It organizes so he can decide.
- It does not access Jacob's actual email, texts, or calendars. It processes summaries he provides.
- It does not replace human judgment. It augments situational awareness.
