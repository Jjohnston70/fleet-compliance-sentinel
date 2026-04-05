---
title: "DFARS 252.204-7021 - CMMC Requirements (Phased Implementation)"
source_url: "https://www.acq.osd.mil/asda/dpc/cp/cc/DFARS_PGI_Overview.html"
source_type: web-reference
captured: "2026-03-07"
chunk_strategy: section-level
note: "Reference summary - verify against source for latest amendments. CMMC effective under 32 CFR Part 170"
---

# DFARS 252.204-7021 Clause Reference

## Overview

DFARS 252.204-7021 implements the Cybersecurity Maturity Model Certification (CMMC) program into DoD acquisition requirements. This clause requires contractors and subcontractors to achieve and maintain CMMC certification at levels appropriate to contract requirements and federal regulations.

<!-- chunk: section_1 -->

## Clause Structure and Components

### Mandatory Flow-Down Language

The clause establishes binding contractual obligations requiring:

1. **Contractor Self-Assessment or C3PAO Assessment**: Based on CMMC level requirement
2. **SPRS Posting**: Assessment results posted to Supplier Performance Risk System
3. **Certification Maintenance**: Ongoing compliance through continuous monitoring and assessment renewal
4. **Subcontractor Accountability**: Flow-down to all supply chain participants
5. **Affirmation Requirements**: Annual attestation of compliance status

### Incorporation by Reference

The clause incorporates by reference:
- **NIST SP 800-171**: Security controls baseline
- **NIST SP 800-171A**: Assessment procedures
- **CMMC Model Documentation**: Level definitions, control mappings
- **DoD Assessment and Certification Methodology**: Scoring algorithms and procedures

<!-- chunk: section_2 -->

## CMMC Level Determination

### Three-Level Model

The CMMC program consists of three maturity levels:

#### CMMC Level 1: Basic Cyber Hygiene

**Applicability**:
- Contractors with CUI (Controlled Unclassified Information) but no sensitive DoD data
- Optional for contractors with FCI (Federal Contractor Information) only

**Assessment Method**:
- Self-assessment by contractor
- No C3PAO required
- Documentation review by contracting officer

**Control Scope**:
- 15 basic security practices from FAR 52.204-21
- Focus on foundational cybersecurity practices
- Covers access control, identification, authentication, incident handling

**Timeline Requirements**:
- Self-assessment completed before contract performance
- Results posted to SPRS
- Valid for 3 years

#### CMMC Level 2: Intermediate Cyber Hygiene

**Applicability**:
- Primary requirement for most DoD contractors with access to CUI
- Contractors performing work with weapons systems or technical data
- Default requirement if contract does not specify higher level

**Assessment Method**:
- **Self-Assessment Option**: For initial certification (Phase 1, Nov 2025)
- **C3PAO Assessment**: Required for all new certifications (Phase 2 onwards, Nov 2026)
- Third-party independent assessment
- Remote or on-site evaluation options (with contracting officer approval)

**Control Scope**:
- 85-95 security practices from NIST SP 800-171
- Organizational and system-level controls
- Focus on managing identified risks and building repeatable processes
- Documented security practices and procedures

**Assessment Scoring**:
- Conducted using DoD Assessment and Certification Methodology (DACM)
- 110 total assessment points (weighted scoring)
- Passing score: Demonstrated achievement of controls
- POA&M required for non-compliant controls

**Timeline Requirements**:
- C3PAO assessment completed within 12 months of award for Phase 1 contractors
- Certification valid for 3 years
- Annual surveillance assessments may be conducted

#### CMMC Level 3: Advanced/Optimized Cyber Hygiene

**Applicability**:
- Contractors with access to Advanced Persistent Threat (APT) sensitive information
- Special access programs and acquisition strategies
- Specific high-risk contract requirements designated by DoD

**Assessment Method**:
- **C3PAO Assessment**: Mandatory
- Enhanced assessment procedures with advanced threat focus
- Potential for government assessment involvement
- Covers organization-wide and mission-critical system controls

