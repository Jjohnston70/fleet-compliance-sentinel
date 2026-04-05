# SKILL: government-contracting

## 1. Skill Identity

**Name**: government-contracting
**Version**: 1.0
**Status**: Active
**Domain**: Federal Compliance — Government Contracting
**Origin**: Converted from PACKAGE_4_GOVERNMENT_CONTRACTING

**Purpose**: Provides federal-specific requirements, certifications, security controls, and operational procedures necessary for supporting federal government contracts. This skill establishes capability statements, readiness documentation, NIST alignment, federal data handling, mandatory reporting, contingency planning, roles/responsibilities, and procurement/subcontracting requirements.

---

## 2. Scope

### What This Skill Does:
- Establishes company capability statements and government readiness documentation for federal contracting
- Implements federal-specific data handling, FOIA compliance, and CUI protection requirements
- Defines NIST Cybersecurity Framework and NIST SP 800-53 alignment for federal security requirements
- Establishes mandatory reporting procedures for incidents, violations, and events to federal agencies
- Provides government-edition contingency planning and business continuity for federal contracts
- Defines roles, responsibilities, and authority levels for federal contract performance
- Establishes procurement and subcontractor management procedures compliant with FAR requirements
- Documents closeout and offboarding procedures for federal contract completion
- Overlays federal requirements on top of general business policies when more stringent

### What This Skill Does NOT Do:
- Does NOT replace general security and compliance policies (see security-governance skill)
- Does NOT replace general data handling policies (see data-handling-privacy skill)
- Does NOT replace general operational policies (see internal-compliance skill)
- Does NOT apply to non-federal commercial contracts
- Does NOT establish new certifications (only documents existing/pending certifications)

---

## 3. Process Definition

### Compliance Areas:
1. **Federal Certifications**: SDVOSB, VOSB, SAM.gov registration, UEI/CAGE codes
2. **NIST Alignment**: NIST CSF, NIST SP 800-53, FedRAMP-adjacent controls
3. **Federal Data Protection**: CUI, PII, PHI, FTI, classified information handling
4. **Mandatory Reporting**: 1-hour to 5-day reporting timelines based on incident type
5. **Federal Continuity**: RTO/RPO targets, alternate facilities, personnel succession
6. **FAR Compliance**: Flow-down clauses, small business utilization, procurement integrity
7. **Contract Closeout**: Data return/destruction, knowledge transfer, lessons learned
8. **FOIA Compliance**: Request processing, exemptions, agency coordination

### Decision Points:
1. **Federal vs. General Requirements**: When federal requirements are more stringent, federal requirements take precedence
2. **Reporting Threshold**: Incident severity determines reporting timeline (1 hour for breaches, 24 hours for violations, 5 days for performance issues)
3. **Data Classification**: Federal data classification (CUI, PII, PHI, FTI, Classified) determines handling procedures
4. **Contingency Activation**: Personnel unavailability triggers (4 hours for security operations, 8 hours for technical, 24 hours for executive)
5. **Subcontractor Selection**: Best value determination considering technical capability, past performance, price, and small business status

### Success Criteria:
- All federal reportable events reported within required timelines
- All federal data properly classified, handled, stored, and disposed per requirements
- NIST CSF and NIST SP 800-53 controls implemented with documented gap remediation plan
- SAM.gov registration active, certifications pending/obtained, contract vehicles ready
- Contingency plan tested annually, RTO/RPO targets met during exercises
- FAR flow-down clauses incorporated in all subcontracts
- Contract closeout completed within 120 days, data returned/destroyed with certificates
- FOIA requests processed with agency coordination within required timeframes

---

## 4. Inputs

### Required Information:
- Federal contract terms, requirements, deliverables, and closeout procedures
- Federal agency contacts (Contracting Officer, COR, Security Office, Privacy Office, IG)
- Data classification markings (CUI, PII, PHI, FTI, Classified)
- Incident details (type, severity, systems affected, data compromised, timeline)
- Subcontractor information (SAM.gov registration, certifications, capabilities, pricing)
- NIST control implementation status, gap analysis, remediation timelines
- Certification status (SDVOSB, VOSB, SAM.gov, UEI, CAGE code)

### Context from Other Skills:
- **security-governance skill**: Master governance framework, role combination principles, regulatory map
- **internal-compliance skill**: General incident response, business continuity, disaster recovery, vendor management
- **data-handling-privacy skill**: General data handling, breach notification, records management, anonymization
- **cloud-platform-security skill**: FedRAMP-authorized Google infrastructure implementation

