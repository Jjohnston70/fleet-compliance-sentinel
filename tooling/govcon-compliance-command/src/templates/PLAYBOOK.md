# Federal Compliance Skills Playbook

**Last Updated:** 2026-02-07
**Version:** 1.0
**Purpose:** 10 practical usage scenarios demonstrating how to apply federal compliance skills in real-world situations

---

## How to Use This Playbook

This playbook provides **step-by-step workflows** for common compliance scenarios. Each scenario includes:

- **Objective**: What you're trying to accomplish
- **Skills Involved**: Which compliance skills are needed
- **Templates Needed**: Specific templates required
- **Step-by-Step Workflow**: Detailed process with decision points
- **Success Criteria**: How to know you've completed the scenario successfully
- **Related Scenarios**: Other scenarios that may apply

**Format Conventions:**
- **Skill references**: `skill-name skill` (e.g., "security-governance skill")
- **Template references**: `skill-name skill Template XX` (e.g., "internal-compliance skill Template 04")
- **Document references**: `skill-name/templates/document-name.md`

---

## Scenario 1: New Compliance Program from Scratch

### Objective
Establish a complete compliance program for a new small business federal contractor with no existing security or compliance documentation.

### Skills Involved
- security-governance (Stage 1)
- internal-compliance (Stage 2)
- data-handling-privacy (Stage 2)
- cloud-platform-security (Stage 3)
- business-operations (Stage 4)
- compliance-audit (Stage 6)

### Timeline
20-36 weeks (5-9 months) for initial implementation

### Step-by-Step Workflow

**Week 1-4: Establish Governance (Stage 1)**

1. **Read security-governance skill**
   - Location: `security-governance/SKILL.md`
   - Review all 15 sections of Security and Compliance Handbook
   - Understand universal principles, policy hierarchy, compliance frameworks

2. **Customize Security and Compliance Handbook**
   - Location: `security-governance/templates/security-compliance-handbook.md`
   - Replace all placeholders: `[ORGANIZATION_NAME]`, `[CEO_NAME]`, `[CISO_NAME]`, etc.
   - Customize role definitions (document role combination for small business)
   - Document certifications (SAM.gov, SDVOSB/VOSB, pending certifications)
   - Update compliance framework map for applicable frameworks

3. **Establish Universal Principles**
   - Review: `shared-reference/universal-principles.md`
   - Document data-as-regulated principle implementation plan
   - Document no-PII-in-logs principle and logging controls
   - Document role combination with compensating controls (MSSPs, external audits)

4. **Obtain Approval**
   - CISO review and approval
   - CEO review and approval
   - Board or advisory board approval (if applicable)
   - Communicate to all personnel

**Week 5-12: Define Operations (Stage 2)**

5. **Implement Internal-Compliance Policies**
   - Location: `internal-compliance/templates/`
   - Customize all 21 templates with organizational information
   - Priority templates:
     - Template 04: Incident Response Plan (establish IR team and procedures)
     - Template 03: Access Control Policy (define roles and access levels)
     - Template 05-06: Business Continuity and Disaster Recovery Plans
     - Template 20: Audit Logging and Monitoring Policy (implement no-PII-in-logs)
     - Template 19: Security Awareness Training Program

6. **Implement Data-Handling-Privacy Policies**
   - Location: `data-handling-privacy/templates/`
   - Customize all 7 templates
   - Priority templates:
     - Template 01: Data Handling Standard (classify all data, define controls)
     - Template 04: Data Anonymization and Pseudonymization (implement in logging)
     - Template 06: Breach Notification Procedure (define timelines and procedures)
     - Template 07: Records Management Policy (define retention schedule)

7. **Harmonize Retention Schedules**
   - Review: `shared-reference/retention-schedule.md`
   - Ensure data-handling-privacy Template 07 aligns with federal requirements
   - Document retention for all data categories (operational, client, federal, regulated)

**Week 13-18: Implement Platforms (Stage 3)**

8. **Configure Cloud Platform Security**
   - Location: `cloud-platform-security/templates/`
   - Customize all 7 templates
   - Priority implementations:
     - Template 01: Google Workspace Security (2-Step Verification, Admin controls)
     - Template 03: GCP IAM Policy (least privilege, just-in-time access)
     - Template 05: DLP Configuration (align with data classification)
     - Template 06: Security Monitoring (Cloud Logging, Security Command Center)

9. **Implement No-PII-in-Logs Controls**
   - Configure DLP to detect and block PII in logs
   - Implement anonymization in application logging per data-handling-privacy Template 04
   - Configure Cloud Logging filters to mask sensitive data
   - Test logging to verify no PII captured

**Week 19-24: Operationalize Business Processes (Stage 4)**

10. **Integrate Security into Business Operations**
    - Location: `business-operations/templates/`
    - Customize all 10 templates
    - Priority integrations:
      - Template 01: Employee Onboarding (integrate security training)
      - Template 02: Employee Offboarding (access revocation procedures)
      - Template 04: Client Onboarding (compliance risk assessment)
      - Template 08: Training and Development Plan (security awareness)

11. **Conduct Initial Training**
    - Security awareness training for all personnel (internal-compliance Template 19)
    - Role-specific training (IR team, administrators, managers)
    - Document training completion and acknowledgments

**Week 25-30: Formalize Contracts (Stage 5)**

12. **Establish Contract Templates**
    - Location: `contracts-risk-assurance/templates/`
    - Customize templates for client contracts:
      - Template 01: Master Services Agreement
      - Template 03: Data Processing Agreement (GDPR/CCPA)
      - Template 04: Business Associate Agreement (HIPAA)
      - Template 06: Security Questionnaire Response Template
    - Obtain legal review of all contract templates

13. **Prepare for Federal Contracting (if applicable)**
    - Location: `government-contracting/templates/`
    - Customize all 9 templates
    - Priority documents:
      - Template 01: Capability Statement (certifications, competencies)
      - Template 02: Government Readiness Statement (compliance status)
      - Template 05: NIST Lite Alignment Document (gap analysis)
      - Template 06: Mandatory Reporting Procedure
    - **CRITICAL**: Use honest language ("aligned with" not "compliant with")

**Week 31-36: Assess and Improve (Stage 6)**

14. **Conduct Initial Compliance Assessment**
    - Location: `compliance-audit/templates/package-maturity-assessment.md`
    - Assess maturity of all 7 skills (security-governance, internal-compliance, etc.)
    - Use scoring criteria: `compliance-audit/reference/audit-scoring-criteria.md`
    - Identify gaps and create remediation plan

15. **Create Compliance Roadmap**
    - Location: `compliance-audit/templates/compliance-roadmap-checklist.md`
    - Document 12-24 month compliance milestones
    - Prioritize gap remediation (HIGH/MEDIUM/LOW)
    - Assign owners and target dates
    - Obtain executive approval

### Success Criteria
- [ ] Security and Compliance Handbook approved by CEO and CISO
- [ ] All 21 internal-compliance policies implemented and communicated
- [ ] Data classification applied to all systems and data
- [ ] Cloud platform security configured with DLP and monitoring
- [ ] No PII detected in logs (tested and validated)
- [ ] Security awareness training completed by all personnel
- [ ] Contract templates reviewed by legal counsel
- [ ] Initial compliance assessment completed with score 5+ (ADEQUATE or better)
- [ ] Compliance roadmap approved with priorities and owners
- [ ] Universal principles implemented and validated

### Related Scenarios
- Scenario 2: Federal Proposal Preparation (if pursuing federal contracts)
- Scenario 3: Employee Onboarding (ongoing operations)
- Scenario 6: Compliance Audit Preparation (annual reviews)

---

## Scenario 2: Federal Proposal Preparation

### Objective
Prepare documentation for a federal contract proposal or RFP response demonstrating security and compliance capabilities.

### Skills Involved
- government-contracting (primary)
- security-governance (evidence)
- internal-compliance (evidence)
- cloud-platform-security (evidence)

### Timeline
2-4 weeks for initial preparation; 1-2 days for specific RFP response

### Step-by-Step Workflow

**Preparation (Before RFP)**

1. **Review Government Readiness**
   - Location: `government-contracting/templates/02-government-readiness-statement.md`
   - Verify certification status (SAM.gov active, SDVOSB/VOSB pending/obtained)
   - Document compliance framework status (NIST alignment, FedRAMP-adjacent)
   - Review security posture summary

2. **Update Capability Statement**
   - Location: `government-contracting/templates/01-capability-statement.md`
   - Update core competencies and differentiators
   - Update NAICS codes for target opportunities
   - Update past performance (federal and commercial projects)
   - Verify contact information current

3. **Review NIST Alignment**
   - Location: `government-contracting/templates/05-nist-lite-alignment-document.md`
   - Verify NIST CSF 5 functions (Identify, Protect, Detect, Respond, Recover)
   - Verify NIST 800-53 control family implementation status
   - Update gap analysis and remediation plan with current status
   - **CRITICAL**: Be honest about gaps; do not overstate capabilities

4. **Prepare Evidence Portfolio**
   - Security and Compliance Handbook (security-governance)
   - Incident Response Plan (internal-compliance Template 04)
   - Business Continuity Plan (internal-compliance Template 05)
   - Data Handling Standard (data-handling-privacy Template 01)
   - Cloud security configurations (cloud-platform-security all templates)
   - Training records (business-operations Template 08)

