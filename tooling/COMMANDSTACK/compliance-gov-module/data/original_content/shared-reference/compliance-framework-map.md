# Compliance Framework Map
**Purpose:** Cross-framework mapping and applicability guidance for security and privacy compliance
**Last Updated:** 2026-02-07
**Authority:** security-governance skill
**Scope:** All compliance skills and operational contexts

---

## Overview

This document provides a comprehensive mapping of compliance frameworks, their applicability, control family alignment, and integration across federal compliance skills. Use this map to:
- Understand which frameworks apply to your operational context
- Navigate control requirements across multiple frameworks
- Determine appropriate compliance language (alignment vs. certification)
- Resolve conflicts when multiple frameworks apply

---

## Framework Inventory

### Security Frameworks

#### NIST Cybersecurity Framework (CSF)
- **Version:** 1.1 / 2.0
- **Issuer:** National Institute of Standards and Technology (NIST)
- **Scope:** Comprehensive cybersecurity risk management
- **Core Functions:** Identify, Protect, Detect, Respond, Recover
- **Implementation Tiers:** Tier 1 (Partial) → Tier 4 (Adaptive)
- **Use Case:** General cybersecurity program structure
- **Certification:** Self-assessment (no formal certification)

#### NIST SP 800-53 Rev 5
- **Issuer:** National Institute of Standards and Technology (NIST)
- **Scope:** Security and privacy controls for federal information systems
- **Control Families:** 20 families (AC, AU, CA, CM, CP, IA, IR, MA, MP, PE, PL, PM, PS, RA, SA, SC, SI, SR, AT, PT)
- **Baselines:** Low, Moderate, High impact levels
- **Use Case:** Federal government systems and CUI protection
- **Certification:** Assessment by federal agency or 3PAO

#### NIST SP 800-171
- **Issuer:** National Institute of Standards and Technology (NIST)
- **Scope:** Protecting Controlled Unclassified Information (CUI) in nonfederal systems
- **Requirements:** 110 security requirements across 14 families
- **Use Case:** Federal contractors handling CUI
- **Certification:** Self-assessment or CMMC assessment

#### ISO/IEC 27001
- **Version:** 2022
- **Issuer:** International Organization for Standardization (ISO)
- **Scope:** Information Security Management System (ISMS)
- **Controls:** Annex A controls (93 controls across 4 categories)
- **Categories:** Organizational, People, Physical, Technological
- **Use Case:** International information security management
- **Certification:** Formal certification by accredited certification body

#### SOC 2
- **Version:** Trust Services Criteria (TSC)
- **Issuer:** American Institute of CPAs (AICPA)
- **Scope:** Service organization controls for technology service providers
- **Trust Service Categories:** Security, Availability, Confidentiality, Processing Integrity, Privacy
- **Types:** Type I (point-in-time), Type II (period of time, typically 12 months)
- **Use Case:** Cloud service providers, SaaS vendors, managed service providers
- **Certification:** Audit by licensed CPA firm

#### FedRAMP
- **Issuer:** U.S. General Services Administration (GSA)
- **Scope:** Cloud service security for federal government
- **Baselines:** Low, Moderate, High impact levels (subset of NIST SP 800-53)
- **Authorization Types:** Agency ATO, JAB P-ATO
- **Use Case:** Cloud service providers serving federal agencies
- **Certification:** Authorization by sponsoring agency or JAB

### Privacy Frameworks

#### GDPR (General Data Protection Regulation)
- **Effective Date:** May 25, 2018
- **Issuer:** European Union
- **Scope:** Personal data of EU residents
- **Key Requirements:** Lawful basis, consent, data subject rights, breach notification (72 hours), DPIAs
- **Applicability:** Organizations processing EU personal data
- **Penalties:** Up to €20 million or 4% of global annual revenue
- **Use Case:** International operations, EU client engagements

#### CCPA/CPRA (California Consumer Privacy Act)
- **Effective Date:** CCPA Jan 1, 2020; CPRA Jan 1, 2023
- **Issuer:** State of California
- **Scope:** Personal information of California residents
- **Key Requirements:** Consumer rights (access, deletion, opt-out), privacy notices, data minimization
- **Applicability:** Businesses meeting revenue/data volume thresholds
- **Penalties:** $2,500 per violation (unintentional), $7,500 per violation (intentional)
- **Use Case:** U.S. commercial operations

