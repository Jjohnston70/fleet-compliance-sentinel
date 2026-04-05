# Compliance Audit Skill

## 1. SKILL IDENTITY

**Skill Name:** compliance-audit

**Version:** 1.0

**Last Updated:** 2025-02-07

**Skill Type:** Assessment and Audit Methodology

**Skill Purpose:**
This skill provides comprehensive audit methodology, assessment frameworks, and reusable checklist templates for evaluating compliance documentation ecosystems. It enables systematic review of compliance programs across multiple skill areas, ensuring cross-package integration, regulatory alignment, and audit readiness.

**CRITICAL:** This skill provides AUDIT METHODOLOGY and CHECKLIST TEMPLATES, not policy documents. These are assessment tools designed to evaluate existing compliance programs.

---

## 2. CORE FUNCTION

### Primary Capabilities

**Compliance Program Assessment:**
- Package maturity evaluation across 7 skill areas
- Cross-package dependency analysis
- Compliance framework alignment assessment
- Audit readiness evaluation
- Technical accuracy validation
- Operational realism review

**Audit Frameworks:**
- Package-by-package maturity assessment
- Cross-skill dependency mapping
- Comprehensive compliance review
- Compliance roadmap development
- Scoring and rating methodologies

**Assessment Outputs:**
- Structured checklists with status, evidence, and findings columns
- Gap analysis with priorities and remediation plans
- Dependency maps and architecture diagrams
- Compliance framework readiness assessments
- Actionable recommendations with owners and due dates

### What This Skill Does

This skill enables compliance teams, auditors, and executives to:

1. **Assess Documentation Maturity:** Evaluate completeness, accuracy, and integration of compliance documentation across all skill areas
2. **Identify Integration Gaps:** Map cross-skill dependencies and identify missing references or inconsistencies
3. **Evaluate Framework Alignment:** Assess readiness for NIST, ISO 27001, SOC 2, HIPAA, FedRAMP, GDPR/CCPA, and federal contracting
4. **Plan Remediation:** Develop phased roadmaps with priorities, owners, and target dates
5. **Track Progress:** Monitor compliance maturity improvements over time
6. **Prepare for Audits:** Ensure documentation and evidence are audit-ready

### What This Skill Does NOT Do

This skill does NOT:
- Create policies or procedures (use other skills for policy development)
- Implement technical controls (use internal-compliance or cloud-platform-security skills)
- Provide legal advice (consult legal counsel)
- Guarantee certification or compliance (independent audits required)
- Replace external auditors (provides internal assessment methodology)

---

## 3. SKILL STRUCTURE

### Directory Organization

```
compliance-audit/
├── SKILL.md (this file)
├── templates/
│   ├── package-maturity-assessment.md
│   ├── cross-package-dependency-review.md
│   ├── compliance-roadmap-checklist.md
│   └── comprehensive-compliance-review.md
└── reference/
    └── audit-scoring-criteria.md
```

### Template Descriptions

**package-maturity-assessment.md**
- Purpose: Evaluate maturity of compliance documentation across 7 skill areas
- Use Case: Quarterly or annual compliance program review
- Output: Skill-by-skill ratings, gap analysis, remediation plan
- Scoring: 1-10 scale with EXCELLENT/STRONG/ADEQUATE/DEVELOPING/INSUFFICIENT ratings

**cross-package-dependency-review.md**
- Purpose: Map and validate cross-skill dependencies and integration points
- Use Case: After major documentation updates or before external audits
- Output: Dependency maps, integration gap analysis, phased remediation plan
- Focus: Cross-references, governance hierarchy, architectural consistency

**compliance-roadmap-checklist.md**
- Purpose: Strategic compliance milestone planning and tracking
- Use Case: Long-term compliance program planning (6-24 months)
- Output: Phased roadmap with milestones, owners, target dates, status tracking
- Phases: Federal readiness, VAR capabilities, contract readiness, expansion options

**comprehensive-compliance-review.md**
- Purpose: Executive-level assessment of entire compliance ecosystem
- Use Case: Annual executive review, pre-audit assessment, board reporting
- Output: Executive summary, framework alignment, priority findings, sign-off
- Audience: CEO, CISO, Board of Directors, external auditors

### Reference Documents

**audit-scoring-criteria.md**
- Consolidated scoring rubric from all assessment templates
- Unified rating scales (1-10 overall, category ratings)
- Framework-specific readiness criteria
- Language accuracy guidelines (compliant vs aligned)
- Operational realism standards (24/7 coverage, role combination, staffing)
- Consistency and calibration guidance

---

## 4. USAGE INSTRUCTIONS

### When to Use This Skill

**Quarterly Reviews:**
- Use package-maturity-assessment.md
- Track progress on remediation plans
- Update compliance metrics

