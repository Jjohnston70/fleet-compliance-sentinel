# Federal Compliance Skill: Data Handling & Privacy

## 1. Skill Identity

**Skill Name:** data-handling-privacy
**Version:** 1.0
**Status:** Active
**Domain:** Federal Compliance — Data Handling & Privacy
**Origin:** Converted from PACKAGE_3_DATA_HANDLING_PRIVACY
**Last Updated:** [DOCUMENT_DATE]

## 2. Scope

### What This Skill Does

The **data-handling-privacy** skill provides comprehensive data handling, privacy management, and records governance templates for organizations that:
- Handle regulated data (PII, PHI, CUI, financial information)
- Must comply with privacy regulations (GDPR, CCPA, HIPAA)
- Operate under federal contracts requiring data protection controls
- Need to implement data lifecycle management from creation to disposal
- Require privacy-by-design and anonymization capabilities
- Must maintain auditable records management programs

This skill establishes the **authoritative source** for:
- Data classification and handling procedures across all systems
- Privacy management framework and individual rights procedures
- Data anonymization and pseudonymization techniques (critical for logs, AI/ML, and testing)
- Breach notification procedures and regulatory compliance
- Records retention and disposition schedules

### What This Skill Does NOT Do

- Provide platform-specific technical implementation (see cloud-platform-security skill)
- Define internal employee compliance policies (see internal-compliance skill)
- Establish master governance structure (see security-governance skill)
- Address government contracting-specific requirements (see government-contracting skill)
- Configure specific security tools or technologies

## 3. Process Definition

### Compliance Areas Covered

**Data Classification & Handling**
- Four-tier classification system (Public, Internal, Confidential, Restricted)
- Handling requirements by classification level
- Storage, transmission, and disposal procedures
- Special handling for regulated data types (PII, PHI, CUI, financial)

**Privacy Management**
- Privacy program governance structure
- Privacy Impact Assessment (PIA) procedures
- Consent management and documentation
- Individual rights request processing (GDPR, CCPA, HIPAA)
- Privacy compliance monitoring and metrics

**Data Lifecycle Management**
- Creation and collection procedures
- Processing and use controls
- Storage and maintenance requirements
- Archival procedures and retrieval
- Secure disposal methods by media type

**Anonymization & Pseudonymization**
- Eight anonymization techniques (masking, suppression, generalization, aggregation, perturbation, swapping, synthetic data, hashing)
- Four pseudonymization methods (tokenization, encryption, pseudonymous identifiers, key coding)
- De-identification process with risk assessment
- Use cases: logging, AI/ML, testing, analytics, research

**Breach Notification**
- Breach identification and assessment procedures
- Multi-stakeholder notification requirements (individuals, regulators, clients, law enforcement)
- Timeline compliance (HIPAA 60 days, GDPR 72 hours, state laws)
- Documentation and post-breach review

**Records Management**
- Records lifecycle from creation to disposition
- Comprehensive retention schedule by record type
- Legal hold procedures
- Vital records program
- Electronic and paper records management

### Decision Points

1. **Data Classification Assignment** (Template 01)
   - Input: Data element or dataset
   - Decision: Classify as Public, Internal, Confidential, or Restricted
   - Output: Classification marking with handling requirements

2. **Privacy Impact Assessment Trigger** (Template 02)
   - Input: New system, process, or data collection activity
   - Decision: PIA required? High-risk processing?
   - Output: PIA documentation with risk mitigation

3. **Consent Requirement Determination** (Template 02)
   - Input: Processing activity and legal basis
   - Decision: Consent required? Opt-in or opt-out?
   - Output: Consent mechanism and documentation

4. **Individual Rights Request Processing** (Template 02)
   - Input: Rights request (access, deletion, rectification, etc.)
   - Decision: Fulfill, deny, or extend response time?
   - Output: Rights request response within regulatory timeframes

5. **De-identification Technique Selection** (Template 04)
   - Input: Data use case, re-identification risk, utility requirements
   - Decision: Anonymization or pseudonymization? Which techniques?
   - Output: De-identified dataset with risk assessment documentation

6. **Breach Notification Determination** (Template 06)
   - Input: Security incident involving personal information
   - Decision: Reportable breach? Which parties to notify? Timeline?
   - Output: Notification to affected parties within regulatory deadlines

7. **Records Retention & Disposition** (Template 07)
   - Input: Record type and business context
   - Decision: Retention period? Disposition method? Legal hold?
   - Output: Retention schedule application and secure disposal

