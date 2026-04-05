# CLOUD PLATFORM SECURITY USAGE GUIDE

## Purpose

This usage guide explains how, when, and why each document in the Cloud Platform Security skill is used. This guide helps personnel understand the practical application of cloud platform security documents.

## Skill Overview

The Cloud Platform Security skill contains 7 comprehensive documents that establish cloud-specific security implementation. These documents are essential for:
- Cloud workspace security configuration and management
- Cloud platform security standards
- Cloud IAM policy and access control
- Cloud partner compliance and security requirements
- AI governance and responsible AI practices
- Data Loss Prevention (DLP) configuration
- Security monitoring and logging on cloud platforms

This skill serves as the "cloud platform layer" that implements skill 2 security controls on cloud infrastructure.

## Document Usage Guide

### 01 CLOUD WORKSPACE SECURITY CONFIGURATION

**How Used**
- Establishes security baseline for cloud workspace (email, drive, calendar, collaboration, etc.)
- Defines authentication and access control requirements (2FA, SSO, session management)
- Documents data protection and DLP settings
- Guides device management and endpoint security
- Provides security monitoring and audit logging configuration

**When Needed**
- During cloud workspace initial setup and configuration
- When onboarding new employees to cloud workspace
- During security configuration reviews and audits
- When responding to client security questionnaires about email/collaboration security
- During security incident investigation involving workspace
- When updating workspace security settings
- During compliance audits (SOC 2, ISO 27001, HIPAA)

**Why Needed**
- Required for secure email and collaboration platform
- Implements skill 2 security controls on workspace
- Demonstrates cloud workspace security to clients
- Required for HIPAA compliance (BAA with cloud provider required)
- Supports SOC 2 and ISO 27001 compliance
- Protects against email-based threats and data loss
- Establishes baseline for cloud partner compliance

### 02 CLOUD PLATFORM SECURITY STANDARDS

**How Used**
- Establishes comprehensive security baseline for cloud platform (compute, storage, networking, etc.)
- Defines organization policies and security controls
- Documents encryption, key management, and data protection
- Guides network security and segmentation
- Provides security monitoring and logging standards

**When Needed**
- During cloud project and resource provisioning
- When designing cloud architectures for clients
- During security configuration reviews and audits
- When responding to client security questionnaires about cloud security
- During security incident investigation involving cloud
- When updating cloud security settings
- During compliance audits (SOC 2, ISO 27001, FedRAMP-adjacent)
- When pursuing federal contracts requiring cloud security

**Why Needed**
- Required for secure cloud infrastructure
- Implements skill 2 security controls on cloud
- Demonstrates cloud security to clients and auditors
- Required for federal contracting (NIST 800-53, FedRAMP-adjacent)
- Supports SOC 2 and ISO 27001 compliance
- Protects client data in cloud environments
- Establishes baseline for cloud partner compliance
- Enables secure multi-tenant cloud operations

### 03 CLOUD IAM POLICY

**How Used**
- Establishes identity and access management for cloud
- Defines least-privilege access principles
- Documents role-based access control (RBAC)
- Guides service account management
- Provides just-in-time (JIT) access procedures

**When Needed**
- During cloud user and service account provisioning
- When granting or revoking cloud access
- During access reviews and recertification
- When implementing least-privilege access
- During security audits requiring access control documentation
- When investigating unauthorized access incidents
- During compliance audits (SOC 2, ISO 27001)

**Why Needed**
- Required for secure cloud access control
- Implements skill 2 access control principles on cloud
- Demonstrates least-privilege access to auditors
- Required for SOC 2 and ISO 27001 compliance
- Protects against unauthorized access and privilege escalation
- Supports federal contracting access control requirements
- Establishes accountability for cloud actions

### 04 CLOUD PARTNER COMPLIANCE AND SECURITY STATEMENT

**How Used**
- Demonstrates cloud partner security and compliance posture
- Documents cloud platform security implementation
- Provides cloud-specific security controls summary
- Establishes cloud partner program compliance
- Supports client assessments requiring cloud platform security