**After Major Documentation Changes:**
- Use cross-package-dependency-review.md
- Validate cross-references remain accurate
- Ensure integration consistency

**Annual Strategic Planning:**
- Use compliance-roadmap-checklist.md
- Set priorities for next 12-24 months
- Align compliance investments with business goals

**Pre-Audit Preparation:**
- Use comprehensive-compliance-review.md
- Validate audit readiness across all areas
- Identify and remediate critical gaps

**Board or Executive Reporting:**
- Use comprehensive-compliance-review.md
- Provide executive summary and recommendations
- Obtain approval for compliance program

### Assessment Workflow

1. **Select Template:** Choose based on assessment purpose and audience
2. **Customize Fields:** Fill in organization name, reviewer, dates
3. **Conduct Review:** Systematically evaluate documentation using checklist
4. **Gather Evidence:** Document findings, evidence, and status for each item
5. **Apply Scoring:** Use audit-scoring-criteria.md for consistency
6. **Identify Gaps:** Document all deficiencies and integration issues
7. **Prioritize Actions:** Assign HIGH/MEDIUM/LOW priorities
8. **Assign Ownership:** Designate responsible parties for each action
9. **Set Timelines:** Establish realistic target dates
10. **Track Progress:** Monitor remediation and reassess quarterly

### Scoring Methodology

**Always reference:** `reference/audit-scoring-criteria.md`

**Overall Rating Scale (1-10):**
- 9-10: EXCELLENT - Audit-ready, minimal enhancements
- 7-8: STRONG - Mature, targeted improvements needed
- 5-6: ADEQUATE - Functional, significant work required
- 3-4: DEVELOPING - Major gaps, substantial work needed
- 1-2: INSUFFICIENT - Critical deficiencies

**Category Ratings:**
- EXCELLENT: Comprehensive, audit-ready
- STRONG: Mature, targeted enhancements needed
- ADEQUATE: Functional, improvements required
- DEVELOPING: Significant gaps
- INSUFFICIENT: Critical deficiencies

### Evidence Collection

**For each checklist item, document:**
- Status: COMPLETE, IN PROGRESS, NOT STARTED, N/A
- Evidence: Document name, version, location
- Finding: Brief description of current state
- Action Required: Specific remediation needed (if applicable)
- Owner: Responsible party
- Due Date: Target completion date
- Priority: HIGH, MEDIUM, LOW

---

## 5. INTEGRATION POINTS

### Relationship to Other Skills

This skill assesses and validates the work products of:

**internal-compliance:**
- Reviews operational security policies (IR, SDLC, logging, access control, BC/DR)
- Validates universal principles integration (no-PII-in-logs)
- Assesses cross-references to governance and privacy

**security-governance:**
- Evaluates master governance framework
- Validates governance hierarchy and authority
- Reviews regulatory mapping and role definitions
- Assesses integration with all other skills

**data-handling-privacy:**
- Reviews privacy framework and data handling procedures
- Validates anonymization and lifecycle management controls
- Assesses retention harmonization
- Reviews breach notification integration

**government-contracting:**
- Evaluates federal posture and capability statements
- Reviews NIST alignment and gap analysis
- Validates CUI handling and mandatory reporting
- Assesses compliance language appropriateness

**cloud-platform-security:**
- Reviews platform-specific security standards
- Validates IAM, DLP, and monitoring configurations
- Assesses AI governance integration
- Reviews 24/7 coverage realism

**business-operations:**
- Evaluates operational procedures (onboarding, QA, training)
- Reviews integration of security/privacy into business processes
- Validates document control and training programs

**contracts-risk-assurance:**
- Reviews contract templates (MSA, SOW, DPA, BAA)
- Evaluates risk assessment and vendor assessment frameworks
- Reviews audit readiness checklists

### Assessment Dependencies

**Prerequisites:**
- Compliance documentation ecosystem exists (policies, procedures, standards across multiple skills)
- Documentation is accessible and current
- Reviewer has access to all relevant materials

**Inputs:**
- All skill documentation across 7 areas
- Current compliance framework requirements
- Business objectives and risk profile
- Previous assessment results (for comparison)

**Outputs:**
- Completed assessment checklist(s)
- Gap analysis with priorities
- Remediation plan with owners and dates
- Dependency maps and architecture diagrams
- Executive summary and recommendations
- Signed approval (for comprehensive review)

---

## 6. METHODOLOGY

### Assessment Approach

**Systematic Review:**
1. Inventory all documentation across skills
2. Map dependencies and cross-references
3. Evaluate against assessment criteria
4. Document findings and evidence
5. Score and rate maturity
6. Identify gaps and priorities
7. Develop remediation plan
8. Obtain stakeholder review and approval

