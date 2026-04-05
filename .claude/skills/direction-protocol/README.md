# TNDS Direction Protocol Skill

**Version:** 2.0
**Last Updated:** January 28, 2026

## Quick Start

**Purpose**: Guide Claude through the complete TNDS sales process from lead qualification to signed engagement.

**When to Use**: Any time you're evaluating a prospect, conducting discovery, or moving someone through the pipeline.

**Key Phrase**: "Direction Protocol gets you clarity. Command Protocol gets you control."

### Quick Start Navigation

| I want to... | Go to... |
|--------------|----------|
| Understand the sales process | [SKILL.md](SKILL.md) |
| See the complete workflow | [WORKFLOW.md](WORKFLOW.md) |
| Run a stage (IDENTIFY/ASSESS/MAP/CHART) | [USER_MANUAL.md](USER_MANUAL.md) |
| Calculate pricing | [SKILL.md](SKILL.md) → Complexity Scoring |
| Handle an objection | [SALES-TRAINING.md](SALES-TRAINING.md) → Part 3 |
| Send a client email | [EMAIL-TEMPLATES.md](EMAIL-TEMPLATES.md) |
| Hand off to implementation | [HANDOFF-PROTOCOL.md](HANDOFF-PROTOCOL.md) |
| Understand ARO integration | [ARO-DIRECTION-INTEGRATION.md](ARO-DIRECTION-INTEGRATION.md) |
| Check quality standards | [QUALITY-REVIEW-CHECKLIST.md](QUALITY-REVIEW-CHECKLIST.md) |
| Set up CRM stages | [CRM-STAGES.md](CRM-STAGES.md) |
| Track metrics | [METRICS-DASHBOARD.md](METRICS-DASHBOARD.md) |
| Create Context Graph | [CONTEXT-GRAPH-INTEGRATION.md](CONTEXT-GRAPH-INTEGRATION.md) |
| Organize client folders | [FOLDER-STRUCTURE.md](FOLDER-STRUCTURE.md) |

---

## Document Map

### Core Documents
| Document | Purpose |
|----------|---------|
| [SKILL.md](SKILL.md) | Main skill definition - complete Direction Protocol methodology |
| [USER_MANUAL.md](USER_MANUAL.md) | Quick reference guide for using the skill |
| [README.md](README.md) | This file - human-readable overview |

### Workflow Documents
| Document | Purpose |
|----------|---------|
| [WORKFLOW.md](WORKFLOW.md) | Complete stage-by-stage workflow with timing and outputs |
| [HANDOFF-PROTOCOL.md](HANDOFF-PROTOCOL.md) | Transition from Direction Protocol to Command Protocol |
| [ARO-DIRECTION-INTEGRATION.md](ARO-DIRECTION-INTEGRATION.md) | Integration between ARO Assessment and Direction Protocol |
| [CONTEXT-GRAPH-INTEGRATION.md](CONTEXT-GRAPH-INTEGRATION.md) | Context Graph creation and versioning |

### Sales Enablement
| Document | Purpose |
|----------|---------|
| [EMAIL-TEMPLATES.md](EMAIL-TEMPLATES.md) | Email templates for every stage |
| [SALES-TRAINING.md](SALES-TRAINING.md) | Discovery framework, objection handling, cheat sheets |

### Quality & Delivery
| Document | Purpose |
|----------|---------|
| [QUALITY-REVIEW-CHECKLIST.md](QUALITY-REVIEW-CHECKLIST.md) | Quality standards for each stage |
| [METRICS-DASHBOARD.md](METRICS-DASHBOARD.md) | KPIs and performance tracking |

### Operations
| Document | Purpose |
|----------|---------|
| [FOLDER-STRUCTURE.md](FOLDER-STRUCTURE.md) | Client folder organization |
| [CRM-STAGES.md](CRM-STAGES.md) | Pipeline stages and deal management |

### Reference/Archive
| Document | Purpose |
|----------|---------|
| [assessment-tools.md](assessment-tools.md) | Scoring systems and evaluation frameworks |
| [integration-guide.md](integration-guide.md) | SRO and World Mapper integration |
| SKILL-v1.0-comprehensive-ARCHIVED.md | Archived original SKILL.md |
| SKILL-v1.1-streamlined-ARCHIVED.md | Archived streamlined version |

---

## What This Skill Does

The Direction Protocol skill provides Claude with:

