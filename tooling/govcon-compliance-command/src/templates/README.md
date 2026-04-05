# Federal Compliance Skills

**Last Updated:** 2026-02-07
**Version:** 1.0
**Status:** Production Ready

---

## What Is This

The Federal Compliance Skills system is a comprehensive, modular compliance documentation framework designed for small business federal contractors. It provides 10 specialized "skills" (self-contained documentation packages) covering security governance, operational compliance, data privacy, federal contracting requirements, cloud security, business operations, contracts management, audit methodology, research intelligence, and usage guidance.

This system enables organizations to:
- Establish and maintain enterprise-grade compliance programs
- Respond to federal security questionnaires and RFPs
- Prepare for SOC 2, ISO 27001, FedRAMP, and HIPAA audits
- Manage federal contracts from acquisition through closeout
- Implement privacy controls for GDPR, CCPA, and HIPAA
- Deploy secure cloud platforms (Google Workspace, GCP, Vertex AI)
- Conduct internal compliance assessments and gap analysis

The system is built on three universal principles:
1. **Data-as-Regulated**: Treat all data as regulated by default
2. **No Sensitive Data in Logs**: Prohibit PII, PHI, CUI, secrets in logs and monitoring
3. **Role Combination**: Acknowledge small business realities with compensating controls

---

## Quick Start

### For New Users

1. **Start with Governance**: Read `security-governance/templates/security-compliance-handbook.md` to understand the master governance framework
2. **Review Universal Principles**: Read `shared-reference/universal-principles.md` to understand foundational requirements
3. **Identify Your Context**: Determine which skills apply to your operational context (internal, commercial, federal, healthcare, international)
4. **Apply Skills in Order**: Follow the lifecycle progression (see LIFECYCLE.md)
5. **Customize Templates**: Replace placeholders with your organization's information
6. **Maintain Documentation**: Follow review cycles documented in each skill

### For Federal Contractors

1. **Read security-governance skill**: Master governance authority
2. **Read government-contracting skill**: Federal-specific requirements (NIST, CUI, mandatory reporting)
3. **Read internal-compliance skill**: Operational security procedures (IR, BC/DR, IAM)
4. **Read data-handling-privacy skill**: Privacy and data lifecycle management
5. **Read cloud-platform-security skill**: Platform implementation for FedRAMP-authorized infrastructure
6. **Complete compliance-audit assessment**: Identify gaps and create remediation plan

### For Compliance Teams

- Use `compliance-audit/` templates for quarterly and annual assessments
- Reference `compliance-research/` for regulatory intelligence and framework updates
- Reference `compliance-usage/` for implementation examples and usage guidance
- Use `shared-reference/compliance-framework-map.md` for multi-framework alignment

---

## Skills Overview Table

| Skill | Templates | Reference | Purpose | Status |
|-------|-----------|-----------|---------|--------|
| **security-governance** | 1 | 0 | Master governance authority establishing security and compliance framework for all operations | Active |
| **internal-compliance** | 21 | 0 | Operational security procedures: IR, IAM, SDLC, BC/DR, logging, network, encryption, physical security | Active |
| **data-handling-privacy** | 7 | 0 | Privacy management, data classification, lifecycle management, anonymization, breach notification, retention | Active |
| **government-contracting** | 9 | 0 | Federal-specific overlays: NIST alignment, CUI handling, mandatory reporting, FOIA, contingency, procurement | Active |
| **cloud-platform-security** | 7 | 0 | Platform implementations for Google Workspace, GCP, Vertex AI with IAM, DLP, monitoring, AI governance | Active |
| **business-operations** | 10 | 0 | Business processes integrating security: onboarding/offboarding, QA, training, project management, SLAs | Active |
| **contracts-risk-assurance** | 10 | 0 | Contract templates and risk management: MSA, SOW, DPA, BAA, NDA, security questionnaires, vendor assessments | Active |
| **compliance-audit** | 4 | 1 | Audit methodology and assessment frameworks for evaluating compliance program maturity and readiness | Active |
| **compliance-research** | 0 | 7 | Regulatory intelligence and research for 7 skills providing framework updates and best practices | Active |
| **compliance-usage** | 0 | 7 | Implementation examples and usage guidance explaining how, when, and why to use each skill | Active |

