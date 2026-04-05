[COMPANY_LEGAL_NAME]
DATA HANDLING STANDARD

Purpose

This Data Handling Standard establishes [COMPANY_LEGAL_NAME]'s requirements for the proper handling, storage, transmission, and disposal of data throughout its lifecycle. This standard ensures data confidentiality, integrity, and availability while maintaining compliance with applicable regulations and contractual obligations.

Scope

This standard applies to all [COMPANY_NAME] personnel, contractors, subcontractors, systems, and processes that collect, process, store, transmit, or dispose of data. It covers all data types including client data, company data, and personal information.

Governance and Cross-Package References

This standard is the authoritative source for data classification, handling, and privacy requirements across all [COMPANY_ABBREVIATION] operations. internal-compliance skill policies defer to this standard for all data privacy, minimization, retention, and pseudonymization rules.

Universal [COMPANY_ABBREVIATION] Principles:
Data-as-Regulated: [COMPANY_ABBREVIATION] treats ALL client and customer data as regulated by default unless explicitly classified otherwise. This principle applies across all systems, processes, and operations.
No Sensitive Data in Logs: Logs, prompts, debugging output, comments, screenshots, and monitoring systems must NOT contain PII, PHI, PCI, CUI, or other regulated identifiers. See data-handling-privacy skill (Anonymization Standard) for techniques.

Cross-Package Integration:
security-governance skill: Master governance document; this standard implements data protection requirements
internal-compliance skill: All internal-compliance skill policies defer to data-handling-privacy skill for data privacy, minimization, retention, and pseudonymization controls
cloud-platform-security skill: Platform-specific implementation of data handling on Google infrastructure
cloud-platform-security skill (Google Data Loss Prevention): Technical controls implementing this standard on Google platforms

AI/ML Data Governance:
When AI systems process data, anonymization/pseudonymization rules in this standard apply unless client-approved in writing
AI training data, prompts, and outputs subject to data-as-regulated principle
See security-governance skill (AI/ML Governance), cloud-platform-security skill (Vertex AI Governance), and internal-compliance skill (AI Acceptable Use Policy)

For AI/ML data governance, see security-governance skill (Security & Compliance Handbook - AI/ML Section).
For anonymization techniques, see data-handling-privacy skill (Anonymization Standard).
For Google platform implementation, see cloud-platform-security skill (Google Data Loss Prevention Configuration).

Data Classification

Classification Levels

Public Data
Definition: Information approved for public disclosure with no restrictions
Examples: Marketing materials, press releases, public website content, published research
Handling Requirements: No special handling required
Storage Requirements: No encryption required
Transmission Requirements: No encryption required
Disposal Requirements: Standard deletion procedures

Internal Data
Definition: Information intended for internal use within [COMPANY_NAME]
Examples: Internal communications, policies, procedures, meeting notes, project plans
Handling Requirements: Access limited to [COMPANY_NAME] personnel
Storage Requirements: Stored on approved company systems
Transmission Requirements: Encrypted transmission preferred
Disposal Requirements: Secure deletion when no longer needed

Confidential Data
Definition: Sensitive business information requiring protection from unauthorized disclosure
Examples: Financial data, contracts, business plans, proprietary methodologies, employee information
Handling Requirements: Access limited to authorized personnel with business need
Storage Requirements: Encrypted storage required
Transmission Requirements: Encrypted transmission required
Disposal Requirements: Secure deletion using approved methods

Restricted Data
Definition: Highly sensitive information requiring maximum protection
Examples: Client data, Personally Identifiable Information (PII), Protected Health Information (PHI), Controlled Unclassified Information (CUI), authentication credentials, encryption keys
Handling Requirements: Access limited to specific authorized personnel, access logged
Storage Requirements: Encrypted storage required with strong encryption (AES-256 or equivalent)
Transmission Requirements: Encrypted transmission required using secure protocols (TLS 1.2 or higher)
Disposal Requirements: Secure deletion using NIST SP 800-88 sanitization methods

Classification Marking
Data classified at creation or receipt
Classification marked in metadata or document properties
Classification reviewed periodically
Classification changed when appropriate with proper authorization
Unclear classification escalated to data owner or security team

Data Handling Procedures

Data Collection

Collection Principles
Collect only data necessary for specified purpose (data minimization)
Obtain appropriate consent or legal basis for collection
Inform individuals about data collection and use
Collect data through secure methods
Document data collection practices

Collection Methods
Web forms with SSL/TLS encryption
Secure file transfer protocols (SFTP, HTTPS)
Encrypted email for sensitive information
Secure APIs with authentication and encryption
Physical documents with secure handling

