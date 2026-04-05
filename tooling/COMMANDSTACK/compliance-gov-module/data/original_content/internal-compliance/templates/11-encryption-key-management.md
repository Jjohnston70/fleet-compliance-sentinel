TRUE NORTH DATA STRATEGIES LLC
ENCRYPTION AND KEY MANAGEMENT POLICY

Purpose

This Encryption and Key Management Policy establishes [COMPANY_LEGAL_NAME]'s requirements for using encryption to protect sensitive data and for managing cryptographic keys. This policy ensures data confidentiality and integrity through proper encryption and key management practices.

Scope

This policy applies to all [COMPANY_NAME] personnel, contractors, subcontractors, systems, applications, and data. It covers encryption of data at rest, data in transit, and cryptographic key management.

Governance and Cross-Package References

This policy operates under the authority of the Security and Compliance Handbook (security-governance skill), which establishes the master governance framework for encryption and cryptographic controls.

Universal [COMPANY_ABBREVIATION] Principles:
Data-as-Regulated: [COMPANY_ABBREVIATION] treats all client and customer data as regulated by default; encryption protects all data as if regulated
No Sensitive Data in Logs: Encryption key management logs and audit trails must not contain actual encryption keys, PII, PHI, PCI, CUI, or other regulated identifiers

Cross-Package Integration:
security-governance skill (Security & Compliance Handbook): Master governance document establishing encryption requirements (Section 4)
data-handling-privacy skill (Data Handling & Privacy): Data classification determining encryption requirements
cloud-platform-security skill (Google Cloud Platform Security Standards): Platform-specific encryption implementation on Google infrastructure
internal-compliance skill (Audit Logging and Monitoring Policy): Establishes logging requirements for key management activities

For data classification and handling, see data-handling-privacy skill (Data Handling Standard).
For Google Cloud encryption implementation, see cloud-platform-security skill (GCP Security Standards).

Encryption Requirements

Data Encryption Standards

Encryption Algorithms
Symmetric Encryption: AES-256 (Advanced Encryption Standard with 256-bit keys)
Asymmetric Encryption: RSA 2048-bit minimum, RSA 4096-bit preferred, or ECC (Elliptic Curve Cryptography) equivalent
Hashing: SHA-256 or SHA-512
Transport Encryption: TLS 1.2 minimum, TLS 1.3 preferred
Deprecated Algorithms: DES, 3DES, MD5, SHA-1, RC4, SSL (all versions) prohibited

Encryption Key Lengths
Symmetric Keys: 256-bit minimum
Asymmetric Keys: 2048-bit minimum, 4096-bit preferred
Hashing: 256-bit minimum

Cryptographic Standards
FIPS 140-2 compliant encryption modules where feasible
NIST-approved cryptographic algorithms
Industry-standard encryption protocols and implementations

Data at Rest Encryption

Encryption Requirements by Data Classification

Restricted Data
Encryption: Required
Encryption Standard: AES-256
Key Management: Centralized key management, keys separate from data
Examples: Social Security Numbers, financial account numbers, health information, authentication credentials

Confidential Data
Encryption: Required
Encryption Standard: AES-256
Key Management: Centralized or local key management
Examples: Client data, business plans, employee information, proprietary information

Internal Data
Encryption: Recommended
Encryption Standard: AES-256 or equivalent
Key Management: Local key management acceptable
Examples: Internal documents, operational data

Public Data
Encryption: Not required
Examples: Public website content, marketing materials

Encryption by Storage Type

Laptop and Desktop Computers
Full disk encryption required for all company laptops
Full disk encryption recommended for desktops
Windows: BitLocker
macOS: FileVault
Linux: LUKS (Linux Unified Key Setup)
Encryption enabled before device use
Encryption keys backed up securely

Mobile Devices
Device encryption required for all mobile devices accessing company data
iOS: Encryption enabled by default
Android: Encryption enabled in device settings
Mobile Device Management (MDM) enforces encryption

Removable Media
USB drives and external hard drives containing company data must be encrypted
Encrypted USB drives (hardware encryption) preferred
Software encryption (BitLocker To Go, VeraCrypt) acceptable
Unencrypted removable media not used for Confidential or Restricted data

