---
**CONFIDENTIAL - TRADE SECRET**
**Property of True North Data Strategies LLC**
**Unauthorized disclosure prohibited**
---

# Direction Protocol CRM Stages

**Version:** 1.0
**Last Updated:** January 28, 2026
**Purpose:** Define CRM pipeline stages for Direction Protocol deals

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DIRECTION PROTOCOL PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   New Lead → IDENTIFY → ASSESS → MAP → CHART → Proposal → Closed           │
│      │         │          │       │      │        │          │              │
│      ▼         ▼          ▼       ▼      ▼        ▼          ▼              │
│   [Entry]   [Qualify]  [Validate] [Scope] [Present] [Decide] [Win/Lose]    │
│                                                                              │
│   Lead        IDENTIFY    ASSESS    MAP     CHART    Proposal   Closed-Won  │
│   Source      Complete    Scheduled Complete Scheduled  Sent     Closed-Lost│
│                          Complete                               Nurture     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Stage Definitions

### Stage 1: New Lead

**Definition:** Prospect has been identified but not yet contacted

**Entry Criteria:**
- Lead source identified (referral, inbound, outbound, networking)
- Basic contact information captured
- Initial qualification signals present

**Required Fields:**
- Contact Name
- Company Name
- Email
- Phone (optional)
- Lead Source
- Initial Notes

**Exit Criteria:**
- IDENTIFY call scheduled OR
- Marked as "Not Qualified - Pre-Contact"

**Typical Duration:** 1-7 days

---

### Stage 2: IDENTIFY In Progress

**Definition:** Initial qualification call scheduled or recently completed

**Entry Criteria:**
- IDENTIFY call scheduled OR
- IDENTIFY call completed, evaluating fit

**Required Fields:**
- IDENTIFY Date/Time
- Pain Points (initial)
- Qualification Score (1-8)

**Exit Criteria:**
- Qualified → Move to "ASSESS Scheduled"
- Not Qualified → Move to "Closed-Lost" or "Pipeline Punks"

**Typical Duration:** 1-7 days

---

### Stage 3: ASSESS Scheduled

**Definition:** Qualified prospect, ASSESS call scheduled

**Entry Criteria:**
- IDENTIFY complete with score 5+
- ASSESS call scheduled

**Required Fields:**
- ASSESS Date/Time
- Expected Deal Value (estimate)

**Exit Criteria:**
- ASSESS complete → Move to "ASSESS Complete"

**Typical Duration:** 3-14 days

---

### Stage 4: ASSESS Complete

**Definition:** ASSESS call completed, evaluating for MAP

**Entry Criteria:**
- ASSESS call completed
- SRO score calculated

**Required Fields:**
- SRO Score (1-12)
- Key Pain Points
- Budget Indication

**Exit Criteria:**
- Green/Yellow → Move to "MAP Scheduled"
- Red → Move to "Closed-Lost" or "Pipeline Punks"

**Typical Duration:** 1-3 days

---

### Stage 5: MAP Scheduled

**Definition:** Prospect committed to 90-minute MAP session

**Entry Criteria:**
- SRO score 6+
- MAP session scheduled
- Prospect confirmed commitment

**Required Fields:**
- MAP Date/Time
- Expected Complexity (Simple/Standard/Complex)

**Exit Criteria:**
- MAP complete → Move to "MAP Complete"

**Typical Duration:** 3-14 days

---

### Stage 6: MAP Complete

**Definition:** MAP session completed, preparing CHART presentation

**Entry Criteria:**
- MAP session completed
- Complexity scoring done
- Pricing calculated

**Required Fields:**
- Complexity Score (5-15)
- Proposed Price
- Command Modules
- CHART Date/Time

**Exit Criteria:**
- CHART presentation ready → Move to "CHART Scheduled"

**Typical Duration:** 2-5 days

---

### Stage 7: CHART Scheduled

**Definition:** Findings and proposal ready, presentation scheduled

**Entry Criteria:**
- CHART presentation scheduled
- All materials prepared

