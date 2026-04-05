# Package Dependency Matrix
**Purpose:** Master dependency mapping showing which skills depend on which other skills
**Last Updated:** 2026-02-07
**Authority:** security-governance skill
**Scope:** All federal compliance skills

---

## Overview

This document provides a comprehensive dependency matrix for the federal compliance skill ecosystem. It shows:
- Hierarchical structure with security-governance at the root
- Upstream and downstream dependencies between skills
- Integration points and data flows
- Authority mapping (which skill is authoritative for what)
- Circular dependency resolution

Use this matrix to:
- Understand skill relationships and dependencies
- Navigate cross-skill references correctly
- Identify authoritative sources for specific domains
- Plan updates that affect multiple skills
- Resolve conflicts between skills

---

## Dependency Hierarchy

### Visual Representation

```
                   +----------------------------------------+
                   | SECURITY-GOVERNANCE                     |
                   | (Master Governance / Regulatory         |
                   |  Source of Truth)                      |
                   +-------------------+--------------------+
                                       |
                                       v
                  +--------------------------------------+
                  | INTERNAL-COMPLIANCE                  |
                  | (Operational Security: IR, IAM,      |
                  |  SDLC, Logging, Network, AI AUP)     |
                  +-------------------+------------------+
                                      | \
                                      |  \
                                      v   v
     +------------------------+     +---------------------------+
     | DATA-HANDLING-PRIVACY  |     | CLOUD-PLATFORM-SECURITY   |
     | (Minimization, DPA,    |     | (Platform IAM, Workspace, |
     |  Anonymization, etc.)  |     |  AI, Logging Controls)    |
     +-----------+------------+     +-------------+-------------+
                 |                                |
                 v                                v
      +------------------------+      +----------------------------+
      | BUSINESS-OPERATIONS    |      | CONTRACTS-RISK-ASSURANCE   |
      | (Onboarding, Risk      |      | (MSA/SOW, DPA/BAA, Audit,  |
      |  Assessment, SOPs)     |      |  Risk, Vendor Assessment)  |
      +-----------+------------+      +-------------+--------------+
                  |                                 |
                  +---------------+-----------------+
                                  |
                                  v
                      +---------------------------+
                      | GOVERNMENT-CONTRACTING    |
                      | (NIST Lite, FOIA,         |
                      |  Mandatory Reporting,     |
                      |  Federal Offboarding)     |
                      +---------------------------+
```

### Textual Hierarchy

**Level 0 (Root):**
- security-governance: Master governance authority for all policies, frameworks, and compliance requirements

**Level 1 (Operational Baseline):**
- internal-compliance: Operational procedures implementing governance requirements
- data-handling-privacy: Authoritative for data classification, privacy, retention, anonymization

**Level 2 (Platform & Operations):**
- cloud-platform-security: Platform-specific implementations (Google Workspace, GCP, Vertex AI)
- business-operations: Business process integration of security and privacy requirements

**Level 3 (Contractual & Risk):**
- contracts-risk-assurance: Contract templates and risk management aligned with governance and privacy
- government-contracting: Federal-specific overlays for government contracts

**Level 4 (Support Functions):**
- compliance-audit: Cross-skill audit and validation templates
- compliance-research: Research and external compliance intelligence
- compliance-usage: Usage examples and implementation guidance

---

## Dependency Table

| Skill | Depends On (Upstream) | Provides To (Downstream) | Authority For |
|-------|----------------------|-------------------------|---------------|
| security-governance | None (ROOT) | All skills | Master governance, policy framework, regulatory map, universal principles |
| internal-compliance | security-governance | All skills | Operational procedures (IR, IAM, logging, SDLC, backup, change management) |
| data-handling-privacy | security-governance | internal-compliance, cloud-platform-security, government-contracting, business-operations, contracts-risk-assurance | Data classification, privacy management, anonymization, retention schedules, breach notification |
| government-contracting | security-governance, internal-compliance, data-handling-privacy, cloud-platform-security | contracts-risk-assurance, business-operations | Federal requirements (NIST, CUI, FOIA, mandatory reporting), federal overlays |
| cloud-platform-security | security-governance, internal-compliance, data-handling-privacy | contracts-risk-assurance, business-operations | Platform implementations (Google Workspace, GCP, Vertex AI), DLP, IAM, logging |
| business-operations | security-governance, internal-compliance, data-handling-privacy | contracts-risk-assurance | Business processes, onboarding/offboarding, training, quality assurance |
| contracts-risk-assurance | security-governance, internal-compliance, data-handling-privacy, cloud-platform-security, government-contracting | business-operations | Contract templates (MSA, SOW, DPA, BAA), risk assessments, vendor evaluations, audit checklists |
| compliance-audit | All skills | security-governance (findings) | Audit templates, cross-skill validation, compliance assessment |
| compliance-research | External regulations, standards | All skills | Regulatory intelligence, framework updates, industry best practices |
| compliance-usage | All skills | Users | Implementation examples, usage guidance, deployment instructions |

