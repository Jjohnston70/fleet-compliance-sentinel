TRUE NORTH DATA STRATEGIES LLC
PASSWORD POLICY

Purpose

This Password Policy establishes True North Data Strategies LLC's requirements for creating, managing, and protecting passwords and authentication credentials. This policy ensures strong authentication security and protects against unauthorized access to systems and data.

Scope

This policy applies to all True North Data Strategies personnel, contractors, subcontractors, and any other individuals with access to company systems, applications, or data. It covers all passwords and authentication credentials for company systems, applications, and services.

Governance and Cross-Package References

This policy operates under the authority of the Security and Compliance Handbook (Package 2), which establishes the master governance framework for authentication and access control.

Universal TNDS Principles:
Data-as-Regulated: TNDS treats all client and customer data as regulated by default; strong passwords protect access to all data
No Sensitive Data in Logs: Password management logs and audit trails must NEVER contain actual passwords, PII, PHI, PCI, CUI, or other regulated identifiers

Cross-Package Integration:
Package 2 (Security & Compliance Handbook): Master governance document establishing authentication requirements (Section 2)
Package 1 (Access Control Policy): Establishes access control principles including authentication
Package 1 (Encryption and Key Management): Establishes requirements for password hashing and encryption
Package 5 (Google Workspace Security Configuration): Platform-specific password policy implementation

For access control requirements, see Package 1 (Access Control Policy).
For password encryption requirements, see Package 1 (Encryption and Key Management).

Password Requirements

Password Complexity

Minimum Password Length
Standard Accounts: 12 characters minimum
Privileged Accounts: 16 characters minimum
Service Accounts: 20 characters minimum
Longer passwords strongly encouraged

Password Composition
At least one uppercase letter (A-Z)
At least one lowercase letter (a-z)
At least one number (0-9)
At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
No dictionary words or common patterns
No personal information (name, birthday, etc.)
No company information (company name, address, etc.)

Password Strength
Passwords must be strong and resistant to guessing and cracking
Passphrases (multiple words) encouraged for memorability and strength
Password strength verified using password strength meter
Weak passwords rejected

Password Examples

Strong Passwords
Correct-Horse-Battery-Staple-2024!
MyD0g&CatAre8est!Friends
Tr@vel2Paris#Summer2024
Random: Kj9$mP2#qL5@wN8

Weak Passwords (Do Not Use)
Password123
Company2024
JohnSmith1980
Qwerty123!
123456789

Password Management

Password Creation
Users create passwords meeting complexity requirements
System enforces password complexity requirements
Weak passwords rejected
Password creation documented

Password Changes

Regular Password Changes
Standard Accounts: Change every 90 days
Privileged Accounts: Change every 60 days
Service Accounts: Change every 180 days or when personnel with access change
Password change reminders sent in advance

Mandatory Password Changes
Passwords changed immediately upon suspected compromise
Passwords changed immediately upon termination of personnel with knowledge of password
Passwords changed after security incident
Default passwords changed immediately upon system deployment

Password History
Password history prevents reuse of recent passwords
Last 12 passwords cannot be reused
Password history enforced by systems

Password Storage

User Password Storage
Passwords not written down or stored insecurely
Passwords not stored in plaintext files or documents
Passwords not stored in web browsers without master password protection
Password managers used for storing multiple passwords

System Password Storage
Passwords hashed using strong hashing algorithms (bcrypt, scrypt, Argon2)
Password hashes salted with unique salt per password
Passwords never stored in plaintext
Password databases protected with encryption and access controls

Password Transmission
Passwords transmitted only over encrypted connections (HTTPS, TLS, VPN)
Passwords not transmitted via unencrypted email
Passwords not transmitted via unencrypted messaging
Passwords not transmitted verbally except in secure environment

Password Protection

Password Confidentiality
Passwords are confidential and not shared
Each user has unique password
Shared accounts prohibited except where technically necessary
Password sharing prohibited

