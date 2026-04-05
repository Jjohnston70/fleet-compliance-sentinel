# SKILL: security-governance

## 1. Skill Identity

**Name:** security-governance
**Version:** 1.0
**Status:** Active
**Domain:** Federal Compliance — Master Governance
**Origin:** Converted from PACKAGE_2_SECURITY_COMPLIANCE_HANDBOOK

This skill provides the foundational Security and Compliance Handbook that establishes the master governance authority for all compliance operations. All other federal compliance skills operate under the authority of this handbook and must align with its principles, policies, and standards.

## 2. Scope

### What This Skill Covers

The security-governance skill is the **MASTER GOVERNANCE DOCUMENT** for the entire compliance ecosystem. It establishes:

- **Information Security Program**: Security governance, organization structure, policy framework, and risk management
- **Access Control and Identity Management**: User access management, authentication, privileged access, and remote access policies
- **Data Protection and Encryption**: Data classification, encryption standards, key management, and certificate management
- **Privacy Management**: Privacy principles, personal data categories, individual rights, and privacy by design
- **Security Operations**: Continuous monitoring, vulnerability management, malware protection, and network security
- **Incident Response and Management**: Incident response team, processes, classification, and notification requirements
- **Compliance Frameworks**: NIST CSF, NIST 800-53, FedRAMP, HIPAA, GDPR, CCPA/CPRA, SOC 2, ISO 27001, and other regulatory frameworks
- **Cloud Security**: Cloud provider selection, GCP and Google Workspace security, data protection, and access control
- **Application Security**: Secure SDLC, secure coding practices, security testing, and AI/ML security governance
- **Physical and Environmental Security**: Facility security, equipment security, remote work security, and environmental controls
- **Business Continuity and Disaster Recovery**: Business impact analysis, continuity strategies, and recovery procedures
- **Third-Party Risk Management**: Vendor risk assessment, security requirements, and ongoing monitoring
- **Security Awareness and Training**: Training requirements, topics, and security culture development
- **Audit and Monitoring**: Audit logging, security monitoring, internal and external audits
- **Governance and Risk Management**: Security governance, metrics, reporting, and continuous improvement

### Authority and Relationships

This handbook serves as the **authoritative source** for security and compliance requirements. It establishes:
- **"What"** security controls and policies are required
- **"Why"** these controls exist (regulatory, contractual, risk-based rationale)
- **Minimum baseline** security requirements for all operations
- **Governance framework** that all other skills must follow
- **Policy hierarchy** for conflict resolution across skills

All other federal compliance skills operate under this handbook's authority and implement its requirements in specific contexts.

## 3. Process Definition

### Purpose

The security-governance skill serves as:
1. **Master Governance Authority**: The single source of truth for security and compliance policies
2. **Foundation for All Operations**: Baseline security requirements for internal operations, commercial clients, federal contracts, healthcare clients, and international engagements
3. **Framework Integration Hub**: Consolidated mapping of regulatory frameworks (NIST, ISO, SOC 2, HIPAA, GDPR, CCPA, FedRAMP, etc.)
4. **Policy Hierarchy Resolver**: Establishes precedence when conflicts arise between different requirements
5. **Universal Principles Source**: Documents organization-wide principles (data-as-regulated, no sensitive data in logs, role combination for small business)

### When to Use This Skill

Reference this skill when:
- Establishing baseline security requirements for any project or engagement
- Resolving policy conflicts between different compliance frameworks
- Understanding the organization's security governance structure
- Implementing security controls across any operational context
- Preparing for security audits or assessments
- Responding to client or regulatory security questionnaires
- Training personnel on security policies and requirements
- Designing new systems or processes that handle data
- Selecting cloud service providers or third-party vendors
- Developing incident response procedures
- Creating or updating any security or compliance documentation

### Process Steps

1. **Understand Context**: Identify the operational context (internal, commercial, federal, healthcare, international, platform-specific)
2. **Apply Baseline**: Apply all baseline security requirements from this handbook
3. **Apply Overlays**: Apply context-specific overlays from specialized skills (government-contracting, cloud-platform-security, etc.)
4. **Apply Client Requirements**: Apply additional client-specific or contractual security requirements
5. **Resolve Conflicts**: When conflicts arise, apply the most stringent requirement unless explicitly documented and risk-accepted
6. **Document Compliance**: Document how requirements are met and maintain evidence for audits

## 4. Inputs

### Required Context

- Engagement type (internal, commercial, federal, healthcare, international)
- Data types being processed (PII, PHI, CUI, etc.)
- Regulatory requirements applicable to the engagement
- Client contractual security requirements
- Risk assessment results
- Cloud platform(s) in use

### Required Information

- System or application architecture
- Data flow diagrams
- User roles and access requirements
- Third-party vendors involved
- Data residency requirements
- Recovery objectives (RTO, RPO)

### Dependencies