### Success Criteria

**Compliance Outcomes:**
- Data handling procedures meet NIST SP 800-171, GDPR, CCPA, HIPAA requirements
- Privacy Impact Assessments completed for high-risk processing
- Individual rights requests fulfilled within regulatory timeframes (30-45 days)
- Breach notifications meet timeline requirements (HIPAA 60 days, GDPR 72 hours)
- Records retention schedule implemented and auditable
- No sensitive data (PII, PHI, CUI) in unprotected logs or documentation

**Risk Mitigation:**
- Data classification drives appropriate security controls
- Anonymization/pseudonymization reduces re-identification risk
- Privacy-by-design integrated into systems from inception
- Breach response procedures minimize harm and regulatory penalties
- Legal holds prevent premature disposition of records

**Auditability:**
- Complete data inventory with classification and retention
- Privacy program documentation (PIAs, consent records, rights requests)
- De-identification risk assessments and approval records
- Breach notification documentation and timeline evidence
- Retention schedule compliance and disposition certificates

## 4. Inputs

**Organizational Context:**
- Company legal name, address, contact information (placeholders provided)
- Business model and service offerings (consulting, data services, etc.)
- Regulatory environment (federal contracts, HIPAA, GDPR, CCPA applicability)
- Data types handled (client data, employee data, financial data, etc.)

**Compliance Requirements:**
- Applicable regulations (GDPR, CCPA, HIPAA, state privacy laws, NIST SP 800-171)
- Contractual obligations (client data protection requirements)
- Industry standards (ISO 27001, SOC 2, FedRAMP)

**Technical Environment:**
- Systems and platforms (Google Workspace, cloud storage, databases)
- Data flows and processing activities
- Existing security controls and monitoring capabilities

**User Guidance:**
- All templates use placeholders (e.g., [COMPANY_LEGAL_NAME], [OWNER_NAME])
- Cross-references updated to skill-based structure (e.g., "security-governance skill")
- Templates assume hybrid deployment (Google Apps Script + general IT environment)

## 5. Outputs

### Template Files

All templates are provided in Markdown format with PII removed and standardized placeholders.

**01-data-handling-standard.md**
- Purpose: Authoritative data classification and handling procedures
- Sections: Classification levels, collection, storage, transmission, access, retention, disposal, special data types
- Cross-references: security-governance skill, internal-compliance skill, cloud-platform-security skill
- Key principle: Data-as-Regulated by default; no sensitive data in logs

**02-privacy-management-policy.md**
- Purpose: Privacy program governance and compliance framework
- Sections: Privacy principles, program structure, PIAs, consent management, individual rights, regulatory compliance
- Cross-references: data-handling-privacy skill (Data Handling Standard, Anonymization Standard)
- Key processes: PIA 5-step process, rights request 5-step fulfillment, consent withdrawal procedures

**03-data-lifecycle-management.md**
- Purpose: Data lifecycle procedures from creation to disposal
- Sections: 5 lifecycle phases (creation/collection, processing/use, storage/maintenance, archival, disposal)
- Cross-references: data-handling-privacy skill (Data Handling Standard, Records Management Policy)
- Key controls: Data inventory, ownership/stewardship roles, quality management, security by phase

**04-data-anonymization-pseudonymization.md**
- Purpose: De-identification techniques and procedures (CRITICAL for logs, AI/ML, testing)
- Sections: 8 anonymization techniques, 4 pseudonymization methods, 6-step de-identification process
- Cross-references: internal-compliance skill (Logging Policy, Incident Response), cloud-platform-security skill (Vertex AI)
- Key use cases: Logs/monitoring, AI/ML processing, incident documentation, testing environments, analytics

**05-privacy-notice.md**
- Purpose: External-facing privacy disclosure for individuals
- Sections: Information collection/use/sharing, legal basis, rights procedures, cookies, data retention
- Regulatory coverage: GDPR, CCPA/CPRA, HIPAA
- Rights addressed: Access, rectification, erasure, restriction, portability, object, opt-out, consent withdrawal

**06-breach-notification-procedure.md**
- Purpose: Breach identification, assessment, response, and notification
- Sections: Detection methods, assessment steps, notification procedures (internal, individual, regulatory, client, media)
- Timeline compliance: HIPAA 60 days, GDPR 72 hours, CCPA without unreasonable delay, state laws
- Templates included: Individual notification letter, regulatory notification form

