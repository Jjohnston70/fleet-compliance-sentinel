# Internal Compliance

## 1. Skill Identity
- **Name**: internal-compliance
- **Version**: 1.0
- **Status**: Active
- **Domain**: Federal Compliance — Internal Security Policies & Procedures
- **Origin**: Converted from PACKAGE_1_INTERNAL_COMPLIANCE

## 2. Scope
**What this skill does**: Provides comprehensive internal security policies and operational procedures covering information security, access control, incident response, business continuity, disaster recovery, change management, vulnerability management, patch management, backup and recovery, encryption and key management, password policies, remote access, mobile devices, BYOD, asset management, vendor management, physical security, security awareness training, audit logging and monitoring, and compliance management. These policies form the operational foundation for day-to-day security operations.

**What this skill does NOT do**: Does not provide the master governance framework (see security-governance skill). Does not define data handling and privacy requirements (see data-handling-privacy skill). Does not provide platform-specific implementation details (see cloud-platform-security skill). Does not provide federal contracting requirements (see government-contracting skill). Does not provide client-facing contract templates (see contracts-risk-assurance skill).

## 3. Process Definition
- **Compliance Areas**:
  - Information security program governance and policy framework
  - User access management and authentication controls
  - Incident detection, response, containment, eradication, and recovery
  - Business continuity planning and alternate operations
  - Disaster recovery procedures and system restoration
  - Change management for systems and applications
  - Vulnerability identification, assessment, and remediation
  - Patch management for operating systems and applications
  - Backup procedures and data recovery testing
  - Encryption key lifecycle management
  - Password complexity, rotation, and management
  - Remote access security and VPN requirements
  - Mobile device security and MDM requirements
  - Bring Your Own Device (BYOD) security standards
  - IT asset inventory, tracking, and lifecycle management
  - Vendor security assessment and ongoing monitoring
  - Physical facility security and access controls
  - Security awareness training and phishing simulations
  - Audit logging, monitoring, and SIEM operations
  - Compliance management framework and continuous monitoring
- **Decision Points**:
  - Access approval (manager, data owner, IT security multi-level review)
  - Incident severity classification (Critical, High, Medium, Low)
  - Business continuity plan activation criteria
  - Recovery time objectives (RTO) and recovery point objectives (RPO)
  - Change approval and emergency change procedures
  - Vulnerability remediation prioritization based on risk
  - Patch deployment scheduling (emergency vs. standard)
  - Encryption algorithm and key length selection
  - MFA requirement determination (privileged, remote, sensitive data access)
  - Mobile device management (MDM) enforcement decisions
  - BYOD approval and security baseline requirements
  - Vendor risk classification (Low, Medium, High)
  - Security training frequency and role-specific requirements
  - Log retention periods (compliance-driven: minimum 1 year)
  - Compliance assessment frequency and audit scope
- **Success Criteria**:
  - All personnel complete security awareness training within 30 days of hire
  - Access provisioned within documented timeframes and removed immediately upon termination
  - Incident response procedures activated and executed per severity SLAs
  - Business continuity tested annually with documented results
  - Critical vulnerabilities remediated within defined timeframes (Critical: 7 days, High: 30 days)
  - Systems patched per schedule (Critical patches: 7 days, Standard patches: 30 days)
  - Backup restoration tested quarterly with 100% success rate
  - Encryption implemented for all Confidential and Restricted data
  - Multi-factor authentication enforced for privileged and remote access
  - Mobile devices meet security baseline (encryption, password, MDM)
  - Vendor security assessments completed before engagement
  - Physical access controls enforced and visitor access logged
  - Security logs retained and reviewed per policy
  - Compliance audits conducted quarterly with findings tracked to closure

## 4. Inputs
- Organizational structure (roles, departments, personnel)
- System and application inventory
- Data classification and sensitivity levels
- Business criticality and recovery objectives (RTO/RPO)
- Regulatory and contractual compliance requirements
- Vendor and third-party relationships
- Facility and physical asset locations
- Current threat landscape and vulnerability data
- Incident and security event data

