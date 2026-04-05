TRUE NORTH DATA STRATEGIES LLC
ACCESS CONTROL POLICY

Purpose

This Access Control Policy establishes True North Data Strategies LLC's requirements for managing access to information systems, applications, data, and facilities. This policy ensures that access is granted based on business need, follows the principle of least privilege, and is properly managed throughout the access lifecycle.

Scope

This policy applies to all True North Data Strategies personnel, contractors, subcontractors, and any other individuals requiring access to company systems, applications, data, or facilities. It covers logical access (systems and data) and physical access (facilities and equipment).

Governance and Cross-Package References

This policy operates under the authority of the Security and Compliance Handbook (Package 2), which establishes the master governance framework for all TNDS security policies and procedures.

Universal TNDS Principles:
Data-as-Regulated: TNDS treats all client and customer data as regulated by default, requiring strict access controls for all data
No Sensitive Data in Logs: Access logs and audit trails must not contain PII, PHI, PCI, CUI, or other regulated identifiers in unprotected form

Cross-Package Integration:
Package 2 (Security & Compliance Handbook): Master governance document establishing access control requirements (Section 2)
Package 3 (Data Handling & Privacy): Authoritative source for data classification determining access control requirements
Package 5 (Google Cloud IAM Policy): Platform-specific implementation of access controls on Google infrastructure
Package 5 (Google Workspace Security Configuration): Workspace-specific access control implementation
Package 1 (Audit Logging and Monitoring Policy): Establishes logging requirements for access events

For data classification and handling requirements, see Package 3 (Data Handling Standard).
For Google platform access control implementation, see Package 5 (Google Cloud IAM Policy).
For access logging requirements, see Package 1 (Audit Logging and Monitoring Policy).

Access Control Principles

Least Privilege
Users granted minimum access necessary to perform job functions
Privileged access limited to authorized personnel
Access rights reviewed regularly
Excessive access removed promptly

Need-to-Know
Access granted based on business need
Access to sensitive information limited to those requiring it for job duties
Access justification documented
Access removed when business need no longer exists

Separation of Duties
Critical functions divided among multiple individuals
No single individual has complete control over critical processes
Reduces risk of fraud, error, and unauthorized actions
Implemented for financial transactions, system administration, and sensitive data access

Role-Based Access Control
Access based on job role and responsibilities
Standard access profiles defined for common roles
Role changes trigger access review and adjustment
Role-based access simplifies access management

Defense in Depth
Multiple layers of access controls
Authentication, authorization, and audit logging
Network segmentation and access controls
Application-level and data-level access controls

User Access Management

Access Request Process

Step 1 — Access Request
User or manager submits access request
Request includes user identity, requested access, business justification, duration
Request submitted through formal process (ticketing system, email, form)
Request documented

Step 2 — Access Approval
Manager approves access based on job role and business need
Data owner approves access to sensitive data
IT Security reviews access for appropriateness
Multi-level approval for privileged access
Approval documented

Step 3 — Access Provisioning
IT provisions access per approved request
Access granted with least privilege
Access configured per security standards
Access provisioning documented
User notified of access grant

Step 4 — Access Verification
User verifies access works as expected
Access tested before user begins work
Issues resolved promptly

Access Modification
Access changes requested through same process as initial access
Access increases require approval
Access decreases processed promptly
Access modifications documented

Access Removal
Access removed immediately upon termination
Access removed when no longer needed for business purposes
Access removal verified
Access removal documented

User Account Management

Account Creation
Unique user account for each individual
Shared accounts prohibited except where technically necessary
Account naming convention followed
Account attributes configured (name, email, role, department)
Account creation documented

Account Types
Standard User Accounts: Regular business users
Privileged Accounts: System administrators, database administrators
Service Accounts: Applications and automated processes
Emergency Accounts: Break-glass accounts for emergencies
Guest Accounts: Temporary access for visitors or contractors