**Control Scope**:
- Full NIST SP 800-171 implementation (110+ controls)
- Advanced measures for APT resilience
- Threat intelligence integration
- Supply chain risk management specific requirements

**Assessment Scoring**:
- Uses enhanced DACM procedures
- Focus on advanced persistent threat mitigation
- Continuous monitoring and adaptive security measures
- Higher performance metrics for control achievement

**Timeline Requirements**:
- C3PAO assessment within 9-12 months of award
- More frequent surveillance (annual or semi-annual)
- Certification valid for 3 years

<!-- chunk: section_3 -->

## Self-Assessment Requirements (CMMC Level 1 and Initial Level 2)

### Self-Assessment Procedures

#### Scope Definition

Contractors conducting self-assessment must:
1. Identify all information systems processing, storing, or transmitting CUI
2. Define assessment scope boundaries
3. Determine environmental factors and risk contexts
4. Establish baseline system security posture

#### Control Evaluation

Self-assessment evaluates each applicable control against:
- **Implementation Maturity**: Control fully documented and operationalized
- **Effectiveness**: Control achieving intended security objective
- **Consistency**: Control applied uniformly across systems
- **Continuity**: Control sustained over assessment period

#### Documentation Requirements

Contractors must prepare:
- **System Security Plan (SSP)**: Describes system architecture, data flows, controls
- **Control Implementation Narratives**: For each control, how it is implemented
- **Artifacts and Evidence**: Supporting documentation of control operation
- **Assessment Summary Report**: Overall assessment findings and status
- **POA&M**: For any control deficiencies or gaps

#### Assessment Timeline

- Self-assessment conducted as part of contract proposal or within specified timeframe
- Results documented and maintained for audit
- Contracting officer may require presentation/review of assessment
- Results posted to SPRS prior to contract performance

### Self-Assessment Limitations

Self-assessments are interim measures with known limitations:

1. **Objectivity**: Contractor assesses own compliance (potential bias)
2. **Verification**: No independent third-party verification
3. **Scope**: Limited to systems contractor identifies
4. **Depth**: Less rigorous than C3PAO assessment
5. **Acceptance**: Serves as interim certification until C3PAO assessment possible

<!-- chunk: section_4 -->

## C3PAO Assessment Requirements (CMMC Level 2 and 3)

### C3PAO Authorization and Roles

#### Certified C3PAO Organizations

**Definition**: Cybersecurity Maturity Model Certification Accredited Practitioners (C3PAOs) are independent, third-party assessment organizations authorized by the Cyber AB to conduct CMMC assessments.

**Authorization Process**:
- Organizational application to Cyber AB
- Technical capability demonstration
- Financial viability verification
- Insurance requirements (E&O, General Liability)
- Training and certification of assessment team

**Oversight**:
- Cyber AB maintains registry of authorized C3PAOs
- Annual re-authorization reviews
- Performance monitoring and quality assurance
- Deauthorization for non-compliance

#### C3PAO Responsibilities

1. **Assessment Conduct**: Execute assessment per DACM procedures
2. **Objectivity**: Maintain independence and impartiality
3. **Professionalism**: Adhere to ethics and conduct standards
4. **Documentation**: Maintain assessment working papers
5. **Reporting**: Provide assessment results and findings
6. **Confidentiality**: Protect sensitive assessment information

### Assessment Procedures and Scope

#### Pre-Assessment Activities

1. **Contract Review**: C3PAO reviews contract requirements and statement of work
2. **Scope Discussion**: Contractor identifies systems and boundaries
3. **System Categorization**: Assessment team determines FIPS 199 categorization
4. **Resource Planning**: Assessment duration and resource estimates
5. **Schedule Coordination**: Assessment timing and contractor access

#### On-Site Assessment Activities

1. **Kickoff Meeting**: Introduction, roles, assessment procedures
2. **System Architecture Review**: Documentation of systems, data flows, interconnections
3. **Control Testing**:
   - Document review (policies, procedures, plans)
   - Interview with responsible personnel
   - Observation of implemented controls
   - Testing and validation of control effectiveness
