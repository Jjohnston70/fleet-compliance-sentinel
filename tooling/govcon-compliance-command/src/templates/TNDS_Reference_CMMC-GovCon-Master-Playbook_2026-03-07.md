# CMMC Operational Readiness Package -- Master Reference & Gap Analysis

**True North Data Strategies**
**Prepared:** 2026-03-07
**Purpose:** Complete regulatory source map, gap analysis against existing TNDS documentation, and SMB readiness framework for building a fixed-scope CMMC Operational Readiness Package

---

## Section 1: The Regulatory Chain of Authority

Every requirement for CMMC compliance traces back through a specific legal chain. You need to know this chain cold because clients will ask "why do I have to do this?" and the answer is always a citation, not an opinion.

### 1.1 The Legal Hierarchy (Top to Bottom)

```
Executive Order 13556 (CUI Program, 2010)
    |
    v
32 CFR Part 2002 (CUI Implementation by NARA)
    |
    v
Federal Acquisition Regulation (FAR) -- applies to ALL federal contracts
    |-- FAR 52.204-21 (Basic Safeguarding -- 15 controls for FCI)
    |
    v
Defense Federal Acquisition Regulation Supplement (DFARS) -- DoD-specific
    |-- DFARS 252.204-7012 (Safeguarding CDI + Cyber Incident Reporting)
    |-- DFARS 252.204-7021 (CMMC Requirements -- the enforcement clause)
    |
    v
32 CFR Part 170 (CMMC Program Rule -- effective Dec 16, 2024)
    |
    v
NIST SP 800-171 Rev 2 (110 controls, 320 assessment objectives)
NIST SP 800-171A (Assessment procedures for those 320 objectives)
NIST SP 800-172 (Enhanced requirements -- Level 3 only)
    |
    v
DoD Assessment Methodology v1.2.1 (SPRS scoring -- weighted controls)
CMMC Assessment Guide Level 2 v2.13 (What assessors actually check)
CMMC Scoping Guide Level 2 (What's in scope, what's not)
```

### 1.2 What Each Link in the Chain Does

**Executive Order 13556** -- Created the CUI program. Established that unclassified but sensitive government information needs standardized protection. This is the root authority for everything that follows.

**32 CFR Part 2002** -- NARA's implementation of the CUI program. Defines categories, marking requirements, handling procedures. The CUI Registry at archives.gov/cui is the authoritative list of what counts as CUI.

**FAR 52.204-21** -- The baseline for every federal contractor. 15 basic safeguarding controls for Federal Contract Information (FCI). This is CMMC Level 1. If you touch any federal contract data, you comply with this. No exceptions, no assessment needed beyond self-certification.

**DFARS 252.204-7012** -- The DoD-specific cybersecurity clause that's been in contracts since 2017. Requires NIST 800-171 implementation for CUI. Requires 72-hour cyber incident reporting to DoD. Requires forensic preservation. Requires subcontractor flow-down. This is the enforcement mechanism that existed before CMMC.

**DFARS 252.204-7021** -- The CMMC clause. Added to contracts starting November 10, 2025. Requires contractors to have verified CMMC certification at the specified level before contract award. This is the clause that makes CMMC a gate, not a suggestion.

**32 CFR Part 170** -- The CMMC program rule itself. Published October 15, 2024, effective December 16, 2024. Defines the three levels, the assessment types, the phased rollout, the POA&M rules, the affirmation requirements, and the False Claims Act exposure.

**NIST SP 800-171 Rev 2** -- The 110 security requirements that are CMMC Level 2. Organized into 14 control families. This is the standard your client's operational infrastructure must satisfy. CMMC 2.0 locks to Rev 2 (not Rev 3) for now.

**NIST SP 800-171A** -- The assessment guide. Expands those 110 controls into 320 assessment objectives. This is what C3PAO assessors actually evaluate. Each control has multiple "determine if" statements that must all be satisfied.

**DoD Assessment Methodology v1.2.1** -- The scoring methodology for SPRS. Maximum score is 110. Each of the 110 controls has a weighted point value (1, 3, or 5). Non-compliance subtracts that value. 42 controls are worth 5 points each. The minimum viable score is typically 110 with an active POA&M for any gaps.

---

## Section 2: Complete Source Document Library

Every document listed below is required reading to build and deliver a CMMC Operational Readiness Package. Organized from most critical to supporting reference.

### 2.1 Tier 1 -- Must Read and Internalize (Core Regulatory Documents)

