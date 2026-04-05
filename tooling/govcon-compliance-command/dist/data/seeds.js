/**
 * Seed data for initial database population
 * Includes govcon pipeline + compliance document templates
 */
import { DEFAULT_COMPLIANCE_ITEMS } from "../config/compliance-seeds.js";
/**
 * Example opportunities for testing and demo
 */
export const SEED_OPPORTUNITIES = [
    {
        id: "opp-001",
        title: "Workflow Automation Platform Implementation",
        solicitation_number: "PRC-2025-001",
        agency: "General Services Administration",
        sub_agency: "Federal Acquisition Service",
        posted_date: new Date("2025-03-01"),
        response_deadline: new Date("2025-04-15"),
        set_aside_type: "small_business",
        naics_code: "541512",
        naics_description: "Computer Systems Design Services",
        estimated_value: 125000,
        place_of_performance: "Washington, DC",
        description: "GSA FAS seeks contractor to design and implement workflow automation platform for regional processing center.",
        url: "https://sam.gov/opp/000000000",
        status: "evaluating",
        source: "sam_gov",
        created_at: new Date("2025-03-05"),
        updated_at: new Date("2025-03-05"),
    },
    {
        id: "opp-002",
        title: "Data Dashboard Development for Army Corps",
        solicitation_number: "W9124C-2025-0042",
        agency: "Department of Defense",
        sub_agency: "U.S. Army Corps of Engineers",
        posted_date: new Date("2025-02-20"),
        response_deadline: new Date("2025-03-25"),
        set_aside_type: "SDVOSB",
        naics_code: "541511",
        naics_description: "Custom Computer Programming Services",
        estimated_value: 85000,
        place_of_performance: "Omaha, NE",
        description: "Development of real-time data dashboard for environmental monitoring and reporting.",
        url: "https://sam.gov/opp/000000001",
        status: "bid",
        source: "sam_gov",
        created_at: new Date("2025-02-21"),
        updated_at: new Date("2025-03-08"),
    },
];
/**
 * Example outreach contacts
 */
export const SEED_OUTREACH_CONTACTS = [
    {
        id: "contact-001",
        agency: "General Services Administration",
        office: "Federal Acquisition Service",
        name: "Sarah Mitchell",
        title: "Contracting Officer",
        email: "sarah.mitchell@gsa.gov",
        phone: "202-555-0101",
        osdbu: false,
        last_contacted: new Date("2025-02-15"),
        contact_count: 1,
        notes: "Receptive to small business solutions. Interested in automation use cases.",
        status: "warm",
        created_at: new Date("2025-02-10"),
    },
    {
        id: "contact-002",
        agency: "Department of Veterans Affairs",
        office: "Office of Small and Disadvantaged Business Utilization",
        name: "James Rodriguez",
        title: "SDVOSB Liaison",
        email: "james.rodriguez@va.gov",
        phone: "202-555-0202",
        osdbu: true,
        last_contacted: new Date("2025-01-20"),
        contact_count: 2,
        notes: "Knows TNDS is pursuing SDVOSB. Has opportunities in pipeline.",
        status: "active",
        created_at: new Date("2024-12-01"),
    },
];
/**
 * Default compliance items seeded from config
 */
export const SEED_COMPLIANCE_ITEMS = DEFAULT_COMPLIANCE_ITEMS.map((item, idx) => ({
    id: `comp-${String(idx + 1).padStart(3, "0")}`,
    item_type: item.itemType,
    name: item.name,
    description: item.description,
    authority: item.authority,
    status: "current",
    effective_date: new Date("2025-01-01"),
    expiration_date: new Date(new Date().getTime() + item.renewalFrequencyMonths * 30 * 24 * 60 * 60 * 1000),
    reminder_days_before: item.reminderDaysBefore,
    notes: `Auto-seeded from default compliance tracking list.`,
}));
/**
 * 7 compliance package template masters
 * These are Handlebars templates with {{PLACEHOLDER}} tokens
 * that get replaced with company-specific data
 */
