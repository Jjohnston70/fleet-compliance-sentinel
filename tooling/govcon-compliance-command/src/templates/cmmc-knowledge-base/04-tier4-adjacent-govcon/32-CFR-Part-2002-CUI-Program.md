---
title: "32 CFR Part 2002 - Controlled Unclassified Information (CUI) Program"
source_url: "https://www.ecfr.gov/current/title-32/part-2002"
source_type: web-reference
captured: "2026-03-07"
chunk_strategy: section-level
note: "Reference summary - verify against eCFR for current regulatory text"
---

# 32 CFR Part 2002 - CUI Program Reference

## Overview

32 CFR Part 2002 codifies the Department of Defense implementation of the Controlled Unclassified Information (CUI) Program established under Executive Order 13556. This regulation provides the authoritative framework for federal agencies in identifying, marking, safeguarding, and disseminating CUI, including requirements that apply to contractors and federal partners.

<!-- chunk: section_1 -->

## Regulatory Structure and Organization

### 32 CFR Part 2002 Subparts

**Subpart A: General Provisions**
- Definitions and scope
- Agency CUI program requirements
- CUI designating authority
- Roles and responsibilities

**Subpart B: CUI Categories and Markings**
- Authorized CUI categories
- Subcategories and specifications
- Marking requirements and procedures
- Dissemination control markings

**Subpart C: Safeguarding and Dissemination**
- Safeguarding standards and requirements
- Dissemination control procedures
- Contractor requirements
- Compliance and oversight

**Subpart D: Decontrolling**
- Procedures for removing CUI designations
- Declination period procedures
- Authority for decontrolling
- Documentation requirements

**Subpart E: CUI Programs and Oversight**
- Agency program establishment
- Senior Agency Official for Records Management (SAORM)
- Self-inspection and compliance
- Misuse penalties and remedies

### Authority and Purpose

**Authority**:
- Executive Order 13556: "Controlled Unclassified Information"
- 44 U.S.C. § 3552: Information Security Requirements
- OMB Circular A-130: Management of Information and Information Technology
- Presidential Policy Directive 4: National Security Information

**Purpose**:
- Establish uniform government-wide CUI program
- Reduce proliferation of control markings
- Standardize handling and safeguarding
- Provide clear guidance for all users
- Support information sharing while protecting sensitive information

<!-- chunk: section_2 -->

## Definitions and Key Terms

### CUI Definition

**Controlled Unclassified Information (CUI)**:
Information determined by federal agency authority to require safeguarding or dissemination controls pursuant to and consistent with applicable law, regulation, or government-wide policy.

**Key Characteristics**:
- Unclassified (not meeting classified information criteria)
- Designated by agency authority
- Requires safeguarding beyond standard procedures
- Subject to dissemination controls
- Clearly marked and identified

### Distinction from Classified Information

**Classified Information**:
- National defense information (per Espionage Act)
- Information about weapons systems
- Intelligence sources and methods
- Foreign relations
- Marked with classification level (S, TS)

**CUI**:
- Non-classified but sensitive
- Commercial, financial, privacy, or security information
- Not meeting classified information threshold
- Marked as "CUI" with category
- Different handling rules than classified

### Related Definitions

**Marking**: Visible designation indicating information is CUI

**Safeguarding**: Physical, technical, and administrative controls

**Dissemination**: Sharing or release of information to authorized recipients

**Decontrolling**: Removal of CUI designation

**Need-to-Know**: Requirement for access based on official duties

**Authorized User**: Individual or organization authorized to access CUI

<!-- chunk: section_3 -->

## CUI Categories and Subcategories

### Authorized CUI Categories

The regulation recognizes 30+ authorized CUI categories established by NARA CUI Registry:

#### Primary Categories by Organization

**Agriculture Related Information (AGR)**
- Applicability: USDA, agricultural agencies
- Content: Agricultural security, food supply information
- Safeguarding: Standard CUI protections

**Biological Safety and Security (BIO)**
- Applicability: HHS, biosafety agencies
- Content: Pathogen information, biosafety procedures
- Safeguarding: Enhanced controls for dual-use research

**Chemical/Radiation Safety and Security (CRS)**
- Applicability: DOE, EPA, chemical facility agencies
- Content: Chemical safety, radiation information
- Safeguarding: Facility security information controls

