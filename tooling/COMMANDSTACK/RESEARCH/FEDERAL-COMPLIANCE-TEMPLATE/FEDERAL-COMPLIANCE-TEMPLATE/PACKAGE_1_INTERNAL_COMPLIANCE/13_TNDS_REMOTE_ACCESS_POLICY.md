TRUE NORTH DATA STRATEGIES LLC
REMOTE ACCESS POLICY

Purpose

This Remote Access Policy establishes True North Data Strategies LLC's requirements for secure remote access to company systems, networks, and data. This policy ensures remote access is properly secured, authorized, and monitored to protect company information assets.

Scope

This policy applies to all True North Data Strategies personnel, contractors, subcontractors, and any other individuals requiring remote access to company systems, networks, or data. It covers all remote access methods and technologies.

Governance and Cross-Package References

This policy operates under the authority of the Security and Compliance Handbook (Package 2), which establishes the master governance framework for remote access security.

Universal TNDS Principles:
Data-as-Regulated: TNDS treats all client and customer data as regulated by default; remote access must maintain data protection equivalent to on-site access
No Sensitive Data in Logs: Remote access logs and monitoring must not contain PII, PHI, PCI, CUI, or other regulated identifiers in unprotected form

Cross-Package Integration:
Package 2 (Security & Compliance Handbook): Master governance document establishing remote access requirements (Section 2)
Package 1 (Access Control Policy): Establishes access control principles for remote access
Package 1 (Audit Logging and Monitoring Policy): Establishes logging requirements for remote access activities
Package 7 (Remote Work Security Policy): Detailed remote work security requirements

For access control principles, see Package 1 (Access Control Policy).
For remote access logging, see Package 1 (Audit Logging and Monitoring Policy).
For comprehensive remote work security, see Package 7 (Remote Work Security Policy).

Remote Access Principles

Security First
Remote access secured with strong authentication and encryption
Remote access monitored for security threats
Remote access from trusted devices and networks
Security controls cannot be bypassed for convenience

Least Privilege
Remote access granted based on business need
Users granted minimum access necessary
Privileged remote access restricted
Remote access reviewed regularly

Business Need
Remote access requires business justification
Remote access approved by manager
Remote access time-limited where appropriate
Remote access revoked when no longer needed

Compliance
Remote access complies with security policies and standards
Remote access complies with regulatory requirements
Remote access audited for compliance
Non-compliant remote access prohibited

Remote Access Methods

Virtual Private Network (VPN)

VPN Requirements
VPN required for remote access to internal network and systems
VPN provides encrypted tunnel for network traffic
VPN authentication requires username, password, and multi-factor authentication
VPN client software installed on authorized devices
VPN connection established before accessing internal resources

VPN Technology
IPsec VPN, SSL VPN, or WireGuard
AES-256 encryption
Strong authentication protocols
Split tunneling disabled (all traffic through VPN)
VPN logs maintained

VPN Usage
VPN used when accessing company network remotely
VPN used on untrusted networks (public Wi-Fi, home networks, etc.)
VPN connection verified before accessing sensitive data
VPN disconnected when not in use

Remote Desktop Protocol (RDP)

RDP Requirements
RDP used for remote access to specific Windows systems
RDP access requires VPN connection first
RDP requires strong password and multi-factor authentication where feasible
RDP access restricted to authorized users
RDP connections logged

RDP Security
RDP over VPN only (not directly exposed to internet)
Network Level Authentication (NLA) enabled
RDP encryption enabled
RDP access restricted by firewall
Failed RDP login attempts monitored

Secure Shell (SSH)

SSH Requirements
SSH used for remote access to Linux/Unix servers
SSH requires strong authentication (SSH keys or strong passwords)
SSH password authentication disabled where feasible (key-based authentication preferred)
SSH access restricted to authorized users
SSH connections logged

SSH Security
SSH over VPN or restricted IP addresses
SSH keys protected with passphrase
SSH keys minimum 2048-bit RSA or equivalent
Root login via SSH disabled
SSH protocol version 2 only

Cloud-Based Remote Access

Google Workspace
Google Workspace accessible remotely via web browser
Google Workspace requires strong password and multi-factor authentication
Google Workspace access from managed devices preferred
Google Workspace access monitored