---

## Integration Points

### security-governance → All Skills

**Integration Type:** Governance Authority

**Provides:**
- Master policy framework
- Universal principles (data-as-regulated, no sensitive data in logs, role combination)
- Consolidated regulatory map
- Policy conflict resolution rules
- Compliance language standards
- Governance oversight structure

**Referenced By:**
- All skills must reference security-governance as master governance authority
- All skills must apply universal principles
- All skills must follow policy hierarchy and conflict resolution

**Data Flow:**
- Universal principles → All skills
- Policy updates → All skills
- Risk register → All skills
- Compliance framework requirements → All skills

---

### security-governance → internal-compliance

**Integration Type:** Policy to Procedures

**Provides:**
- Security policies requiring operational procedures
- Access control requirements
- Incident response requirements
- Business continuity requirements
- Audit and monitoring requirements

**Referenced By:**
- internal-compliance Section 1 (Information Security Policy)
- internal-compliance Section 4 (Incident Response Plan)
- internal-compliance Section 20 (Audit Logging and Monitoring Policy)

**Data Flow:**
- Policy requirements → Operational procedures
- Compliance exceptions → Risk register

---

### security-governance → data-handling-privacy

**Integration Type:** Policy Framework

**Provides:**
- Privacy management framework
- Data protection principles
- Universal data-as-regulated principle
- Privacy governance structure

**Referenced By:**
- data-handling-privacy Template 01 (Data Handling Standard)
- data-handling-privacy Template 02 (Privacy Management Policy)

**Data Flow:**
- Privacy principles → Privacy procedures
- Breach notification requirements → Incident response

---

### internal-compliance → data-handling-privacy

**Integration Type:** Operational Implementation

**Provides:**
- Incident response procedures for breach notification
- Logging procedures using anonymization techniques
- Backup procedures aligned with retention schedules

**Referenced By:**
- data-handling-privacy Template 04 (Anonymization Standard) → internal-compliance Logging Policy
- data-handling-privacy Template 06 (Breach Notification) → internal-compliance Incident Response Plan
- data-handling-privacy Template 07 (Records Management) → internal-compliance Backup and Recovery

**Data Flow:**
- Anonymization techniques → Logging implementation
- Breach incidents → Breach notification procedures
- Retention requirements → Backup retention configuration

---

### internal-compliance → cloud-platform-security

**Integration Type:** Platform Implementation

**Provides:**
- Access control requirements for platform IAM
- Logging standards for platform logging
- Hardening requirements for platform configuration

**Referenced By:**
- cloud-platform-security Template 02 (GCP Security Standards) → internal-compliance Cloud Hardening
- cloud-platform-security Template 03 (GCP IAM Policy) → internal-compliance Access Control Policy
- cloud-platform-security Template 06 (Security Monitoring) → internal-compliance Logging Policy

**Data Flow:**
- Security standards → Platform configuration
- Access control requirements → IAM roles and permissions
- Logging requirements → Cloud logging configuration

---

### data-handling-privacy → cloud-platform-security

**Integration Type:** Data Protection Implementation

**Provides:**
- Data classification for DLP configuration
- Anonymization techniques for logging and AI/ML
- Retention requirements for platform retention policies

**Referenced By:**
- cloud-platform-security Template 05 (DLP Configuration) → data-handling-privacy Template 01 (Data Handling)
- cloud-platform-security Template 04 (Vertex AI Governance) → data-handling-privacy Template 04 (Anonymization)
- cloud-platform-security Template 01 (Workspace Security) → data-handling-privacy Template 07 (Retention)

**Data Flow:**
- Data classification → DLP policies
- Anonymization techniques → Vertex AI data processing
- Retention schedule → Google Workspace retention rules

---

### data-handling-privacy → government-contracting

**Integration Type:** Federal Overlay

**Provides:**
- General retention schedule overlaid by federal retention
- Privacy procedures overlaid by CUI handling requirements
- Breach notification procedures with federal timelines