**Critical Infrastructure Information (CII)**
- Applicability: All agencies with infrastructure responsibilities
- Content: Infrastructure vulnerability information
- Safeguarding: Enhanced protections for criticality

**Defense Information (DEF)**
- Applicability: DoD, defense contractors
- Content: Weapons systems, military information
- Safeguarding: Contractor facility controls, export restrictions

**Export Control Information (ECI)**
- Applicability: Commerce, State, DoD
- Content: ITAR, EAR controlled information
- Safeguarding: Foreign national access restrictions

**Intelligence-Related Information (INT)**
- Applicability: Intelligence community
- Content: Intelligence analysis, methods
- Safeguarding: Need-to-know restrictions

**Law Enforcement Sensitive (LEI)**
- Applicability: DOJ, FBI, law enforcement
- Content: Investigation information, sources
- Safeguarding: Investigation confidentiality

**Nuclear Information (NUC)**
- Applicability: DOE, NRC
- Content: Nuclear facility, nuclear security
- Safeguarding: Nuclear security controls

**Privacy (PTI)**
- Applicability: All agencies with PII
- Content: Personally identifiable information
- Safeguarding: Privacy law compliance

**Sensitive Homeland Security Information (SHS)**
- Applicability: DHS and partners
- Content: Vulnerability information, emergency procedures
- Safeguarding: Critical infrastructure protection

### Subcategories

Many categories have subcategories with additional specifications:

**Example - Export Control Information (ECI)**:
- ECI//ITAR: International Traffic in Arms Regulations
- ECI//EAR: Export Administration Regulations
- ECI//OFAC: Office of Foreign Assets Control
- ECI//NNR: Nuclear Non-Proliferation

**Subcategory Markings**:
- Shown as primary category with double slash
- Example: CUI//DEF//WEBOP (Web Operations)
- Indicates enhanced or specific controls

### Unmarked CUI

**Definition**: Information designated as CUI by agency authority but not individually marked

**Requirements**:
- Information must be clearly part of CUI collection
- System-level or collection-level marking acceptable
- Recipient must be informed of CUI status
- Safeguarding requirements still apply
- Alternative notification procedures documented

**Examples**:
- Database systems containing CUI
- Information systems designated as CUI systems
- Collections known to contain CUI
- Organizational systems handling CUI

<!-- chunk: section_4 -->

## CUI Marking Requirements

### Standard Marking Format

#### Header Marking

**Basic Format**:
```
CUI

[Primary Category]
```

**With Subcategory**:
```
CUI

[Primary Category]//[Subcategory]
```

**Example - Defense Information**:
```
CUI

DEF
```

**Example - Export Control with ITAR**:
```
CUI

ECI//ITAR
```

### Marking Procedures

#### Document Marking

**Placement**:
1. **Header Block**: First page or cover sheet
2. **Page Numbers**: Header or footer (optional)
3. **Portion Marks**: Individual paragraphs marked
4. **Transmission**: Marked in transmittal documents
5. **Email**: CUI marking in subject line or body

**Marking Standards**:
- Clear and visible designation
- Specific category identification
- Date marking on official copies
- Classification authority (if applicable)
- Dissemination control markings

#### Electronic Document Marking

**File Properties**:
- Metadata fields: Title, subject, CUI category
- File naming: May include CUI marking
- File permissions: Restricting access
- Encryption: Applied to sensitive files

**Email Markings**:
- Subject line: Include CUI designation
- Body text: Reiterate CUI marking
- Attachments: Separately marked if CUI
- Distribution: To authorized recipients only

#### Database and System Marking

**Database Markings**:
- Field-level: Individual data elements
- Record-level: Entire database record
- System-level: Entire database or system
- Collection-level: Entire file collection

**Notification Procedures**:
- System banner on login
- Documentation of CUI content
- Access control enforcement
- User notification of content type

### Dissemination Control Markings

**Dissemination Control Types**:

#### NOFORN - Not Releasable to Foreign Nationals

**Application**:
- Information not authorized for foreign release
- Restricts access to U.S. persons only
- No sharing with international partners
- Foreign-controlled contractors excluded

**Implementation**:
- Added to CUI marking: CUI//DEF//NOFORN
- Access controls enforced
- Verification of user citizenship/status
- Incident reporting if violated

#### NOCON - Not Releasable to Contractors

**Application**:
- Information restricted to government personnel
- No contractor access
- Federal employees and authorized government only
- Typically sensitive acquisition or policy information