**RFP Response (After RFP Received)**

5. **Analyze RFP Requirements**
   - Identify security and compliance requirements in RFP
   - Map requirements to existing documentation
   - Identify gaps requiring remediation or compensating controls

6. **Determine Data Classification Requirements**
   - Does contract involve CUI, PII, PHI, FTI, or Classified information?
   - Review: `government-contracting/templates/03-federal-data-handling-foia-policy.md`
   - Verify data handling procedures meet federal requirements

7. **Assess Mandatory Reporting Requirements**
   - Review: `government-contracting/templates/06-mandatory-reporting-procedure.md`
   - Verify timelines: 1 hour (cyber incidents), 24 hours (security violations), 5 days (performance issues)
   - Confirm IR team and CISO can meet reporting timelines

8. **Review Contingency Requirements**
   - Review: `government-contracting/templates/04-contingency-plan-government-edition.md`
   - Verify RTO/RPO targets can be met (2-24 hours depending on criticality)
   - Confirm backup personnel availability (4-48 hours depending on role)
   - **CRITICAL**: Do not commit to 24/7 coverage without MSSP or staff augmentation

9. **Prepare Compliance Matrix**
   - Create spreadsheet mapping RFP requirements to documentation
   - For each requirement, provide:
     - Document reference (skill, template, section)
     - Compliance status (IMPLEMENTED / IN PROGRESS / PLANNED)
     - Evidence location
     - Gap remediation plan (if not implemented)

10. **Draft Technical Volume**
    - Include capability statement
    - Include government readiness statement
    - Include NIST alignment document
    - Include compliance matrix with evidence references
    - Use accurate language:
      - ✅ "Controls aligned with NIST 800-53"
      - ✅ "FedRAMP-adjacent controls at Moderate impact level"
      - ❌ "FedRAMP compliant" (not authorized)
      - ❌ "Certified under NIST" (no such certification)

11. **Review and Submission**
    - CISO review for technical accuracy
    - CEO review for commitment accuracy
    - Legal review for contract terms
    - Capture team review
    - Submit proposal

### Success Criteria
- [ ] Capability statement current and accurate
- [ ] Government readiness statement reflects actual compliance status
- [ ] NIST alignment document honest about gaps
- [ ] Compliance matrix complete with evidence for all requirements
- [ ] Compliance language accurate (aligned vs. compliant)
- [ ] No unrealistic commitments (24/7 coverage, staffing, certifications)
- [ ] All evidence documents current and accessible
- [ ] Legal review completed
- [ ] CISO and CEO approval obtained

### Related Scenarios
- Scenario 1: New Compliance Program (if establishing program)
- Scenario 5: Security Questionnaire Response (often part of RFP)
- Scenario 9: Contract Closeout (after award and completion)

---

## Scenario 3: Employee Onboarding

### Objective
Onboard a new employee with complete security and compliance training and access provisioning.

### Skills Involved
- business-operations (primary)
- internal-compliance (training and access)
- data-handling-privacy (privacy training)

### Timeline
Day 1 (orientation), Days 2-30 (training and access), Day 30 (completion verification)

### Step-by-Step Workflow

**Day 1: Orientation**

1. **Execute Onboarding Procedure**
   - Location: `business-operations/templates/01-employee-onboarding-procedure.md`
   - Complete Section 1: Pre-Employment (background check, offer letter)
   - Complete Section 2: Day 1 Orientation
     - Review organizational structure and reporting
     - Provide Security and Compliance Handbook (security-governance)
     - Provide Employee Handbook with AUP (internal-compliance Template 02)
     - Collect signed acknowledgments

2. **Provide Security Awareness Training**
   - Location: `internal-compliance/templates/19-security-awareness-training-program.md`
   - Deliver foundational security training (online or in-person)
   - Cover topics:
     - Information security policies and procedures
     - Acceptable use of systems and data
     - Password policy and authentication requirements
     - Phishing and social engineering awareness
     - Incident reporting procedures
     - Physical security and clean desk policy
     - Remote work security (if applicable)
   - Document training completion

3. **Provide Privacy Training**
   - Location: `data-handling-privacy/templates/02-privacy-management-policy.md`
   - Cover data classification (Public, Internal, Confidential, Restricted)
   - Cover data handling requirements (encryption, access, disposal)
   - Cover no-PII-in-logs principle
   - Cover breach notification procedures
   - Document training completion

**Days 2-5: Access Provisioning**

4. **Provision User Accounts**
   - Location: `internal-compliance/templates/03-access-control-policy.md`
   - Create user accounts in all systems (Google Workspace, GCP, business applications)
   - Apply least-privilege access based on role
   - Configure 2-Step Verification (required for all users)
   - Provide initial password (temporary, must change on first login)

5. **Configure Cloud Access**
   - Location: `cloud-platform-security/templates/03-cloud-iam-policy.md`
   - Assign IAM roles based on job function
   - Configure just-in-time access for privileged operations (if applicable)
   - Enable Access Transparency and Access Approval (for privileged users)
   - Document access provisioning in IAM audit log

6. **Provision Physical Access**
   - Location: `internal-compliance/templates/18-physical-security-policy.md`
   - Issue badge or access card (if applicable)
   - Configure building/office access
   - Provide locker or secure storage (if handling regulated data)
   - Document physical access in access control system

**Days 6-30: Role-Specific Training**

7. **Provide Role-Specific Training**
   - Location: `business-operations/templates/08-training-development-plan.md`
   - Identify role-specific compliance training:
     - **Developers**: Secure SDLC, secure coding, code review (internal-compliance Template 09)
     - **Administrators**: Privileged access, change management, patch management
     - **Managers**: Incident response, vendor management, risk assessment
     - **Federal program staff**: Federal data handling, mandatory reporting, FOIA (government-contracting)
     - **Privacy roles**: Data subject rights, breach notification, anonymization
   - Deliver role-specific training
   - Document training completion

8. **Assign Mentor or Buddy**
   - Pair new employee with experienced team member
   - Review key policies and procedures
   - Shadow incident response and change management processes
   - Answer questions about compliance practices

**Day 30: Completion Verification**

9. **Verify Onboarding Completion**
   - All training completed and documented
   - All acknowledgments signed
   - All access provisioned and tested
   - Manager confirmation of readiness
   - HR completion of onboarding checklist

10. **Schedule Follow-Up**
    - 30-day check-in with manager
    - 90-day performance review including security and compliance responsibilities
    - Annual security awareness training (internal-compliance Template 19)

### Success Criteria
- [ ] Security and Compliance Handbook provided and acknowledged
- [ ] Security awareness training completed on Day 1
- [ ] Privacy training completed on Day 1
- [ ] All accounts provisioned with least-privilege access
- [ ] 2-Step Verification configured and tested
- [ ] Role-specific training completed within 30 days
- [ ] All acknowledgments signed and filed
- [ ] Manager confirms readiness
- [ ] Access documented in IAM audit logs

### Related Scenarios
- Scenario 4: Security Incident Response (employee role in IR)
- Scenario 7: Vendor Onboarding (similar process for vendors)
- Scenario 3 (related): Employee Offboarding (use business-operations Template 02)

---

## Scenario 4: Security Incident Response

### Objective
Respond to a security incident, contain the threat, investigate root cause, and determine if breach notification is required.

### Skills Involved
- internal-compliance (primary incident response)
- data-handling-privacy (breach notification if PII/PHI involved)
- government-contracting (mandatory reporting if federal contract)
- security-governance (risk register update)

### Timeline
- **Detection to Containment**: 1-4 hours
- **Investigation**: 1-3 days
- **Breach Determination**: Within 24 hours of incident
- **Notification**: Per regulatory timelines (72 hours GDPR, 60 days HIPAA, 1-24 hours federal)
- **Remediation**: 1-4 weeks
- **Post-Incident Review**: Within 30 days

### Step-by-Step Workflow

**Phase 1: Detection and Containment (Hours 0-4)**

1. **Detect and Report Incident**
   - Location: `internal-compliance/templates/04-incident-response-plan.md` Section 4
   - Employee, system alert, or MSSP detects potential incident
   - Report to Incident Response Team (IRT) via designated channel
   - Examples: malware detection, phishing email, unauthorized access, data exfiltration, DDoS attack

2. **Activate Incident Response Team**
   - Incident Coordinator notifies IRT members
   - IRT includes: Incident Coordinator, CISO, Technical Lead, Communications Lead
   - Establish incident command structure
   - Create incident tracking ticket (do NOT include PII or sensitive data in ticket)

3. **Initial Triage and Classification**
   - Classify incident severity: LOW / MEDIUM / HIGH / CRITICAL
   - Classify incident type: Malware, Phishing, Unauthorized Access, Data Breach, DDoS, Other
   - Determine systems and data affected
   - Assess immediate risk to operations and data

4. **Contain Incident**
   - Isolate affected systems (network segmentation, quarantine)
   - Disable compromised accounts
   - Block malicious IPs or domains
   - Preserve evidence (logs, disk images, memory dumps)
   - Document all containment actions with timestamps

**Phase 2: Investigation (Hours 4-72)**

5. **Investigate Root Cause**
   - Analyze logs (Cloud Logging, Security Command Center, application logs)
   - Review security events leading to incident
   - Identify attack vector (phishing, vulnerability exploit, misconfig, insider)
   - Determine scope of compromise (systems, accounts, data)
   - Identify data at risk (PII, PHI, CUI, commercial data)