Collection Documentation
Purpose of data collection documented
Legal basis for collection documented
Data retention period determined
Data protection measures identified
Collection practices reviewed annually

Data Storage

Storage Requirements by Classification

Public Data Storage
Standard storage on approved systems
No encryption required
Standard access controls

Internal Data Storage
Storage on approved company systems
Access controls limiting access to company personnel
Encryption preferred but not required
Regular backups

Confidential Data Storage
Encrypted storage required
Access controls limiting access to authorized personnel
Access logging enabled
Regular encrypted backups
Storage location documented

Restricted Data Storage
Encrypted storage required using strong encryption (AES-256 or equivalent)
Strict access controls with least privilege
Multi-factor authentication for access
Comprehensive access logging and monitoring
Encrypted backups with separate key management
Storage location documented and approved
Geographic restrictions applied as required

Storage Security Controls
Encryption at rest for Confidential and Restricted data
Access controls based on role and business need
Regular access reviews (quarterly for Restricted data)
Audit logging of data access
Physical security for storage media
Environmental controls (temperature, humidity, fire suppression)
Redundancy and backup for critical data

Cloud Storage Requirements
Cloud providers must meet security and compliance requirements
Data residency requirements documented and enforced
Encryption enabled for data at rest and in transit
Access controls and authentication configured
Audit logging enabled
Data Loss Prevention (DLP) policies configured
Regular security assessments of cloud storage

Data Transmission

Transmission Requirements by Classification

Public Data Transmission
Standard transmission methods acceptable
No encryption required

Internal Data Transmission
Encrypted transmission preferred
Secure protocols (HTTPS, SFTP) recommended

Confidential Data Transmission
Encrypted transmission required
Secure protocols (TLS 1.2 or higher, SFTP, VPN) required
Transmission logged

Restricted Data Transmission
Encrypted transmission required using strong encryption
Secure protocols (TLS 1.2 or higher) required
End-to-end encryption for highly sensitive data
Transmission logged and monitored
Recipient verification required
Secure file transfer methods (encrypted email, secure file sharing, VPN)

Transmission Methods

Email Transmission
Encryption required for Confidential and Restricted data
Secure email gateways or encryption tools used
Large files transmitted through secure file sharing, not email attachments
Recipient verification before sending sensitive data
Email retention policies applied

File Transfer
Secure File Transfer Protocol (SFTP) for file transfers
HTTPS for web-based file transfers
VPN for internal file transfers over untrusted networks
File encryption for Confidential and Restricted data
Transfer logging and monitoring

API Transmission
APIs secured with authentication (OAuth 2.0, API keys, JWT)
TLS 1.2 or higher for all API communications
API rate limiting to prevent data exfiltration
API access logging and monitoring
Input validation and output encoding

Physical Media Transmission
Physical media encrypted for Confidential and Restricted data
Secure courier or tracked shipping for sensitive media
Media inventory and chain of custody documentation
Recipient confirmation upon delivery
Media sanitization after use

Data Access

Access Control Principles
Least privilege: Users granted minimum access necessary
Need-to-know: Access based on business need
Separation of duties: Critical functions divided among multiple individuals
Role-based access control: Access based on job role
Regular access reviews: Access reviewed and recertified periodically

Access Request and Approval
Access requested through formal process
Access approved by data owner or manager
Access granted based on business justification
Access provisioning documented
Access reviewed upon role change or termination

Authentication and Authorization
Multi-factor authentication required for Restricted data access
Strong passwords required (minimum 12 characters, complexity requirements)
Session timeout after inactivity
Access attempts logged
Failed access attempts monitored and alerted

Access Monitoring
Access to Restricted data logged
Access logs reviewed regularly
Anomalous access patterns investigated
Access violations reported and addressed
Access metrics reported to management

Data Use

Acceptable Use
Data used only for authorized business purposes
Data used in accordance with privacy policies and consent
Data not used for unauthorized personal purposes
Data not disclosed to unauthorized parties
Data handling procedures followed

Prohibited Use
Use of data for unauthorized purposes
Disclosure of data to unauthorized parties
Use of data for personal gain
Modification or deletion of data without authorization
Circumvention of security controls

Data Processing
Data processed in accordance with privacy principles
Data accuracy maintained
Data processing documented
Data processing security controls applied
Data processing audited for compliance

Data Sharing
Data shared only with authorized parties
Data sharing agreements in place
Data protection requirements flowed down to recipients
Data sharing logged and monitored
Data sharing reviewed periodically

Data Retention and Disposal

Retention Requirements