4. **Risk Assessment**: Identification of vulnerabilities and control gaps
5. **Evidence Collection**: Gathering and documenting assessment evidence

#### Assessment Interviews and Evidence

**Interview Scope**:
- System administrators and security personnel
- Network and application owners
- Compliance and audit staff
- Management responsible for controls
- End users and security awareness

**Evidence Types**:
- Signed policies and procedures (with dates)
- System security plans and architecture diagrams
- Configuration documentation and baseline standards
- Logs, audit trails, and monitoring records
- Training records and security awareness materials
- Vulnerability scan reports and remediation evidence
- Access control lists and privilege reviews
- Incident reports and response procedures

#### Control Determination Process

For each control in the assessment scope:

1. **Examine**: Review evidence of control implementation
2. **Interview**: Discuss with practitioners and management
3. **Test**: Verify control operation and effectiveness
4. **Determine**: Establish control compliance status
5. **Document**: Record findings and supporting evidence

**Possible Control Statuses**:
- **Compliant**: Control fully implemented and effective
- **Non-Compliant**: Control missing, incomplete, or ineffective
- **Not Applicable**: Control not relevant to assessed system

#### POA&M Development for Non-Compliant Controls

For any non-compliant controls, C3PAO and contractor develop:
- **Control Description**: What control is required
- **Current State**: Description of gap or deficiency
- **Remediation Approach**: Plan to achieve compliance
- **Responsible Party**: Individual accountable for closure
- **Target Completion Date**: Reasonable timeframe (typically 90-180 days)
- **Validation Procedure**: How compliance will be verified
- **Contingencies**: Alternative approaches if primary plan fails

### Assessment Scoring and Results

#### Scoring Methodology (DACM)

The DoD Assessment and Certification Methodology assigns:

**Point Distribution**:
- Total Assessment Points: 110 (organized into control families)
- Control Weights: Weighted 1 point, 3 points, or 5 points based on importance
- System Configuration Points: Additional points for system-level risk factors

**Scoring Calculation**:
1. Sum all points achieved for fully-compliant controls
2. Apply weighting adjustments
3. Calculate percentage: (Achieved Points / Total Points) × 100
4. Determine compliance level against threshold

**Passing Thresholds**:
- **Level 2**: Typically 80% or higher compliance
- **Level 3**: Typically 85% or higher compliance (or higher standards for APT controls)

#### Assessment Report Contents

The C3PAO provides a comprehensive assessment report including:

1. **Executive Summary**
   - Overall compliance status
   - Key findings and observations
   - Recommendations

2. **Assessment Results**
   - Control-by-control status (compliant/non-compliant)
   - Point scores and percentage
   - System scope and boundaries

3. **Detailed Findings**
   - Description of each non-compliance
   - Risk implications
   - Evidence supporting determination

4. **Plan of Action and Milestones (POA&M)**
   - All non-compliant controls with remediation plans
   - Timeline for closure (within 180 days)

5. **Recommendations**
   - Additional controls or enhancements
   - Best practices
   - Continuous improvement opportunities

### Post-Assessment Validation

#### Conditional vs. Final Certification

**Conditional Certification**:
- Issued when contractor has POA&M for non-compliant controls
- Allows contract performance to proceed
- Contractor must close all POA&M items within 180 days
- Government conducts post-assessment verification

**Final Certification**:
- Issued when all controls compliant and POA&M closed
- No conditions or caveats
- Full 3-year validity period

#### POA&M Closure and Validation

1. **Contractor Implementation**: Performs remediation per POA&M
2. **Evidence Submission**: Provides documentation of completed actions
3. **Validation Review**: C3PAO or contracting officer reviews evidence
4. **Acceptance**: Official POA&M closure
5. **Final Certification**: Upon closure of all POA&M items

#### Certification Validity

- **Duration**: 3 years from assessment date
- **Renewal**: Must be reassessed before expiration
- **Continuity**: Planning for next assessment should begin 6 months before expiration
- **Interim Changes**: Contractor must notify contracting officer of material changes

<!-- chunk: section_5 -->

## SPRS Posting Requirements

### Supplier Performance Risk System Overview

