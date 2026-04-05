⭐ SECTION-BY-SECTION REPLACEMENT BLOCKS

(Each block is already fully aligned to your TNDS mandatory formatting rules.)

✅ 1. REPLACE YOUR EXISTING “Universal TNDS Principles” SECTION WITH THIS

Universal TNDS Principles

The following principles apply universally across all True North Data Strategies operations, systems, and engagements. These principles form the foundation for all policies, procedures, and security controls across all documentation packages.

Data-as-Regulated Principle

TNDS treats all client, customer, and project data as regulated by default unless explicitly classified otherwise. TNDS applies regulated-data controls to all data by default, including encryption, access control, monitoring, and retention requirements. This principle ensures maximum protection of data in all jurisdictions and industries.

No Sensitive Data in Logs Principle

TNDS prohibits storing, transmitting, or capturing personally identifiable information (PII), protected health information (PHI), payment card information (PCI), controlled unclassified information (CUI), authentication secrets, access credentials, or other regulated identifiers in logs, debugging output, command-line history, screenshots, tickets, monitoring systems, or prompts sent to external AI systems. Logging systems must implement data minimization and anonymization controls.

Role Combination for Small Business Operations

TNDS may combine roles including Chief Information Security Officer, Chief Information Officer, Chief Technology Officer, Privacy Officer, Compliance Officer, and Records Officer due to organizational size. Role conflicts are documented and mitigated through separation of duties where feasible, independent oversight, and use of Managed Security Service Providers (MSSPs) for monitoring. TNDS augments staffing with subcontractors or consultants for engagements requiring separated roles. Annual review evaluates effectiveness of these mitigations.

✅ 2. INSERT THIS NEW SECTION DIRECTLY AFTER “Documentation Hierarchy and Cross-Package References”

Cross-Package Integration Requirements

The Security and Compliance Handbook is the authoritative governance document for all TNDS packages. All packages must reference and align with this Handbook as the master source of security, privacy, compliance, and operational requirements.

Each package is required to reference the following authorities:

Package 1 implements the operational controls defined in this Handbook.

Package 3 is the authoritative source for privacy, retention, anonymization, and data handling controls.

Package 4 provides federal overlays and superseding requirements for government engagements.

Package 5 provides Google Workspace, Google Cloud Platform, and Vertex AI platform implementation requirements.

Package 6 implements business operations, onboarding/offboarding, document control, and internal processes that must follow this Handbook.

Package 7 implements commercial and federal contracting requirements including DPAs, BAAs, SLAs, and risk assessments.

All policies and procedures across all packages must reference the authoritative source for:

Privacy and data handling (Package 3)

Platform-specific controls (Package 5)

Federal requirements (Package 4)

Incident response authority (Section 6)

Records retention (Package 3 Records Management Policy)

✅ 3. REPLACE YOUR “Policy Applicability by Context” SECTION WITH THIS UPDATED VERSION

Policy Applicability by Context

TNDS policies and controls apply across all operating contexts with additional requirements based on regulatory, contractual, or platform-specific obligations.

Internal Operations

All controls in this Handbook apply to TNDS internal operations.
Internal operations form the baseline implementation for the TNDS security program.
Internal systems follow the TNDS Records Management Policy for retention and deletion.

Commercial Client Engagements

All controls in this Handbook apply.
Commercial clients may impose additional controls through contracts, statements of work, or data protection agreements.
Commercial engagements reference the TNDS Privacy Management Policy (Package 3) and platform controls (Package 5).

Federal Government Engagements

Federal engagements follow the requirements in this Handbook and the federal overlays in Package 4.
Federal requirements supersede general controls where more stringent.
CUI is handled per NIST 800-171 requirements.
Federal retention and breach notification timelines override general timelines.

Healthcare Client Engagements

Healthcare engagements follow all requirements in this Handbook plus HIPAA Security, Privacy, and Breach Notification Rules.
Business Associate Agreements (Package 7) are required for PHI processing.
PHI follows enhanced monitoring, access, and disclosure requirements.

International Client Engagements

International operations follow this Handbook plus GDPR and country-specific privacy requirements.
International data transfers follow Standard Contractual Clauses and Transfer Impact Assessments.
Data localization requirements are enforced when required.

Platform-Specific Controls

Google Workspace, Google Cloud Platform, and Vertex AI follow the implementation requirements in Package 5.
Platform configurations must inherit—never replace—requirements in this Handbook.

Policy Conflict Resolution

Federal requirements override general controls when more stringent.

Privacy requirements in Package 3 override other packages where applicable.

Client contracts may impose stricter controls; the strictest requirement applies.

All exceptions require CISO approval and risk-register documentation.

✅ 4. INSERT THIS NEW BLOCK INTO SECTION 7 — COMPLIANCE FRAMEWORKS AFTER THE TABLE

Compliance Language Standards

TNDS maintains alignment with security and privacy frameworks including NIST, ISO 27001, SOC 2, HIPAA, GDPR, CCPA, and FedRAMP-adjacent controls. Unless independently certified, TNDS does not claim full certification. TNDS uses the following terminology:

“Controls implemented and aligned to…”

“Aligned with the requirements of…”

“Prepared for audit when required…”

Statements of certification may only be made after an independent third-party audit.

✅ 5. INSERT THIS BLOCK INTO SECTION 8 — CLOUD SECURITY UNDER “GCP IAM”

Just-in-Time (JIT) Access Controls

TNDS enforces just-in-time access through conditional IAM, Access Approval workflows, and short-lived credentials. Privileged access is granted only for the required duration and automatically revoked when no longer needed.

✅ 6. ADD THIS BLOCK TO SECTION 14 — AUDIT AND MONITORING

Sensitive Data Logging Controls

All logging, monitoring, SIEM aggregation, ticketing, and debugging tools must follow the TNDS No Sensitive Data in Logs Principle. Logs must never contain PII, PHI, PCI, CUI, credentials, secrets, tokens, or regulated identifiers. Tools must enforce masking, filtering, anonymization, or tokenization controls as required.