**Referenced By:**
- government-contracting Template 03 (Federal Data Handling) → data-handling-privacy Template 01 (Data Handling)
- government-contracting Template 06 (Mandatory Reporting) → data-handling-privacy Template 06 (Breach Notification)
- government-contracting Template 07 (Closeout) → data-handling-privacy Template 07 (Records Management)

**Data Flow:**
- Federal retention overrides → Retention schedule adjustments
- CUI classification → Data handling procedures
- Federal breach timelines → Breach notification procedures

---

### government-contracting → contracts-risk-assurance

**Integration Type:** Federal Contract Requirements

**Provides:**
- Federal contract-specific requirements for MSAs and SOWs
- Federal data protection requirements for DPAs and BAAs
- Federal audit requirements for audit checklists

**Referenced By:**
- contracts-risk-assurance Template 01 (MSA) → government-contracting capabilities and certifications
- contracts-risk-assurance Template 04 (BAA) → government-contracting federal data handling
- contracts-risk-assurance Template 07 (Audit Checklist) → government-contracting NIST alignment

**Data Flow:**
- Federal requirements → Contract terms
- NIST alignment status → Audit scope
- Mandatory reporting → Contract compliance clauses

---

### cloud-platform-security → contracts-risk-assurance

**Integration Type:** Platform Security Evidence

**Provides:**
- Platform security configurations for security questionnaires
- DLP implementation for data protection claims
- Monitoring capabilities for SLA commitments

**Referenced By:**
- contracts-risk-assurance Template 06 (Security Questionnaire) → cloud-platform-security all templates
- contracts-risk-assurance Template 05 (SLA) → cloud-platform-security monitoring and availability

**Data Flow:**
- Platform security evidence → Security questionnaire responses
- Monitoring data → SLA performance reporting

---

### business-operations → contracts-risk-assurance

**Integration Type:** Operational Processes

**Provides:**
- Vendor management processes for vendor assessments
- Quality assurance processes for SLAs
- Training programs for compliance evidence

**Referenced By:**
- contracts-risk-assurance Template 09 (Vendor Security Assessment) → business-operations vendor management
- contracts-risk-assurance Template 05 (SLA) → business-operations quality assurance

**Data Flow:**
- Vendor due diligence → Vendor risk ratings
- Quality metrics → SLA performance data

---

### compliance-audit → All Skills

**Integration Type:** Cross-Skill Validation

**Provides:**
- Audit templates validating multi-skill compliance
- Gap identification across skills
- Remediation tracking

**Referenced By:**
- All skills referenced in comprehensive compliance review
- Dependency review validates cross-skill references

**Data Flow:**
- Audit findings → Skills requiring updates
- Gap analysis → Remediation plans
- Compliance status → security-governance risk register

---

### compliance-research → All Skills

**Integration Type:** External Intelligence

**Provides:**
- Regulatory change monitoring
- Framework updates and guidance
- Industry best practices

**Referenced By:**
- All skills benefit from regulatory intelligence
- Updates trigger skill reviews

**Data Flow:**
- Regulatory changes → Skill updates
- Framework guidance → Implementation adjustments
- Industry practices → Continuous improvement

---

### compliance-usage → Users

**Integration Type:** Implementation Guidance

**Provides:**
- Usage examples for all skills
- Deployment instructions
- Common patterns and pitfalls

**Referenced By:**
- Users implementing skills
- AI assistants providing guidance

**Data Flow:**
- Implementation examples → User adoption
- Lessons learned → Usage guidance updates

---

## Authority Mapping

| Domain | Authoritative Skill | Implementation Skills | Rationale |
|--------|---------------------|----------------------|-----------|
| Master Governance | security-governance | All skills | ROOT governance document |
| Data Classification | data-handling-privacy | internal-compliance, cloud-platform-security, government-contracting | Authoritative for what data is and how to classify it |
| Privacy Management | data-handling-privacy | internal-compliance, cloud-platform-security, contracts-risk-assurance | Authoritative for privacy rights, consent, breach notification |
| Anonymization / Pseudonymization | data-handling-privacy (Template 04) | internal-compliance (Logging), cloud-platform-security (Vertex AI) | Authoritative for de-identification techniques |
| Retention Schedules | data-handling-privacy (Template 07) | internal-compliance (Backup), cloud-platform-security (Workspace), government-contracting (Federal overlays) | Authoritative for retention periods; federal may override |
| Operational Security Procedures | internal-compliance | cloud-platform-security (platform implementation) | Authoritative for IR, IAM, logging, backup, change management |
| Federal Requirements | government-contracting | contracts-risk-assurance (federal contracts), business-operations (federal processes) | Authoritative for NIST, CUI, FOIA, mandatory reporting |
| Platform Implementation | cloud-platform-security | contracts-risk-assurance (security evidence), business-operations (platform usage) | Authoritative for Google Workspace, GCP, Vertex AI configuration |
| Contract Templates | contracts-risk-assurance | business-operations (contract execution) | Authoritative for MSA, SOW, DPA, BAA, SLA, NDA |
| Audit & Validation | compliance-audit | All skills (audit subjects) | Authoritative for cross-skill compliance validation |
| Regulatory Intelligence | compliance-research | All skills (regulation consumers) | Authoritative for external compliance information |
| Implementation Guidance | compliance-usage | Users (consumers) | Authoritative for usage examples and patterns |