6. **Determine if Breach Occurred**
   - Location: `data-handling-privacy/templates/06-breach-notification-procedure.md` Section 2
   - Was personal information (PII, PHI) involved?
   - Was data accessed, acquired, or exfiltrated by unauthorized party?
   - Is breach notification required under applicable regulations?
     - GDPR: 72 hours to supervisory authority
     - HIPAA: 60 days to HHS and individuals
     - State laws: Varies (often "without unreasonable delay")
     - Federal contracts: 1-24 hours depending on incident type

7. **Assess Federal Reporting Requirements (if applicable)**
   - Location: `government-contracting/templates/06-mandatory-reporting-procedure.md`
   - Does incident meet federal reportable event criteria?
     - Security incidents (cyber, physical, personnel): 1 hour
     - Compliance violations (contract, regulatory, privacy): 24 hours
     - CUI compromise or suspected compromise: 1 hour
     - Contract performance impacts: 5 business days
   - Identify reporting channel (Contracting Officer, Security Office, US-CERT, IG)

**Phase 3: Notification (Hours 24-72)**

8. **Prepare Breach Notifications (if required)**
   - Location: `data-handling-privacy/templates/06-breach-notification-procedure.md` Section 3
   - Draft notification to affected individuals
   - Draft notification to regulators (HHS, state AG, supervisory authority)
   - Draft notification to clients (per contract terms)
   - Include required elements:
     - Date and nature of breach
     - Types of information involved
     - Steps taken to investigate and mitigate
     - Contact information for questions
     - Steps individuals should take

9. **Execute Federal Mandatory Reporting (if required)**
   - Location: `government-contracting/templates/06-mandatory-reporting-procedure.md` Section 3
   - Report to Contracting Officer or COR within required timeline
   - Report to agency Security Office or SOC
   - Report to US-CERT (for cyber incidents)
   - Report to IG (for fraud, waste, abuse)
   - Follow up with written report within 24-48 hours

10. **Notify Internal Stakeholders**
    - Notify CEO and senior leadership
    - Notify legal counsel
    - Notify insurance carrier (cyber insurance)
    - Notify clients per contract terms (contracts-risk-assurance DPA/BAA)
    - Brief employees (as appropriate, maintain confidentiality)

**Phase 4: Remediation (Days 3-30)**

11. **Eradicate Threat**
    - Remove malware, backdoors, unauthorized accounts
    - Patch vulnerabilities exploited in attack
    - Reset passwords for compromised accounts
    - Rebuild compromised systems from clean backups (if necessary)
    - Verify threat eradicated through monitoring

12. **Restore Operations**
    - Restore systems from backups (internal-compliance Template 10)
    - Verify data integrity
    - Return systems to production
    - Monitor for re-infection or persistence
    - Document restoration actions

13. **Implement Compensating Controls**
    - Deploy additional monitoring and alerting
    - Implement temporary access restrictions
    - Increase log retention for affected systems
    - Schedule follow-up security assessments

**Phase 5: Post-Incident Activities (Days 30-60)**

14. **Conduct Post-Incident Review**
    - Location: `internal-compliance/templates/04-incident-response-plan.md` Section 5
    - IRT reviews incident timeline, response actions, effectiveness
    - Identify lessons learned
    - Identify process improvements
    - Identify policy or procedure updates needed

15. **Update Risk Register**
    - Location: `security-governance/templates/security-compliance-handbook.md` Section 15
    - Document incident in risk register
    - Update threat and vulnerability assessments
    - Update likelihood and impact ratings for similar risks
    - Document compensating controls implemented

16. **Implement Improvements**
    - Update policies, procedures, or configurations based on lessons learned
    - Provide additional training to personnel
    - Implement new security controls or monitoring
    - Conduct tabletop exercise for similar scenario

17. **Close Incident**
    - Document final incident report
    - Archive evidence and logs per retention schedule
    - Close incident ticket
    - Brief CEO and CISO on incident closure

### Success Criteria
- [ ] Incident contained within 4 hours of detection
- [ ] Threat eradicated and systems restored
- [ ] All required notifications made within regulatory timelines
- [ ] Federal mandatory reporting completed within required timeline (if applicable)
- [ ] Root cause identified and documented
- [ ] Lessons learned documented and improvements implemented
- [ ] Risk register updated
- [ ] Post-incident review completed within 30 days
- [ ] No recurrence of similar incident

### Related Scenarios
- Scenario 8: Data Breach Response (specific type of security incident)
- Scenario 5: Security Questionnaire Response (incident history questions)
- Scenario 6: Compliance Audit Preparation (incident response evidence)

---

## Scenario 5: Security Questionnaire Response

### Objective
Complete a vendor security questionnaire or RFP security section demonstrating security and compliance capabilities.

### Skills Involved
- contracts-risk-assurance (primary - questionnaire response template)
- security-governance (evidence - handbook)
- internal-compliance (evidence - operational procedures)
- cloud-platform-security (evidence - platform security)
- data-handling-privacy (evidence - privacy program)
- government-contracting (evidence - federal posture, if applicable)

### Timeline
1-5 days depending on questionnaire complexity and evidence availability

### Step-by-Step Workflow

**Preparation**

1. **Review Questionnaire**
   - Location: `contracts-risk-assurance/templates/06-security-questionnaire-response-template.md`
   - Categorize questions:
     - Governance and Risk Management
     - Access Control and Identity Management
     - Data Protection and Encryption
     - Network and Infrastructure Security
     - Application Security
     - Incident Response and Business Continuity
     - Compliance and Certifications
     - Cloud Security (if applicable)
     - Privacy and Data Handling
   - Identify questions requiring attachments or evidence

2. **Gather Evidence Documents**
   - **Governance**: Security and Compliance Handbook (security-governance)
   - **Policies**: 21 operational policies (internal-compliance)
   - **Privacy**: Data handling and privacy policies (data-handling-privacy)
   - **Platform**: Cloud security configurations (cloud-platform-security)
   - **Federal**: Capability statement, NIST alignment (government-contracting, if applicable)
   - **Certifications**: SAM.gov, SDVOSB/VOSB, compliance framework status
   - **Audit Reports**: SOC 2 report, penetration test results (if available)

**Response Development**

3. **Answer Governance Questions**
   - Reference: `security-governance/templates/security-compliance-handbook.md`
   - Common questions:
     - Do you have an information security policy? → Yes, reference Section 1
     - Do you have a CISO or equivalent? → Yes, reference organizational structure (acknowledge role combination if applicable)
     - Do you conduct risk assessments? → Yes, reference Section 15
     - Do you have security incident response procedures? → Yes, reference Section 6
   - Provide handbook as attachment

4. **Answer Access Control Questions**
   - Reference: `internal-compliance/templates/03-access-control-policy.md`
   - Common questions:
     - Do you enforce least-privilege access? → Yes, describe IAM implementation
     - Do you require multi-factor authentication? → Yes, 2-Step Verification required for all users
     - Do you conduct access reviews? → Yes, quarterly reviews per policy
     - Do you have privileged access management? → Yes, just-in-time access via Access Approval (cloud-platform-security Template 03)

5. **Answer Data Protection Questions**
   - Reference: `data-handling-privacy/templates/01-data-handling-standard.md`
   - Common questions:
     - Do you classify data? → Yes, 4-tier classification (Public, Internal, Confidential, Restricted)
     - Do you encrypt data at rest and in transit? → Yes, describe encryption standards
     - Do you have data retention and disposal procedures? → Yes, reference Template 07
     - Do you have breach notification procedures? → Yes, reference Template 06 with timelines

6. **Answer Cloud Security Questions (if applicable)**
   - Reference: `cloud-platform-security/templates/` (all 7 templates)
   - Common questions:
     - What cloud provider do you use? → Google Cloud Platform and Google Workspace
     - Do you have DLP controls? → Yes, reference Template 05
     - Do you have cloud security monitoring? → Yes, reference Template 06
     - Is your cloud provider FedRAMP authorized? → Yes, GCP has FedRAMP High authorization
     - **CRITICAL**: Distinguish between provider authorization and organizational authorization

7. **Answer Incident Response Questions**
   - Reference: `internal-compliance/templates/04-incident-response-plan.md`
   - Common questions:
     - Do you have an incident response plan? → Yes, reference IRP
     - Do you have an IR team? → Yes, describe team structure
     - What is your incident detection capability? → MSSP 24/7 monitoring + Security Command Center
     - Have you had security incidents? → Answer honestly; if yes, describe without disclosing PII

8. **Answer Business Continuity Questions**
   - Reference: `internal-compliance/templates/05-business-continuity-plan.md` and `06-disaster-recovery-plan.md`
   - Common questions:
     - Do you have BC/DR plans? → Yes, reference BCPs and DRP
     - What are your RTO/RPO targets? → Provide targets (2-24 hours RTO, 1-24 hours RPO depending on system criticality)
     - Do you test BC/DR plans? → Yes, annual testing per policy
     - Do you have alternate facilities? → Yes if applicable; No if using cloud infrastructure (describe cloud resilience)

