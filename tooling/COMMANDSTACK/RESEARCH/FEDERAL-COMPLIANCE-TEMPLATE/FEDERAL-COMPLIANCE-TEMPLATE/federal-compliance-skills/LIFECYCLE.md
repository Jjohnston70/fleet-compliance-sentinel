# Federal Compliance Skills Lifecycle

**Last Updated:** 2026-02-07
**Version:** 1.0
**Purpose:** Documents governance hierarchy, skill lifecycle stages, dependencies, and update propagation

---

## Governance Hierarchy

### Visual Representation

```
                        LEVEL 0 (ROOT)
                 +---------------------------+
                 | SECURITY-GOVERNANCE       |
                 | Master Governance         |
                 | Authority                 |
                 +------------+--------------+
                              |
                +-------------+-------------+
                |                           |
         LEVEL 1 (BASELINE)                |
  +-----------------------+   +------------------------+
  | INTERNAL-COMPLIANCE   |   | DATA-HANDLING-PRIVACY  |
  | Operational Security  |   | Privacy & Data         |
  | Procedures            |   | Classification         |
  +-----------+-----------+   +-----------+------------+
              |                           |
              +-------------+-------------+
                            |
         LEVEL 2 (PLATFORM & OPERATIONS)
         +------------------+------------------+
         |                                     |
  +------+----------+               +----------+-----------+
  | CLOUD-PLATFORM  |               | BUSINESS-OPERATIONS  |
  | SECURITY        |               | Process Integration  |
  | Platform        |               |                      |
  | Implementation  |               |                      |
  +---------+-------+               +----------+-----------+
            |                                  |
            +------------------+---------------+
                               |
         LEVEL 3 (CONTRACTUAL & RISK)
         +------------------+------------------+
         |                                     |
  +------+----------+               +----------+------------+
  | CONTRACTS-RISK  |               | GOVERNMENT-          |
  | ASSURANCE       |               | CONTRACTING          |
  | Contract        |               | Federal Overlays     |
  | Templates       |               |                      |
  +---------+-------+               +----------+-----------+
            |                                  |
            +------------------+---------------+
                               |
         LEVEL 4 (SUPPORT FUNCTIONS)
         +-------------------------------------------+
         |                    |                      |
  +------+-------+   +--------+--------+   +---------+--------+
  | COMPLIANCE-  |   | COMPLIANCE-     |   | COMPLIANCE-      |
  | AUDIT        |   | RESEARCH        |   | USAGE            |
  | Assessment   |   | Intelligence    |   | Implementation   |
  | Methodology  |   |                 |   | Guidance         |
  +--------------+   +-----------------+   +------------------+
```

### Textual Hierarchy

**Level 0 (ROOT):**
- **security-governance**: Master governance authority for all policies, frameworks, and compliance requirements

**Level 1 (BASELINE):**
- **internal-compliance**: Operational procedures implementing governance requirements (IR, IAM, SDLC, BC/DR, logging)
- **data-handling-privacy**: Authoritative for data classification, privacy, retention, anonymization, breach notification

**Level 2 (PLATFORM & OPERATIONS):**
- **cloud-platform-security**: Platform-specific implementations (Google Workspace, GCP, Vertex AI, IAM, DLP, monitoring)
- **business-operations**: Business process integration of security and privacy requirements (onboarding, QA, training)

**Level 3 (CONTRACTUAL & RISK):**
- **contracts-risk-assurance**: Contract templates and risk management aligned with governance and privacy
- **government-contracting**: Federal-specific overlays for government contracts (NIST, CUI, FOIA, mandatory reporting)

**Level 4 (SUPPORT FUNCTIONS):**
- **compliance-audit**: Cross-skill audit and validation templates
- **compliance-research**: Research and external compliance intelligence
- **compliance-usage**: Usage examples and implementation guidance

---

## Skill Registry