| # | Document | URL | Why You Need It |
|---|----------|-----|-----------------|
| 1 | **32 CFR Part 170** (CMMC Program Rule) | [eCFR](https://www.ecfr.gov/current/title-32/subtitle-A/chapter-I/subchapter-G/part-170) | The actual regulation. Every requirement traces here. |
| 2 | **NIST SP 800-171 Rev 2** (CUI Security Requirements) | [NIST CSRC](https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final) / [PDF](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-171r2.pdf) | The 110 controls. The foundation of Level 2. |
| 3 | **NIST SP 800-171A** (Assessment Procedures) | [NIST CSRC](https://csrc.nist.gov/pubs/sp/800/171/a/final) / [Assessment Spreadsheet (XLSX)](https://csrc.nist.gov/files/pubs/sp/800/171/a/final/docs/sp800-171a-assessment-procedures.xlsx) | The 320 assessment objectives. What assessors actually check. |
| 4 | **CMMC Assessment Guide Level 2 v2.13** | [DoD CIO PDF](https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL2v2.pdf) | How C3PAO assessments work. Evidence requirements. MET/NOT MET criteria. |
| 5 | **CMMC Scoping Guide Level 2** | [DoD CIO PDF](https://dodcio.defense.gov/Portals/0/Documents/CMMC/ScopingGuideL2v2.pdf) | Asset categories, boundary definition, what's in scope. |
| 6 | **CMMC Model Overview v2.13** | [DoD CIO PDF](https://dodcio.defense.gov/Portals/0/Documents/CMMC/ModelOverview.pdf) | The official model description. Three levels, requirements summary. |
| 7 | **DoD Assessment Methodology v1.2.1** | [DoD PDF](https://www.acq.osd.mil/asda/dpc/cp/cyber/docs/safeguarding/NIST-SP-800-171-Assessment-Methodology-Version-1.2.1-6.24.2020.pdf) | SPRS scoring. Weighted control values. How the score is calculated. |
| 8 | **DFARS 252.204-7012** (Safeguarding CDI) | [Acquisition.gov](https://www.acquisition.gov/dfars/252.204-7012-safeguarding-covered-defense-information-and-cyber-incident-reporting.) | The existing cybersecurity clause. 72-hour reporting. Flow-down. |
| 9 | **DFARS 252.204-7021** (CMMC Requirements) | [Federal Register](https://www.federalregister.gov/documents/2025/09/10/2025-17359/defense-federal-acquisition-regulation-supplement-assessing-contractor-implementation-of) | The CMMC enforcement clause added to contracts. |
| 10 | **FAR 52.204-21** (Basic Safeguarding) | [Acquisition.gov](https://www.acquisition.gov/far/52.204-21) | The 15 basic controls. CMMC Level 1 baseline. |

### 2.2 Tier 2 -- Required Reference (Supporting Standards)

| # | Document | URL | Why You Need It |
|---|----------|-----|-----------------|
| 11 | **NIST SP 800-53 Rev 5** (Security & Privacy Controls) | [NIST CSRC](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) | Parent control catalog. 800-171 derives from this. Needed for FedRAMP mapping. |
| 12 | **NIST SP 800-172** (Enhanced Security Requirements) | [NIST CSRC](https://csrc.nist.gov/pubs/sp/800/172/r3/ipd) | Level 3 requirements. 24 selected controls for high-value assets. |
| 13 | **CMMC Assessment Guide Level 1 v2.13** | [DoD CIO PDF](https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL1v2.pdf) | Level 1 self-assessment procedures. Useful for FCI-only subcontractors. |
| 14 | **NIST SP 800-171 CUI SSP Template** | [NIST CSRC (DOCX)](https://csrc.nist.gov/files/pubs/sp/800/171/r2/upd1/final/docs/cui-ssp-template-final.docx) | Official NIST SSP template. Starting point for client SSPs. |
| 15 | **NIST SP 800-171 POA&M Template** | [NIST CSRC (DOCX)](https://csrc.nist.gov/CSRC/media/Publications/sp/800-171/rev-2/final/documents/CUI-Plan-of-Action-Template-final.docx) | Official POA&M template. Track unimplemented controls. |
| 16 | **32 CFR Part 2002** (CUI Program) | [eCFR](https://www.ecfr.gov/current/title-32/subtitle-B/chapter-XX/part-2002) | CUI marking and handling requirements. |
| 17 | **CUI Registry** | [NARA Archives](https://www.archives.gov/cui) | Authoritative list of CUI categories. Clients need to know which CUI types they handle. |
| 18 | **CUI Marking Handbook** | [NARA PDF](https://www.archives.gov/files/cui/20161206-cui-marking-handbook-v1-1.pdf) | How to properly mark CUI documents. |
| 19 | **SPRS Portal** | [SPRS](https://www.sprs.csd.disa.mil/nistsp.htm) | Where scores get submitted. Clients need accounts here. |
| 20 | **CMMC Resources & Documentation Hub** | [DoD CIO](https://dodcio.defense.gov/CMMC/Resources-Documentation/) | Official DoD CMMC page with all current documents. |

### 2.3 Tier 3 -- Deep Reference (Supplemental & Contextual)

| # | Document | URL | Why You Need It |
|---|----------|-----|-----------------|
| 21 | **NIST Cybersecurity Framework (CSF) 2.0** | [NIST](https://www.nist.gov/cyberframework) | Broader context. Maps to 800-171 families. Clients may reference CSF. |
| 22 | **NIST SP 800-37** (Risk Management Framework) | [NIST CSRC](https://csrc.nist.gov/pubs/sp/800/37/r2/final) | Authorization process. Useful for understanding assessment lifecycle. |
| 23 | **NIST SP 800-34** (Contingency Planning Guide) | [NIST CSRC](https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final) | Contingency planning requirements. Maps to CP family. |
| 24 | **NIST SP 800-61 Rev 3** (Incident Handling Guide) | [NIST CSRC](https://csrc.nist.gov/pubs/sp/800/61/r3/final) | Incident response procedures. Maps to IR family and 72-hour DFARS reporting. |
| 25 | **NIST SP 800-88** (Media Sanitization Guidelines) | [NIST CSRC](https://csrc.nist.gov/pubs/sp/800/88/r1/final) | Media protection requirements. Maps to MP family. |
| 26 | **NIST SP 800-63B** (Digital Identity Guidelines) | [NIST CSRC](https://csrc.nist.gov/pubs/sp/800/63/b/upd2/final) | Authentication requirements. MFA implementation guidance. |
| 27 | **CISA Cybersecurity Advisories** | [CISA](https://www.cisa.gov/news-events/cybersecurity-advisories) | Current threat intelligence. Required for risk assessment currency. |
| 28 | **Cyber-AB (CMMC Accreditation Body)** | [CyberAB](https://cyberab.org/) | Ecosystem roles. C3PAO directory. RPO requirements. |
| 29 | **C2M2-CMMC Supplemental Guidance** (DOE) | [DOE PDF](https://c2m2.doe.gov/C2M2%E2%80%94CMMC%20Supplemental%20Guidance.pdf) | Cross-walk between C2M2 and CMMC. Useful for energy sector clients. |
| 30 | **Federal Register CMMC Final Rule** | [Federal Register](https://www.federalregister.gov/documents/2024/10/15/2024-22905/cybersecurity-maturity-model-certification-cmmc-program) | Full text of the final rule with preamble discussion. |

### 2.4 Tier 4 -- Adjacent Requirements (GovCon Beyond CMMC)

| # | Document | URL | Why You Need It |
|---|----------|-----|-----------------|
| 31 | **ITAR (22 CFR 120-130)** | [eCFR](https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M) | Export control for defense articles. Some contractors handle ITAR data. |
| 32 | **EAR (15 CFR 730-774)** | [eCFR](https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C) | Export Administration Regulations. Dual-use items. |
| 33 | **FISMA** (Federal Information Security Modernization Act) | [congress.gov](https://www.congress.gov/bill/113th-congress/senate-bill/2521) | Federal agency security requirements. Context for why contractors inherit requirements. |
| 34 | **OMB Circular A-130** | [Whitehouse.gov](https://www.whitehouse.gov/omb/management/circulars/a-130/) | Federal information resource management policy. |
| 35 | **GSA MAS Schedule** | [GSA](https://www.gsa.gov/buy-through-us/purchasing-programs/multiple-award-schedule) | If pursuing GSA schedule for broader federal access. |

---

## Section 3: The 14 Control Families (NIST 800-171 Rev 2)

These are the 14 families containing the 110 controls your client must satisfy for CMMC Level 2. The count per family matters because it tells you where the compliance burden is heaviest.

| Family | ID | Controls | Weight | What It Covers |
|--------|----|----------|--------|----------------|
| Access Control | AC | 22 | Heaviest family | Who can access what, remote access, mobile, wireless |
| Awareness and Training | AT | 3 | Light | Security training, insider threat awareness |
| Audit and Accountability | AU | 9 | Moderate | Logging, audit review, event correlation |
| Configuration Management | CM | 9 | Moderate | Baselines, change control, least functionality |
| Identification and Authentication | IA | 11 | Heavy | Passwords, MFA, device identification |
| Incident Response | IR | 3 | Light | IR plan, reporting, testing |
| Maintenance | MA | 6 | Moderate | System maintenance, remote maintenance, tools |
| Media Protection | MP | 9 | Moderate | Media access, marking, storage, transport, sanitization |
| Personnel Security | PS | 2 | Light | Screening, termination |
| Physical and Environmental Protection | PE | 6 | Moderate | Physical access, monitoring, visitor control |
| Risk Assessment | RA | 3 | Light | Risk assessment, vulnerability scanning |
| Security Assessment | CA | 4 | Moderate | Assessment plan, POA&M, monitoring |
| System and Communications Protection | SC | 16 | Heavy | Boundary protection, encryption, shared resources |
| System and Information Integrity | SI | 7 | Moderate | Flaw remediation, malicious code, monitoring |
| **TOTAL** | | **110** | | |

### 3.1 The High-Value Controls (5-Point Weighted)

42 of the 110 controls are weighted at 5 points each in the DoD Assessment Methodology. These are the controls that, if not implemented, hit the SPRS score hardest. An SMB missing even 10 of these is at a score of 60 or below -- potentially non-competitive.

The 5-point controls cluster in:
- AC (Access Control) -- roughly 10-12 of them
- IA (Identification and Authentication) -- roughly 6-8
- SC (System and Communications Protection) -- roughly 8-10
- AU (Audit and Accountability) -- several

The exact weighting is in the DoD Assessment Methodology document (Tier 1, #7 above). That document should be your scoring bible.

---

## Section 4: What TNDS Documentation Already Covers

Based on the 88 documents across 7 packages in the existing TNDS compliance suite, plus the constitutional architecture documentation, here's the coverage map.

### 4.1 Strong Coverage (Ready or Near-Ready for CMMC Package Use)

| NIST 800-171 Family | TNDS Package | Existing Coverage | Package Readiness |
|---------------------|-------------|-------------------|-------------------|
| AC (Access Control) | Pkg 1: Access Control Policy, Pkg 5: Google Cloud IAM | Policy framework exists. Role-based access documented. | Map to 22 controls needed |
| AT (Awareness/Training) | Pkg 1: Security Awareness Training Program | Training program documented. | Close to complete |
| AU (Audit/Accountability) | Constitution: FedRAMP control narratives (AU-2, AU-3) | Audit logging architecture documented. SHA-256 hash verification. | Strong for platform; SMB gap |
| CM (Configuration Mgmt) | Constitution: CM-2, CM-3, CM-6 narratives; Pkg 1: Change Mgmt Policy, Asset Mgmt Policy | Version control, change control, baselines documented. | Strong |
| IR (Incident Response) | Pkg 1: Incident Response Plan; Pkg 3: Breach Notification; Pkg 4: Mandatory Reporting | IR plan exists. Breach notification exists. 72-hour reporting addressed. | Strong |
| MA (Maintenance) | Pkg 1: Patch Management Policy | Partial coverage. | Gap: remote maintenance, maintenance tools |
| MP (Media Protection) | Pkg 3: Data Handling Standard, Data Classification, Data Retention | Classification and handling exist. | Gap: media sanitization procedures, transport |
| PE (Physical/Environmental) | Pkg 1: Physical Security Policy | Policy exists. | Gap: visitor logs, monitoring specifics |
| PS (Personnel Security) | Pkg 6: Employee Onboarding, Background Check | Onboarding and screening documented. | Close to complete |
| RA (Risk Assessment) | Pkg 7: Risk Assessment Template; Pkg 2: Handbook risk framework | Risk assessment framework exists. | Gap: vulnerability scanning procedures |
| CA (Security Assessment) | Pkg 7: Compliance Audit Checklist; Constitution: conformance testing | Assessment procedures exist. | Gap: formal assessment plan template |
| SC (System/Comms Protection) | Pkg 5: Google Cloud Security, Network Security; Constitution: SI-7 | Encryption, boundary protection documented. | Gap: several SC controls SMB-specific |
| SI (System/Info Integrity) | Constitution: SI-7, SI-7(1); Pkg 1: Patch Management | Integrity verification strong in platform. | Gap: SMB anti-malware, monitoring |
| IA (Identification/Auth) | Pkg 5: Google Cloud IAM; Pkg 1: Access Control | MFA documented for TNDS systems. | Gap: SMB-specific MFA/auth procedures |

### 4.2 Clear Gaps for CMMC Package Delivery

These are what you're missing to deliver a complete CMMC Operational Readiness Package to an SMB client:

**Gap 1: Client-Facing SSP Template**
- You have NIST narratives for your own platform. You do not have a fill-in-the-blank SSP template an SMB can complete for their environment.
- Source: NIST CUI SSP Template (Tier 1, #14)
- Action: Download the NIST template. Build a TNDS-branded, plain-language version with guided prompts for each of the 110 controls.

**Gap 2: SPRS Scoring Worksheet**
- You reference SPRS but have no client-ready scoring tool.
- Source: DoD Assessment Methodology v1.2.1 (Tier 1, #7)
- Action: Build an Excel/Sheets tool that lists all 110 controls with weighted values, allows marking "Implemented/Not Implemented/Partial," and auto-calculates the SPRS score.

**Gap 3: POA&M Template (Client-Ready)**
- Your own POA&M process is referenced but there's no client-facing template.
- Source: NIST POA&M Template (Tier 2, #15)
- Action: Download. Brand. Add guided instructions. Include milestone tracking and 180-day deadline awareness.

**Gap 4: Network Diagram Template**
- No template or guide for SMBs to document their CUI boundary, network architecture, and data flows.
- Action: Create a simple diagramming guide with examples for common SMB topologies (office + cloud + remote workers).

**Gap 5: Asset Inventory Template**
- Your Asset Management Policy exists. A client-ready asset inventory template categorized by CMMC scoping categories (CUI Assets, Security Protection Assets, Contractor Risk Managed Assets, Specialized Assets, Out-of-Scope Assets) does not.
- Source: CMMC Scoping Guide Level 2 (Tier 1, #5)
- Action: Build categorized asset inventory aligned to CMMC asset classes.

**Gap 6: CUI Identification and Marking Guide**
- You reference CUI handling but have no client-facing guide on how to identify what CUI they actually have, what CUI categories apply, and how to mark it.
- Source: CUI Registry + CUI Marking Handbook (Tier 2, #17-18)
- Action: Build a plain-language CUI identification checklist with common CUI categories for the DIB.

**Gap 7: Enclave Scoping Guide**
- No documentation on the enclave approach for SMBs (limiting CUI to a small, controlled environment to reduce assessment scope).
- Action: Build a guide explaining the enclave vs. enterprise approach, with decision criteria and architecture patterns for 5-20 person shops.

**Gap 8: Policy Template Set Mapped to 14 Families**
- Your internal policies exist but aren't organized as a deliverable mapped to the 14 NIST 800-171 families that an SMB would use as their own policy set.
- Action: Create or adapt 14 policy templates, one per family, that an SMB can customize with their company name and details.

**Gap 9: Evidence Collection Guide**
- Your SOC 2 evidence index is for your platform. SMBs need a guide on what artifacts they need to collect and maintain for each control family for their C3PAO assessment.
- Action: Build a "What to keep and where" guide listing evidence types per control family.

**Gap 10: DFARS 7012 Cyber Incident Response Playbook**
- Your IR plan covers general incidents. DFARS 7012 has specific requirements: 72-hour reporting to DoD, forensic image preservation, not altering evidence. An SMB-facing playbook for this specific scenario is missing.
- Action: Build a step-by-step playbook for DFARS 7012 cyber incident response with timelines, contacts, and preservation procedures.

---

## Section 5: CMMC Level 2 Required Documentation Artifacts

When a C3PAO walks in the door, they expect to see these artifacts in final form (not draft, not working papers):

### 5.1 Required Documents (Non-Negotiable)

1. **System Security Plan (SSP)** -- Describes the CUI environment, every control's implementation status, and the security architecture
2. **Plan of Action and Milestones (POA&M)** -- Lists unimplemented controls with remediation plan and deadlines (180-day max under CMMC)
3. **Asset Inventory** -- All hardware, software, cloud services, and data assets in the CUI scope
4. **Network Diagram** -- Shows CUI boundary, segmentation, access points, and data flows
5. **Data Flow Diagram** -- How CUI enters, moves through, and exits the environment
6. **CUI Boundary Definition** -- Clear statement of what's in scope and what's out

### 5.2 Required Policies (One Per Family Minimum)

7. Access Control Policy
8. Awareness and Training Policy
9. Audit and Accountability Policy
10. Configuration Management Policy
11. Identification and Authentication Policy
12. Incident Response Policy and Plan
13. Maintenance Policy
14. Media Protection Policy
15. Personnel Security Policy
16. Physical and Environmental Protection Policy
17. Risk Assessment Policy
18. Security Assessment Policy
19. System and Communications Protection Policy
20. System and Information Integrity Policy

### 5.3 Required Procedures and Evidence

21. **Incident Response Plan** -- Specific to cyber incidents, including DFARS 72-hour reporting
22. **Security Training Records** -- Proof of security awareness training completion
23. **Vulnerability Scan Results** -- Recent scan reports showing remediation
24. **Configuration Baselines** -- Documented secure configuration standards
25. **Access Control Lists / Role Definitions** -- Who has access to what and why
26. **Audit Log Samples** -- Evidence that logging is active and reviewed
27. **MFA Implementation Evidence** -- Proof of multi-factor authentication deployment
28. **Encryption Evidence** -- Proof of encryption in transit and at rest for CUI
29. **Backup and Recovery Procedures** -- Documented and tested
30. **Third-Party/Subcontractor Agreements** -- Flow-down clauses for any subs handling CUI

---

## Section 6: The CMMC Operational Readiness Package -- What You Deliver

Based on the gaps and requirements above, here is the fixed-scope package you can deliver to an SMB:

### 6.1 Package Deliverables

**Deliverable 1: CUI Scope Definition**
- Identify what CUI the client handles (from their contracts)
- Define the CUI boundary (enclave or enterprise)
- Categorize all assets per CMMC scoping guide
- Produce: CUI Boundary Document + Asset Inventory

**Deliverable 2: System Security Plan (SSP)**
- Walk through all 110 controls with the client
- Document current implementation status for each
- Produce: Completed SSP with control-by-control narratives

**Deliverable 3: SPRS Score Calculation**
- Apply DoD Assessment Methodology weighted scoring
- Calculate current SPRS score
- Produce: SPRS Scoring Worksheet + Calculated Score

**Deliverable 4: Plan of Action and Milestones (POA&M)**
- For every control not currently MET, document the gap
- Define remediation action, responsible party, and deadline
- Produce: POA&M with prioritized remediation roadmap

**Deliverable 5: Network and Data Flow Documentation**
- Document network architecture for CUI environment
- Map CUI data flows (ingress, processing, storage, egress)
- Produce: Network Diagram + Data Flow Diagram

**Deliverable 6: Policy Gap Assessment**
- Review existing client policies against 14 family requirements
- Identify missing or incomplete policies
- Produce: Policy Gap Report + Recommended Templates

**Deliverable 7: Evidence Collection Roadmap**
- Define what evidence artifacts the client needs to maintain
- Set up evidence collection structure (folders, naming, schedule)
- Produce: Evidence Collection Guide + Folder Structure

### 6.2 What You Explicitly Do NOT Deliver

Write this into every contract:

- CMMC certification or guarantee of certification
- C3PAO assessment or liaison services
- Remediation of technical gaps (infrastructure changes, software deployment, network reconfiguration)
- Ongoing compliance monitoring (unless separately contracted as Command Partner)
- System Security Plan for IT systems TNDS does not architect
- Legal advice regarding DFARS compliance
- RPO or RP services (TNDS is not a Registered Provider Organization)

### 6.3 Pricing Framework

Based on the Bearing Check analysis and market positioning:

- **Pilot engagement**: $2,500-3,000 (first client, case study exchange)
- **Standard package**: $3,500-5,000 (based on complexity/employee count)
- **Add-on: Policy Template Set**: $1,000-1,500 (14 customized policies)
- **Add-on: Evidence Collection Setup**: $500-1,000 (folder structure, naming conventions, collection procedures)

---

## Section 7: Recommendations -- Easiest to Most Difficult

Ranked by implementation difficulty for SMB clients. Use this as a sequence guide when advising clients on what to tackle first.

### Tier 1: Quick Wins (Week 1-2)

1. **CUI Identification** -- Help client identify exactly what CUI types they handle from their contract language. Just reading the contract and matching to the CUI Registry. Low effort, high value.

2. **Security Awareness Training** -- Set up a training program (KnowBe4, Proofpoint, or even free CISA training). Document completion. This satisfies AT controls with minimal technical work.

3. **Written Policies** -- Take the 14 policy templates and customize with client's company name, dates, and specific procedures. Most SMBs have zero written security policies. This alone is a massive gap closer.

4. **MFA Deployment** -- If they're on Google Workspace or M365, enable MFA for all users. One afternoon of work. Satisfies multiple IA controls.

5. **Asset Inventory** -- Walk the client through listing every device, application, and cloud service that touches CUI. Spreadsheet exercise. Required for SSP.

### Tier 2: Moderate Effort (Week 2-4)

6. **Network Segmentation / Enclave** -- If the client can isolate CUI to a subset of their network (even a separate VLAN or dedicated cloud environment), the scope shrinks dramatically. This is architectural but can be straightforward for a 5-20 person shop.

7. **Access Control Implementation** -- Role-based access, principle of least privilege, account management procedures. Usually means cleaning up admin privileges and documenting who has access to what.

8. **Audit Logging** -- Enable logging on all systems that handle CUI. Configure log review schedule. Most cloud platforms (Google Workspace, M365, AWS) have built-in logging that just needs to be enabled and documented.

9. **Encryption Enforcement** -- Encryption at rest and in transit. Most modern platforms do this by default, but it needs to be verified and documented. FIPS 140-2 validated encryption is required for CUI.

10. **Incident Response Plan** -- Customize the IR plan template for the client's environment. Include DFARS 72-hour reporting procedures. Run a tabletop exercise.

### Tier 3: Significant Effort (Month 1-2)

11. **SSP Completion** -- Walking through all 110 controls and documenting implementation status is time-intensive. This is the core of the Operational Readiness Package. Budget 8-16 hours of collaborative work with the client.

12. **Vulnerability Scanning** -- Requires tooling (Nessus, Qualys, or open-source alternatives). Requires running scans, reviewing results, and remediating findings. Most SMBs have never done this.

13. **Configuration Management** -- Documenting secure configuration baselines for every system type. Implementing configuration change control. This requires technical depth.

14. **Media Protection** -- Procedures for marking, handling, transporting, and sanitizing media containing CUI. Includes procedures for device disposal.

15. **Physical Security** -- Visitor logs, physical access controls, monitoring. For an office-based SMB, this might mean adding a key card system or documenting existing locks and cameras.

### Tier 4: Advanced / Ongoing (Month 2+)

16. **Continuous Monitoring Program** -- Ongoing vulnerability management, log review, configuration drift detection. This is where the Command Partner model fits perfectly.

17. **Third-Party Risk Management** -- Assessing all subcontractors and vendors who handle CUI. Flowing down DFARS requirements contractually. Can be complex if the client has multiple subs.

18. **FIPS 140-2 Encryption Validation** -- Verifying that all encryption modules are FIPS validated. May require platform changes if current tools use non-validated encryption.

19. **Advanced Audit Correlation** -- SIEM-level logging and event correlation. Expensive tooling for SMBs. May recommend managed SIEM or cloud-native solutions.

20. **Full C3PAO Pre-Assessment** -- A mock assessment before the real one. Not your service, but recommend the client engage a C3PAO for a pre-assessment readiness review after your package is delivered.

---

## Section 8: The LLM-Assisted Documentation Tool Concept

Your instinct about using an LLM to receive SMB SOPs, documentation, and info via a form is solid. Here's the architecture:

### 8.1 What It Would Do

An SMB fills out a structured intake form covering their environment, systems, people, processes, and CUI types. The LLM processes this intake against the 110 NIST 800-171 controls and produces:

1. A draft SSP with control narratives populated from their inputs
2. A gap analysis showing which controls have no supporting evidence
3. A prioritized POA&M for unaddressed controls
4. A SPRS score estimate based on their self-reported status

### 8.2 Form Structure (Intake Categories)

- **Company Profile**: Size, industry, location, CAGE code, UEI, existing clearances
- **IT Environment**: Network topology, cloud services, devices, operating systems
- **CUI Profile**: Types of CUI handled, contract references, marking practices
- **Access Control**: Who has access, how access is granted/revoked, MFA status
- **Training**: Current security training program, completion records
- **Incident Response**: Existing IR plan, reporting procedures, last incident
- **Policies**: Which policies exist, when last reviewed, who owns them
- **Physical Security**: Office type, access controls, visitor procedures
- **Maintenance**: Patching schedule, remote access for maintenance
- **Media**: Device disposal, data sanitization, portable media usage
- **Encryption**: In-transit and at-rest encryption status, FIPS validation
- **Logging**: What's logged, how long retained, who reviews
- **Vulnerability Management**: Scanning tools, scan frequency, remediation process
- **Subcontractors**: Who handles CUI, what flow-down clauses exist

### 8.3 Build vs. Buy Considerations

- **Build (Streamlit + Claude API)**: Full control, TNDS-branded, data stays local, integrates with your existing tech stack. Estimated build: 2-4 weeks.
- **Buy (existing CMMC compliance platforms)**: Faster to deploy but less differentiated. Options include ComplianceForge, Totem, FutureFeed.
- **Recommendation**: Build a minimal viable version in Streamlit for the first 3 clients. Validate the workflow. Then decide whether to scale the tool or keep it as an internal accelerator.

### 8.4 Privacy and Compliance Considerations

Per your operational directives: never send identifiable client data to external LLMs without anonymization or explicit approval. The tool should either run locally (Ollama) or anonymize inputs before hitting the Claude API. Structure the form to collect process descriptions, not actual CUI content.

---

## Section 9: CMMC Ecosystem Positioning

### 9.1 Where TNDS Sits

```
C3PAO (Assessors)          -- Conducts the actual CMMC assessment
    ^
    | (client arrives prepared)
    |
RPO / RP (Registered)      -- CMMC-AB credentialed consultants
    ^
    | (not TNDS -- you're here instead)
    |
TNDS (Operational Infra)   -- Builds the operational foundation
    ^                         SSP, POA&M, policies, evidence structure
    | (client engagement)
    |
SMB Contractor              -- Needs CMMC Level 2 to keep contracts
```

You are not an RPO. You are not an RP. You are the operational infrastructure layer that gets the client's house in order so they can walk into either a self-assessment or C3PAO assessment with defensible documentation. That distinction must be in every conversation and every contract.

### 9.2 C3PAO Partnership Strategy

After 3 successful engagements, approach a C3PAO with:
- "We prepare clients for your assessment. Here's what they arrive with."
- Show the deliverable package.
- Propose reciprocal referrals: C3PAO sends clients who need pre-assessment work to TNDS, TNDS sends assessment-ready clients to C3PAO.
- Evaluate revenue share or formal partnership agreement.

### 9.3 Credibility Assets You Already Have

- SDVOSB certification (trust signal in DIB)
- 20-year Army career (Airborne Infantry, Bronze Star)
- Existing compliance documentation at auditor-grade quality (88 documents, 7 packages)
- Constitutional architecture with 148 validation rules and FedRAMP/NIST 800-53 control narratives
- SOC 2 Type II control mapping with evidence index
- Proven four-layer protection model with SHA-256 verification
- All of this is documented, version-controlled, and auditable

---

## Section 10: Phased Implementation Timeline (CMMC Context)

### Phase 1 (NOW through Nov 10, 2026)
- Level 1 self-assessment or Level 2 self-assessment required in solicitations
- DoD may require Level 2 C3PAO at its discretion
- **Your window**: Highest urgency period. Contractors scrambling for self-assessment readiness.

### Phase 2 (Nov 10, 2026 - Nov 9, 2027)
- Level 2 C3PAO certification starts appearing as mandatory in solicitations
- **Your window**: Demand shifts from "get our score up" to "pass the C3PAO assessment." Your package becomes pre-assessment prep.

### Phase 3 (Nov 10, 2027 - Nov 9, 2028)
- Level 2 C3PAO and Level 3 DIBCAC assessments in contracts
- **Your window**: By now you should have a proven track record. Case studies. C3PAO partnership. Referral pipeline running.

### Phase 4 (Nov 10, 2028+)
- Full inclusion in all DoD contracts (except COTS)
- **Your window**: Mature practice. Consider Command Partner model specifically for CMMC compliance maintenance.

---

## Section 11: Immediate Next Actions

Per the Bearing Check staged advance:

1. **Download and read** the top 10 Tier 1 documents. Start with NIST 800-171 Rev 2 and the CMMC Assessment Guide Level 2 v2.13. These two documents are the exam and the answer key.

2. **Download templates** from NIST -- the SSP template and POA&M template. These are free and official.

3. **Build the SPRS scoring worksheet** in Google Sheets. List all 110 controls, add weighted values from the DoD Assessment Methodology, build the auto-calculator. This becomes a sales tool.

4. **Make one phone call** into the Peterson/Carson subcontractor network. Ask about their CMMC situation. Listen.

5. **After that call**, build the rest of the package based on what you hear. Not before.

---

Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
True North Data Strategies -- Colorado Springs, CO