**07-records-management-policy.md**
- Purpose: Records lifecycle, retention schedule, disposition procedures
- Sections: Lifecycle phases, retention schedule (business, financial, personnel, legal, client, IT, privacy records)
- Retention periods: Contracts 7 years, financial 7 years, personnel 7 years after termination, client per contract + 3 years
- Procedures: Legal holds, vital records program, electronic/paper records, compliance monitoring

## 6. Reference Data Dependencies

**Internal Dependencies (Other Skills):**
- **security-governance skill:** Master governance document; provides overarching compliance framework
- **internal-compliance skill:** Employee policies (logging, incident response, backup) that implement data handling requirements
- **cloud-platform-security skill:** Platform-specific implementation (Google DLP, Vertex AI governance)
- **government-contracting skill:** Federal retention requirements that may override general schedules

**External Standards & Regulations:**
- NIST SP 800-88: Media sanitization guidelines for disposal
- NIST SP 800-171: CUI handling controls (referenced in data classification)
- GDPR Articles 12-22: Individual rights procedures
- CCPA/CPRA Sections 1798.100-130: California consumer rights
- HIPAA Privacy Rule 45 CFR Parts 160, 164: PHI handling and breach notification
- Federal Acquisition Regulation (FAR): Contract data retention requirements

**Industry Frameworks:**
- ISO 27001 Annex A.8: Asset management and data classification
- ISO 27701: Privacy Information Management System (PIMS)
- SOC 2 Trust Services Criteria CC6.1: Logical access controls (data access procedures)
- FedRAMP AC-3: Access enforcement (data access controls)

## 7. Constraints

**Jurisdictional Variability:**
- Privacy laws vary by state (Virginia, Colorado, Connecticut, Utah, etc.); templates cover common requirements but may need state-specific additions
- International data transfers require additional safeguards (Standard Contractual Clauses, adequacy decisions)
- Breach notification timelines differ by jurisdiction

**Technical Limitations:**
- Anonymization is not foolproof; re-identification risk exists depending on adversary capability and external data availability
- Automated retention and disposition require technical implementation (not just policy)
- Legal hold implementation depends on e-discovery capabilities of systems

**Resource Requirements:**
- Privacy program requires designated Privacy Officer (may be Compliance Officer in small orgs)
- De-identification requires statistical expertise for risk assessment
- Records management requires ongoing monitoring and disposition execution

**Regulatory Evolution:**
- Privacy laws continue to evolve (new state laws, GDPR guidance updates)
- Templates require periodic review and update for regulatory changes
- AI/ML governance is rapidly developing area

## 8. Integration Points

**Cross-Skill Integration:**

**With security-governance skill:**
- Data-handling-privacy implements data protection requirements from master governance
- Breach notification procedures coordinate with incident response governance
- Privacy program reports to governance oversight structure

**With internal-compliance skill:**
- Logging policies (internal-compliance) use anonymization techniques from Template 04
- Incident response (internal-compliance) uses breach notification procedures from Template 06
- Backup retention (internal-compliance) aligns with retention schedule from Template 07

**With cloud-platform-security skill:**
- Google Data Loss Prevention (DLP) implements data classification from Template 01
- Vertex AI Governance uses anonymization/pseudonymization from Template 04
- Google Workspace retention policies implement retention schedule from Template 07

**With government-contracting skill:**
- Federal contract clauses (FAR, DFARS) may impose stricter retention requirements
- CUI handling requirements from Template 01 flow to government-contracting procedures
- Subcontractor data protection requirements flow down from this skill

**With business-operations skill:**
- Vendor agreements require data protection provisions from this skill
- Employee onboarding includes privacy training on these policies
- Business continuity includes vital records procedures from Template 07

**With contracts-risk-assurance skill:**
- Client contracts include data protection terms from Template 01
- Data Processing Agreements reference privacy management procedures from Template 02
- Liability clauses address breach notification obligations from Template 06

**External System Integration:**

**Identity & Access Management (IAM):**
- Data access controls (Template 01) drive IAM role and permission configuration
- Multi-factor authentication requirements for restricted data access

**Data Loss Prevention (DLP):**
- Data classification (Template 01) configures DLP policies and alerting
- PII/PHI/CUI detection rules based on special data handling requirements

