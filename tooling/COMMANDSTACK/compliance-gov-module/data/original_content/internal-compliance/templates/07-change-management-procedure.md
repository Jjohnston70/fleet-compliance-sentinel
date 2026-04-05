TRUE NORTH DATA STRATEGIES LLC
CHANGE MANAGEMENT PROCEDURE

Purpose

This Change Management Procedure establishes [COMPANY_LEGAL_NAME]'s process for managing changes to IT systems, applications, infrastructure, and configurations. This procedure ensures changes are planned, tested, approved, documented, and implemented in a controlled manner to minimize risk and disruption.

Scope

This procedure applies to all changes to [COMPANY_NAME] IT systems, applications, networks, infrastructure, security controls, and configurations. It applies to all personnel who request, approve, or implement changes.

Governance and Cross-Package References

This procedure operates under the authority of the Security and Compliance Handbook (security-governance skill), which establishes the master governance framework for change management.

Universal [COMPANY_ABBREVIATION] Principles:
Data-as-Regulated: [COMPANY_ABBREVIATION] treats all client and customer data as regulated by default; changes must maintain data protection and compliance
No Sensitive Data in Logs: Change documentation, test results, and implementation logs must not contain PII, PHI, PCI, CUI, or other regulated identifiers in unprotected form

Cross-Package Integration:
security-governance skill (Security & Compliance Handbook): Master governance document establishing change management requirements
internal-compliance skill (Audit Logging and Monitoring Policy): Establishes logging requirements for change activities
data-handling-privacy skill (Data Handling & Privacy): Data protection requirements during changes affecting data systems

For logging requirements for changes, see internal-compliance skill (Audit Logging and Monitoring Policy).
For data protection during changes, see data-handling-privacy skill (Data Handling Standard).

Change Types

Standard Changes
Pre-approved, low-risk, routine changes
Follow documented procedure
No additional approval required
Examples: Password resets, standard software updates, routine maintenance

Normal Changes
Changes requiring evaluation, testing, and approval
Follow full change management process
Change Advisory Board approval for significant changes
Examples: System upgrades, configuration changes, new system deployments

Emergency Changes
Urgent changes required to resolve critical issues or security vulnerabilities
Expedited approval process
Implemented quickly to address immediate risk
Retrospective review and documentation
Examples: Emergency security patches, critical system repairs

Change Roles and Responsibilities

Change Requester
Submits change request
Provides change details and justification
Coordinates with Change Manager
Participates in change implementation if needed

Change Manager (CISO)
Role: [OWNER_NAME]
Responsibilities: Overall change management process, change review and approval, Change Advisory Board coordination
Contact: [CONTACT_EMAIL], [CONTACT_PHONE]

Change Implementer
Implements approved changes
Follows change implementation plan
Documents implementation actions
Reports implementation status

Change Advisory Board (CAB)
Members: CISO, IT personnel, business representatives
Responsibilities: Review and approve significant changes, assess change risk and impact, provide guidance on changes
Meetings: As needed for significant changes

Technical Reviewers
Review technical aspects of changes
Assess technical feasibility and risk
Provide technical recommendations
Subject matter experts for specific systems or technologies

Business Reviewers
Review business impact of changes
Assess business risk and benefit
Provide business approval
Represent business unit interests

Change Management Process

Step 1 — Change Request

Change Request Submission
Change requester submits change request
Change request includes:
Change description and objectives
Systems and components affected
Business justification
Implementation plan
Testing plan
Rollback plan
Risk assessment
Proposed implementation date and time
Change request submitted via ticketing system or email to Change Manager

Change Request Information
Change Title: Brief description
Change Type: Standard, Normal, or Emergency
Priority: Critical, High, Medium, Low
Requested By: Name and contact information
Requested Date: Date change requested
Proposed Implementation Date: Preferred date and time
Systems Affected: List of systems, applications, or components
Change Description: Detailed description of change
Business Justification: Why change is needed
Implementation Plan: Step-by-step implementation procedure
Testing Plan: How change will be tested
Rollback Plan: How to reverse change if problems occur
Risk Assessment: Potential risks and mitigation
Impact Assessment: Impact on users, systems, and business

Step 2 — Change Review and Assessment

Initial Review
Change Manager reviews change request for completeness
Incomplete requests returned to requester for additional information
Complete requests proceed to assessment

Change Assessment
Technical review of change feasibility and risk
Business review of change impact and benefit
Security review of security implications
Compliance review if applicable
Dependencies and conflicts identified
Change category and priority assigned

Risk Assessment
Assess likelihood and impact of change failure
Assess security risks
Assess business continuity risks
Identify risk mitigation measures
Document risk assessment

Impact Assessment
Assess impact on users and business operations
Assess impact on other systems and applications
Assess resource requirements (time, personnel, cost)
Identify affected stakeholders
Document impact assessment

Step 3 — Change Approval

Approval Authority

Standard Changes
Pre-approved, no additional approval required
Change Manager notified
Implementation scheduled

Normal Changes - Low Risk
Change Manager approval
Implementation scheduled

Normal Changes - Medium Risk
Change Manager approval
Technical reviewer approval
Implementation scheduled

Normal Changes - High Risk
Change Advisory Board review and approval
Management approval if significant business impact
Implementation scheduled

Emergency Changes
Change Manager approval (verbal approval acceptable)
Implement immediately
Retrospective CAB review within 5 business days

Approval Process
Change request routed to appropriate approvers
Approvers review change request and assessment
Approvers approve, reject, or request modifications
Approval decision documented with rationale
Requester notified of approval decision

Change Rejection
Changes rejected if risks outweigh benefits
Changes rejected if inadequate planning or testing
Rejection rationale documented
Requester notified with feedback for resubmission