Google Cloud Platform
GCP resources accessible remotely via web console, CLI, or API
GCP requires strong authentication and MFA
GCP access restricted by IAM policies
GCP access logged and monitored

Other Cloud Services
Cloud services require strong authentication and MFA
Cloud service access from trusted devices and networks
Cloud service access monitored
Unapproved cloud services prohibited

Web-Based Access
Web applications accessible via HTTPS
Web access requires strong authentication
Web access may require VPN for sensitive applications
Web access monitored

Remote Access Authorization

Access Request Process

Step 1 — Access Request
User or manager submits remote access request
Request includes: User identity, remote access method, business justification, duration
Request submitted to IT or CISO

Step 2 — Access Approval
Manager approves based on business need
IT Security reviews for appropriateness
CISO approves privileged remote access
Approval documented

Step 3 — Access Provisioning
IT provisions remote access per approved request
VPN account created or remote access configured
User provided with access instructions
Access provisioning documented

Step 4 — Access Verification
User verifies remote access works
Issues resolved promptly
Access verification documented

Access Review
Remote access reviewed quarterly
Unnecessary access removed
Access review documented

Access Revocation
Remote access revoked immediately upon termination
Remote access revoked when no longer needed
Access revocation verified and documented

Remote Access Security Requirements

Device Security

Authorized Devices
Remote access from company-issued devices preferred
Personal devices (BYOD) may be used if approved and meet security requirements
Devices must be secured per Mobile Device Policy
Unauthorized devices prohibited

Device Security Requirements
Devices password-protected or biometric authentication
Devices encrypted (full disk encryption)
Devices have antivirus and anti-malware software
Devices kept up to date with security patches
Devices not jailbroken or rooted

Device Management
Company-issued devices managed by IT
Personal devices may require Mobile Device Management (MDM) software
Device compliance verified before remote access granted
Non-compliant devices denied access

Network Security

Trusted Networks
Remote access from secure networks preferred
Home networks should be secured (WPA2/WPA3, strong password, firmware updated)
Public Wi-Fi requires VPN
Untrusted networks avoided for sensitive work

Network Security Practices
VPN used on all untrusted networks
Public Wi-Fi hotspots used with caution
Unsecured Wi-Fi networks avoided
Network security verified before remote access

Authentication Security

Strong Authentication
Strong passwords required (per Password Policy)
Multi-factor authentication required for all remote access
Biometric authentication acceptable as additional factor
Authentication credentials protected

Multi-Factor Authentication
MFA required for VPN access
MFA required for remote desktop access
MFA required for cloud service access
MFA required for privileged access
MFA methods: Authenticator app, hardware token, push notification

Session Security
Sessions automatically logged out after inactivity (30 minutes)
Users manually log out when finished
Sessions encrypted end-to-end
Session hijacking protections enabled

Remote Work Security Practices

Secure Work Environment

Physical Security
Remote work from secure location (home office, private office)
Sensitive work not conducted in public places
Privacy screens used when working in public
Devices not left unattended
Documents secured when not in use

Environmental Security
Work area secured from unauthorized access
Family members and visitors do not have access to work devices or data
Video conference backgrounds do not reveal sensitive information
Conversations about sensitive topics conducted privately

Data Security

Data Handling
Sensitive data accessed only when necessary
Sensitive data not downloaded to personal devices unless approved
Sensitive data not printed on home printers unless necessary
Sensitive data protected per Data Handling Policy

Data Storage
Company data stored in approved cloud services (Google Drive, etc.)
Company data not stored on personal devices unless approved and encrypted
Company data not stored on removable media unless encrypted
Data backups maintained

Data Transmission
Sensitive data transmitted via secure channels (VPN, HTTPS, encrypted email)
Sensitive data not transmitted via unencrypted email or messaging
Large files transferred via secure file transfer services
Data transmission encrypted

Communication Security

Video Conferencing
Approved video conferencing tools (Google Meet, Zoom, Microsoft Teams, etc.)
Video conferences password-protected for sensitive meetings
Waiting rooms enabled to control participant access
Screen sharing used carefully to avoid exposing sensitive information
Video conference recordings secured

