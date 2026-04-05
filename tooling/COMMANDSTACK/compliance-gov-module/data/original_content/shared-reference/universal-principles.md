# Universal Organizational Principles
**Purpose:** Foundational principles that apply universally across all organizational operations, systems, and engagements
**Last Updated:** 2026-02-07
**Authority:** security-governance skill
**Scope:** All compliance skills, all operational contexts

---

## Overview

The following principles apply universally across all organizational operations, systems, and engagements. These principles form the foundation for all policies, procedures, and security controls across all documentation skills.

These principles are **non-negotiable** and must be applied consistently across:
- Internal operations
- Commercial client engagements
- Federal government contracts
- Healthcare client engagements
- International operations
- All platform implementations
- All vendor relationships

---

## Core Universal Principles

### 1. Data-as-Regulated Principle

**Principle Statement:**
Organizations should treat all client, customer, and project data as regulated by default unless explicitly classified otherwise.

**Implementation Requirements:**
- Apply regulated-data controls to all data by default
- Implement encryption for data at rest and in transit
- Enforce access control and least-privilege principles
- Apply monitoring and logging controls
- Follow retention and disposition requirements
- Document classification decisions when data is explicitly classified as non-regulated

**Rationale:**
This principle ensures maximum protection of data in all jurisdictions and industries. By defaulting to the most stringent requirements, organizations avoid inadvertent non-compliance when data sensitivity is unclear or when regulatory requirements change.

**Skill Integration:**
- **security-governance skill:** Establishes this as master principle
- **data-handling-privacy skill:** Implements data classification and handling procedures
- **internal-compliance skill:** Applies operational controls to all data
- **cloud-platform-security skill:** Configures platform controls for regulated data
- **government-contracting skill:** Applies federal overlays (CUI, PII, PHI, FTI)

---

### 2. No Sensitive Data in Logs Principle

**Principle Statement:**
Organizations must prohibit storing, transmitting, or capturing sensitive data in logs, debugging output, command-line history, screenshots, tickets, monitoring systems, or prompts sent to external AI systems.

**Prohibited Data Types:**
- Personally Identifiable Information (PII)
- Protected Health Information (PHI)
- Payment Card Information (PCI)
- Controlled Unclassified Information (CUI)
- Authentication secrets (passwords, tokens, API keys)
- Access credentials (session IDs, OAuth tokens)
- Cryptographic keys
- Social Security Numbers (SSN)
- Financial account numbers
- Biometric identifiers
- Other regulated identifiers

**Implementation Requirements:**
- Logging systems must implement data minimization controls
- Anonymization or pseudonymization applied before logging
- Masking, filtering, or tokenization for sensitive fields
- Regular expression filters for common sensitive patterns (SSN, credit card, etc.)
- Developer training on secure logging practices
- Code review and testing to detect sensitive data in logs
- Monitoring system alerts for sensitive data exposure

**Application Contexts:**
- Application logs (error logs, debug logs, access logs, transaction logs)
- System logs (OS logs, authentication logs, security event logs)
- Audit trails (user activity, administrative actions, configuration changes)
- Debugging output (stack traces, variable dumps, console output)
- Screenshots and documentation (support tickets, training materials, documentation)
- Monitoring dashboards and SIEM systems
- Incident response documentation (redact sensitive data)
- AI/ML prompts (use anonymized data, see data-handling-privacy skill Template 04)

**Skill Integration:**
- **data-handling-privacy skill (Template 04):** Authoritative source for anonymization techniques
- **internal-compliance skill (Logging Policy):** Implements secure logging standards
- **cloud-platform-security skill (DLP Configuration):** Configures data loss prevention to detect/block sensitive data in logs
- **government-contracting skill:** Applies federal requirements for CUI protection in logs

---

### 3. Role Combination for Small Business Operations

**Principle Statement:**
Small organizations may combine roles including Chief Information Security Officer (CISO), Chief Information Officer (CIO), Chief Technology Officer (CTO), Privacy Officer, Compliance Officer, and Records Officer due to organizational size.

**Risk Acknowledgment:**
Role combination creates potential conflicts of interest, including:
- Same person responsible for security and operations (CISO + CIO)
- Same person responsible for compliance oversight and implementation (Compliance Officer + operational roles)
- Same person responsible for privacy and data processing decisions (Privacy Officer + data owner)
- Lack of independent oversight and separation of duties

**Mitigation Controls:**
Organizations must implement compensating controls when roles are combined:

**Separation of Duties Where Feasible:**
- Separate approval authority from implementation (e.g., CISO approves policy, IT implements)
- Multi-person approval for high-risk activities (e.g., privileged access, production changes)
- Job rotation or cross-training to enable oversight

**Independent Oversight:**
- External audits by third-party assessors
- Board-level oversight or advisory board review
- Client oversight mechanisms (for federal contracts, client security reviews)

**Managed Security Service Providers (MSSPs):**
- Use MSSPs for 24/7 security monitoring to provide independent detection capability
- MSSP provides independent incident detection and alerting
- MSSP logs and reports cannot be modified by internal personnel
- MSSP serves as control validation function