---

## Circular Dependency Resolution

### Potential Circular References

**1. Incident Response ↔ Breach Notification**
- **Scenario:** internal-compliance Incident Response Plan references data-handling-privacy Breach Notification Procedure; Breach Notification references Incident Response Plan
- **Resolution:** internal-compliance is authoritative for incident response **process**; data-handling-privacy is authoritative for breach notification **requirements**. Incident response invokes breach notification when criteria met.
- **Pattern:** Process authority vs. Requirements authority

**2. Data Handling ↔ Platform Implementation**
- **Scenario:** data-handling-privacy Data Handling Standard references cloud-platform-security for implementation; cloud-platform-security references Data Handling Standard for requirements
- **Resolution:** data-handling-privacy is authoritative for **what** data handling is required; cloud-platform-security is authoritative for **how** to implement on platforms
- **Pattern:** Requirements authority vs. Implementation authority

**3. Governance ↔ Privacy**
- **Scenario:** security-governance establishes privacy principles; data-handling-privacy is authoritative for privacy procedures; both reference each other
- **Resolution:** security-governance is authoritative for **policy framework** and **principles**; data-handling-privacy is authoritative for **privacy-specific procedures** and **data handling details**
- **Pattern:** Framework authority vs. Domain authority

**4. Federal Contracting ↔ Retention**
- **Scenario:** government-contracting federal retention overrides data-handling-privacy general retention; but data-handling-privacy is authoritative for retention
- **Resolution:** data-handling-privacy Template 07 (Records Management) is authoritative **baseline**; government-contracting provides **federal overlay** that supersedes when more stringent
- **Pattern:** Baseline authority vs. Overlay authority

### Resolution Principles

1. **Hierarchy Precedence:** Higher-level skill (closer to root) provides framework; lower-level skill provides specifics
2. **Domain Authority:** Skill designated as authoritative for domain wins within that domain
3. **Overlay Pattern:** Baseline skill provides default; overlay skill supersedes for specific contexts
4. **Process vs. Requirements:** Process authority owns workflow; requirements authority owns criteria
5. **Implementation Deference:** Requirements skill specifies "what"; implementation skill specifies "how"

---

## Usage Patterns

### 1. Policy Creation or Update

**Workflow:**
1. Start with security-governance to understand governance framework
2. Check data-handling-privacy for data-related requirements
3. Check internal-compliance for operational procedures
4. Check government-contracting for federal overlays (if applicable)
5. Check cloud-platform-security for platform implementation
6. Update all affected skills consistently

**Skills Involved:** Varies by policy domain

---

### 2. Federal Contract Initiation

**Workflow:**
1. Review security-governance for baseline requirements
2. Review government-contracting for federal-specific requirements (NIST, CUI, FOIA, mandatory reporting)
3. Review internal-compliance for operational readiness (IR, BC/DR, IAM)
4. Review data-handling-privacy for federal data handling (CUI, PII, PHI)
5. Review cloud-platform-security for FedRAMP-authorized infrastructure
6. Review contracts-risk-assurance for federal contract templates (BAA, DPA, security questionnaire)
7. Review business-operations for federal engagement processes

**Skills Involved:** security-governance, government-contracting, internal-compliance, data-handling-privacy, cloud-platform-security, contracts-risk-assurance, business-operations

---

### 3. Security Incident → Breach Notification

**Workflow:**
1. internal-compliance Incident Response Plan: Detect, analyze, contain incident
2. Determine if incident involves personal information or regulated data
3. If yes, invoke data-handling-privacy Template 06 (Breach Notification Procedure)
4. If federal contract, invoke government-contracting Template 06 (Mandatory Reporting Procedure)
5. Follow breach notification timelines (HIPAA 60 days, GDPR 72 hours, federal 1-24 hours)
6. Document incident in security-governance risk register
7. Update contracts-risk-assurance (notify clients per contract terms)