| Skill | Type | Doc Count | Status | Dependencies |
|-------|------|-----------|--------|--------------|
| **security-governance** | Governance | 1 template | Active | None (ROOT) |
| **internal-compliance** | Operational | 21 templates | Active | security-governance |
| **data-handling-privacy** | Operational | 7 templates | Active | security-governance |
| **government-contracting** | Overlay | 9 templates | Active | security-governance, internal-compliance, data-handling-privacy, cloud-platform-security |
| **cloud-platform-security** | Implementation | 7 templates | Active | security-governance, internal-compliance, data-handling-privacy |
| **business-operations** | Operational | 10 templates | Active | security-governance, internal-compliance, data-handling-privacy |
| **contracts-risk-assurance** | Operational | 10 templates | Active | security-governance, internal-compliance, data-handling-privacy, cloud-platform-security, government-contracting |
| **compliance-audit** | Assessment | 4 templates, 1 reference | Active | All skills (evaluates all) |
| **compliance-research** | Support | 7 reference docs | Active | External regulations, standards |
| **compliance-usage** | Support | 7 reference docs | Active | All skills (documents usage) |

**Total:** 69 templates, 15 reference documents, 10 skills

---

## Dependency Map

### Complete Dependency Table

| Skill | Depends On (Upstream) | Provides To (Downstream) | Authority For |
|-------|----------------------|--------------------------|---------------|
| security-governance | None (ROOT) | All skills | Master governance, policy framework, regulatory map, universal principles |
| internal-compliance | security-governance | All skills | Operational procedures (IR, IAM, logging, SDLC, backup, change management) |
| data-handling-privacy | security-governance | internal-compliance, cloud-platform-security, government-contracting, business-operations, contracts-risk-assurance | Data classification, privacy management, anonymization, retention schedules, breach notification |
| government-contracting | security-governance, internal-compliance, data-handling-privacy, cloud-platform-security | contracts-risk-assurance, business-operations | Federal requirements (NIST, CUI, FOIA, mandatory reporting), federal overlays |
| cloud-platform-security | security-governance, internal-compliance, data-handling-privacy | contracts-risk-assurance, business-operations | Platform implementations (Google Workspace, GCP, Vertex AI), DLP, IAM, logging |
| business-operations | security-governance, internal-compliance, data-handling-privacy | contracts-risk-assurance | Business processes, onboarding/offboarding, training, quality assurance |
| contracts-risk-assurance | security-governance, internal-compliance, data-handling-privacy, cloud-platform-security, government-contracting | business-operations | Contract templates (MSA, SOW, DPA, BAA), risk assessments, vendor evaluations, audit checklists |
| compliance-audit | All skills | security-governance (findings) | Audit templates, cross-skill validation, compliance assessment |
| compliance-research | External regulations, standards | All skills | Regulatory intelligence, framework updates, industry best practices |
| compliance-usage | All skills | Users | Implementation examples, usage guidance, deployment instructions |

### Cross-Reference Pattern

All skills use consistent cross-reference format:

**Correct Format:**
- "See security-governance skill for master governance framework"
- "Reference data-handling-privacy skill Template 04 for anonymization techniques"
- "Consult government-contracting skill for federal overlay requirements"

**Incorrect Format (Do Not Use):**
- ~~"See Package 2 for governance"~~
- ~~"Reference PACKAGE_3_DATA_PRIVACY"~~
- ~~"Consult Package 4"~~

---

## Six Lifecycle Stages

### Stage 1: Establish (security-governance)

**Purpose:** Establish master governance authority and foundational security program

**Skills Involved:**
- **security-governance**: PRIMARY - Master governance authority

**Key Activities:**
1. Establish Security and Compliance Handbook (15 sections)
2. Document universal principles (data-as-regulated, no-PII-in-logs, role combination)
3. Define governance structure and authority
4. Create consolidated regulatory map
5. Establish policy hierarchy and conflict resolution rules
6. Define compliance language standards (alignment vs. certification)

**Deliverables:**
- Security and Compliance Handbook
- Universal principles document
- Governance structure with roles and authority
- Risk management framework
- Policy approval and review procedures

**Success Criteria:**
- CEO and CISO approval of governance framework
- All personnel acknowledge receipt of handbook
- Universal principles documented and communicated
- Risk register established

---

### Stage 2: Define (internal-compliance, data-handling-privacy)

**Purpose:** Define operational security procedures and privacy framework

**Skills Involved:**
- **internal-compliance**: PRIMARY - Operational security procedures
- **data-handling-privacy**: PRIMARY - Privacy and data lifecycle management

**Key Activities:**

