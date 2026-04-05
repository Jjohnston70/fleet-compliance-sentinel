# Contracts, Risk & Assurance

## 1. Skill Identity
- **Name**: contracts-risk-assurance
- **Version**: 1.0
- **Status**: Active
- **Domain**: Federal Compliance — Contracts & Risk
- **Origin**: Converted from PACKAGE_7_ADVANCED_COMPLIANCE

## 2. Scope
**What this skill does**: Provides standardized legal and contractual templates for client engagements, data processing agreements, HIPAA business associate agreements, non-disclosure agreements, vendor security assessments, compliance auditing, risk assessment, incident response exercise planning, and security questionnaire responses. Covers the full lifecycle from contract negotiation through compliance verification and risk management.

**What this skill does NOT do**: Does not provide legal advice or substitute for legal counsel review. Does not execute contracts or bind parties. Does not perform actual security assessments, penetration testing, or audits. Does not manage active incident response (see internal-compliance skill for Incident Response Plan). Does not define the underlying security policies referenced by these templates (see security-governance skill).

## 3. Process Definition
- **Compliance Areas**:
  - Master services agreements and statements of work
  - Data processing agreements (GDPR, CCPA compliance)
  - HIPAA business associate agreements (PHI handling)
  - Non-disclosure agreements (confidential information protection)
  - Security questionnaire standardized responses
  - Internal compliance audit checklists
  - Risk assessment methodology and risk registers
  - Vendor/third-party security assessments
  - Incident response tabletop exercise planning and execution
- **Decision Points**:
  - Whether a DPA supplement is needed for GDPR/CCPA engagements
  - Whether a BAA is needed for HIPAA-covered entity engagements
  - Mutual vs. one-way NDA selection
  - Vendor risk classification (Low, Medium, High)
  - Risk treatment selection (Accept, Mitigate, Transfer, Avoid)
  - Audit finding severity classification (Critical, High, Medium, Low)
  - Tabletop exercise scenario selection based on threat landscape
- **Success Criteria**:
  - All client engagements have appropriate contractual coverage (MSA + SOW)
  - Data processing agreements executed for all engagements involving personal data
  - BAAs executed for all HIPAA-covered entity engagements
  - NDAs executed before confidential information exchange
  - Security questionnaire responses consistent and accurate
  - Compliance audits conducted quarterly with documented findings
  - Risk assessments conducted annually with documented treatment plans
  - Vendor security assessments completed before vendor engagement
  - Tabletop exercises conducted annually with after-action reports

## 4. Inputs
- Client legal name, address, and authorized representative details
- Engagement scope, deliverables, timeline, and fee structure
- Types of data to be processed (personal data, PHI, confidential, etc.)
- Applicable regulatory requirements (GDPR, CCPA, HIPAA, etc.)
- Vendor information for security assessments
- Organizational risk context for risk assessments
- Current security posture details for questionnaire responses
- Incident scenarios for tabletop exercises

## 5. Outputs
1. `01-master-services-agreement-template.md` — Standard MSA for client engagements
2. `02-statement-of-work-template.md` — SOW template for project scoping
3. `03-data-processing-agreement-template.md` — DPA for GDPR/CCPA compliance
4. `04-business-associate-agreement-template.md` — BAA for HIPAA PHI handling
5. `05-non-disclosure-agreement-template.md` — NDA for confidential information
6. `06-security-questionnaire-response-template.md` — Standardized security responses
7. `07-compliance-audit-checklist.md` — Comprehensive internal audit checklist
8. `08-risk-assessment-template.md` — Risk identification, analysis, and treatment
9. `09-vendor-security-assessment-template.md` — Third-party security evaluation
10. `10-incident-response-tabletop-exercise-guide.md` — IR exercise planning and scenarios

## 6. Reference Data Dependencies
- **security-governance skill**: Master governance document; all contracts and assessments reference the security framework
- **data-handling-privacy skill**: Data handling standards, privacy management policy, breach notification procedures, anonymization standards
- **internal-compliance skill**: Incident response plan, vendor management policy, audit logging and monitoring policy, compliance management framework, acceptable use policy
- **government-contracting skill**: Federal compliance items (FOIA, CUI, federal retention) referenced in audit checklist
- **cloud-platform-security skill**: Google Partner requirements, platform security standards, Vertex AI governance referenced in audit checklist
- **business-operations skill**: Service level agreement templates referenced by SOW

## 7. Constraints
- No execution authority — templates only, requires legal review before use
- Requires authorized signatory for all agreements
- MSA, SOW, DPA, BAA, and NDA require both-party signatures
- Security questionnaire responses must be verified for accuracy before submission
- Audit findings require CISO approval
- Risk acceptance decisions require CISO approval
- Vendor assessments require CISO approval before vendor engagement
- Tabletop exercise documentation must use anonymized/fictional data only (no real PII/PHI/CUI)
- Governing law and jurisdiction must be customized per engagement

## 8. Integration Points
- **security-governance skill**: MSA, SOW, DPA, BAA, NDA, and security questionnaire all reference the security framework as the master governance document
- **data-handling-privacy skill**: MSA includes data protection terms; DPA implements data handling and privacy requirements; BAA implements PHI handling and breach notification; NDA implements confidential data handling; audit checklist covers data protection compliance; vendor assessments evaluate data handling practices; exercises include breach notification scenarios
- **internal-compliance skill**: BAA references incident response plan for PHI breaches; audit checklist covers operational security policies; vendor assessments reference vendor management policy and audit logging requirements; risk assessment integrates into compliance management framework
- **government-contracting skill**: Audit checklist includes federal compliance items (FOIA, CUI handling, federal retention)
- **cloud-platform-security skill**: Audit checklist includes Google Partner requirements and AI governance checks
- **business-operations skill**: SOW may reference security SLAs from the SLA template

## 9. Compliance Lifecycle Position
- **Predecessor**: security-governance skill (establishes security framework referenced by contracts), internal-compliance skill (defines policies implemented through contracts), data-handling-privacy skill (defines data protection requirements embedded in agreements)
- **Successor**: Executed contracts and completed assessments feed back into internal-compliance skill (compliance management), security-governance skill (security posture updates), and business-operations skill (operational execution)

## 10. Governance Statement
All templates in this skill are subordinate to the security-governance skill as the master governance document. Contracts and agreements require legal review before execution. Audit checklists, risk assessments, and vendor assessments require CISO approval. Tabletop exercises require CISO review of materials and after-action reports. All templates should be reviewed annually and updated to reflect changes in regulatory requirements, organizational structure, or security posture.