Cloud Storage
Data stored in cloud services encrypted by cloud provider
Client-side encryption used for Restricted data where feasible
Encryption keys managed by [COMPANY_NAME] or trusted key management service
Google Cloud Storage, AWS S3, or similar with encryption enabled

Databases
Database encryption (Transparent Data Encryption or similar) for databases containing Confidential or Restricted data
Database backups encrypted
Database encryption keys managed securely

File and Folder Encryption
Individual files or folders containing Restricted data encrypted
Encryption tools: 7-Zip with AES-256, VeraCrypt, GPG, or similar
Encrypted files password-protected with strong passwords
Encryption passwords shared securely

Data in Transit Encryption

Network Encryption

Transport Layer Security (TLS)
TLS 1.2 minimum, TLS 1.3 preferred
TLS required for all web applications and APIs
TLS required for email (SMTP, IMAP, POP3)
TLS certificates from trusted Certificate Authorities
TLS certificates renewed before expiration
Weak cipher suites disabled

Virtual Private Network (VPN)
VPN required for remote access to internal network
VPN encryption: AES-256
VPN protocols: IKEv2/IPsec, OpenVPN, or WireGuard
VPN authentication: Multi-factor authentication required

Wireless Network Encryption
Wi-Fi encryption: WPA3 preferred, WPA2 minimum
WPA and WEP prohibited
Strong Wi-Fi passwords (minimum 20 characters)
Guest Wi-Fi network separated from corporate network

Email Encryption
TLS required for email transmission
End-to-end email encryption (S/MIME or PGP) for Restricted data
Encrypted email services used where appropriate
Email encryption keys managed securely

File Transfer Encryption
Secure file transfer protocols: SFTP, FTPS, HTTPS
Insecure protocols (FTP, HTTP for sensitive data) prohibited
Large file transfer services with encryption (Google Drive, Dropbox with encryption, etc.)
File transfer encryption verified

Application and API Encryption
APIs use HTTPS with TLS 1.2+
API authentication tokens transmitted securely
Application-to-application communication encrypted
Database connections encrypted

Key Management

Cryptographic Key Lifecycle

Key Generation
Keys generated using cryptographically secure random number generators
Key generation follows industry best practices
Key strength meets or exceeds policy requirements
Key generation documented

Key Storage
Encryption keys stored securely separate from encrypted data
Keys stored in key management system, hardware security module (HSM), or secure key vault
Keys encrypted when stored
Key storage access restricted to authorized personnel
Cloud provider key management services (Google Cloud KMS, AWS KMS) used where appropriate

Key Distribution
Keys distributed securely to authorized users or systems
Key distribution uses secure channels (encrypted email, secure file transfer, in-person)
Key distribution documented
Key recipients verified

Key Usage
Keys used only for intended purpose
Key usage logged where feasible
Key usage monitored for anomalies
Compromised keys revoked immediately

Key Rotation
Encryption keys rotated periodically
Key rotation frequency: Annually minimum, more frequently for high-risk keys
Key rotation after personnel changes
Key rotation after suspected compromise
Key rotation documented

Key Backup
Encryption keys backed up securely
Key backups encrypted
Key backups stored separately from primary keys
Key backup access restricted
Key backup recovery tested

Key Revocation and Destruction
Keys revoked when no longer needed or when compromised
Revoked keys cannot be used for encryption
Revoked keys retained for decryption of existing data if needed
Keys destroyed securely when no longer needed
Key destruction documented

Key Management Roles and Responsibilities

Key Custodian (CISO)
Overall responsibility for key management
Approve key management policies and procedures
Oversee key management operations
Ensure key management compliance

Key Administrators
Generate, store, and distribute encryption keys
Perform key rotation and revocation
Maintain key management systems
Document key management activities
Authorized personnel only

Key Users
Use encryption keys per policy
Protect keys from unauthorized access
Report lost or compromised keys immediately
Follow key usage procedures

Key Management Systems

Key Management Service (KMS)
Centralized key management system
Google Cloud KMS, AWS KMS, Azure Key Vault, or similar
Hardware Security Module (HSM) for high-security keys
Key management system access controlled and logged

Key Storage Solutions
Secure key vault or key management database
Encrypted key storage
Access controls and authentication
Audit logging of key access

Key Management Tools
Encryption software with key management capabilities
Certificate management tools
Password managers for encryption passwords
Key management APIs and integrations

