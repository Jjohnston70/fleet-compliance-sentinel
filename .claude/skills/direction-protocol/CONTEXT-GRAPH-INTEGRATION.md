# Context Graph Integration for Direction Protocol

**Version:** 1.0
**Last Updated:** January 28, 2026
**Purpose:** Define how Context Graph is created and used during Direction Protocol

---

## Overview

The Context Graph is a structured document that captures complete client context. It's created during MAP stage and evolves through implementation and beyond.

**Key Principle:** The Context Graph becomes the "single source of truth" for all client information, usable by both humans and AI agents.

---

## What is Context Graph?

The Context Graph is a structured markdown document containing:

1. **Entity Profile** — Client identity and contacts
2. **Business Context** — Pain points, goals, constraints
3. **Tech Stack** — Current systems and integrations
4. **Operational Rules** — How the client works
5. **Project Context** — Scope, timeline, deliverables
6. **Communication Log** — Key interactions
7. **Financial Context** — Pricing, payments, contracts
8. **Artifact Index** — Document locations

**Purpose:** Enable anyone (or any AI) to understand the client relationship quickly and completely.

---

## When to Create Context Graph

### During Direction Protocol

| Stage | Context Graph Action |
|-------|----------------------|
| IDENTIFY | Not created yet |
| ASSESS | Not created yet |
| MAP | **Create v1.0** |
| CHART | Finalize v1.0 |
| LAUNCH | Upgrade to v2.0 |

### Creation Timeline

```
MAP Session
    │
    ▼
Create Context Graph v1.0
(During or immediately after MAP)
    │
    ▼
Finalize during CHART prep
    │
    ▼
Client says YES
    │
    ▼
Upgrade to v2.0 at Implementation Kickoff
    │
    ▼
Weekly updates during implementation
    │
    ▼
v3.0 at post-implementation
```

---

## Context Graph Versioning

### v1.0 — Assessment Baseline

**Created:** End of MAP stage
**Location:** `20_PROSPECTS/[Client]/context-graph.md`

**Contains:**
- Basic entity profile
- Business context from discovery
- Pain points (from ASSESS and MAP)
- Current tech stack
- Initial operational rules
- Assessment notes summary

### v2.0 — Implementation Kickoff

**Created:** When agreement is signed
**Location:** `30_ACTIVE_CLIENTS/[Client]/01-Implementation/context-graph.md`

**Updates from v1.0:**
- Implementation scope added
- Project timeline added
- Deliverables defined
- Team assignments
- Access credentials (secure)
- Communication preferences

### v2.x — During Implementation

**Updated:** Weekly during active implementation

**Updates:**
- Progress notes
- Decisions made
- Issues encountered
- Communication log
- Scope changes (if any)

### v3.0 — Post-Implementation

**Created:** When implementation completes
**Location:** Same as v2.x

**Updates from v2.x:**
- Project marked complete
- Lessons learned
- Retainer terms (if applicable)
- Ongoing maintenance notes
- Next review date

---

## What to Capture at Each Stage

### During MAP Session

Capture these for Context Graph v1.0:

**Entity Profile:**
- [ ] Company name and description
- [ ] Primary contact name, email, phone
- [ ] Decision-maker (if different)
- [ ] Physical location(s)

**Business Context:**
- [ ] Business model summary
- [ ] Team size and structure
- [ ] Revenue drivers
- [ ] Pain points (ranked by priority)
- [ ] Success metrics ("fixed" looks like)
- [ ] Constraints (budget, timeline, team)

**Tech Stack:**
- [ ] Current systems used
- [ ] Data sources inventory
- [ ] Integration needs
- [ ] Access requirements

**Operational Rules:**
- [ ] Communication preferences
- [ ] Decision-making style
- [ ] Working hours/availability
- [ ] Key contacts for different areas

### At Implementation Kickoff

Add these for v2.0:

**Project Context:**
- [ ] Scope (Command modules)
- [ ] Deliverables list
- [ ] Timeline with milestones
- [ ] Success criteria
- [ ] Client responsibilities

**Financial Context:**
- [ ] Contract value
- [ ] Payment terms
- [ ] Payment schedule
- [ ] Invoices sent/received