Account Standards
Strong password required
Multi-factor authentication required for privileged and remote access
Account lockout after failed login attempts
Session timeout after inactivity
Account expiration date set for temporary accounts

Account Monitoring
Account activity monitored
Anomalous activity investigated
Dormant accounts identified and disabled
Account compliance audited regularly

Account Termination
Accounts disabled immediately upon termination
Accounts deleted after retention period
Account termination verified
Account termination documented

Authentication

Password Requirements

Password Complexity
Minimum 12 characters
At least one uppercase letter
At least one lowercase letter
At least one number
At least one special character
No dictionary words or common patterns

Password Management
Passwords not shared
Passwords not written down or stored insecurely
Passwords changed every 90 days
Passwords changed immediately if compromised
Password history prevents reuse of last 12 passwords
Default passwords changed immediately

Password Storage
Passwords hashed and salted
Passwords not stored in plaintext
Password databases protected
Password transmission encrypted

Multi-Factor Authentication

MFA Requirements
MFA required for remote access
MFA required for privileged accounts
MFA required for access to sensitive data
MFA required for cloud services
MFA strongly recommended for all accounts

MFA Methods
Authenticator app (preferred)
SMS or phone call
Hardware token
Biometric authentication
Push notification

MFA Management
MFA enrollment required before access granted
MFA backup methods configured
Lost MFA devices reported and reset
MFA bypass requires approval and is temporary

Single Sign-On
SSO implemented where feasible
SSO reduces password fatigue
SSO provides centralized authentication
SSO integrated with MFA
SSO session management configured

Biometric Authentication
Biometric authentication permitted for device unlock
Biometric data stored securely
Biometric authentication as MFA factor
Fallback authentication method required

Authorization

Role-Based Access Control

Role Definition
Roles defined based on job functions
Roles include standard access permissions
Roles documented with access rights
Roles reviewed annually

Role Assignment
Users assigned to roles based on job position
Role assignment approved by manager
Multiple role assignments permitted if justified
Role assignments documented

Role Management
Roles updated when access requirements change
Obsolete roles removed
Role access rights reviewed annually
Role changes communicated to users

Attribute-Based Access Control
Access decisions based on user attributes (department, location, clearance)
Dynamic access control based on context
Fine-grained access control for sensitive data
Attribute-based policies documented

Data Access Control

Data Classification-Based Access
Access controls based on data classification
Public data: No access restrictions
Internal data: Company personnel only
Confidential data: Authorized personnel only
Restricted data: Specific authorized personnel, access logged

Data Owner Authorization
Data owners approve access to their data
Data owners define access requirements
Data owners review access regularly
Data owners responsible for data security

Data Access Logging
Access to Restricted data logged
Access logs include user, date/time, action, data accessed
Access logs reviewed regularly
Anomalous access investigated

Privileged Access Management

Privileged Account Types
System Administrator: Full system access
Database Administrator: Full database access
Security Administrator: Security system access
Network Administrator: Network device access
Application Administrator: Application administrative access

Privileged Access Controls
Privileged access limited to authorized personnel
Privileged access requires additional approval
Privileged access requires MFA
Privileged access monitored and logged
Privileged access reviewed quarterly

Privileged Session Management
Privileged sessions recorded where feasible
Privileged sessions time-limited
Privileged sessions require re-authentication
Privileged session activity monitored

Emergency Access
Emergency "break-glass" accounts for critical situations
Emergency access requires dual authorization
Emergency access use logged and reviewed
Emergency access use reported to management

Remote Access

Remote Access Methods
Virtual Private Network (VPN) for remote network access
Remote Desktop Protocol (RDP) for remote system access
Secure Shell (SSH) for remote server access
Web-based access for cloud applications
Remote access methods approved and secured

Remote Access Security
MFA required for all remote access
VPN required for access to internal network
Remote access encrypted
Remote access from approved devices only
Remote access monitored and logged

