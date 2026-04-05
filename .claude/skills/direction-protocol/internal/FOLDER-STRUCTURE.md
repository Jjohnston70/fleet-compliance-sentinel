---
**CONFIDENTIAL - TRADE SECRET**
**Property of True North Data Strategies LLC**
**Unauthorized disclosure prohibited**
---

# Direction Protocol Folder Structure

**Version:** 1.0
**Last Updated:** January 28, 2026
**Purpose:** Standard folder structure for Direction Protocol engagements

---

## Overview

Every prospect and client has a dedicated folder that moves through the file system as they progress through Direction Protocol stages.

```
ROOT/
├── 20_PROSPECTS/           ← Active prospects (IDENTIFY through CHART)
├── 25_NURTURE/             ← "Not Now" prospects
├── 30_ACTIVE_CLIENTS/      ← Signed clients (LAUNCH and beyond)
├── 40_PAST_CLIENTS/        ← Completed engagements
└── 90_ARCHIVE/             ← Walk-aways and unresponsive
```

---

## Folder Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FOLDER LIFECYCLE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   STAGE                 FOLDER LOCATION                 ACTION              │
│                                                                              │
│   IDENTIFY              20_PROSPECTS/[Client]/          Create folder       │
│       ↓                                                                      │
│   ASSESS                20_PROSPECTS/[Client]/          Add files           │
│       ↓                                                                      │
│   MAP                   20_PROSPECTS/[Client]/          Add files           │
│       ↓                                                                      │
│   CHART                 20_PROSPECTS/[Client]/          Add proposal        │
│       ↓                                                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   ▼                     ▼                     ▼                     ▼   │   │
│   YES                   NOT NOW               WALK AWAY             DARK│   │
│   │                     │                     │                     │   │   │
│   ▼                     ▼                     ▼                     ▼   │   │
│   30_ACTIVE_CLIENTS/    25_NURTURE/           90_ARCHIVE/           90_ARCHIVE/
│   [Client]/             [Client]-Pending/     [Year]/               [Year]/
│                                               [Client]-WalkAway/    [Client]-NoResponse/
│       ↓                                                                      │
│   (Implementation)                                                           │
│       ↓                                                                      │
│   40_PAST_CLIENTS/                                                           │
│   [Client]/                                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Prospect Folder Structure (20_PROSPECTS)

### Folder Creation: After IDENTIFY

When a prospect is qualified during IDENTIFY, create:

```
20_PROSPECTS/[Company-Name]/
├── IDENTIFY-notes.md           ← Created during/after IDENTIFY call
└── (additional files added as stages progress)
```

### After ASSESS

```
20_PROSPECTS/[Company-Name]/
├── IDENTIFY-notes.md
└── ASSESS-notes.md             ← Created during/after ASSESS call
```

### After MAP

```
20_PROSPECTS/[Company-Name]/
├── IDENTIFY-notes.md
├── ASSESS-notes.md
├── MAP-findings.md             ← Comprehensive MAP documentation
├── complexity-scoring.md       ← Scoring worksheet
└── context-graph.md            ← Version 1.0 (created during MAP)
```

### After CHART

```
20_PROSPECTS/[Company-Name]/
├── IDENTIFY-notes.md
├── ASSESS-notes.md
├── MAP-findings.md
├── complexity-scoring.md
├── context-graph.md
└── proposal.md (or .pdf)       ← CHART presentation materials
```

---

## File Templates

### IDENTIFY-notes.md

```markdown
# IDENTIFY Notes - [Company Name]

**Date:** [Date]
**Duration:** [X] minutes
**Lead Source:** [Referral/Inbound/Outbound/Networking]

## Prospect Information
- **Contact:** [Name]
- **Company:** [Company Name]
- **Role:** [Title]
- **Email:** [Email]
- **Phone:** [Phone]

## Business Overview
- **What they do:** [Description]
- **Team size:** [X] people
- **Industry:** [Industry]

## Pain Points Identified
1. [Pain point 1]
2. [Pain point 2]
3. [Pain point 3]

## Key Quotes
- "[Quote 1]"
- "[Quote 2]"

## Qualification Score
| Factor | Score |
|--------|-------|
| Real operational problem | [0/1/2] |
| Decision-maker present | [0/1/2] |
| Sounds coachable | [0/1/2] |
| Right size (5-20) | [0/1/2] |
| **Total** | [X/8] |

## Red Flags
- [None / List any concerns]

## Outcome
- **Status:** [Qualified / Not Qualified / Yellow Light]
- **Next Step:** [Schedule ASSESS / Walk Away / Pipeline Punks]
- **ASSESS Scheduled:** [Date/Time or N/A]

## Notes
[Additional observations]
```