1. **Structured Sales Process**: 5-stage methodology from IDENTIFY to LAUNCH
2. **Qualification Framework**: Scientific screening to identify good vs. bad fit clients
3. **Assessment Tools**: Integrated SRO and World Mapper capabilities
4. **Pricing Calculator**: Algorithmic pricing based on complexity scoring
5. **Proposal Generation**: Complete CHART presentations and service agreements
6. **Pipeline Management**: Track prospects through every stage

---

## The Five Stages

```
IDENTIFY (15-20min)  →  ASSESS (30min)  →  MAP (90-120min)  →  CHART (30-45min)  →  LAUNCH
     │                      │                    │                     │              │
     ▼                      ▼                    ▼                     ▼              ▼
 Schedule              Schedule or          Quote or            Sign or          Kick Off
  Assess               Walk Away           Walk Away           Negotiate
```

**Critical Rule**: Never skip stages. Never quote without mapping. Never close without charting.

---

## How to Use This Skill

### Simple Usage

Just tell Claude where you are in the process:

```
"New lead from referral: 12-person HVAC company, owner can't see job costs"
→ Claude starts IDENTIFY stage

"Assess call scheduled with Peak HVAC tomorrow"
→ Claude prepares ASSESS materials

"Deep dive completed, need to create proposal"
→ Claude generates CHART presentation
```

### Advanced Usage

Request specific outputs:

```
"Run qualification scoring for this prospect"
→ Uses IDENTIFY scorecard

"Calculate pricing for this engagement"
→ Uses MAP stage scoring system

"Generate complete proposal package"
→ Creates CHART materials

"Should we take this client?"
→ Analyzes all signals and recommends
```

---

## File Structure

```
Direction-Protocol-Skill/
│
├── Core Documents
│   ├── SKILL.md                          # Main skill definition (Claude reads this)
│   ├── USER_MANUAL.md                    # Quick reference guide
│   └── README.md                         # This file - overview
│
├── Workflow Documents
│   ├── WORKFLOW.md                       # Complete stage-by-stage workflow
│   ├── HANDOFF-PROTOCOL.md               # Transition to Command Protocol
│   ├── ARO-DIRECTION-INTEGRATION.md      # ARO Assessment integration
│   └── CONTEXT-GRAPH-INTEGRATION.md      # Context Graph versioning
│
├── Sales Enablement
│   ├── EMAIL-TEMPLATES.md                # Email templates for all stages
│   └── SALES-TRAINING.md                 # Discovery, objections, cheat sheets
│
├── Quality & Delivery
│   ├── QUALITY-REVIEW-CHECKLIST.md       # Quality standards per stage
│   └── METRICS-DASHBOARD.md              # KPIs and tracking
│
├── Operations
│   ├── FOLDER-STRUCTURE.md               # Client folder organization
│   └── CRM-STAGES.md                     # Pipeline stages
│
├── Reference
│   ├── assessment-tools.md               # Scoring frameworks
│   └── integration-guide.md              # SRO/World Mapper integration
│
├── Archive
│   ├── SKILL-v1.0-comprehensive-ARCHIVED.md
│   └── SKILL-v1.1-streamlined-ARCHIVED.md
│
└── Planning
    ├── todo.md                           # Implementation tracking
    └── direction-protocol-workflow-gaps.md
```

---

## Integration with Other Skills

This skill integrates with multiple TNDS skills:

### ARO Assessment Skill
- **Relationship**: ARO Assessment IS Direction Protocol ASSESS+MAP productized
- **Entry Point**: ARO clients can convert to full implementation
- **Credit**: $500 ARO credit applies toward Command Center Build
- **See**: [ARO-DIRECTION-INTEGRATION.md](ARO-DIRECTION-INTEGRATION.md) for complete integration

### Command Protocol Skill
- **Handoff Point**: After LAUNCH stage (agreement signed, deposit received)
- **Transition**: Context Graph v1.0 → v2.0 at kickoff
- **See**: [HANDOFF-PROTOCOL.md](HANDOFF-PROTOCOL.md) for handoff requirements

### Context Graph / Documentation Skill
- **Creation**: During MAP stage
- **Version**: v1.0 created at end of Direction Protocol
- **See**: [CONTEXT-GRAPH-INTEGRATION.md](CONTEXT-GRAPH-INTEGRATION.md) for details

### SRO Assessment Skill
- **Used in**: ASSESS and MAP stages
- **Purpose**: Structured evaluation of Structure, Resources, Operations
- **Output**: Maturity scores (1-10 scale) and gap analysis

### World Mapper Skill
- **Used in**: MAP stage
- **Purpose**: Visual mapping of workflows, stakeholders, data flows
- **Output**: Current state and desired state diagrams