**Security Information & Event Management (SIEM):**
- Access logging requirements (Template 01) feed SIEM data collection
- Anonymization techniques (Template 04) protect sensitive data in log correlation

**Records Management / Document Management Systems:**
- Retention schedule (Template 07) configures automated disposition rules
- Legal hold procedures (Template 07) suspend automated deletion

**Privacy Management Platforms:**
- Individual rights request tracking (Template 02) integrates with privacy platforms
- Consent management (Template 02) feeds consent management systems

## 9. Compliance Lifecycle Position

**Pre-Deployment Phase:**
- Template 01 (Data Handling Standard): Classify data types and define handling requirements for new systems
- Template 02 (Privacy Management Policy): Conduct Privacy Impact Assessment (PIA) for new data processing
- Template 04 (Anonymization/Pseudonymization): Design anonymization for test environments and logging

**Operational Phase:**
- Template 01: Apply data handling procedures to daily operations (storage, transmission, access)
- Template 02: Process individual rights requests (access, deletion, correction)
- Template 03 (Lifecycle Management): Maintain data inventory, perform periodic quality checks, execute archival
- Template 04: Anonymize data for analytics, AI/ML training, and testing environments
- Template 07 (Records Management): Apply retention schedule, manage legal holds, execute disposition

**Incident Response Phase:**
- Template 06 (Breach Notification): Detect breach, assess scope, notify affected parties within regulatory timelines
- Template 04: Anonymize sensitive data in incident documentation to protect privacy

**Audit & Assessment Phase:**
- Template 01: Demonstrate data classification and handling control implementation
- Template 02: Provide PIA documentation, consent records, rights request logs
- Template 03: Show data inventory completeness and lifecycle compliance
- Template 07: Prove retention schedule compliance and disposition documentation

**Continuous Improvement Phase:**
- All templates: Review annually for regulatory changes, business changes, and lessons learned
- Template 02: Update privacy training based on incident trends and new risks
- Template 06: Conduct post-breach reviews and update response procedures

## 10. Governance Statement

**Authority & Ownership:**
- The **data-handling-privacy skill** is the **authoritative source** for all data classification, handling, privacy, and retention requirements across the organization
- All other skills (internal-compliance, cloud-platform-security, government-contracting, business-operations) defer to this skill for data privacy, minimization, retention, and pseudonymization controls
- Privacy Officer (may be Compliance Officer) has authority to enforce these policies and suspend non-compliant activities

**Policy Hierarchy:**
- **Level 1:** security-governance skill (Master governance framework)
- **Level 2:** data-handling-privacy skill (Authoritative data and privacy policies) ← THIS SKILL
- **Level 3:** Platform-specific implementations (cloud-platform-security skill, internal-compliance skill)

**Universal Principles (Non-Negotiable):**
1. **Data-as-Regulated:** All client and customer data treated as regulated by default unless explicitly classified otherwise
2. **No Sensitive Data in Logs:** Logs, prompts, debugging output, comments, screenshots, and monitoring systems must NOT contain PII, PHI, PCI, CUI, or other regulated identifiers (use Template 04 anonymization techniques)

**Review & Update Cycle:**
- Templates reviewed annually (or upon regulatory change, major incident, or business change)
- Privacy Impact Assessments reviewed when system/process changes significantly
- Retention schedule updated based on new regulatory requirements or business needs
- Anonymization risk assessments re-evaluated if new external data sources emerge

**Compliance Attestation:**
By deploying this skill, the organization attests to:
- Implementing data classification and handling procedures per Template 01
- Conducting Privacy Impact Assessments per Template 02 for high-risk processing
- Maintaining data inventory and lifecycle controls per Template 03
- Applying anonymization/pseudonymization per Template 04 to logs, AI/ML, and testing
- Executing breach notification procedures per Template 06 within regulatory timelines
- Enforcing retention schedule and legal holds per Template 07

**Audit Rights:**
Clients, regulators, and auditors may request evidence of:
- Data classification determinations and handling procedures
- Privacy Impact Assessments and risk mitigation measures
- Individual rights request processing and response timelines
- De-identification risk assessments and technique documentation
- Breach notification logs and regulatory submission proof
- Retention schedule compliance and disposition certificates

---

**End of data-handling-privacy Skill Definition**

For implementation guidance, see individual template files in `templates/` directory.
For technical platform implementation, see cloud-platform-security skill.
For internal employee compliance, see internal-compliance skill.
For master governance, see security-governance skill.