9. **Answer Compliance Questions**
   - Reference: Multiple skills depending on frameworks
   - Common questions:
     - What compliance frameworks do you align with? → NIST CSF, ISO 27001, SOC 2, etc. (use "align with" not "compliant with" unless certified)
     - Are you SOC 2 certified? → Answer honestly (Yes with report date if audited; No if not audited; "Preparing for audit" if in process)
     - Are you FedRAMP authorized? → Use "FedRAMP-adjacent controls" not "FedRAMP compliant" (unless actually authorized)
     - Do you comply with GDPR/CCPA? → Yes, reference data-handling-privacy privacy management policy
     - Are you HIPAA compliant? → Use "HIPAA Security Rule controls implemented" not "HIPAA certified" (no such certification exists)

10. **Answer Privacy Questions**
    - Reference: `data-handling-privacy/templates/02-privacy-management-policy.md`
    - Common questions:
      - Do you have a privacy policy? → Yes, reference policy
      - How do you handle personal information? → Reference data handling standard and lifecycle management
      - Do you support data subject rights? → Yes, describe rights and request procedures
      - Do you use subprocessors? → Yes/No, describe vendor management and DPAs

**Review and Submission**

11. **Review for Accuracy**
    - Verify all responses align with actual capabilities
    - Verify compliance language accurate (aligned vs. compliant vs. certified)
    - Verify evidence attachments correct and current
    - Do not overstate capabilities (24/7 coverage, certifications, staffing)

12. **Review for Consistency**
    - Ensure questionnaire responses consistent with:
      - Capability statement (government-contracting Template 01)
      - Government readiness statement (government-contracting Template 02)
      - Website and marketing materials
      - Previous questionnaire responses

13. **Obtain Approvals**
    - CISO review and approval
    - Legal review (if contract terms included)
    - CEO approval (if contractual commitment)

14. **Submit Response**
    - Submit questionnaire with all attachments
    - Retain copy in vendor file or client file
    - Track submission date and follow-up requirements

### Success Criteria
- [ ] All questions answered completely and accurately
- [ ] Compliance language accurate (aligned vs. compliant vs. certified)
- [ ] Evidence documents current and attached
- [ ] No unrealistic claims or overstated capabilities
- [ ] Responses consistent with other documentation
- [ ] CISO and legal review completed
- [ ] Submission within required timeframe
- [ ] Copy retained for records

### Related Scenarios
- Scenario 2: Federal Proposal Preparation (similar evidence gathering)
- Scenario 6: Compliance Audit Preparation (evidence collection)
- Scenario 7: Vendor Onboarding (vendor security assessment)

---

## Scenario 6: Compliance Audit Preparation

### Objective
Prepare for an external compliance audit (SOC 2, ISO 27001, FedRAMP, HIPAA, or client audit) by conducting internal assessment and gathering evidence.

### Skills Involved
- compliance-audit (primary - assessment templates)
- security-governance (evidence)
- internal-compliance (evidence)
- data-handling-privacy (evidence)
- cloud-platform-security (evidence)
- business-operations (evidence)
- government-contracting (evidence, if federal audit)

### Timeline
- **Initial Assessment**: 2-4 weeks
- **Gap Remediation**: 4-12 weeks depending on gaps
- **Evidence Gathering**: 2-4 weeks
- **Audit Execution**: 1-4 weeks depending on audit type

### Step-by-Step Workflow

**Phase 1: Pre-Audit Assessment (Weeks 1-4)**

1. **Determine Audit Type and Scope**
   - Identify audit framework: SOC 2 Type II, ISO 27001, FedRAMP, HIPAA, client audit
   - Identify audit scope: systems, locations, time period
   - Identify auditor: CPA firm, certification body, 3PAO, client assessor
   - Review audit standards and requirements

2. **Conduct Comprehensive Compliance Review**
   - Location: `compliance-audit/templates/comprehensive-compliance-review.md`
   - Assess all 7 skills (security-governance through contracts-risk-assurance)
   - Use scoring criteria: `compliance-audit/reference/audit-scoring-criteria.md`
   - Evaluate:
     - Completeness (all required policies documented)
     - Compliance alignment (controls mapped to framework)
     - Cross-package integration (dependencies documented)
     - Technical accuracy (controls implementable)
     - Operational realism (claims accurate)
     - Audit readiness (evidence documented)

3. **Conduct Framework-Specific Assessment**
   - **SOC 2**: Map Trust Services Criteria to security-governance handbook and internal-compliance policies
   - **ISO 27001**: Map Annex A controls to documentation, identify Statement of Applicability
   - **FedRAMP**: Map NIST 800-53 controls to government-contracting NIST alignment document
   - **HIPAA**: Map Security Rule to internal-compliance and data-handling-privacy policies
   - Reference: `shared-reference/compliance-framework-map.md`

4. **Identify Gaps and Create Remediation Plan**
   - Document all gaps (missing policies, incomplete implementations, inaccurate claims)
   - Prioritize gaps: HIGH (audit blockers), MEDIUM (important improvements), LOW (nice-to-have)
   - Assign owners for each gap
   - Set target remediation dates
   - Obtain executive approval for remediation plan

**Phase 2: Gap Remediation (Weeks 5-16)**

5. **Remediate HIGH Priority Gaps**
   - Address audit-blocking gaps first (missing policies, critical controls)
   - Implement missing security controls
   - Update documentation to reflect current state
   - Test controls to verify operation
   - Document evidence of implementation

6. **Remediate MEDIUM Priority Gaps**
   - Address important improvements
   - Enhance existing controls
   - Improve documentation quality
   - Conduct additional training if needed

7. **Address Compliance Language Issues**
   - Review all documentation for compliance language accuracy
   - Replace "compliant with" with "aligned with" (unless certified)
   - Replace "FedRAMP compliant" with "FedRAMP-adjacent controls" (unless authorized)
   - Remove unrealistic claims (24/7 coverage without MSSP, certifications not obtained)

8. **Validate Cross-Skill Integration**
   - Location: `compliance-audit/templates/cross-package-dependency-review.md`
   - Verify all cross-references accurate (no orphaned references)
   - Verify governance hierarchy clear (security-governance at root)
   - Verify retention harmonized (data-handling-privacy Template 07 authoritative)
   - Verify universal principles implemented (data-as-regulated, no-PII-in-logs, role combination)

**Phase 3: Evidence Gathering (Weeks 17-20)**

9. **Compile Policy Evidence**
   - All policies from security-governance, internal-compliance, data-handling-privacy
   - Policy approval documentation (CEO and CISO signatures)
   - Policy communication records (emails, training, acknowledgments)
   - Policy review and update logs

10. **Compile Operational Evidence**
    - Incident response: Incident logs, IR exercises, post-incident reviews
    - Access control: IAM audit logs, access reviews, MFA enrollment
    - Logging and monitoring: Log samples (verify no PII), SIEM alerts, monitoring dashboards
    - Vulnerability management: Scan results, patch deployment records, remediation tracking
    - Business continuity: BC/DR test results, backup verification, restoration tests
    - Training: Training completion records, acknowledgment forms, training materials

11. **Compile Platform Evidence**
    - Google Workspace: Security configuration screenshots, 2-Step Verification enrollment, DLP policies, Alert Center logs
    - GCP: IAM policies, VPC configuration, DLP inspection results, Security Command Center findings, Cloud Logging samples
    - Vertex AI: Data handling procedures, model security controls, prompt engineering guidelines

12. **Compile Privacy Evidence**
    - Data classification documentation and system inventory
    - Retention schedule implementation (Workspace retention rules, GCS lifecycle policies)
    - Breach notification procedures and drill records
    - Privacy notices and consent forms
    - Data subject rights request logs and responses
    - DPA and BAA contracts with clients and vendors

13. **Compile Federal Evidence (if applicable)**
    - SAM.gov registration and certification status
    - NIST alignment documentation with gap analysis and remediation plan
    - Federal data handling procedures and CUI registers
    - Mandatory reporting logs with timelines
    - Federal contingency plan testing results
    - Federal contract closeout records (for past performance)

**Phase 4: Audit Execution (Weeks 21-24)**

14. **Prepare Audit Team**
    - Identify internal audit coordinator
    - Identify subject matter experts for each domain
    - Prepare audit response procedures
    - Schedule auditor interviews and system walkthroughs

15. **Provide Evidence to Auditors**
    - Create evidence repository (organized by control or requirement)
    - Provide access to auditors (read-only, time-limited)
    - Track evidence requests and responses
    - Respond to auditor questions promptly

16. **Conduct Auditor Walkthroughs**
    - Demonstrate security controls in operation
    - Walk through incident response procedures
    - Demonstrate access provisioning and revocation
    - Demonstrate backup and restoration procedures
    - Demonstrate monitoring and alerting
    - Answer auditor questions honestly

17. **Address Audit Findings**
    - Review draft audit findings with auditors
    - Provide additional evidence if findings based on incomplete information
    - Create remediation plan for confirmed findings
    - Negotiate realistic remediation timelines
    - Do not dispute findings based on accurate assessment

**Phase 5: Post-Audit Activities (Weeks 25-28)**

18. **Receive Audit Report**
    - Review final audit report
    - Understand opinion (unqualified, qualified, adverse, disclaimer)
    - Understand findings (material weaknesses, significant deficiencies, observations)
    - Obtain audit certificate (if ISO 27001) or ATO (if FedRAMP)

19. **Implement Corrective Actions**
    - Create corrective action plan for all findings
    - Assign owners and target dates
    - Implement corrective actions
    - Validate effectiveness
    - Document completion

