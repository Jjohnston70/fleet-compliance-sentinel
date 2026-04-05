TRUE NORTH DATA STRATEGIES LLC
GOOGLE DATA LOSS PREVENTION CONFIGURATION STANDARD

Purpose

This Google Data Loss Prevention Configuration Standard establishes True North Data Strategies LLC's requirements for implementing and managing Google Cloud Data Loss Prevention (DLP) to discover, classify, and protect sensitive data. This standard ensures sensitive data is identified and protected from unauthorized disclosure or loss.

Scope

This standard applies to all True North Data Strategies data stored or processed in Google Workspace and Google Cloud Platform. It applies to all personnel responsible for implementing or managing DLP controls.

Governance and Cross-Package References

This standard implements TNDS data protection requirements using Google Cloud DLP technology, supporting the no-PII-in-logs principle.

Universal TNDS Principles - DLP Implementation:
Data-as-Regulated: DLP configured to detect and protect all client and customer data as regulated by default
No Sensitive Data in Logs: DLP used to prevent PII, PHI, PCI, CUI from appearing in logs, prompts, and monitoring systems

Cross-Package Integration:
Package 2 (Security & Compliance Handbook): Master governance document establishing data protection requirements
Package 3 (Data Handling Standard): Data classification system; DLP implements automated classification and protection
Package 3 (Anonymization Standard): DLP de-identification techniques implement anonymization requirements
Package 5 (Google Workspace Security): DLP integration with Workspace (Gmail, Drive, etc.)

DLP Supporting No-PII-in-Logs:
DLP scans logs for sensitive data and alerts on violations
DLP templates configured to detect PII, PHI, PCI, CUI in log streams
DLP integrated with Cloud Logging to prevent sensitive data in logs
DLP findings trigger remediation per Package 1 (Incident Response Plan)

For data classification, see Package 3 (Data Handling Standard).
For anonymization techniques, see Package 3 (Anonymization Standard).

DLP Principles

Data Discovery
Sensitive data discovered across all data stores
Data discovery automated and continuous
Data discovery covers structured and unstructured data
Data discovery findings documented

Data Classification
Data classified based on sensitivity (Public, Internal, Confidential, Restricted)
Classification based on data content and context
Classification automated where possible
Classification supports data protection

Data Protection
Sensitive data protected from unauthorized access and disclosure
Protection controls based on data classification
Protection includes: Access control, encryption, DLP, monitoring
Protection continuously enforced

Risk-Based Approach
DLP controls prioritized based on data sensitivity and risk
High-risk data receives strongest protection
DLP resources allocated based on risk
Risk assessment drives DLP implementation

Compliance Support
DLP supports compliance with privacy regulations (GDPR, CCPA, HIPAA, etc.)
DLP detects regulated data types (PII, PHI, PCI, etc.)
DLP provides evidence for compliance audits
DLP configuration documented

Google Cloud DLP Overview

DLP Capabilities
Discover sensitive data in Cloud Storage, BigQuery, Datastore, Firestore
Classify data using built-in and custom infoTypes
De-identify sensitive data (masking, tokenization, encryption)
Inspect data in real-time or batch
Monitor and alert on sensitive data exposure

DLP Components
InfoTypes: Detectors for specific data types (credit card, SSN, email, etc.)
Inspection Templates: Reusable configurations for data inspection
De-identification Templates: Reusable configurations for data de-identification
Job Triggers: Automated scheduled or event-driven DLP jobs
DLP API: Programmatic access to DLP functionality

DLP InfoTypes

Built-In InfoTypes

Personally Identifiable Information (PII)
US Social Security Number (SSN)
Driver's License Number
Passport Number
Email Address
Phone Number
Date of Birth
Full Name
Home Address

Financial Information
Credit Card Number
Bank Account Number
IBAN (International Bank Account Number)
SWIFT Code
Tax ID Number (EIN, ITIN)

Healthcare Information (PHI)
Medical Record Number
Health Insurance ID
ICD-9 and ICD-10 Codes
Prescription Information

Authentication Credentials
Passwords
API Keys
OAuth Tokens
Private Keys
Encryption Keys

Other Sensitive Data
IP Address
MAC Address
IMEI Number
Vehicle Identification Number (VIN)
Geographic Coordinates

Custom InfoTypes

Custom InfoType Creation
Custom infoTypes created for organization-specific sensitive data
Custom infoTypes use: Regular expressions, dictionaries, custom logic
Custom infoTypes tested and validated
Custom infoTypes documented

Custom InfoType Examples
Employee ID numbers
Internal project codes
Proprietary product names
Client-specific identifiers
Custom data formats

