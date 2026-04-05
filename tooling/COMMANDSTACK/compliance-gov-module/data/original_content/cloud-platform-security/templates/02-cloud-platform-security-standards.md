[COMPANY_LEGAL_NAME]
[CLOUD_PLATFORM] SECURITY STANDARDS

Purpose

This [CLOUD_PLATFORM] Security Standards document establishes [COMPANY_LEGAL_NAME]'s requirements for securely configuring, deploying, and managing resources on [CLOUD_PLATFORM] ([CLOUD_PLATFORM]). This standard ensures [CLOUD_PLATFORM] resources are protected, compliant, and aligned with security best practices.

Scope

This standard applies to all [COMPANY_NAME] [CLOUD_PLATFORM] projects, resources, and services. It applies to all personnel responsible for developing, deploying, or managing [CLOUD_PLATFORM] resources.

Governance and Cross-Package References

This standard implements [COMPANY_ABBREVIATION] security requirements on the [CLOUD_PLATFORM], leveraging FedRAMP-authorized [CLOUD_PROVIDER] infrastructure.

Universal [COMPANY_ABBREVIATION] Principles - Platform Implementation:
Data-as-Regulated: All client and customer data in [CLOUD_PLATFORM] treated as regulated by default
No Sensitive Data in Logs: [CLOUD_PLATFORM] logs (Cloud Logging, Cloud Monitoring, audit logs) must not contain PII, PHI, PCI, CUI in unprotected form

Cross-Package Integration:
security-governance skill: Master governance document; this standard implements requirements on [CLOUD_PLATFORM]
internal-compliance skill (cloud hardening): General cloud security requirements; this standard provides [CLOUD_PLATFORM]-specific implementation
internal-compliance skill (network security): Network security requirements implemented via [CLOUD_PLATFORM] VPC, firewall rules, Cloud Armor
data-handling-privacy skill: Data classification and handling requirements implemented via [CLOUD_PLATFORM] security controls

Shared Responsibility Model:
internal-compliance skill (shared responsibility) documents general cloud shared responsibility
This standard implements [COMPANY_ABBREVIATION] responsibilities for [CLOUD_PLATFORM] specifically
[CLOUD_PROVIDER] responsible for security OF the cloud (infrastructure, platform, FedRAMP compliance)
[COMPANY_ABBREVIATION] responsible for security IN the cloud (data, applications, access, configuration)

For general cloud security requirements, see internal-compliance skill (cloud hardening).
For network security requirements, see internal-compliance skill (network security).

[CLOUD_PLATFORM] Security Principles

Shared Responsibility Model
[CLOUD_PROVIDER] responsible for security of the cloud (infrastructure, platform)
[COMPANY_NAME] responsible for security in the cloud (data, applications, access, configuration)
Shared responsibility understood and documented
Security responsibilities clearly defined

Defense in Depth
Multiple layers of security controls
Network security, identity and access management, data protection, monitoring
Security controls complement each other
Security continuously monitored and improved

Least Privilege Access
Access to [CLOUD_PLATFORM] resources based on least privilege
Users and service accounts granted minimum permissions necessary
Privileged access restricted and monitored
Access reviewed regularly

Security by Design
Security integrated into development and deployment
Security requirements defined early
Security controls implemented before production
Security testing conducted

Compliance and Governance
[CLOUD_PLATFORM] configuration supports compliance requirements
Configuration changes controlled and documented
Configuration audited regularly
Configuration aligns with security policies

[CLOUD_PLATFORM] Organization and Project Structure

Organization Configuration

[CLOUD_PLATFORM] Organization
Single [CLOUD_PLATFORM] organization for [COMPANY_LEGAL_NAME]
Organization ID documented
Organization-level policies enforced
Organization administered by CISO ([OWNER_NAME])

Folder Structure
Folders used to group projects by: Environment (production, development, testing), department, or client
Folder structure documented
Folder-level policies applied
Folder structure supports governance and billing

Project Structure
Projects used to isolate resources and workloads
Projects structured by: Application, environment, or client
Project naming convention: [environment]-[application]-[identifier]
Project structure documented

Billing Accounts
Billing accounts configured and monitored
Billing alerts configured to prevent unexpected costs
Billing reports reviewed monthly
Billing access restricted

[CLOUD_PLATFORM] Identity and Access Management (IAM)

IAM Principles
Least privilege access enforced
Predefined roles used where possible
Custom roles created for specific needs
Service accounts used for application and service access
IAM policies documented and reviewed

User Identity Management

User Accounts
User accounts linked to [CLOUD_PLATFORM_WORKSPACE] accounts
User authentication through [CLOUD_PLATFORM_WORKSPACE] (SSO)
User accounts follow naming convention: firstname.lastname@[COMPANY_WEBSITE]
User accounts managed centrally

