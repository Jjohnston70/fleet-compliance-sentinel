---
title: "Supplier Performance Risk System (SPRS) - NIST SP 800-171 Assessment Posting"
source_url: "https://www.sprs.csd.dod.mil"
source_type: web-reference
captured: "2026-03-07"
chunk_strategy: section-level
note: "Reference summary - verify against SPRS portal for current functionality and requirements"
---

# SPRS Portal and Assessment Posting Reference

## Overview

The Supplier Performance Risk System (SPRS) is the Department of Defense web-based portal for tracking and managing contractor cybersecurity compliance, specifically CMMC assessments and NIST SP 800-171 compliance scores. SPRS serves as the authoritative government database for contractor security posture and enables contracting officers to verify compliance before contract award.

<!-- chunk: section_1 -->

## SPRS Purpose and Functionality

### Primary Purpose

SPRS provides:

1. **Centralized Assessment Tracking**: Single government database of contractor CMMC assessments
2. **Compliance Verification**: Contracting officers verify contractor compliance
3. **Risk Assessment**: Government evaluates contractor security posture
4. **Source Selection Support**: Support for proposal evaluation and competitive bid decisions
5. **Historical Records**: Maintains assessment history and trending
6. **Contractor Access**: Contractors manage own assessment data
7. **Government Oversight**: Government monitors compliance across supply chain

### SPRS Benefits

**For Contractors**:
- Single source of truth for compliance records
- Government visibility into compliance status
- Reduced compliance verification burden
- Access to own assessment history
- Support for contract renewals

**For Government**:
- Centralized compliance database
- Risk-based contractor assessment
- Support for acquisition decisions
- Compliance trending and analytics
- Supply chain security visibility

### SPRS Users

**Contractor Users**:
- Company compliance officers
- Security officers
- Contracting staff
- System owners providing assessment information
- Authorized company representatives

**Government Users**:
- Contracting officers
- Source selection teams
- DoD cyber personnel
- Security and compliance officers
- Supply chain risk management personnel

<!-- chunk: section_2 -->

## Assessment Scoring Methodology

### DoD Assessment and Certification Methodology (DACM)

The SPRS system uses the DoD Assessment and Certification Methodology (DACM) for scoring NIST SP 800-171 compliance.

#### Point Structure

**Total Assessment Points: 110**

The 110 total points represent the complete NIST SP 800-171 control set, distributed across control families:

| Control Family | Point Allocation | Focus Area |
|---|---|---|
| Access Control (AC) | 16 points | User access and privilege management |
| Audit/Accountability (AU) | 8 points | Logging, monitoring, accountability |
| Identification/Authentication (IA) | 8 points | User identification and authentication |
| System/Communications Protection (SC) | 30 points | Encryption, network security, communications |
| Configuration Management (CM) | 14 points | Baselines, change control, integrity |
| Contingency Planning (CP) | 4 points | Backup and recovery procedures |
| System Development/Maintenance (SA) | 8 points | System design and development security |
| System/Information Integrity (SI) | 10 points | Malware detection, system monitoring |
| Personnel Security (PS) | 6 points | Personnel vetting and security |
| Physical/Environmental (PE) | 4 points | Physical and environmental protection |
| Incident Response (IR) | 4 points | Incident detection and response |
| Security Planning (PL) | 2 points | Security planning and policy |
| Supply Chain Risk (SR) | 2 points | Supply chain risk management |
| Awareness/Training (AT) | 2 points | Security training and awareness |
| Information/Records (IR) | 2 points | Information protection and records |

#### Weighted Scoring System

**Control Weighting Factors**:

Controls are weighted at three levels based on criticality:

| Weight | Point Value | Percentage | Example Controls |
|--------|------------|-----------|-----------------|
| High | 5 points | 30% of controls | Encryption, Access Control, Authentication |
| Medium | 3 points | 40% of controls | Monitoring, Logging, Configuration Management |
| Low | 1 point | 30% of controls | Training, Documentation, Planning |

**Scoring Calculation**:
1. Identify each control's weight (1, 3, or 5 points)
2. For each control, assign compliance status:
   - **Fully Compliant**: Score full weighted points
   - **Partially Compliant**: Score partial points (50%)
   - **Non-Compliant**: Score zero points
