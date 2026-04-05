---
name: email-digest
description: Process and structure daily email summaries into actionable intelligence for Pipeline Penny. Use this skill whenever the user provides an email digest, daily email summary, email roundup, or pastes summarized email content. Triggers on phrases like "here are today's emails," "email summary," "email digest," "inbox roundup," "email briefing," or when content clearly contains summarized emails with subject lines, sender names, billing notices, solicitations, or newsletter summaries. This skill turns email noise into organized, actionable briefings.
---

# Email Digest — Daily Email Intelligence Processing

## Overview

This skill processes daily email summaries that Jacob provides and turns them into structured, actionable intelligence. It categorizes, prioritizes, tracks deadlines, and connects email content to active projects and strategic direction.

## When to Use This Skill

- User pastes a daily email summary or digest
- User says "here are today's emails" or "email roundup"
- Content contains multiple summarized emails with sender names, subjects, or action items
- User uploads a markdown file containing email summaries

## Input Format

Jacob (or his email summarization tool) provides email summaries in roughly this format:

```
* [Category or Topic]: [Summary of email content including sender name, 
  what they said/offered, and any relevant details or deadlines]
```

The format may vary. Emails might be numbered, bulleted, or just dumped as text. The skill handles all of it.

## Processing Pipeline

### 1. Classify Each Email

Read every email summary and tag it with one or more categories:

| Category | Tag | What It Catches |
|---|---|---|
| Action Required | `[ACTION]` | Anything needing a response, decision, or task |
| Deadline | `[DEADLINE]` | Trials ending, applications due, events approaching |
| Revenue Opportunity | `[OPPORTUNITY]` | Leads, partnerships, contracts, solicitations |
| Financial | `[FINANCIAL]` | Invoices, billing, subscriptions, credit offers |
| Government/GovCon | `[GOVCON]` | RFPs, solicitations, SAM.gov, government opportunities |
| Network/Relationship | `[NETWORK]` | Contact updates, introductions, follow-up signals |
| Event | `[EVENT]` | Conferences, workshops, awards, webinars |
| Intelligence | `[INTEL]` | Market news, industry trends, competitive info |
| Noise | `[SKIP]` | Marketing, promotions, newsletters with no actionable content |

### 2. Prioritize

After classifying, sort into three priority tiers:

**URGENT — Act Today or Tomorrow**
- Deadlines within 7 days
- Time-sensitive opportunities
- Billing issues that could cause service interruption

**IMPORTANT — Act This Week**
- Business opportunities that need follow-up
- Government solicitations to evaluate
- Relationship touchpoints that shouldn't go cold

**AWARENESS — No Immediate Action**
- Industry news and trends
- Events to consider
- Subscription reminders with distant deadlines

### 3. Output Format

Respond with this structure:

```
## Email Briefing — [Date]

### Urgent (Act Now)
- [DEADLINE: Mar 5] GovTribe trial ending — decide: renew or cancel
- [DEADLINE: Mar 5] Loom trial ending — $24/mo to continue, add payment or let expire

### Important (This Week)  
- [OPPORTUNITY] Keith Curtis offering $500k revolving credit — zero fees, interest only on withdrawal
- [GOVCON] RFP FAAA 2026000156 amended — "Evidence-Informed Strategy Technical Assistance Support"
- [GOVCON] RFP FAAA 2026000171 published — "Public Health Lab QMS Optimization"
- [NETWORK] Eric Liebold — not ready for AIMS tool now, uses online training + Zoom. Revisit later.

### Awareness
- [FINANCIAL] Google Workspace invoice: $29.41 (auto-charged)
- [INTEL] AI Daily Brief: autonomous agents, SaaS disruption, DC power struggle over AI
- [EVENT] BBB Small Business Week Awards — nominations open, May 4-8

### Events Calendar
| Date | Event | Type |
|---|---|---|
| Mar 3 | ChatGPT Basics | Virtual |
| Mar 4 | Intro to Social Impact | Virtual |
| Mar 4 | Vibe Coding Workshop | In Person |
| Mar 17 | Harnessing AI for Small Businesses | In Person |
| Mar 17 | Intro to Digital Ads | Virtual |
| Mar 18 | Beyond Google: AI Discoverability | In Person |

### Connections to Active Projects
- GovTribe trial → govcon pipeline, evaluate before it expires
- Keith Curtis credit line → could fund FOB nonprofit transition or PipelineX development
- AIMS tool conversation with Eric → revisit when training-command module is built (proof of concept for external deployment)
- AI Daily Brief → content for Pipeline Punks, validates AI literacy curriculum direction
- BBB Awards → consider Micro Business of the Year nomination for TNDS

### Suggested Actions
1. Decide on GovTribe before Mar 5 — pull up the solicitations you've tracked and evaluate ROI
2. Decide on Loom before Mar 5 — are you using it enough to justify $24/mo?
3. Reply to Keith Curtis — even if not withdrawing now, having a $500k line available is strategic
4. Register for Mar 17 "Harnessing AI for Small Businesses" — networking + positioning for TNDS
```

### 4. Track Over Time

When processing multiple email digests across days, watch for:
- **Recurring contacts** — Someone showing up in multiple digests is either a lead, a partner, or a problem
- **Deadline convergence** — Multiple things due the same week means scheduling pressure
- **Opportunity patterns** — Similar RFPs or solicitations may indicate a category worth pursuing
- **Spending patterns** — Subscription creep, invoice changes, new charges

### 5. Connect to Memory

After processing, suggest memory updates for anything that should persist:
```
Suggested memory updates:
- "GovTribe trial ends March 5, 2026"
- "Keith Curtis offered $500k revolving credit line, zero fees"
- "Eric Liebold not ready for new tools, revisit later"
```

## Government Solicitation Tracking

When email digests contain government solicitation updates (ADVMAIL, SAM.gov, GovTribe), extract:

| Field | What to Capture |
|---|---|
| RFP/Solicitation Number | Full number (e.g., FAAA 2026000156) |
| Title | Full title in quotes |
| Status | Published, Amended, Closing, Awarded |
| Agency | If identifiable from the number or content |
| Relevance | Quick assessment: does this match TNDS capabilities? |
| Action | Review, Apply, Skip, Watch |

Flag any solicitation that aligns with TNDS service areas: data management, automation, Google Workspace, business process optimization, AI/ML support, training and education, veteran services.

## Subscription and Billing Tracker

When email digests contain billing or subscription info, maintain awareness of:

| Service | Cost | Frequency | Status | Next Date |
|---|---|---|---|---|
| Google Workspace | $29.41 | Monthly | Active | Auto-charged |
| Loom Business + AI | $24.00 | Monthly | Trial ending | Mar 5, 2026 |
| GovTribe | TBD | Trial | Trial ending | Mar 5, 2026 |

Flag any new subscriptions, price changes, or trials approaching end.

## Integration with Other Skills

- **context-ingest** — Email digest is one of four context channels. This skill handles the email-specific processing; context-ingest handles the broader integration.
- **direction-protocol** — Revenue opportunities and lead signals get flagged for Direction Protocol evaluation
- **govcon-command** — Government solicitations feed into the govcon tracking pipeline
- **bearing-check** — Major financial decisions (like the $500k credit line) may warrant a Bearing Check

## What Good Looks Like

A good email digest processing gives Jacob a 30-second scan that tells him:
1. What needs attention right now
2. What opportunities are on the table
3. What's costing money
4. What connects to things he's already working on
5. What he can ignore

If Jacob can read the briefing on his phone while drinking coffee and know exactly where his day should start, the skill did its job.
