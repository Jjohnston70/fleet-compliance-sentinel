# Direction Protocol Integration Guide

## Overview

The Direction Protocol skill works in concert with two other TNDS skills to provide comprehensive client evaluation and mapping:

1. **ARO Assessment Skill** - Evaluates operational Structure, Resources, and Operations
2. **World Mapper Skill** - Creates visual maps of operational workflows and systems
3. **Direction Protocol Skill** - Guides the sales process from lead to close

## Integration Points

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DIRECTION PROTOCOL WORKFLOW                          │
│                                                                         │
│  STAGE 1: IDENTIFY                                                     │
│  ├─ Qualification screening                                            │
│  └─ Pain signal detection                                              │
│                                                                         │
│  STAGE 2: ASSESS                                                       │
│  ├─ ▶ USE ARO ASSESSMENT ◀                                            │
│  │   └─ Structure evaluation                                          │
│  │   └─ Resource assessment                                           │
│  │   └─ Operations analysis                                           │
│  └─ Readiness scoring                                                  │
│                                                                         │
│  STAGE 3: MAP                                                          │
│  ├─ ▶ USE ARO ASSESSMENT ◀ (deep dive)                               │
│  │   └─ Detailed system analysis                                      │
│  │   └─ Gap identification                                            │
│  ├─ ▶ USE WORLD MAPPER ◀                                              │
│  │   └─ Workflow visualization                                        │
│  │   └─ Stakeholder mapping                                           │
│  │   └─ Data flow diagrams                                            │
│  └─ Pricing calculation                                                │
│                                                                         │
│  STAGE 4: CHART                                                        │
│  ├─ Present findings (using outputs from ARO + World Mapper)          │
│  └─ Deliver proposal                                                   │
│                                                                         │
│  STAGE 5: LAUNCH                                                       │
│  └─ Project kickoff                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## When to Use Each Skill

### IDENTIFY Stage
**Primary Skill**: Direction Protocol only
- No integration needed
- Pure qualification and screening
- Output: Green/Yellow/Red light decision

### ASSESS Stage
**Skills Used**: Direction Protocol + ARO Assessment

**Integration Flow**:
1. Direction Protocol guides conversation structure
2. As operational details emerge, invoke ARO Assessment
3. ARO provides structured scoring for:
   - Organizational structure maturity
   - Resource allocation and utilization
   - Operational effectiveness
4. Direction Protocol uses ARO scores to calculate readiness

**Example Usage**:
```
User: "Client has 12 employees, uses spreadsheets and paper, owner makes all decisions"

Claude (using both skills):
1. Records this in Direction Protocol assessment template
2. Invokes ARO Assessment to score:
   - Structure: 2/10 (one-person decision making)
   - Resources: 4/10 (scattered across tools)
   - Operations: 3/10 (paper-based, no visibility)
3. Combines into Direction Protocol readiness score
4. Recommends next action based on combined analysis
```

### MAP Stage
**Skills Used**: Direction Protocol + ARO Assessment + World Mapper

**Integration Flow**:
1. Direction Protocol structures the 90-minute conversation
2. As workflows are discussed, invoke World Mapper to create:
   - Current state operational map
   - Desired state vision
   - Data flow diagrams
   - Stakeholder relationships
3. Simultaneously, use ARO Assessment for detailed scoring
4. Direction Protocol synthesizes both outputs into:
   - Pricing calculation
   - Command module selection
   - Implementation timeline

**Example Usage**:
```
User: "Deep dive with HVAC company. They described their dispatch process."

Claude (orchestrating all three skills):

1. Direction Protocol: Track this as MAP stage workflow discovery
2. World Mapper: Create visual map of dispatch workflow:
   ┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
   │ Customer│────▶│ Dispatch │────▶│Field Crew│────▶│Completed │
   │  Call   │     │ Decision │     │   Work   │     │   Job    │
   └─────────┘     └──────────┘     └─────────┘     └──────────┘
        │               │                 │               │
        ▼               ▼                 ▼               ▼
    Phone Log    Whiteboard/Text    Paper Forms    ?Unknown?

3. ARO Assessment: Score the workflow:
   - Structure: Manual, no system (2/10)
   - Resources: Scattered data (3/10)
   - Operations: Reactive, not proactive (4/10)

4. Direction Protocol: Calculate scoring factors:
   - Factor 2 (System Chaos): Complete chaos = 3 points
   - Factor 3 (Data Sources): 4+ sources = 2 points
   - Modules needed: data-command, sms-command, office-command
   - Estimated price: $3,500 base + $750 (field + office) = $4,250
```