Multi-Factor Authentication (MFA)
MFA required for all user accounts
MFA enforced through [CLOUD_PLATFORM_WORKSPACE]
Hardware security keys required for privileged accounts
MFA enrollment verified

User Access Provisioning
User access provisioned based on job role and business need
Access requests approved by manager and CISO
Access provisioned through IAM roles
Access provisioning documented

User Access Review
User access reviewed quarterly
Unnecessary access removed
Access review documented

Service Accounts

Service Account Management
Service accounts used for application and service authentication
Service accounts follow naming convention: [service]-[environment]-sa@[project].iam.gserviceaccount.com
Service accounts granted minimum necessary permissions
Service accounts documented

Service Account Keys
Service account keys avoided where possible (use Workload Identity or default service accounts)
If keys required, keys rotated every 90 days
Keys stored securely ([CLOUD_PROVIDER] Secret Manager, encrypted storage)
Key usage monitored and audited

Workload Identity
Workload Identity used for GKE workloads to access [CLOUD_PLATFORM] services
Workload Identity eliminates need for service account keys
Workload Identity configured per GKE security best practices

IAM Roles and Permissions

Predefined Roles
Predefined roles used where possible (Viewer, Editor, Owner, specific service roles)
Predefined roles provide appropriate permissions for common use cases
Predefined roles documented

Custom Roles
Custom roles created for specific needs not met by predefined roles
Custom roles follow least privilege principle
Custom roles documented and reviewed
Custom roles approved by CISO

Primitive Roles
Primitive roles (Owner, Editor, Viewer) avoided at project level
Primitive roles too broad and violate least privilege
Primitive roles used only at organization level for super admins

IAM Policies
IAM policies grant roles to users, groups, or service accounts
IAM policies applied at organization, folder, or project level
IAM policies documented
IAM policies reviewed quarterly

IAM Conditions
IAM conditions used to restrict access based on context (time, IP address, resource attributes)
Conditions enhance security and enforce access policies
Conditions documented

[CLOUD_PLATFORM] Network Security

Virtual Private Cloud (VPC) Configuration

VPC Networks
VPC networks used to isolate resources
VPC networks structured by: Environment, application, or security zone
VPC network design documented
VPC networks use private IP addresses (RFC 1918)

Subnets
Subnets created within VPC networks
Subnets structured by: Region, tier (web, app, data), or function
Subnet IP ranges planned and documented
Private [CLOUD_PROVIDER] Access enabled for subnets

Firewall Rules

Firewall Rule Principles
Default deny all ingress traffic
Allow only necessary ingress traffic
Default allow all egress traffic (restrict if necessary)
Firewall rules follow least privilege

Firewall Rule Configuration
Firewall rules created for each VPC network
Rules specify: Source, destination, protocol, port
Rules documented with business justification
Rules reviewed quarterly

Firewall Rule Best Practices
Deny rules for known malicious IPs or ranges
Allow rules for specific services and ports only
Avoid overly permissive rules (0.0.0.0/0 source)
Use service accounts or network tags for targeting
Enable firewall rule logging for security monitoring

Cloud NAT
Cloud NAT used for outbound internet access from private instances
Cloud NAT provides static external IP addresses
Cloud NAT logging enabled
Cloud NAT configuration documented

Cloud Load Balancing
Cloud Load Balancers used for distributing traffic
HTTPS load balancers used for web applications
SSL/TLS certificates configured
Cloud Armor used for DDoS protection and WAF
Load balancer configuration documented

VPC Peering and VPN
VPC peering used to connect VPC networks
Cloud VPN or Cloud Interconnect used for hybrid connectivity
VPN and peering connections secured and monitored
VPN and peering configuration documented

Private [CLOUD_PROVIDER] Access and Private Service Connect
Private [CLOUD_PROVIDER] Access enabled for accessing [CLOUD_PROVIDER] APIs from private IPs
Private Service Connect used for private connectivity to [CLOUD_PROVIDER] services
Private connectivity reduces exposure to internet

[CLOUD_PLATFORM] Data Protection

Data Encryption

Encryption at Rest
All data encrypted at rest by default ([CLOUD_PROVIDER]-managed encryption keys)
Customer-managed encryption keys (CMEK) used for sensitive data
CMEK keys managed in Cloud KMS
Encryption at rest verified

Encryption in Transit
All data encrypted in transit (TLS 1.2+)
TLS enforced for all external connections
Internal traffic encrypted where feasible (using VPC Service Controls or mTLS)
Encryption in transit verified

Cloud Key Management Service (Cloud KMS)
Cloud KMS used for managing encryption keys
KMS keys used for CMEK, application encryption, signing
KMS key rotation enabled (automatic rotation every 90 days)
KMS key access restricted and audited
KMS key usage logged