**Purpose**: SPRS is the DoD database for tracking contractor CMMC and cybersecurity assessment results.

**Contractor Access**:
- Contractors maintain own SPRS data
- Can update compliance status
- View history of assessments
- Access own documents and certifications

**Government Access**:
- Contracting officers review SPRS for compliance verification
- Government can view compliance status and certification
- Used in source selection and contract award decisions
- Risk assessment and oversight tool

### Required SPRS Postings

#### Assessment Result Submission

Contractors must post to SPRS:

1. **Assessment Type**
   - Self-assessment (Level 1, interim Level 2)
   - C3PAO assessment (Level 2, Level 3)

2. **Assessment Date**
   - Completion date of assessment
   - C3PAO signature date on assessment report

3. **CMMC Level Achieved**
   - Level 1, 2, or 3
   - Status (Conditional or Final)

4. **Expiration Date**
   - 3 years from assessment date
   - Reminder dates for renewal planning

5. **Supporting Documentation**
   - Assessment report (summary or full, per guidance)
   - C3PAO authorization letter
   - POA&M (for conditional certifications)

#### Posting Timeline

- **Level 1 Self-Assessment**: Posted before contract performance begins
- **C3PAO Assessment**: Posted within 30 days of assessment completion
- **POA&M Updates**: Posted as milestones achieved and items closed
- **Renewal Assessments**: Posted prior to expiration of previous certification

### SPRS Roles and Permissions

**Contractor Responsibilities**:
- Maintain current and accurate information
- Update status changes promptly
- Respond to government inquiries through SPRS
- Ensure compliance with posting timeline requirements

**Government Access and Use**:
- Contracting officers use SPRS to verify compliance
- Source selection teams review SPRS for proposal evaluation
- Compliance verification conducted against SPRS records
- Non-compliance tracked for enforcement action

<!-- chunk: section_6 -->

## Subcontractor Flowdown Requirements

### Mandatory Subcontractor Coverage

#### Subcontractor Identification

Contractors must identify all subcontractors that:
- Will access CUI
- Will process, store, or transmit CUI
- Will provide services on DoD information systems
- Will access contractor information systems with CUI

#### Flowdown Clause Application

The prime contractor must flow down DFARS 252.204-7021 to:
1. All identified subcontractors with CUI access
2. All lower-tier subcontractors in the supply chain
3. All subcontractors without size threshold limitations

#### Level Determination for Subcontractors

**Prime Contractor Responsibility**: Determining appropriate CMMC level for subcontractors:

- **Same Level as Prime**: If subcontractor has significant CUI access/processing
- **Lower Level**: If subcontractor has limited CUI access (Level 1 may be appropriate)
- **No Requirement**: Only if subcontractor has no CUI access and not on DoD systems

### Subcontractor Assessment Requirements

#### Self-Assessment for Subcontractors

- Subcontractors may conduct self-assessments if assigned Level 1
- Documentation required to prime contractor
- Prime contractor retains assessment records
- Included in compliance verification

#### C3PAO Assessment for Subcontractors

- Subcontractors assigned Level 2 or 3 must be C3PAO assessed
- Assessment conducted per same DACM procedures as prime
- C3PAO reports to prime contractor and subcontractor
- Assessment results posted to SPRS by subcontractor or prime

#### Prime Contractor Oversight

Prime contractor responsible for:
1. Communicating CMMC level requirements to subcontractors
2. Establishing compliance timeline and milestones
3. Receiving and reviewing assessment results
4. Verifying subcontractor compliance status
5. Tracking subcontractor POA&M closure
6. Reporting subcontractor non-compliance to contracting officer
7. Ensuring flowdown to lower-tier subcontractors

### Supply Chain Compliance Verification

#### Compliance Roll-Up

Prime contractor must maintain and provide to government:
- List of all subcontractors with CUI access
- CMMC level assigned to each subcontractor
- SPRS reference for each subcontractor's assessment
- Status of each subcontractor (Compliant, Non-Compliant, POA&M In Progress)
- Escalation of subcontractor non-compliance