Encryption for Specific Use Cases

Email Encryption

Email in Transit
TLS encryption for email transmission (SMTP, IMAP, POP3)
Opportunistic TLS used where supported
Email servers configured for TLS
TLS certificates valid and current

Email at Rest
Email stored encrypted on email servers
Google Workspace email encrypted at rest by Google
Email backups encrypted

End-to-End Email Encryption
S/MIME or PGP for end-to-end email encryption
Used for Restricted data sent via email
Encryption keys managed by users
Public keys exchanged securely

Database Encryption

Transparent Data Encryption (TDE)
Database-level encryption for databases containing Confidential or Restricted data
Encryption transparent to applications
Encryption keys managed by database or key management system

Column-Level Encryption
Specific database columns containing Restricted data encrypted
Application-level encryption and decryption
Encryption keys managed by application or key management system

Backup Encryption
Database backups encrypted
Backup encryption keys managed securely
Backup encryption verified

Cloud Encryption

Cloud Storage Encryption
Server-side encryption for cloud storage (Google Cloud Storage, AWS S3, etc.)
Customer-managed encryption keys (CMEK) for Restricted data where feasible
Client-side encryption for additional security

Cloud Infrastructure Encryption
Virtual machine disk encryption
Encrypted network connections between cloud resources
Cloud provider encryption services used

Cloud Key Management
Cloud provider key management services (Google Cloud KMS, AWS KMS)
Customer-managed keys for sensitive data
Key access controls and logging

Application Encryption

Application Data Encryption
Sensitive data encrypted within applications
Application-level encryption for Restricted data
Encryption keys managed by application or key management system

Authentication Credential Encryption
Passwords hashed using bcrypt, scrypt, or Argon2
Password hashes salted
API keys and tokens encrypted when stored
Multi-factor authentication secrets encrypted

Code Signing
Software and scripts digitally signed
Code signing certificates from trusted Certificate Authority
Code signing keys protected with hardware security module or secure storage

Encryption Compliance and Audit

Encryption Compliance Monitoring
Encryption compliance monitored through technical controls and audits
Unencrypted Confidential or Restricted data identified and remediated
Encryption compliance metrics tracked and reported

Encryption Audits
Annual encryption audit
Audit includes encryption usage, key management, and compliance
Audit findings remediated
Audit documented

Encryption Exceptions
Exceptions to encryption requirements require written justification and approval
Exceptions approved by CISO
Exceptions documented with compensating controls
Exceptions reviewed annually

Encryption Incident Response

Lost or Stolen Devices
Encrypted devices: Low risk, report incident, remote wipe if possible
Unencrypted devices: High risk, activate incident response, notify affected parties
Incident documented and reviewed

Compromised Encryption Keys
Revoke compromised keys immediately
Re-encrypt data with new keys
Investigate compromise root cause
Notify affected parties if data exposure risk
Incident documented

Encryption Failure
Investigate encryption failure root cause
Restore encryption
Assess data exposure risk
Implement corrective actions
Incident documented

Encryption Training and Awareness

Training Requirements
Encryption policy training during onboarding
Annual security awareness training includes encryption
Role-specific training for key administrators
Training documented

Training Topics
Encryption policy and requirements
Data classification and encryption requirements
Encryption tools and procedures
Key management procedures
Reporting lost devices or compromised keys

Encryption Standards and References

Standards and Frameworks
NIST Special Publication 800-57: Key Management
NIST Special Publication 800-111: Guide to Storage Encryption Technologies
NIST Special Publication 800-52: Guidelines for TLS Implementations
FIPS 140-2: Security Requirements for Cryptographic Modules
ISO/IEC 27001: Information Security Management

Encryption Resources
NIST Cryptographic Standards and Guidelines
OWASP Cryptographic Storage Cheat Sheet
Cloud provider encryption documentation

Contact Information

For encryption and key management questions, contact:

[OWNER_NAME]
Founder and Chief Information Security Officer
Key Custodian
[COMPANY_LEGAL_NAME]
Email: [CONTACT_EMAIL]
Phone: [CONTACT_PHONE]
[COMPANY_CITY], [GOVERNING_STATE]

UEI: [COMPANY_UEI]
CAGE Code: [COMPANY_CAGE_CODE]