Email and Messaging
Company email used for business communications
Personal email not used for business communications
Sensitive information not sent via unencrypted email
Encrypted messaging used for sensitive communications

Phone and Voice
Company phone or personal phone used for business calls
Sensitive conversations conducted privately
Speakerphone used carefully in public areas
Voice calls not recorded without consent

Remote Access Monitoring and Logging

Access Logging
Remote access connections logged
Logs include: User, date/time, source IP address, access method, duration
Privileged remote access logged in detail
Logs retained per retention policy (minimum 1 year)

Access Monitoring
Remote access monitored for security threats
Anomalous access patterns investigated
Failed authentication attempts monitored
Unauthorized access attempts blocked and investigated

Security Monitoring
Remote access traffic monitored for malware and threats
Intrusion detection and prevention systems monitor remote access
Security alerts investigated promptly
Security incidents reported and responded to

Compliance Monitoring
Remote access compliance with policy monitored
Non-compliant access identified and addressed
Compliance metrics tracked and reported
Compliance audits conducted regularly

Remote Access for Third Parties

Vendor and Contractor Remote Access
Third-party remote access limited to business need
Third-party remote access requires contract or agreement
Third-party remote access approved by business owner and IT Security
Third-party remote access time-limited
Third-party remote access monitored

Third-Party Access Security
Separate VPN or remote access for third parties
Third-party access does not grant access to entire network
Third-party access logged and monitored
Third-party access reviewed regularly
Third-party access terminated upon contract end

Client Remote Access
Client remote access to project systems as required
Client remote access approved by project manager
Client remote access limited to client's own data
Client remote access secured with strong authentication
Client remote access documented

Remote Access Incident Response

Security Incidents
Remote access security incidents reported immediately
Incidents include: Unauthorized access, compromised credentials, malware, data breach
Incident response procedures activated
Incidents investigated and documented

Compromised Credentials
Compromised remote access credentials changed immediately
User account disabled pending investigation
Remote access from compromised account reviewed
Affected systems and data assessed

Lost or Stolen Devices
Lost or stolen devices with remote access capability reported immediately
Remote access for device disabled
Device remotely wiped if possible
Incident documented and reviewed

Unauthorized Access
Unauthorized remote access attempts blocked
Source of unauthorized access investigated
Security controls enhanced to prevent future attempts
Incident documented

Remote Access Training and Awareness

Training Requirements
Remote access policy training during onboarding
Annual security awareness training includes remote access security
Remote work security best practices communicated
Training documented

Training Topics
Remote access policy and procedures
VPN usage and security
Device security requirements
Secure remote work practices
Data security for remote work
Incident reporting

Security Awareness
Remote access security tips and reminders
Phishing awareness (common attack vector for remote access)
Social engineering awareness
Security newsletters and updates

Remote Access Policy Compliance

Policy Compliance
All remote access must comply with this policy
Non-compliant remote access prohibited
Policy violations addressed through corrective action
Serious violations result in access suspension or termination

Compliance Monitoring
Remote access compliance monitored through technical controls and audits
Non-compliant access identified and remediated
Compliance metrics tracked and reported

Policy Exceptions
Exceptions require written justification and approval
Exceptions approved by CISO
Exceptions documented with compensating controls
Exceptions reviewed periodically

Roles and Responsibilities

All Remote Users
Request remote access through proper channels
Use remote access only for authorized purposes
Protect remote access credentials
Follow remote access security requirements
Report remote access issues and incidents
Comply with remote access policy

Managers
Approve remote access requests for team members
Ensure team members comply with remote access policy
Review team member remote access regularly
Report remote access policy violations

IT and Security
Provision and manage remote access
Configure and maintain remote access systems
Monitor remote access for security threats
Investigate remote access incidents
Conduct remote access audits

CISO (Jacob Johnston)
Overall responsibility for remote access security
Approve remote access policy
Review remote access metrics and incidents
Ensure remote access compliance
Approve remote access exceptions

Contact Information

For remote access questions, issues, or to request remote access, contact:

Jacob Johnston
Founder and Chief Information Security Officer
True North Data Strategies LLC
Email: jacob@truenorthstrategyops.com
Phone: 555-555-5555
Colorado Springs, CO

UEI: WKJXXACV8U43
CAGE Code: 16TC1
