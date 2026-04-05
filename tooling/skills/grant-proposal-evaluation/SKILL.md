---
name: grant-proposal-evaluator
description: Systematic grant proposal evaluation, compliance checking, and gap analysis for federal, state, local, and nonprofit funding applications. Use this skill whenever someone mentions grant proposals, NOFOs, RFPs, funding applications, grant compliance, proposal review, grant scoring, SF-424, 2 CFR 200, SAMHSA, VA grants, community foundation applications, or asks to evaluate, review, score, or improve a grant proposal. Also triggers on compliance checking for nonprofit programs, federal grant readiness assessments, or requests to find gaps in a funding application before submission.
---

# Grant Proposal Evaluator & Compliance Checker

## Overview

This skill provides a structured workflow for evaluating grant proposals against funder requirements, performing multi-level compliance audits, and generating actionable gap analysis reports. It follows an **Extract > Assess > Validate > Generate** pipeline with self-correction loops to catch issues that get proposals rejected.

The skill works for both internal proposal QA (evaluating your own drafts before submission) and as a client-facing service (evaluating proposals on behalf of clients). It covers federal grants (SAMHSA, VA, DOL), state/local funding (CDHS, community foundations like El Pomar), and nonprofit compliance (501c3, fiscal sponsors, ALYP/program-level).

## When to Use This Skill

Use this skill when you need to:
- Evaluate a draft grant proposal against a NOFO/RFP before submission
- Check a proposal for compliance gaps (federal, state, nonprofit)
- Score a proposal using funder evaluation criteria
- Identify common rejection risks before they become actual rejections
- Generate a structured evaluation report with specific fix recommendations
- Review a client's grant application as a service

## Required Inputs

Gather these before starting. If critical inputs are missing, request them from the user before proceeding.

### Core Inputs (Required)

1. **NOFO/RFP Document** (REQUIRED): The Notice of Funding Opportunity, Request for Proposals, or funder guidelines. This is the source of truth for what the funder wants.
   - Federal: Full NOFO from Grants.gov or SAM.gov
   - State: Program announcement from state agency (e.g., CDHS)
   - Foundation: Application guidelines and eligibility requirements
   - Location: `inputs/nofo/` or user-specified path

2. **Draft Proposal** (REQUIRED): The proposal narrative being evaluated.
   - Location: `inputs/proposal/` or user-specified path

### Recommended Inputs (Strongly Encouraged)

3. **Evaluation Criteria / Scoring Rubric**: How the funder scores proposals. Often embedded in the NOFO under "Review Criteria" or "Evaluation Factors." If not provided separately, extract it from the NOFO during Step 1.
   - Location: `inputs/criteria/` or extracted from NOFO

4. **Budget Narrative + Forms**: Budget justification and any required forms (SF-424, SF-424A for federal; custom templates for foundations).
   - Location: `inputs/budget/`

5. **Logic Model / Theory of Change**: Visual or narrative description of how program activities lead to intended outcomes. Many federal grants require this explicitly. Even when not required, reviewers look for logical program design.
   - Location: `inputs/logic-model/`

### Supporting Inputs (Include When Available)

6. **Organization Capability Statement**: Past performance, org history, key personnel bios, relevant experience. Used to evaluate "Organizational Capacity" sections.
   - Location: `inputs/org-docs/`

7. **Letters of Support / MOUs / Board Resolutions**: Evidence of community buy-in and governance authorization.
   - Location: `inputs/support-docs/`

8. **Prior Grant Reports**: Previous performance reports, especially if reapplying or demonstrating track record to the same funder.
   - Location: `inputs/prior-reports/`

9. **Scoring Template**: Standardized format for presenting evaluation results. If not provided, use the default template structure defined in Step 3.
   - Location: `inputs/scoring-template/`

**If the user provides a single folder path**, scan it and map files to the categories above based on filenames and content. Confirm the mapping with the user before proceeding.

## Evaluation Workflow

Process the proposal through these six steps sequentially. Do not skip steps. The validation loop (Steps 4-5) is where most value gets created -- it catches what a first pass misses.

### Step 1: Extract Requirements and Context

Before scoring anything, build a complete picture of what the funder wants and what the applicant is proposing.

