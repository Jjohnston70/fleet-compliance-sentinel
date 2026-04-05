[COMPANY_LEGAL_NAME]
[CLOUD_PLATFORM_WORKSPACE] SECURITY CONFIGURATION STANDARD

Purpose

This [CLOUD_PLATFORM_WORKSPACE] Security Configuration Standard establishes [COMPANY_LEGAL_NAME]'s requirements for securely configuring and managing [CLOUD_PLATFORM_WORKSPACE] services. This standard ensures [CLOUD_PLATFORM_WORKSPACE] is configured to protect company data, maintain compliance, and support business operations securely.

Scope

This standard applies to all [COMPANY_NAME] [CLOUD_PLATFORM_WORKSPACE] services including Gmail, [CLOUD_PROVIDER] Drive, [CLOUD_PROVIDER] Meet, [CLOUD_PROVIDER] Calendar, [CLOUD_PROVIDER] Docs, and other Workspace applications. It applies to all personnel responsible for administering or using [CLOUD_PLATFORM_WORKSPACE].

Governance and Cross-Package References

This standard implements [COMPANY_ABBREVIATION] security and data protection requirements on the [CLOUD_PLATFORM_WORKSPACE] platform.

Universal [COMPANY_ABBREVIATION] Principles - Platform Implementation:
Data-as-Regulated: All client and customer data in [CLOUD_PLATFORM_WORKSPACE] treated as regulated by default
No Sensitive Data in Logs: [CLOUD_PLATFORM_WORKSPACE] admin logs, audit logs, and monitoring must not contain PII, PHI, PCI, CUI in unprotected form

Cross-Package Integration:
security-governance skill: Master governance document; this standard implements requirements on [CLOUD_PLATFORM_WORKSPACE]
data-handling-privacy skill: Data classification and handling requirements implemented via [CLOUD_PLATFORM_WORKSPACE] DLP
internal-compliance skill (access control): Access control requirements implemented via [CLOUD_PLATFORM_WORKSPACE] IAM
cloud-platform-security skill (DLP configuration): Technical DLP controls implementing data protection

Admin Activity Monitoring:
Admin console activity logged and monitored per internal-compliance skill (audit logging and monitoring)
Admin logs protected from containing unprotected PII per data-handling-privacy skill (anonymization)
Role boundaries enforced: Super admin access limited to minimum necessary personnel
Change logging: All configuration changes logged with admin identity, timestamp, and change details

For data protection requirements, see data-handling-privacy skill.
For DLP implementation, see Package 5 ([CLOUD_PROVIDER] Data Loss Prevention Configuration).

[CLOUD_PLATFORM_WORKSPACE] Security Principles

Security by Default
Security controls enabled by default
Least privilege access enforced
Security settings configured before user access
Security configuration documented

Defense in Depth
Multiple layers of security controls
Security controls complement each other
Security controls protect against various threats
Security continuously monitored and improved

Data Protection
Data encrypted in transit and at rest
Data loss prevention controls implemented
Data sharing controlled and monitored
Data retention and deletion managed

Compliance and Governance
[CLOUD_PLATFORM_WORKSPACE] configuration supports compliance requirements
Configuration changes controlled and documented
Configuration audited regularly
Configuration aligns with security policies

[CLOUD_PLATFORM_WORKSPACE] Account and Organization Settings

Organization Configuration

Organization Structure
Single organization for [COMPANY_LEGAL_NAME]
Organizational units (OUs) used to group users and apply policies
OUs structured by: Department, role, or function
OU structure documented

Domain Configuration
Primary domain: [COMPANY_WEBSITE]
Domain ownership verified
Domain DNS records configured (SPF, DKIM, DMARC)
Additional domains or aliases configured as needed

Super Admin Accounts
Minimum number of super admin accounts (2-3)
Super admin accounts for: CISO ([OWNER_NAME]) and backup administrators
Super admin accounts protected with strong passwords and hardware security keys
Super admin accounts monitored closely
Super admin account activity logged and reviewed

Admin Roles
Admin roles assigned based on least privilege
Predefined admin roles used where possible
Custom admin roles created for specific needs
Admin role assignments documented and reviewed quarterly

