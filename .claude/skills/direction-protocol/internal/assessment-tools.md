---
**CONFIDENTIAL - TRADE SECRET**
**Property of True North Data Strategies LLC**
**Unauthorized disclosure prohibited**
---

# Direction Protocol Assessment Tools

## IDENTIFY Stage Qualification Scorecard

```yaml
prospect_info:
  name: ""
  company: ""
  industry: ""
  employee_count: 0
  lead_source: "" # referral/inbound/cold/networking

qualification_criteria:
  real_operational_problem:
    score: 0  # 0=No, 1=Maybe, 2=Yes
    notes: ""
  decision_maker:
    score: 0  # 0=No, 1=Influencer, 2=Yes
    notes: ""
  coachable:
    score: 0  # 0=No, 1=Maybe, 2=Yes
    notes: ""
  right_size:
    score: 0  # 0=No (too small/large), 1=Edge case, 2=Yes (5-20)
    notes: ""

pain_signals:
  cant_see_whats_happening: false
  find_out_too_late: false
  everything_depends_on_owner: false
  cant_take_day_off: false
  inconsistent_team_execution: false
  drowning_in_scattered_data: false
  making_blind_decisions: false

disqualifiers:
  just_wants_app: false
  wants_ai_magic: false
  price_shopping: false
  no_real_problem: false
  not_decision_maker: false

total_qualification_score: 0  # Sum of qualification_criteria scores (0-8)

recommendation:
  action: ""  # SCHEDULE_ASSESS / PIPELINE_PUNKS / WALK_AWAY
  reasoning: ""
  next_steps: ""
```

## Scoring Logic

```python
def calculate_identify_stage_recommendation(scorecard):
    """
    Total Score Interpretation:
    7-8: STRONG FIT - Schedule Assess immediately
    5-6: MODERATE FIT - Schedule Assess with notes on concerns
    3-4: WEAK FIT - Consider Pipeline Punks or walk away
    0-2: NOT A FIT - Polite exit

    Any disqualifier = automatic walk away (unless they can be addressed)
    """
    total = scorecard['qualification_criteria']['real_operational_problem']['score']
    total += scorecard['qualification_criteria']['decision_maker']['score']
    total += scorecard['qualification_criteria']['coachable']['score']
    total += scorecard['qualification_criteria']['right_size']['score']

    has_disqualifiers = any(scorecard['disqualifiers'].values())
    pain_signal_count = sum(scorecard['pain_signals'].values())

    if has_disqualifiers:
        return "WALK_AWAY"
    elif total >= 7 and pain_signal_count >= 3:
        return "SCHEDULE_ASSESS"
    elif total >= 5 and pain_signal_count >= 2:
        return "SCHEDULE_ASSESS_WITH_NOTES"
    elif total >= 3:
        return "PIPELINE_PUNKS_OPTION"
    else:
        return "WALK_AWAY"
```

---

## ASSESS Stage Evaluation Framework

```yaml
engagement_info:
  date: ""
  prospect: ""
  stage: "ASSESS"
  duration: "30min"

operational_reality:
  typical_workflow: ""
  failure_points: []
  detection_methods: ""
  blind_decision_areas: []

current_state:
  data_sources:
    spreadsheets: []
    paper_systems: []
    software_tools: []
    tribal_knowledge: []
  visibility_gaps: []
  key_person_dependencies: []

stakes_and_readiness:
  cost_of_status_quo:
    financial: ""
    time: ""
    stress: ""
    opportunities_missed: ""

  one_year_projection: ""
  desired_outcome: ""

  map_stage_commitment:
    willing_to_invest_90min: false
    understands_required: false
    notes: ""

budget_reality:
  stated_budget: ""
  value_perception: ""
  ready_to_invest: false

assessment_scores:
  pain_intensity: 0  # 1-10
  pain_specificity: 0  # 1-10
  readiness: 0  # 1-10
  fit: 0  # 1-10

sro_integration:
  structure_score: 0
  resource_score: 0
  operations_score: 0
  notes: ""

recommendation:
  action: ""  # SCHEDULE_MAP / PIPELINE_PUNKS / WALK_AWAY
  confidence: ""  # HIGH / MEDIUM / LOW
  concerns: []
  opportunities: []
```

---

## MAP Stage Scoring System

```yaml
command_center_build_scoring:

  factor_1_crew_size:
    employees: 0
    score: 0  # 5-8=1, 9-14=2, 15-20=3

  factor_2_system_chaos:
    description: ""
    score: 0  # organized=1, scattered=2, chaos=3

  factor_3_data_sources:
    count: 0
    sources: []
    score: 0  # 2-3=1, 4-5=2, 6+=3

  factor_4_owner_availability:
    description: ""
    score: 0  # available=1, busy=2, hard to reach=3

  factor_5_technical_comfort:
    description: ""
    score: 0  # quick learner=1, needs support=2, resistant=3

base_score_total: 0  # Sum of factors (5-15)

adjustments:
  multiple_locations: false  # +$500-1000
  field_and_office: false    # +$500-1000
  custom_reporting: false    # +$500-1000
  tight_timeline: false      # +$500-1000
  systems_working: false     # -$500
  very_small: false          # -$500
  strong_referral: false     # -$500

command_modules_needed:
  data_command: false
  financial_command: false
  analytics_command: false
  asset_command: false
  office_command: false
  onboard_command: false
  proposal_command: false
  workspace_command: false
  sms_command: false
  contract_command: false
  other: []

pricing_calculation:
  base_price: 0
  adjustments_total: 0
  final_price: 0
  timeline_weeks: 0
  payment_terms: ""  # "50/50" or "40/30/30"
```