## 5. Outputs
1. `01-information-security-policy.md` — Foundational security policy establishing objectives, principles, and governance
2. `02-acceptable-use-policy.md` — Requirements for appropriate use of systems, networks, devices, and data
3. `03-access-control-policy.md` — User access management, authentication, authorization, and access reviews
4. `04-incident-response-plan.md` — Detection, analysis, containment, eradication, recovery, and post-incident procedures
5. `05-business-continuity-plan.md` — Business impact analysis, continuity strategies, and alternate operations
6. `06-disaster-recovery-plan.md` — Technical recovery procedures for IT systems and data
7. `07-change-management-procedure.md` — Change request, approval, testing, deployment, and rollback procedures
8. `08-vulnerability-management-procedure.md` — Vulnerability scanning, assessment, prioritization, and remediation
9. `09-patch-management-procedure.md` — Patch testing, scheduling, deployment, and verification
10. `10-backup-recovery-procedure.md` — Backup scheduling, storage, encryption, testing, and restoration
11. `11-encryption-key-management.md` — Key generation, distribution, rotation, storage, and destruction
12. `12-password-policy.md` — Password complexity, expiration, history, and management requirements
13. `13-remote-access-policy.md` — VPN, MFA, approved devices, and remote work security
14. `14-mobile-device-policy.md` — Company-issued device security, MDM, and acceptable use
15. `15-byod-policy.md` — Personal device security baseline, MDM, and data separation
16. `16-asset-management-policy.md` — IT asset inventory, tracking, lifecycle management, and disposal
17. `17-vendor-management-policy.md` — Vendor security assessment, monitoring, contracts, and access management
18. `18-physical-security-policy.md` — Facility access controls, visitor management, surveillance, and environmental controls
19. `19-security-awareness-training-program.md` — Training requirements, topics, delivery, tracking, and phishing simulations
20. `20-audit-logging-monitoring-policy.md` — Logging requirements, log management, SIEM, monitoring, and alerting
21. `21-compliance-management-framework.md` — Compliance program structure, assessments, remediation tracking, and reporting

## 6. Reference Data Dependencies
- **security-governance skill**: Master governance document; all internal compliance policies operate under this authority
- **data-handling-privacy skill**: Data classification drives access controls, encryption, backup retention, and incident response procedures
- **cloud-platform-security skill**: Platform-specific implementation of access controls, logging, backup, encryption, and monitoring
- **government-contracting skill**: Federal security requirements overlay on internal policies (NIST, FIPS, CUI handling)
- **business-operations skill**: Service level agreements and operational procedures reference security policies

## 7. Constraints
- No execution authority — policies and procedures only, requires management approval for enforcement
- Policies must be approved by CISO and CEO before implementation
- Policy exceptions require written approval from CISO with documented compensating controls
- Incident response procedures must comply with regulatory notification timelines (HIPAA: 60 days, GDPR: 72 hours)
- Business continuity and disaster recovery objectives (RTO/RPO) must align with business requirements
- Access control decisions require manager and data owner approval
- Vendor security assessments require CISO approval before vendor engagement
- Compliance framework must accommodate multiple regulatory requirements (HIPAA, GDPR, CCPA, NIST)
- All policies must be reviewed annually and updated as needed

## 8. Integration Points
- **security-governance skill**: All 21 internal compliance policies operate under the master governance framework; governance document establishes policy authority and compliance requirements
- **data-handling-privacy skill**: Information Security Policy, Acceptable Use Policy, Access Control Policy, Incident Response Plan, Backup Recovery Procedure, and Encryption Key Management all reference data classification and handling requirements; Incident Response Plan integrates with Breach Notification Procedure; Acceptable Use Policy references Anonymization Standard for AI/ML data protection
- **cloud-platform-security skill**: Access Control Policy integrates with Cloud IAM Policy and Workspace Security Configuration; Acceptable Use Policy references platform-specific security standards; Audit Logging and Monitoring Policy integrates with cloud logging; Backup Recovery Procedure leverages cloud backup services
- **government-contracting skill**: Information Security Policy, Incident Response Plan, and Compliance Management Framework incorporate federal security requirements; Audit Logging and Monitoring Policy implements federal audit requirements
- **business-operations skill**: Business Continuity Plan and Disaster Recovery Plan support SLA commitments; Change Management Procedure coordinates with operational change windows
- **contracts-risk-assurance skill**: Incident Response Plan referenced by Business Associate Agreement for PHI breaches; Vendor Management Policy referenced by Vendor Security Assessment template; Audit Logging and Monitoring Policy referenced by Compliance Audit Checklist

## 9. Compliance Lifecycle Position
- **Predecessor**: security-governance skill (establishes master governance framework under which all internal policies operate)
- **Successor**: All other skills depend on internal-compliance policies as the operational security foundation. Policies feed into cloud-platform-security skill (implementation), contracts-risk-assurance skill (contractual requirements), and compliance-audit skill (audit criteria).

## 10. Governance Statement
All policies in this skill are subordinate to the security-governance skill as the master governance document. Policies require CISO and CEO approval before implementation. Policy changes require review and approval by CISO. Policy exceptions require written justification, CISO approval, and documented compensating controls. All policies must be reviewed annually and updated to reflect changes in regulatory requirements, threat landscape, or organizational structure. Compliance with these policies is mandatory for all personnel, contractors, and third parties accessing company systems or data. Policy violations are subject to disciplinary action up to and including termination of employment or contract.