Account Security Settings

Password Policy
Strong password requirements enforced
Minimum password length: 12 characters
Password complexity required
Password expiration: 90 days (or longer with MFA)
Password reuse prevention: Last 24 passwords
Password policy applied to all users

Multi-Factor Authentication (MFA)
MFA required for all users
MFA enforcement: Mandatory, no opt-out
MFA methods: [CLOUD_PROVIDER] Authenticator app, hardware security keys (FIDO2), [CLOUD_PROVIDER] Prompt
Hardware security keys required for admin accounts
MFA enrollment enforced at first login
MFA backup codes provided and secured

Session Management
Session length: 12 hours for web sessions
Re-authentication required after session expiration
Concurrent sessions limited where feasible
Session activity monitored

Account Recovery
Account recovery options configured
Recovery email and phone number required
Recovery options verified
Account recovery process documented

Less Secure Apps
Less secure app access blocked
OAuth 2.0 required for application access
Legacy authentication protocols disabled
Exception process for necessary legacy apps (with compensating controls)

User Account Management

User Provisioning
User accounts created through controlled process
Account creation requires manager approval
User information complete and accurate (name, email, department, role)
Account provisioning documented

User Lifecycle
User accounts created during onboarding
User accounts modified when role changes
User accounts suspended immediately upon termination
Suspended accounts deleted after 30 days
User lifecycle managed through HR integration or manual process

User Groups
Groups used to manage access and permissions
Groups structured by: Department, project, function
Group membership managed by group owners or admins
Group membership reviewed quarterly
External group membership restricted

Guest and External Users
Guest users allowed for collaboration with external partners
Guest user access limited to specific resources
Guest user access time-limited where feasible
Guest user activity monitored
Guest user policy documented

Gmail Security Configuration

Email Security Settings

SPF (Sender Policy Framework)
SPF record configured for domain
SPF record includes authorized mail servers
SPF record: "v=spf1 include:_spf.[CLOUD_PROVIDER_DOMAIN] ~all"
SPF record published in DNS

DKIM (DomainKeys Identified Mail)
DKIM signing enabled for outbound email
DKIM keys generated and published in DNS
DKIM key rotation: Every 6-12 months
DKIM verification for inbound email

DMARC (Domain-based Message Authentication, Reporting, and Conformance)
DMARC policy configured for domain
DMARC policy: "v=DMARC1; p=quarantine; rua=mailto:dmarc@[COMPANY_WEBSITE]"
DMARC reports monitored
DMARC policy progressed to "p=reject" when ready

TLS (Transport Layer Security)
TLS required for inbound and outbound email
TLS version: 1.2 or higher
Opportunistic TLS enabled
TLS compliance monitored

Spam and Phishing Protection
Gmail spam filters enabled (default)
Phishing and malware protection enabled
Enhanced pre-delivery message scanning enabled
Suspicious email warnings enabled
External email warning banners enabled
Attachment protection enabled (blocks executable files)

Email Encryption
S/MIME encryption available for sensitive email
S/MIME certificates issued to users requiring encryption
Email encryption policy documented
Encryption usage monitored

Email Retention and Deletion
Email retention policy configured per Records Management Policy
Retention period: 7 years for business email
Email deletion after retention period
Litigation hold capability available

Email DLP (Data Loss Prevention)
DLP rules configured to prevent sensitive data leakage
DLP rules detect: Credit card numbers, Social Security numbers, confidential data
DLP actions: Warn, block, quarantine
DLP incidents reviewed and investigated

Email Routing and Compliance
Email routing rules configured for compliance and security
Compliance routing for archiving or DLP
Email journaling for compliance (if required)
Routing rules documented

[CLOUD_PROVIDER] Drive Security Configuration

Drive Sharing Settings

Default Sharing Settings
Default sharing: Off (files private by default)
Users can change sharing permissions for their files
External sharing allowed with restrictions
Link sharing: Restricted to organization by default

External Sharing Controls
External sharing allowed for business collaboration
External sharing requires recipient email address (no "anyone with link" for sensitive data)
External sharing monitored and audited
External sharing policy communicated to users

