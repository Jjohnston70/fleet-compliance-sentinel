# Cloud Platform Security

## 1. Skill Identity
- **Name**: cloud-platform-security
- **Version**: 1.0
- **Status**: Active
- **Domain**: Federal Compliance — Cloud Security & Platform Governance
- **Origin**: Converted from PACKAGE_5_ADVANCED_COMPLIANCE

## 2. Scope
**What this skill does**: Provides standardized security configurations, policies, and compliance standards for cloud platform services including workspace productivity tools, cloud infrastructure, identity and access management, AI/ML governance, data loss prevention, security monitoring, and cloud partner compliance. Covers cloud-specific security controls, configurations, and governance frameworks for organizations using cloud platforms.

**What this skill does NOT do**: Does not provide general IT security policies (see security-governance skill). Does not implement on-premises security controls. Does not define organizational security governance (see security-governance skill). Does not provide vendor selection or procurement guidance. Does not perform actual security assessments or penetration testing. Does not manage cloud service procurement or billing.

## 3. Process Definition
- **Compliance Areas**:
  - Cloud workspace security configuration (email, file storage, collaboration, meetings)
  - Cloud platform security standards (infrastructure, networking, compute, storage)
  - Cloud identity and access management (IAM) policies
  - AI/ML governance and responsible AI policies
  - Data loss prevention (DLP) configuration and monitoring
  - Cloud security monitoring and logging standards
  - Cloud partner compliance requirements
- **Decision Points**:
  - Selection of cloud platform security baseline (NIST, CIS, vendor best practices)
  - IAM role design and least privilege access model
  - DLP rule sensitivity and enforcement actions (warn, block, quarantine)
  - AI/ML risk classification (low, medium, high-risk AI systems)
  - Security monitoring tool selection and integration
  - Data residency and regional compliance requirements
  - Partner certification and compliance validation approach
- **Success Criteria**:
  - Cloud workspace security controls enabled per configuration standard
  - Multi-factor authentication (MFA) enforced for all cloud accounts
  - IAM policies implement least privilege access controls
  - DLP rules detect and prevent sensitive data leakage
  - AI/ML systems governed per responsible AI principles
  - Cloud security monitoring provides comprehensive visibility and alerting
  - Cloud partner compliance validated and documented
  - Quarterly security configuration reviews completed
  - All cloud security incidents logged and investigated

## 4. Inputs
- Organization name, domain, and contact information
- Cloud platform selection (workspace, infrastructure provider)
- Regulatory and compliance requirements (HIPAA, GDPR, FedRAMP, etc.)
- Data classification and handling requirements
- User roles and access requirements
- AI/ML use cases and risk assessment
- Security monitoring and SIEM integration requirements
- Partner certification requirements

## 5. Outputs
1. `01-cloud-workspace-security-configuration.md` — Security configuration for cloud workspace services (email, drive, calendar, meetings)
2. `02-cloud-platform-security-standards.md` — Security standards for cloud infrastructure (compute, storage, networking)
3. `03-cloud-iam-policy.md` — Identity and access management policy for cloud platform
4. `04-cloud-vertex-ai-governance.md` — AI/ML governance and responsible AI policy
5. `05-cloud-data-loss-prevention-configuration.md` — DLP configuration and monitoring standard
6. `06-cloud-security-monitoring-standards.md` — Security monitoring, logging, and alerting standards
7. `07-cloud-partner-compliance-statement.md` — Cloud partner compliance validation and certification

## 6. Reference Data Dependencies
- **security-governance skill**: Master governance document; cloud security standards implement organizational security requirements
- **internal-compliance skill**: Access control policy, audit logging policy, acceptable use policy (AI/ML section), incident response plan, vendor management policy
- **data-handling-privacy skill**: Data classification standards, data handling requirements, anonymization standards, breach notification procedures
- **contracts-risk-assurance skill**: Data processing agreement (DPA), business associate agreement (BAA), vendor security assessment
- **government-contracting skill**: Federal compliance requirements (FedRAMP, CUI handling, FIPS 140-2)

## 7. Constraints
- No execution authority — templates only, requires CISO approval before implementation
- Cloud platform configurations require super admin or appropriate IAM permissions
- DLP rules require testing in audit mode before enforcement mode
- AI/ML governance requires AI governance committee approval for high-risk systems
- Security monitoring requires integration with organizational SIEM
- Partner compliance validation requires partner cooperation and documentation
- Configuration changes must be documented and change-controlled
- All cloud security standards must be reviewed annually
- Templates are vendor-neutral and require customization for specific cloud providers

## 8. Integration Points
- **security-governance skill**: Cloud security standards implement master security framework; cloud IAM implements access control policy; cloud monitoring implements audit logging requirements
- **internal-compliance skill**: Cloud workspace configuration references acceptable use policy; cloud IAM implements access control requirements; cloud monitoring implements audit logging policy; AI governance references acceptable use policy (AI/ML section); incident response plan referenced for cloud security incidents
- **data-handling-privacy skill**: Cloud workspace and platform standards implement data protection requirements; DLP configuration implements data classification and handling standards; AI governance implements data anonymization requirements; breach notification procedures referenced for data incidents
- **contracts-risk-assurance skill**: Cloud workspace and platform configurations support DPA and BAA requirements; vendor security assessment template used for cloud partner validation; security questionnaire responses reference cloud security controls
- **government-contracting skill**: Cloud partner compliance statement addresses federal requirements; cloud platform security standards implement FedRAMP and CUI handling controls

## 9. Compliance Lifecycle Position
- **Predecessor**: security-governance skill (establishes security framework), internal-compliance skill (defines access control and logging policies), data-handling-privacy skill (defines data protection requirements)
- **Successor**: Cloud security configurations feed back into internal-compliance skill (operational security), contracts-risk-assurance skill (security questionnaire responses), compliance-audit skill (configuration audits)

## 10. Governance Statement
All cloud security standards and configurations in this skill are subordinate to the security-governance skill as the master governance document. Cloud platform configurations require CISO approval before implementation. DLP rules require testing and validation before enforcement. AI/ML systems require AI governance committee review and approval. Cloud security monitoring must integrate with organizational SIEM and incident response processes. All cloud security standards should be reviewed annually and updated to reflect changes in cloud provider security features, regulatory requirements, or organizational risk posture. Templates are vendor-neutral and must be customized for specific cloud providers (e.g., replace `[CLOUD_PROVIDER]` with actual provider name).
