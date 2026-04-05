TRUE NORTH DATA STRATEGIES LLC
GOOGLE CLOUD IDENTITY AND ACCESS MANAGEMENT POLICY

Purpose

This Google Cloud Identity and Access Management (IAM) Policy establishes True North Data Strategies LLC's requirements for managing access to Google Cloud Platform resources. This policy ensures access is granted based on least privilege, properly controlled, and regularly reviewed to protect cloud resources and data.

Scope

This policy applies to all True North Data Strategies Google Cloud Platform projects, resources, and services. It applies to all personnel, service accounts, and applications requiring access to GCP resources.

Governance and Cross-Package References

This policy implements TNDS access control requirements on the Google Cloud Platform IAM system.

Universal TNDS Principles - IAM Implementation:
Data-as-Regulated: IAM policies enforce access controls protecting regulated data by default
No Sensitive Data in Logs: IAM audit logs must not contain PII, PHI, PCI, CUI in unprotected form

Cross-Package Integration:
Package 2 (Security & Compliance Handbook): Master governance document establishing access control requirements
Package 1 (Access Control Policy): General access control requirements; this policy provides GCP IAM-specific implementation
Package 5 (GCP Security Standards): Shared Responsibility Model and overall GCP security framework
Package 5 (Google Workspace Security): Workspace IAM integration with GCP IAM

For general access control requirements, see Package 1 (Access Control Policy).
For GCP shared responsibility, see Package 5 (GCP Security Standards).

IAM Principles

Least Privilege
Users and service accounts granted minimum permissions necessary
Access based on job role and business need
Privileged access restricted
Access permissions reviewed regularly

Separation of Duties
Critical functions separated among different individuals
No single individual has complete control over critical processes
Separation of duties enforced through IAM roles
Separation of duties documented

Defense in Depth
Multiple layers of access controls
IAM combined with network security, encryption, and monitoring
Access controls complement each other
Access continuously monitored

Identity-Based Access
Access based on verified identity
Strong authentication required
Service accounts used for non-human access
Identity management centralized

Accountability
All access logged and audited
Access changes documented
Access reviews conducted regularly
Access violations investigated

IAM Identity Management

User Identity Management

User Accounts
User accounts linked to Google Workspace accounts
User authentication through Google Workspace Single Sign-On (SSO)
User accounts follow naming convention: firstname.lastname@truenorthstrategyops.com
User accounts managed centrally through Google Workspace

User Authentication
Strong passwords required (per Password Policy)
Multi-factor authentication (MFA) required for all users
Hardware security keys required for privileged users
Authentication monitored and logged

User Lifecycle Management
User accounts created during onboarding
User access provisioned based on job role
User access modified when role changes
User accounts suspended immediately upon termination
User accounts deleted 30 days after termination
User lifecycle documented

Google Groups
Google Groups used to manage access to GCP resources
Groups structured by: Department, project, role, or function
Group membership managed by group owners or admins
Group membership reviewed quarterly
Groups documented

Service Account Management

Service Account Purpose
Service accounts used for application and service authentication to GCP
Service accounts represent non-human identities
Service accounts used instead of user accounts for automated processes
Service account usage documented

Service Account Creation
Service accounts created for specific applications or services
Service account naming convention: [service]-[environment]-sa@[project].iam.gserviceaccount.com
Service account creation requires approval
Service account creation documented

Service Account Permissions
Service accounts granted minimum necessary permissions
Service accounts use predefined or custom roles
Service accounts do not use primitive roles (Owner, Editor, Viewer)
Service account permissions reviewed quarterly

Service Account Keys
Service account keys avoided where possible
Workload Identity or default service accounts preferred
If keys required: Keys rotated every 90 days, keys stored securely (Secret Manager), key usage monitored
Service account key creation restricted by organization policy

Workload Identity
Workload Identity used for GKE workloads to access GCP services
Workload Identity eliminates need for service account keys
Workload Identity configured per GKE best practices
Workload Identity usage documented

IAM Roles and Permissions

Role Types

Predefined Roles
Predefined roles provided by Google for common use cases
Predefined roles grant specific permissions for GCP services
Predefined roles used where possible
Examples: Compute Admin, Storage Object Viewer, BigQuery Data Editor