**Artifact Index:**
- [ ] Proposal location
- [ ] Agreement location
- [ ] MAP findings location
- [ ] Implementation folder path

---

## Context Graph Template

### Minimal v1.0 Template

```markdown
# Context Graph - [Client Name]

**Version:** 1.0 - Assessment Baseline
**Created:** [Date]
**Last Updated:** [Date]

---

## Entity Profile

### Company
- **Name:** [Company Name]
- **Description:** [One-sentence description]
- **Size:** [X] employees
- **Industry:** [Industry]
- **Location:** [City, State]

### Primary Contact
- **Name:** [Name]
- **Role:** [Title]
- **Email:** [Email]
- **Phone:** [Phone]

### Decision-Maker
[If different from primary contact]

---

## Business Context

### Pain Points (Ranked)
1. [Pain point 1] — [Impact]
2. [Pain point 2] — [Impact]
3. [Pain point 3] — [Impact]

### Success Metrics
- [What "fixed" looks like]
- [Specific outcomes they want]

### Constraints
- **Budget:** [Constraints]
- **Timeline:** [Constraints]
- **Team:** [Constraints]

---

## Tech Stack

### Current Systems
| System | Purpose | Notes |
|--------|---------|-------|
| | | |

### Data Sources
| Data Type | Location | Format |
|-----------|----------|--------|
| | | |

### Integration Needs
- [Integration 1]
- [Integration 2]

---

## Operational Rules

### Communication
- **Preferred:** [Email/Slack/Phone]
- **Response time:** [Expectations]
- **Best times:** [When to reach]

### Decision Style
- [How they make decisions]
- [Who needs to be involved]

---

## Notes

### From IDENTIFY
[Key points]

### From ASSESS
[Key points]

### From MAP
[Key points]

---

**Version Control**
| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [Date] | Initial creation from MAP |
```

---

## ARO Assessment Integration

If client completed ARO Assessment:

### ARO Produces Context Graph v1.0

ARO Assessment creates a comprehensive Context Graph including:
- All entity profile information
- Detailed operational scoring
- Implementation roadmap
- Documentation tier recommendation

### Direction Protocol Uses ARO Context Graph

When ARO client moves to implementation:
1. **Don't recreate** — Use existing Context Graph
2. **Validate** — Quick check if anything changed
3. **Upgrade** — Move to v2.0 with implementation details

---

## Handoff Requirements

### What Command Protocol Needs

Context Graph v2.0 must include:

**Minimum Requirements:**
- [ ] Entity profile complete
- [ ] Pain points documented
- [ ] Tech stack captured
- [ ] Scope defined
- [ ] Timeline documented
- [ ] Access information (or where to get it)

**Quality Standards:**
- No generic placeholder text
- Specific to this client
- Actionable information
- Current and accurate

### Location for Handoff

```
30_ACTIVE_CLIENTS/[Client-Name]/
└── 01-Implementation/
    └── context-graph.md  ← v2.0 lives here
```

---

## Maintenance Guidelines

### During Implementation

- Update weekly (minimum)
- Log important decisions
- Track scope changes
- Note issues and resolutions
- Maintain communication log

### After Implementation

- Review monthly (if on retainer)
- Update for major changes
- Archive old versions if needed
- Keep as reference for future work

---

## Quick Reference

### When to Create

| Situation | Create Context Graph? |
|-----------|----------------------|
| After IDENTIFY | No |
| After ASSESS | No |
| After MAP | **Yes — v1.0** |
| Agreement signed | **Upgrade to v2.0** |
| Implementation complete | **Upgrade to v3.0** |

### Where to Store

| Version | Location |
|---------|----------|
| v1.0 | `20_PROSPECTS/[Client]/context-graph.md` |
| v2.0+ | `30_ACTIVE_CLIENTS/[Client]/01-Implementation/context-graph.md` |

### What to Include

| Stage | Include |
|-------|---------|
| MAP | Entity, Business, Tech Stack, Operational Rules |
| Kickoff | + Project Context, Financial Context, Artifacts |
| Implementation | + Progress, Decisions, Issues |
| Post | + Lessons Learned, Next Steps |

---

**Document Status:** Complete
**Next Review:** After first 5 Context Graphs created
**Feedback:** Note any missing sections or confusing elements