3. Sum all points achieved
4. Calculate percentage: (Achieved Points ÷ 110) × 100%

#### Scoring Example

Example system with 110 possible points:
- 30 controls fully compliant = 100 points
- 5 controls partially compliant = 8 points
- 5 controls non-compliant = 0 points
- **Total: 108 points = 98.2% compliance**

### CMMC Level Assessment Thresholds

#### CMMC Level 1 (Self-Assessment)

**Assessment Scope**: 15 FAR 52.204-21 controls (not full DACM)

**Compliance Determination**:
- Contractor demonstrates implementation of 15 controls
- Self-assessment documentation submitted
- Contracting officer review and approval
- No numeric score required for Level 1

**Validation**: Documentation review by contracting officer or government personnel

#### CMMC Level 2 (C3PAO Assessment)

**Assessment Scope**: Full NIST SP 800-171 (110 controls via DACM)

**Passing Score**: Typically **80% or higher** (approximately 88 points or greater)

**Score Interpretation**:
- **90%+ (99+ points)**: Strong compliance posture
- **80-89% (88-98 points)**: Acceptable compliance
- **Below 80%**: Non-compliant; requires POA&M

**Conditional vs. Final Certification**:
- **Conditional**: 80%+ but with POA&M for non-compliant controls
- **Final**: 100% compliance with no POA&M items

#### CMMC Level 3 (C3PAO Assessment with Government Involvement)

**Assessment Scope**: Full NIST SP 800-171 plus APT-specific controls

**Passing Score**: Typically **85% or higher** (approximately 93+ points)

**Score Interpretation**:
- **90%+ (99+ points)**: Strong APT mitigation
- **85-89% (93-98 points)**: Acceptable APT mitigation
- **Below 85%**: Non-compliant; enhanced remediation required

**Enhanced Focus**:
- Advanced threat identification and response
- Threat intelligence integration
- Continuous monitoring and adaptation
- Supply chain security for sensitive information

### DACM Assessment Process

#### Assessment Activities

The C3PAO follows DACM procedures including:

1. **Initiation**: System scope definition, resource planning
2. **Information Gathering**:
   - System documentation review (SSP, security plans)
   - Control implementation narrative review
   - Evidence collection and examination
   - Network architecture and system diagrams
3. **Interviews**:
   - System administrators and security personnel
   - Control implementation practitioners
   - Management responsible for security
   - System users and stakeholders
4. **Testing and Observation**:
   - Control configuration verification
   - Functional testing of security controls
   - Log and audit review
   - System demonstration
5. **Risk Assessment**:
   - Vulnerability identification
   - Control effectiveness evaluation
   - Compensating control assessment
6. **Determination**:
   - Control compliance status assignment
   - Point scoring calculation
   - Risk rating determination
7. **Reporting**: Assessment report with findings and recommendations

#### Evidence Standards

For each control, assessor examines evidence such as:

- **Policies and Procedures**: Written policies documenting control requirements
- **Configuration Documentation**: Technical configuration of controls
- **System Logs and Audit Trails**: Operational evidence of control function
- **Training Records**: Evidence of personnel training
- **Test Results**: Vulnerability scans, compliance scans
- **Interviews**: Personnel confirmation of control operation
- **Physical Inspection**: Observation of implemented controls

**Evidence Sufficiency**:
- Evidence must be clear, convincing, and relevant
- Multiple forms of evidence strengthen determination
- Recent evidence preferred (within 90 days)
- Evidence must demonstrate current compliance, not historical

<!-- chunk: section_3 -->

## SPRS Portal Access and Functionality

### Contractor Portal Access

#### Account Setup

**Initial Access**:
1. Contractor identifies authorized representatives
2. Request account creation through contractor portal
3. SPRS validates contractor identity and authorization
4. Account provisioning (within 3-5 business days)
5. Contractor receives login credentials
6. First login requires password reset

**Multi-Factor Authentication**:
- SPRS requires secure authentication
- Options include password plus token or multi-factor authentication
- Contractors must enable MFA for account security
- Backup authentication methods required

#### Contractor Portal Functions

**Assessment Data Management**:
1. **Enter Assessment Information**:
   - Assessment completion date
   - Assessment type (self-assessment or C3PAO)
   - CMMC level achieved (1, 2, or 3)
   - Assessment score/percentage
   - POA&M status
   - Expiration date