Data Classification and Handling
Data classified per Data Classification Policy (Public, Internal, Confidential, Restricted)
Data handling requirements applied based on classification
Confidential and Restricted data encrypted with CMEK
Data classification documented

Data Loss Prevention (DLP)

Cloud DLP
Cloud DLP used to discover and protect sensitive data
DLP scans data in Cloud Storage, BigQuery, Datastore
DLP detects: PII, PHI, credit card numbers, etc.
DLP findings reviewed and remediated

DLP Policies
DLP inspection templates configured for sensitive data types
DLP de-identification templates configured for masking or tokenizing data
DLP job triggers configured for automated scanning
DLP policies documented

Data Residency and Sovereignty
Data stored in specific [CLOUD_PLATFORM] regions per data residency requirements
Data residency requirements documented
Data residency verified and monitored

Data Backup and Recovery
Critical data backed up regularly
Backups stored in separate region or multi-region
Backup retention per Records Management Policy
Backup and recovery tested regularly

[CLOUD_PLATFORM] Compute Security

Compute Engine Security

VM Instance Security
VM instances use minimal base images (Container-Optimized OS, hardened images)
VM instances patched regularly (automated patch management)
VM instances use service accounts with least privilege
VM instances do not have external IP addresses unless necessary
VM instances use Shielded VMs (Secure Boot, vTPM, Integrity Monitoring)

OS Hardening
Operating systems hardened per CIS benchmarks
Unnecessary services disabled
Security updates applied promptly
OS hardening documented

Access to VM Instances
SSH access to VM instances restricted
SSH keys managed securely (OS Login preferred)
Bastion hosts or IAP (Identity-Aware Proxy) used for SSH access
SSH access logged and monitored

[CLOUD_PROVIDER] Kubernetes Engine (GKE) Security

GKE Cluster Security
GKE clusters use private clusters (nodes have private IPs)
GKE clusters use Workload Identity for pod authentication
GKE clusters use Binary Authorization to enforce image signing
GKE clusters use GKE Sandbox for container isolation (gVisor)
GKE clusters enable Shielded GKE Nodes

GKE Network Policies
Kubernetes Network Policies configured to restrict pod-to-pod communication
Network policies follow least privilege
Network policies documented

GKE RBAC
Kubernetes RBAC configured to control access to cluster resources
RBAC follows least privilege
RBAC policies documented and reviewed

GKE Security Best Practices
GKE clusters kept up to date (auto-upgrade enabled)
GKE node pools use minimal OS (Container-Optimized OS)
GKE secrets stored in Secret Manager (not Kubernetes Secrets)
GKE security scanning enabled (vulnerability scanning for container images)

Cloud Functions and Cloud Run Security
Cloud Functions and Cloud Run use service accounts with least privilege
Functions and services require authentication (IAM or API keys)
Functions and services use VPC connectors for private network access
Functions and services monitored and logged

[CLOUD_PLATFORM] Application Security

API Security
APIs secured with authentication and authorization
APIs use API keys, OAuth 2.0, or IAM for authentication
APIs rate-limited to prevent abuse
APIs monitored for security threats
API security documented

Cloud Endpoints and API Gateway
Cloud Endpoints or API Gateway used to manage and secure APIs
API Gateway provides: Authentication, rate limiting, monitoring
API Gateway configuration documented

Application Secrets Management
Application secrets stored in Secret Manager
Secrets not hardcoded in code or configuration files
Secrets accessed programmatically by applications
Secret access logged and audited

Web Application Firewall (Cloud Armor)
Cloud Armor used to protect web applications
Cloud Armor rules configured to block: SQL injection, XSS, DDoS
Cloud Armor rules tuned to minimize false positives
Cloud Armor logs reviewed

Vulnerability Scanning
Container images scanned for vulnerabilities (Container Analysis)
Web applications scanned for vulnerabilities (Web Security Scanner)
Vulnerability scan results reviewed and remediated
Vulnerability scanning automated

[CLOUD_PLATFORM] Security Monitoring and Logging

Cloud Logging

Logging Configuration
Cloud Logging enabled for all [CLOUD_PLATFORM] resources
Logs include: Admin activity, data access, system events, security events
Logs exported to Cloud Storage or BigQuery for long-term retention
Logs exported to SIEM for centralized monitoring

Log Types
Admin Activity Logs: Administrative actions (always enabled, free)
Data Access Logs: Data read and write operations (enabled for sensitive resources)
System Event Logs: System events (always enabled, free)
Access Transparency Logs: [CLOUD_PROVIDER] personnel access (for compliance)