#### HIPAA
- **Issuer:** U.S. Department of Health and Human Services (HHS)
- **Scope:** Protected Health Information (PHI)
- **Rules:** Privacy Rule, Security Rule, Breach Notification Rule
- **Applicability:** Covered entities (healthcare providers, health plans, clearinghouses) and business associates
- **Key Requirements:** Administrative, physical, technical safeguards; breach notification (60 days)
- **Use Case:** Healthcare client engagements, PHI processing
- **Certification:** No formal certification; compliance demonstrated through audits

### Industry-Specific Frameworks

#### PCI-DSS (Payment Card Industry Data Security Standard)
- **Version:** 4.0
- **Issuer:** PCI Security Standards Council
- **Scope:** Cardholder data protection
- **Requirements:** 12 requirements across 6 control objectives
- **Applicability:** Organizations processing, storing, or transmitting payment card data
- **Validation:** Self-Assessment Questionnaire (SAQ) or Qualified Security Assessor (QSA) audit
- **Use Case:** Payment processing, e-commerce

#### FERPA (Family Educational Rights and Privacy Act)
- **Issuer:** U.S. Department of Education
- **Scope:** Student education records
- **Applicability:** Educational institutions receiving federal funding
- **Key Requirements:** Student/parent access rights, consent for disclosure, record amendments
- **Use Case:** Educational institutions, education service providers

#### GLBA (Gramm-Leach-Bliley Act)
- **Issuer:** Federal Trade Commission (FTC)
- **Scope:** Financial information privacy
- **Applicability:** Financial institutions (banks, insurance companies, investment firms)
- **Key Requirements:** Privacy notices, opt-out rights, information safeguards
- **Use Case:** Financial services, fintech

---

## Framework Applicability Matrix

| Framework | Context | Mandatory/Optional | Certification Status | Skill Authority |
|-----------|---------|-------------------|---------------------|-----------------|
| NIST CSF | All operations | Recommended | Self-assessment | security-governance |
| NIST 800-53 | Federal systems | Mandatory (federal) | Federal agency assessment | government-contracting |
| NIST 800-171 | Federal contractors (CUI) | Mandatory (federal + CUI) | Self-assessment or CMMC | government-contracting |
| ISO 27001 | International, commercial | Optional | Formal certification | security-governance |
| SOC 2 | Cloud/SaaS providers | Optional (client-driven) | CPA audit | security-governance |
| FedRAMP | Federal cloud services | Mandatory (federal cloud) | Agency ATO or JAB P-ATO | government-contracting |
| GDPR | EU operations | Mandatory (EU data) | No formal certification | data-handling-privacy |
| CCPA/CPRA | California operations | Mandatory (CA data + thresholds) | No formal certification | data-handling-privacy |
| HIPAA | Healthcare clients | Mandatory (PHI processing) | No formal certification | data-handling-privacy |
| PCI-DSS | Payment processing | Mandatory (cardholder data) | QSA audit or SAQ | security-governance |
| FERPA | Education services | Mandatory (education records) | No formal certification | data-handling-privacy |
| GLBA | Financial services | Mandatory (financial info) | No formal certification | security-governance |

---

## Control Family Mapping

### Access Control (AC)
| Framework | Control Family/Category | Key Requirements |
|-----------|------------------------|------------------|
| NIST 800-53 | AC (Access Control) | Account management, least privilege, separation of duties, remote access |
| NIST 800-171 | 3.1 Access Control | Authorized access, least privilege, remote access, unsuccessful login attempts |
| ISO 27001 | A.5.15-5.18, A.8 | User access management, privileged access, information access restriction |
| SOC 2 | CC6 (Logical Access) | User access provisioning, authentication, authorization, removal |
| FedRAMP | AC (Access Control) | NIST 800-53 AC family (subset by baseline) |
| HIPAA Security | Access Control (164.312(a)) | Unique user ID, emergency access, automatic logoff, encryption/decryption |

### Audit and Accountability (AU)
| Framework | Control Family/Category | Key Requirements |
|-----------|------------------------|------------------|
| NIST 800-53 | AU (Audit and Accountability) | Audit logging, log monitoring, log retention, log protection |
| NIST 800-171 | 3.3 Audit and Accountability | Audit record content, centralized management, review and analysis, protection |
| ISO 27001 | A.8.15-8.16 | Logging, log protection, clock synchronization |
| SOC 2 | CC7 (Monitoring) | System monitoring, logging, alerting |
| FedRAMP | AU (Audit and Accountability) | NIST 800-53 AU family (subset by baseline) |
| HIPAA Security | Audit Controls (164.312(b)) | Hardware, software, procedural mechanisms to record and examine activity |

