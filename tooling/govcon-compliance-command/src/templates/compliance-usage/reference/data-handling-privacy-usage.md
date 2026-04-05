# DATA HANDLING & PRIVACY USAGE GUIDE

## Purpose

This usage guide explains how, when, and why each document in the Data Handling & Privacy skill is used. This guide helps personnel understand the practical application of data handling and privacy documents.

## Skill Overview

The Data Handling & Privacy skill contains 7 comprehensive documents that establish data privacy engines. These documents are essential for:
- Protecting client and customer data
- Ensuring privacy compliance (GDPR, CCPA, HIPAA, FERPA, GLBA)
- Managing data throughout its lifecycle
- Responding to data breaches
- Supporting data subject rights
- Demonstrating privacy posture to clients and regulators

This skill serves as the "privacy anchor" for entire compliance ecosystems.

## Document Usage Guide

### 01 DATA HANDLING STANDARD

**How Used**
- Establishes data classification framework (Public, Internal, Confidential, Restricted)
- Defines handling requirements for each classification level
- Guides data collection, storage, transmission, and disposal
- Provides data minimization principles
- Documents data protection controls

**When Needed**
- When collecting new data from clients or customers
- When designing new systems or applications
- When classifying data for storage or transmission
- During client onboarding to determine data handling requirements
- During security assessments and audits
- When training personnel on data handling
- During incident response involving data exposure
- When establishing data protection requirements for projects

**Why Needed**
- Required by GDPR, CCPA, HIPAA, and other privacy regulations
- Demonstrates data protection commitment to clients
- Provides foundation for all data handling activities
- Required for federal contracting (CUI handling)
- Establishes accountability for data protection
- Supports compliance with contractual data protection obligations
- Enables consistent data handling across all engagements

### 02 PRIVACY MANAGEMENT POLICY

**How Used**
- Establishes privacy program governance structure
- Defines privacy roles and responsibilities
- Documents privacy principles and commitments
- Guides privacy impact assessments
- Manages data subject rights requests
- Provides privacy compliance framework

**When Needed**
- During privacy program establishment
- When responding to data subject rights requests (access, deletion, portability)
- During privacy impact assessments for new projects
- When conducting privacy training
- During privacy audits and assessments
- When updating privacy practices
- During client privacy due diligence
- When establishing privacy requirements for new services

**Why Needed**
- Required by GDPR, CCPA, and other privacy laws
- Demonstrates privacy program maturity to clients and regulators
- Provides governance for all privacy activities
- Supports data subject rights compliance
- Required for HIPAA compliance (privacy rule)
- Establishes privacy accountability
- Enables consistent privacy practices across engagements

### 03 DATA LIFECYCLE MANAGEMENT

**How Used**
- Guides data through entire lifecycle (collection, use, storage, archival, deletion)
- Defines retention periods for different data types
- Establishes data archival procedures
- Documents data deletion and destruction methods
- Manages data aging and lifecycle transitions

**When Needed**
- When determining how long to retain data
- During data archival planning
- When deleting or destroying data
- During records management activities
- When responding to data retention questions from clients
- During legal hold or litigation support
- When establishing retention requirements for new data types
- During storage capacity planning

**Why Needed**
- Required by GDPR, CCPA (data minimization, storage limitation)
- Required by federal records management regulations
- Supports legal and regulatory compliance
- Reduces data breach risk by minimizing data retention
- Optimizes storage costs
- Demonstrates responsible data stewardship
- Required for HIPAA compliance (minimum necessary principle)

### 04 DATA ANONYMIZATION AND PSEUDONYMIZATION STANDARD

**How Used**
- Defines anonymization and pseudonymization techniques
- Guides de-identification of personal data
- Establishes re-identification risk assessment procedures
- Documents anonymization for analytics and AI/ML
- Provides pseudonymization key management

**When Needed**
- When using personal data for analytics or reporting
- When training AI/ML models with personal data
- When sharing data with third parties
- When conducting research or testing with production data
- During data minimization activities
- When responding to data subject rights requests
- When using data in non-production environments
- When external LLMs or AI tools require data input

**Why Needed**
- Required by GDPR (data protection by design)
- Enables data use while protecting privacy
- Reduces data breach impact
- Supports AI/ML development with privacy protection
- Required for HIPAA de-identification
- Demonstrates privacy-by-design approach
- Enables data sharing while maintaining confidentiality
- Critical for responsible AI governance

### 05 PRIVACY NOTICE

**How Used**
- Informs individuals about data collection and use
- Provides transparency about privacy practices
- Documents legal basis for data processing
- Explains data subject rights
- Communicates privacy contact information

**When Needed**
- When collecting personal data from individuals
- On company website and client portals
- In client contracts and agreements
- During employee onboarding
- When providing services to consumers
- During privacy audits and assessments
- When updating privacy practices
- In marketing and communication materials

**Why Needed**
- Required by GDPR, CCPA, and other privacy laws
- Legal requirement for transparency
- Supports informed consent
- Demonstrates privacy commitment
- Required for HIPAA Notice of Privacy Practices
- Establishes trust with clients and customers
- Provides legal protection for data processing activities

### 06 BREACH NOTIFICATION PROCEDURE

**How Used**
- Guides response to data breaches and privacy incidents
- Defines breach assessment and notification timelines
- Establishes notification procedures for affected individuals, clients, and regulators
- Documents breach investigation and remediation
- Provides breach notification templates