**Documentation and Transparency:**
- Role combination documented in security-governance skill
- Conflicts of interest identified and documented in risk register
- Compensating controls documented and auditable
- Annual review of role combination effectiveness

**Contractual Augmentation:**
Organizations may augment staffing for engagements requiring role separation:
- Subcontractors or consultants for specialized roles
- Temporary staff for contracts requiring 24/7 coverage
- Independent auditors for compliance assessments
- Documented in contracts or task orders

**Annual Review:**
Evaluate effectiveness of compensating controls annually:
- Assess whether conflicts have impacted security or compliance
- Review MSSP effectiveness and independence
- Evaluate need for additional personnel or separation
- Update risk register based on review findings

**Skill Integration:**
- **security-governance skill:** Documents role combination and governance structure
- **government-contracting skill:** Addresses federal requirements for role separation and 24/7 coverage
- **internal-compliance skill:** Implements compensating controls in operational procedures

---

## Cross-Skill Integration Requirements

### Authority Hierarchy

The following authority hierarchy applies to all skills:

1. **security-governance skill:** Master governance document for all policies
2. **data-handling-privacy skill:** Authoritative for privacy, retention, anonymization, and data handling controls
3. **government-contracting skill:** Provides federal overlays and superseding requirements for government engagements
4. **cloud-platform-security skill:** Provides platform implementation requirements (Google Workspace, GCP, Vertex AI)
5. **internal-compliance skill:** Implements operational controls defined in governance and privacy policies
6. **business-operations skill:** Implements business operations, onboarding/offboarding, document control
7. **contracts-risk-assurance skill:** Implements commercial and federal contracting requirements (DPAs, BAAs, SLAs)

All skills must reference these authoritative sources for:
- Privacy and data handling → **data-handling-privacy skill**
- Platform-specific controls → **cloud-platform-security skill**
- Federal requirements → **government-contracting skill**
- Incident response authority → **security-governance skill (Section 6)**
- Records retention → **data-handling-privacy skill (Records Management Policy)**

---

## Policy Applicability by Context

Universal principles apply across all contexts, with additional requirements based on regulatory, contractual, or platform-specific obligations.

### Internal Operations
- All controls in security-governance skill apply
- Internal operations form the baseline implementation
- Internal systems follow Records Management Policy for retention and deletion

### Commercial Client Engagements
- All controls in security-governance skill apply
- Commercial clients may impose additional controls through contracts, SOWs, or DPAs
- Reference data-handling-privacy skill and cloud-platform-security skill for implementation

### Federal Government Engagements
- Follow security-governance skill baseline PLUS federal overlays in government-contracting skill
- **Federal requirements supersede general controls where more stringent**
- CUI handled per NIST 800-171 requirements
- Federal retention and breach notification timelines override general timelines

### Healthcare Client Engagements
- Follow security-governance skill baseline PLUS HIPAA Security, Privacy, and Breach Notification Rules
- Business Associate Agreements (BAAs) required for PHI processing
- PHI follows enhanced monitoring, access, and disclosure requirements

### International Client Engagements
- Follow security-governance skill baseline PLUS GDPR and country-specific privacy requirements
- International data transfers follow Standard Contractual Clauses and Transfer Impact Assessments
- Data localization requirements enforced when required

### Platform-Specific Controls
- Google Workspace, Google Cloud Platform, and Vertex AI follow cloud-platform-security skill implementation requirements
- Platform configurations must **inherit—never replace**—requirements in security-governance skill

---

## Policy Conflict Resolution

When conflicts arise between different requirements, apply the following hierarchy:

1. **Federal requirements override general controls when more stringent**
   - Example: Federal 3-year retention overrides general 1-year retention
   - Example: NIST 800-171 CUI controls override general data classification

2. **Privacy requirements in data-handling-privacy skill override other skills where applicable**
   - Example: Anonymization requirements for logs override default logging practices
   - Example: GDPR data subject rights override general records retention

3. **Client contracts may impose stricter controls; the strictest requirement applies**
   - Example: Client-mandated 5-year retention overrides general 3-year retention
   - Example: Client-mandated FedRAMP Moderate controls override general cloud security

4. **All exceptions require CISO approval and risk-register documentation**
   - Justification for exception documented
   - Compensating controls identified and implemented
   - Risk acceptance signed by authorized official
   - Exception reviewed annually

---

## Compliance Language Standards

Organizations must use appropriate language when describing framework alignment and certification status.

### Alignment Language

Unless independently certified by a third-party auditor, organizations must use the following terminology:

**Approved Phrases:**
- "Controls implemented and aligned to [framework]"
- "Aligned with the requirements of [framework]"
- "Prepared for audit when required by [framework]"
- "FedRAMP-adjacent controls at [impact level]"
- "Controls designed to meet [framework] requirements"

**Prohibited Phrases (Without Certification):**
- "Certified under [framework]"
- "Compliant with [framework]"
- "Meets all requirements of [framework]"
- "FedRAMP authorized" (requires ATO)