### Configuration Management (CM)
| Framework | Control Family/Category | Key Requirements |
|-----------|------------------------|------------------|
| NIST 800-53 | CM (Configuration Management) | Baseline configuration, change control, security impact analysis |
| NIST 800-171 | 3.4 Configuration Management | Baseline configurations, change control, least functionality, user-installed software |
| ISO 27001 | A.8.9, A.8.32 | Change management, configuration management |
| SOC 2 | CC8 (Change Management) | Change approval, testing, implementation, documentation |
| FedRAMP | CM (Configuration Management) | NIST 800-53 CM family (subset by baseline) |

### Identification and Authentication (IA)
| Framework | Control Family/Category | Key Requirements |
|-----------|------------------------|------------------|
| NIST 800-53 | IA (Identification and Authentication) | User identification, device identification, MFA, password management |
| NIST 800-171 | 3.5 Identification and Authentication | Unique identification, MFA, password complexity, re-authentication |
| ISO 27001 | A.5.17, A.8.5 | User authentication, password management |
| SOC 2 | CC6 (Logical Access) | Authentication, multi-factor authentication |
| FedRAMP | IA (Identification and Authentication) | NIST 800-53 IA family (subset by baseline) |
| HIPAA Security | Access Control (164.312(a)(2)) | Unique user identification, procedures for obtaining necessary ePHI |

### Incident Response (IR)
| Framework | Control Family/Category | Key Requirements |
|-----------|------------------------|------------------|
| NIST 800-53 | IR (Incident Response) | Incident handling, monitoring, reporting, response plan |
| NIST 800-171 | 3.6 Incident Response | Incident handling, monitoring, reporting, response plan testing |
| ISO 27001 | A.5.24-5.28 | Information security incident management, collection of evidence |
| SOC 2 | CC7 (Monitoring) | Incident detection, response, escalation |
| FedRAMP | IR (Incident Response) | NIST 800-53 IR family (subset by baseline) |
| HIPAA Security | Security Incident Procedures (164.308(a)(6)) | Identify and respond to security incidents, mitigate harmful effects |
| GDPR | Article 33-34 | Breach notification to supervisory authority (72 hours), data subjects |
| CCPA | Section 1798.150 | Private right of action for data breaches |

### Risk Assessment (RA)
| Framework | Control Family/Category | Key Requirements |
|-----------|------------------------|------------------|
| NIST 800-53 | RA (Risk Assessment) | Risk assessment, vulnerability scanning, penetration testing |
| NIST 800-171 | 3.11 Risk Assessment | Periodic risk assessment, vulnerability scanning, remediation |
| ISO 27001 | A.5.7, A.8.8 | Threat intelligence, vulnerability management |
| SOC 2 | CC3 (Risk Assessment) | Risk identification, assessment, mitigation |
| FedRAMP | RA (Risk Assessment) | NIST 800-53 RA family (subset by baseline) |
| HIPAA Security | Risk Analysis (164.308(a)(1)(ii)(A)) | Conduct accurate and thorough assessment of potential risks and vulnerabilities |

### System and Communications Protection (SC)
| Framework | Control Family/Category | Key Requirements |
|-----------|------------------------|------------------|
| NIST 800-53 | SC (System and Communications Protection) | Boundary protection, encryption, network segmentation |
| NIST 800-171 | 3.13 System and Communications Protection | Boundary protection, encryption, split tunneling, public access controls |
| ISO 27001 | A.8.20-8.31 | Network security, encryption, network segregation |
| SOC 2 | CC6 (Logical Access) | Encryption, network security |
| FedRAMP | SC (System and Communications Protection) | NIST 800-53 SC family (subset by baseline) |
| HIPAA Security | Transmission Security (164.312(e)) | Integrity controls, encryption |

### Media Protection (MP)
| Framework | Control Family/Category | Key Requirements |
|-----------|------------------------|------------------|
| NIST 800-53 | MP (Media Protection) | Media access, marking, storage, transport, sanitization, destruction |
| NIST 800-171 | 3.8 Media Protection | Media access, marking, storage, transport, sanitization |
| ISO 27001 | A.7.14, A.8.10-8.11 | Secure disposal, media handling, removable media |
| FedRAMP | MP (Media Protection) | NIST 800-53 MP family (subset by baseline) |