**Total:** 69 templates, 15 reference documents, 10 skills, 4 shared reference documents

---

## Directory Structure

```
federal-compliance-skills/
├── README.md (this file)
├── LIFECYCLE.md (governance hierarchy and skill lifecycle)
├── PLAYBOOK.md (10 practical usage scenarios)
├── DISPOSITION.md (source-to-artifact traceability)
│
├── shared-reference/
│   ├── universal-principles.md (3 foundational principles applied across all skills)
│   ├── package-dependency-matrix.md (skill dependency mapping and integration points)
│   ├── compliance-framework-map.md (NIST, ISO, SOC 2, HIPAA, FedRAMP, GDPR/CCPA mapping)
│   └── retention-schedule.md (consolidated retention requirements across all contexts)
│
├── security-governance/
│   ├── SKILL.md (master governance skill definition)
│   └── templates/
│       └── security-compliance-handbook.md (15-section comprehensive handbook)
│
├── internal-compliance/
│   ├── SKILL.md
│   └── templates/ (21 operational policies and procedures)
│       ├── 01-information-security-policy.md
│       ├── 02-acceptable-use-policy.md
│       ├── 03-access-control-policy.md
│       ├── 04-incident-response-plan.md
│       ├── 05-business-continuity-plan.md
│       ├── 06-disaster-recovery-plan.md
│       ├── 07-change-management-procedure.md
│       ├── 08-vulnerability-management-procedure.md
│       ├── 09-patch-management-procedure.md
│       ├── 10-backup-recovery-procedure.md
│       ├── 11-encryption-key-management.md
│       ├── 12-password-policy.md
│       ├── 13-remote-access-policy.md
│       ├── 14-mobile-device-policy.md
│       ├── 15-byod-policy.md
│       ├── 16-asset-management-policy.md
│       ├── 17-vendor-management-policy.md
│       ├── 18-physical-security-policy.md
│       ├── 19-security-awareness-training-program.md
│       ├── 20-audit-logging-monitoring-policy.md
│       └── 21-compliance-management-framework.md
│
├── data-handling-privacy/
│   ├── SKILL.md
│   └── templates/ (7 privacy and data lifecycle policies)
│       ├── 01-data-handling-standard.md
│       ├── 02-privacy-management-policy.md
│       ├── 03-data-lifecycle-management.md
│       ├── 04-data-anonymization-pseudonymization.md
│       ├── 05-privacy-notice.md
│       ├── 06-breach-notification-procedure.md
│       └── 07-records-management-policy.md
│
├── government-contracting/
│   ├── SKILL.md
│   └── templates/ (9 federal overlay templates)
│       ├── 01-capability-statement.md
│       ├── 02-government-readiness-statement.md
│       ├── 03-federal-data-handling-foia-policy.md
│       ├── 04-contingency-plan-government-edition.md
│       ├── 05-nist-lite-alignment-document.md
│       ├── 06-mandatory-reporting-procedure.md
│       ├── 07-closeout-offboarding-procedure-gov.md
│       ├── 08-roles-responsibilities-matrix-gov.md
│       └── 09-procurement-subcontractor-policy.md
│
├── cloud-platform-security/
│   ├── SKILL.md
│   └── templates/ (7 cloud platform implementation templates)
│       ├── 01-cloud-workspace-security-configuration.md
│       ├── 02-cloud-platform-security-standards.md
│       ├── 03-cloud-iam-policy.md
│       ├── 04-cloud-vertex-ai-governance.md
│       ├── 05-cloud-data-loss-prevention-configuration.md
│       ├── 06-cloud-security-monitoring-standards.md
│       └── 07-cloud-partner-compliance-statement.md
│
├── business-operations/
│   ├── SKILL.md
│   └── templates/ (10 business process templates)
│       ├── 01-employee-onboarding-procedure.md
│       ├── 02-employee-offboarding-procedure.md
│       ├── 03-project-initiation-template.md
│       ├── 04-client-onboarding-procedure.md
│       ├── 05-service-level-agreement-template.md
│       ├── 06-quality-assurance-procedure.md
│       ├── 07-document-control-procedure.md
│       ├── 08-training-development-plan.md
│       ├── 09-performance-management-procedure.md
│       └── 10-communication-collaboration-standards.md
│
├── contracts-risk-assurance/
│   ├── SKILL.md
│   └── templates/ (10 contract and risk templates)
│       ├── 01-master-services-agreement-template.md
│       ├── 02-statement-of-work-template.md
│       ├── 03-data-processing-agreement-template.md
│       ├── 04-business-associate-agreement-template.md
│       ├── 05-non-disclosure-agreement-template.md
│       ├── 06-security-questionnaire-response-template.md
│       ├── 07-compliance-audit-checklist.md
│       ├── 08-risk-assessment-template.md
│       ├── 09-vendor-security-assessment-template.md
│       └── 10-incident-response-tabletop-exercise-guide.md
│
├── compliance-audit/
│   ├── SKILL.md
│   ├── templates/ (4 audit methodology templates)
│   │   ├── package-maturity-assessment.md
│   │   ├── cross-package-dependency-review.md
│   │   ├── compliance-roadmap-checklist.md
│   │   └── comprehensive-compliance-review.md
│   └── reference/
│       └── audit-scoring-criteria.md
│
├── compliance-research/
│   ├── SKILL.md
│   └── reference/ (7 research documents)
│       ├── internal-compliance-research.md
│       ├── security-compliance-handbook-research.md
│       ├── data-handling-privacy-research.md
│       ├── federal-government-research.md
│       ├── cloud-platform-security-research.md
│       ├── business-operations-research.md
│       └── contracts-risk-research.md
│
└── compliance-usage/
    ├── SKILL.md
    └── reference/ (7 usage guides)
        ├── internal-compliance-usage.md
        ├── security-compliance-handbook-usage.md
        ├── data-handling-privacy-usage.md
        ├── government-contracting-usage.md
        ├── cloud-platform-security-usage.md
        ├── business-operations-usage.md
        └── advanced-compliance-usage.md
```