20. **Update Documentation**
    - Update policies and procedures based on audit findings
    - Update compliance-audit templates based on lessons learned
    - Update compliance-roadmap with post-audit priorities
    - Communicate changes to personnel

21. **Plan Next Audit**
    - Schedule next audit cycle (annual SOC 2, triennial ISO 27001 recertification)
    - Schedule surveillance audits (ISO 27001 annual surveillance)
    - Schedule continuous monitoring (FedRAMP ConMon)
    - Update compliance-roadmap with future audit dates

### Success Criteria
- [ ] Comprehensive compliance review completed with score 7+ (STRONG)
- [ ] All HIGH priority gaps remediated before audit
- [ ] Evidence compiled and organized for auditor access
- [ ] All policies current and approved
- [ ] Operational controls tested and verified
- [ ] Cross-skill integration validated (no orphaned references)
- [ ] Universal principles implemented and verified
- [ ] Compliance language accurate throughout documentation
- [ ] Audit completed with unqualified opinion (or equivalent positive result)
- [ ] All audit findings addressed with corrective action plan

### Related Scenarios
- Scenario 1: New Compliance Program (initial establishment)
- Scenario 5: Security Questionnaire Response (evidence gathering)
- Scenario 10: Annual Compliance Review (routine assessment)

---

## Scenario 7: Vendor Onboarding

### Objective
Onboard a new vendor or subcontractor with security assessment, contract execution, and ongoing monitoring.

### Skills Involved
- business-operations (vendor management procedure)
- contracts-risk-assurance (vendor security assessment, contracts)
- internal-compliance (vendor management policy)
- data-handling-privacy (DPA if processing personal data)
- government-contracting (subcontractor policy if federal contract)

### Timeline
2-6 weeks depending on vendor risk level and contract complexity

### Step-by-Step Workflow

**Phase 1: Vendor Identification and Assessment (Week 1-2)**

1. **Initiate Vendor Onboarding**
   - Location: `internal-compliance/templates/17-vendor-management-policy.md` Section 3
   - Business owner identifies need for vendor services
   - Submit vendor request to procurement or IT
   - Identify vendor: name, services, systems access, data access

2. **Classify Vendor Risk**
   - Location: `contracts-risk-assurance/templates/09-vendor-security-assessment-template.md` Section 1
   - Determine risk tier:
     - **CRITICAL**: Access to production systems or regulated data (PII, PHI, CUI)
     - **HIGH**: Access to sensitive systems or confidential data
     - **MEDIUM**: Access to internal systems or internal data
     - **LOW**: No system access, public information only
   - Risk tier determines assessment depth and approval level

3. **Conduct Vendor Security Assessment**
   - Location: `contracts-risk-assurance/templates/09-vendor-security-assessment-template.md`
   - Request vendor documentation:
     - Security policies and procedures
     - SOC 2 report, ISO 27001 certificate (if applicable)
     - Certifications (SAM.gov, industry-specific)
     - Security questionnaire response
     - Cyber insurance certificate
     - Breach notification procedures
   - Assess vendor security posture:
     - Information security program
     - Access controls and authentication
     - Data protection and encryption
     - Incident response and business continuity
     - Compliance frameworks (NIST, ISO, SOC 2, HIPAA, GDPR)
   - Score vendor using rubric (1-10 scale, 7+ required for CRITICAL vendors)

4. **Review Vendor References**
   - Contact vendor references (at least 2 for CRITICAL/HIGH vendors)
   - Ask about security, reliability, responsiveness, breach history
   - Document reference feedback

5. **Conduct Financial Due Diligence**
   - Review vendor financial stability (D&B report, financial statements)
   - Assess business continuity risk (single point of failure, succession plan)
   - For CRITICAL vendors, assess vendor's vendor management (fourth-party risk)

**Phase 2: Contract Negotiation (Week 2-4)**

6. **Determine Contract Type**
   - Vendor providing services under existing agreement? → Use SOW or task order
   - New vendor relationship? → Use MSA + SOW
   - Vendor processing personal data? → Use DPA (GDPR/CCPA) or BAA (HIPAA)
   - Federal subcontractor? → Use subcontract with FAR flow-down clauses

7. **Draft Contract**
   - Location: `contracts-risk-assurance/templates/`
   - Use appropriate template:
     - Template 01: Master Services Agreement (general services)
     - Template 02: Statement of Work (specific deliverables)
     - Template 03: Data Processing Agreement (if processing personal data)
     - Template 04: Business Associate Agreement (if processing PHI)
     - Template 05: Service Level Agreement (if performance guarantees required)
   - Include required security terms:
     - Data protection and security requirements
     - Incident notification requirements (24-48 hours)
     - Audit rights (annual assessment or on-demand)
     - Data return/destruction at contract end
     - Indemnification for security breaches
     - Cyber insurance requirements (CRITICAL vendors)

8. **Add Federal Flow-Down Clauses (if applicable)**
   - Location: `government-contracting/templates/09-procurement-subcontractor-policy.md` Section 2
   - Include FAR flow-down clauses for federal subcontracts:
     - FAR 52.204-21 (Basic Safeguarding of Covered Contractor Information Systems)
     - FAR 52.204-23 (Prohibition on Contracting for Hardware, Software, and Services Developed by Kaspersky Lab)
     - DFARS 252.204-7012 (Safeguarding Covered Defense Information and Cyber Incident Reporting)
     - Contract-specific security requirements
   - Include NIST 800-171 compliance requirement if handling CUI
   - Include mandatory reporting requirements

9. **Add Data Protection Addendum (if processing personal data)**
   - Location: `contracts-risk-assurance/templates/03-data-processing-agreement-template.md`
   - Define data processing scope (what data, what purpose, what processing activities)
   - Define data protection requirements (encryption, access control, logging)
   - Define subprocessor requirements (approval, contracts, monitoring)
   - Define data subject rights support
   - Define breach notification timeline (72 hours for GDPR)
   - Define audit rights and frequency

10. **Negotiate and Execute Contract**
    - Vendor reviews and negotiates terms
    - Legal review by both parties
    - Executive approval (CEO or authorized signatory)
    - Both parties execute contract
    - Retain executed contract in vendor file

**Phase 3: Vendor Access Provisioning (Week 4-5)**

11. **Provision Vendor Access**
    - Location: `internal-compliance/templates/03-access-control-policy.md` Section 5
    - Create vendor accounts with least-privilege access
    - Configure MFA for vendor accounts (2-Step Verification required)
    - Configure temporary or time-limited access (if applicable)
    - Document access provisioning in IAM audit log
    - Provide vendor with access credentials and security guidelines

12. **Configure Vendor Monitoring**
    - Configure audit logging for vendor activity
    - Configure SIEM alerts for anomalous vendor activity
    - Configure DLP policies to prevent data exfiltration by vendor
    - Schedule access reviews (quarterly for CRITICAL, annually for others)

**Phase 4: Ongoing Vendor Management (Ongoing)**

13. **Monitor Vendor Performance**
   - Location: `government-contracting/templates/09-procurement-subcontractor-policy.md` Section 3 (if federal)
   - Location: `contracts-risk-assurance/templates/05-service-level-agreement-template.md` (if SLA)
   - Track vendor deliverables and performance against SLA
   - Track vendor incidents or security issues
   - Track vendor changes (acquisitions, subprocessors, certifications)
   - Conduct quarterly or annual performance reviews

14. **Conduct Annual Security Reassessment**
   - Location: `contracts-risk-assurance/templates/09-vendor-security-assessment-template.md`
   - Request updated vendor documentation (SOC 2 report, certifications)
   - Re-assess vendor security posture
   - Update vendor risk score
   - If score decreases below threshold, escalate and consider remediation or termination

15. **Manage Vendor Changes**
   - Vendor notifies of material changes (subprocessors, data location, security controls)
   - Assess impact of change on risk profile
   - Update vendor assessment and contracts if needed
   - Approve or reject change

16. **Respond to Vendor Incidents**
   - Vendor notifies of security incident per contract terms (24-48 hours)
   - Assess impact on organization and clients
   - Invoke internal incident response if organization data affected
   - Invoke breach notification if personal data compromised (data-handling-privacy Template 06)
   - Invoke mandatory reporting if federal contract (government-contracting Template 06)
   - Document incident in vendor file and risk register

**Phase 5: Vendor Offboarding (When Contract Ends)**

17. **Plan Vendor Offboarding**
   - Location: `internal-compliance/templates/17-vendor-management-policy.md` Section 6
   - Identify contract end date or termination date
   - Identify data return or destruction requirements
   - Identify knowledge transfer requirements
   - Identify system transition requirements (if moving to new vendor)

18. **Revoke Vendor Access**
   - Disable vendor accounts
   - Revoke credentials and tokens
   - Remove vendor from IAM policies
   - Remove vendor from physical access systems
   - Document access revocation in audit log

19. **Ensure Data Return or Destruction**
   - Vendor returns or destroys organization data per contract terms
   - Vendor provides certificate of destruction (for regulated data)
   - Verify data deleted from vendor systems (if audit rights allow)
   - Document data disposition in vendor file

20. **Conduct Final Vendor Review**
   - Document vendor performance for future reference
   - Document lessons learned
   - Update vendor management procedures based on experience
   - Retain vendor file per retention schedule (3 years minimum for federal)