**From the NOFO/RFP, extract:**
- Program purpose and funding priorities
- Eligibility requirements (org type, geography, population served, certifications)
- Required proposal sections and page/word limits
- Evaluation criteria with point allocations (this is the scoring rubric)
- Required attachments and forms
- Budget constraints (ceiling, floor, cost-share/match requirements)
- Reporting and compliance requirements
- Key dates and submission mechanics
- Any disqualifying factors (miss one of these and the rest doesn't matter)

**From the Draft Proposal, extract:**
- Proposed program design and activities
- Target population and geographic focus
- Stated outcomes and measurable objectives
- Evaluation/measurement approach
- Organizational qualifications claimed
- Budget summary and key line items
- Partnerships and collaborators mentioned

**From Supporting Documents, extract:**
- Budget details and cost justifications
- Logic model connections (inputs > activities > outputs > outcomes)
- Evidence of organizational capacity
- Community support and partnership evidence

Create a structured summary of extracted information before moving to assessment. This summary becomes the evidence base for all scoring decisions.

### Step 2: Assess Proposal Against Requirements

Score the proposal section by section using the funder's evaluation criteria. If the NOFO includes specific point allocations, use those exactly. If not, use these standard categories:

**Standard Scoring Categories (adjust weights to match NOFO):**

| Category | Weight | What to Evaluate |
|----------|--------|-----------------|
| Need/Problem Statement | 15-20% | Is the problem clearly defined with data? Does it align with funder priorities? |
| Program Design | 20-25% | Are activities logical? Does the logic model hold? Are outcomes measurable? |
| Organizational Capacity | 15-20% | Can this org actually deliver? Key personnel qualifications? Past performance? |
| Evaluation Plan | 10-15% | How will success be measured? Are metrics specific and achievable? |
| Budget Justification | 15-20% | Are costs reasonable? Properly justified? Within funder limits? |
| Sustainability | 5-10% | What happens when funding ends? Is there a continuation plan? |
| Innovation/Impact | 5-10% | Does this bring something new? What's the potential scale of impact? |

**For each category:**
1. State the score (numeric, using the funder's scale or 1-10 if none specified)
2. Cite specific evidence from the proposal supporting the score
3. Identify strengths (what works well, with page/section references)
4. Identify gaps (what's missing, weak, or unclear)
5. Flag anything that contradicts the NOFO requirements

**Assessment principles:**
- Score based only on what's actually written in the proposal, not what you think the applicant meant
- If information is missing from the proposal, score it as missing -- don't assume it exists elsewhere
- Compare directly against NOFO language; use the funder's terminology
- Note where the proposal uses vague language where specifics are needed ("many participants" vs. "150 participants over 12 months")
- Flag any eligibility issues immediately -- these are disqualifying regardless of proposal quality

### Step 3: Generate Initial Evaluation Report

Produce a structured evaluation following the scoring template (if provided) or this default structure:

**Report Structure:**

```
GRANT PROPOSAL EVALUATION REPORT
=================================

OVERVIEW
- Funder: [Name]
- Opportunity: [NOFO/RFP Title and Number]
- Applicant: [Organization Name]
- Requested Amount: [Dollar Amount]
- Evaluation Date: [Date]
- Evaluator: [TNDS Grant Proposal Evaluator / Client Name]

EXECUTIVE SUMMARY
- Overall Score: [X/100 or X/[max]]
- Recommendation: [STRONG SUBMIT / SUBMIT WITH REVISIONS / MAJOR REVISIONS NEEDED / DO NOT SUBMIT]
- Top 3 Strengths
- Top 3 Critical Gaps
- Estimated Competitiveness: [High / Medium / Low] with reasoning

DETAILED SCORING
[Section-by-section scoring from Step 2]

COMPLIANCE AUDIT RESULTS
[From Step 4 -- filled in after validation]

COMMON REJECTION RISK ANALYSIS
[From Step 4 -- filled in after validation]

GAP ANALYSIS & RECOMMENDATIONS
- Priority 1 (Must Fix): Issues that would likely cause rejection
- Priority 2 (Should Fix): Issues that weaken competitiveness
- Priority 3 (Nice to Fix): Polish items that could strengthen the application
- Each recommendation includes: what's wrong, where it is, and specifically how to fix it

SUBMISSION CHECKLIST
- Required sections: [present/missing]
- Required attachments: [present/missing]
- Format requirements: [met/not met]
- Deadline status: [days remaining]
```

### Step 4: Validate — Multi-Level Compliance Audit

This is where the skill earns its keep. Run three levels of validation. Each catches different problems.

**Level 1: Internal Consistency Check**
- Do all scores have supporting evidence from the actual proposal text?
- Does the recommendation match the scoring (don't recommend "STRONG SUBMIT" with a 62/100)?
- Are there contradictions between sections of the evaluation?
- Did the evaluation miss any NOFO requirements?
- Is scoring proportional (higher scores backed by stronger evidence)?

**Level 2: Common Rejection Reasons Analysis**

Read `references/common-rejections.md` for the full list, but check at minimum:
- Weak or missing logic model (activities don't connect to outcomes)
- Vague or unmeasurable outcomes ("increase awareness" without metrics)
- Budget misalignment (budget doesn't match proposed activities)
- Missing required sections or attachments
- Exceeding page/word limits
- Eligibility issues not addressed
- No sustainability plan beyond the grant period
- Lack of evidence for need (anecdotal vs. data-driven)
- Key personnel gaps (no one qualified to run the proposed program)
- Inadequate evaluation plan

For each rejection risk found, rate severity: HIGH (likely causes rejection), MEDIUM (weakens competitiveness), LOW (minor issue).

**Level 3: Regulatory Compliance Audit**

Read the appropriate reference file based on the grant type:

- Federal grants: Read `references/federal-compliance.md` for 2 CFR 200, NOFO-specific requirements, SAM.gov registration, indirect cost rates, cost principles
- State/local grants: Read `references/state-compliance.md` for Colorado-specific requirements, state reporting, local match requirements
- Nonprofit compliance: Read `references/nonprofit-compliance.md` for 501c3 requirements, fiscal sponsor considerations, board governance, program-specific regulations

**For programs serving vulnerable populations (youth, veterans in crisis):**
- Flag COPPA requirements for programs serving minors
- Flag HIPAA considerations for crisis intervention data
- Flag FERPA if partnering with schools
- Flag FedRAMP/NIST 800-53 for any technology platforms handling sensitive data
- Flag mandatory reporting requirements
- Note: These flags are advisory -- they should be reviewed by an attorney before submission

### Step 5: Address Validation Failures

If any validation level identifies issues:

1. **Categorize**: Group issues by severity (HIGH / MEDIUM / LOW) and type (scoring error, compliance gap, missing content, consistency issue)
2. **Correct the evaluation**: Fix any scoring errors, add missed requirements, update recommendations to reflect findings
3. **Re-validate**: Run the relevant validation level again
4. **Maximum 3 rounds**: If issues persist after 3 correction rounds, flag for human review with a clear description of what can't be resolved automatically

The goal is not perfection -- it's catching the things that get proposals rejected and providing actionable guidance to fix them.

**Do NOT proceed to Step 6 until validation passes or 3 rounds are exhausted.**

### Step 6: Generate Final Report and Save

Once validation passes:

1. **Compile the complete report** incorporating all validation findings into the report structure from Step 3
2. **Add the compliance audit section** with specific regulatory requirements checked and their status
3. **Add the rejection risk section** with severity ratings and fix recommendations
4. **Append validation summary**:
   - Validation Round 1: [PASSED/FAILED] - [Brief description of findings]
   - Validation Round 2 (if applicable): [PASSED/FAILED] - [What was corrected]
   - Validation Round 3 (if applicable): [PASSED/FAILED] - [Remaining issues flagged for human review]
5. **Save output**: Generate the report as a formatted document.
   - If the `docx` skill is available, use it for Word document generation
   - Otherwise, use `python-docx` to create a properly formatted .docx
   - Save to `grant_evaluation_report.docx` or user-specified path
   - Also save a markdown version for quick reference
6. **Clean up**: Remove any temporary scripts created during the workflow

## Directory Structure

The skill expects this flexible structure (adapt paths as needed):

```
grant-eval/
├── inputs/
│   ├── nofo/                    # NOFO/RFP document(s)
│   ├── proposal/                # Draft proposal narrative
│   ├── criteria/                # Evaluation criteria (if separate from NOFO)
│   ├── budget/                  # Budget narrative and forms
│   ├── logic-model/             # Logic model / theory of change
│   ├── org-docs/                # Capability statement, bios
│   ├── support-docs/            # Letters, MOUs, board resolutions
│   └── prior-reports/           # Previous grant performance reports
├── references/                  # Compliance reference files (bundled with skill)
│   ├── federal-compliance.md
│   ├── state-compliance.md
│   ├── nonprofit-compliance.md
│   └── common-rejections.md
├── templates/                   # Report templates (bundled with skill)
│   └── scoring-template.md
└── outputs/
    ├── grant_evaluation_report.docx
    └── grant_evaluation_report.md
```

## Quality Principles

- **Evidence-based**: Every score and finding references specific proposal text or NOFO requirements
- **Actionable**: Every gap identified includes a specific recommendation for how to fix it
- **Prioritized**: Issues ranked by impact on funding decision (not just listed)
- **Objective**: Evaluate what's written, not what's intended
- **Consistent**: Same criteria applied the same way across all proposals evaluated
- **Transparent**: Show the reasoning chain so the applicant (or client) understands every finding
- **Compliant**: Flag regulatory requirements proactively, even when the applicant hasn't asked about them

## Ethical Considerations

- Evaluate proposals on merit and alignment with funder criteria only
- Do not fabricate or assume information not present in the proposal
- Flag potential conflicts of interest if identified
- Note when compliance guidance should be reviewed by legal counsel
- Protect confidential proposal content -- do not reference one client's proposal in another's evaluation
- This skill assists human decision-making; it does not replace professional grant writing, legal review, or compliance officer judgment