### Privacy (PT)
| Framework | Control Family/Category | Key Requirements |
|-----------|------------------------|------------------|
| NIST 800-53 | PT (Privacy) | Privacy notice, consent, data quality, minimization, retention |
| ISO 27001 | ISO 27701 extension | Privacy by design, data subject rights, consent management |
| SOC 2 | Privacy Criteria | Notice, choice/consent, collection, use/retention, access, disclosure, quality, monitoring |
| GDPR | Articles 5-11, 12-22 | Lawfulness, fairness, transparency; purpose limitation; data minimization; accuracy; storage limitation; integrity/confidentiality; accountability; data subject rights |
| CCPA | Sections 1798.100-130 | Consumer rights (access, deletion, opt-out); privacy notices; data minimization |
| HIPAA Privacy | 45 CFR Part 164 Subpart E | Notice of privacy practices, minimum necessary, individual rights, authorization |

---

## Framework Interaction and Precedence Rules

### Precedence by Context

1. **Federal Government Engagements:**
   - **Primary:** NIST 800-53, NIST 800-171, FedRAMP (depending on system type)
   - **Overlay:** FISMA, FAR/DFARS clauses
   - **Privacy:** Federal privacy laws (Privacy Act, E-Government Act)
   - **Precedence:** Federal requirements supersede general controls when more stringent

2. **Healthcare Client Engagements:**
   - **Primary:** HIPAA Security, Privacy, Breach Notification Rules
   - **Overlay:** State health privacy laws (often more stringent than HIPAA)
   - **Supporting:** NIST CSF, ISO 27001 for security program structure
   - **Precedence:** HIPAA requirements are mandatory; additional frameworks support compliance

3. **International Operations:**
   - **Primary:** GDPR (EU), country-specific data protection laws
   - **Overlay:** Standard Contractual Clauses, Transfer Impact Assessments
   - **Supporting:** ISO 27001, NIST CSF for security program
   - **Precedence:** GDPR and local laws supersede less stringent frameworks

4. **Commercial Clients (U.S.):**
   - **Primary:** NIST CSF, ISO 27001, SOC 2 (client-driven)
   - **Privacy:** CCPA/CPRA (California), state privacy laws
   - **Industry-Specific:** PCI-DSS (payments), FERPA (education), GLBA (financial)
   - **Precedence:** Most stringent applicable requirement applies

5. **Cloud Service Providers:**
   - **Primary:** SOC 2, ISO 27001
   - **Federal Cloud:** FedRAMP (required for federal cloud services)
   - **Privacy:** GDPR, CCPA, HIPAA (depending on data types)
   - **Precedence:** All applicable frameworks must be met; no single framework supersedes

### Conflict Resolution Process

When requirements from multiple frameworks conflict:

1. **Identify Conflict:**
   - Document specific requirements that conflict
   - Identify source frameworks and applicability

2. **Determine Precedence:**
   - Legal/regulatory requirements supersede voluntary frameworks
   - Federal requirements supersede general controls when more stringent
   - Client contractual requirements may add but not reduce baseline

3. **Apply Most Stringent:**
   - If both requirements are mandatory, apply the most stringent
   - Example: GDPR 72-hour breach notification vs. HIPAA 60-day notification → Apply 72-hour timeline for dual-applicability scenarios

4. **Document Decision:**
   - Record conflict and resolution in compliance documentation
   - Update policies to reflect most stringent requirement
   - Communicate to affected stakeholders

5. **Risk Acceptance (If Needed):**
   - If most stringent requirement is not feasible, document risk
   - Obtain CISO approval and executive sign-off
   - Implement compensating controls
   - Update risk register

---

## Certification vs. Alignment Language

### Terminology Standards

| Status | Approved Language | Prohibited Language (Without Certification) |
|--------|------------------|---------------------------------------------|
| Self-assessed alignment | "Controls implemented and aligned to [framework]" | "Certified under [framework]" |
| | "Aligned with the requirements of [framework]" | "Compliant with [framework]" |
| | "Prepared for audit when required by [framework]" | "Meets all requirements of [framework]" |
| | "Controls designed to meet [framework] requirements" | "[Framework] certified" |
| FedRAMP (no ATO) | "FedRAMP-adjacent controls at [impact level]" | "FedRAMP authorized" |
| | "FedRAMP-ready infrastructure" | "FedRAMP compliant" |
| Third-party audited | "SOC 2 Type II audited by [CPA firm]" | |
| | "ISO 27001 certified by [certification body]" | |
| Federal authorized | "FedRAMP authorized at [impact level] by [agency]" | |