### Success Criteria
- [ ] Vendor security assessment completed with acceptable score
- [ ] Contract includes all required security terms and flow-down clauses
- [ ] DPA or BAA executed if processing personal data
- [ ] Vendor access provisioned with least privilege and MFA
- [ ] Vendor monitoring configured with alerts for anomalous activity
- [ ] Annual security reassessments scheduled and completed
- [ ] Vendor incidents reported and managed per procedures
- [ ] Vendor offboarding completed with access revoked and data returned/destroyed

### Related Scenarios
- Scenario 3: Employee Onboarding (similar access provisioning)
- Scenario 4: Security Incident Response (vendor incident)
- Scenario 5: Security Questionnaire Response (assessing your vendors)

---

## Scenario 8: Data Breach Response

### Objective
Respond to a data breach involving personal information (PII, PHI, CUI), conduct investigation, and execute breach notifications per regulatory requirements.

### Skills Involved
- internal-compliance (incident response)
- data-handling-privacy (breach notification - PRIMARY)
- government-contracting (mandatory reporting if federal)
- contracts-risk-assurance (client notification per contracts)

### Timeline
- **Detection to Breach Determination**: 24-48 hours
- **GDPR Notification**: 72 hours to supervisory authority
- **HIPAA Notification**: 60 days to HHS and individuals
- **Federal Notification**: 1-24 hours depending on data type
- **State Law Notification**: "Without unreasonable delay" (typically 30-45 days)

### Step-by-Step Workflow

**Phase 1: Detection and Initial Response (Hours 0-24)**

1. **Follow Incident Response Procedures**
   - Location: `internal-compliance/templates/04-incident-response-plan.md`
   - Detect incident (unauthorized access, malware, data exfiltration)
   - Activate Incident Response Team
   - Contain incident (isolate systems, disable accounts, preserve evidence)
   - See Scenario 4 (Security Incident Response) for detailed IR procedures

2. **Determine if Personal Information Involved**
   - Location: `data-handling-privacy/templates/06-breach-notification-procedure.md` Section 2
   - Was personal information accessed, acquired, or exfiltrated?
   - What types of personal information:
     - **PII**: Names, addresses, SSNs, driver's licenses, financial accounts
     - **PHI**: Health information, medical records, insurance information
     - **CUI**: Federal controlled unclassified information
     - **Other**: Credentials, biometrics, children's information
   - How many individuals affected?
   - What jurisdictions? (GDPR: EU residents, CCPA: California residents, HIPAA: US patients, etc.)

3. **Classify Breach Severity**
   - **CRITICAL**: Large-scale breach (>500 individuals), sensitive data (SSN, financial, health), high risk of harm
   - **HIGH**: Medium-scale breach (50-500 individuals), sensitive data, moderate risk of harm
   - **MEDIUM**: Small-scale breach (<50 individuals), less sensitive data, low risk of harm
   - **LOW**: Technical breach with no actual access or acquisition of data

**Phase 2: Investigation and Breach Determination (Hours 24-48)**

4. **Investigate Breach Scope**
   - Determine attack vector (phishing, vulnerability, misconfiguration, insider)
   - Determine timeline (when did unauthorized access begin and end?)
   - Determine data accessed, acquired, or exfiltrated
   - Determine attacker identity (external threat actor, insider, vendor, unknown)
   - Determine attacker motivation (financial, espionage, hacktivism, accidental)

5. **Determine Notification Requirements**
   - Location: `data-handling-privacy/templates/06-breach-notification-procedure.md` Section 3
   - Identify applicable regulations:
     - **GDPR** (EU residents): 72 hours to supervisory authority, without undue delay to individuals
     - **HIPAA** (PHI): 60 days to HHS and individuals, immediate to media if >500 individuals
     - **CCPA** (California residents): No specific breach notification timeline (follow California Civil Code § 1798.82)
     - **State breach notification laws**: Varies (typically "without unreasonable delay" or 30-45 days)
     - **Federal contracts**: 1-24 hours depending on data type and contract terms
   - Determine notification channels and recipients:
     - Affected individuals
     - Regulators (HHS, state AG, supervisory authority)
     - Clients (per contract terms)
     - Media (if required by state law or HIPAA)
     - Credit bureaus (if financial information or SSN compromised)
     - Federal agency (if federal contract)

6. **Assess Federal Reporting Requirements (if applicable)**
   - Location: `government-contracting/templates/06-mandatory-reporting-procedure.md`
   - Does breach involve federal data? (CUI, PII in federal systems, federal contract data)
   - Reporting timelines:
     - **CUI compromise**: 1 hour to Contracting Officer and agency SOC
     - **PII breach in federal system**: 1 hour to agency Privacy Office and Contracting Officer
     - **General data breach**: 24 hours to Contracting Officer
   - Reporting channels: Contracting Officer, COR, agency Security Office, agency Privacy Office, US-CERT

**Phase 3: Breach Notification Preparation (Hours 48-72)**

7. **Draft Individual Notification**
   - Location: `data-handling-privacy/templates/06-breach-notification-procedure.md` Appendix A (template)
   - Include required elements:
     - Description of breach (what happened, when, how discovered)
     - Types of information involved (PII categories, sensitivity)
     - Steps taken to investigate and mitigate (containment, remediation)
     - Steps individuals should take (credit monitoring, password reset, fraud alerts)
     - Contact information for questions
     - Resources available (credit monitoring services, toll-free hotline)
   - Use clear, plain language (avoid technical jargon)
   - Provide in individual's language if required (GDPR)

8. **Draft Regulator Notification**
   - **GDPR** (to supervisory authority):
     - Nature of personal data breach
     - Categories and approximate number of individuals affected
     - Categories and approximate number of personal data records affected
     - Likely consequences of breach
     - Measures taken or proposed to address breach and mitigate harm
     - Contact point for more information (DPO or privacy officer)
   - **HIPAA** (to HHS):
     - Use HHS Breach Notification Form
     - Provide breach details, affected individuals, remediation
   - **State AG** (varies by state):
     - Typically same information as individual notification
     - Include sample individual notification letter

9. **Draft Client Notification**
   - Location: `contracts-risk-assurance/templates/03-data-processing-agreement-template.md` Section 8 (breach notification clause)
   - Notify clients per contract terms (typically 24-72 hours)
   - Provide breach details relevant to client data
   - Describe remediation and mitigation steps
   - Provide timeline for resolution
   - Coordinate with client on their breach notification obligations

10. **Draft Federal Notification (if applicable)**
    - Location: `government-contracting/templates/06-mandatory-reporting-procedure.md` Appendix A (template)
    - Initial notification (within 1-24 hours): Brief description, data affected, initial containment
    - Follow-up written report (within 24-48 hours): Detailed timeline, root cause, remediation plan
    - Coordinate with Contracting Officer on agency breach notification requirements

**Phase 4: Breach Notification Execution (Hours 72+)**

11. **Execute GDPR Notification (if applicable)**
    - Notify supervisory authority within 72 hours of discovery
    - Use authority's notification portal or email
    - Document notification date and time
    - Respond to authority's questions or requests for additional information

12. **Execute HIPAA Notification (if applicable)**
    - Notify HHS within 60 days (via HHS Breach Portal if >500 individuals)
    - Notify affected individuals within 60 days (email, postal mail, or substitute notice if contact info unavailable)
    - Notify media if >500 individuals in same state or jurisdiction
    - Document all notifications with proof of delivery

13. **Execute State Law Notification**
    - Notify affected individuals per state requirements (typically within 30-45 days)
    - Notify state Attorney General if required by state law (varies by state and number of individuals)
    - Notify credit bureaus if required (some states require if >1,000 individuals)
    - Use appropriate notification method (email, postal mail, substitute notice)
    - Document all notifications

14. **Execute Client Notification**
    - Notify all clients with data affected per contract terms
    - Provide detailed information for client's own breach notification obligations
    - Coordinate on notification content and timing
    - Document all client notifications

15. **Execute Federal Notification (if applicable)**
    - Submit initial notification within 1-24 hours (email, phone, web portal)
    - Submit written report within 24-48 hours (detailed report)
    - Provide updates as investigation progresses
    - Coordinate with federal agency on their breach notification obligations

16. **Provide Remediation Services**
    - Offer credit monitoring or identity theft protection (if financial data or SSN compromised)
    - Set up toll-free hotline for affected individuals
    - Assign staff to respond to questions
    - Track inquiries and responses

**Phase 5: Post-Breach Activities (Days 30-90)**

17. **Respond to Regulator Inquiries**
    - HHS, state AG, or supervisory authority may request additional information
    - Provide requested information promptly
    - Coordinate with legal counsel on responses
    - Track all regulator communications

18. **Respond to Affected Individuals**
    - Answer questions from affected individuals
    - Provide status updates on remediation
    - Address complaints or concerns
    - Document all communications

19. **Conduct Post-Incident Review**
    - See Scenario 4 (Security Incident Response) for post-incident review procedures
    - Focus on breach-specific lessons learned:
      - How was personal information exposed?
      - Were data classification and handling procedures adequate?
      - Were breach notification procedures effective?
      - Were notification timelines met?
      - What improvements are needed?

20. **Update Risk Register and Documentation**
    - Document breach in security-governance risk register
    - Update data-handling-privacy procedures based on lessons learned
    - Update internal-compliance incident response plan
    - Update contracts-risk-assurance breach notification clauses in contracts
    - Conduct breach response tabletop exercise for IR team