2. **Upload Assessment Documents**:
   - Assessment report (summary or full)
   - C3PAO assessment letter
   - POA&M documentation
   - Supporting evidence (as required)

3. **Update Compliance Status**:
   - Change from conditional to final certification
   - Update POA&M progress
   - Extend assessments if timeline changes
   - Update expiration dates upon renewal

4. **View Assessment History**:
   - Previous assessments and scores
   - Assessment trending over time
   - Historical compliance status
   - Score progression

5. **Generate Reports**:
   - Compliance summary reports
   - Assessment history reports
   - Export to PDF or Excel
   - Certification letter generation

### Government Portal Access

#### Contracting Officer Access

**SPRS Functions for Contracting Officers**:

1. **Search Contractor Compliance**:
   - Search by company name or CAGE code
   - View compliance status and CMMC level
   - Access assessment date and expiration
   - Review POA&M status

2. **Compliance Verification**:
   - View most recent assessment
   - Verify CMMC certification level
   - Assess risk based on compliance posture
   - Document compliance verification

3. **Source Selection Support**:
   - Compare compliance among bidders
   - Evaluate cybersecurity maturity
   - Support competitive bid decisions
   - Document cybersecurity risk factors

4. **Contract Administration**:
   - Monitor contractor compliance during performance
   - Track compliance renewal timelines
   - Document compliance issues
   - Escalate non-compliance concerns

#### Government Reporting and Analytics

**Government-Level Functions**:
- Contractor compliance trending
- Supply chain risk analytics
- Compliance rate by industry/region
- Threat intelligence correlation
- Risk-based acquisition decisions

<!-- chunk: section_4 -->

## Assessment Result Submission Process

### What Must Be Posted

#### Mandatory Information

All contractors must post to SPRS:

1. **Company Information**
   - Legal company name
   - CAGE Code (Commercial and Government Entity code)
   - Facility location(s)
   - Company classification (size, organizational status)

2. **Assessment Information**
   - Assessment type (Self-assessment, C3PAO assessment)
   - Assessment completion date
   - Assessor name and organization (for C3PAO assessments)
   - C3PAO authorization reference (for C3PAO assessments)

3. **Compliance Results**
   - CMMC level achieved (1, 2, or 3)
   - Assessment score/percentage (for Level 2/3)
   - Certification status (Conditional or Final)
   - Date certification becomes effective
   - Certification expiration date (3 years from assessment)

4. **POA&M Status** (if conditional)
   - Number of non-compliant controls
   - POA&M completion timeline
   - Key remediation milestones
   - Progress updates as items closed

5. **Supporting Documentation**
   - Assessment report (summary or full per guidance)
   - C3PAO authorization letter
   - Assessment-related documents
   - POA&M documentation

### Submission Timeline Requirements

#### Level 1 Self-Assessment

**Timeline**:
- Self-assessment completed before or early in contract performance
- Results posted to SPRS within 30 days of completion
- Contracting officer notified of posting

**Documentation**:
- Self-assessment summary
- Documentation of control implementation
- Compliance attestation

#### Level 2 C3PAO Assessment

**Initial Assessment Timeline**:
- **Phase 1 Contractors (Nov 2025 - Oct 2026)**: Self-assessment option; posting within 30 days
- **Phase 2 Onwards (Nov 2026+)**: C3PAO assessment required; posting within 30 days of assessment completion

**Renewal Assessment Timeline**:
- Assessment initiated before previous certification expiration
- Completion within 90 days of previous expiration
- SPRS posting within 30 days of completion

#### Level 3 Assessment

**Assessment Timeline**:
- Scheduled within 12 months of contract award
- Completed within 9-12 months of award date
- SPRS posting within 30 days of completion

### POA&M Submission and Updates

#### Initial POA&M Submission

**With Conditional Certification**:
- POA&M submitted with assessment results
- All non-compliant controls included
- Remediation timeline (typically 180 days or less)
- Responsible party and target completion dates

#### POA&M Progress Updates

**Ongoing Updates**:
- Quarterly or as items closed (per contract requirements)
- Status updates to SPRS
- Documentation of remediation completion
- Validation of closed items

#### POA&M Closure

