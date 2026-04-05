---
name: direction-protocol
description: TNDS Direction Protocol - Complete sales process for client acquisition from initial contact through signed engagement. Use when interviewing potential clients, conducting discovery calls, qualifying prospects, preparing for client meetings, creating proposals, handling objections, or moving prospects through the sales pipeline. Triggers on phrases like "prospect call", "client meeting", "discovery call", "sales conversation", "qualify this lead", "prepare for meeting with", "objection handling", "proposal preparation", "how do I close", "Direction Protocol", or when evaluating fit with a potential client. Integrates with bearing-check for decision validation, aro-assessment for operational evaluation, and world-model-mapper for deep process analysis.
version: 2.0
last_updated: 2026-01-28
---

# TNDS Direction Protocol™ Skill

A structured, five-stage sales process for taking prospects from initial contact through signed engagement. Protects both TNDS and clients from bad-fit engagements.

## Core Principle

We don't sell automation. We sell the ability to see what's happening in your operation so you can make better decisions and take a day off.

**The Transformation:** Direction Protocol gets you clarity. Command Protocol gets you control. That's how we turn data into direction.

**The Two Protocols:**
- **Direction Protocol (Sales)**: How we identify what clients need
- **Command Protocol (Delivery)**: How we build what clients need

---

## Protocol Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE DIRECTION PROTOCOL                              │
│                                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐│
│  │ STAGE 1  │───▶│ STAGE 2  │───▶│ STAGE 3  │───▶│ STAGE 4  │───▶│STAGE 5 ││
│  │          │    │          │    │          │    │          │    │        ││
│  │ IDENTIFY │    │  ASSESS  │    │   MAP    │    │  CHART   │    │ LAUNCH ││
│  │          │    │          │    │          │    │          │    │        ││
│  │ 15-20min │    │ 30min    │    │ 90-120min│    │ 30-45min │    │ varies ││
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └────────┘│
│       │               │               │               │              │      │
│       ▼               ▼               ▼               ▼              ▼      │
│   Schedule        Schedule or      Quote or       Sign or        Kick      │
│   Assess          Walk Away        Walk Away      Negotiate      Off       │
└─────────────────────────────────────────────────────────────────────────────┘
```

**CRITICAL RULE: Never skip stages. Never quote without mapping. Never close without charting.**

---

## Stage 1: IDENTIFY (15-20 minutes)

### Purpose
Determine if there's enough fit to justify a longer conversation.

### Entry Points
- Warm referral
- Inbound from website
- Networking event follow-up
- Cold outreach response

### The Three Discovery Questions

1. "Tell me about your operation. What do you do, and how many people are involved?"
2. "What's the thing that keeps you up at night about the business right now?"
3. "If you could wave a magic wand and fix one thing tomorrow, what would it be?"

### Pain Signals (GREEN - Listen For)
- "I can't see what's happening"
- "I find out about problems too late"
- "Everything depends on me"
- "I can't take a day off"
- "My guys don't do things consistently"
- "I'm drowning in spreadsheets / paper / texts"

### Disqualifiers (RED - Walk Away)
- "I just need someone to build me an app"
- "I want AI to handle everything"
- "What's the cheapest option?"
- "I don't really have a problem, just exploring"

### Qualification Scoring

| Factor | Yes (2pts) | Maybe (1pt) | No (0pts) |
|--------|------------|-------------|-----------|
| Real operational problem | | | |
| Decision-maker present | | | |
| Sounds coachable | | | |
| Right size (5-20 people) | | | |

**Score Interpretation:**
- 7-8 points: GREEN → Schedule Assess
- 5-6 points: YELLOW → Schedule Assess with notes
- 0-4 points: RED → Pipeline Punks or Walk Away

### Claude's Role
- Structure discovery questions based on lead source
- Track responses against pain signals and disqualifiers
- Calculate qualification score
- Recommend next action with reasoning
- Draft appropriate follow-up communications

### Output: Qualification Summary
- Qualification status (Green/Yellow/Red)
- Key pain points identified
- Disqualifier check results
- Recommended next action
- Follow-up email template

---

## Stage 2: ASSESS (30 minutes)

### Purpose
Validate problem is real, prospect is ready to invest.

### Process Structure

1. **Opening (2 minutes)**
   - Recap main pain point from Identify stage
   - Set expectations for deep questioning

2. **Section 1: Operational Reality (10 minutes)**
   - "Walk me through a typical day or week in your operation"
   - "Where in that flow do things usually go wrong?"
   - "How do you find out when something's off?"
   - "What decisions are you making regularly that you feel like you're guessing on?"

3. **Section 2: Current State (8 minutes)**
   - "Where does all your business information live right now?"
   - "If you needed to know [relevant metric] right now, how would you find out?"
   - "Who else in your operation knows how things work, or is it mostly in your head?"

4. **Section 3: Stakes and Readiness (5 minutes)**
   - "What's this costing you? Not just money, but time, stress, missed opportunities?"
   - "If nothing changes, where are you in a year?"
   - "If we fixed this, what would be different?"

5. **Section 4: Fit Check (3 minutes)**
   - Explain Map stage requirement (90 min deep dive)
   - Gauge openness and commitment

6. **Section 5: Budget Reality (2 minutes)**
   - "What's your budget range for solving this?"
   - If hesitant: "Have you thought about what fixing this would be worth to you?"

### SRO Assessment Framework

| Factor | Strong (3-4) | Moderate (2) | Weak (0-1) |
|--------|--------------|--------------|------------|
| **Stakes** - How painful is this problem? | | | |
| **Readiness** - Are they ready to act now? | | | |
| **Openness** - Will they engage with the process? | | | |

**SRO Total:**
- 9-10: STRONG → Schedule Map with high confidence
- 6-8: MODERATE → Schedule Map with concerns noted
- 1-5: WEAK → Pipeline Punks or Walk Away

### Listen For
- **Enthusiasm**: "Yes, I need someone to actually understand my business"
- **Resistance**: "Can't you just tell me what it costs?"
- **Skepticism**: "I've tried stuff before and it didn't work"

### Claude's Role
- **USE ARO ASSESSMENT SKILL** for structured operational evaluation
- Track pain intensity and specificity
- Identify data sources and system gaps
- Calculate business impact metrics
- Score readiness and fit using SRO framework
- Recommend Map/Chart approach or Pipeline Punks path
- Draft assessment summary

### Output: Assessment Report
- Detailed assessment using SRO framework
- Operational reality summary
- Current state inventory
- Stakes quantification
- Readiness score
- Recommendation (Map/Pipeline Punks/Walk Away)

---

## Stage 3: MAP (90-120 minutes)

### Purpose
Deep operational diagnostic to understand what's broken, what's needed, and what solutions would work.

### Process Framework

1. **Introduction (5 minutes)**
   - Set expectations: this is diagnostic, not sales
   - Explain note-taking and follow-up process
   - Confirm timeline and next steps

2. **Discovery using 12 Diagnostic Questions (45 minutes)**
3. **Pain Point Deep Dive (20 minutes)**
4. **Desired State Exploration (15 minutes)**
5. **Solution Exploration (15 minutes)**
6. **Constraints and Requirements (10 minutes)**
7. **Wrap and Next Steps (5 minutes)**

### The 12 Diagnostic Questions

**THE BUSINESS:**
1. In one sentence, what does your business do?
2. What are the core activities that produce revenue?
3. How many people work here? What are the main roles?

**THE FLOW:**
4. Walk me through a typical job from start to finish.
5. Where do things most often go wrong?
6. How do you currently know when something is off?

**THE DECISIONS:**
7. What decisions do you make every day/week?
8. Which decisions feel hardest or slowest?
9. What information do you wish you had?

**THE BOTTLENECK:**
10. What happens when you take a day off?
11. Who else knows how things work around here?
12. What's in your head that isn't written down?

### Data Inventory Categories

Document where their information lives:
- Paper
- Spreadsheets
- Texts/Messages
- Email
- Software/Apps
- Whiteboards
- Someone's head

### Desired State Exploration
- "What would 'fixed' look like?"
- "What decisions would you make differently with better visibility?"
- "What would you be able to do that you can't do now?"

### Complexity Scoring

| Factor | Simple (1pt) | Standard (2pts) | Complex (3pts) |
|--------|--------------|-----------------|----------------|
| Data sources | 1-2 | 3-4 | 5+ |
| Integrations needed | 0-1 | 2-3 | 4+ |
| User roles | 1-2 | 3-4 | 5+ |
| Process complexity | Linear | Branching | Multi-path |
| Documentation exists | Yes | Partial | No |

**Score → Base Price:**
- 5-7 points: $2,500
- 8-11 points: $3,500
- 12-15 points: $5,000

**Adjustments (add $500-1,000 each):**
- Multiple locations
- Both field AND office operations
- Custom reporting needed
- Tight timeline
- QuickBooks integration
- Advanced reporting

**Adjustments (subtract $500):**
- Some systems already working
- Very small operation
- Strong referral

### Claude's Role
- **USE WORLD MAPPER SKILL** for comprehensive operational mapping
- **USE ARO ASSESSMENT SKILL** for systems evaluation
- Structure the conversation flow
- Document all findings in structured format
- Calculate scoring automatically
- Identify required Command modules
- Generate pricing recommendation
- Create visual workflow maps
- Prepare Chart stage materials

### Output: Map Package
- Comprehensive operational map (use World Mapper)
- Pain point analysis with root causes
- Proposed solution architecture
- Command modules list
- Scoring breakdown
- Pricing calculation with reasoning
- Chart presentation outline

---

## Stage 4: CHART (30-45 minutes)

### Purpose
Present findings, proposed solution, and pricing. Get commitment or negotiate.

### Required Deliverables
- One-page current state summary
- Data flow diagram
- Findings list (gaps, duplicated effort, blind spots)
- Command modules identified
- Recommendation with scope and pricing

### Presentation Flow

1. **Present Current State (5-7 min)**
   - "Here's what I heard..."
   - Recap their current situation and pain points
   - Use their words
   - Validate understanding

2. **Present Findings (5-7 min)**
   - Present the operational map
   - Show data flow diagram
   - Highlight breakdowns
   - Show specific problems and root causes

3. **Present Recommendation (10-15 min)**
   - Explain proposed solution approach
   - Detail Command modules to be deployed
   - Explain implementation approach

4. **Quote & Pricing (5 min)**
   - Present total price
   - Break down scope and deliverables
   - Explain timeline (2-4 weeks typical)
   - Review payment terms (50/50 or 40/30/30)
   - State price, then stop talking

5. **The Outcome (5 minutes)**
   - Paint the "after" picture
   - Quantify expected impact
   - Address their specific pain points

6. **Close and Next Steps (5 minutes)**
   - "Does this make sense for you?"
   - Handle objections
   - If yes: move to Launch
   - If negotiate: understand concerns
   - If no: understand why

### Response Handling

| Response | Action |
|----------|--------|
| "That sounds good" | Move to Launch |
| "I need to think about it" | Ask what questions would help decide |
| "That's more than I expected" | Ask what they were expecting, use ROI math |
| "I'm not ready" | Ask what's holding them back, walk away gracefully if needed |

### Objection Handling Reference

**"Can't you just tell me the price?"**
> "I could give you a range, but it would be so wide it wouldn't be useful. The Map stage is how I figure out what Command modules you actually need."

**"Why do I need a Map session?"**
> "What people think they need and what actually fixes the problem are often different. The Map stage protects both of us."

**"That's expensive" (Use ROI Math)**
> Monthly time saved × hourly value = monthly savings
> Investment ÷ monthly savings = payback period
>
> Example: 8 hrs/month × $125/hr = $1,000/month savings
> $4,000 ÷ $1,000 = 4 month payback

**"Can we start smaller?"**
> "I can't do half a Command Center. But if there's a specific first step that would give you confidence, I'm open to discussing it."

**"Found something cheaper"**
> "Cheaper doesn't mean it solves the problem. What specifically are you comparing?"

### Claude's Role
- Generate complete proposal document
- Create visual presentation of findings
- Calculate final pricing with adjustments
- Draft objection responses
- Prepare service agreement
- Structure close conversation

### Output: Proposal Package
- Complete proposal document
- Service agreement ready to sign
- Implementation timeline
- Success metrics definition
- Objection handling notes

---

## Stage 5: LAUNCH

### Purpose
Execute contract, receive payment, kick off project.

### Process
1. Send simple agreement (1-2 pages)
2. Include: scope, modules, price, payment terms, timeline
3. Request signature and 50% deposit
4. Upon receipt, send kickoff scheduling link
5. Schedule kickoff meeting
6. Assign project team
7. Set up project tracking
8. Begin Command Protocol delivery

### Follow-Up Cadence
- 2 days: "Just bumping this to the top of your inbox."
- 5 days: "Are you still planning to move forward?"
- 10 days: "I'm going to assume the timing isn't right."
- Then stop. Don't chase.

### Claude's Role
- Generate final service agreement
- Create project kickoff documentation
- Set up project tracking structure
- Create implementation timeline
- Prepare handoff to delivery team

### Output: Launch Package
- Signed service agreement
- Kickoff meeting agenda
- Project tracking setup
- Implementation checklist
- Team assignment plan

---

## Command Protocol Reference

### Service Offerings

| Service | What It Is | Price | Timeline |
|---------|------------|-------|----------|
| **Command Center Build** | Install visibility + Command modules | $2,500-5,000 | 2-4 weeks |
| **Battle Rhythm Install** | Install operating cadence + accountability | $2,000-4,000 | 2-4 weeks |
| **Command Partner** | Ongoing fractional ops support | $1,000-2,000/mo | Monthly |

### Command Modules

Available building blocks (all end in "-command" or "-ops"):
- **data-command**: Central data management
- **financial-command**: Money tracking, job costing
- **analytics-command**: Reporting and KPIs
- **asset-command**: Equipment/fleet tracking
- **office-command**: Admin workflow
- **onboard-command**: New hire/client onboarding
- **proposal-command**: Quotes and proposals
- **workspace-command**: Google Workspace automation
- **sms-command**: Text notifications
- **contract-command**: Contract management
- **realty-command**: Real estate specific tools
- **tax-command**: Tax tracking and prep
- **seo-command**: SEO operations
- **govcon-command**: Government contracting
- **compliance-gov-module**: Compliance tracking

---

## ICP Definition (Ideal Client Profile)

**Target Profile:**
- Field service OR office operations
- 5-20 employees
- Owner is overwhelmed
- Can't see what's happening in real-time
- Information scattered (texts/paper/spreadsheets)
- Can't take a day off without chaos
- Making decisions blind
- Growth stalled by operational chaos

**Perfect Pain Signals:**
- "I find out about problems after they happen"
- "Everything runs through me"
- "I don't trust the numbers I'm looking at"
- "My team doesn't follow processes"
- "I spend half my day just figuring out what's going on"

---

## Red Flags: When to Walk Away

**Disqualifiers:**
- Won't commit time for Map stage
- Wants price before assessment
- Wants guaranteed outcomes you can't control
- Argues about price before understanding scope
- Expects you to manage their team for them
- "Tried everything" - learned helplessness
- Blames everyone else for every problem
- Disrespectful of time or expertise
- Vibe is off / dread working with them

**Walking Away Script:**
> "I've really appreciated learning about your business. Based on what I'm hearing, I don't think I'm the right fit for what you need right now. [Optional: brief, honest reason.] I'd rather be upfront about that than waste your time."

**Remember:** A bad client costs more than no client. They eat your time, drain your energy, and don't refer good people.

---

## Pipeline Punks Alternative Path

For prospects who:
- Like the TNDS approach but can't afford full service
- Have DIY mindset and technical aptitude
- Have 10-20 hours to dedicate to learning
- Value saving money over saving time

| Client Profile | Recommend |
|----------------|-----------|
| Budget <$1,500 + Has 10-20 hours | Pipeline Punks (DIY education) |
| Budget <$1,500 + No time | Revisit in 3-6 months |
| Budget $1,500-$3,000 + DIY mindset | Pipeline Punks |
| Budget $1,500-$3,000 + Needs it done | Command Center Build (entry) |
| Budget >$3,000 | Command Center Build (full) |

**The Credit Bridge:**
> "If you start with Pipeline Punks and later realize you don't have the time, we'll give you a 50% credit toward having us build it. So if you invest $500 in training, you'd get $250 off the Command Center Build."

---

## Integration with Other Skills

### Skill Workflow for Client Acquisition

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CLIENT ACQUISITION WORKFLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PROSPECT ENTERS                                                            │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────┐                                                       │
│  │  DIRECTION      │  Stage 1: IDENTIFY                                    │
│  │  PROTOCOL       │  Stage 2: ASSESS                                      │
│  │  (This Skill)   │  Stage 3: MAP ─────────────────────────────┐          │
│  │                 │  Stage 4: CHART                             │          │
│  │                 │  Stage 5: LAUNCH                            │          │
│  └────────┬────────┘                                             │          │
│           │                                                      │          │
│           │ During MAP stage, optionally use:                    │          │
│           │                                                      ▼          │
│           │                                         ┌────────────────────┐  │
│           │                                         │  WORLD-MODEL-      │  │
│           │                                         │  MAPPER            │  │
│           │                                         │  Deep process      │  │
│           │                                         │  analysis          │  │
│           │                                         └────────────────────┘  │
│           │                                                                 │
│           │ After LAUNCH, transition to:                                    │
│           ▼                                                                 │
│  ┌─────────────────┐                                                       │
│  │  COMMAND        │  Delivery phase                                       │
│  │  PROTOCOL       │  (See Command Protocol SOP)                           │
│  └─────────────────┘                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### When to Use Each Skill

| Situation | Primary Skill | Supporting Skills |
|-----------|---------------|-------------------|
| New prospect call | **direction-protocol** | - |
| Preparing for discovery | **direction-protocol** | - |
| Deep process mapping during MAP | direction-protocol | **world-model-mapper** |
| Evaluating if client is AI-ready | direction-protocol | **aro-assessment** |
| Post-engagement: Should we offer additional service? | **bearing-check** | - |

### Skill Handoffs

**Direction Protocol → World Model Mapper:**
During MAP stage, if process complexity warrants deeper analysis, invoke world-model-mapper to identify shadow processes, feedback loops, and domain physics.

**Direction Protocol → ARO Assessment:**
If prospect asks about AI/automation capabilities, or if you're evaluating whether their operation can support AI tools, use aro-assessment to score their agent-readiness.

**Direction Protocol → Command Protocol:**
After LAUNCH, transition to Command Protocol for delivery. Direction Protocol is complete.

---

## Metrics & Tracking

| Stage | Metric | Target |
|-------|--------|--------|
| Identify | Show rate | 80%+ |
| Identify → Assess | Conversion | 50%+ |
| Assess | Show rate | 90%+ |
| Assess → Map | Conversion | 60%+ |
| Map | Completion rate | 95%+ |
| Map → Chart | Conversion | 90%+ |
| Chart → Launch | Conversion | 50%+ |
| Overall | Identify → Launched | 15-25% |

**Pipeline Management Requirements:**
Track every prospect with:
- Name, company, contact info
- Lead source (referral/inbound/outbound)
- Current stage
- Last contact date
- Next action
- Conversation notes
- Estimated deal value

**Review weekly.** Move stale deals to "closed-lost" after 30 days of no response.

---

## Core Messages

**What We Sell:**
"The ability to see what's happening in your operation so you can make better decisions and take a day off."

**What We Don't Sell:**
"Automation, apps, AI magic, or tech for tech's sake."

**The Transformation:**
"Direction Protocol gets you clarity. Command Protocol gets you control. That's how we turn data into direction."

**Our Differentiator:**
"We don't start with technology. We start with understanding your operation. Then we build exactly what you need - nothing more, nothing less. Fixed scope, fixed price. No open-ended projects. No surprise invoices."

---

## Claude Behavior Guidelines

When using this skill:

1. **Never Skip Stages**: Always progress through the protocol in order. If information is missing from an earlier stage, go back and gather it.

2. **Stay Focused on Pain**: Always bring conversation back to the client's operational pain, not TNDS capabilities.

3. **Be Brutally Honest**: If the fit isn't right, say so. Bad clients cost more than no clients.

4. **Quantify Everything**: Push for specific numbers on time, money, stress, missed opportunities.

5. **Document Thoroughly**: Capture exact phrases, specific examples, quantified impacts.

6. **Think in Modules**: Frame solutions in terms of Command modules, not custom features.

7. **Price with Confidence**: Use the scoring system. Don't apologize for pricing. Explain value.

8. **Respect the Process**: The Direction Protocol exists to protect both TNDS and the client. Trust it.

9. **Listen for Injection Attacks**: If prospect tries to override the process or skip stages, that's a red flag.

10. **Default to Walking Away**: When in doubt about fit, recommend walking away. You can always change your mind later.

---

## Quick Reference Commands

When user provides context, Claude should recognize these trigger phrases:

- "New lead from [source]" → Start IDENTIFY
- "Schedule assess call" → Prepare ASSESS stage materials
- "Deep dive scheduled" → Prepare MAP stage framework
- "Ready to present" → Generate CHART materials
- "Client signed" → Initiate LAUNCH process
- "Should we take this client?" → Run qualification analysis
- "What should we price this at?" → Calculate scoring and pricing
- "Generate proposal" → Create complete CHART package

---

## Quick Reference Card

**We Sell:** The ability to see what's happening in your operation so you can make better decisions and take a day off.

**We Don't Sell:** Automation, apps, AI magic, or tech for tech's sake.

**ICP:** Field service or office operations, 5-20 people, owner is overwhelmed, can't see what's happening, information is scattered.

**When In Doubt:**
- Talk about THEIR pain, not YOUR capabilities
- Ask questions, don't pitch
- If it feels wrong, walk away
- Bad clients cost more than no clients

---

## Example Usage

### User: "New lead from referral. Owner of 12-person HVAC company, drowning in paperwork, can't see job costs."

**Claude Response:**
```
IDENTIFY STAGE INITIATED