Log Retention
Logs retained in Cloud Logging for 30 days (default)
Logs exported for long-term retention (1 year minimum)
Log retention per Records Management Policy
Log retention documented

Cloud Monitoring

Monitoring Configuration
Cloud Monitoring enabled for all [CLOUD_PLATFORM] resources
Monitoring metrics collected: CPU, memory, disk, network, application metrics
Custom metrics configured for application monitoring
Monitoring dashboards created

Alerting
Alerts configured for critical events and thresholds
Alerts include: Resource utilization, security events, errors
Alerts sent to security team via email, SMS, or PagerDuty
Alerts investigated and responded to

Uptime Monitoring
Uptime checks configured for critical services
Uptime alerts configured
Uptime metrics tracked

Security Command Center

Security Command Center (SCC)
SCC enabled for organization
SCC provides: Security findings, vulnerabilities, misconfigurations, threats
SCC findings reviewed and remediated
SCC dashboard monitored regularly

SCC Findings
Findings include: Open firewall rules, public buckets, weak IAM policies, vulnerabilities
Findings prioritized by severity
High and critical findings remediated promptly
Findings remediation tracked

Event Threat Detection
Event Threat Detection enabled in SCC
Detects: Malware, cryptomining, DDoS, brute force attacks, anomalous activity
Threat detection findings investigated and responded to

Container Threat Detection
Container Threat Detection enabled for GKE
Detects: Container vulnerabilities, runtime threats
Container threats investigated and responded to

Web Security Scanner
Web Security Scanner used to scan web applications for vulnerabilities
Scanner detects: XSS, SQL injection, outdated libraries
Scan results reviewed and remediated

[CLOUD_PLATFORM] Compliance and Governance

Organization Policies

Organization Policy Service
Organization policies used to enforce security and compliance requirements
Policies applied at organization, folder, or project level
Policies restrict: VM external IPs, public buckets, service account key creation, etc.
Policies documented

Key Organization Policies
Restrict VM external IP addresses
Restrict public IP access to Cloud SQL instances
Restrict service account key creation
Require OS Login for VM SSH access
Restrict resource locations (data residency)
Disable service account key upload

Policy Enforcement
Policies enforced automatically
Policy violations prevented
Policy compliance monitored
Policy exceptions documented and approved

VPC Service Controls

VPC Service Controls
VPC Service Controls used to create security perimeters around [CLOUD_PLATFORM] resources
Service perimeters restrict data exfiltration
Service perimeters protect sensitive data and services
Service perimeters documented

Access Levels
Access levels define conditions for accessing resources (IP address, device, user)
Access levels used with VPC Service Controls
Access levels documented

Compliance Certifications
[CLOUD_PLATFORM] compliance certifications: ISO 27001, SOC 2, SOC 3, PCI-DSS, HIPAA, FedRAMP
Compliance certifications verified
Compliance documentation available from [CLOUD_PROVIDER]

[CLOUD_PLATFORM] Security Best Practices

Infrastructure as Code (IaC)
Infrastructure deployed using IaC (Terraform, Deployment Manager)
IaC templates version-controlled
IaC templates reviewed for security
IaC deployment automated and repeatable

Security Reviews
[CLOUD_PLATFORM] security configuration reviewed quarterly
Security findings remediated
Security review documented

Incident Response
Security incidents in [CLOUD_PLATFORM] investigated and responded to
Incident response per Incident Response Plan
Incidents documented and lessons learned

Security Training
Personnel trained on [CLOUD_PLATFORM] security best practices
Training covers: IAM, network security, data protection, monitoring
Training documented

Roles and Responsibilities

[CLOUD_PLATFORM] Administrators
Configure and manage [CLOUD_PLATFORM] resources securely
Implement security controls and policies
Monitor security alerts and logs
Respond to security incidents
Conduct security reviews

CISO ([OWNER_NAME])
Overall responsibility for [CLOUD_PLATFORM] security
Approve [CLOUD_PLATFORM] security standards
Review security metrics and incidents
Ensure compliance with security policies

Developers
Develop and deploy applications securely on [CLOUD_PLATFORM]
Follow secure coding practices
Implement security controls in applications
Report security issues

All Personnel
Use [CLOUD_PLATFORM] resources securely and responsibly
Protect access credentials
Report security incidents and suspicious activity
Comply with [CLOUD_PLATFORM] security policies

Contact Information

For [CLOUD_PLATFORM] security questions or to report security incidents, contact:

[OWNER_NAME]
Founder and Chief Information Security Officer
[COMPANY_LEGAL_NAME]
Email: [CONTACT_EMAIL]
Phone: [CONTACT_PHONE]
[COMPANY_CITY_STATE_ZIP]

UEI: [COMPANY_UEI]
CAGE Code: [COMPANY_CAGE_CODE]
