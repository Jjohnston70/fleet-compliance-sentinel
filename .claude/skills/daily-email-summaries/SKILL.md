---
name: email-digest
description: Process daily email summaries into actionable intelligence and route recommended actions to Google Calendar, Google Tasks, and HubSpot CRM. Use this skill whenever the user provides an email digest, daily email summary, email roundup, or pastes summarized email content. Triggers on phrases like "here are today's emails," "email summary," "email digest," "inbox roundup," "email briefing," or when content clearly contains summarized emails with subject lines, sender names, billing notices, solicitations, or newsletter summaries. This skill turns email noise into organized, actionable briefings with one-click routing to Calendar, Tasks, and CRM.
---

# Email Digest — Daily Email Intelligence + Action Routing

## Overview

This skill processes daily email summaries and turns them into structured, actionable intelligence. It categorizes, prioritizes, tracks deadlines, connects to active projects, AND generates recommended actions that can be routed directly to Google Calendar, Google Tasks, and HubSpot CRM with Jacob's approval.

## When to Use This Skill

- User pastes a daily email summary or digest
- User says "here are today's emails" or "email roundup"
- Content contains multiple summarized emails with sender names, subjects, or action items
- User uploads a markdown file containing email summaries

## Processing Pipeline

### Step 1: Classify Each Email

Read every email summary and tag it:

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

### Step 2: Prioritize

Sort into three tiers:

**URGENT — Act Today or Tomorrow**
- Deadlines within 7 days
- Time-sensitive opportunities
- Billing issues that could cause service interruption

**IMPORTANT — Act This Week**
- Business opportunities needing follow-up
- Government solicitations to evaluate
- Relationship touchpoints

**AWARENESS — No Immediate Action**
- Industry news and trends
- Events to consider
- Distant subscription reminders

### Step 3: Output the Briefing

Respond with the organized summary (see Output Format section below).

### Step 4: Generate Action Recommendations

After the briefing, generate three recommendation tables for routing to external systems.

---

## Action Routing System

After processing the email digest, Penny generates three recommendation tables. Jacob reviews and approves which items to push to each system. **Nothing gets pushed without explicit approval.**

### Calendar Recommendations

Present a table of items that should potentially go on the calendar:

```
CALENDAR RECOMMENDATIONS
=========================
| # | Event | Date | Time | Duration | Source |
|---|-------|------|------|----------|--------|
| 1 | GovTribe trial expires | 2026-03-05 | All day | - | Billing email |
| 2 | Loom trial expires | 2026-03-05 | All day | - | Billing email |
| 3 | ChatGPT Basics (Virtual) | 2026-03-03 | TBD | TBD | BBB email |
| 4 | Vibe Coding Workshop | 2026-03-04 | TBD | TBD | BBB email |
| 5 | Harnessing AI for SMBs | 2026-03-17 | TBD | TBD | BBB email |
| 6 | BBB Awards Nomination Deadline | TBD | All day | - | BBB email |

Which items should I add to your Google Calendar? (e.g., "1,2,5" or "all" or "none")
```

**When Jacob approves**, use Google Calendar tools:
- `gcal_create_event` to create approved events
- Timezone: `America/Denver`
- Unknown times: create as all-day events with `start.date` / `end.date`
- Description: include source context, links, action needed
- Deadlines (trial expirations, nominations): add reminder 1 day before
- Events/workshops: add reminder 1 hour before
- Use `sendUpdates: "none"`

### Task Recommendations

Present a table of items that should become tasks:

```
TASK RECOMMENDATIONS
====================
| # | Task | Priority | Due Date | Context |
|---|------|----------|----------|---------|
| 1 | Decide: Renew GovTribe or cancel | High | 2026-03-04 | Trial ends Mar 5 |
| 2 | Decide: Continue Loom or cancel | Medium | 2026-03-04 | $24/mo, trial ends Mar 5 |
| 3 | Reply to Keith Curtis re: credit line | Medium | This week | $500k revolving, zero fees |
| 4 | Review RFP FAAA 2026000156 | Medium | This week | Evidence-Informed Strategy |
| 5 | Follow up with Eric Liebold | Low | When ready | AIMS tool — revisit later |

Which items should I add to your Google Tasks? (e.g., "1,2,3" or "all" or "none")
Assign to task list: [default / TNDS / FOB / Personal]
```

**When Jacob approves**, route tasks using one of these methods (in priority order):

1. **Google Tasks (if MCP available):** Use Google Tasks tools directly to create tasks in the specified task list
2. **Calendar-as-Tasks fallback:** Create calendar events with "TASK:" prefix so they appear on the calendar as action reminders. Use `gcal_create_event` with:
   - Summary: `TASK: [task title]`
   - Description: Full context, priority, and action needed
   - All-day event on the due date
   - Reminder: morning of due date (popup, 540 minutes = 9am)
3. **Email summary fallback:** Use Gmail to send Jacob a formatted task list email he can act on from his inbox

**Task formatting rules:**
- Title: Action verb + specific outcome ("Decide: Renew GovTribe or cancel")
- Notes: Dollar amounts, deadlines, contact info, relevant links
- Due dates: Deadline items get day-before dates so there's time to act

### HubSpot CRM Recommendations

