# compliance-research

## 1. Skill Overview

**Name:** compliance-research
**Type:** Reference Documentation & Research Context
**Category:** Research and Decision Rationale

The compliance-research skill provides authoritative research documentation and decision rationale for all seven federal compliance skills. This skill contains research documents that explain the "why" behind each compliance skill's design, mapping organizational documentation to official regulatory sources, frameworks, and industry standards.

**Key Distinction:** This skill produces RESEARCH DOCUMENTATION, not operational documents. Outputs explain requirements sources, compliance mappings, and design rationale rather than creating executable policies or procedures.

## 2. Purpose and Value Proposition

### What This Skill Does
- Documents authoritative sources (NIST, ISO, GDPR, HIPAA, etc.) for each compliance skill
- Maps organizational documents to specific regulatory requirements and framework controls
- Provides compliance assessment and gap analysis for each skill area
- Explains design decisions and rationale for document structure and content
- Validates that documentation meets or exceeds official requirements

### What This Skill Does NOT Do
- Does not create operational policies, procedures, or templates (those are created by skills 1-7)
- Does not implement security controls or technical configurations
- Does not provide legal advice or regulatory interpretation
- Does not replace official guidance from regulatory bodies

### Value Proposition
**For Organizations:**
- Demonstrates due diligence in requirements analysis
- Provides audit trail linking documentation to authoritative sources
- Supports certification readiness (ISO 27001, SOC 2, FedRAMP)
- Enables informed decision-making about compliance investments

**For Auditors and Assessors:**
- Clear mapping of controls to regulatory requirements
- Transparent rationale for compliance approach
- Evidence of thorough requirements analysis
- Traceability from frameworks to implemented controls

## 3. Scope and Boundaries

### In Scope
- Research documentation for Skills 1-7 (Internal Compliance, Security & Compliance Handbook, Data Handling & Privacy, Federal & Government, Cloud Platform Security, Business & Operations, Contracts & Risk)
- Mapping to authoritative sources: NIST (CSF, 800-53, 800-171), ISO 27001/27002, SOC 2, GDPR, HIPAA, CCPA/CPRA, FAR/DFARS
- Compliance assessment and requirement validation
- Decision rationale and design justification
- Gap analysis and recommendations

### Out of Scope
- Creation of operational documents (use skills 1-7)
- Legal interpretation or advice
- Technical implementation details
- Client-specific customization
- Training materials or user guides

## 4. Inputs

### Required Context
- Skill number and name (1-7)
- Target regulatory frameworks (e.g., NIST 800-171, ISO 27001, SOC 2)
- Organizational context (industry, risk profile, compliance goals)

### Optional Context
- Specific regulatory requirements or controls to emphasize
- Known compliance gaps or concerns
- Certification timeline or audit schedule
- Geographic or jurisdictional considerations

### Source Materials
- Official framework publications (NIST SP 800-53, ISO 27001, etc.)
- Regulatory guidance documents
- Industry best practice references
- Existing organizational documentation for mapping validation

## 5. Outputs

### Primary Output: Research Documents
For each skill (1-7), produces a comprehensive research document containing:

**Structure:**
1. Purpose and scope statement
2. Official sources and requirements (with citations)
3. Framework-specific compliance mappings
4. Document-by-document requirement validation
5. Compliance summary (requirements met/partially met/not met)
6. Overall assessment and recommendations

**Format:** Markdown documents organized in reference/ subdirectory

**Naming Convention:**
- `internal-compliance-research.md` (Skill 1)
- `security-compliance-handbook-research.md` (Skill 2)
- `data-handling-privacy-research.md` (Skill 3)
- `federal-government-research.md` (Skill 4)
- `cloud-platform-security-research.md` (Skill 5)
- `business-operations-research.md` (Skill 6)
- `contracts-risk-research.md` (Skill 7)

### Output Characteristics
- **Authoritative:** All claims cite official sources
- **Traceable:** Clear mapping from requirement to document
- **Comprehensive:** Covers all major frameworks relevant to the skill
- **Actionable:** Includes gap analysis and recommendations
- **Professional:** Suitable for audit and certification review

## 6. Process and Workflow

### Standard Workflow

**Phase 1: Requirements Identification**
1. Identify skill scope and document set
2. Research applicable frameworks and regulations
3. Extract specific requirements and controls
4. Document official sources with citations

**Phase 2: Compliance Mapping**
1. Map each skill document to framework requirements
2. Validate coverage of all applicable controls
3. Document requirement satisfaction (yes/partial/no)
4. Identify gaps or areas for improvement

**Phase 3: Assessment and Documentation**
1. Synthesize compliance summary
2. Provide overall assessment
3. Generate recommendations
4. Document decision rationale

**Phase 4: Quality Assurance**
1. Verify citation accuracy
2. Validate mapping completeness
3. Review for consistency across skills
4. Ensure professional presentation