#### Subcontractor Performance Monitoring

Prime contractor establishes procedures for:
- Quarterly or annual compliance reviews
- Communication of assessment renewal requirements
- Tracking POA&M status and closure
- Notification of material changes affecting compliance
- Performance evaluation considering cybersecurity maturity

#### Contract Remedies for Non-Compliance

Prime contractor may implement:
- Subcontractor notification of compliance requirement
- Compliance timeframe establishment
- Escalation to subcontractor management
- Work suspension if non-compliance continues
- Contract termination for non-compliance
- Subcontractor replacement with compliant vendor

<!-- chunk: section_7 -->

## Affirmation Requirements and Attestation

### Annual Compliance Affirmation

#### Affirmation Obligation

Contractors must annually (or as specified in contract) provide:
- Written affirmation of CMMC compliance status
- Certification by authorized official (president, CEO, facility security officer)
- Identification of any material changes affecting compliance
- Updated SPRS information

#### Affirmation Content

The affirmation statement must include:

1. **Compliance Status**: "We affirm that [Company Name] maintains CMMC Level [X] certification"
2. **Assessment Status**: Description of most recent assessment and results
3. **Continuity**: Affirmation that controls remain in place and operative
4. **Changes**: Any material changes affecting cybersecurity posture
5. **Renewal Plans**: Planned timing for next assessment and renewal
6. **Accuracy**: Affirmation of truthfulness and accuracy of statement

#### Signatory Requirements

- Authorized representative with authority to bind organization
- Typically president, CEO, or facility security officer
- May require notarization per contract terms
- Signature demonstrates personal knowledge and accountability

#### Contracting Officer Review

- Contracting officer reviews affirmation
- May request additional information or clarification
- May conduct verification activities
- Documents review in contract file

### Representation and Warranty

The affirmation serves as a contractor representation and warranty that:
- Information provided is accurate and complete
- Assessment results fairly represent compliance status
- Controls continue to operate as assessed
- Contractor aware of obligation to comply with CMMC requirements

**Contractor Liability**: False affirmations may constitute fraud and expose contractor to:
- Contract termination for default
- Liability for damages
- Debarment from future DoD contracts
- Criminal prosecution (in cases of intentional fraud)

<!-- chunk: section_8 -->

## Phased Implementation Timeline

### Phase 1: Foundation (November 2025 - October 2026)

**Scope**:
- Contractors with current DoD contracts
- New contracts with significant CUI access
- Initial assessment activity begins

**Requirements**:
- CMMC Level 1: Required for basic contracts
- CMMC Level 2: Required for most CUI contractors (self-assessment option available)
- CMMC Level 3: By invitation for special access programs

**Actions**:
- Self-assessments conducted for Level 1
- Interim self-assessments allowed for Level 2 (while C3PAO capacity built)
- SPRS posting of initial assessments
- Initial compliance verification

### Phase 2: Transition (November 2026 - October 2027)

**Scope**:
- Broader contractor base reaches assessment readiness
- C3PAO assessment capacity increases
- Enforcement mechanisms activate

**Requirements**:
- CMMC Level 1: No change
- CMMC Level 2: C3PAO assessment required (no more self-assessments for new certifications)
- CMMC Level 3: Expanded requirement for sensitive contract areas

**Actions**:
- C3PAO assessments increase significantly
- Contractor remediation and POA&M closure
- Compliance verification increases
- Non-compliance consequences begin

### Phase 3: Maturation (November 2027 - October 2028)

**Scope**:
- Broader supply chain compliance
- Subcontractor assessments accelerate
- Continuous improvement focus

**Requirements**:
- CMMC Level 1: Baseline for all contractors
- CMMC Level 2: Standard for most CUI contractors
- CMMC Level 3: High-risk and special programs

**Actions**:
- Renewal assessments for Phase 1 contractors
- Increased subcontractor assessment activity
- Supply chain risk management emphasis
- Performance monitoring and trending

### Phase 4: Full Implementation (November 2028 onwards)

**Scope**:
- Mature CMMC program in force
- Complete supply chain compliance
- Continuous certification