**Internal-Compliance:**
1. Implement 21 operational security policies and procedures
2. Establish incident response plan and team
3. Define access control and identity management procedures
4. Create business continuity and disaster recovery plans
5. Implement logging, monitoring, and audit procedures
6. Define security awareness training program

**Data-Handling-Privacy:**
1. Establish data classification system (Public, Internal, Confidential, Restricted)
2. Define data lifecycle management (collection, use, retention, disposal)
3. Implement anonymization and pseudonymization techniques
4. Create privacy management policy and data subject rights procedures
5. Establish breach notification procedures
6. Define records management policy with retention schedules

**Deliverables:**
- 21 internal-compliance templates
- 7 data-handling-privacy templates
- Incident response plan and runbooks
- Business continuity and disaster recovery plans
- Data classification and retention schedules
- Privacy notices and breach notification procedures

**Success Criteria:**
- All 21 internal-compliance policies approved and communicated
- Data classification applied to all systems and data stores
- Privacy management policy implemented
- Retention schedule harmonized across all contexts
- No-PII-in-logs principle implemented in all logging systems

---

### Stage 3: Implement (cloud-platform-security)

**Purpose:** Implement platform-specific security controls and configurations

**Skills Involved:**
- **cloud-platform-security**: PRIMARY - Platform implementations

**Key Activities:**
1. Configure Google Workspace security (2-Step Verification, Admin controls, DLP, Alert Center)
2. Implement GCP security standards (IAM, VPC, Cloud Armor, Security Command Center)
3. Configure GCP IAM policies with least privilege and just-in-time access
4. Establish Vertex AI governance (data handling, model security, prompt engineering standards)
5. Implement Data Loss Prevention (DLP) configurations aligned with data classification
6. Configure security monitoring and logging (Cloud Logging, Cloud Monitoring, Security Command Center)
7. Document Google Cloud Partner compliance statement

**Deliverables:**
- 7 cloud-platform-security templates
- Google Workspace security configuration baseline
- GCP security standards and hardening guide
- IAM policies and role definitions
- Vertex AI governance framework
- DLP policies and inspection templates
- Security monitoring dashboards and alerts

**Success Criteria:**
- Platform configurations implement security-governance requirements
- IAM follows least-privilege and just-in-time access principles
- DLP policies enforce data-handling-privacy classification rules
- Logging implements no-PII-in-logs principle
- Security monitoring provides continuous visibility
- Platform partner compliance statement accurate

---

### Stage 4: Operationalize (business-operations)

**Purpose:** Integrate security and privacy into business processes

**Skills Involved:**
- **business-operations**: PRIMARY - Business process integration

**Key Activities:**
1. Establish employee onboarding procedure integrating security training
2. Define employee offboarding procedure with access revocation
3. Create project initiation template with security and privacy requirements
4. Implement client onboarding procedure with compliance assessment
5. Define service level agreements with security and availability commitments
6. Establish quality assurance procedure with security review gates
7. Implement document control procedure with version management
8. Create training and development plan including security awareness
9. Define performance management procedure with security responsibilities
10. Establish communication and collaboration standards with secure tool usage

**Deliverables:**
- 10 business-operations templates
- Onboarding/offboarding procedures with security integration
- Project initiation checklist with compliance requirements
- Client onboarding risk assessment
- SLA templates with security commitments
- Quality assurance procedures with security gates
- Document control and version management procedures

**Success Criteria:**
- Security and privacy integrated into all business processes
- All new employees receive security training within 30 days
- Offboarding procedures revoke access within 24 hours
- Client engagements assessed for compliance requirements
- SLAs accurately reflect security and availability capabilities
- Document control maintains version history and audit trails

---

### Stage 5: Formalize (government-contracting, contracts-risk-assurance)

**Purpose:** Establish contractual frameworks and federal overlays

**Skills Involved:**
- **government-contracting**: PRIMARY - Federal overlays
- **contracts-risk-assurance**: PRIMARY - Contract templates

**Key Activities:**