**Evaluation Criteria (7 Dimensions):**
1. **Completeness:** All required policies, procedures, standards documented
2. **Compliance Alignment:** Alignment with NIST, ISO, SOC 2, HIPAA, FedRAMP, GDPR/CCPA
3. **Cross-Package Integration:** Dependencies explicitly documented, no orphans
4. **Technical Accuracy:** Controls accurately documented and implementable
5. **Operational Realism:** Documentation reflects actual capabilities
6. **Federal Contracting Readiness:** Honest posture, NIST alignment, SSP/POA&M/SPRS
7. **Audit Readiness:** Evidence documented, controls verifiable, ready for external audit

**Validation Methods:**
- Document review and content analysis
- Cross-reference validation
- Stakeholder interviews (optional)
- Evidence sampling
- Technical control validation
- Compliance framework mapping

### Critical Success Factors

**Universal Principles Implementation:**
- Data-as-regulated principle stated and cascaded
- No-PII-in-logs principle in all applicable documents
- Role combination clause for small organizations

**Cross-Package Integration:**
- All dependencies explicitly documented
- Clear governance hierarchy established
- Retention harmonized to single source of truth
- Integration points clearly defined

**Operational Realism:**
- Compliance language accurate (aligned vs compliant)
- 24/7 coverage claims backed by MSSP or automation
- Staffing models realistic for organization size
- Technology claims match actual capabilities

**Audit Readiness:**
- Evidence documented and accessible
- Controls implemented and verifiable
- Gap analysis honest and complete
- Remediation plans in place

---

## 7. COMPLIANCE FRAMEWORK COVERAGE

### Framework Assessments

This skill provides readiness assessments for:

**NIST Cybersecurity Framework:**
- All five functions (Identify, Protect, Detect, Respond, Recover)
- Implementation profile documentation
- Gap analysis and remediation planning
- NIST-Lite alignment (for federal contractors)

**ISO 27001:**
- ISMS documentation completeness
- Annex A control coverage
- Risk assessment and Statement of Applicability
- Internal audit and management review readiness

**SOC 2:**
- System description completeness
- Trust Services Criteria identification
- Control design and operating effectiveness
- Evidence collection readiness
- Type I and Type II audit preparation

**HIPAA:**
- Privacy Rule, Security Rule, Breach Notification Rule
- BAA template readiness
- PHI handling procedures
- Risk analysis completeness
- Language accuracy (aligned vs compliant)

**FedRAMP:**
- NIST 800-53 control alignment
- Impact level identification (Low/Moderate/High)
- Gap analysis honesty
- Language accuracy (FedRAMP-adjacent vs compliant)

**GDPR/CCPA:**
- Data subject rights implementation
- Privacy by design principles
- Consent management
- Data minimization
- Breach notification procedures

**Federal Contracting:**
- NIST 800-171 self-assessment
- SSP and POA&M completeness
- SPRS score submission
- Capability statement accuracy
- CUI handling procedures

---

## 8. CUSTOMIZATION GUIDANCE

### Adapting Templates to Your Organization

**Placeholders to Replace:**
- [ORGANIZATION_NAME] → Your organization's full legal name
- [ORGANIZATION_ABBREVIATION] → Your organization's abbreviation
- [REVIEWER_NAME] → Name of person conducting assessment
- [REVIEWER_TITLE] → Title of reviewer
- [ASSESSMENT_DATE] → Date of assessment
- [COMPANY_LEGAL_NAME] → Full legal entity name
- [OWNER_NAME] → Name of business owner
- All contact information placeholders

**Skill References to Update:**
- "Package 1" → "internal-compliance skill"
- "Package 2" → "security-governance skill"
- "Package 3" → "data-handling-privacy skill"
- "Package 4" → "government-contracting skill"
- "Package 5" → "cloud-platform-security skill"
- "Package 6" → "business-operations skill"
- "Package 7" → "contracts-risk-assurance skill"

**Organizational Context:**
- Adjust document counts to match your ecosystem
- Modify skill areas if you have different structure
- Customize regulatory frameworks to your business needs
- Tailor scoring weights to your priorities

### Adding Custom Assessment Criteria

**To add criteria:**
1. Define clear evaluation standard
2. Establish scoring rubric (aligned with existing scale)
3. Document evidence requirements
4. Add to relevant template sections
5. Update audit-scoring-criteria.md reference document

**Examples:**
- Industry-specific compliance (PCI DSS, GLBA, FERPA)
- Customer-specific requirements
- State/local regulations
- International standards

---

## 9. BEST PRACTICES

### Assessment Frequency

**Quarterly:**
- Package maturity assessment (lightweight)
- Cross-package dependency spot checks
- Progress tracking on remediation plans