### ASSESS-notes.md

```markdown
# ASSESS Notes - [Company Name]

**Date:** [Date]
**Duration:** [X] minutes

## Section 1: Operational Reality
### Typical Day/Week
[Description]

### Where Things Go Wrong
[Description]

### How They Find Out
[Description]

### Decisions They're Guessing On
[Description]

## Section 2: Current State
### Where Information Lives
- Customer data: [Location]
- Financial data: [Location]
- Project data: [Location]
- Team communication: [Location]

### Knowledge Distribution
[Who knows what, tribal knowledge risks]

## Section 3: Stakes and Readiness
### Cost of Problem
- Time: [X hours/week]
- Money: [$X/month or year]
- Stress/Other: [Description]

### If Nothing Changes
[Their answer]

### If Fixed
[Their answer]

## Section 4: Fit Check
[Their reaction to MAP commitment]

## Section 5: Budget Reality
[Budget discussion notes]

## SRO Score
| Factor | Score |
|--------|-------|
| Stakes (1-4) | [X] |
| Readiness (1-4) | [X] |
| Openness (1-4) | [X] |
| **Total** | [X/12] |

## Outcome
- **Status:** [Green / Yellow / Red]
- **Next Step:** [Schedule MAP / Pipeline Punks / Walk Away]
- **MAP Scheduled:** [Date/Time or N/A]

## Notes
[Additional observations]
```

### MAP-findings.md

```markdown
# MAP Findings - [Company Name]

**Date:** [Date]
**Duration:** [X] minutes

## The Business
### Q1: What They Do
[One-sentence description]

### Q2: Revenue Activities
[Core activities]

### Q3: Team and Roles
[Team structure]

## The Flow
### Q4: Typical Job Flow
[Step-by-step process]

### Q5: Where Things Break
[Breakdown points]

### Q6: Visibility
[How they know when something is off]

## The Decisions
### Q7: Daily/Weekly Decisions
[List]

### Q8: Hardest Decisions
[Friction points]

### Q9: Information Gaps
[What they wish they had]

## The Bottleneck
### Q10: Day Off Impact
[What happens]

### Q11: Knowledge Distribution
[Who knows what]

### Q12: Undocumented Rules
[What's in their head]

## Data Inventory
| Data Type | Location | Format | Issues |
|-----------|----------|--------|--------|
| Customer | | | |
| Financial | | | |
| Project | | | |
| Communication | | | |

## Desired State
[What "fixed" looks like]

## Constraints
- Budget: [Constraints]
- Timeline: [Constraints]
- Technical: [Constraints]
- Team: [Constraints]

## Recommended Solution
### Command Modules
- [ ] [Module 1] - [Why]
- [ ] [Module 2] - [Why]
- [ ] [Module 3] - [Why]

### Pricing
- Base price: $[X]
- Adjustments: [List]
- **Total: $[X]**

### Timeline
[X] weeks

## CHART Scheduled
[Date/Time]
```

### complexity-scoring.md