---

## 5. Outputs

### Template Files:
1. **01-capability-statement.md**: Company overview, core competencies, certifications, NAICS codes, past performance, differentiators, target agencies
2. **02-government-readiness-statement.md**: Certification status, compliance frameworks, security posture, clearances, quality assurance, commitment to federal mission
3. **03-federal-data-handling-foia-policy.md**: CUI/PII/PHI/FTI/Classified handling, FOIA request procedures, exemptions, disclosure requirements, personnel requirements
4. **04-contingency-plan-government-edition.md**: Mission-critical functions, RTO/RPO/MTD targets, alternate facilities, personnel succession, disruption scenarios, communication protocols
5. **05-nist-lite-alignment-document.md**: NIST CSF 5 functions, NIST SP 800-53 control families, gap analysis, remediation plan, compliance monitoring
6. **06-mandatory-reporting-procedure.md**: Reportable events (security, compliance, fraud, conflicts, performance, personnel, legal, environmental), timelines, channels, documentation
7. **07-closeout-offboarding-procedure-gov.md**: 7-step closeout process (planning, deliverables, financial, data, knowledge transfer, reporting, post-closeout), data destruction methods
8. **08-roles-responsibilities-matrix-gov.md**: 12 key roles (CEO, CISO, Compliance Officer, Technical Director, Program Manager, etc.), authority levels, backup assignments, escalation paths
9. **09-procurement-subcontractor-policy.md**: 4-step selection process, flow-down requirements (FAR, security, privacy, compliance), performance monitoring, small business utilization

### Deliverables:
- Federal-compliant capability statements and readiness documentation for proposals
- NIST alignment documentation demonstrating control implementation and gap remediation
- Federal data handling procedures ensuring CUI, PII, PHI, FTI, Classified protection
- Mandatory reporting logs with timelines, channels, and documentation for audit
- Contingency plans tested annually with RTO/RPO achievement documented
- Roles/responsibilities matrix with backup assignments and authority levels
- Subcontractor files with FAR flow-down clauses, performance evaluations, small business utilization
- Contract closeout packages with data disposition certificates and lessons learned

---

## 6. Reference Data Dependencies

### Federal Regulations:
- Federal Acquisition Regulation (FAR) - procurement, flow-down clauses, retention, closeout
- NIST Cybersecurity Framework (CSF) 1.1/2.0 - Identify, Protect, Detect, Respond, Recover
- NIST SP 800-53 Rev 5 - 20 control families (AC, AU, CA, CM, CP, IA, IR, MA, MP, PE, PL, PM, PS, RA, SA, SC, SI, AT)
- NIST SP 800-88 - Media sanitization and data destruction guidelines
- Freedom of Information Act (FOIA) - request processing, exemptions, agency coordination
- CUI Program - Controlled Unclassified Information marking, handling, safeguarding

### Federal Agencies:
- U.S. Small Business Administration (SBA) - SDVOSB/VOSB certification
- SAM.gov - UEI/CAGE code registration and maintenance
- US-CERT - Cyber incident reporting
- Agency Inspector General - Fraud, waste, abuse reporting
- Agency Security Office - Security incidents, data breaches
- Agency Privacy Office - PII/PHI violations
- Contracting Officer / COR - Contract performance, deliverables, closeout

### Industry Standards:
- FedRAMP Moderate Baseline - Cloud security controls
- HIPAA Privacy/Security Rules - PHI handling
- IRS Publication 1075 - FTI safeguards
- Small Business Subcontracting Goals - SDVOSB, 8(a), HUBZone, WOSB utilization

---

## 7. Constraints

### Technical Constraints:
- RTO targets: 2-24 hours depending on system criticality
- RPO targets: 1-24 hours maximum data loss
- Reporting timelines: 1 hour (breaches/cyber) to 5 business days (performance issues)
- Backup frequency: Hourly (federal data), daily (deliverables), weekly (full system)
- Retention period: Minimum 3 years after final payment per FAR

### Operational Constraints:
- Small business operations with role combination (CEO/CISO/Compliance Officer/Technical Director may be same person)
- Backup personnel activation: 4 hours (security operations) to 48 hours (FOIA coordinator)
- Contingency plan testing: Semi-annual tabletop, annual functional, biennial full-scale
- Federal data must be logically separated from commercial data
- Subcontractor flow-down clauses required for all federal subcontracts