**See [integration-guide.md](integration-guide.md) for SRO/World Mapper orchestration instructions.**

---

## Core Concepts

### What We Sell
"The ability to see what's happening in your operation so you can make better decisions and take a day off."

### What We Don't Sell
"Automation, apps, AI magic, or tech for tech's sake."

### The Transformation
"Direction Protocol gets you clarity. Command Protocol gets you control. That's how we turn data into direction."

### Ideal Client Profile (ICP)
- Field service or office operations
- 5-20 employees
- Owner is overwhelmed
- Can't see what's happening in real-time
- Information scattered across texts/paper/spreadsheets
- Can't take a day off without chaos

### Red Flags (Walk Away Signals)
- Won't commit time for Map stage
- Wants price before assessment
- Expects guaranteed outcomes
- Disrespectful or toxic
- "Tried everything" mentality
- Blames everyone else

---

## Pricing Structure

### Command Center Build
**Base Pricing** (calculated via complexity scoring):
- Score 5-7: $2,500
- Score 8-11: $3,500  
- Score 12-15: $5,000

**Adjustments**:
- Add $500-1,000: Multiple locations, field+office, custom reporting, tight timeline
- Subtract $500: Some systems working, very small operation, strong referral

**Timeline**: 2-4 weeks

### Battle Rhythm Install
- **Price**: $2,000-$4,000
- **Timeline**: 2-4 weeks
- **Focus**: Operating cadence and accountability systems

### Command Partner
- **Price**: $1,000-$2,000/month
- **Ongoing**: Fractional ops support

### Payment Terms
- Projects under $4,000: 50% start, 50% completion
- Projects over $4,000: 40% start, 30% midpoint, 30% completion

---

## Command Modules Reference

Available building blocks (mix and match based on client needs):

**Core Operations**
- data-command
- office-command
- analytics-command

**Financial**
- financial-command
- proposal-command
- contract-command

**Field Service**
- asset-command
- sms-command

**Specialized**
- onboard-command
- workspace-command
- realty-command
- tax-command
- seo-command
- govcon-command
- compliance-gov-module

All modules end in "-command" or "-ops" for brand consistency.

---

## Success Metrics

Track these conversion rates:

| Stage | Target Conversion |
|-------|------------------|
| Identify → Assess | 50%+ |
| Assess → Map | 60%+ |
| Map → Chart | 90%+ |
| Chart → Launch | 50%+ |
| **Overall (Identify → Launch)** | **15-25%** |

---

## Common Scenarios

### Scenario 1: New Warm Referral
```
User: "Got a referral from Eric. Owner of 10-person electrical contracting firm. 
Says he's drowning in paperwork."

Claude: 
IDENTIFY STAGE INITIATED

Great referral signal. Electrical contracting in our ICP sweet spot.

Key questions for first call:
1. "Tell me about your operation. What do you do, and how many people are involved?"
2. "What's the thing that keeps you up at night about the business?"
3. "If you could wave a magic wand and fix one thing tomorrow, what would it be?"

Listen for:
✓ Visibility problems ("can't see what's happening")
✓ Owner dependency ("everything runs through me")
✓ Data chaos ("drowning in paperwork" ← already indicated)
✗ Just wants an app
✗ Price shopping

Expected outcome: High probability for ASSESS stage.

Want me to draft the initial outreach email?
```

### Scenario 2: Assess Call Completed
```
User: "Just finished assess call. Owner said they use spreadsheets, 
paper tickets, text messages. Makes decisions blind. Found out about 
a $3K equipment failure 4 days after it happened."

Claude:
ASSESS STAGE ANALYSIS

>>> INVOKING SRO ASSESSMENT <<<

Structure Score: 2/10
- Decision bottleneck (owner)
- No documented processes
- Reactive management only

Resources Score: 3/10
- Data scattered (spreadsheets, paper, texts)
- No central truth
- Manual processes error-prone

Operations Score: 3/10
- Zero real-time visibility
- 4-day lag on critical issues
- Decisions made on old data

READINESS ASSESSMENT:
Pain Intensity: 9/10 (losing money, high stress)
Pain Specificity: 8/10 (clear problem articulation)
Investment Readiness: ??? (need budget discussion)

RECOMMENDATION: STRONG FIT for MAP stage

Required next steps:
1. Explain 90-minute Map requirement
2. Discuss budget range ($2.5K-$5K+ for their size)
3. Schedule deep dive

Red flags detected: NONE
Green flags detected: 
- Specific pain examples
- Quantified impact ($3K failure)
- Decision maker engaged

Proceed to MAP? Want me to draft the scheduling email?
```