This skill is the **ROOT** of the compliance skill tree. It does not depend on other skills; rather, all other skills depend on it. However, it may reference:
- data-handling-privacy skill for detailed privacy procedures (while establishing privacy principles)
- government-contracting skill for federal-specific overlays (while establishing baseline)
- cloud-platform-security skill for platform implementation details (while establishing cloud security requirements)

## 5. Outputs

### Primary Output

**File:** `security-compliance-handbook.md`

A comprehensive security and compliance handbook covering all 15 sections of the security program:
1. Information Security Program
2. Access Control and Identity Management
3. Data Protection and Encryption
4. Privacy Management
5. Security Operations
6. Incident Response and Management
7. Compliance Frameworks
8. Cloud Security
9. Application Security
10. Physical and Environmental Security
11. Business Continuity and Disaster Recovery
12. Third-Party Risk Management
13. Security Awareness and Training
14. Audit and Monitoring
15. Governance and Risk Management

### Format and Structure

The handbook is organized as a single, comprehensive document with:
- Clear section numbering and organization
- Policy statements and requirements
- Universal principles documented at the beginning
- Documentation hierarchy and cross-package references
- Consolidated regulatory and framework mapping
- Context-specific policy applicability
- Contact information and document control

### Usage Instructions

1. **Reference the entire handbook** for comprehensive security program understanding
2. **Reference specific sections** for focused policy areas (e.g., Section 6 for incident response)
3. **Use the consolidated framework map** (Section 7) to understand multi-framework compliance
4. **Follow the policy hierarchy** when conflicts arise between different requirements
5. **Apply universal principles** (data-as-regulated, no sensitive data in logs) to all operations
6. **Use cross-package references** to navigate to specialized skills for detailed procedures

## 6. Reference Data Dependencies

### Upstream Dependencies

**None.** This skill is the ROOT governance document and does not depend on other skills for its authority. It establishes the governance framework that all other skills implement.

### Downstream Dependencies (Skills That Depend on This)

All other federal compliance skills operate under this handbook's authority:
- **internal-compliance**: Implements operational procedures for controls established in this handbook
- **data-handling-privacy**: Implements detailed privacy procedures under this handbook's privacy principles
- **government-contracting**: Applies federal-specific overlays to this handbook's baseline controls
- **cloud-platform-security**: Implements platform-specific controls that meet this handbook's requirements
- **business-operations**: Integrates this handbook's security requirements into business processes
- **contracts-risk-assurance**: Creates templates and policies aligned with this handbook's requirements

### External References

The handbook references and implements requirements from:
- NIST Cybersecurity Framework
- NIST SP 800-53 Rev 5
- NIST SP 800-171 (CUI controls)
- ISO/IEC 27001
- SOC 2 Trust Services Criteria
- HIPAA Security, Privacy, and Breach Notification Rules
- GDPR (General Data Protection Regulation)
- CCPA/CPRA (California privacy laws)
- FedRAMP security requirements
- FISMA compliance requirements
- State breach notification laws

## 7. Constraints

### Limitations

- **Governance, Not Procedures**: This handbook establishes policies and requirements ("what" and "why") but delegates detailed operational procedures ("how") to specialized skills
- **Baseline Requirements Only**: Establishes minimum baseline; actual implementations may require additional controls based on risk assessments, client requirements, or regulatory frameworks
- **Annual Review Cycle**: Policies reviewed annually; may not immediately reflect newly emerging threats or regulatory changes
- **Small Business Context**: Designed for small business federal contractor operations; may require augmentation for enterprise-scale implementations
- **Role Combination**: Acknowledges that roles (CISO, CIO, CTO, Privacy Officer) may be combined due to organizational size

### Compliance Requirements

- All policies must be reviewed and approved by CISO and CEO
- Policy changes must be communicated to all personnel
- Policy exceptions require CISO approval and risk register documentation
- Annual comprehensive risk assessments required
- Quarterly risk register reviews required
- Audit findings must be tracked and remediated

### Maintenance Requirements

- **Annual Policy Review**: All policies reviewed annually
- **Incident-Based Updates**: Policies updated based on security incidents or lessons learned
- **Regulatory Change Updates**: Policies updated when regulations change
- **Business Change Updates**: Policies updated when business operations change significantly
- **Version Control**: Maintain version history and document control metadata
- **Personnel Communication**: Changes communicated to all affected personnel

## 8. Integration Points

### How This Skill Integrates With Others

As the MASTER GOVERNANCE DOCUMENT, this skill provides the foundation for all other skills:

**internal-compliance skill**:
- This handbook establishes security policies and standards
- internal-compliance implements detailed operational procedures
- internal-compliance provides evidence of control operation

**data-handling-privacy skill**:
- This handbook establishes privacy principles and requirements
- data-handling-privacy provides detailed privacy procedures and data lifecycle management
- data-handling-privacy is authoritative for privacy rights, breach notification, and data handling specifics

**government-contracting skill**:
- This handbook establishes baseline security controls
- government-contracting provides federal-specific overlays (NIST 800-53, NIST 800-171, FedRAMP)
- Federal requirements supersede general policies when more stringent