Custom Roles
Custom roles created for specific needs not met by predefined roles
Custom roles grant specific permissions
Custom roles follow least privilege principle
Custom roles documented and approved by CISO
Custom roles reviewed annually

Primitive Roles
Primitive roles: Owner, Editor, Viewer
Primitive roles grant broad permissions across all GCP services
Primitive roles avoided at project level (violate least privilege)
Primitive roles used only at organization level for super admins (CISO)

Role Assignment

IAM Policy Binding
IAM policies bind roles to members (users, groups, service accounts)
IAM policies applied at organization, folder, project, or resource level
IAM policies follow least privilege
IAM policies documented

IAM Policy Hierarchy
IAM policies inherited from parent resources (organization → folder → project → resource)
Child resources inherit parent policies
Child resources can grant additional permissions but cannot revoke parent permissions
Policy hierarchy understood and documented

Role Assignment Process
Access requests submitted by user or manager
Access requests include: User identity, resource, role, business justification
Access requests approved by resource owner and CISO (for privileged access)
Access provisioned through IAM policy binding
Access provisioning documented

Privileged Access Management

Privileged Roles
Privileged roles grant administrative or sensitive permissions
Examples: Organization Admin, Project Owner, IAM Admin, Security Admin, Compute Admin
Privileged roles restricted to minimum necessary personnel
Privileged role assignments documented

Privileged Access Requirements
Privileged access requires strong business justification
Privileged access approved by CISO
Privileged users require hardware security keys for MFA
Privileged access monitored closely
Privileged access logged and audited

Just-in-Time (JIT) Access
JIT access used for temporary privileged access where feasible
JIT access granted for specific time period
JIT access automatically revoked after time period
JIT access reduces standing privileged access
JIT access tools: IAM Conditions, third-party PAM solutions

Break-Glass Accounts
Break-glass accounts for emergency access
Break-glass accounts have Organization Admin role
Break-glass accounts protected with hardware security keys
Break-glass account usage logged and investigated
Break-glass accounts: 2 accounts for redundancy

IAM Conditions

Conditional Access
IAM Conditions used to restrict access based on context
Conditions include: Time of day, IP address, resource attributes, device security
Conditions enhance security and enforce access policies
Conditions documented

Condition Examples
Allow access only during business hours
Allow access only from corporate IP addresses
Allow access only to resources with specific labels
Deny access from specific countries or regions

Condition Configuration
Conditions configured in IAM policy bindings
Conditions use Common Expression Language (CEL)
Conditions tested before production deployment
Conditions documented

IAM Access Control for GCP Services

Compute Engine IAM
Compute Admin: Full control over Compute Engine resources
Compute Instance Admin: Manage VM instances
Compute Viewer: Read-only access to Compute Engine resources
Compute OS Login: SSH access to VM instances
IAM roles assigned based on job function

Cloud Storage IAM
Storage Admin: Full control over Cloud Storage buckets and objects
Storage Object Admin: Manage objects in buckets
Storage Object Viewer: Read-only access to objects
Storage Object Creator: Upload objects to buckets
IAM roles assigned based on data access needs

BigQuery IAM
BigQuery Admin: Full control over BigQuery resources
BigQuery Data Editor: Query and modify data
BigQuery Data Viewer: Query and view data
BigQuery Job User: Run queries
IAM roles assigned based on data access and job function

Cloud SQL IAM
Cloud SQL Admin: Full control over Cloud SQL instances
Cloud SQL Client: Connect to Cloud SQL instances
Cloud SQL Viewer: Read-only access to Cloud SQL resources
IAM roles assigned based on database access needs

Kubernetes Engine (GKE) IAM
Kubernetes Engine Admin: Full control over GKE clusters
Kubernetes Engine Developer: Deploy applications to GKE
Kubernetes Engine Viewer: Read-only access to GKE resources
IAM roles combined with Kubernetes RBAC for fine-grained access control

IAM for Other GCP Services
IAM roles configured for all GCP services used
Roles assigned based on least privilege
Service-specific IAM roles documented

IAM Monitoring and Auditing

IAM Audit Logging

Admin Activity Logs
Admin activity logs capture IAM changes
Logs include: Role assignments, policy changes, service account creation
Admin activity logs always enabled (free)
Admin activity logs retained for 1 year minimum

Data Access Logs
Data access logs capture access to GCP resources
Logs include: API calls, data reads, data writes
Data access logs enabled for sensitive resources
Data access logs retained for 1 year minimum