### Scenario 3: Need Pricing Calculation
```
User: "MAP session complete. Here's the scoring: 
- 14 employees
- Paper + texts + spreadsheets + QuickBooks
- Owner barely available  
- Resistant to technology
- Need both field and office integration
- Custom reporting required"

Claude:
>>> DIRECTION PROTOCOL PRICING CALCULATOR <<<

Factor Scoring:
1. Crew Size: 14 employees = 2 points
2. System Chaos: Paper + scattered = 3 points
3. Data Sources: 4+ sources = 2 points
4. Owner Availability: Hard to reach = 3 points
5. Technical Comfort: Resistant = 3 points

BASE SCORE: 13 points → $5,000 tier

Adjustments:
+ Field AND office operations: +$750
+ Custom reporting needed: +$750

CALCULATED PRICE: $6,500
PAYMENT TERMS: 40/30/30 ($2,600 / $1,950 / $1,950)
TIMELINE: 4 weeks

RECOMMENDED MODULES:
- data-command (central data)
- financial-command (QuickBooks + job costing)
- office-command (dispatch workflow)
- sms-command (field notifications)
- analytics-command (custom reporting)

CONFIDENCE: HIGH
Pricing reflects both technical complexity and change management challenge.

Ready to generate CHART presentation?
```

---

## Tips for Best Results

### 1. Provide Context
Don't just say "new lead." Give details:
- Lead source (referral/inbound/cold)
- Industry and size
- Stated problem
- Any red/green flags already visible

### 2. Use Stage Keywords
Help Claude know where you are:
- "Starting IDENTIFY with..."
- "ASSESS call tomorrow with..."
- "Need to MAP this engagement..."
- "Ready to present CHART..."

### 3. Share Conversation Snippets
Quote what the prospect said. Claude picks up on language patterns that reveal fit.

Good: "They said 'I find out about problems days after they happen'"
Better: "Direct quote: 'I found out we owed a supplier $12K when they stopped shipping to us'"

### 4. Ask for Specific Outputs
Claude can generate:
- Qualification scorecards
- Assessment reports
- Visual workflow maps
- Pricing calculations
- Proposal documents
- Service agreements
- Follow-up emails

### 5. Question the Fit
Ask Claude: "Should we take this client?"

Claude will analyze all signals and give a straight answer with reasoning.

---

## Troubleshooting

### "Claude isn't using the SRO skill"
Make sure you're in ASSESS or MAP stage. SRO isn't used in IDENTIFY.

### "Pricing seems off"
Check that all five scoring factors were captured. Missing data = inaccurate pricing.

### "Client wants to skip to pricing"
That's a mild red flag. Use the objection handling script:
"Need to Map first to scope correctly. Every operation is different."

### "Should we walk away?"
If you're asking the question, the answer is probably yes. Trust your gut. Bad clients cost more than no clients.

### "Claude generated a proposal but we're not in CHART stage yet"
Enforce the stages. Never skip MAP. Go back and complete the deep dive.

---

## Document Templates

### Assessment Report Template
See: `assessment-tools.md` for complete ASSESS stage framework

### Proposal Template
See: `SKILL.md` section on CHART stage structure

### Service Agreement
See: uploaded file `TNDS_Service_Agreement.docx` for template

### Methodology Capture
See: uploaded file `TNDS_Methodology_Capture_Template.docx`

---

## Real-World Example: Complete Flow

**Monday**: Warm referral from past client
- Run IDENTIFY stage
- Qualification score: 7/8 (strong fit)
- Schedule ASSESS call

**Wednesday**: 30-minute ASSESS call
- Use SRO Assessment framework
- Discover: 12 employees, paper-based chaos, can't see costs
- Pain intensity: 9/10
- Schedule MAP session

**Friday**: 90-minute MAP deep dive
- Use World Mapper for workflow visualization
- Use SRO for detailed scoring
- Calculate pricing: $4,750
- Identify modules: data-command, financial-command, office-command
- Schedule CHART presentation

**Monday**: CHART presentation
- Present operational map
- Show current vs. desired state
- Deliver proposal: $4,750, 4 weeks, 50/50 payment
- Handle objection about price (compare to cost of status quo)
- Client agrees

**Tuesday**: LAUNCH
- Sign service agreement
- Receive 50% deposit
- Schedule kickoff
- Begin Command Center Build

**6 weeks later**: 
- Command Center deployed
- Client has real-time visibility
- Same-day invoicing working
- Owner took first day off in 2 years

