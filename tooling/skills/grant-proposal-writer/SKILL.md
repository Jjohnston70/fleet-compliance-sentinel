---
name: grant-proposal-writer
description: End-to-end grant proposal drafting for federal, state, local, and nonprofit funding applications. Use this skill whenever someone asks to write, draft, create, or build a grant proposal, funding application, NOFO response, or RFP response. Also triggers on requests to write specific proposal sections (need statement, program design, budget narrative, logic model, evaluation plan, sustainability plan), generate SF-424 content, create a proposal from a NOFO, or turn program plans into fundable proposals. Works for SAMHSA, VA, DOL, community foundations (El Pomar, Pikes Peak), state agencies (CDHS), and any other funder. Pairs with grant-proposal-evaluator for a complete write-then-evaluate workflow.
---

# Grant Proposal Writer

## Overview

This skill drafts complete, submission-ready grant proposals by analyzing the NOFO/RFP requirements, structuring content to match funder evaluation criteria, and generating each section with the specificity and evidence that reviewers score highest. It follows a **Research > Structure > Draft > Self-Review > Finalize** pipeline.

The skill produces proposals that are specific, data-backed, and directly tied to funder language -- not generic boilerplate. Every section is written to maximize points against the scoring rubric.

Works for internal use (writing FOB/TNDS proposals) and client service (writing proposals on behalf of clients).

## When to Use This Skill

- Drafting a new grant proposal from scratch given a NOFO/RFP
- Writing specific proposal sections (need statement, program design, evaluation plan, etc.)
- Creating a budget narrative tied to program activities
- Building a logic model / theory of change
- Turning an existing program description into a fundable proposal
- Responding to a specific NOFO's required sections and format
- Generating boilerplate sections (org capacity, sustainability) tailored to a specific funder

## Required Inputs

### Must Have (at least one)

1. **NOFO/RFP Document**: The funding opportunity announcement. This drives everything -- section structure, evaluation criteria, required content, page limits, eligible activities.
   - If not provided as a file, ask the user for: funder name, program title, funding amount, key requirements, and deadline.

2. **Program Information**: What the applicant is proposing to do. Can come from:
   - An existing program description or one-pager
   - A conversation where the user describes the program
   - Prior proposals or reports
   - A combination of the above

### Strongly Recommended

3. **Organization Information**: Who is applying. Background, mission, track record, key staff, partnerships.
   - If not provided, ask the user for basics: org name, mission, years operating, relevant experience, key personnel.

4. **Data / Evidence**: Local statistics, research citations, needs assessment data.
   - If not provided, note where data is needed and suggest what types of data to find.

5. **Budget Parameters**: Total request amount, cost categories, staffing plan, in-kind contributions, indirect cost rate.
   - If not provided, build a reasonable budget framework based on program activities and flag it for user review.

### Optional but Valuable

6. **Prior Proposals**: Previous submissions to the same or similar funders (shows voice, approach, what worked).
7. **Letters of Support / MOUs**: Partnership evidence to reference in the narrative.
8. **Logic Model**: If the applicant already has one; otherwise the skill will draft one.
9. **Evaluation Framework**: Existing measurement tools or metrics the program already tracks.

## Proposal Writing Workflow

### Step 1: Analyze the NOFO/RFP

Before writing a single sentence, deeply understand what the funder wants.

**Extract and organize:**
- **Funder identity and priorities**: What does this funder care about? What language do they use? What have they funded before?
- **Eligibility requirements**: Confirm the applicant qualifies before investing time
- **Required sections**: Exact sections, in the exact order the NOFO specifies
- **Evaluation criteria with weights**: This is the scoring rubric. It tells you where to invest writing effort. A section worth 25 points gets more attention than one worth 5.
- **Page/word limits**: Per-section if specified, or total
- **Format requirements**: Font, margins, spacing, file format
- **Required attachments and forms**: What goes in the appendix vs. the narrative
- **Budget constraints**: Ceiling, floor, match requirements, unallowable costs
- **Key dates**: Submission deadline, project period, reporting schedule
- **Specific language or frameworks**: Does the NOFO reference specific models, theories, or approaches the proposal should align with?

**Create a NOFO Analysis Summary** before writing. This becomes the blueprint.

Read `references/nofo-analysis.md` for detailed guidance on analyzing different funder types (federal, state, foundation).

### Step 2: Build the Proposal Architecture

Map the proposal structure before drafting content.