**When Needed**
- During cloud partner program compliance activities
- When responding to client RFPs requiring cloud platform security
- During client security assessments and due diligence
- When demonstrating cloud platform expertise
- During cloud partner audits and reviews
- When marketing cloud-based solutions
- During teaming with other cloud partners

**Why Needed**
- Required for cloud partner program participation
- Demonstrates cloud platform security expertise
- Supports client confidence in cloud-based solutions
- Establishes cloud partner compliance
- Provides cloud-specific security documentation
- Supports sales and marketing of cloud solutions
- Anchors skill 5 to skills 1, 2, 3

### 05 AI GOVERNANCE AND RESPONSIBLE AI PRACTICES

**How Used**
- Establishes governance for AI and AI/ML workloads
- Defines responsible AI principles and practices
- Documents AI model development, testing, and deployment
- Guides AI data handling and privacy protection
- Provides AI bias detection and mitigation procedures

**When Needed**
- During AI/ML project planning and development
- When training AI models with client data
- During AI model deployment and monitoring
- When responding to AI governance questions from clients
- During AI ethics reviews and assessments
- When investigating AI model issues or bias
- During compliance audits requiring AI governance
- When using external LLMs or AI tools with client data

**Why Needed**
- Required for responsible AI development and deployment
- Implements skill 3 data protection in AI context
- Demonstrates AI governance maturity to clients
- Supports ethical AI practices
- Required for AI projects with personal data (GDPR, CCPA)
- Protects against AI bias and discrimination
- Establishes accountability for AI systems
- Critical for federal contracts involving AI

### 06 DATA LOSS PREVENTION (DLP) CONFIGURATION

**How Used**
- Establishes DLP policies for cloud workspace and cloud platform
- Defines sensitive data detection and protection rules
- Documents DLP policy enforcement and exceptions
- Guides DLP incident response and remediation
- Provides DLP monitoring and reporting

**When Needed**
- During cloud workspace and cloud platform DLP configuration
- When protecting sensitive data (PII, PHI, PCI, CUI)
- During DLP policy updates and tuning
- When investigating DLP incidents and violations
- During compliance audits requiring DLP documentation
- When onboarding clients with sensitive data
- During security assessments requiring data protection controls

**Why Needed**
- Required for sensitive data protection
- Implements skill 3 data protection controls on cloud platforms
- Demonstrates data loss prevention to clients and auditors
- Required for HIPAA, PCI DSS, GDPR, CCPA compliance
- Protects against accidental or malicious data exposure
- Supports federal contracting data protection requirements (CUI)
- Establishes automated data protection controls

### 07 SECURITY MONITORING AND LOGGING STANDARDS (CLOUD PLATFORMS)

**How Used**
- Establishes security monitoring and logging for cloud workspace and cloud platform
- Defines log collection, retention, and analysis
- Documents security event detection and alerting
- Guides SIEM integration and log management
- Provides incident detection and response procedures

**When Needed**
- During cloud platform security monitoring setup
- When investigating security incidents on cloud platforms
- During security event analysis and threat hunting
- When responding to security alerts and anomalies
- During compliance audits requiring logging documentation
- When establishing log retention and management
- During SIEM integration and configuration

**Why Needed**
- Required for security incident detection and response
- Implements skill 1 logging and monitoring on cloud platforms
- Demonstrates security monitoring to clients and auditors
- Required for SOC 2, ISO 27001, NIST 800-53 compliance
- Supports incident investigation and forensics
- Required for federal contracting security monitoring
- Establishes audit trail for security events
- Must comply with no-PII-in-logs principle (skill 3)

## Cross-Skill Integration

### Skill 2 (Security & Compliance Handbook):
- Skill 2 provides security governance; skill 5 implements on cloud platforms
- All skill 5 documents reference skill 2 as governance authority
- Skill 2 establishes "what"; skill 5 establishes "how" on cloud