export const COMPLIANCE_PACKAGE_TEMPLATES = {
    1: `# Internal Compliance Policy
## {{COMPANY_NAME}}
### Prepared for: {{OWNER_NAME}}, {{OWNER_TITLE}}
### Effective Date: {{EFFECTIVE_DATE}}

## 1. Purpose
This document establishes the internal compliance policy for {{COMPANY_NAME}} ("the Company"), ensuring that all employees, contractors, and stakeholders adhere to applicable laws, regulations, and ethical standards.

## 2. Scope
This policy applies to all employees, contractors, subcontractors, and agents of {{COMPANY_NAME}} operating at {{ADDRESS}}, {{CITY}}, {{STATE}} {{ZIP}}.

## 3. Compliance Officer
The designated Compliance Officer is {{COMPLIANCE_OFFICER}}. All compliance inquiries should be directed to {{EMAIL}} or {{PHONE}}.

## 4. Regulatory Frameworks
{{COMPANY_NAME}} maintains compliance with the following frameworks as applicable to our operations:
- Federal Acquisition Regulation (FAR)
- NIST SP 800-171 (CUI Protection)
- State of {{STATE}} business regulations
- Industry-specific standards per contract requirements

## 5. Employee Responsibilities
All personnel are required to complete compliance training within 30 days of onboarding and annually thereafter. Violations must be reported to the Compliance Officer immediately.

## 6. Record Retention
{{COMPANY_NAME}} retains compliance records for a minimum of 3 years (or as required by specific contract terms). Records are stored securely with access limited by role.

## 7. Incident Reporting
Compliance incidents must be reported within 24 hours. The Compliance Officer will initiate investigation and document findings within 5 business days.`,
    2: `# Security Compliance Handbook
## {{COMPANY_NAME}}
### Security Officer: {{SECURITY_OFFICER}}
### Version: 1.0 | Effective: {{EFFECTIVE_DATE}}

## 1. Information Security Policy
{{COMPANY_NAME}} is committed to protecting the confidentiality, integrity, and availability of all information assets. This handbook establishes security controls aligned with NIST SP 800-171 and applicable federal requirements.

## 2. Access Control
- All systems require multi-factor authentication (MFA)
- Access follows least-privilege principle
- Quarterly access reviews conducted by {{SECURITY_OFFICER}}
- Privileged access requires manager approval and audit logging

## 3. Data Classification
| Level | Description | Examples |
|-------|-------------|----------|
| PUBLIC | No restrictions | Marketing materials, public website |
| INTERNAL | Business use only | Internal SOPs, process docs |
| CONFIDENTIAL | Restricted access | Client data, financial records |
| CONTROLLED | Federal requirements | CUI, ITAR, export-controlled |

## 4. Incident Response
1. DETECT - Identify potential security event
2. CONTAIN - Isolate affected systems within 1 hour
3. ERADICATE - Remove threat and patch vulnerability
4. RECOVER - Restore services from verified backups
5. REPORT - Notify {{SECURITY_OFFICER}} and affected parties within 24 hours

## 5. Physical Security
{{COMPANY_NAME}} office at {{ADDRESS}} maintains physical access controls including locked facilities, visitor logs, and secured equipment storage.

## 6. Cloud Security
Primary cloud platform: {{CLOUD_PROVIDER}}
- All data encrypted at rest (AES-256) and in transit (TLS 1.2+)
- Cloud access governed by IAM policies with MFA
- Regular configuration audits per CIS benchmarks`,
    3: `# Data Handling & Privacy Policy
## {{COMPANY_NAME}}
### Privacy Officer: {{PRIVACY_OFFICER}}
### Effective: {{EFFECTIVE_DATE}}

## 1. Purpose
This policy governs how {{COMPANY_NAME}} collects, processes, stores, and disposes of data, ensuring compliance with GDPR, CCPA/CPRA, HIPAA, and other applicable privacy regulations.

## 2. Data Types Handled
{{COMPANY_NAME}} processes the following data categories:
- Business contact information
- Client operational data
- Financial records
- Employee records
- Government contract data (including potential CUI)

## 3. Data Lifecycle
COLLECTION -> PROCESSING -> STORAGE -> RETENTION -> DISPOSAL
- Collection: Minimum necessary, with documented consent
- Processing: Purpose-limited, logged, auditable
- Storage: Encrypted at rest, access-controlled
- Retention: Per contract terms or 3-year default
- Disposal: Secure deletion with verification

## 4. Privacy Rights
{{COMPANY_NAME}} supports individual privacy rights including:
- Right to access personal data
- Right to correction
- Right to deletion (where not contractually restricted)
- Right to data portability
Contact {{PRIVACY_OFFICER}} at {{EMAIL}} for privacy requests.

## 5. Third-Party Data Sharing
Data is shared with third parties only when:
- Required by contract
- Authorized by data owner
- Required by law
All third parties must sign Data Processing Agreements (DPAs).

## 6. Breach Notification
In the event of a data breach, {{COMPANY_NAME}} will:
- Notify affected individuals within 72 hours (GDPR) or as required
- Report to applicable regulatory authorities
- Document incident and remediation in compliance records`,
    4: `# Government Contracting Compliance
## {{COMPANY_NAME}}
### {{OWNER_NAME}}, {{OWNER_TITLE}}
### UEI: {{UEI}} | CAGE Code: {{CAGE_CODE}}
### Primary NAICS: {{NAICS_PRIMARY}}

## 1. Federal Contractor Registration
{{COMPANY_NAME}} maintains active registration in:
- System for Award Management (SAM.gov) - UEI: {{UEI}}
- CAGE Code: {{CAGE_CODE}}
- SBA Certification: {{CERTIFICATIONS}}
- State of {{STATE}} business registration

## 2. Federal Acquisition Regulation (FAR) Compliance
{{COMPANY_NAME}} adheres to all applicable FAR clauses including:
- FAR 52.204-21 (Basic Safeguarding of Covered Contractor Information)
- FAR 52.219-X (Small Business Set-Aside provisions)
- FAR 52.222-26 (Equal Opportunity)
- FAR 52.203-13 (Contractor Code of Business Ethics)

## 3. DFARS Compliance (if applicable)
For Department of Defense contracts:
- DFARS 252.204-7012 (Safeguarding Covered Defense Information)
- DFARS 252.204-7021 (CMMC requirements)
- NIST SP 800-171 self-assessment documented

## 4. Ethics and Conduct
{{COMPANY_NAME}} maintains a zero-tolerance policy for:
- Bribery, kickbacks, or improper gratuities
- Procurement fraud
- Conflicts of interest
All personnel sign annual ethics certifications.

## 5. Subcontractor Management
All subcontractors must:
- Register in SAM.gov
- Meet applicable security requirements
- Sign flow-down clause acknowledgments
- Submit to audit as required by prime contract

## 6. Contract Reporting
{{COMPANY_NAME}} submits all required reports including:
- FSRS (Federal Funding Accountability and Transparency Act)
- EEO-1 reports (when applicable)
- Small business subcontracting reports`,
    5: `# Google Partner Compliance
## {{COMPANY_NAME}}
### IT Contact: {{IT_CONTACT}}
### Effective: {{EFFECTIVE_DATE}}

## 1. Google Workspace Administration
{{COMPANY_NAME}} uses Google Workspace as its primary collaboration platform. Configuration follows Google security best practices and CIS benchmarks.

## 2. Identity and Access Management
- Google Workspace admin managed by {{IT_CONTACT}}
- SSO enforced for all users
- MFA required (hardware keys for admins)
- Organizational units (OUs) configured per role

## 3. Data Loss Prevention
- DLP rules configured for PII, financial data, and CUI markers
- Drive sharing restricted to internal by default
- External sharing requires approval
- Gmail content compliance rules active

## 4. Acceptable Use
All {{COMPANY_NAME}} personnel must:
- Use company accounts for business purposes only
- Not share credentials
- Report suspected compromise immediately to {{IT_CONTACT}}
- Follow data classification labels when sharing

## 5. Google Cloud Platform (if applicable)
Cloud provider: {{CLOUD_PROVIDER}}
- Projects organized per client/function
- IAM roles follow least privilege
- Audit logging enabled for all services
- VPC and firewall rules documented`,
    6: `# Business Operations Compliance
## {{COMPANY_NAME}}
### {{OWNER_NAME}}, {{OWNER_TITLE}}
### {{ADDRESS}}, {{CITY}}, {{STATE}} {{ZIP}}

## 1. Business Structure
- Legal Name: {{LEGAL_NAME}}
- Business Type: {{BUSINESS_TYPE}}
- EIN: {{EIN}}
- Year Founded: {{YEAR_FOUNDED}}
- Employees: {{EMPLOYEE_COUNT}}

## 2. Insurance and Bonding
{{COMPANY_NAME}} maintains the following coverage:
- General Liability Insurance
- Professional Liability (E&O)
- Cyber Liability Insurance
- Workers Compensation (as applicable)

## 3. Financial Controls
- Separate business and personal accounts
- Dual authorization for expenditures over $5,000
- Monthly financial reconciliation
- Annual independent review or audit
- Tax filings: Federal (IRS) and State ({{STATE}})

## 4. Human Resources
- Background checks for all employees handling sensitive data
- Annual compliance training
- Employee handbook maintained and updated annually
- Anti-discrimination and anti-harassment policies enforced

## 5. Quality Management
{{COMPANY_NAME}} maintains quality through:
- Client feedback collection and review
- Project post-mortems
- Continuous improvement process
- Documentation standards for all deliverables

## 6. Business Continuity
- Critical systems backed up daily
- Recovery point objective (RPO): 24 hours
- Recovery time objective (RTO): 48 hours
- Annual continuity plan test conducted`,
    7: `# Advanced Compliance (CMMC/FedRAMP)
## {{COMPANY_NAME}}
### Security Officer: {{SECURITY_OFFICER}}
### Compliance Officer: {{COMPLIANCE_OFFICER}}

## 1. CMMC Readiness
{{COMPANY_NAME}} is preparing for Cybersecurity Maturity Model Certification (CMMC) to support Department of Defense contracting:

### CMMC Level 1 (Foundational)
- 17 practices based on FAR 52.204-21
- Self-assessment conducted and documented
- Annual affirmation submitted

### CMMC Level 2 (Advanced) - Target
- 110 practices aligned with NIST SP 800-171 Rev 2
- System Security Plan (SSP) documented
- Plan of Action & Milestones (POA&M) maintained
- Third-party assessment planned

## 2. NIST SP 800-171 Controls
{{COMPANY_NAME}} implements controls across 14 families:
1. Access Control (AC)
2. Awareness and Training (AT)
3. Audit and Accountability (AU)
4. Configuration Management (CM)
5. Identification and Authentication (IA)
6. Incident Response (IR)
7. Maintenance (MA)
8. Media Protection (MP)
9. Personnel Security (PS)
10. Physical Protection (PE)
11. Risk Assessment (RA)
12. Security Assessment (CA)
13. System and Communications Protection (SC)
14. System and Information Integrity (SI)

## 3. SPRS Score
Current self-assessment score: [PENDING]
Target score: 110 (full implementation)
Assessment methodology: NIST SP 800-171A

## 4. FedRAMP Considerations
For cloud services provided to federal agencies:
- Cloud platform: {{CLOUD_PROVIDER}}
- FedRAMP authorization level: [TO BE DETERMINED]
- Continuous monitoring plan documented
- POA&M items tracked and remediated

## 5. CUI Program
{{COMPANY_NAME}} handles Controlled Unclassified Information (CUI) per:
- 32 CFR Part 2002
- NIST SP 800-171 controls
- CUI marking and handling procedures
- Personnel training on CUI requirements`,
};
/**
 * Placeholder token mapping for template rendering
 */