### Framework References

Organizations maintain alignment with security and privacy frameworks including:
- NIST Cybersecurity Framework (CSF)
- NIST SP 800-53 Rev 5
- ISO 27001
- SOC 2 Trust Services Criteria
- HIPAA Security, Privacy, and Breach Notification Rules
- GDPR (General Data Protection Regulation)
- CCPA/CPRA (California privacy laws)
- FedRAMP security requirements

### Certification Claims

Statements of certification may **only** be made after an independent third-party audit:
- SOC 2 Type II audit by CPA firm
- ISO 27001 certification by accredited body
- FedRAMP authorization (ATO) by sponsoring agency
- HITRUST certification by HITRUST assessor

---

## Just-in-Time Access Controls

Organizations should enforce just-in-time (JIT) access through conditional IAM, Access Approval workflows, and short-lived credentials.

**Implementation Requirements:**
- Privileged access granted only for the required duration
- Access automatically revoked when no longer needed
- Access requests require justification and approval
- Access activities logged and monitored
- Access reviews conducted periodically

**Application Contexts:**
- Administrative access to production systems
- Privileged access to cloud platforms (GCP, Google Workspace)
- Access to sensitive data (PII, PHI, CUI)
- Break-glass emergency access procedures

**Skill Integration:**
- **security-governance skill:** Establishes JIT access requirements
- **internal-compliance skill:** Implements access control procedures
- **cloud-platform-security skill:** Configures GCP IAM and Access Approval

---

## Sensitive Data Logging Controls

All logging, monitoring, SIEM aggregation, ticketing, and debugging tools must follow the "No Sensitive Data in Logs" principle.

**Implementation Requirements:**
- Logs must never contain PII, PHI, PCI, CUI, credentials, secrets, tokens, or regulated identifiers
- Tools must enforce masking, filtering, anonymization, or tokenization controls
- Log retention aligned with data-handling-privacy skill (Records Management Policy)
- Access to logs restricted to authorized personnel
- Logs encrypted in transit and at rest

**Tool Categories:**
- **Logging systems:** Application logs, system logs, audit logs
- **Monitoring systems:** SIEM, dashboards, alerting systems
- **Ticketing systems:** Support tickets, incident tracking, change requests
- **Debugging tools:** Debug logs, stack traces, profilers
- **AI/ML systems:** Prompts sent to external AI systems (use anonymized data)

**Skill Integration:**
- **data-handling-privacy skill (Template 04):** Authoritative for anonymization techniques
- **internal-compliance skill (Logging Policy):** Implements secure logging standards
- **cloud-platform-security skill:** Configures platform logging with DLP controls

---

## Skill-to-Principle Mapping

| Universal Principle | Authoritative Skill | Implementation Skills |
|---------------------|---------------------|----------------------|
| Data-as-Regulated | security-governance | data-handling-privacy, internal-compliance, cloud-platform-security, government-contracting |
| No Sensitive Data in Logs | data-handling-privacy (Template 04) | internal-compliance (Logging Policy), cloud-platform-security (DLP Configuration) |
| Role Combination | security-governance | government-contracting (roles/responsibilities), internal-compliance (access controls) |
| Authority Hierarchy | security-governance | All skills reference governance authority |
| Policy Conflict Resolution | security-governance | All skills implement conflict resolution rules |
| Compliance Language | security-governance | government-contracting (readiness statement), contracts-risk-assurance (questionnaires) |
| JIT Access Controls | security-governance (Section 8) | cloud-platform-security (GCP IAM), internal-compliance (Access Control Policy) |
| Sensitive Data Logging Controls | security-governance (Section 14) | data-handling-privacy (Template 04), internal-compliance (Logging Policy) |

---

## Compliance Validation

Organizations must validate compliance with universal principles through:

**Internal Audits:**
- Quarterly review of log samples for sensitive data exposure
- Annual review of data classification compliance
- Annual review of role combination effectiveness

**External Audits:**
- SOC 2, ISO 27001, or other third-party audits assess principle implementation
- Federal audits assess CUI handling and NIST control implementation
- Client audits assess contractual compliance

**Continuous Monitoring:**
- DLP systems detect and alert on sensitive data in logs
- SIEM systems monitor for unauthorized access to sensitive data
- Automated compliance checks validate policy enforcement

---

## Review and Update Cycle

Universal principles reviewed and updated:
- **Annually:** Scheduled review of all principles
- **Upon regulatory change:** New laws or regulations affecting principles
- **After major incidents:** Lessons learned incorporated into principles
- **Upon business change:** Significant organizational or operational changes

Updates require approval by:
- Chief Information Security Officer (CISO)
- Chief Executive Officer (CEO)
- Documented in version control with change log

---

**Document Control**
- **Version:** 1.0
- **Last Updated:** 2026-02-07
- **Owner:** CISO / Compliance Officer
- **Review Frequency:** Annual
- **Classification:** Internal Use
- **Retention:** Permanent (governance document)