**Implementation**:
- Added to CUI marking: CUI//DEF//NOCON
- Access limited to government systems
- Contractor access prevented
- Periodic verification of access

#### NOPUB - Not for Public Release

**Application**:
- Information not authorized for public disclosure
- May be released to limited government/contractor audience
- Restriction on publication or external sharing
- Typically sensitive policy or agency information

**Implementation**:
- Added to CUI marking: CUI//DEF//NOPUB
- Public records request restrictions
- No public disclosure authorization
- Freedom of Information Act (FOIA) protections

#### NONREQS - Not for Release to Non-U.S. Government

**Application**:
- Restricted to U.S. government entities
- State and local government may be excluded
- Foreign entities excluded
- U.S. government contractors may be included

**Implementation**:
- Added to CUI marking: CUI//DEF//NONREQS
- Sharing limited to approved government entities
- Verification procedures for recipients

### Combination Markings

**Multiple Dissemination Controls**:
- Separated by commas or semicolons
- Example: CUI//DEF//NOFORN, NOCON
- Multiple controls indicate more restrictive designation
- All controls must be honored in dissemination decisions

<!-- chunk: section_5 -->

## Safeguarding Requirements

### General Safeguarding Standards

#### Baseline Requirements

**Federal agencies and contractors must**:
1. Identify information as CUI
2. Mark information appropriately
3. Prevent unauthorized access
4. Maintain information integrity
5. Ensure availability to authorized users
6. Respond to security incidents
7. Dispose of information securely
8. Maintain audit trails
9. Train personnel
10. Comply with dissemination restrictions

#### NIST SP 800-171 Compliance

**Mandatory Application**:
- NIST SP 800-171 controls are baseline for CUI safeguarding
- FAR 52.204-21 (15 basic controls) minimum for CUI-Basic
- CMMC Level 1 or 2 for contractor compliance

**Control Implementation**:
- Access control and identification
- Audit and accountability
- System and communications protection
- Configuration management
- Contingency planning
- System development and maintenance
- System and information integrity
- Personnel security
- Physical and environmental protection
- Incident response

### Contractor-Specific Safeguarding

#### Contractor Obligations

**Contractors must**:
1. Identify CUI in their systems
2. Apply appropriate safeguarding controls
3. Protect against unauthorized disclosure
4. Implement access controls
5. Monitor and detect unauthorized access
6. Report security incidents
7. Maintain incident records
8. Cooperate with government investigations
9. Dispose of CUI securely
10. Maintain compliance documentation

#### Facility Security Requirements

**For contractors handling CUI**:
- Facility must be secure and controlled
- Access limited to authorized personnel
- Visitor access documented
- Security badges and identification
- Perimeter security measures
- Environmental controls
- Backup power and systems

#### Personnel Security

**Requirements**:
- Security training for all CUI handlers
- Background checks or clearance as required
- Nondisclosure agreements
- Personnel reliability programs
- Separation of duties
- Need-to-know enforcement

### Information System Protections

#### System Access Controls

**Technical Controls**:
- User identification and authentication
- Multifactor authentication (where required)
- Access control lists and permissions
- Role-based access control
- Least privilege principle
- Account disabling upon separation

#### Data Protection

**Encryption**:
- Data in transit: TLS 1.2 minimum, TLS 1.3 preferred
- Data at rest: AES-128 minimum, AES-256 preferred
- Key management procedures
- Encryption for removable media

**Logging and Monitoring**:
- System audit logs (minimum 90 days)
- Access logs to CUI systems
- System event monitoring
- Log integrity protection
- Real-time alerting for suspicious activity

#### Incident Response

**Requirements**:
- Incident response plan (including CUI incidents)
- Procedures for detection and reporting
- Designated incident reporting contacts
- Evidence preservation procedures
- Forensic investigation capabilities
- Post-incident reviews and improvements

<!-- chunk: section_6 -->

## Dissemination Control Procedures

### Authorization Verification

#### Before Sharing CUI

**Contractor Must**:
1. Verify recipient's authorization for specific CUI category
2. Check dissemination control markings
3. Verify need-to-know for specific information
4. Use secure transmission methods
5. Document sharing decision
6. Maintain records of authorized recipients

#### Contractor Authorization Process