---

## Universal Principles

All skills apply three foundational principles across all operations:

### 1. Data-as-Regulated Principle
Organizations should treat all client, customer, and project data as regulated by default unless explicitly classified otherwise. This ensures maximum protection in all jurisdictions and avoids inadvertent non-compliance.

**Implementation**: Apply regulated-data controls (encryption, access control, monitoring, retention, disposal) to all data by default.

### 2. No Sensitive Data in Logs Principle
Organizations must prohibit storing, transmitting, or capturing sensitive data (PII, PHI, PCI, CUI, credentials, secrets) in logs, debugging output, command-line history, screenshots, tickets, monitoring systems, or prompts sent to external AI systems.

**Implementation**: Implement masking, filtering, anonymization, or tokenization controls in all logging and monitoring systems. Reference `data-handling-privacy/templates/04-data-anonymization-pseudonymization.md` for authoritative techniques.

### 3. Role Combination for Small Business Operations
Small organizations may combine roles (CISO, CIO, CTO, Privacy Officer, Compliance Officer, Records Officer) due to organizational size. This creates potential conflicts requiring compensating controls.

**Implementation**: Document role combination, implement separation of duties where feasible, use external auditors and MSSPs for independent oversight, conduct annual effectiveness reviews.

**Full Documentation**: See `shared-reference/universal-principles.md`

---

## File Inventory

### By Category

| Category | Count | Description |
|----------|-------|-------------|
| **Skills** | 10 | SKILL.md files defining each skill's purpose, scope, inputs, outputs, dependencies |
| **Templates** | 69 | Operational templates for policies, procedures, plans, contracts, and standards |
| **Reference** | 15 | Research, usage guides, and audit methodology supporting documents |
| **Shared Reference** | 4 | Universal principles, dependency matrix, framework map, retention schedule |
| **Composite Docs** | 4 | README, LIFECYCLE, PLAYBOOK, DISPOSITION (this layer) |