Sharing Permissions
Sharing permissions: Viewer, Commenter, Editor
Least privilege sharing enforced
Sharing permissions reviewed regularly
Overly permissive sharing identified and corrected

Drive for Desktop
Drive for Desktop allowed for syncing files to local devices
Drive for Desktop requires device encryption
Drive for Desktop usage monitored
Drive for Desktop policy documented

Drive DLP (Data Loss Prevention)
DLP rules applied to Drive files
DLP rules detect sensitive data in files
DLP actions: Warn, block sharing, restrict access
DLP incidents reviewed and investigated

Drive Encryption
Files encrypted at rest by [CLOUD_PROVIDER] (default)
Files encrypted in transit (TLS)
Client-side encryption available for highly sensitive data (if required)
Encryption keys managed by [CLOUD_PROVIDER] or customer (CMEK)

Drive Retention and Deletion
Drive retention policy configured per Records Management Policy
Retention period based on file type and classification
Files deleted after retention period
Deleted files retained in trash for 30 days, then permanently deleted

[CLOUD_PROVIDER] Meet Security Configuration

Meet Security Settings

Meeting Access Controls
Meeting access restricted to organization by default
External participants allowed with host approval
Waiting room enabled for external participants
Meeting codes randomized and unique
Meeting links expire after meeting ends

Meeting Host Controls
Host can mute participants
Host can remove participants
Host can end meeting for all
Host can lock meeting to prevent new participants
Host controls documented and communicated

Meeting Recording
Meeting recording allowed with participant consent
Recording notification displayed to all participants
Recordings stored in [CLOUD_PROVIDER] Drive
Recording access restricted to meeting participants
Recording retention per Records Management Policy

Meeting Security Features
Encryption in transit (TLS)
Encryption at rest for recordings
Meeting attendance logged
Meeting security features enabled by default

Screen Sharing Controls
Screen sharing restricted to meeting participants
Host can control who can share screen
Screen sharing monitored for inappropriate content

[CLOUD_PROVIDER] Calendar Security Configuration

Calendar Sharing Settings
Default calendar sharing: Private (only free/busy visible)
Users can share calendars with specific individuals or groups
External calendar sharing restricted
Calendar sharing policy communicated

Calendar Event Visibility
Event details private by default
Users can control event visibility
Sensitive events marked as private
Calendar event visibility monitored

[CLOUD_PROVIDER] Docs, Sheets, Slides Security Configuration

Document Sharing and Collaboration
Document sharing follows Drive sharing settings
Collaboration features enabled (comments, suggestions)
Version history enabled and retained
Document access logged and audited

Document DLP
DLP rules applied to Docs, Sheets, Slides
DLP detects sensitive data in documents
DLP actions: Warn, block sharing, restrict access
DLP incidents reviewed

Document Encryption
Documents encrypted at rest and in transit
Client-side encryption available for highly sensitive documents (if required)

[CLOUD_PLATFORM_WORKSPACE] Security Monitoring and Auditing

Security Monitoring

Admin Audit Logs
Admin activity logged (user management, settings changes, etc.)
Admin logs reviewed regularly
Admin logs retained for 6 months (extended to 1 year with Vault)
Admin logs exported to SIEM for long-term retention

User Audit Logs
User activity logged (login, file access, sharing, etc.)
User logs reviewed for security incidents
User logs retained for 6 months (extended to 1 year with Vault)
User logs exported to SIEM for long-term retention

Security Center
[CLOUD_PLATFORM_WORKSPACE] Security Center monitored
Security Center provides: Security health, alerts, investigations
Security alerts reviewed and investigated
Security Center dashboard reviewed weekly

Alert Center
Alert Center monitored for security alerts
Alerts include: Suspicious activity, phishing, malware, DLP violations
Alerts investigated promptly
Alert notifications sent to security team

Security Investigation Tool
Investigation tool used to investigate security incidents
Tool provides: User activity, email logs, Drive activity
Investigations documented

Third-Party App Access

OAuth App Management
Third-party apps accessing Workspace data reviewed and approved
App access based on business need and security assessment
Risky or unnecessary apps blocked
App access monitored and audited

Trusted Apps
Trusted apps whitelisted for organization
Untrusted apps blocked or require admin approval
App trust policy documented