```markdown
# Complexity Scoring - [Company Name]

**Date:** [Date]

## Scoring Matrix

| Factor | Simple (1) | Standard (2) | Complex (3) | Score |
|--------|------------|--------------|-------------|-------|
| Data sources | 1-2 | 3-4 | 5+ | [ ] |
| Integrations needed | 0-1 | 2-3 | 4+ | [ ] |
| User roles | 1-2 | 3-4 | 5+ | [ ] |
| Process complexity | Linear | Branching | Multi-path | [ ] |
| Documentation exists | Yes | Partial | No | [ ] |
| **TOTAL** | | | | [ ] |

## Base Price
- 5-7 points: $2,500
- 8-11 points: $3,500
- 12-15 points: $5,000

**Base Price:** $[X]

## Adjustments

### Add $500-1,000
- [ ] Multiple locations: +$[X]
- [ ] Field AND office operations: +$[X]
- [ ] Custom reporting: +$[X]
- [ ] Tight timeline: +$[X]
- [ ] QuickBooks integration: +$[X]

### Subtract $500
- [ ] Some systems working: -$500
- [ ] Very small operation: -$500
- [ ] Strong referral: -$500

## Final Price
**$[Total]**

## Justification
[Brief explanation of scoring decisions]
```

---

## Active Client Folder Structure (30_ACTIVE_CLIENTS)

When agreement is signed, move and reorganize:

```
30_ACTIVE_CLIENTS/[Company-Name]/
├── 00-Direction-Protocol/      ← All sales materials
│   ├── IDENTIFY-notes.md
│   ├── ASSESS-notes.md
│   ├── MAP-findings.md
│   ├── complexity-scoring.md
│   ├── proposal.md
│   └── service-agreement.pdf
└── 01-Implementation/          ← Command Protocol files
    ├── context-graph.md        ← v2.0 (upgraded from v1.0)
    ├── kickoff-notes.md
    └── (additional implementation files)
```

---

## Nurture Folder Structure (25_NURTURE)

For "Not Now" prospects:

```
25_NURTURE/[Company-Name]-Pending/
├── IDENTIFY-notes.md
├── ASSESS-notes.md
├── MAP-findings.md
├── complexity-scoring.md
├── context-graph.md
├── proposal.md
└── nurture-notes.md           ← Follow-up tracking
```

---

## Archive Folder Structure (90_ARCHIVE)

For walk-aways and unresponsive:

```
90_ARCHIVE/
└── [Year]/
    ├── [Company-Name]-WalkAway/
    │   └── (all files from prospect folder)
    └── [Company-Name]-NoResponse/
        └── (all files from prospect folder)
```

---

## ARO Assessment Integration

If prospect completed ARO Assessment before Direction Protocol:

```
30_ACTIVE_CLIENTS/[Company-Name]/
├── 00-ARO-Assessment/          ← ARO deliverables
│   ├── intake-questionnaire-responses.md
│   ├── discovery-notes.md
│   ├── scoring-worksheet.md
│   ├── context-architecture-report.md
│   └── implementation-roadmap.md
├── 01-Direction-Protocol/      ← Abbreviated DP materials
│   ├── proposal.md
│   └── service-agreement.pdf
└── 02-Implementation/          ← Command Protocol files
    └── context-graph.md        ← v2.0 (built from ARO)
```

---

## File Naming Conventions

### General Rules
- Use descriptive names
- No spaces (use hyphens)
- Lowercase preferred
- Include date if multiple versions: `MAP-findings-2026-01-28.md`

### Company Folder Names
- Format: `Company-Name` (capitalize words, hyphenate)
- Examples: `Acme-HVAC`, `Joes-Plumbing`, `Northwest-Realty`

### Stage Transition
When moving folders:
1. Move entire folder (don't copy)
2. Update any internal references
3. Log movement in CRM

---

## Quick Reference: Where Does It Go?

| Situation | Folder Location |
|-----------|-----------------|
| New qualified lead | 20_PROSPECTS/[Client]/ |
| Going through ASSESS/MAP/CHART | 20_PROSPECTS/[Client]/ |
| Said YES, agreement signed | 30_ACTIVE_CLIENTS/[Client]/ |
| Said "Not Now" | 25_NURTURE/[Client]-Pending/ |
| Walked away | 90_ARCHIVE/[Year]/[Client]-WalkAway/ |
| Went dark (30+ days) | 90_ARCHIVE/[Year]/[Client]-NoResponse/ |
| Implementation complete | 40_PAST_CLIENTS/[Client]/ |
| ARO client, now implementing | 30_ACTIVE_CLIENTS/[Client]/ (with ARO subfolder) |

---

**Document Status:** Complete
**Next Review:** After first 10 prospects through the system
**Feedback:** Note any missing file types or folder issues