export const PLACEHOLDER_MAP = {
    "COMPANY_NAME": "company_name",
    "LEGAL_NAME": "legal_name",
    "OWNER_NAME": "owner_name",
    "OWNER_TITLE": "owner_title",
    "ADDRESS": "address",
    "CITY": "city",
    "STATE": "state",
    "ZIP": "zip",
    "PHONE": "phone",
    "EMAIL": "email",
    "WEBSITE": "website",
    "EIN": "ein",
    "UEI": "uei",
    "CAGE_CODE": "cage_code",
    "DUNS": "duns",
    "NAICS_PRIMARY": "naics_primary",
    "BUSINESS_TYPE": "business_type",
    "EMPLOYEE_COUNT": "employee_count",
    "ANNUAL_REVENUE": "annual_revenue",
    "YEAR_FOUNDED": "year_founded",
    "CERTIFICATIONS": "certifications",
    "SECURITY_OFFICER": "security_officer",
    "PRIVACY_OFFICER": "privacy_officer",
    "COMPLIANCE_OFFICER": "compliance_officer",
    "IT_CONTACT": "it_contact",
    "CLOUD_PROVIDER": "cloud_provider",
    "EFFECTIVE_DATE": "_effective_date",
};
export async function seedDatabase(repo) {
    // Seed opportunities
    for (const opp of SEED_OPPORTUNITIES) {
        await repo.createOpportunity(opp);
    }
    // Seed outreach contacts
    for (const contact of SEED_OUTREACH_CONTACTS) {
        await repo.createOutreachContact(contact);
    }
    // Seed compliance items
    for (const item of SEED_COMPLIANCE_ITEMS) {
        await repo.createComplianceItem(item);
    }
}
//# sourceMappingURL=seeds.js.map