API Access
API access controlled and monitored
API clients registered and approved
API access logs reviewed
API access restricted to necessary scopes

[CLOUD_PLATFORM_WORKSPACE] Advanced Security Features

Context-Aware Access
Context-aware access policies configured
Access policies based on: User, device, location, IP address
Access policies enforce: MFA, device encryption, device management
Access policies applied to sensitive data and applications

Data Regions
Data region selected for data residency requirements
Data stored in specified geographic region
Data region policy documented

[CLOUD_PROVIDER] Vault
[CLOUD_PROVIDER] Vault used for eDiscovery and retention
Vault retains email, Drive files, Chat messages
Vault supports litigation holds
Vault search and export capabilities

Security Sandbox
Security Sandbox enabled for Gmail
Sandbox analyzes attachments in isolated environment
Sandbox detects malware and ransomware
Sandbox blocks malicious attachments

Mobile Device Management (MDM)
[CLOUD_PLATFORM_WORKSPACE] MDM enabled
MDM enforces device security policies
MDM policies: Password, encryption, screen lock
MDM allows remote wipe of company data
MDM monitors device compliance

Endpoint Verification
Endpoint verification enabled
Endpoint verification ensures devices meet security requirements
Verified devices have access to Workspace
Unverified devices blocked or restricted

[CLOUD_PLATFORM_WORKSPACE] Compliance

Compliance Features
[CLOUD_PLATFORM_WORKSPACE] supports compliance with GDPR, HIPAA, PCI-DSS, etc.
Compliance features: Data residency, encryption, audit logs, retention, DLP
Compliance certifications: ISO 27001, SOC 2, SOC 3, HIPAA, PCI-DSS
Compliance documentation available from [CLOUD_PROVIDER]

Data Processing Agreement (DPA)
[CLOUD_PLATFORM_WORKSPACE] DPA accepted
DPA covers data protection obligations
DPA supports GDPR compliance

Business Associate Agreement (BAA)
[CLOUD_PLATFORM_WORKSPACE] BAA signed (if handling PHI)
BAA supports HIPAA compliance

[CLOUD_PLATFORM_WORKSPACE] Security Best Practices

User Training
Users trained on [CLOUD_PLATFORM_WORKSPACE] security
Training covers: Phishing, sharing, passwords, MFA
Training during onboarding and annually

Security Awareness
Security tips and reminders for Workspace users
Phishing awareness campaigns
Security best practices communicated

Regular Security Reviews
[CLOUD_PLATFORM_WORKSPACE] security configuration reviewed quarterly
Security settings verified
Security issues identified and remediated
Security review documented

Security Updates
[CLOUD_PLATFORM_WORKSPACE] security features and updates monitored
New security features evaluated and enabled
Security updates communicated to users

Incident Response
Security incidents in [CLOUD_PLATFORM_WORKSPACE] investigated and responded to
Incident response per Incident Response Plan
Incidents documented and lessons learned

Roles and Responsibilities

[CLOUD_PLATFORM_WORKSPACE] Administrators
Configure and manage [CLOUD_PLATFORM_WORKSPACE] security settings
Provision and manage user accounts
Monitor security alerts and logs
Respond to security incidents
Conduct security reviews

CISO ([OWNER_NAME])
Overall responsibility for [CLOUD_PLATFORM_WORKSPACE] security
Approve [CLOUD_PLATFORM_WORKSPACE] security configuration
Review security metrics and incidents
Ensure compliance with security policies

All Users
Use [CLOUD_PLATFORM_WORKSPACE] securely and responsibly
Protect account credentials
Report security incidents and suspicious activity
Comply with [CLOUD_PLATFORM_WORKSPACE] policies

Contact Information

For [CLOUD_PLATFORM_WORKSPACE] security questions or to report security incidents, contact:

[OWNER_NAME]
Founder and Chief Information Security Officer
[COMPANY_LEGAL_NAME]
Email: [CONTACT_EMAIL]
Phone: [CONTACT_PHONE]
[COMPANY_CITY_STATE_ZIP]

UEI: [COMPANY_UEI]
CAGE Code: [COMPANY_CAGE_CODE]