**When Needed**
- When data breach or privacy incident occurs
- During incident response activities
- When assessing whether incident constitutes breach
- When notifying affected individuals or regulators
- During breach investigation and forensics
- When documenting breach response
- During tabletop exercises and breach simulations
- When training personnel on breach response

**Why Needed**
- Required by GDPR (72-hour notification), CCPA, HIPAA, state breach laws
- Legal requirement for breach notification
- Demonstrates incident response capability
- Supports compliance with contractual breach notification obligations
- Required for federal contracts (mandatory reporting)
- Protects individuals from breach harm
- Maintains client and customer trust
- Provides legal protection through proper notification

### 07 RECORDS MANAGEMENT POLICY

**How Used**
- Establishes records retention schedule (authoritative source for all retention periods)
- Defines records classification and organization
- Guides records storage and protection
- Documents records disposal procedures
- Manages legal holds and litigation support

**When Needed**
- When determining retention periods for any data or records
- During records archival and disposal
- When responding to legal holds or subpoenas
- During audits requiring records production
- When establishing records management for new record types
- During FOIA requests (federal contracts)
- When training personnel on records management
- During storage and backup planning

**Why Needed**
- Required by federal and state records retention laws
- Required for federal contracting (FAR records requirements)
- Supports legal and regulatory compliance
- Provides single source of truth for retention periods
- Demonstrates records management maturity
- Required for HIPAA (6-year retention)
- Supports litigation readiness
- Enables consistent retention across all data types

## Cross-Skill Integration

### Skill 1 (Internal Compliance):
- Skill 3 provides data handling and privacy rules; skill 1 implements technical controls
- Incident Response Plan (skill 1) executes Breach Notification Procedure (skill 3)
- Logging & Monitoring (skill 1) must comply with no-PII-in-logs principle (skill 3)
- Access Control (skill 1) enforces data classification access requirements (skill 3)

### Skill 2 (Security & Compliance Handbook):
- Skill 2 provides governance authority; skill 3 operates under that authority
- All skill 3 documents reference skill 2 as master governance source
- Skill 2 establishes privacy principles; skill 3 implements privacy practices

### Skill 4 (Government Contracting):
- Federal Data Handling & FOIA Policy (skill 4) is federal overlay on skill 3
- CUI handling references skill 3 Data Handling Standard
- Federal retention rules harmonize with skill 3 Records Management Policy
- Mandatory Reporting (skill 4) integrates with Breach Notification (skill 3)

### Skill 5 (Cloud Platform Security):
- Cloud DLP Configuration (skill 5) implements skill 3 data protection controls
- AI Governance (skill 5) references skill 3 Anonymization Standard
- Cloud Security Standards (skill 5) implement skill 3 encryption requirements
- Cloud retention settings follow skill 3 Records Management

### Skill 6 (Business Operations):
- Client Onboarding (skill 6) collects data classification and privacy requirements per skill 3
- All business processes follow skill 3 data retention and deletion rules
- Service Level Agreements reference skill 3 data protection standards

### Skill 7 (Advanced Compliance):
- Data Processing Agreement template references skill 3 standards
- Business Associate Agreement aligns with skill 3 HIPAA controls
- Security questionnaires reference skill 3 privacy practices

## Practical Usage Scenarios

### Scenario 1: New Client Onboarding with Personal Data
**Client engagement involves processing personal data**
- Response: Use Data Handling Standard to classify data, Privacy Management Policy to assess privacy requirements, Privacy Notice to inform individuals
- Result: Proper data protection from day one

### Scenario 2: AI/ML Model Training
**Project requires training AI model with client data**
- Response: Use Anonymization Standard to de-identify data, Data Lifecycle Management to determine retention, AI Governance (skill 5) for AI controls
- Result: Privacy-protected AI development

### Scenario 3: Data Breach Incident
**Security incident involves potential data exposure**
- Response: Use Breach Notification Procedure to assess and respond, Incident Response Plan (skill 1) for technical response, Mandatory Reporting (skill 4) if federal contract
- Result: Compliant breach response

### Scenario 4: Data Subject Rights Request
**Individual requests access to their personal data**
- Response: Use Privacy Management Policy to process request, Data Handling Standard to locate data, Data Lifecycle Management to determine retention
- Result: Compliant response to data subject rights

### Scenario 5: Federal Contract with CUI
**Federal contract requires CUI handling**
- Response: Use Data Handling Standard for baseline, Federal Data Handling & FOIA Policy (skill 4) for federal overlay, Records Management Policy for retention
- Result: Compliant CUI handling

## Maintenance and Updates

### Annual Review:
- All skill 3 documents reviewed annually
- Review includes regulatory changes, incident lessons learned, retention schedule updates
- Review coordinated with skill 2 Handbook review

### Triggered Updates:
- Updated when new privacy regulations apply
- Updated when data breach occurs requiring procedure improvements
- Updated when new data types or services require classification
- Updated when retention requirements change

### Retention Schedule Harmonization:
- Records Management Policy is single source of truth for all retention periods
- All other documents cross-reference Records Management Policy
- Any retention period changes made in Records Management Policy first, then cascaded

## Conclusion

Skill 3 is the privacy and data handling engine. These documents work together to ensure data is properly protected throughout its lifecycle, privacy rights are respected, and regulatory compliance is maintained. Personnel handling any data should be familiar with these documents and reference them regularly.