InfoType Configuration
InfoTypes configured with likelihood thresholds (VERY_LIKELY, LIKELY, POSSIBLE, UNLIKELY)
Likelihood threshold balances detection accuracy and false positives
InfoType configuration documented

DLP Inspection

Inspection Scope

Data Sources
Cloud Storage buckets
BigQuery tables and datasets
Datastore and Firestore entities
Google Workspace (Gmail, Drive) via DLP API
Streaming data via DLP API

Inspection Methods
Batch inspection: Scheduled DLP jobs scan data at rest
Streaming inspection: Real-time inspection of data in transit
On-demand inspection: Manual inspection triggered by users or applications

Inspection Templates

Template Configuration
Inspection templates define: InfoTypes to detect, likelihood thresholds, exclusion rules
Templates reusable across multiple DLP jobs
Templates versioned and documented

Template Examples
PII Inspection Template: Detects SSN, credit card, email, phone, address
PHI Inspection Template: Detects medical record number, health insurance ID, ICD codes
Financial Data Inspection Template: Detects credit card, bank account, tax ID
Credentials Inspection Template: Detects passwords, API keys, tokens

Template Management
Templates created and managed by CISO or DLP administrators
Templates reviewed and updated regularly
Template changes documented

DLP Jobs and Triggers

DLP Job Types
Inspection Jobs: Scan data for sensitive information
Risk Analysis Jobs: Analyze data for re-identification risk
De-identification Jobs: De-identify sensitive data

Job Configuration
Jobs configured with: Data source, inspection template, actions, schedule
Job configuration documented
Job results stored and reviewed

Job Triggers
Job triggers automate DLP jobs
Triggers scheduled (daily, weekly, monthly) or event-driven (new file uploaded)
Triggers configured for critical data sources
Triggers documented

Job Monitoring
DLP job status monitored
Job failures investigated and resolved
Job results reviewed for sensitive data findings
Job metrics tracked

DLP Findings and Actions

DLP Findings

Finding Details
Findings include: InfoType detected, likelihood, location, quote (sample of detected data)
Findings stored in DLP job results
Findings exported to Security Command Center, Cloud Logging, or BigQuery
Findings reviewed and investigated

Finding Severity
Findings classified by severity based on: InfoType, likelihood, data classification
High-severity findings: Restricted data (SSN, credit card, PHI)
Medium-severity findings: Confidential data (email, phone, internal IDs)
Low-severity findings: Internal data (names, dates)

Finding Review
High-severity findings reviewed immediately
Medium-severity findings reviewed within 24 hours
Low-severity findings reviewed weekly
Finding review documented

DLP Actions

Automated Actions
Quarantine: Move sensitive files to quarantine location
Block: Prevent sensitive data from being shared or transmitted
Redact: Remove or mask sensitive data
Encrypt: Encrypt sensitive data
Alert: Send alert to security team

Manual Actions
Investigate: Investigate finding to determine if true positive or false positive
Remediate: Remove sensitive data, apply access controls, or de-identify data
Document: Document finding and remediation actions
Escalate: Escalate high-risk findings to CISO

Action Configuration
Actions configured based on finding severity and data classification
Actions automated where possible
Actions documented

DLP for Google Workspace

Gmail DLP

Gmail DLP Rules
DLP rules configured in Google Workspace Admin Console
Rules detect sensitive data in email content and attachments
Rules apply to: Outbound email, inbound email, internal email

Gmail DLP Actions
Warn: Display warning to sender before sending email
Block: Prevent email from being sent
Quarantine: Move email to quarantine for review
Modify: Remove attachments or modify email content
Alert: Send alert to security team

Gmail DLP Configuration
DLP rules configured for: Credit card numbers, SSN, confidential data
DLP rules applied to all users or specific organizational units
DLP rules tested before enforcement
DLP configuration documented

Google Drive DLP

Drive DLP Rules
DLP rules configured in Google Workspace Admin Console
Rules detect sensitive data in Drive files
Rules apply to: File sharing, file access, file uploads

Drive DLP Actions
Warn: Display warning when sharing file with sensitive data
Block: Prevent file from being shared externally
Restrict: Restrict file access to internal users only
Alert: Send alert to security team

Drive DLP Configuration
DLP rules configured for: Credit card numbers, SSN, confidential data
DLP rules applied to all users or specific organizational units
DLP rules tested before enforcement
DLP configuration documented

DLP for Google Cloud Platform

Cloud Storage DLP

Storage Inspection
Cloud Storage buckets scanned for sensitive data
Inspection jobs configured for critical buckets
Inspection frequency: Daily, weekly, or monthly based on risk
Inspection results reviewed