## Pricing Calculation Logic

```python
def calculate_command_center_pricing(scoring):
    """
    Base Pricing:
    Total 5-7 = $2,500
    Total 8-11 = $3,500
    Total 12-15 = $5,000
    """
    base = scoring['base_score_total']

    if base <= 7:
        price = 2500
    elif base <= 11:
        price = 3500
    else:
        price = 5000

    # Apply adjustments
    adj = scoring['adjustments']

    add_adjustments = 0
    if adj['multiple_locations']: add_adjustments += 750
    if adj['field_and_office']: add_adjustments += 750
    if adj['custom_reporting']: add_adjustments += 750
    if adj['tight_timeline']: add_adjustments += 1000

    subtract_adjustments = 0
    if adj['systems_working']: subtract_adjustments += 500
    if adj['very_small']: subtract_adjustments += 500
    if adj['strong_referral']: subtract_adjustments += 500

    final_price = price + add_adjustments - subtract_adjustments

    # Determine payment terms
    if final_price > 4000:
        payment_terms = "40/30/30"
    else:
        payment_terms = "50/50"

    return {
        'base_price': price,
        'adjustments': add_adjustments - subtract_adjustments,
        'final_price': final_price,
        'payment_terms': payment_terms
    }
```

---

## MAP Stage Deep Dive Template

```yaml
map_session:
  date: ""
  prospect: ""
  duration: "90-120min"

current_state_mapping:
  workflows:
    - name: ""
      steps: []
      decision_points: []
      bottlenecks: []
      data_required: []

  systems_inventory:
    - name: ""
      purpose: ""
      users: []
      pain_points: []

  team_structure:
    - role: ""
      responsibilities: []
      dependencies: []
      pain_points: []

pain_analysis:
  primary_pain:
    description: ""
    frequency: ""
    impact_financial: ""
    impact_time: ""
    impact_quality: ""
    root_cause: ""

  secondary_pains: []

desired_state:
  vision: ""
  key_capabilities_needed: []
  decisions_to_enable: []
  metrics_to_track: []

solution_architecture:
  command_modules: []
  integration_requirements: []
  data_flows: []
  user_training_needs: []

constraints:
  budget_max: 0
  timeline_required: ""
  team_capacity: ""
  technical_limitations: []

world_mapper_integration:
  operational_map_created: false
  stakeholder_map_created: false
  data_flow_diagram_created: false
  notes: ""
```

---

## CHART Stage Presentation Structure

```yaml
chart_presentation:
  date: ""
  prospect: ""

section_1_current_reality:
  what_we_heard:
    - pain_point: ""
      impact: ""

  operational_map_visual: ""  # Path to diagram

  validation_question: "Is this an accurate picture of what you're dealing with?"

section_2_the_problems:
  root_causes:
    - problem: ""
      why_it_exists: ""
      cost: ""

  decision_blindness:
    - decision: ""
      missing_info: ""
      impact: ""

section_3_the_solution:
  approach: ""

  command_modules:
    - name: ""
      purpose: ""
      solves: []

  implementation_approach: ""

  timeline:
    week_1: ""
    week_2: ""
    week_3: ""
    week_4: ""

section_4_the_investment:
  total_price: 0
  payment_terms: ""

  deliverables:
    - item: ""
      value: ""

  timeline: ""

  what_included: []
  what_not_included: []

section_5_the_outcome:
  immediate_benefits: []

  transformation_vision: ""

  specific_wins:
    - pain_addressed: ""
      new_capability: ""

  metrics_to_track: []

closing_question: "Does this make sense for what you're trying to accomplish?"

objection_prep:
  - objection: ""
    response: ""
```

---

## Pipeline Tracking Template

```yaml
prospect_pipeline:

  prospect_id: ""
  name: ""
  company: ""
  industry: ""

  contact_info:
    email: ""
    phone: ""

  lead_source:
    type: ""  # referral/inbound/cold/networking
    referrer: ""  # if applicable

  current_stage: ""  # IDENTIFY/ASSESS/MAP/CHART/LAUNCH/CLOSED

  stage_history:
    - stage: ""
      date: ""
      outcome: ""
      notes: ""

  next_action:
    what: ""
    when: ""
    who: ""

  deal_value:
    estimated: 0
    confidence: ""  # HIGH/MEDIUM/LOW

  fit_scores:
    qualification: 0  # from IDENTIFY
    readiness: 0      # from ASSESS
    complexity: 0     # from MAP

  red_flags: []
  green_flags: []

  notes: ""

  status: ""  # ACTIVE/STALE/CLOSED-WON/CLOSED-LOST

  last_contact: ""
  days_in_stage: 0
```