**Steps**:
1. Recipient identified (person or organization)
2. CUI category and subcategories identified
3. Dissemination controls reviewed
4. Authorization status verified against approved list
5. Need-to-know assessment conducted
6. Sharing decision documented
7. Transmission via secure channel executed

### Unauthorized Dissemination

#### Reporting Requirements

**If CUI Disseminated to Unauthorized Recipient**:
- Notify contracting officer immediately
- Notify appropriate government security official
- Notify agency CUI program manager
- Document incident with details:
  - What information was disclosed
  - To whom (recipient name, organization)
  - When (date and time)
  - How (method of transmission)
  - Why (circumstances)
  - Containment actions taken

#### Incident Investigation

**Government Response**:
- Investigation by security personnel
- Determination of damage and risk
- Assessment of remediation needs
- Notification of affected parties
- Possible enforcement action
- Lessons learned documentation

### CUI Possession and Control

#### Contractor Responsibility

**Contractors Must Maintain**:
- Knowledge of all CUI in their possession
- Inventory of CUI systems and records
- Access control logs
- Use logs and dissemination records
- Audit trail of CUI handling
- Compliance with dissemination restrictions

#### Accountability

**Contractor Accountability**:
- Personal accountability for CUI access
- Signed acknowledgments of CUI handling
- Training verification for all users
- Periodic audits of access and use
- Disciplinary procedures for violations
- Incident reporting procedures

<!-- chunk: section_7 -->

## Decontrolling Procedures

### Basis for Decontrolling

#### When CUI May Be Decontrolled

**Decontrolling Authority Determines**:

1. **Declination Period Expires**:
   - Agency designates declination period (e.g., 5 years)
   - After expiration date, CUI status automatically lapses
   - Information may be disseminated freely
   - No further safeguarding required

2. **Information Becomes Public**:
   - Information disclosed in public domain
   - Public release by authorized government official
   - Information no longer protected
   - CUI status no longer applies

3. **Authority Determination**:
   - Original designating authority reviews information
   - Determines CUI basis no longer applies
   - Formally removes CUI designation
   - Documents decontrolling decision

4. **Systematic Decontrolling**:
   - Scheduled reviews of CUI
   - Batch decontrolling by category
   - Agency policies on systematic decontrolling
   - Regular schedule (e.g., annually)

### Decontrolling Authority

#### Who May Decontrol

**Primary Authority**:
- Original classification/designation authority
- Successor authority per agency policy
- Agency CUI program manager
- Authorized government official

**Contractor Role**:
- Contractors generally cannot decontrol
- Contractors may recommend decontrolling
- Contractors follow agency decontrolling procedures
- Contractors execute decontrolling when instructed

### Decontrolling Procedures

#### Decontrolling Process

1. **Review**: Original authority reviews information
2. **Determination**: Assess whether CUI basis still exists
3. **Decision**: Approve decontrolling or deny
4. **Documentation**: Document decision and rationale
5. **Notification**: Notify affected parties
6. **Implementation**: Remove CUI markings from records
7. **Verification**: Confirm decontrolling completed

#### Documentation Requirements

**Decontrolling Records**:
- Decontrolling decision and authority
- Date of decontrolling action
- Information/document identification
- Basis for decontrolling
- Notification of recipients (if previously disseminated)

<!-- chunk: section_8 -->

## Agency CUI Programs

### Agency Responsibilities

#### Program Establishment

Each federal agency must establish a CUI program including:

1. **Designation Authority**:
   - Identify officials authorized to designate CUI
   - Establish designation procedures
   - Document authorization limits
   - Train designated officials

2. **Marking and Safeguarding**:
   - Establish marking procedures
   - Define safeguarding standards
   - Implement system controls
   - Maintain facility security

3. **Dissemination Procedures**:
   - Define authorized recipients
   - Establish verification procedures
   - Document dissemination decisions
   - Manage dissemination records

4. **Training and Awareness**:
   - Mandatory training for CUI users
   - Periodic refresher training
   - Role-specific training
   - Training tracking and documentation

5. **Compliance Monitoring**:
   - Self-inspection procedures
   - Compliance reviews and audits
   - Incident investigation
   - Remediation tracking

### Senior Agency Official for Records Management (SAORM)

#### SAORM Responsibilities