**Result**: Happy client, good revenue, potential referral source, methodology captured for Pipeline Punks content.

---

## Alternative Path: Pipeline Punks

For prospects who:
- Like the TNDS approach
- Can't afford full service
- Have DIY mindset  
- Have 10-20 hours to learn

**Offer**: Training courses to build their own systems

**The Bridge**: 50% credit toward Command Protocol if they change their mind

This protects the relationship even when budget isn't there today.

---

## Best Practices Summary

✅ **DO**:
- Follow the stages in order
- Use SRO and World Mapper when indicated
- Trust the scoring systems
- Walk away from bad fits early
- Document everything
- Capture methodology after wins

❌ **DON'T**:
- Skip stages (especially MAP)
- Quote before mapping
- Apologize for pricing
- Take clients with red flags
- Make up custom features
- Discount to salvage bad fits

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────────┐
│                   DIRECTION PROTOCOL                           │
│                     Quick Reference                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  WE SELL: The ability to see what's happening so you can      │
│           make better decisions and take a day off            │
│                                                                │
│  WE DON'T: Automation, apps, AI magic, or tech for tech's    │
│            sake                                                │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  THE PROCESS (Never Skip Stages):                            │
│                                                                │
│  1. IDENTIFY (15-20 min) → Is there a fit?                   │
│  2. ASSESS (30 min) → Is the problem real?                   │
│  3. MAP (90-120 min) → What's broken, what's needed?         │
│  4. CHART (30-45 min) → Here's the course                    │
│  5. LAUNCH → Let's go                                         │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  SERVICES:                                                     │
│                                                                │
│  Command Center Build    $2,500-$5,000    2-4 weeks          │
│  Battle Rhythm Install   $2,000-$4,000    2-4 weeks          │
│  Command Partner         $1,000-$2,000    per month          │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  ICP: 5-20 people, field/office operations, owner            │
│       overwhelmed, can't see what's happening                 │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  RED FLAGS: Won't commit to Map, wants price first,          │
│             guaranteed outcomes, disrespectful, toxic         │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  WHEN IN DOUBT:                                               │
│  - Talk about THEIR pain, not YOUR capabilities              │
│  - Bad clients cost more than no clients                     │
│  - If it feels wrong, walk away                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Support and Questions

**For using this skill**:
- Read SKILL.md for complete methodology
- Check integration-guide.md for SRO/World Mapper usage
- Review assessment-tools.md for scoring systems

**For modifying this skill**:
- All core logic is in SKILL.md
- Templates are in assessment-tools.md
- Integration points are in integration-guide.md

**For training others**:
- This README provides overview
- SKILL.md has detailed scripts
- Real examples in integration-guide.md

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v2.0 | January 28, 2026 | Major documentation expansion: merged SKILL.md, added 12 supporting documents, ARO integration, Context Graph integration, complete sales enablement package |
| v1.1 | January 2026 | Streamlined SKILL.md with 12 diagnostic questions (now archived) |
| v1.0 | January 2026 | Initial skill creation with SRO/World Mapper integration, 5-stage methodology, pricing calculator |

### v2.0 Document Additions
- WORKFLOW.md — Complete workflow documentation
- HANDOFF-PROTOCOL.md — Direction → Command transition
- ARO-DIRECTION-INTEGRATION.md — ARO Assessment integration
- CONTEXT-GRAPH-INTEGRATION.md — Context Graph versioning
- EMAIL-TEMPLATES.md — 15 email templates
- SALES-TRAINING.md — Discovery framework, objection handling
- FOLDER-STRUCTURE.md — Client folder organization
- CRM-STAGES.md — Pipeline stage definitions
- QUALITY-REVIEW-CHECKLIST.md — Quality standards
- METRICS-DASHBOARD.md — KPIs and tracking
- USER_MANUAL.md — Quick reference guide

---

## Contact

**True North Data Strategies**
Jacob Johnston
jacob@truenorthstrategyops.com
555-555-5555
Colorado Springs, CO

SBA-Certified VOSB/SDVOSB

---

**Remember**: Direction Protocol™ gets you clarity. Command Protocol™ gets you control. That's how we turn data into direction.

---

## Confidentiality Notice

This document contains proprietary methodology and trade secrets of True North Data Strategies LLC. Unauthorized reproduction, distribution, or disclosure is prohibited.

---

© 2026 True North Data Strategies LLC. All rights reserved.

*Direction Protocol™, Command Protocol™, Battle Rhythm Install™, and Command Center Build™ are trademarks of True North Data Strategies LLC.*

---

**END OF README**