**Structure approach:**
1. Use the NOFO's required section structure exactly (don't reorganize it)
2. Allocate word/page budget to each section proportional to scoring weight
3. Identify which program information maps to which section
4. Flag gaps where the user needs to provide additional information
5. Note where data citations are needed

**Core sections (adapt to match NOFO):**

| Section | Purpose | Key Content |
|---------|---------|------------|
| Abstract/Summary | Quick overview for reviewers | Problem, approach, outcomes, amount requested |
| Need/Problem Statement | Why this matters | Local data, population specifics, root causes, urgency |
| Program Design | What you'll do | Activities, timeline, logic model, staffing, dosage |
| Organizational Capacity | Why you can deliver | Track record, key personnel, partnerships, infrastructure |
| Evaluation Plan | How you'll measure | Metrics, data collection, analysis, reporting, feedback loops |
| Budget & Justification | What it costs and why | Line items tied to activities, reasonable rates, match sources |
| Sustainability | What happens after | Revenue plan, institutionalization, community ownership |

Read `references/section-templates.md` for section-by-section writing guidance.

### Step 3: Draft Each Section

Write sections in this order (each builds on the previous):

**3a. Need/Problem Statement** -- Write this first because everything else flows from the problem.
- Open with the most compelling local data point
- Use funder language to describe the problem (mirror their NOFO)
- Layer data: national trend → state data → local data → target population specifics
- Describe root causes, not just symptoms
- Connect the problem directly to what the funder has said they want to address
- End with a clear statement of what the proposed program will do about it
- Avoid deficit-only framing; acknowledge community strengths and assets

**3b. Program Design** -- The heart of the proposal.
- Start with the logic model (build one if not provided; read `references/logic-model-guide.md`)
- Describe activities in operational detail: who does what, when, where, how often, for how many people
- Specify dosage: how much service each participant receives
- Describe recruitment and retention strategies
- Address barriers to participation
- Show how activities connect to outcomes through the logic model
- Include a timeline (table format works well)
- Describe staffing and their qualifications
- Reference evidence base: what research supports this approach?

**3c. Organizational Capacity** -- Prove you can deliver.
- Lead with most relevant experience (not org founding story)
- Describe key personnel with specific qualifications for their proposed roles
- Highlight partnerships with MOUs or letters of support
- Show infrastructure: facilities, technology, financial management
- Include prior grant management experience if applicable
- If newer org: emphasize team expertise, board engagement, and capacity-building plan

**3d. Evaluation Plan** -- Show you'll know if it worked.
- Define outcomes (not just outputs) with specific, measurable targets
- Describe data collection methods, instruments, and timeline
- Explain how data will be analyzed
- Describe how findings will be used for program improvement (feedback loop)
- If federal: align with agency-specific measures (GPRA for SAMHSA, Common Measures for DOL)
- Include both process evaluation (are we doing what we said?) and outcome evaluation (is it working?)

**3e. Budget Narrative** -- Make every dollar make sense.
- Read `references/budget-narrative-guide.md` for detailed guidance
- Tie every line item to a specific program activity
- Justify rates (personnel salaries, consultant fees, travel costs)
- Show how costs were calculated (rate x hours x FTE)
- Address indirect costs (NICRA or 10% de minimis)
- If match required: identify sources and distinguish cash from in-kind
- Common budget categories: Personnel, Fringe, Travel, Equipment, Supplies, Contractual, Other, Indirect

**3f. Sustainability Plan** -- What happens when the money runs out.
- Describe specific revenue diversification strategies (not just "seek additional grants")
- Show how program elements will be institutionalized
- Identify which components can continue at lower cost
- Describe community ownership and stakeholder investment
- If applicable: describe earned revenue potential

**3g. Abstract/Executive Summary** -- Write this LAST (even though it appears first).
- Summarize the need in 1-2 sentences
- State the proposed solution clearly
- Specify measurable outcomes
- State the amount requested and project period
- Keep it tight -- reviewers read dozens of these

### Step 4: Self-Review Against Scoring Criteria

Before delivering the draft, review it against the NOFO's evaluation criteria.

**For each scoring criterion:**
1. Does the proposal explicitly address it?
2. Is there specific evidence or data supporting the response?
3. Is the content in the right section?
4. Does the language mirror the NOFO's language?
5. Would a reviewer easily find this content when scoring?

**Cross-check:**
- Budget aligns with narrative (activities described = activities funded)
- Outcomes in evaluation plan match outcomes in program design
- Personnel described in org capacity match personnel in budget
- Timeline is realistic for the project period
- Page/word limits respected per section
- All required sections present