**Government-Contracting:**
1. Create capability statement with certifications and core competencies
2. Document government readiness statement with compliance framework status
3. Establish federal data handling and FOIA policy (CUI, PII, PHI, FTI, Classified)
4. Create government-edition contingency plan with RTO/RPO targets
5. Document NIST alignment (CSF, 800-53) with gap analysis and remediation plan
6. Define mandatory reporting procedures with timelines and channels
7. Establish federal contract closeout and offboarding procedures
8. Create roles and responsibilities matrix for federal contracts
9. Define procurement and subcontractor policy with FAR flow-down clauses

**Contracts-Risk-Assurance:**
1. Create Master Services Agreement (MSA) template
2. Define Statement of Work (SOW) template with deliverables and acceptance criteria
3. Establish Data Processing Agreement (DPA) template for GDPR/CCPA compliance
4. Create Business Associate Agreement (BAA) template for HIPAA compliance
5. Define Non-Disclosure Agreement (NDA) template
6. Create security questionnaire response template with evidence mapping
7. Establish compliance audit checklist for internal and external audits
8. Define risk assessment template with likelihood and impact scoring
9. Create vendor security assessment template with scoring rubric
10. Establish incident response tabletop exercise guide

**Deliverables:**
- 9 government-contracting templates
- 10 contracts-risk-assurance templates
- Federal capability and readiness statements
- NIST alignment documentation with gap analysis
- Federal data handling procedures
- Mandatory reporting procedures and logs
- Federal contingency plan
- Contract templates (MSA, SOW, DPA, BAA, NDA)
- Security questionnaire response framework
- Risk and vendor assessment templates

**Success Criteria:**
- Capability statement accurate with pending/obtained certifications
- NIST alignment documented with honest gap analysis
- Federal requirements override general policies where more stringent
- Mandatory reporting procedures tested and personnel trained
- Contract templates reviewed by legal counsel
- Security questionnaire responses align with actual capabilities
- Risk assessment methodology documented and applied
- Vendor assessments conducted for all critical vendors

---

### Stage 6: Assess (compliance-audit)

**Purpose:** Conduct systematic assessment and continuous improvement

**Skills Involved:**
- **compliance-audit**: PRIMARY - Assessment methodology

**Key Activities:**
1. Conduct package maturity assessment (quarterly or annual)
2. Perform cross-package dependency review after major updates
3. Create compliance roadmap with milestones and priorities
4. Conduct comprehensive compliance review (annual, pre-audit, executive reporting)
5. Use audit scoring criteria for consistency and calibration
6. Identify gaps and create remediation plans with owners and due dates
7. Track progress on remediation activities
8. Prepare for external audits (SOC 2, ISO 27001, FedRAMP)

**Deliverables:**
- Completed assessment checklists with status, evidence, findings
- Gap analysis with priorities (HIGH/MEDIUM/LOW)
- Remediation plans with owners and target dates
- Executive summary with key findings and recommendations
- Dependency maps and architecture diagrams
- Compliance framework readiness assessments
- Audit evidence packages

**Success Criteria:**
- Overall maturity score 7+ (STRONG or EXCELLENT)
- All critical gaps remediated within 90 days
- Cross-package integration score 8+
- Universal principles implemented across all skills
- Operational realism verified (no unrealistic claims)
- Audit readiness confirmed with evidence documented
- Framework alignment honest (aligned vs. compliant language)

---

## Chain Invariants

### Universal Rules That Must Always Hold True

**1. Security-Governance is ROOT**
- No skill may contradict security-governance
- All skills must reference security-governance as master authority
- Security-governance approval required for policy exceptions

**2. Data-Handling-Privacy is Authoritative for Privacy**
- All privacy procedures reference data-handling-privacy skill
- Retention schedules in data-handling-privacy are authoritative baseline
- Anonymization techniques in data-handling-privacy Template 04 are authoritative

**3. Federal Requirements Supersede When More Stringent**
- Government-contracting federal requirements override general policies where more stringent
- Federal retention (3 years after final payment) overrides shorter general retention
- Federal breach notification timelines (1-24 hours) override longer general timelines

**4. Universal Principles Apply to All Skills**
- Data-as-regulated principle must be implemented in all skills
- No-PII-in-logs principle must be implemented in logging, monitoring, debugging, AI prompts
- Role combination acknowledged with compensating controls documented

**5. Cross-References Use Skill Names**
- All cross-references use "skill" terminology (not "Package")
- Format: "[skill-name] skill Template XX" or "[skill-name] skill Section X"
- No orphaned references (all cross-references point to valid documents)