### Regulatory Constraints:
- Federal requirements override general policies when more stringent
- Federal retention requirements override data-handling-privacy skill general retention
- CUI/FTI handling requirements overlay data-handling-privacy skill classification system
- NIST CSF Tier 2 (Risk Informed) progressing to Tier 3 (Repeatable)
- FAR compliance mandatory for all federal procurement activities

---

## 8. Integration Points

### Upstream Dependencies (Inputs from Other Skills):
- **security-governance skill**: Master governance framework, consolidated regulatory map, role combination principles
- **internal-compliance skill**: General incident response, business continuity, disaster recovery, vendor management, 21 operational policies
- **data-handling-privacy skill**: General data handling, breach notification, records management, anonymization standards
- **cloud-platform-security skill**: FedRAMP-authorized Google Cloud Platform implementation, infrastructure controls

### Downstream Dependencies (This Skill Feeds Into):
- **security-governance skill**: Federal compliance status updates for consolidated regulatory map
- **contracts-risk-assurance skill**: Contract-specific requirements, SLAs, indemnification, performance bonds
- **business-operations skill**: Financial management, invoicing, cost accounting for federal contracts

### Lateral Integration:
- **Federal Overlay Principle**: When federal requirements (FOIA, CUI, federal retention, NIST controls) are more stringent than general policies, federal requirements take precedence
- **Harmonization**: Federal retention periods documented in this skill harmonize with data-handling-privacy skill (Records Management Policy); where federal retention is longer, federal requirements apply
- **Cross-Skill References**: All templates reference related skills using new naming (internal-compliance skill, security-governance skill, data-handling-privacy skill, cloud-platform-security skill)

---

## 9. Compliance Lifecycle Position

### Compliance Phase:
**Federal Contract Acquisition → Performance → Closeout**

### Position in Lifecycle:
1. **Pre-Award**: Capability statement, readiness statement, NIST alignment, certifications
2. **Award/Kickoff**: Roles/responsibilities assignment, contingency plan activation, subcontractor selection
3. **Performance**: Mandatory reporting, federal data handling, FOIA compliance, performance monitoring
4. **Closeout**: Data return/destruction, knowledge transfer, final reporting, lessons learned, audit cooperation

### Relationship to Other Phases:
- **Feeds Forward**: Past performance documentation, lessons learned, capability updates for future proposals
- **Feeds Backward**: Audit findings, corrective actions, gap remediation inform policy updates
- **Continuous**: Security monitoring, compliance monitoring, mandatory reporting, NIST control maintenance

---

## 10. Governance Statement

This skill establishes federal-specific compliance requirements for government contracting and federal agency support. It overlays federal requirements on top of general business policies documented in other skills (internal-compliance, security-governance, data-handling-privacy, cloud-platform-security).

**Federal Override Principle**: When federal requirements are more stringent than general policies, federal requirements take precedence. Examples include:
- Federal retention requirements (3 years after final payment) override general retention periods
- CUI/PII/PHI/FTI/Classified handling requirements overlay general data classification
- NIST CSF and NIST SP 800-53 controls overlay general security controls
- Mandatory reporting timelines (1 hour for breaches) override general incident response timelines
- FAR flow-down clauses override general vendor management requirements

**Compliance Authority**: Contracting Officer has final authority on contract compliance matters. Chief Executive Officer has final internal authority with delegation to CISO (security matters), Compliance Officer (regulatory matters), Program Manager (contract performance).

**Review and Update Cycle**:
- **Annual Review**: All 9 templates reviewed and updated annually
- **Trigger Events**: New federal contracts, certification changes, NIST updates, organizational changes, actual incidents
- **Version Control**: All updates documented with version number, date, and change description
- **Acknowledgment**: Key personnel acknowledge receipt and understanding of federal requirements

**Audit and Compliance**:
- **Internal Audits**: Quarterly federal data handling audits, annual NIST alignment assessment, annual contingency plan testing
- **External Audits**: Cooperation with federal agency audits, IG investigations, FAR compliance reviews
- **Metrics**: Reporting timeline compliance, RTO/RPO achievement, NIST control implementation percentage, small business utilization percentage

**Continuous Improvement**: Lessons learned from incidents, contract performance, audits, and contingency plan tests incorporated into skill updates. Gap remediation plan tracked quarterly with progress reported to executive leadership and federal agencies as required.

---

**Skill Maintainer**: Chief Executive Officer / Compliance Officer
**Last Updated**: [DOCUMENT_DATE]
**Next Review**: [Annual review cycle]
**Classification**: Internal Use — Federal Contracting
**Retention**: Permanent (supporting federal past performance and audit requirements)