**Annually:**
- Comprehensive compliance review
- Full cross-package dependency review
- Compliance roadmap update
- Executive sign-off

**Triggered:**
- After major documentation changes
- Before external audits
- Before certification pursuits
- After significant incidents
- When entering new markets (e.g., federal contracting)

### Assessment Quality

**Objectivity:**
- Base findings on observable evidence, not assumptions
- Document specific examples and evidence
- Avoid score inflation
- Be honest about gaps

**Consistency:**
- Use same criteria across all assessments
- Reference audit-scoring-criteria.md for calibration
- Compare scores to previous assessments
- Validate scores across similar areas

**Completeness:**
- Review all relevant documentation
- Don't skip difficult areas
- Document both strengths and weaknesses
- Provide actionable recommendations

**Stakeholder Engagement:**
- Interview skill owners
- Validate findings before finalizing
- Obtain buy-in on priorities and timelines
- Communicate results clearly

### Remediation Planning

**Prioritization:**
- HIGH: Critical gaps, regulatory requirements, audit blockers
- MEDIUM: Important improvements, efficiency gains
- LOW: Nice-to-have enhancements, future considerations

**Realistic Timelines:**
- Consider resource constraints
- Phase complex work
- Build in review and approval time
- Allow for dependencies

**Ownership:**
- Assign specific individuals, not roles
- Ensure owners have authority and resources
- Track accountability
- Escalate blockers

**Tracking:**
- Use project management tools
- Review progress regularly
- Adjust plans as needed
- Celebrate completions

---

## 10. MAINTENANCE AND GOVERNANCE

### Template Maintenance

**Review Frequency:** Annual or when assessment methodology changes

**Update Triggers:**
- New compliance frameworks or regulations
- Changes to scoring methodology
- Organizational structure changes
- Lessons learned from audits
- User feedback

**Version Control:**
- Maintain version history
- Document changes in each version
- Archive previous versions
- Communicate updates to users

### Governance

**Template Owner:** Compliance Audit Team or CISO

**Approval Authority:**
- Template changes: CISO
- Scoring criteria changes: CISO + Compliance Officer
- Major methodology changes: Executive leadership

**User Training:**
- Train assessors on methodology
- Provide scoring calibration
- Share best practices
- Review sample assessments

**Quality Assurance:**
- Peer review of assessments
- Spot-check scoring consistency
- Validate evidence quality
- Review remediation effectiveness

---

## SKILL METADATA

**Dependencies:**
- Requires: All 7 compliance skills (for assessment)
- Used by: Executive leadership, compliance team, auditors
- Supports: Continuous improvement, audit preparation, strategic planning

**Applicable Frameworks:**
- NIST Cybersecurity Framework
- ISO 27001
- SOC 2
- HIPAA
- FedRAMP
- GDPR/CCPA
- NIST 800-171 / CMMC

**Lifecycle Stage:** Operational - Continuous assessment and improvement

**Update Frequency:** Templates reviewed annually; assessments conducted quarterly/annually

**Skill Maturity:** Production-ready assessment methodology

---

## DOCUMENT CONTROL

- **Skill Version:** 1.0
- **Created:** 2025-02-07
- **Last Updated:** 2025-02-07
- **Owner:** Compliance Audit Team
- **Review Frequency:** Annual or as needed
- **Change Log:**
  - 2025-02-07: Initial skill creation with 4 templates and 1 reference document

---

## QUICK REFERENCE

### Template Selection Guide

| Use Case | Template | Frequency | Audience |
|----------|----------|-----------|----------|
| Quarterly compliance review | package-maturity-assessment.md | Quarterly | Compliance team, CISO |
| After doc updates or pre-audit | cross-package-dependency-review.md | As needed | Compliance team |
| Strategic planning | compliance-roadmap-checklist.md | Annual | Executive leadership |
| Executive/board reporting | comprehensive-compliance-review.md | Annual | CEO, CISO, Board |
| Scoring consistency | reference/audit-scoring-criteria.md | Always | All assessors |

### Key Deliverables

From any assessment, expect:
- Completed checklist with status, evidence, findings
- Gap analysis with priorities (HIGH/MEDIUM/LOW)
- Remediation plan with owners and target dates
- Executive summary with key findings and recommendations
- Dependency maps and architecture diagrams (where applicable)
- Compliance framework readiness assessment

### Success Metrics

**Healthy compliance program:**
- Overall maturity score: 7+ (STRONG or EXCELLENT)
- All critical gaps remediated within 90 days
- Cross-package integration score: 8+
- Audit readiness: All evidence documented and accessible
- Operational realism: No unrealistic claims
- Framework alignment: Ready for audit when business case supports