Present a table of items that should update CRM records:

```
HUBSPOT CRM RECOMMENDATIONS
============================
| # | Action | Object | Record | Update | Source |
|---|--------|--------|--------|--------|--------|
| 1 | Update | Contact | Eric Liebold | Note: "Not ready for AIMS tool, uses training + Zoom" | Email |
| 2 | Create | Contact | Keith Curtis | New — offering $500k credit line | Email |
| 3 | Create | Deal | GovTribe Renewal | Evaluate subscription, trial ends Mar 5 | Billing |
| 4 | Log | Contact | Jack Milliken | Activity: "Pushed for demo, trial ends Mar 5" | Email |

Which items should I push to HubSpot? (e.g., "1,2,3" or "all" or "none")
```

**When Jacob approves**, use HubSpot tools in this order:

1. `HubSpot:get_user_details` — Get owner ID and check permissions
2. `HubSpot:search_crm_objects` — **Always search before creating** to prevent duplicates
   - Search contacts by email first, then name
   - Search companies by name/domain
   - Search deals by deal name
3. `HubSpot:manage_crm_objects` — Create or update records

**CRM rules:**
- **Contacts:** Search before creating. If exists, update notes/last activity. If new, create with all available info (name, email, company, phone, source context).
- **Companies:** Only create for clearly new business entities. Search by name/domain first.
- **Deals:** Create for active opportunities with clear next steps. Include deal name, stage, amount if known, close date if known, and associate with contact/company.
- **Notes:** Log significant interactions, decisions, follow-up commitments. Always associate with the relevant contact/company.
- **Never create duplicate records.** Search first. Always.
- Follow HubSpot's mandatory confirmation format (proposed changes table + explicit approval) before executing.

**CRM data from emails, texts, and other communications:**
When processing any communication summary (not just emails), look for CRM-relevant data:
- New contacts mentioned by name
- Existing contact activity (responses, meetings, decisions)
- Deal progression signals (interest expressed, proposals requested, objections raised)
- Company information updates
- Revenue signals (pricing discussed, contracts mentioned, payments)

---

## Output Format

The complete email digest response follows this structure:

```
## Email Briefing — [Date]

### Urgent (Act Now)
[items with nearest deadlines]

### Important (This Week)
[business opportunities, solicitations, relationship touchpoints]

### Awareness
[news, distant events, routine billing]

### Events Calendar
| Date | Event | Type |
|------|-------|------|
[table of upcoming events]

### Connections to Active Projects
[how items connect to current TNDS/FOB/Pipeline Punks work]

---

### Action Routing

#### Google Calendar
[recommendation table + approval prompt]

#### Google Tasks
[recommendation table + approval prompt + task list selection]

#### HubSpot CRM
[recommendation table + approval prompt]

---

### Suggested Memory Updates
[items that should persist in Claude's memory system]
```

---

## Government Solicitation Tracking

When digests contain government solicitation updates, extract:

| Field | What to Capture |
|---|---|
| RFP/Solicitation Number | Full number |
| Title | Full title |
| Status | Published, Amended, Closing, Awarded |
| Agency | If identifiable |
| TNDS Relevance | Match against TNDS capabilities |
| Action | Review, Apply, Skip, Watch |

Flag solicitations matching: data management, automation, Google Workspace, business process optimization, AI/ML support, training/education, veteran services.

For approved solicitations, recommend entries in ALL THREE systems:
- Calendar: response deadline
- Task: detailed review with due date
- HubSpot: deal for pipeline tracking

---

## Subscription and Billing Tracker

Track recurring costs from billing emails:

| Service | Cost | Frequency | Status | Next Date |
|---|---|---|---|---|
| Google Workspace | $29.41 | Monthly | Active | Auto-charged |

Flag new subscriptions, price changes, approaching trial expirations. Auto-recommend calendar reminders for trial end dates and task items for renewal decisions.

---

## Approval Workflow Summary

1. Penny processes email digest → presents prioritized briefing
2. Penny generates Calendar, Task, and CRM recommendation tables
3. Jacob reviews and approves by number ("1,2,5"), "all", or "none"
4. Penny executes approved items using the appropriate tools
5. Penny confirms what was created/updated with links or IDs

**Shortcut commands Jacob can use:**
- `"approve all"` — Push everything across all three systems
- `"cal: 1,3,5"` — Only push items 1, 3, 5 to Calendar
- `"tasks: all"` — Push all task recommendations
- `"crm: 1,2"` — Push items 1 and 2 to HubSpot
- `"skip"` or `"none"` — Don't push anything, just keep the briefing

---

## Integration with Other Skills

- **context-ingest** — Email digest is one of four context channels
- **direction-protocol** — Revenue opportunities flagged for sales evaluation
- **govcon-command** — Government solicitations feed the pipeline
- **bearing-check** — Major financial decisions may warrant framework analysis
- **jacob-voice** — If any email requires a drafted response, match Jacob's tone

## What Good Looks Like

Jacob drops his email summary. 30 seconds later he has:
1. A prioritized briefing he can scan on his phone
2. Calendar events ready to push with one word
3. A task list ready to create with one word
4. CRM updates ready to log with one word

One input. Three systems updated. Zero manual data entry. That's the point.