**Each Agency Designates a SAORM**:
1. Develop and implement agency CUI program
2. Establish policy and procedures
3. Designate CUI authorities within agency
4. Oversee compliance and performance
5. Report to NARA on program status
6. Coordinate with other agencies
7. Investigate unauthorized disclosures
8. Implement remedial actions

### Contractor Program Requirements

**Contractors Must**:
1. Understand and comply with agency CUI program
2. Follow agency marking and safeguarding procedures
3. Implement agency-specified dissemination controls
4. Report unauthorized disclosures immediately
5. Preserve CUI media per agency requirements
6. Support agency compliance reviews
7. Document CUI handling and procedures
8. Train personnel on agency requirements

<!-- chunk: section_9 -->

## Self-Inspection and Compliance

### Self-Inspection Requirements

#### Agency Self-Inspection Program

**Agencies must conduct**:
1. **Periodic Self-Inspections**:
   - At least annually
   - May be more frequent for high-risk areas
   - Comprehensive review of CUI program
   - Assessment of compliance

2. **Inspection Scope**:
   - Identification and marking procedures
   - Safeguarding control effectiveness
   - Dissemination control compliance
   - Decontrolling procedures
   - Training and awareness
   - Incident response procedures
   - Records management
   - Personnel security

3. **Inspection Documentation**:
   - Written inspection procedures
   - Findings and observations
   - Corrective actions identified
   - Remediation timeline
   - Follow-up verification

#### Contractor Self-Inspection

**Contractors should conduct**:
1. Regular audits of CUI handling
2. System access reviews
3. Dissemination control verification
4. Training compliance checks
5. Documentation and record reviews
6. Incident log review
7. Compliance trend analysis

### Misuse and Violations

#### Prohibited Uses of CUI

**Contractors must not**:
1. Disclose CUI to unauthorized recipients
2. Use CUI beyond authorized purposes
3. Modify CUI markings or designations
4. Store CUI unsecurely
5. Transmit CUI via unsecure channels
6. Fail to report unauthorized disclosures
7. Destroy CUI improperly
8. Refuse to comply with safeguarding requirements

#### Penalties for Misuse

**Potential Consequences**:
- Monetary penalties and fines
- Suspension or debarment from contracts
- Contract termination
- Personal liability for responsible officials
- Criminal prosecution (in cases of intentional violations)
- Civil litigation and damages
- Reputational damage and loss of business

#### Enforcement

**Government Authority**:
- Contracting officers enforce contractor compliance
- Inspector General investigations
- Agency security personnel
- Law enforcement for criminal violations
- Possible referral to prosecutors

<!-- chunk: section_10 -->

## CUI and CMMC Integration

### CUI Identification in CMMC

**CMMC Assessment**:
- Contractors must identify all CUI in systems
- CUI categories documented
- Appropriate safeguarding applied per category
- CUI-specific incident response procedures

**Level Determination Factors**:
- Presence of CUI-Basic: Generally Level 1 or 2
- Presence of CUI-Specified: Generally Level 2 or 3
- Sensitivity of specific CUI: Drives level requirement
- Volume and concentration of CUI: May elevate level

### Safeguarding Control Alignment

**FAR 52.204-21 and CUI**:
- 15 basic controls adequate for CUI-Basic
- Contractor implementation of 15 controls
- CMMC Level 1 assessment covers basic requirements

**NIST SP 800-171 and CUI-Specified**:
- Full control set appropriate for sensitive CUI
- CMMC Level 2 assessment addresses NIST controls
- Enhanced controls for APT-sensitive CUI
- CMMC Level 3 assessment for sensitive categories

### Compliance Verification

**CMMC Assessment Verifies**:
1. CUI identification procedures
2. Marking and handling procedures
3. Safeguarding control implementation
4. Dissemination control procedures
5. Incident response for CUI incidents
6. Personnel training on CUI procedures
7. System access controls for CUI systems
8. Data protection measures

## Cross-References

- **Executive Order 13556**: CUI establishment and policy
- **OMB Circular A-130**: Information security requirements
- **NARA CUI Registry**: Authorized categories and markings
- **NIST SP 800-171**: Safeguarding control baseline
- **FAR 52.204-21**: Contractor safeguarding requirements
- **DFARS 252.204-7012**: DoD contractor CUI requirements
- **CMMC Program**: Integration of CUI with CMMC levels

---

**Document Status**: Reference summary for knowledge management. For current regulatory text, consult 32 CFR Part 2002 at https://www.ecfr.gov