### Success Criteria
- [ ] Breach detected and contained within 24 hours
- [ ] Personal information scope identified within 48 hours
- [ ] All required notifications made within regulatory timelines:
  - [ ] GDPR: 72 hours to supervisory authority
  - [ ] HIPAA: 60 days to HHS and individuals
  - [ ] Federal: 1-24 hours depending on data type
  - [ ] State laws: Per state requirements
  - [ ] Clients: Per contract terms
- [ ] All affected individuals notified with clear guidance
- [ ] Remediation services provided (credit monitoring, hotline)
- [ ] All regulator inquiries answered promptly
- [ ] Post-incident review completed with improvements implemented
- [ ] No regulatory fines or penalties (or minimized through good-faith efforts)

### Related Scenarios
- Scenario 4: Security Incident Response (general incident response)
- Scenario 5: Security Questionnaire Response (breach history questions)
- Scenario 10: Annual Compliance Review (breach response effectiveness)

---

## Scenario 9: Federal Contract Closeout

### Objective
Complete closeout procedures for a federal contract including final deliverables, financial reconciliation, data disposition, knowledge transfer, and final reporting.

### Skills Involved
- government-contracting (closeout procedure - PRIMARY)
- data-handling-privacy (data return/destruction)
- business-operations (knowledge transfer, lessons learned)
- contracts-risk-assurance (final contract documentation)

### Timeline
60-120 days from contract end or completion of performance

### Step-by-Step Workflow

**Phase 1: Closeout Planning (Days 1-14)**

1. **Initiate Closeout Process**
   - Location: `government-contracting/templates/07-closeout-offboarding-procedure-gov.md` Section 1
   - Identify contract end date or completion of performance
   - Assign closeout coordinator (Program Manager or Contract Administrator)
   - Review contract terms for closeout requirements
   - Create closeout checklist with milestones and deadlines

2. **Notify Federal Agency**
   - Notify Contracting Officer (CO) or Contracting Officer's Representative (COR) of impending closeout
   - Request closeout meeting or guidance
   - Confirm deliverables and documentation requirements
   - Confirm data disposition requirements

3. **Review Contract Requirements**
   - Review all contract clauses related to closeout:
     - Final deliverables and acceptance criteria
     - Final invoicing and payment
     - Data rights and disposition
     - Property disposition (if government-furnished equipment or property)
     - Patent and intellectual property rights
     - Audit and records retention requirements
   - Identify any outstanding tasks, deliverables, or obligations

**Phase 2: Final Deliverables and Documentation (Days 15-30)**

4. **Complete Final Deliverables**
   - Location: `government-contracting/templates/07-closeout-offboarding-procedure-gov.md` Section 2
   - Identify all outstanding deliverables per contract
   - Complete and submit all deliverables
   - Obtain CO/COR acceptance of deliverables
   - Document acceptance in closeout file

5. **Prepare Final Reports**
   - Final technical report (if required by contract)
   - Final performance report
   - Lessons learned report (internal and submitted to agency if required)
   - Final financial report (if cost-reimbursable contract)
   - Final property report (if government-furnished equipment or property)

6. **Obtain Government Acceptance**
   - Submit final deliverables and reports to CO/COR
   - Address any deficiencies or comments
   - Obtain written acceptance from CO/COR
   - Document acceptance in closeout file

**Phase 3: Financial Reconciliation (Days 31-60)**

7. **Reconcile Contract Financials**
   - Location: `government-contracting/templates/07-closeout-offboarding-procedure-gov.md` Section 3
   - Review all invoices submitted and payments received
   - Identify any outstanding invoices or payments
   - Reconcile labor hours, travel expenses, materials, subcontractor costs
   - Prepare final invoice (if outstanding balance)

8. **Submit Final Invoice**
   - Prepare final invoice with all supporting documentation
   - Submit to CO/COR per contract payment procedures
   - Follow up on payment status
   - Obtain final payment

9. **Close Financial Records**
   - Ensure all payments received
   - Document final contract value and funding
   - Close contract in financial system
   - Retain financial records per FAR requirements (3 years minimum after final payment)

**Phase 4: Data Disposition (Days 61-75)**

10. **Identify Federal Data**
    - Location: `government-contracting/templates/03-federal-data-handling-foia-policy.md` Section 8
    - Location: `data-handling-privacy/templates/03-data-lifecycle-management.md` Section 5
    - Identify all federal data in contractor systems:
      - CUI (Controlled Unclassified Information)
      - PII (Personally Identifiable Information)
      - PHI (Protected Health Information)
      - FTI (Federal Tax Information)
      - Other federal data or records
    - Identify data location (systems, backups, logs, archives)

11. **Return or Destroy Federal Data**
    - Determine disposition per contract:
      - **Return**: Transfer data to agency (secure transfer, encrypted, certified delivery)
      - **Destroy**: Permanently destroy data per NIST 800-88 guidelines
    - Choose destruction method:
      - **Electronic media**: Cryptographic erasure, physical destruction, degaussing
      - **Paper records**: Cross-cut shredding, incineration
      - **Backup media**: Overwrite or physical destruction
    - Document data disposition (date, method, media serial numbers, witness)

12. **Obtain Certificate of Destruction**
    - Prepare certificate of data destruction (if destroyed)
    - Include: contract number, data types, destruction method, date, witness signature
    - Submit to CO/COR
    - Retain copy in closeout file

13. **Verify Data Removal**
    - Verify federal data removed from all systems, backups, archives
    - Verify data removed from vendor systems (if subcontractors had access)
    - Verify data not retained in logs or monitoring systems (review for PII/CUI)
    - Document verification in closeout file

**Phase 5: Knowledge Transfer and Offboarding (Days 76-90)**

14. **Conduct Knowledge Transfer**
    - Location: `government-contracting/templates/07-closeout-offboarding-procedure-gov.md` Section 5
    - Transfer knowledge to agency personnel or follow-on contractor
    - Provide system documentation, technical guides, runbooks
    - Provide training or briefings to agency personnel
    - Document knowledge transfer activities

15. **Offboard Federal-Specific Access**
    - Revoke federal facility access (badges, keys)
    - Revoke access to federal systems (accounts, VPNs, portals)
    - Return government-furnished equipment or property
    - Document access revocation

16. **Offboard Personnel**
    - Location: `business-operations/templates/02-employee-offboarding-procedure.md`
    - Offboard personnel assigned to federal contract
    - Revoke clearances (if applicable)
    - Conduct exit briefings on security and confidentiality obligations
    - Document personnel offboarding

**Phase 6: Final Reporting and Post-Closeout (Days 91-120)**

17. **Prepare Lessons Learned**
    - Location: `government-contracting/templates/07-closeout-offboarding-procedure-gov.md` Section 6
    - Conduct lessons learned session with project team
    - Document:
      - What went well (successes, best practices)
      - What could be improved (challenges, issues, recommendations)
      - Process improvements for future contracts
      - Technical lessons learned
      - Compliance and security lessons learned
    - Share lessons learned with organization
    - Submit to federal agency if required

18. **Submit Final Closeout Package**
    - Compile all closeout documentation:
      - Final deliverables and acceptance
      - Final financial reconciliation
      - Data disposition certificate
      - Knowledge transfer documentation
      - Lessons learned report
      - Any other contract-required closeout documents
    - Submit to CO/COR
    - Request contract closeout or completion statement

19. **Obtain Contract Completion**
    - CO/COR reviews closeout package
    - CO/COR issues contract completion or closeout statement
    - Obtain written confirmation of contract closeout
    - Document closeout date

20. **Post-Closeout Activities**
    - Update capability statement with contract performance (government-contracting Template 01)
    - Update past performance documentation for future proposals
    - File closeout documentation per retention schedule (3 years minimum after final payment)
    - Retain contract file for future reference or audit
    - Update government-contracting skill based on lessons learned

### Success Criteria
- [ ] All final deliverables submitted and accepted
- [ ] All outstanding invoices paid and financial records reconciled
- [ ] All federal data returned or destroyed with certificate
- [ ] Knowledge transfer completed with agency or follow-on contractor
- [ ] All federal-specific access revoked and documented
- [ ] Lessons learned documented and shared
- [ ] Contract completion or closeout statement received from CO/COR
- [ ] All closeout documentation retained per FAR requirements
- [ ] Past performance documentation updated
- [ ] Capability statement updated with contract performance

### Related Scenarios
- Scenario 2: Federal Proposal Preparation (use closeout lessons learned for future proposals)
- Scenario 8: Data Breach Response (if breach occurs during closeout)
- Scenario 10: Annual Compliance Review (review contract closeout procedures)

---

## Scenario 10: Annual Compliance Review

### Objective
Conduct annual comprehensive review of entire compliance program, assess maturity, identify gaps, and plan improvements for next year.

### Skills Involved
- compliance-audit (primary - assessment templates)
- All skills (all are subjects of review)

### Timeline
- **Assessment Execution**: 2-4 weeks
- **Gap Analysis and Planning**: 1-2 weeks
- **Executive Review and Approval**: 1 week
- **Total**: 4-7 weeks annually

### Step-by-Step Workflow

**Preparation (Week 1)**

1. **Schedule Annual Review**
   - Location: `compliance-audit/templates/comprehensive-compliance-review.md`
   - Schedule review for Q4 or Q1 (before audit season)
   - Assign reviewers (Compliance Officer, CISO, external consultant if available)
   - Notify skill owners of upcoming review
   - Request updated documentation from all skill owners