Password Disclosure
Passwords not disclosed to anyone including IT personnel, managers, or colleagues
IT personnel do not ask for user passwords
Password reset procedures used instead of password disclosure
Requests for passwords reported as potential social engineering

Password Visibility
Passwords not displayed on screen when entered (masked with asterisks or dots)
Passwords not visible to others when being entered
Privacy screens used when entering passwords in public areas
Passwords not included in screenshots or screen recordings

Password Security Practices
Passwords not saved in web browsers on shared computers
Passwords not auto-filled on untrusted devices
Passwords not entered on untrusted or public computers
Passwords not entered on phishing websites

Multi-Factor Authentication (MFA)

MFA Requirements

MFA Required For
Remote access (VPN, remote desktop)
Privileged accounts (administrators)
Access to Confidential or Restricted data
Cloud services (Google Workspace, etc.)
Financial systems
Email accounts

MFA Strongly Recommended For
All user accounts
All applications supporting MFA
All cloud services

MFA Methods

Preferred MFA Methods
Authenticator app (Google Authenticator, Microsoft Authenticator, Authy, etc.)
Hardware security key (YubiKey, Titan Security Key, etc.)
Push notification to mobile device

Acceptable MFA Methods
SMS or text message to registered mobile phone
Phone call to registered phone number
Backup codes (for account recovery)

Unacceptable MFA Methods
Email-based MFA (email can be compromised)
Security questions (easily guessed or researched)

MFA Setup
MFA enrolled during account setup
MFA backup method configured
MFA recovery codes saved securely
MFA enrollment verified before account access granted

MFA Usage
MFA required at each login for high-security systems
MFA required periodically for lower-security systems (every 30 days)
MFA prompt not bypassed or ignored
Lost MFA device reported immediately for reset

Account Security

Account Lockout

Failed Login Attempts
Account locked after 5 failed login attempts within 15 minutes
Account lockout duration: 30 minutes
Account unlock by IT personnel or automatic after lockout duration
Failed login attempts logged and monitored

Account Lockout Response
User contacts IT for account unlock
IT verifies user identity before unlock
Repeated lockouts investigated for potential attack
Account lockout incidents documented

Session Management

Session Timeout
Inactive sessions automatically logged out
Session timeout: 15 minutes for high-security systems, 30 minutes for standard systems
Session timeout prevents unauthorized access to unattended workstations
Users manually log out when leaving workstation

Screen Lock
Screens automatically locked after inactivity
Screen lock timeout: 5 minutes
Screen lock requires password to unlock
Users manually lock screen when leaving workstation (Windows: Win+L, macOS: Cmd+Ctrl+Q)

Password Reset

Self-Service Password Reset
Self-service password reset available where feasible
Self-service reset requires identity verification (MFA, security questions, email verification)
Self-service reset logged and monitored

IT-Assisted Password Reset
User contacts IT for password reset
IT verifies user identity before reset (in-person, phone with verification, email from known address)
Temporary password provided, user required to change on first login
Password reset documented

Password Reset Security
Password reset links expire after 24 hours or first use
Password reset links sent to registered email address only
Password reset requests from unknown sources investigated as potential attack

Account Compromise Response
Suspected account compromise reported immediately to IT and CISO
Compromised account password changed immediately
Account activity reviewed for unauthorized actions
Incident response procedures activated
Incident documented

Password Managers

Password Manager Usage

Password Manager Benefits
Securely store multiple complex passwords
Generate strong random passwords
Auto-fill passwords on trusted devices
Sync passwords across devices
Reduce password reuse

Approved Password Managers
Google Password Manager (Chrome, Android)
Apple Keychain (macOS, iOS)
Microsoft Authenticator (password manager feature)
Commercial password managers (1Password, LastPass, Dashlane, Bitwarden, etc.)

Password Manager Security
Password manager protected with strong master password
Master password meets password complexity requirements
Master password not stored or written down
Password manager MFA enabled
Password manager auto-lock enabled
Password manager used only on trusted devices