### When Certification Claims Are Allowed

Organizations may claim certification **only** after:

**SOC 2:**
- Audit by licensed CPA firm
- Type I (point-in-time) or Type II (12+ months) report issued
- Report unqualified (no material weaknesses)

**ISO 27001:**
- Certification audit by accredited certification body
- Certificate issued with defined scope
- Annual surveillance audits completed

**FedRAMP:**
- Authority to Operate (ATO) issued by sponsoring federal agency
- JAB Provisional ATO (P-ATO) issued by Joint Authorization Board
- Continuous monitoring maintained

**HIPAA:**
- No formal certification exists
- Use "HIPAA Security Rule controls implemented" or "aligned with HIPAA requirements"

**GDPR/CCPA:**
- No formal certification exists
- Use "compliant with GDPR/CCPA requirements" (acceptable for legal compliance)

---

## Skill-to-Framework Mapping

| Skill | Primary Frameworks Implemented | Supporting Frameworks |
|-------|-------------------------------|----------------------|
| security-governance | NIST CSF, ISO 27001, SOC 2 | All frameworks (master governance) |
| internal-compliance | NIST CSF, ISO 27001 | NIST 800-53, SOC 2, HIPAA Security |
| data-handling-privacy | GDPR, CCPA, HIPAA Privacy | ISO 27701, NIST 800-53 PT family |
| government-contracting | NIST 800-53, NIST 800-171, FedRAMP | FISMA, FAR/DFARS |
| cloud-platform-security | FedRAMP, SOC 2 | NIST CSF, ISO 27001 |
| business-operations | ISO 9001 (quality), ISO 27001 | Internal process standards |
| contracts-risk-assurance | Contractual frameworks (BAA, DPA, SLA) | All frameworks (contract terms) |

---

## Framework Selection Guide

### By Operational Context

**Starting a Compliance Program:**
1. Start with NIST CSF for program structure
2. Implement ISO 27001 controls for baseline security
3. Add privacy frameworks (GDPR, CCPA) if handling personal data
4. Add industry/regulatory frameworks as applicable

**Federal Contracting:**
1. Implement NIST CSF and NIST 800-53 baseline
2. Add NIST 800-171 if handling CUI
3. Pursue FedRAMP if providing cloud services to federal agencies
4. Add CMMC Level 2+ for DoD contracts

**Cloud Service Provider:**
1. Pursue SOC 2 Type II (customer requirement)
2. Implement ISO 27001 (international recognition)
3. Add FedRAMP if serving federal government
4. Add HIPAA, PCI-DSS if handling regulated data

**Healthcare Services:**
1. Implement HIPAA Security, Privacy, Breach Notification Rules (mandatory)
2. Add NIST CSF for security program structure
3. Consider SOC 2 or ISO 27001 for competitive advantage
4. Add state-specific health privacy laws

**International Operations:**
1. Implement GDPR (mandatory for EU data)
2. Add ISO 27001 (international recognition)
3. Add country-specific privacy laws (Brazil LGPD, Canada PIPEDA, etc.)
4. Add NIST CSF for security baseline

---

## Continuous Framework Monitoring

Organizations must monitor framework changes and updates:

**Framework Update Monitoring:**
- NIST publishes updates to CSF, 800-53, 800-171 (review quarterly)
- ISO releases standards updates (review annually)
- Privacy law changes (GDPR guidance, state laws) (review quarterly)
- FedRAMP baseline changes (review when announced)

**Compliance Program Updates:**
- Annual review of all framework alignments
- Gap analysis after framework updates
- Remediation plan for new requirements
- Communication to stakeholders

**Audit Preparation:**
- Maintain evidence of framework implementation
- Document control mapping to frameworks
- Track changes and version control
- Prepare for periodic assessments

---

**Document Control**
- **Version:** 1.0
- **Last Updated:** 2026-02-07
- **Owner:** CISO / Compliance Officer
- **Review Frequency:** Quarterly (framework changes), Annual (comprehensive)
- **Classification:** Internal Use
- **Retention:** Permanent (governance document)