**Required Fields:**
- CHART Date/Time
- Final Proposed Price
- Proposed Timeline

**Exit Criteria:**
- CHART complete → Move to "Proposal Sent"

**Typical Duration:** 1-7 days

---

### Stage 8: Proposal Sent

**Definition:** Proposal/agreement delivered, awaiting decision

**Entry Criteria:**
- CHART presentation completed
- Proposal/agreement sent

**Required Fields:**
- Proposal Sent Date
- Proposal Amount
- Expected Decision Date

**Exit Criteria:**
- YES → Move to "Negotiation" or "Closed-Won"
- Not Now → Move to "Nurture"
- No → Move to "Closed-Lost"
- No Response → Move to "Closed-Lost (Unresponsive)"

**Typical Duration:** 1-14 days (follow up at Day 2, 5, 10)

---

### Stage 9: Negotiation

**Definition:** Client interested but negotiating terms

**Entry Criteria:**
- Client expressed interest
- Terms being discussed

**Required Fields:**
- Negotiation Notes
- Adjusted Amount (if any)
- Adjusted Scope (if any)

**Exit Criteria:**
- Agreement reached → Move to "Closed-Won"
- No agreement → Move to "Closed-Lost" or "Nurture"

**Typical Duration:** 1-7 days

---

### Stage 10: Closed-Won

**Definition:** Agreement signed, deal won

**Entry Criteria:**
- Service agreement signed
- Deposit received (or payment terms confirmed)

**Required Fields:**
- Close Date
- Final Contract Value
- Payment Terms
- Expected Start Date
- Command Modules (final)

**Exit Criteria:** N/A (terminal stage)

---

### Stage 11: Closed-Lost

**Definition:** Deal not won

**Entry Criteria:**
- Prospect declined OR
- Not qualified OR
- Unresponsive after follow-up sequence

**Required Fields:**
- Lost Date
- Lost Reason (required)
- Lost Stage (where in pipeline)
- Re-engage Date (optional)