---

## Methodology Capture Integration

After every completed engagement, use this template:

```yaml
methodology_capture:
  date: ""
  client_code: ""
  engagement_type: ""  # Direction Only / Command Center / Battle Rhythm / Command Partner
  industry: ""

  problem_pattern:
    what_client_said: ""
    actual_situation: ""
    root_cause: ""

  discovery:
    key_questions: []
    observations: []
    moment_of_clarity: ""

  solution:
    what_delivered: []
    why_this_approach: ""

  result:
    immediate_outcome: ""
    client_reaction: ""

  lesson:
    principle: ""  # One sentence transferable insight
    trap_to_avoid: ""
    shortcut: ""

  reusable_assets:
    documents: []
    command_modules: []
    frameworks: []

  raw_notes: ""
```

---

## Email Templates

### After IDENTIFY - Schedule Assess

```
Subject: Next Step: Understanding [Company] Operations

Hi [Name],

Thanks for taking the time to talk today. Based on what you shared about [primary pain point], I think there might be a good fit here.

The next step is what we call the Assess stage - a 30-minute conversation where I dig deeper into how your operation actually runs. This helps me figure out if I can actually help and what it might look like.

Would [Day] at [Time] work for you?

Talk soon,
Jacob Johnston
True North Data Strategies
555-555-5555
```

### After IDENTIFY - Not a Fit

```
Subject: Re: [Company] Operations

Hi [Name],

I appreciate you taking the time to talk today. Based on what you're looking for, I don't think I'm the right fit right now. [Brief honest reason - size, need, budget, etc.]

If things change or you grow into a different situation, feel free to reach back out.

Best of luck,
Jacob Johnston
```

### After ASSESS - Schedule Map

```
Subject: Deep Dive: Mapping [Company] Operations

Hi [Name],

Our conversation yesterday confirmed what I suspected - there's definitely something here we can help with.

The next step is the Map stage - a 90-minute deep dive where we'll walk through your entire operation to understand exactly what's broken and what would fix it. This is required before I quote anything because every operation is different.

Can you block off 90 minutes [Day] at [Time]?

Before we meet, it would help to have:
- [Specific prep item 1]
- [Specific prep item 2]
- [Specific prep item 3]

Looking forward to it,
Jacob Johnston
```

### After MAP - Schedule Chart

```
Subject: Chart Presentation: Your Operational Roadmap

Hi [Name],

Thanks for the deep dive yesterday. I've got a clear picture now of what's happening and what would fix it.

I've put together what we call the Chart - a presentation that shows:
- What we discovered about your operation
- The specific problems and root causes
- The solution we'd build
- Timeline and investment

Can we schedule 30-45 minutes [Day] at [Time] to walk through it?

Talk soon,
Jacob Johnston
```

### After CHART - Closing

```
Subject: [Company] Command Center Build - Ready to Launch

Hi [Name],

Great conversation yesterday. Based on your go-ahead, I'm sending over:

1. Service Agreement - please review and sign
2. First invoice (50%) - $[amount] due to start
3. Kickoff meeting invite - [Date/Time]

Once I receive the signed agreement and first payment, we'll officially kick off and have your Command Center built in [X] weeks.

Questions? Just reply or call.

Let's do this,
Jacob Johnston

Attached:
- TNDS_Service_Agreement_[Company].pdf
- Invoice_001_[Company].pdf
```

---

## Red Flag Checklist

Use this during any stage to identify deal-breakers:

```
☐ Won't commit time for Map stage
☐ Wants price before assessment
☐ Wants guaranteed outcomes you can't control
☐ Argues about price before understanding scope
☐ Expects you to manage their team
☐ "Tried everything" mentality
☐ Blames everyone else
☐ Disrespectful of your time
☐ Vibe is off / dread working with them
☐ Keeps rescheduling/no-showing
☐ Won't answer direct questions
☐ Unwilling to change anything
☐ Looking for silver bullet solution
☐ Not decision maker (and won't loop them in)
☐ Budget misalignment (can't afford minimum)
```

**2+ red flags = seriously consider walking away**
**4+ red flags = walk away immediately**

---

## Green Flag Checklist

Look for these positive indicators:

```
☐ Shows up on time, prepared
☐ Asks good questions
☐ Takes notes during conversations
☐ Shares detailed operational info freely
☐ Acknowledges their role in problems
☐ Open to changing how they do things
☐ Sees value beyond price
☐ Decision maker is engaged
☐ Team is bought in
☐ Has tried to solve this before
☐ Respects the process
☐ Follows through on commitments
☐ Good referral source
☐ Industry experience/expertise
☐ Growth trajectory
```

**6+ green flags = high probability close**

---

**END OF ASSESSMENT TOOLS**