**Total Files:** 102 markdown documents

### By Skill

| Skill | Templates | Reference | Total |
|-------|-----------|-----------|-------|
| security-governance | 1 | 0 | 1 |
| internal-compliance | 21 | 0 | 21 |
| data-handling-privacy | 7 | 0 | 7 |
| government-contracting | 9 | 0 | 9 |
| cloud-platform-security | 7 | 0 | 7 |
| business-operations | 10 | 0 | 10 |
| contracts-risk-assurance | 10 | 0 | 10 |
| compliance-audit | 4 | 1 | 5 |
| compliance-research | 0 | 7 | 7 |
| compliance-usage | 0 | 7 | 7 |
| **Shared reference** | - | 4 | 4 |

---

## Governance

The Federal Compliance Skills system follows a hierarchical governance model with **security-governance** as the master governance authority.

### Governance Hierarchy

```
Level 0 (ROOT): security-governance
              ↓
Level 1: internal-compliance, data-handling-privacy
              ↓
Level 2: cloud-platform-security, business-operations
              ↓
Level 3: contracts-risk-assurance, government-contracting
              ↓
Level 4: compliance-audit, compliance-research, compliance-usage
```

### Authority by Domain

| Domain | Authoritative Skill | Implementation Skills |
|--------|---------------------|----------------------|
| Master Governance | security-governance | All skills |
| Data Classification & Privacy | data-handling-privacy | internal-compliance, cloud-platform-security, government-contracting |
| Operational Security | internal-compliance | cloud-platform-security, business-operations |
| Federal Requirements | government-contracting | contracts-risk-assurance, business-operations |
| Platform Implementation | cloud-platform-security | contracts-risk-assurance |
| Audit & Validation | compliance-audit | All skills |

### Policy Conflict Resolution

When conflicts arise between skills:
1. Federal requirements override general controls when more stringent
2. Privacy requirements in data-handling-privacy override other skills where applicable
3. Client contracts may impose stricter controls; the strictest requirement applies
4. All exceptions require CISO approval and risk-register documentation

**Full Documentation**: See `LIFECYCLE.md` and `shared-reference/package-dependency-matrix.md`

---

## Usage

### Common Use Cases

1. **Federal Proposal Response**: Use government-contracting skill for capability statement, readiness statement, NIST alignment
2. **Security Questionnaire**: Use contracts-risk-assurance Template 06 with evidence from security-governance, internal-compliance, cloud-platform-security
3. **SOC 2 Preparation**: Use compliance-audit comprehensive review; provide security-governance handbook and internal-compliance policies as evidence
4. **Employee Onboarding**: Use business-operations Template 01; integrate security-awareness-training from internal-compliance
5. **Data Breach Response**: Use internal-compliance Template 04 (IR); invoke data-handling-privacy Template 06 (breach notification); if federal, invoke government-contracting Template 06 (mandatory reporting)
6. **Vendor Selection**: Use business-operations vendor management procedure; use contracts-risk-assurance Template 09 for security assessment
7. **Client DPA/BAA**: Use contracts-risk-assurance Template 03 (DPA) or Template 04 (BAA)
8. **Federal Contract Closeout**: Use government-contracting Template 07
9. **Quarterly Compliance Review**: Use compliance-audit Template 01 (package maturity assessment)
10. **Annual Audit Preparation**: Use compliance-audit Template 04 (comprehensive compliance review)

**Full Scenarios**: See `PLAYBOOK.md` for 10 detailed usage scenarios

### Implementation Guidance

Each skill includes:
- **SKILL.md**: Defines purpose, scope, process, inputs, outputs, dependencies
- **Templates**: Customizable documents with placeholders for organization-specific information
- **Cross-References**: Links to related skills and authoritative sources

Replace these placeholders in all templates:
- `[ORGANIZATION_NAME]` → Your organization's full legal name
- `[ORGANIZATION_ABBREVIATION]` → Your organization's abbreviation
- `[COMPANY_NAME]` → Marketing/brand name
- `[CONTACT_NAME]`, `[CONTACT_EMAIL]`, `[CONTACT_PHONE]` → Actual contact information
- `[DOCUMENT_DATE]` → Document creation/update date
- `[CEO_NAME]`, `[CISO_NAME]`, `[COMPLIANCE_OFFICER_NAME]` → Personnel names
- All other bracketed placeholders

