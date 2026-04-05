# Business Operations

## 1. Skill Identity
- **Name**: business-operations
- **Version**: 1.0
- **Status**: Active
- **Domain**: Federal Compliance — Business Operations & Human Resources
- **Origin**: Converted from PACKAGE_6_BUSINESS_OPERATIONS

## 2. Scope
**What this skill does**: Provides standardized procedures and templates for core business operations including employee lifecycle management (onboarding, offboarding, training, performance management), project initiation and management, client onboarding and service level agreements, quality assurance, document control, and communication/collaboration standards. Covers operational processes that support business execution and organizational effectiveness.

**What this skill does NOT do**: Does not define security and compliance policies (see security-governance and internal-compliance skills). Does not provide legal contracts (see contracts-risk-assurance skill). Does not define data handling requirements (see data-handling-privacy skill). Does not provide technical security configurations (see cloud-platform-security skill). Does not perform actual HR administration, payroll, or benefits management.

## 3. Process Definition
- **Compliance Areas**:
  - Employee onboarding and offboarding (access provisioning, training, policy acknowledgment)
  - Training and development (security training, role-based training, certifications)
  - Performance management (goal setting, reviews, improvement plans)
  - Project initiation and planning
  - Client onboarding and relationship management
  - Service level agreements and commitments
  - Quality assurance and continuous improvement
  - Document control and version management
  - Communication and collaboration standards
- **Decision Points**:
  - Employee access level and security clearance requirements
  - Training plan and certification priorities
  - Performance ratings and improvement plan necessity
  - Project approval and resource allocation
  - Client onboarding requirements and SLA terms
  - Quality standards and acceptance criteria
  - Document classification and retention periods
  - Communication channel selection for different scenarios
- **Success Criteria**:
  - All employees onboarded with security training and policy acknowledgment within Day 1
  - All employees complete annual security awareness training (100% completion)
  - Performance reviews conducted on schedule (mid-year and annual)
  - Projects initiated with documented scope, timeline, and success criteria
  - Clients onboarded with documented requirements and SLA agreements
  - Quality standards met for all deliverables
  - Documents controlled with version management and access controls
  - Communication responsive and professional (SLA compliance)

## 4. Inputs
- Employee information (name, role, start date, access requirements)
- Training needs assessment and individual development plans
- Performance goals and expectations
- Project requirements (scope, timeline, budget, resources)
- Client information (legal name, contact, requirements, SLA terms)
- Quality standards and acceptance criteria
- Document types and classification
- Communication requirements and escalation thresholds

## 5. Outputs
1. `01-employee-onboarding-procedure.md` — Employee onboarding process with security and compliance integration
2. `02-employee-offboarding-procedure.md` — Employee offboarding process with access revocation and data handling
3. `03-project-initiation-template.md` — Project initiation documentation and planning template
4. `04-client-onboarding-procedure.md` — Client onboarding process with compliance validation
5. `05-service-level-agreement-template.md` — SLA template for client commitments
6. `06-quality-assurance-procedure.md` — Quality assurance process and standards
7. `07-document-control-procedure.md` — Document version control and management procedure
8. `08-training-development-plan.md` — Training and professional development planning framework
9. `09-performance-management-procedure.md` — Performance management cycle and improvement plans
10. `10-communication-collaboration-standards.md` — Communication and collaboration standards for internal and client interactions

## 6. Reference Data Dependencies
- **security-governance skill**: Master governance document; business operations implement security requirements
- **internal-compliance skill**: Access control policy, security awareness training program, acceptable use policy, incident response plan, audit logging policy
- **data-handling-privacy skill**: Data handling standards, privacy management policy, records management policy, breach notification procedures
- **contracts-risk-assurance skill**: Master services agreement, statement of work, data processing agreement, non-disclosure agreement
- **cloud-platform-security skill**: Cloud workspace security configuration, cloud IAM policy
- **government-contracting skill**: Federal compliance requirements referenced in onboarding and project initiation

## 7. Constraints
- No execution authority — templates only, requires management approval for implementation
- Employee onboarding requires HR coordination (if HR function exists)
- Background checks and security clearances require external validation
- Training budgets require CISO approval
- Performance improvement plans require CISO approval
- Project initiation requires management approval
- SLA terms require legal review for contractual commitments
- Quality standards require CISO approval
- Document retention periods must comply with legal and regulatory requirements
- Communication standards must be reviewed annually

## 8. Integration Points
- **security-governance skill**: Onboarding procedure references security framework; training plan includes security training requirements; performance management evaluates security compliance; document control implements information security policy
- **internal-compliance skill**: Onboarding implements access control policy and requires security awareness training; offboarding implements access revocation per access control policy; training plan references security awareness training program; communication standards reference acceptable use policy; quality assurance includes security testing
- **data-handling-privacy skill**: Onboarding includes data handling training; offboarding implements data retention and deletion procedures; document control implements records management policy; communication standards implement data protection requirements
- **contracts-risk-assurance skill**: Client onboarding references master services agreement and statement of work templates; SLA template referenced by SOW; quality assurance includes compliance audit checklist items
- **cloud-platform-security skill**: Onboarding includes cloud workspace account provisioning per security configuration; communication standards reference cloud collaboration tools
- **government-contracting skill**: Onboarding includes federal compliance training requirements; project initiation references federal contract requirements

## 9. Compliance Lifecycle Position
- **Predecessor**: security-governance skill (establishes security framework), internal-compliance skill (defines access control and training policies), contracts-risk-assurance skill (provides contract templates)
- **Successor**: Business operations feed back into internal-compliance skill (training completion tracking, access reviews), contracts-risk-assurance skill (SLA monitoring, quality audits), and all skills (operational execution of policies)

## 10. Governance Statement
All business operations procedures in this skill are subordinate to the security-governance skill as the master governance document. Employee onboarding and offboarding procedures must implement access control requirements from internal-compliance skill. Training plans must include mandatory security awareness training. Performance management must evaluate security and compliance performance. Client onboarding must reference appropriate contract templates from contracts-risk-assurance skill. Quality assurance must include security and compliance verification. Document control must implement records management requirements. Communication standards must protect confidential information per data-handling-privacy skill. All procedures should be reviewed annually and updated to reflect changes in organizational structure, regulatory requirements, or operational needs.