2. **Review Previous Year's Findings**
   - Review previous annual review findings
   - Review quarterly assessments from past year
   - Review external audit findings (SOC 2, ISO 27001, client audits)
   - Identify recurring issues or themes

3. **Update Assessment Criteria**
   - Location: `compliance-audit/reference/audit-scoring-criteria.md`
   - Review scoring criteria for currency
   - Update framework requirements (NIST, ISO, SOC 2, etc.) if frameworks updated
   - Update operational realism criteria based on lessons learned

**Assessment Execution (Weeks 2-4)**

4. **Assess Governance (security-governance)**
   - Review Security and Compliance Handbook (last updated, approval status)
   - Verify universal principles implemented across all skills
   - Review consolidated regulatory map for currency
   - Review policy hierarchy and conflict resolution procedures
   - Review risk register (current, complete, reviewed quarterly)
   - Score: 1-10 with EXCELLENT/STRONG/ADEQUATE/DEVELOPING/INSUFFICIENT rating

5. **Assess Operational Security (internal-compliance)**
   - Review all 21 operational policies (currency, approval, communication)
   - Assess incident response capability (IR exercises, lessons learned)
   - Assess access control implementation (IAM audit logs, access reviews, MFA enrollment)
   - Assess logging and monitoring (no-PII-in-logs validated, SIEM alerts reviewed)
   - Assess business continuity (BC/DR testing, RTO/RPO achievement)
   - Assess training program (completion rates, effectiveness)
   - Score each policy area: 1-10 with category rating

6. **Assess Privacy Program (data-handling-privacy)**
   - Review all 7 privacy templates (currency, approval, implementation)
   - Assess data classification (applied to all systems, accurate)
   - Assess anonymization techniques (implemented in logging, AI/ML)
   - Assess retention schedule (harmonized, implemented, automated where possible)
   - Assess breach notification procedures (tested, timelines achievable)
   - Assess privacy rights implementation (request procedures, response timelines)
   - Score privacy program: 1-10 with category rating

7. **Assess Federal Posture (government-contracting, if applicable)**
   - Review all 9 federal templates (currency, accuracy)
   - Assess capability statement (certifications current, competencies accurate)
   - Assess NIST alignment (gap analysis current, remediation progress)
   - Assess mandatory reporting (timelines met, procedures tested)
   - Assess federal data handling (CUI procedures implemented)
   - Assess compliance language (honest, no overstatement)
   - Score federal posture: 1-10 with category rating

8. **Assess Cloud Security (cloud-platform-security)**
   - Review all 7 cloud templates (configurations current, documented)
   - Assess Google Workspace security (2SV enrollment, DLP policies, Alert Center monitoring)
   - Assess GCP security (IAM policies, VPC config, Security Command Center findings)
   - Assess DLP implementation (aligned with data classification, effective)
   - Assess monitoring and logging (comprehensive, no PII captured)
   - Assess Vertex AI governance (data handling, model security)
   - Score cloud security: 1-10 with category rating

9. **Assess Business Operations (business-operations)**
   - Review all 10 business templates (currency, implementation)
   - Assess onboarding/offboarding (security integrated, access controls effective)
   - Assess training program (security awareness, role-specific training)
   - Assess client onboarding (compliance assessments, risk classification)
   - Assess quality assurance (security review gates)
   - Score business operations: 1-10 with category rating

10. **Assess Contracts and Risk (contracts-risk-assurance)**
    - Review all 10 contract templates (currency, legal review)
    - Assess contract template usage (applied consistently)
    - Assess vendor management (assessments current, monitoring effective)
    - Assess risk assessments (conducted, documented, mitigated)
    - Score contracts and risk: 1-10 with category rating

**Cross-Skill Integration Assessment (Week 3)**

11. **Validate Cross-Skill Dependencies**
    - Location: `compliance-audit/templates/cross-package-dependency-review.md`
    - Verify all cross-references accurate (no orphaned references)
    - Verify governance hierarchy clear (security-governance at root)
    - Verify retention harmonized (data-handling-privacy authoritative)
    - Verify universal principles integrated (data-as-regulated, no-PII-in-logs, role combination)
    - Identify integration gaps or inconsistencies

12. **Validate Compliance Frameworks**
    - Location: `shared-reference/compliance-framework-map.md`
    - Review framework applicability (NIST, ISO, SOC 2, HIPAA, FedRAMP, GDPR/CCPA)
    - Verify control mappings current (frameworks updated, controls mapped)
    - Verify compliance language accurate (aligned vs. compliant vs. certified)
    - Identify framework gaps or misalignments

**Gap Analysis and Remediation Planning (Week 4)**

13. **Compile Assessment Findings**
    - Aggregate scores across all skills
    - Calculate overall maturity score (weighted average)
    - Identify strengths (EXCELLENT/STRONG areas)
    - Identify gaps (ADEQUATE/DEVELOPING/INSUFFICIENT areas)
    - Identify cross-skill integration issues

14. **Prioritize Gaps**
    - HIGH Priority: Audit blockers, regulatory requirements, critical security controls
    - MEDIUM Priority: Important improvements, efficiency gains, framework alignment
    - LOW Priority: Nice-to-have enhancements, future considerations

15. **Create Remediation Plan**
    - For each HIGH and MEDIUM gap:
      - Define specific remediation action
      - Assign owner (specific person, not role)
      - Set target completion date (realistic timeline)
      - Identify resources needed (budget, tools, personnel)
      - Identify dependencies or blockers
    - Create phased implementation plan (Q1, Q2, Q3, Q4)

16. **Update Compliance Roadmap**
    - Location: `compliance-audit/templates/compliance-roadmap-checklist.md`
    - Update roadmap with remediation milestones
    - Add new initiatives (framework certifications, tool implementations)
    - Update target dates based on progress and priorities
    - Align with business objectives and budget

**Executive Review and Approval (Week 5)**

17. **Prepare Executive Summary**
    - Overall maturity score and trend (compared to previous year)
    - Key strengths and areas of excellence
    - Priority gaps and risks
    - Remediation plan summary with budget and timeline
    - Compliance framework readiness (audit preparation)
    - Recommendations for next year

18. **Conduct Executive Review**
    - Present findings to CEO, CISO, senior leadership
    - Discuss priorities and resource allocation
    - Obtain approval for remediation plan and budget
    - Obtain approval for compliance roadmap
    - Obtain signatures on comprehensive compliance review

19. **Communicate Results**
    - Communicate results to all skill owners
    - Communicate priorities and expectations to personnel
    - Update compliance-research skill with regulatory changes affecting next year
    - Update compliance-usage skill if usage patterns changed

**Follow-Up and Continuous Improvement (Ongoing)**

20. **Track Remediation Progress**
    - Quarterly reviews of remediation plan progress
    - Monthly check-ins with remediation owners
    - Escalate blockers or delays
    - Adjust timelines based on progress and priorities

21. **Conduct Quarterly Assessments**
    - Location: `compliance-audit/templates/package-maturity-assessment.md`
    - Lightweight quarterly assessments to track progress
    - Focus on remediation areas and priority gaps
    - Update overall maturity score quarterly
    - Report progress to executive leadership

22. **Prepare for Next Annual Review**
    - Document lessons learned from this year's review
    - Identify process improvements for next year
    - Update assessment templates based on experience
    - Schedule next annual review

### Success Criteria
- [ ] All 7 skills assessed with consistent scoring methodology
- [ ] Overall maturity score 7+ (STRONG) or improving trend
- [ ] All priority gaps identified and documented
- [ ] Remediation plan created with owners and dates
- [ ] Compliance roadmap updated with next year's milestones
- [ ] Executive approval obtained for plan and budget
- [ ] Results communicated to all stakeholders
- [ ] Quarterly progress tracking established
- [ ] Continuous improvement process active

### Related Scenarios
- Scenario 1: New Compliance Program (initial establishment)
- Scenario 6: Compliance Audit Preparation (external audit readiness)
- All Scenarios: Annual review informs improvements to all operational areas

---

## Related Documentation

### Core Reference Documents
- `README.md`: System overview, skills inventory, quick start guide
- `LIFECYCLE.md`: Governance hierarchy, skill lifecycle stages, dependency mapping
- `DISPOSITION.md`: Source-to-artifact traceability and conversion documentation
- `shared-reference/universal-principles.md`: Three foundational principles applied across all skills
- `shared-reference/package-dependency-matrix.md`: Complete dependency mapping and integration points
- `shared-reference/compliance-framework-map.md`: Multi-framework alignment (NIST, ISO, SOC 2, HIPAA, FedRAMP, GDPR/CCPA)
- `shared-reference/retention-schedule.md`: Consolidated retention requirements across all contexts

### Skill-Specific Documentation
Each skill includes:
- `SKILL.md`: Purpose, scope, process, inputs, outputs, dependencies, governance
- `templates/`: Operational templates (policies, procedures, contracts, assessments)
- `reference/`: Supporting documentation (research, usage guides, scoring criteria)

---

**Document Control**
- **Version:** 1.0
- **Created:** 2026-02-07
- **Last Updated:** 2026-02-07
- **Owner:** CISO / Compliance Officer
- **Review Frequency:** Annual or when major scenarios change
- **Classification:** Internal Use
- **Retention:** Permanent (operational guidance)