### CHART Stage
**Skills Used**: Direction Protocol (presenting outputs from previous stages)

**Integration Flow**:
1. Pull visual maps from World Mapper
2. Pull scores and analysis from ARO Assessment
3. Direction Protocol structures presentation
4. Generate proposal document

### LAUNCH Stage
**Skills Used**: Direction Protocol only
- Contract execution
- Project setup
- Handoff to delivery team

## Data Flow Between Skills

### From Direction Protocol → ARO Assessment

```yaml
assessment_input:
  employee_count: 12
  decision_making: "Owner makes all decisions, team executes"
  current_systems:
    - "Excel spreadsheets for financials"
    - "Paper job tickets"
    - "Text messages for dispatch"
    - "QuickBooks for invoicing"
  pain_points:
    - "Can't see job costs until after completion"
    - "Crew changes without owner knowing"
    - "Lost paper tickets"
```

### From ARO Assessment → Direction Protocol

```yaml
sro_output:
  structure_score: 2
  structure_gaps:
    - "Single point of failure (owner)"
    - "No documented processes"
    - "Reactive management"
  
  resource_score: 3
  resource_gaps:
    - "Data scattered across 4+ sources"
    - "No central source of truth"
    - "Manual data entry creating errors"
  
  operations_score: 4
  operations_gaps:
    - "No real-time visibility"
    - "Decisions made on old/incomplete data"
    - "Communication breakdowns"
  
  overall_maturity: "Early Stage"
  transformation_potential: "High"
```

Direction Protocol then uses these scores to:
- Calculate readiness (avg of three scores)
- Identify required Command modules
- Estimate project complexity
- Determine pricing tier

### From Direction Protocol → World Mapper

```yaml
mapping_request:
  workflows_to_map:
    - name: "Customer intake to job dispatch"
      current_state: true
      desired_state: true
    - name: "Job completion to invoicing"
      current_state: true
      desired_state: true
  
  stakeholders:
    - role: "Owner"
      involvement: "All decisions"
    - role: "Dispatcher"
      involvement: "Scheduling, communication"
    - role: "Field Crews (3)"
      involvement: "Execute work, report completion"
    - role: "Office Manager"
      involvement: "Invoicing, customer service"
  
  data_flows:
    - from: "Customer phone call"
      to: "Dispatcher whiteboard"
      format: "Verbal/handwritten"
    - from: "Dispatcher"
      to: "Field crew"
      format: "Text message"
    - from: "Field crew"
      to: "Office"
      format: "Paper ticket"
```

### From World Mapper → Direction Protocol

```yaml
map_outputs:
  current_state_map: "[ASCII diagram or image path]"
  desired_state_map: "[ASCII diagram or image path]"
  
  identified_gaps:
    - "5-step manual handoff (error prone)"
    - "No audit trail"
    - "Delayed financial visibility"
  
  integration_requirements:
    - "Centralize customer data"
    - "Automated dispatch notifications"
    - "Digital job ticket capture"
    - "Real-time job costing"
  
  complexity_factors:
    - "Multiple crew coordination"
    - "Field + office integration"
    - "Real-time communication needs"
```

Direction Protocol uses this to:
- Select Command modules (sms-command, office-command, financial-command)
- Estimate implementation timeline
- Identify training requirements
- Calculate complexity adjustments to pricing

## Orchestration Example: Complete MAP Stage