Storage DLP Actions
Tag: Apply labels to buckets or objects with sensitive data
Encrypt: Encrypt sensitive objects with CMEK
Restrict Access: Apply IAM policies to restrict access
Alert: Send alert to security team
Move: Move sensitive objects to secure bucket

BigQuery DLP

BigQuery Inspection
BigQuery tables and datasets scanned for sensitive data
Inspection jobs configured for critical datasets
Inspection frequency: Daily, weekly, or monthly based on risk
Inspection results reviewed

BigQuery DLP Actions
Tag: Apply labels to tables or datasets with sensitive data
Encrypt: Encrypt sensitive tables with CMEK
Restrict Access: Apply IAM policies to restrict access
De-identify: De-identify sensitive columns
Alert: Send alert to security team

DLP De-Identification

De-Identification Techniques

Masking
Replace sensitive data with mask characters (e.g., XXX-XX-1234 for SSN)
Masking preserves data format
Masking irreversible

Tokenization
Replace sensitive data with tokens
Tokens mapped to original data in secure token vault
Tokenization reversible with proper authorization

Encryption
Encrypt sensitive data with encryption keys
Encrypted data unreadable without decryption key
Encryption reversible with proper authorization

Redaction
Remove sensitive data entirely
Redaction irreversible
Redaction used when data not needed

Generalization
Replace specific values with broader categories (e.g., age 25 → age range 20-30)
Generalization reduces data precision
Generalization preserves data utility for analysis

Date Shifting
Shift dates by random offset
Date shifting preserves date relationships
Date shifting protects privacy

De-Identification Templates
De-identification templates define: Techniques, infoTypes, transformation rules
Templates reusable across multiple de-identification jobs
Templates documented

De-Identification Use Cases
De-identify data for testing and development
De-identify data for analytics and reporting
De-identify data for sharing with third parties
De-identify data for compliance (GDPR, HIPAA)

DLP Monitoring and Reporting

DLP Monitoring

DLP Dashboards
DLP dashboards created in Cloud Monitoring or Data Studio
Dashboards display: DLP job status, findings by severity, findings by infoType, trends
Dashboards reviewed regularly

DLP Alerts
Alerts configured for: High-severity findings, DLP job failures, unusual patterns
Alerts sent to security team via email, SMS, or PagerDuty
Alerts investigated promptly

DLP Logs
DLP activity logged in Cloud Logging
Logs include: Job execution, findings, actions taken
Logs exported to SIEM for centralized monitoring
Logs retained per retention policy (1 year minimum)

DLP Reporting

DLP Metrics
Metrics tracked: Number of DLP jobs, number of findings, findings by severity, findings by infoType, false positive rate
Metrics reported quarterly to management
Metrics used to improve DLP program

DLP Reports
Quarterly DLP report to management
Report includes: DLP findings summary, high-risk findings, remediation actions, program improvements
Report supports compliance and governance

DLP Compliance
DLP findings support compliance audits
DLP configuration documented for auditors
DLP reports demonstrate compliance with privacy regulations

DLP Program Management

DLP Policy and Standards
DLP policy and standards documented
Policy defines: DLP scope, infoTypes, actions, responsibilities
Policy reviewed and updated annually
Policy communicated to personnel

DLP Implementation
DLP implemented in phases: Discovery, classification, protection, monitoring
Implementation prioritized based on risk
Implementation documented

DLP Tuning
DLP rules and templates tuned to reduce false positives
Tuning based on findings review and feedback
Tuning documented

DLP Training
Personnel trained on DLP policies and procedures
Training covers: Data classification, data handling, DLP tools
Training documented

DLP Continuous Improvement
DLP program continuously improved
Improvements based on: Findings, incidents, feedback, new threats
Improvements documented

Roles and Responsibilities

CISO (Jacob Johnston)
Overall responsibility for DLP program
Approve DLP policy and standards
Review DLP metrics and findings
Ensure DLP compliance

DLP Administrators
Implement and manage DLP configuration
Create and maintain inspection and de-identification templates
Configure DLP jobs and triggers
Monitor DLP findings and alerts
Investigate and remediate high-severity findings

Data Owners
Classify data per Data Classification Policy
Define data protection requirements
Review DLP findings for their data
Approve de-identification or remediation actions

All Personnel
Handle data per Data Handling Policy
Report suspected data loss or exposure
Comply with DLP policies

Contact Information

For DLP questions or to report data loss incidents, contact:

Jacob Johnston
Founder and Chief Information Security Officer
True North Data Strategies LLC
Email: jacob@truenorthstrategyops.com
Phone: 555-555-5555
Colorado Springs, CO

UEI: WKJXXACV8U43
CAGE Code: 16TC1