Password Manager Master Password
Master password is critical - protects all stored passwords
Master password must be memorable but strong
Master password changed if compromised
Master password not shared
Master password recovery method configured securely

Service Accounts and Application Passwords

Service Account Passwords
Service accounts used for applications and automated processes
Service account passwords meet complexity requirements (20 characters minimum)
Service account passwords changed every 180 days or when personnel with access change
Service account passwords stored securely (key vault, password manager, encrypted configuration)
Service account password access restricted to authorized personnel

Application Passwords and API Keys
Application passwords and API keys treated as passwords
API keys rotated regularly
API keys stored securely
API keys not embedded in code or configuration files in version control
API keys not transmitted insecurely

Shared Account Passwords
Shared accounts avoided where possible
Shared account passwords meet complexity requirements
Shared account passwords changed when any user with access leaves
Shared account password access documented
Shared account activity logged

Password Policy Compliance

Password Audits
Password compliance audited regularly
Weak passwords identified and required to change
Password policy violations identified and addressed
Audit findings documented

Password Compliance Monitoring
Password complexity enforced by systems
Password age monitored
Accounts with old passwords identified and required to change
Password policy compliance metrics tracked

Password Policy Violations
Password policy violations addressed through corrective action
Minor violations: Warning and password change required
Repeated violations: Disciplinary action
Serious violations: Account suspension, termination

Password Policy Exceptions
Exceptions to password policy require written justification and approval
Exceptions approved by CISO
Exceptions documented with compensating controls
Exceptions reviewed annually

Password Security Awareness

Password Training
Password policy training during onboarding
Annual security awareness training includes password security
Password best practices communicated regularly
Training documented

Password Security Tips
Use strong, unique passwords for each account
Use password manager to manage multiple passwords
Enable multi-factor authentication wherever available
Never share passwords
Change passwords if compromised
Beware of phishing attempts to steal passwords
Use passphrases for memorable strong passwords
Do not reuse passwords across accounts

Phishing Awareness
Phishing is common method to steal passwords
Verify website legitimacy before entering password
Do not click links in suspicious emails
Do not enter password on untrusted websites
Report phishing attempts to IT

Password Incident Reporting
Report lost or stolen devices that may contain passwords
Report suspected password compromise
Report phishing attempts
Report password policy violations
No retaliation for good faith reporting

Special Password Requirements

Privileged Account Passwords
Privileged accounts (administrators) have elevated access
Privileged account passwords: 16 characters minimum
Privileged account passwords changed every 60 days
Privileged account passwords never shared
Privileged accounts require MFA
Privileged account activity logged and monitored

Emergency Account Passwords
Emergency "break-glass" accounts for critical situations
Emergency account passwords: 20 characters minimum
Emergency account passwords stored securely (sealed envelope, key vault)
Emergency account use requires dual authorization
Emergency account use logged and reviewed

Vendor and Third-Party Passwords
Vendor accounts have unique passwords
Vendor passwords not shared with multiple vendors
Vendor passwords changed when vendor relationship ends
Vendor access monitored and logged

Client Account Passwords
Client accounts have strong passwords
Client passwords meet or exceed this policy
Client password security communicated to clients
Client account security monitored

Roles and Responsibilities

All Users
Create strong passwords meeting policy requirements
Protect passwords from disclosure
Change passwords per policy schedule
Report password compromise or policy violations
Use multi-factor authentication
Follow password security best practices

IT Personnel
Enforce password policy through technical controls
Assist with password resets
Monitor password compliance
Investigate password-related incidents
Maintain password management systems

CISO (Jacob Johnston)
Overall responsibility for password policy
Approve password policy and requirements
Review password compliance metrics
Ensure password policy enforcement
Approve password policy exceptions

Contact Information

For password policy questions, password resets, or to report password compromise, contact:

Jacob Johnston
Founder and Chief Information Security Officer
True North Data Strategies LLC
Email: jacob@truenorthstrategyops.com
Phone: 555-555-5555
Colorado Springs, CO

UEI: WKJXXACV8U43
CAGE Code: 16TC1