```
USER: "Starting MAP session with Peak HVAC. 12 techs, paper-based dispatch."

CLAUDE (orchestrating all three skills):

=== DIRECTION PROTOCOL: MAP STAGE INITIATED ===

Company: Peak HVAC
Size: 12 technicians
Stage: MAP (90-120 minutes)
Objective: Understand current state, identify gaps, design solution

[5 MIN] Introduction and agenda setting...

[30 MIN] Current State Discovery

Me: "Walk me through what happens when a customer calls for service..."

[Client describes process]

>>> INVOKING WORLD MAPPER <<<
Creating current state workflow map...

┌────────────────────────────────────────────────────────────────┐
│                    CURRENT STATE: PEAK HVAC                    │
│                     Service Request Flow                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Customer Call ──▶ Office Phone ──▶ Dispatcher Whiteboard     │
│       │                                    │                   │
│       │                                    ▼                   │
│       │                            Text to Technician          │
│       │                                    │                   │
│       │                                    ▼                   │
│       │                              Service Call              │
│       │                                    │                   │
│       │                                    ▼                   │
│       │                           Paper Job Ticket             │
│       │                                    │                   │
│       │                                    ▼                   │
│       └─────────────────────▶    End of Day Pickup             │
│                                           │                   │
│                                           ▼                   │
│                                  Manual Entry to QB            │
│                                           │                   │
│                                           ▼                   │
│                                      Invoice Sent              │
│                                      (days later)              │
│                                                                │
└────────────────────────────────────────────────────────────────┘

PAIN POINTS IDENTIFIED:
• 7-9 step manual process with multiple handoffs
• Average 3-5 day delay from service to invoice
• Lost/damaged paper tickets (~10% of jobs)
• No real-time job status visibility
• Dispatcher manages via whiteboard + text chains
• Owner learns about problems days after they occur

>>> INVOKING ARO ASSESSMENT <<<
Scoring operational maturity...

STRUCTURE ANALYSIS:
Score: 3/10
• Decision making: Centralized to owner (bottleneck)
• Process documentation: None, tribal knowledge only
• Organizational clarity: Roles unclear, overlapping duties
• Scalability: Cannot scale without owner

RESOURCE ANALYSIS:
Score: 4/10
• Data sources: 5+ disconnected sources
  - Whiteboard
  - Text messages  
  - Paper tickets
  - QuickBooks
  - Customer callback list
• Knowledge management: In owner's head
• Tool effectiveness: Manual, error-prone
• Resource utilization: Dispatcher spends 40% on coordination

OPERATIONS ANALYSIS:
Score: 4/10
• Visibility: None (day+ lag to learn issues)
• Process execution: Inconsistent, depends on technician
• Quality control: Reactive, after-the-fact
• Coordination: Manual text messages, phone tag
• Metrics: None tracked in real-time

OVERALL MATURITY: Early Stage (Score: 3.7/10)
TRANSFORMATION POTENTIAL: High

[20 MIN] Pain Point Deep Dive

Primary Pain: "I don't know what's happening until it's too late"
  - Found out about $2,400 parts order 3 days after job
  - Discovered tech was sick when customer called asking where tech was
  - Learned about equipment failure from customer complaint, not tech
  
Root Cause: No real-time data flow between field and office

Financial Impact:
  - Estimated 15-20 hours/week owner time on "figuring out what happened"
  - $12-15K/year in lost/delayed invoicing
  - Unknown amount in pricing errors (no job costing)

>>> INVOKING DIRECTION PROTOCOL SCORING <<<

Factor 1 - Crew Size: 12 techs = 2 points
Factor 2 - System Chaos: Paper + texts + scattered = 3 points
Factor 3 - Data Sources: 5+ sources = 3 points
Factor 4 - Owner Availability: Busy but makes time = 2 points
Factor 5 - Technical Comfort: Needs support = 2 points

BASE SCORE: 12 points → $5,000 tier

Adjustments:
• Field + Office operations: +$750
• Custom real-time reporting: +$500

ESTIMATED PRICE: $6,250

[15 MIN] Desired State Exploration

Me: "What would 'fixed' look like?"

Client Vision:
  - "I wake up, look at my phone, see every job status"
  - "When tech completes job, invoice goes out that afternoon"
  - "If something goes wrong, I know immediately"
  - "Dispatcher focuses on smart routing, not playing phone tag"

>>> WORLD MAPPER: Creating Desired State <<<

┌────────────────────────────────────────────────────────────────┐
│                    DESIRED STATE: PEAK HVAC                    │
│                     Service Request Flow                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Customer Call ──▶ CRM Entry ──▶ Dispatch System               │
│       │                               │                        │
│       │                               ▼                        │
│       │                      Auto-notification to Tech         │
│       │                               │                        │
│       │                               ▼                        │
│       │                       Service Call (mobile)            │
│       │                               │                        │
│       │                               ▼                        │
│       │                     Digital Job Completion             │
│       │                               │                        │
│       │                      ┌────────┴────────┐               │
│       │                      ▼                 ▼               │
│       └────────▶    Auto-invoice sent   Real-time dashboard    │
│                      (same day)         (owner visibility)     │
│                                                                │
└────────────────────────────────────────────────────────────────┘

CAPABILITIES ENABLED:
• Real-time job status visibility
• Same-day invoicing
• Automated tech notifications
• Job costing tracking
• Equipment/parts tracking
• Performance metrics

[15 MIN] Solution Architecture

Required Command Modules:
1. data-command - Central customer/job data
2. office-command - Dispatch workflow automation  
3. sms-command - Tech notifications
4. financial-command - Job costing + auto-invoicing
5. asset-command - Equipment tracking

Integration Requirements:
• QuickBooks API connection (invoicing)
• SMS gateway (tech notifications)
• Mobile-friendly forms (field data entry)
• Dashboard (owner visibility)

Implementation Approach:
  Week 1: Data architecture + QuickBooks integration
  Week 2: Dispatch workflow + SMS notifications
  Week 3: Mobile job forms + financial tracking
  Week 4: Dashboard + training

[10 MIN] Constraints

Budget: Willing to invest $5-7K if it solves the problem
Timeline: Want it working within a month
Team Capacity: Dispatcher will help with setup/testing
Technical: Already has Google Workspace

PERFECT FIT.

=== DIRECTION PROTOCOL: MAP STAGE COMPLETE ===

SUMMARY OUTPUT:

Complexity Score: 12/15
Recommended Price: $6,250
Payment Terms: 40/30/30
Timeline: 4 weeks
Confidence: HIGH

Command Modules: data-command, office-command, sms-command, 
                  financial-command, asset-command

Next Step: Schedule CHART presentation

Would you like me to:
1. Generate the complete CHART presentation
2. Create visual diagrams for proposal
3. Draft the service agreement
```