**Closure Procedures**:
1. Contractor completes remediation
2. Contractor documents completion and provides evidence
3. C3PAO or contracting officer validates closure
4. POA&M item marked as closed in SPRS
5. Final certification issued when all items closed

### SPRS Posting Errors and Corrections

#### Error Correction Procedures

**If Contractor Discovers Error**:
1. Contact contracting officer immediately
2. Document the error and correct information
3. Request SPRS update/correction
4. Provide supporting documentation
5. Track correction until complete

**If Contracting Officer Identifies Error**:
1. Contracting officer contacts contractor
2. Contractor provides corrected information
3. SPRS updated by authorized representative
4. Verification of correction completed

**Common Errors**:
- Incorrect assessment date
- Wrong CMMC level posted
- Mismatched expiration date
- Incomplete POA&M information
- Incorrect company information

<!-- chunk: section_5 -->

## Compliance Level Overview

### CMMC Level Classifications

#### Level 1: Basic Cyber Hygiene

**Definition**:
- Foundational cybersecurity practices
- 15 basic safeguarding controls from FAR 52.204-21
- NIST SP 800-171 foundational principles

**Assessment Method**:
- Self-assessment by contractor
- No third-party required
- Documentation reviewed by contracting officer
- No scoring numeric (compliance yes/no)

**Appropriate For**:
- Contractors with FCI (Federal Contractor Information) only
- No CUI (Controlled Unclassified Information) access
- Low-risk contract work
- Optional for most DoD contracts

**SPRS Posting**:
- Level 1 certification
- Self-assessment date
- Expiration date (3 years from assessment)
- Supporting documentation

#### Level 2: Intermediate Cyber Hygiene

**Definition**:
- Repeatable processes and documented controls
- NIST SP 800-171 full control set (110 controls)
- Third-party validated assessment
- Score-based determination (typically 80%+ required)

**Assessment Method**:
- C3PAO assessment (third-party independent)
- DACM scoring methodology
- Remote or on-site assessment
- Comprehensive control evaluation

**Appropriate For**:
- Contractors with CUI access
- Defense contractors
- Weapons systems and technical data
- Sensitive federal work
- Standard DoD contract requirement

**SPRS Posting**:
- Level 2 certification
- Assessment score (80%+)
- Certification status (Conditional or Final)
- C3PAO information
- POA&M status (if conditional)
- Expiration date (3 years)

#### Level 3: Advanced/Optimized Cyber Hygiene

**Definition**:
- Advanced threat resilience
- Full NIST SP 800-171 with enhanced APT controls
- Continuous monitoring and adaptation
- Score-based determination (typically 85%+ required)

**Assessment Method**:
- C3PAO assessment with potential government involvement
- Enhanced DACM procedures
- Advanced threat focus
- Potentially more rigorous assessment

**Appropriate For**:
- Contractors with access to Advanced Persistent Threat (APT) sensitive information
- Special access programs
- Critical defense contractors
- High-risk sensitive work

**SPRS Posting**:
- Level 3 certification
- Enhanced assessment score (85%+)
- Certification status
- Advanced threat focus documentation
- Enhanced POA&M if conditional
- Expiration date (3 years)

### Assessment Level Determination

**How CMMC Level Is Determined**:

1. **Contract Requirements**: Contract specifies required CMMC level
2. **Information Sensitivity**: Type of information drives level requirement
3. **Risk Assessment**: Government evaluates risk and determines level
4. **Contractor Proposal**: Contractor certifies ability to meet level
5. **Assessment Results**: Actual compliance verified through assessment

**Common Assignment**:
- **Level 1**: Small contractors, FCI only, lower-risk work
- **Level 2**: Most DoD contractors, CUI access, standard requirement
- **Level 3**: Sensitive programs, Advanced Persistent Threat information, special access

<!-- chunk: section_6 -->

## Point-in-Time Scoring and Validity

### Assessment Score Validity Period

#### Three-Year Certification Validity

**Validity Duration**:
- Certification valid for 3 years from assessment date
- Expiration date automatically calculated in SPRS
- Contractors notified of approaching expiration
- Renewal assessment must begin before expiration

**Continuous Compliance Obligation**:
- While certification valid, contractor must maintain compliance
- No relaxation of controls upon certification
- Government expects continuous compliance between assessments
- Material changes must be reported to contracting officer