**Requirements**:
- CMMC Level 1: All contractors with federal data
- CMMC Level 2: Standard DoD contractor requirement
- CMMC Level 3: Special access and sensitive programs

**Actions**:
- Continuous cycle of assessments and renewals
- Integrated into source selection process
- Performance metrics and trending
- Advanced threat focus and adaptation

### Compliance Deadline Summary

| Phase | Start Date | End Date | Key Requirement |
|-------|-----------|----------|-----------------|
| Phase 1 | Nov 2025 | Oct 2026 | Self-assessment option; Level 1/2 required |
| Phase 2 | Nov 2026 | Oct 2027 | C3PAO assessment mandatory; No self-assessment |
| Phase 3 | Nov 2027 | Oct 2028 | Subcontractor compliance; Renewal assessments |
| Phase 4 | Nov 2028 | Ongoing | Full program maturity; Continuous certification |

<!-- chunk: section_9 -->

## Common Implementation Issues and Solutions

### Issue 1: Scope Definition Ambiguity

**Problem**: Unclear which systems/data fall within assessment scope

**Solutions**:
- Conduct thorough review of contract requirements and statement of work
- Work with C3PAO to establish boundaries early (pre-assessment)
- Document scope definition in System Security Plan
- Ensure scope includes all systems processing or storing CUI

### Issue 2: POA&M Closure Delays

**Problem**: Contractor unable to close non-compliant controls within 180-day window

**Solutions**:
- Develop detailed remediation plan with realistic timelines
- Assign adequate resources and budget for remediation
- Establish oversight and tracking procedures
- Communicate regularly with contracting officer on progress
- Request timeline extension if justified (must be requested in writing)

### Issue 3: Subcontractor Non-Compliance

**Problem**: Subcontractors fail to achieve required CMMC level

**Solutions**:
- Establish clear requirements and timelines in subcontract language
- Provide compliance support and resources
- Conduct regular monitoring and reviews
- Escalate to subcontractor management if needed
- Plan for subcontractor replacement if non-compliance continues

### Issue 4: Assessment Readiness

**Problem**: Systems not ready for C3PAO assessment; gaps and gaps discovered during assessment

**Solutions**:
- Conduct internal pre-assessment review
- Address known gaps before C3PAO assessment
- Develop POA&M for any remaining gaps identified during formal assessment
- Plan for adequate timeline between assessment and contract performance

<!-- chunk: section_10 -->

## Cross-References and Related Requirements

### Related DFARS Clauses

- **DFARS 252.204-7012**: Safeguarding CDI and Cyber Incident Reporting
- **DFARS 252.204-7019**: Notice of CMMC Requirement
- **DFARS 252.204-7020**: CMMC Compliance and Reporting

### FAR and Regulatory References

- **FAR 52.204-21**: Basic Safeguarding of Covered Contractor Information Systems (15 controls)
- **NIST SP 800-171**: Security and Privacy Controls for Nonfederal Information Systems
- **NIST SP 800-171A**: Assessing Security and Privacy Controls for Nonfederal Information Systems
- **32 CFR Part 170**: Cybersecurity Maturity Model Certification (CMMC) Program

### CMMC Program Resources

- **Cyber Accreditation Body (Cyber AB)**: CMMC governance and C3PAO authorization
- **CMMC Marketplace**: Lists authorized C3PAOs and assessment practitioners
- **DoD CIO CMMC Resources**: Official guidance and documentation
- **SPRS Portal**: Contractor assessment posting and government review

## Amendment History

- **Initial Issue**: DFARS 252.204-7021 implemented to establish CMMC as contractual requirement
- **Phase 1 Update**: Incorporated phased implementation timeline (Nov 2025 start)
- **Current Status**: Fully integrated into 32 CFR Part 170 regulatory framework
- **Next Review**: Anticipated updates as program matures and C3PAO capacity grows

---

**Document Status**: Reference summary for knowledge management. For authoritative information, consult current DFARS updates, 32 CFR Part 170, and DoD CIO CMMC Resources at https://www.dod.gov/cmmc