## Output Handoffs

### ASSESS → MAP Handoff

Direction Protocol provides:
- Client context and history
- Known pain points
- ARO baseline scores
- Budget range
- Decision maker identification

### MAP → CHART Handoff

Direction Protocol receives:
- World Mapper visual diagrams
- ARO detailed assessment
- Pricing calculation
- Module selection
- Timeline estimate

Direction Protocol generates:
- Complete proposal document
- Visual presentation slides
- Service agreement draft

### CHART → LAUNCH Handoff

Direction Protocol provides:
- Signed agreement
- Payment confirmation
- Project scope document
- Implementation timeline
- Team assignments

## Best Practices

### 1. Always Use ARO in ASSESS and MAP
Don't try to assess operational maturity without the structured ARO framework. It ensures consistency and catches things you might miss.

### 2. Always Use World Mapper in MAP
Visual diagrams are worth 1000 words. Clients need to SEE their chaos mapped out to understand the scope of the problem.

### 3. Let Direction Protocol Orchestrate
Direction Protocol should be the "conductor" - it knows when to invoke the other skills and how to synthesize their outputs.

### 4. Document Everything
Each skill produces structured output. Capture it all. You'll need it for:
- CHART presentation
- Service agreement
- Project kickoff
- Future reference

### 5. Trust the Scoring Systems
The Direction Protocol pricing calculator is based on real engagements. Don't second-guess it without good reason.

## Common Integration Mistakes

### ❌ DON'T: Skip to World Mapper Without ARO
World Mapper shows workflows. ARO scores maturity. You need both.

### ❌ DON'T: Use ARO Scores Alone to Price
ARO tells you operational maturity. Direction Protocol scoring includes complexity factors that ARO doesn't capture.

### ❌ DON'T: Create Manual Maps When World Mapper Exists
Use the tool. Consistency matters.

### ❌ DON'T: Start CHART Without Completing MAP
You can't present a solution you haven't fully designed.

### ✅ DO: Use All Three Skills Together
They're designed to integrate. Use them that way.

### ✅ DO: Document Integration Points
Track which outputs came from which skill for future reference.

### ✅ DO: Let Claude Orchestrate
If you're not sure when to invoke which skill, just describe what stage you're at and let Claude figure it out.

---

## Quick Reference: Skill Usage by Stage

```
STAGE       │ Direction Protocol │ ARO Assessment │ World Mapper
────────────┼───────────────────┼───────────────┼──────────────
IDENTIFY    │        ✓          │       ✗       │      ✗
ASSESS      │        ✓          │       ✓       │      ✗
MAP         │        ✓          │       ✓       │      ✓
CHART       │        ✓          │    (output)   │   (output)
LAUNCH      │        ✓          │       ✗       │      ✗
```

**Legend**:
- ✓ = Actively used
- (output) = Using previous output, not actively running
- ✗ = Not used

---

**END OF INTEGRATION GUIDE**