Remote Access Approval
Remote access requires manager approval
Remote access business justification documented
Remote access reviewed periodically
Remote access revoked when no longer needed

Third-Party Access

Vendor and Contractor Access
Third-party access limited to business need
Third-party access requires contract or agreement
Third-party access approved by business owner
Third-party access time-limited
Third-party access monitored

Third-Party Access Controls
Separate accounts for third-party users
Third-party access does not grant privileged access without additional approval
Third-party access logged
Third-party access reviewed regularly
Third-party access terminated upon contract end

Client Access
Client access to project systems or data as required
Client access approved by project manager
Client access limited to client's own data
Client access secured with MFA
Client access documented

Physical Access Control

Facility Access
Office access controlled through locks and access control systems
Access badges or keys issued to authorized personnel
Visitor access logged and escorted
After-hours access limited to authorized personnel
Access control systems monitored

Sensitive Area Access
Server rooms and equipment rooms have additional access controls
Access to sensitive areas limited to authorized personnel
Access to sensitive areas logged
Sensitive areas monitored with cameras
Sensitive area access reviewed regularly

Visitor Management
Visitors sign in and receive visitor badge
Visitors escorted at all times
Visitor access logged with name, company, purpose, host, time in/out
Visitor badges returned upon departure
Visitor access to sensitive areas restricted

Physical Access Removal
Physical access removed upon termination
Keys and badges returned
Access removal verified
Lock combinations changed if necessary

Access Review and Recertification

Access Review Frequency
Privileged access reviewed quarterly
Standard user access reviewed annually
Third-party access reviewed quarterly
Role-based access reviewed annually
Data owner access reviews as required

Access Review Process
Access reports generated for review
Managers review team member access
Data owners review access to their data
Inappropriate access identified and removed
Access review documented

Access Recertification
Users recertify need for access periodically
Recertification for privileged access quarterly
Recertification for standard access annually
Failure to recertify results in access suspension
Recertification documented

Access Violations

Violation Types
Unauthorized access attempts
Sharing of credentials
Circumventing access controls
Accessing data without business need
Privilege abuse

Violation Detection
Access violations detected through monitoring and auditing
Anomalous access patterns investigated
User reports of suspicious activity
Audit findings

Violation Response
Violations investigated promptly
Access suspended during investigation if necessary
Violations addressed through corrective action
Serious violations result in termination
Criminal violations referred to law enforcement

Access Logging and Monitoring

Logging Requirements
Authentication events logged (successful and failed logins)
Authorization events logged (access granted or denied)
Privileged access logged
Access to sensitive data logged
Administrative actions logged

Log Management
Logs collected centrally
Logs protected from unauthorized access and modification
Logs retained per compliance requirements (minimum 1 year)
Logs reviewed regularly
Alerts configured for suspicious activity

Access Monitoring
Real-time monitoring of access events
Anomalous access patterns detected and investigated
Failed login attempts monitored
Privileged access monitored
Access monitoring metrics reported

Roles and Responsibilities

Users
Request access through proper channels
Use access only for authorized purposes
Protect credentials
Report access issues and violations
Comply with access control policies

Managers
Approve access requests for team members
Review team member access regularly
Report access violations
Ensure team compliance with access policies

Data Owners
Define access requirements for their data
Approve access to their data
Review access to their data regularly
Ensure data access compliance

IT and Security
Provision and de-provision access
Configure access controls
Monitor access activity
Investigate access violations
Conduct access audits

CISO
Oversee access control program
Approve access control policies and standards
Review access metrics and violations
Ensure access control compliance

Contact Information

For questions regarding access control, contact:

Jacob Johnston
Founder and Chief Information Security Officer
True North Data Strategies LLC
Email: jacob@truenorthstrategyops.com
Phone: 555-555-5555
Colorado Springs, CO
UEI: WKJXXACV8U43
CAGE Code: 16TC1