IAM Policy Analyzer
IAM Policy Analyzer used to understand and troubleshoot IAM policies
Analyzer shows: Who has access to what, how access is granted, policy inheritance
Analyzer used during access reviews and investigations

IAM Recommender
IAM Recommender provides recommendations to improve IAM security
Recommendations include: Remove excessive permissions, revoke unused roles
Recommendations reviewed and implemented
Recommendations documented

Access Monitoring
IAM access monitored continuously
Monitoring includes: Privileged access usage, unusual access patterns, policy changes
Monitoring alerts configured for suspicious activity
Monitoring logs reviewed regularly

Access Reviews

Quarterly Access Reviews
User and service account access reviewed quarterly
Review includes: All IAM role assignments, group memberships
Unnecessary access removed
Access review documented

Privileged Access Reviews
Privileged access reviewed monthly
Privileged access usage monitored
Unused privileged access removed
Privileged access review documented

Service Account Reviews
Service accounts reviewed quarterly
Unused service accounts disabled or deleted
Service account permissions reviewed and reduced
Service account review documented

Access Review Process
Access review assigned to resource owners or managers
Reviewers verify access is still necessary and appropriate
Reviewers document review completion
Access changes implemented based on review findings

IAM Security Best Practices

Avoid Primitive Roles
Primitive roles (Owner, Editor, Viewer) avoided at project level
Predefined or custom roles used instead
Primitive roles too broad and violate least privilege

Use Groups for Access Management
Google Groups used to assign access to multiple users
Groups simplify access management
Group membership easier to manage than individual role assignments
Groups documented

Limit Organization-Level Permissions
Organization-level permissions granted sparingly
Organization-level permissions affect all projects
Organization-level permissions limited to super admins

Use Service Accounts for Applications
Service accounts used for application and service access
User accounts not used for automated processes
Service accounts provide better security and auditability

Rotate Service Account Keys
Service account keys rotated every 90 days
Key rotation automated where possible
Old keys revoked after rotation
Key rotation documented

Enable MFA for All Users
MFA required for all user accounts
Hardware security keys required for privileged users
MFA enforcement verified

Monitor and Audit IAM Activity
IAM activity logged and monitored
Suspicious activity investigated
IAM audit logs reviewed regularly

Regular Access Reviews
Access reviewed regularly (quarterly for standard access, monthly for privileged access)
Unnecessary access removed
Access reviews documented

IAM Policy Management

Policy Documentation
IAM policies documented
Documentation includes: Roles, permissions, members, business justification
Documentation maintained and updated

Policy Changes
IAM policy changes controlled through change management process
Changes require approval
Changes documented and logged
Changes reviewed for security impact

Policy Testing
IAM policy changes tested before production deployment
Testing verifies intended access granted and unintended access denied
Testing documented

Policy Backup
IAM policies backed up regularly
Backups stored securely
Backups used for disaster recovery or rollback

IAM Compliance

Compliance Requirements
IAM configuration supports compliance with regulations (GDPR, HIPAA, PCI-DSS, NIST)
IAM audit logs demonstrate compliance
IAM access reviews support compliance
IAM compliance documented

Separation of Duties
Separation of duties enforced through IAM roles
Critical functions separated
Separation of duties documented and audited

Least Privilege Compliance
Least privilege enforced through IAM roles and policies
Excessive permissions identified and removed
Least privilege compliance monitored

Roles and Responsibilities

CISO (Jacob Johnston)
Overall responsibility for IAM policy and program
Approve IAM policy and standards
Approve privileged access requests
Review IAM metrics and audit findings
Ensure IAM compliance

GCP Administrators
Implement and manage IAM policies
Provision and revoke access
Conduct access reviews
Monitor IAM activity
Respond to IAM security incidents

Resource Owners
Approve access requests for their resources
Conduct access reviews for their resources
Ensure appropriate access to their resources

All Users
Protect account credentials
Use access responsibly
Report suspicious activity
Comply with IAM policy

Contact Information

For IAM questions or to request access, contact:

Jacob Johnston
Founder and Chief Information Security Officer
True North Data Strategies LLC
Email: jacob@truenorthstrategyops.com
Phone: 555-555-5555
Colorado Springs, CO

UEI: WKJXXACV8U43
CAGE Code: 16TC1