### Integration with Other Skills
- Provides research foundation for all operational skills (1-7)
- Referenced by compliance-audit skill for audit preparation
- Supports compliance-advisor skill with authoritative guidance

## 7. Quality Standards

### Documentation Quality
- **Accuracy:** All citations link to official, current sources
- **Completeness:** All major frameworks relevant to the skill are covered
- **Clarity:** Technical requirements explained in accessible language
- **Consistency:** Uniform structure and terminology across all research documents

### Compliance Mapping Quality
- **Specificity:** Maps to specific control numbers/articles (e.g., AC-1, A.9.1.1, CC6.1)
- **Bidirectional:** Documents which controls are addressed, and which documents address each control
- **Validated:** Mapping verified against official control descriptions
- **Transparent:** Clear statement of requirement satisfaction status

### Professional Standards
- Suitable for external audit and certification review
- Free of proprietary or sensitive information
- Maintains vendor-neutral tone
- Uses industry-standard terminology

## 8. Dependencies and Prerequisites

### External Dependencies
- Access to official framework publications (NIST, ISO, AICPA, regulatory bodies)
- Current versions of referenced standards and regulations
- Understanding of organizational compliance goals and context

### Internal Dependencies
- Completed operational documents from skills 1-7 (for mapping validation)
- Organizational risk assessment and compliance strategy
- Knowledge of industry and regulatory environment

### Required Expertise
- Familiarity with major compliance frameworks (NIST, ISO, SOC 2)
- Understanding of regulatory landscape (GDPR, HIPAA, FAR/DFARS)
- Document mapping and gap analysis methodology
- Technical writing and research documentation skills

## 9. Success Criteria

### Measurable Outcomes
- **Coverage:** 100% of skill documents mapped to relevant framework requirements
- **Accuracy:** All citations verified against official sources
- **Completeness:** All major applicable frameworks addressed
- **Clarity:** Assessors can trace any requirement to implementing document

### Quality Indicators
- Audit-ready documentation suitable for ISO 27001, SOC 2, or FedRAMP assessments
- Clear gap analysis with actionable recommendations
- Consistent structure and quality across all seven research documents
- Professional presentation suitable for board or executive review

### Validation Methods
- Peer review by compliance subject matter experts
- Cross-reference validation (requirements match official sources)
- Mapping completeness check (all documents covered, all frameworks addressed)
- Usability testing with internal or external auditors

## 10. Examples and Templates

### Example: Research Document Structure

```markdown
# SKILL X: [SKILL NAME] RESEARCH DOCUMENT

## Purpose
[Brief statement of research scope and validation goal]

## Scope
[List of documents covered by this skill]

## Official Sources and Requirements

### [Framework Name 1]
**Source:** [Organization]
**Document/Standard:** [Official title and citation]
**Key Requirements:** [Relevant sections]
**Compliance Assessment:** [How skill documents address these requirements]

### [Framework Name 2]
[Repeat structure]

## Document-by-Document Requirement Mapping

### [Document Name]
**Relevant Sources:**
- Framework 1: Control X, Control Y
- Framework 2: Article Z

**Requirement Met:** Yes/Partial/No

## Compliance Summary
- Requirements Addressed: [List]
- Requirements Partially Met: [Count]
- Requirements Not Met: [Count]

## Overall Assessment
[Synthesis of compliance posture and recommendations]
```

### Example: Compliance Mapping Entry

```markdown
### 03 Access Control Policy
- NIST CSF: PR.AC-1, PR.AC-4
- NIST 800-53: AC-1, AC-2, AC-3, AC-6
- ISO 27001: A.9.1.1, A.9.2.1
- SOC 2: CC6.1, CC6.2
- Requirement Met: Yes

**Rationale:** The Access Control Policy establishes least privilege,
role-based access control, and account management procedures that
directly satisfy access control requirements across all four frameworks.
```

### Example: Gap Analysis Format

```markdown
## Gap Analysis

**Gap:** Privacy Notice does not explicitly address CCPA right to opt-out
of sale or sharing.

**Impact:** Partial compliance with CCPA disclosure requirements.

**Recommendation:** Add section 5.3 to Privacy Notice template addressing
opt-out rights and mechanisms, consistent with CCPA §1798.120.

**Priority:** Medium (required for California consumer-facing services)
```

---

## Usage Guidelines

**When to Use This Skill:**
- During initial compliance program design
- Before ISO 27001, SOC 2, or FedRAMP audits
- When evaluating new regulatory requirements
- To justify compliance investments to leadership
- During gap assessments or compliance reviews

**How to Use Research Documents:**
- As evidence of due diligence for auditors
- To support compliance roadmap prioritization
- For staff training on regulatory requirements
- As input to compliance-advisor queries
- To validate completeness of operational documents (skills 1-7)

**Maintenance:**
- Review annually or when frameworks update
- Update after major regulatory changes (e.g., new NIST SP revisions)
- Validate after significant organizational document changes
- Refresh before certification audits