**Usage Examples**: See `compliance-usage/` skill for detailed implementation guidance

---

## Maintenance

### Review Cycles

**Quarterly:**
- Review universal principles for continued applicability
- Update compliance-research with regulatory changes
- Conduct package maturity assessment (compliance-audit)

**Annually:**
- Review all policies in internal-compliance, data-handling-privacy, security-governance
- Update compliance framework map with new standards
- Conduct comprehensive compliance review (compliance-audit)
- Review and update government-contracting capability statement and certifications

**Triggered:**
- **Regulatory Change**: Update affected skills immediately
- **Major Incident**: Update incident response, breach notification, mandatory reporting as needed
- **Business Change**: Update organizational structure, roles, capabilities
- **Client Requirements**: Add client-specific requirements to contracts-risk-assurance
- **Audit Findings**: Remediate gaps identified in compliance-audit

### Version Control

Each template and SKILL.md includes document control section:
- **Version**: Semantic versioning (1.0, 1.1, 2.0)
- **Last Updated**: Date of last modification
- **Owner**: Responsible role (CISO, Compliance Officer, etc.)
- **Review Frequency**: Quarterly, annual, or as-needed
- **Classification**: Internal Use, Confidential, etc.
- **Retention**: Permanent (governance), 3 years (operational), or per retention schedule

### Update Propagation

When updating a skill, follow dependency chain:

**security-governance changes** → Review ALL skills
**data-handling-privacy changes** → Review internal-compliance, cloud-platform-security, government-contracting, contracts-risk-assurance
**internal-compliance changes** → Review cloud-platform-security, contracts-risk-assurance, business-operations
**government-contracting changes** → Review contracts-risk-assurance, business-operations

**Full Documentation**: See `shared-reference/package-dependency-matrix.md` for complete update propagation rules

---

## License / Attribution

**Copyright**: This compliance documentation system was developed for small business federal contractors and is maintained as internal operational documentation.

**Usage Rights**: Organizations using this system should:
- Customize all templates with organization-specific information
- Remove all placeholder text and examples
- Conduct legal review of all templates before operational use
- Maintain version control and document change history
- Follow review cycles and update triggers documented in each skill

**Disclaimer**: This documentation system provides templates and frameworks for compliance programs. It does not constitute legal advice, guarantee regulatory compliance, or replace professional audit services. Organizations should consult legal counsel, compliance professionals, and certified auditors as appropriate for their specific regulatory requirements.

**Third-Party Frameworks**: This system references and implements requirements from NIST, ISO, AICPA, HHS, European Union, and other standards bodies. These frameworks are the property of their respective organizations. This documentation system demonstrates alignment with these frameworks but does not grant certification or authorization.

**Attribution**: When using templates in proposals or client deliverables, organizations may state:
- "Security and compliance program aligned with [framework]"
- "Controls implemented based on [framework] requirements"
- "Compliance documentation follows industry best practices"

Do NOT claim certification or compliance without independent third-party audit and formal authorization.

---

## Contact & Support

**System Maintainer**: Chief Information Security Officer (CISO) / Compliance Officer
**Review Authority**: Chief Executive Officer (CEO)
**Technical Implementation**: Technical Director / IT Manager

For questions, issues, or contributions:
1. Review relevant SKILL.md file for skill-specific guidance
2. Reference shared-reference/ documents for cross-skill questions
3. Consult compliance-usage/ for implementation examples
4. Engage compliance-audit/ for assessment methodology questions

---

**Document Control**
- **Version:** 1.0
- **Created:** 2026-02-07
- **Last Updated:** 2026-02-07
- **Owner:** CISO / Compliance Officer
- **Review Frequency:** Quarterly (structure), Annual (comprehensive)
- **Classification:** Internal Use
- **Retention:** Permanent (system documentation)