**If gaps are found:**
- Fix what can be fixed (missing connections, weak language, vague claims)
- Flag what needs user input (missing data, unconfirmed partnerships, budget decisions)
- Maximum 2 self-review rounds, then deliver with flagged items

### Step 5: Generate Final Deliverables

1. **Complete Proposal Narrative**: All sections in NOFO-specified order
   - Use the `docx` skill for Word document generation if available
   - Otherwise use `python-docx` for formatted output
   - Follow NOFO format requirements (font, margins, spacing)

2. **Budget Table + Narrative**: Formatted budget with line-item justifications

3. **Logic Model**: Visual or table-format logic model showing the causal chain

4. **Review Notes**: Document listing:
   - Items flagged for user review/input
   - Data gaps that need local statistics
   - Sections where the user should add org-specific detail
   - Compliance considerations from the grant-proposal-evaluator references

5. **Submission Checklist**: What's ready, what still needs work, what attachments to gather

Save all outputs to the user-specified location or `outputs/` directory.

## Writing Principles

These principles separate proposals that get funded from proposals that get filed.

**Mirror funder language.** If the NOFO says "evidence-based practices," don't write "proven methods." Use their exact terms. Reviewers score against rubric language.

**Be specific, not impressive.** "We will serve 150 transitioning veterans ages 25-44 in El Paso County over 12 months" beats "We will serve many veterans in our community." Numbers, timelines, and geography score points. Adjectives don't.

**Show, don't claim.** "Our Executive Director has managed $2.3M in federal grants across 4 agencies over 8 years" beats "Our team has extensive grant management experience."

**Connect everything to the logic model.** Activities → outputs → outcomes. If an activity doesn't connect to an outcome, either cut it or add the connection. Reviewers look for this.

**Address weaknesses directly.** If you're a new org, say so and explain your mitigation (experienced staff, fiscal sponsor, strong board). Reviewers will find weaknesses whether you address them or not. Addressing them shows self-awareness.

**Write for tired reviewers.** They're reading their 15th proposal. Make it easy to find information. Use headers that match the NOFO sections. Put the answer to each criterion where the rubric says to look for it.

**Data layering:** National → State → Local → Target Population. Each layer makes the need more specific and compelling. Local data is worth 3x national data in a reviewer's mind.

**Avoid these words** unless you back them with evidence: innovative, unique, comprehensive, holistic, synergy, leverage, impactful. Reviewers see these in every proposal and they've become meaningless.

## Funder-Specific Guidance

### Federal (SAMHSA, VA, DOL)
- Strictly follow NOFO section structure; deviation can cause scoring penalties
- Reference agency strategic plans and priorities
- Use agency-specific terminology and frameworks
- Include required certifications and assurances
- Budget must comply with 2 CFR 200 cost principles
- Evaluation plan should align with agency measures (GPRA, Common Measures)

### State (CDHS, OBH, Colorado agencies)
- Use Colorado-specific data throughout
- Reference state strategic plans and initiatives
- Show coordination with existing state-funded services
- Address Colorado-specific populations and disparities
- Demonstrate awareness of state reporting requirements

### Community Foundations (El Pomar, Pikes Peak CF)
- Shorter, more concise narrative style
- Emphasize local community impact (not national significance)
- Show community engagement and input in program design
- Less jargon, more plain language
- Focus on practical outcomes and community benefit
- Demonstrate collaboration with local partners (not competition)
- Show organizational financial health and stability

### Nonprofit / Fiscal Sponsor Arrangements
- Clearly describe the relationship between program and sponsoring org
- Include board resolution or authorization
- Describe financial management structure
- Address capacity to manage the specific grant amount

## Quality Checklist

Before delivering any proposal draft, verify:

- [ ] Every NOFO-required section is present
- [ ] Evaluation criteria explicitly addressed with specific content
- [ ] Budget math is correct and aligns with narrative
- [ ] All claims backed by evidence, data, or citations
- [ ] Logic model connects activities to outcomes
- [ ] Personnel qualifications match their proposed roles
- [ ] Timeline fits within the project period
- [ ] Format meets NOFO specifications (pages, font, margins)
- [ ] No vague language where specifics are needed
- [ ] Sustainability plan goes beyond "seek more grants"
- [ ] Required attachments listed and flagged for user to gather
- [ ] Review notes document all items needing user input