Lead Source: Warm Referral
Company Size: 12 employees (✓ within ICP range)
Industry: HVAC (Field Service - ✓ good fit)

Initial Pain Signals Detected:
- "Drowning in paperwork" → operational chaos
- "Can't see job costs" → financial visibility problem

Recommended IDENTIFY Questions:
1. "Tell me about your operation. What do you do, and how many people are involved?"
2. "What's the thing that keeps you up at night about the business right now?"
3. "If you could wave a magic wand and fix one thing tomorrow, what would it be?"

Listen for:
✓ Data visibility issues
✓ Decision-making blind spots
✓ Owner dependency
✗ "Just need an app"
✗ Price shopping

Expected Outcome: High likelihood for ASSESS stage based on initial signals.

Shall I draft the initial outreach email?
```

---

## Skill Dependencies

**Required Files/Resources:**
- TNDS_Direction_Protocol_Playbook.md
- TNDS_Pricing_Guide_Internal.docx
- TNDS_Service_Agreement.docx
- TNDS_Methodology_Capture_Template.docx

**Required Skills:**
- ARO Assessment Skill (for ASSESS and MAP stages)
- World Mapper Skill (for MAP stage)
- Bearing Check (for post-engagement decisions)

**Tech Integration:**
- Google Workspace (for document generation)
- CRM/Pipeline tracking system
- Proposal generation tools

---

## Success Criteria

This skill is successful when:

1. **Process Adherence**: No stages are skipped, protocol is followed consistently
2. **Qualification Accuracy**: Bad fits are identified early and walked away from
3. **Conversion Rates**: Hit target metrics at each stage
4. **Client Satisfaction**: Clients feel heard and understood through the process
5. **Scoping Accuracy**: Pricing matches actual project complexity
6. **Documentation Quality**: Complete records for every engagement
7. **Repeatable Results**: Process works regardless of who's running it

---

**END OF SKILL**

*Direction Protocol™ gets you clarity. Command Protocol™ gets you control. That's how we turn data into direction.*

---

## Confidentiality Notice

This document contains proprietary methodology and trade secrets of True North Data Strategies LLC. Unauthorized reproduction, distribution, or disclosure is prohibited.

---

© 2026 True North Data Strategies LLC. All rights reserved.

*Direction Protocol™ and Command Protocol™ are trademarks of True North Data Strategies LLC.*