**6. Operational Realism Required**
- Compliance language accurate (aligned vs. compliant vs. certified)
- 24/7 coverage claims backed by MSSP or automation, not unsupported staffing claims
- Technology claims match actual deployed platforms
- Certification claims only after independent audit

**7. No PII in Any Documentation**
- All templates use placeholders, not actual PII
- Examples use fictional companies and personas
- Contact information uses placeholders for customization

---

## Skill Lifecycle Position

### Where Each Skill Fits in Lifecycle

| Lifecycle Stage | Primary Skills | Supporting Skills | Typical Duration |
|-----------------|----------------|-------------------|------------------|
| **1. Establish** | security-governance | compliance-research | 2-4 weeks |
| **2. Define** | internal-compliance, data-handling-privacy | security-governance, compliance-usage | 4-8 weeks |
| **3. Implement** | cloud-platform-security | internal-compliance, data-handling-privacy, compliance-usage | 4-6 weeks |
| **4. Operationalize** | business-operations | internal-compliance, data-handling-privacy, compliance-usage | 4-6 weeks |
| **5. Formalize** | government-contracting, contracts-risk-assurance | All previous skills, compliance-usage | 6-12 weeks |
| **6. Assess** | compliance-audit | All skills, compliance-research | Ongoing (quarterly/annual) |

**Total Initial Implementation:** 20-36 weeks (5-9 months) for complete compliance program

**Continuous Operations:** Stages 1-5 remain active with periodic reviews; Stage 6 (Assess) provides continuous improvement

---

## Update Propagation

### When security-governance Updates

**Impacted Skills:** ALL

**Actions Required:**
- Review all skills for alignment with updated governance
- Update universal principles references in all skills
- Update compliance framework map if regulatory requirements change
- Communicate governance changes to all personnel
- Update compliance-audit templates to reflect governance changes
- Conduct comprehensive compliance review after major governance updates

**Timeline:** 1-2 weeks for communication, 4-6 weeks for skill updates

---

### When data-handling-privacy Updates

**Impacted Skills:**
- internal-compliance (logging, backup, incident response)
- cloud-platform-security (DLP, retention, Vertex AI)
- government-contracting (federal data handling)
- contracts-risk-assurance (DPA, BAA)
- business-operations (client onboarding, employee training)

**Actions Required:**
- Update internal-compliance references to data classification, retention, anonymization
- Update cloud-platform-security DLP configurations and retention policies
- Update government-contracting federal data handling procedures
- Update contracts-risk-assurance DPA and BAA templates
- Update business-operations client onboarding risk assessment

**Timeline:** 2-4 weeks for dependent skill updates

---

### When internal-compliance Updates

**Impacted Skills:**
- cloud-platform-security (platform implementation of procedures)
- contracts-risk-assurance (SLA commitments based on procedures)
- business-operations (integration of security procedures)
- government-contracting (federal overlays on baseline procedures)

**Actions Required:**
- Update cloud-platform-security platform implementations (IAM, logging, monitoring)
- Update contracts-risk-assurance SLA terms and security questionnaire responses
- Update business-operations integration procedures
- Update government-contracting federal overlay procedures

**Timeline:** 2-3 weeks for dependent skill updates

---

### When government-contracting Updates

**Impacted Skills:**
- contracts-risk-assurance (federal contract templates)
- business-operations (federal engagement processes)

**Actions Required:**
- Update contracts-risk-assurance federal contract terms (MSA, SOW, BAA)
- Update business-operations federal contracting procedures
- Update compliance-audit federal readiness assessment criteria

**Timeline:** 1-2 weeks for dependent skill updates

---

### When cloud-platform-security Updates

**Impacted Skills:**
- contracts-risk-assurance (security questionnaire responses, SLA capabilities)
- business-operations (platform usage procedures)

**Actions Required:**
- Update contracts-risk-assurance security evidence and questionnaire responses
- Update business-operations platform procedures and training materials

**Timeline:** 1-2 weeks for dependent skill updates

---

### When business-operations Updates

**Impacted Skills:**
- contracts-risk-assurance (SLA terms based on operational capabilities)