Retention Policy
Data retained only as long as necessary for business or legal requirements
Retention periods defined by data type and regulatory requirements
Retention schedule documented and maintained
Data reviewed periodically for continued retention need
Retention compliance monitored

Retention Periods by Data Type
Client Data: Per contract terms or 3 years after contract end (whichever is longer)
Financial Records: 7 years per IRS requirements
Personnel Records: 7 years after termination
Contracts and Legal Documents: 7 years after expiration or termination
Security Logs: 1 year minimum, 3 years for compliance-related logs
Email: 3 years for business-related email
Backup Data: Per backup retention schedule (typically 30-90 days)
Personal Data: Per privacy policy and regulatory requirements (GDPR, CCPA)

Retention Exceptions
Legal hold: Data subject to litigation or investigation retained until hold released
Regulatory requirement: Data retained per specific regulatory requirement
Contractual requirement: Data retained per contract terms
Business need: Data retained for ongoing business need with documented justification

Data Disposal

Disposal Requirements
Data disposed of securely when retention period expires
Disposal method appropriate for data classification and media type
Disposal documented with date, method, and responsible party
Disposal verification performed
Certificates of destruction obtained for sensitive data

Disposal Methods by Media Type

Electronic Data Disposal
Overwriting: Multiple passes of random data (NIST SP 800-88 Clear or Purge)
Cryptographic Erasure: Deletion of encryption keys rendering data unrecoverable
Degaussing: Magnetic field to erase magnetic media
Physical Destruction: Shredding, crushing, or incineration of storage media

Paper Document Disposal
Cross-cut shredding for Confidential and Restricted documents
Shredding services with certificates of destruction
Secure disposal bins for sensitive documents
Regular shredding schedule
Shredding witnessed or documented

Removable Media Disposal
Overwriting or degaussing for reusable media
Physical destruction for end-of-life media
Destruction of USB drives, CDs, DVDs, backup tapes
Certificates of destruction obtained
Media disposal tracked in asset inventory

Cloud Data Disposal
Deletion of data from cloud storage
Verification of deletion completion
Deletion of backups and snapshots
Termination of cloud service accounts
Confirmation from cloud provider of data deletion

Data Breach Response

Breach Definition
A data breach is unauthorized access, use, disclosure, modification, or destruction of data. Breaches include both intentional and accidental incidents.

Breach Response Steps
Immediate containment to prevent further unauthorized access
Assessment of breach scope and impact
Notification to incident response team
Investigation of breach cause
Remediation of vulnerabilities
Notification to affected parties per legal and contractual requirements
Documentation of breach and response actions
Post-breach review and lessons learned

Breach Notification
Internal notification to management and security team
Client notification per contractual requirements
Regulatory notification per legal requirements (HIPAA, GDPR, state breach laws)
Individual notification for breaches of personal information
Law enforcement notification for criminal activity
Notification timelines per regulatory requirements (typically 24-72 hours)

Special Data Handling Requirements

Personally Identifiable Information (PII)
Definition: Information that identifies or can be used to identify an individual
Examples: Name, address, email, phone, Social Security number, driver's license
Special Requirements: Privacy policy disclosure, consent management, individual rights procedures, breach notification
Regulatory Compliance: GDPR, CCPA, state privacy laws

Protected Health Information (PHI)
Definition: Health information that identifies an individual
Examples: Medical records, health insurance information, treatment information
Special Requirements: HIPAA Security and Privacy Rules, Business Associate Agreements, minimum necessary standard
Regulatory Compliance: HIPAA, state health privacy laws

Controlled Unclassified Information (CUI)
Definition: Unclassified information requiring safeguarding or dissemination controls per federal law or policy
Examples: Federal contract information, law enforcement sensitive information, export controlled information
Special Requirements: NIST SP 800-171 controls, CUI marking, authorized holders only, incident reporting
Regulatory Compliance: Federal Acquisition Regulation (FAR), NIST SP 800-171

Financial Information
Definition: Financial account information and payment card information
Examples: Bank account numbers, credit card numbers, financial statements
Special Requirements: PCI-DSS compliance for payment cards, encryption, access controls
Regulatory Compliance: GLBA, PCI-DSS

Contact Information

For questions regarding data handling, contact:

[OWNER_NAME]
Founder and Chief Information Security Officer
[COMPANY_LEGAL_NAME]
Email: [CONTACT_EMAIL]
Phone: [CONTACT_PHONE]
[COMPANY_CITY], [GOVERNING_STATE]
UEI: [COMPANY_UEI]
CAGE Code: [COMPANY_CAGE_CODE]