**Skills Involved:** internal-compliance, data-handling-privacy, government-contracting, security-governance, contracts-risk-assurance

---

### 4. Data Classification → Platform Configuration

**Workflow:**
1. data-handling-privacy Template 01: Classify data (Public, Internal, Confidential, Restricted)
2. data-handling-privacy Template 01: Determine handling requirements (encryption, access, retention)
3. cloud-platform-security Template 05: Configure DLP policies based on classification
4. cloud-platform-security Template 03: Configure IAM roles based on access requirements
5. cloud-platform-security Template 01: Configure Workspace retention based on retention schedule
6. internal-compliance: Implement logging with anonymization per data-handling-privacy Template 04

**Skills Involved:** data-handling-privacy, cloud-platform-security, internal-compliance

---

### 5. Audit Preparation

**Workflow:**
1. compliance-audit: Select comprehensive compliance review template
2. Review security-governance for governance framework evidence
3. Review internal-compliance for operational procedure evidence (21 policies)
4. Review data-handling-privacy for privacy program evidence (7 templates)
5. Review government-contracting for federal compliance evidence (9 templates, if applicable)
6. Review cloud-platform-security for platform security evidence (7 templates)
7. Review contracts-risk-assurance for contract and risk evidence
8. Compile evidence, identify gaps, create remediation plan

**Skills Involved:** compliance-audit, all other skills

---

## Update Propagation

### When security-governance Updates:

**Impacted Skills:**
- All skills (governance authority)

**Actions Required:**
- Review all skills for alignment with updated governance
- Update cross-references to security-governance
- Communicate universal principle changes to all stakeholders
- Update compliance-audit templates to reflect governance changes

---

### When data-handling-privacy Updates:

**Impacted Skills:**
- internal-compliance (logging, backup, incident response)
- cloud-platform-security (DLP, retention, Vertex AI)
- government-contracting (federal data handling)
- contracts-risk-assurance (DPA, BAA)

**Actions Required:**
- Update internal-compliance references to data classification, retention, anonymization
- Update cloud-platform-security DLP and retention configurations
- Update government-contracting federal data handling procedures
- Update contracts-risk-assurance DPA and BAA templates

---

### When internal-compliance Updates:

**Impacted Skills:**
- cloud-platform-security (platform implementation of procedures)
- contracts-risk-assurance (SLA commitments based on procedures)
- business-operations (integration of security procedures)

**Actions Required:**
- Update cloud-platform-security platform implementations
- Update contracts-risk-assurance SLA terms
- Update business-operations integration procedures

---

### When government-contracting Updates:

**Impacted Skills:**
- contracts-risk-assurance (federal contract templates)
- business-operations (federal engagement processes)

**Actions Required:**
- Update contracts-risk-assurance federal contract terms
- Update business-operations federal contracting procedures

---

### When cloud-platform-security Updates:

**Impacted Skills:**
- contracts-risk-assurance (security questionnaire responses, SLA capabilities)
- business-operations (platform usage procedures)

**Actions Required:**
- Update contracts-risk-assurance security evidence
- Update business-operations platform procedures

---

## Validation Checklist

Use this checklist to validate dependency integrity:

**Cross-Reference Validation:**
- [ ] All skills reference security-governance as master governance authority
- [ ] All privacy/data handling references point to data-handling-privacy skill
- [ ] All operational security references point to internal-compliance skill
- [ ] All platform security references point to cloud-platform-security skill
- [ ] All federal requirements reference government-contracting skill

**Authority Validation:**
- [ ] No conflicting authority claims (two skills claiming to be authoritative for same domain)
- [ ] All domain authorities clearly documented in this matrix
- [ ] Overlay authorities (federal) properly acknowledge baseline authorities

**Circular Dependency Validation:**
- [ ] All circular references resolved using documented patterns
- [ ] Process vs. requirements authority clearly separated
- [ ] Baseline vs. overlay authority clearly separated

**Integration Point Validation:**
- [ ] All upstream dependencies documented
- [ ] All downstream dependencies documented
- [ ] All data flows documented
- [ ] All cross-skill workflows validated

---

**Document Control**
- **Version:** 1.0
- **Last Updated:** 2026-02-07
- **Owner:** CISO / Compliance Officer
- **Review Frequency:** Quarterly (when skills change), Annual (comprehensive)
- **Classification:** Internal Use
- **Retention:** Permanent (governance document)