**Actions Required:**
- Update contracts-risk-assurance SLA terms if operational procedures change
- Update compliance-audit operational assessment criteria

**Timeline:** 1 week for dependent skill updates

---

### When contracts-risk-assurance Updates

**Impacted Skills:**
- business-operations (contract execution procedures)

**Actions Required:**
- Update business-operations contract management and execution procedures
- Communicate template changes to personnel

**Timeline:** 1 week for dependent skill updates

---

### When compliance-audit Updates

**Impacted Skills:** None directly (assessment methodology)

**Actions Required:**
- Communicate new assessment criteria to all skill owners
- Update audit scoring calibration for assessors
- Update compliance-usage guides if assessment methodology changes

**Timeline:** 1 week for communication and training

---

### When compliance-research Updates

**Impacted Skills:** Varies by regulatory change

**Actions Required:**
- Identify skills impacted by regulatory change
- Conduct gap analysis against new requirements
- Create remediation plan with priorities and timelines
- Update affected skills to align with new regulations
- Update compliance-framework-map with new framework requirements

**Timeline:** 2-8 weeks depending on scope of regulatory change

---

### When compliance-usage Updates

**Impacted Skills:** None directly (usage guidance only)

**Actions Required:**
- Communicate updated usage guidance to users
- Update training materials if usage patterns change
- Verify accuracy of cross-references to operational skills

**Timeline:** 1 week for communication

---

## Propagation Workflow

### Standard Update Process

1. **Change Initiated**: Skill owner identifies need for update (regulatory change, incident, audit finding, business change)
2. **Impact Analysis**: Review dependency matrix to identify impacted skills
3. **Draft Updates**: Create draft updates for primary skill and dependent skills
4. **Cross-Reference Validation**: Verify all cross-references remain accurate
5. **Stakeholder Review**: Review with affected skill owners and CISO
6. **Approval**: Obtain CISO and CEO approval for governance-level changes
7. **Implementation**: Update primary skill and dependent skills
8. **Communication**: Notify all personnel of changes
9. **Training**: Conduct training if significant changes
10. **Audit Update**: Update compliance-audit criteria if assessment methodology affected

---

## Validation Checklist

Use this checklist after any skill update to validate integrity:

**Cross-Reference Validation:**
- [ ] All skills reference security-governance as master governance authority
- [ ] All privacy/data handling references point to data-handling-privacy skill
- [ ] All operational security references point to internal-compliance skill
- [ ] All platform security references point to cloud-platform-security skill
- [ ] All federal requirements reference government-contracting skill
- [ ] No "Package" terminology (all references use "skill")

**Authority Validation:**
- [ ] No conflicting authority claims (two skills claiming to be authoritative for same domain)
- [ ] All domain authorities clearly documented in dependency matrix
- [ ] Overlay authorities (federal) properly acknowledge baseline authorities
- [ ] security-governance remains ROOT with no upstream dependencies

**Universal Principles Validation:**
- [ ] Data-as-regulated principle stated and applied in all relevant skills
- [ ] No-PII-in-logs principle implemented in logging, monitoring, debugging, AI prompts
- [ ] Role combination documented with compensating controls

**Circular Dependency Validation:**
- [ ] All circular references resolved using documented patterns
- [ ] Process vs. requirements authority clearly separated
- [ ] Baseline vs. overlay authority clearly separated
- [ ] Implementation vs. requirements authority clearly separated

**Integration Point Validation:**
- [ ] All upstream dependencies documented in SKILL.md
- [ ] All downstream dependencies documented in SKILL.md
- [ ] All data flows documented
- [ ] All cross-skill workflows validated

**Operational Realism Validation:**
- [ ] Compliance language accurate (aligned vs. compliant vs. certified)
- [ ] 24/7 coverage claims backed by MSSP or automation
- [ ] Technology claims match actual capabilities
- [ ] Staffing claims realistic for organization size
- [ ] No unrealistic control claims

---

**Document Control**
- **Version:** 1.0
- **Created:** 2026-02-07
- **Last Updated:** 2026-02-07
- **Owner:** CISO / Compliance Officer
- **Review Frequency:** Quarterly (when skills change), Annual (comprehensive)
- **Classification:** Internal Use
- **Retention:** Permanent (governance document)