Step 4 — Change Planning and Scheduling

Implementation Planning
Detailed implementation steps documented
Implementation timeline established
Resource requirements identified
Personnel assignments confirmed
Tools and materials prepared

Testing Planning
Test plan developed
Test environment prepared
Test cases defined
Success criteria established
Testing resources identified

Rollback Planning
Rollback procedure documented
Rollback decision criteria defined
Rollback resources identified
Rollback tested if feasible

Change Scheduling
Implementation date and time scheduled
Scheduling considers business impact and availability
Maintenance windows used for disruptive changes
Conflicting changes avoided
Change calendar updated
Stakeholders notified of scheduled change

Change Communication
Affected users notified in advance
Notification includes change description, date/time, expected impact, duration
Communication via email, portal, or other channels
Contact information provided for questions

Step 5 — Change Implementation

Pre-Implementation Verification
Verify all approvals obtained
Verify implementation plan ready
Verify resources available
Verify backup completed
Verify rollback plan ready

Implementation Execution
Follow implementation plan step-by-step
Document each implementation step
Monitor for issues during implementation
Communicate status during implementation
Escalate issues immediately

Implementation Monitoring
Monitor system performance during and after implementation
Monitor for errors or anomalies
Monitor user reports of issues
Monitor security controls
Document monitoring results

Step 6 — Change Testing and Verification

Post-Implementation Testing
Execute test plan
Verify change implemented correctly
Verify system functionality
Verify no unintended impacts
Document test results

User Acceptance Testing
Users test changed systems
Users verify functionality meets requirements
Users report issues
User acceptance documented

Verification Checklist
Change implemented per plan: Yes/No
System functionality verified: Yes/No
No unintended impacts: Yes/No
Users able to access and use system: Yes/No
Performance acceptable: Yes/No
Security controls functioning: Yes/No

Step 7 — Change Closure

Implementation Success
Change implemented successfully
Testing and verification completed
No significant issues
Change documented
Change closed

Implementation Failure
Change failed or caused significant issues
Rollback executed per rollback plan
Failure documented with root cause
Change request updated or resubmitted

Change Documentation
Change request updated with implementation details
Implementation date and time recorded
Implementation actions documented
Test results documented
Issues and resolutions documented
Lessons learned documented

Change Closure
Change Manager reviews implementation
Change closed in change management system
Stakeholders notified of completion
Change records retained per retention policy

Step 8 — Post-Implementation Review

Post-Implementation Monitoring
Enhanced monitoring for 24-48 hours after change
Monitor for delayed issues or impacts
Monitor user feedback
Address issues promptly

Post-Implementation Review
Review change success and lessons learned
Identify process improvements
Update procedures if needed
Document review findings

Emergency Change Process

Emergency Change Identification
Critical issue requiring immediate resolution
Security vulnerability requiring urgent patching
System failure requiring emergency repair
Significant business impact if not addressed immediately

Emergency Change Approval
Change Manager verbal approval
Document emergency justification
Implement change immediately
Notify stakeholders as soon as possible

Emergency Change Implementation
Implement change following best practices
Document implementation actions
Monitor closely during and after implementation
Communicate status

Emergency Change Review
Retrospective Change Advisory Board review within 5 business days
Review emergency justification
Review implementation actions
Identify lessons learned
Document review

Change Management Standards

Change Windows

Maintenance Windows
Scheduled maintenance windows for disruptive changes
Standard maintenance window: Weekends or after business hours
Maintenance windows communicated in advance
Emergency changes may occur outside maintenance windows

Change Freeze Periods
No non-emergency changes during critical business periods
Change freeze periods defined annually
Change freeze communicated in advance
Emergency changes permitted during freeze with additional approval

Change Blackout Dates
No changes on specific high-risk dates
Blackout dates defined annually (e.g., end of fiscal year, major events)
Blackout dates communicated in advance

Change Documentation Standards

Change Request Documentation
All change requests documented in change management system
Change request template used
Complete information required
Documentation retained per retention policy

Implementation Documentation
Implementation steps documented
Configuration changes documented
Before and after configurations captured
Screenshots or logs captured as evidence

Change Records Retention
Change records retained for minimum 3 years
Change records available for audit
Change records protected from unauthorized modification

Change Metrics and Reporting

Change Metrics
Number of changes by type and priority
Change success rate
Change failure rate
Emergency change rate
Average change implementation time
Changes causing incidents

Change Reporting
Monthly change summary to management
Quarterly change trends and analysis
Annual change management program review
Change metrics tracked and reported

Continuous Improvement
Change metrics analyzed for improvement opportunities
Change process refined based on lessons learned
Change management training updated
Best practices shared

Roles and Responsibilities Summary

All Personnel
Submit change requests for any changes to systems or configurations
Follow change management procedures
Participate in change implementation and testing as assigned
Report change-related issues

Change Manager (CISO)
Manage change management process
Review and approve changes
Coordinate Change Advisory Board
Ensure change documentation
Report on change metrics

Change Advisory Board
Review significant changes
Assess change risk and impact
Approve or reject changes
Provide guidance on change management

IT Personnel
Implement approved changes
Provide technical review and assessment
Test changes
Document implementation

Business Units
Provide business justification for changes
Assess business impact
Participate in user acceptance testing
Approve changes affecting their operations

Contact Information

For change management questions or to submit a change request, contact:

[OWNER_NAME]
Founder, CISO, and Change Manager
[COMPANY_LEGAL_NAME]
Email: [CONTACT_EMAIL]
Phone: [CONTACT_PHONE]
[COMPANY_CITY], [GOVERNING_STATE]

UEI: [COMPANY_UEI]
CAGE Code: [COMPANY_CAGE_CODE]