### Skill 1 (Internal Compliance):
- Skill 1 provides operational security procedures; skill 5 provides cloud-specific implementation
- Logging & Monitoring (skill 1) is basis for Cloud Logging Standards (skill 5)
- Incident Response (skill 1) integrates with cloud security monitoring (skill 5)
- Access Control (skill 1) is implemented via Cloud IAM (skill 5)

### Skill 3 (Data Handling & Privacy):
- Skill 3 provides data protection requirements; skill 5 implements on cloud platforms
- Data Handling Standard (skill 3) is enforced via Cloud DLP (skill 5)
- Anonymization Standard (skill 3) is applied in AI Governance (skill 5)
- Records Management (skill 3) governs cloud workspace retention (skill 5)
- No-PII-in-logs principle (skill 3) applies to cloud logging (skill 5)

### Skill 4 (Government Contracting):
- Skill 4 provides federal requirements; skill 5 implements on cloud platforms
- NIST-Lite Alignment (skill 4) is supported by Cloud Security Standards (skill 5)
- Federal Data Handling (skill 4) is implemented via Cloud DLP and encryption (skill 5)
- FedRAMP-adjacent controls (skill 4) are implemented on cloud (skill 5)

### Skill 6 (Business Operations):
- Skill 6 provides business processes; skill 5 provides platform for delivery
- Client onboarding (skill 6) includes cloud workspace provisioning (skill 5)
- Service delivery uses cloud platforms secured per skill 5

### Skill 7 (Advanced Compliance):
- Skill 7 provides compliance templates; skill 5 provides platform security
- Security questionnaires reference skill 5 cloud security controls
- Data Processing Agreements reference skill 5 data protection implementation

## Practical Usage Scenarios

### Scenario 1: New Client Onboarding with Cloud Workspace
**Client engagement requires cloud workspace for collaboration**
- Response: Use Cloud Workspace Security Configuration to provision secure environment
- Integrate with: skill 6 onboarding procedures, skill 3 data handling requirements
- Result: Secure cloud workspace environment for client

### Scenario 2: Cloud Architecture for Federal Contract
**Federal contract requires cloud infrastructure with NIST controls**
- Response: Use Cloud Security Standards and Cloud IAM Policy
- Integrate with: skill 4 NIST-Lite Alignment, skill 4 Federal Data Handling
- Result: FedRAMP-adjacent cloud environment for federal work

### Scenario 3: AI/ML Model Development with Personal Data
**Project requires training AI model with personal data**
- Response: Use AI Governance and Responsible AI Practices
- Integrate with: skill 3 Anonymization Standard, skill 3 Data Handling Standard
- Result: Privacy-protected AI development on cloud

### Scenario 4: DLP Configuration for HIPAA Workload
**Client engagement involves PHI requiring HIPAA compliance**
- Response: Use DLP Configuration to protect PHI on cloud platforms
- Integrate with: skill 3 Data Handling Standard, Cloud Workspace Security Configuration
- Result: HIPAA-compliant DLP on cloud workspace and cloud platform

### Scenario 5: Security Incident on Cloud
**Security incident detected on cloud infrastructure**
- Response: Use Security Monitoring and Logging Standards for investigation
- Integrate with: skill 1 Incident Response Plan, skill 4 Mandatory Reporting (if federal)
- Result: Effective incident investigation and response

## Maintenance and Updates

### Annual Review:
- All skill 5 documents reviewed annually
- Review includes cloud platform changes, new features, security updates
- Review coordinated with skill 2 Handbook review

### Triggered Updates:
- Updated when cloud provider releases major platform changes
- Updated when cloud partner program requirements change
- Updated when security incidents reveal gaps
- Updated when compliance requirements change
- Updated when new cloud services adopted

### Cloud Platform Tracking:
- Monitor cloud release notes and security bulletins
- Track cloud admin updates and new features
- Review cloud partner program updates
- Attend cloud events and partner conferences

## Conclusion

Skill 5 is the cloud platform implementation layer that translates security and privacy requirements into cloud-specific configurations and controls. These documents ensure that cloud workspace and cloud platform are securely configured and managed according to standards and client requirements. Personnel working with cloud platforms must be familiar with these documents and apply them consistently.