**cloud-platform-security skill**:
- This handbook establishes cloud security requirements
- cloud-platform-security provides platform-specific implementation (GCP, Google Workspace, Vertex AI)
- Platform implementations must meet or exceed handbook requirements

**business-operations skill**:
- This handbook establishes security requirements for business processes
- business-operations integrates security into workflow, procurement, and operations
- Business processes must comply with handbook security requirements

**contracts-risk-assurance skill**:
- This handbook establishes security and compliance standards
- contracts-risk-assurance provides templates (BAA, DPA, SLA) aligned with handbook
- Contract templates implement handbook requirements

### Cross-Skill Workflow

1. **Start Here**: All compliance work begins with this handbook's baseline requirements
2. **Apply Context**: Reference specialized skills for context-specific overlays (federal, cloud, privacy)
3. **Implement Controls**: Use operational skills for detailed procedures (internal-compliance, business-operations)
4. **Document Compliance**: Maintain evidence that handbook requirements are met
5. **Resolve Conflicts**: Use handbook's policy hierarchy to resolve conflicts between requirements

## 9. Compliance Lifecycle Position

### Position in Lifecycle

The security-governance skill is the **FOUNDATION** of the compliance lifecycle. It sits at the root of all compliance activities:

```
[FOUNDATION] → security-governance (this skill)
              ↓
[BASELINE] → internal-compliance
              ↓
[SPECIALIZED OVERLAYS] → government-contracting, cloud-platform-security, data-handling-privacy
              ↓
[OPERATIONAL INTEGRATION] → business-operations, contracts-risk-assurance
              ↓
[CONTINUOUS MONITORING] → audit, assessment, continuous improvement
```

### Typical Usage Sequence

1. **Establish Baseline**: Start with this handbook to understand security requirements
2. **Apply Context**: Determine which specialized skills apply (federal, cloud, privacy, etc.)
3. **Implement Controls**: Use operational skills to implement required controls
4. **Document Compliance**: Maintain evidence for audits and assessments
5. **Monitor and Improve**: Continuously monitor compliance and improve based on lessons learned

### Lifecycle Triggers

- **Project Initiation**: Reference handbook to establish security requirements
- **Client Onboarding**: Review handbook requirements applicable to client engagement
- **System Development**: Apply secure SDLC and application security requirements
- **Vendor Selection**: Apply third-party risk management requirements
- **Incident Occurrence**: Follow incident response procedures
- **Audit/Assessment**: Provide handbook as evidence of security program
- **Regulatory Change**: Update handbook to reflect new requirements
- **Annual Review**: Review and update all policies

## 10. Governance Statement

### Authority

This Security and Compliance Handbook **IS** the governance authority for the organization's security and compliance program. It serves as:

- **Master Policy Document**: The authoritative source for all security policies
- **Compliance Foundation**: The basis for all compliance frameworks and certifications
- **Audit Reference**: The primary document referenced in security audits and assessments
- **Training Source**: The foundation for security awareness and training programs
- **Decision Framework**: The framework for security-related decisions and risk acceptance

### Approval and Ownership

- **Document Owner**: Chief Information Security Officer (CISO)
- **Approval Authority**: Chief Executive Officer (CEO)
- **Review Frequency**: Annual (minimum) or as needed based on changes
- **Version Control**: Maintained with version history and change log
- **Distribution**: All personnel required to read and comply with this handbook

### Governance Principles

1. **Single Source of Truth**: This handbook is the authoritative source for security policies; conflicts are resolved by referencing this handbook
2. **Most Stringent Applies**: When multiple requirements conflict, the most stringent requirement applies unless explicitly documented and risk-accepted
3. **Baseline + Overlay**: This handbook establishes baseline; specialized skills provide overlays; client contracts may add requirements
4. **Risk-Based Approach**: Security investments and control implementations are risk-based and documented in risk register
5. **Continuous Improvement**: Security program continuously improved based on incidents, audits, and emerging threats
6. **Transparency**: Role combinations, potential conflicts, and risk acceptance decisions documented transparently

### Relationship to Other Governance Documents

- **Constitution/Charter**: If the organization has a higher-level charter or constitution, this handbook implements those principles
- **Specialized Policies**: This handbook references and integrates specialized policies (AI Acceptable Use, Vertex AI Governance, etc.)
- **Operational Procedures**: Detailed procedures in other skills must align with and implement this handbook's requirements
- **Client Contracts**: Client contracts may add requirements but cannot reduce below this handbook's baseline
- **Regulatory Requirements**: Regulatory requirements are incorporated into this handbook through the consolidated framework map

### Compliance and Enforcement

- All personnel must comply with this handbook
- Policy violations are addressed through incident response and corrective action
- Non-compliance may result in disciplinary action
- Exceptions require CISO approval and risk register documentation
- Compliance monitored through audits, assessments, and security monitoring

---

**Usage Note for AI Assistants**: When referenced in a prompt, this skill provides the master governance framework for security and compliance. Always check this skill first to understand baseline requirements, then reference specialized skills for context-specific details. This skill establishes the "what" and "why"; specialized skills provide the "how".