**Renewal Planning**:
- Assessment planning should begin 6 months before expiration
- C3PAO scheduling should start 9-12 months before expiration
- New assessment completed before or immediately after expiration
- Gap in certification avoided through careful planning

#### Interim Changes Affecting Compliance

**Material Changes Requiring Notification**:
- Significant system changes (new applications, infrastructure)
- Major personnel changes affecting security roles
- Facility changes or relocations
- Security incidents affecting compliance
- Acquisition or merger affecting company structure
- Loss of key personnel
- Infrastructure or security tool changes

**Notification Procedures**:
- Notify contracting officer within 30 days
- Provide detailed description of change
- Assess impact on compliance
- Develop remediation if compliance affected
- Update SPRS if needed
- May require revised assessment if major impact

### Assessment Age Considerations

#### Recent Assessment Advantages

**Benefits of Current Assessment**:
- Demonstrates current compliance state
- More favorable risk assessment
- Stronger source selection advantage
- Better prospects for contract awards
- Reduced compliance verification burden

**Assessment Timing Strategy**:
- Schedule assessment early in contract year
- Avoid assessment just before expiration (may expire during renewal)
- Consider contract timing when scheduling
- Plan for post-remediation assessment if significant gaps identified

#### Expiring Certifications

**Approaching Expiration**:
- SPRS highlights certifications approaching 90-day expiration window
- Contractors should begin renewal planning at 6-month mark
- Contracting officers may require updated assessment before contract renewal
- Non-renewal may affect contract continuation

## Cross-References

### SPRS Information

- **SPRS Portal**: https://www.sprs.csd.dod.mil
- **SPRS Help/Support**: https://www.sprs.csd.dod.mil/support
- **SPRS User Guide**: Available through SPRS portal
- **Status Page**: Real-time status updates

### Related CMMC/NIST Documents

- **DFARS 252.204-7021**: CMMC Requirements clause
- **32 CFR Part 170**: CMMC Program Rule
- **NIST SP 800-171**: Security Controls (baseline for Level 2/3)
- **NIST SP 800-171A**: Assessment Procedures (basis for DACM)
- **DoD Assessment Methodology**: DACM scoring procedures

### CMMC Program Resources

- **Cyber AB**: CMMC Accreditation Body (C3PAO authorization)
- **CMMC Marketplace**: C3PAO and practitioner directory
- **DoD CIO CMMC Hub**: Official guidance and resources
- **Contractor Training**: CMMC fundamentals and procedures

<!-- chunk: section_7 -->

## Common SPRS Issues and Solutions

### Issue 1: Account Access Problems

**Problem**: Contractor unable to access SPRS portal

**Solutions**:
- Verify credentials and password reset if needed
- Check multi-factor authentication setup
- Contact SPRS support team
- Allow 5-7 business days for new account provisioning
- Verify company registration in federal systems

### Issue 2: Posting Delays

**Problem**: Assessment results not posted timely to SPRS

**Solutions**:
- Confirm assessment completion date
- Verify all required documentation available
- Check for data entry errors preventing submission
- Contact C3PAO if assessment report delayed
- Notify contracting officer of delay

### Issue 3: Score Discrepancy

**Problem**: SPRS shows different score than assessment report

**Solutions**:
- Verify correct assessment uploaded to SPRS
- Confirm score transcribed correctly
- Check for partial credit scoring differences
- Contact C3PAO to clarify scoring
- Request SPRS correction if transcription error

### Issue 4: POA&M Tracking Issues

**Problem**: POA&M progress not accurately reflected in SPRS

**Solutions**:
- Establish regular POA&M update schedule
- Coordinate updates between contractor and C3PAO
- Document all POA&M closure evidence
- Request validation from C3PAO before closure
- Track SPRS updates to confirm posting

### Issue 5: Expiration Management

**Problem**: Contractor fails to renew assessment before expiration

**Solutions**:
- Establish calendar alerts 6 months before expiration
- Begin assessment planning at 9-month mark
- Schedule C3PAO early to avoid waiting lists
- Track renewal progress in contract file
- Notify contracting officer of renewal status

---

**Document Status**: Reference summary for knowledge management. For current SPRS information, access the portal at https://www.sprs.csd.dod.mil