**Lost Reasons:**
- Not Qualified (wrong size, no pain, etc.)
- Budget (can't afford)
- Timing (not ready now)
- Competition (chose competitor)
- No Decision (couldn't decide)
- Unresponsive (went dark)
- Walk Away (we declined)

**Exit Criteria:** N/A (terminal stage)

---

### Stage 12: Nurture

**Definition:** Prospect said "not now" — future potential

**Entry Criteria:**
- Prospect interested but timing not right
- Specific re-engagement date agreed

**Required Fields:**
- Nurture Start Date
- Next Contact Date
- Reason for Delay
- Original Proposal Value

**Exit Criteria:**
- Ready to proceed → Move to "Proposal Sent"
- Lost interest → Move to "Closed-Lost"

**Typical Duration:** 30-180 days

---

## Deal Fields Reference

### Standard Fields (All Stages)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Contact Name | Text | Yes | |
| Company Name | Text | Yes | |
| Email | Email | Yes | |
| Phone | Phone | No | |
| Lead Source | Dropdown | Yes | Referral, Inbound, Outbound, Networking |
| Owner | User | Yes | Who owns this deal |
| Created Date | Date | Auto | |
| Last Contact | Date | Manual | |
| Next Action | Text | Yes | What's the next step |
| Next Action Date | Date | Yes | When to follow up |

### Direction Protocol Fields

| Field | Type | When Required | Notes |
|-------|------|---------------|-------|
| IDENTIFY Date | Date | After IDENTIFY | |
| Qualification Score | Number | After IDENTIFY | 0-8 |
| ASSESS Date | Date | After ASSESS | |
| SRO Score | Number | After ASSESS | 0-12 |
| MAP Date | Date | After MAP | |
| Complexity Score | Number | After MAP | 5-15 |
| Command Modules | Multi-select | After MAP | |
| CHART Date | Date | After CHART | |
| Proposed Price | Currency | After MAP | |
| Proposal Sent Date | Date | After CHART | |
| Expected Close Date | Date | After CHART | |

### Closed Deal Fields

| Field | Type | When Required | Notes |
|-------|------|---------------|-------|
| Close Date | Date | On close | |
| Contract Value | Currency | On win | Final amount |
| Payment Terms | Dropdown | On win | 50/50, 40/30/30 |
| Implementation Start | Date | On win | |
| Expected Completion | Date | On win | |
| Lost Reason | Dropdown | On loss | Required |
| Lost Stage | Dropdown | On loss | Where in pipeline |

---

## Stage Movement Criteria

### When to Move Forward

| From | To | Criteria |
|------|-----|----------|
| New Lead | IDENTIFY In Progress | Call scheduled |
| IDENTIFY In Progress | ASSESS Scheduled | Score 5+, ASSESS scheduled |
| ASSESS Scheduled | ASSESS Complete | Call completed |
| ASSESS Complete | MAP Scheduled | SRO 6+, MAP scheduled |
| MAP Scheduled | MAP Complete | Session completed, scored |
| MAP Complete | CHART Scheduled | Materials ready, call scheduled |
| CHART Scheduled | Proposal Sent | Presentation done, proposal sent |
| Proposal Sent | Negotiation | Client discussing terms |
| Proposal Sent | Closed-Won | Agreement signed |
| Negotiation | Closed-Won | Agreement signed |

### When to Move to Nurture

| From | Criteria |
|------|----------|
| ASSESS Complete | SRO 1-5, but interested |
| Proposal Sent | Said "not now" with timeline |
| Negotiation | Can't agree now, future interest |

### When to Close Lost

| From | Criteria |
|------|----------|
| IDENTIFY In Progress | Score <5, disqualified |
| ASSESS Complete | SRO <6, no interest |
| Proposal Sent | Declined, no future interest |
| Proposal Sent | 30+ days unresponsive |
| Negotiation | Can't reach agreement |

---

## Reporting Views

### Pipeline by Stage

Shows current deals at each stage with:
- Deal count per stage
- Total value per stage
- Average days in stage
- Conversion rate from previous stage

### Pipeline by Value

Shows deals sorted by value with:
- Expected close date
- Days since last contact
- Probability (by stage)
- Weighted value

### Aging Report

Shows deals with long duration:
- Days in current stage
- Last contact date
- Next action overdue?
- Owner

### Conversion Funnel

Shows stage-to-stage conversion:
- New Lead → IDENTIFY: [X]%
- IDENTIFY → ASSESS: [X]%
- ASSESS → MAP: [X]%
- MAP → CHART: [X]%
- CHART → Closed-Won: [X]%
- Overall: New Lead → Closed-Won: [X]%

### Lost Deal Analysis

Shows closed-lost deals by:
- Lost Reason (pie chart)
- Lost Stage (when they dropped)
- Lost by Month (trend)
- Recovery Rate (nurture → won)

---

## Weekly Pipeline Review Checklist

- [ ] Review deals stuck >30 days in any stage
- [ ] Update "Next Action" for all active deals
- [ ] Move stale deals to appropriate stage
- [ ] Review lost deals from past week (learnings)
- [ ] Check nurture deals for re-engagement timing
- [ ] Calculate conversion metrics
- [ ] Forecast next 30/60/90 days

---

## ARO Assessment Pipeline Integration

ARO Assessment has its own pipeline that feeds into Direction Protocol:

| ARO Stage | Direction Protocol Equivalent |
|-----------|------------------------------|
| ARO - Lead | IDENTIFY In Progress |
| ARO - In Progress | MAP Scheduled (equivalent) |
| ARO - Handoff Complete | CHART Complete |
| ARO - Implementation Proposed | Proposal Sent |

When ARO client moves to implementation:
- Apply $500 credit
- Create Direction Protocol deal OR update existing
- Skip to "Proposal Sent" stage

---

**Document Status:** Complete
**Next Review:** After first month of pipeline tracking
**Feedback:** Note any missing stages or fields needed
