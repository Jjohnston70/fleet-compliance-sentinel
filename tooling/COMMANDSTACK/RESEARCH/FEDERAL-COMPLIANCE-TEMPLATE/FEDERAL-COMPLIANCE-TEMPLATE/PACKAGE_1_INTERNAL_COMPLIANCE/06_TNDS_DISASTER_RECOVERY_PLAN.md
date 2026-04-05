TRUE NORTH DATA STRATEGIES LLC
DISASTER RECOVERY PLAN

Purpose

This Disaster Recovery Plan establishes True North Data Strategies LLC's procedures for recovering IT systems, applications, and data following a disaster or significant disruption. This plan ensures rapid recovery of technology infrastructure to support business continuity and minimize operational impact.

Scope

This plan applies to all True North Data Strategies IT systems, applications, data, and infrastructure. It covers disasters including natural disasters, cyberattacks, hardware failures, data center outages, and other events that could cause significant IT disruption.

Governance and Cross-Package References

This plan operates under the authority of the Security and Compliance Handbook (Package 2), which establishes the master governance framework for disaster recovery and resilience.

Universal TNDS Principles:
Data-as-Regulated: TNDS treats all client and customer data as regulated by default; disaster recovery procedures must maintain data protection and integrity
No Sensitive Data in Logs: Disaster recovery documentation, test results, and recovery logs must not contain PII, PHI, PCI, CUI, or other regulated identifiers in unprotected form

Cross-Package Integration:
Package 2 (Security & Compliance Handbook): Master governance document establishing disaster recovery requirements
Package 1 (Business Continuity Plan): Business-level continuity procedures supported by this technical recovery plan
Package 1 (Incident Response Plan): Procedures for responding to security incidents during recovery
Package 3 (Backup and Recovery Policy): Backup procedures and retention requirements supporting disaster recovery
Package 3 (Data Handling & Privacy): Data protection requirements during disaster recovery operations

For business continuity procedures, see Package 1 (Business Continuity Plan).
For backup procedures and retention, see Package 3 (Backup and Recovery Policy).

Recovery Objectives

Recovery Time Objective (RTO)
Maximum acceptable time to restore a system or application after a disruption

Critical Systems: 4 hours
High Priority Systems: 8 hours
Medium Priority Systems: 24 hours
Low Priority Systems: 72 hours

Recovery Point Objective (RPO)
Maximum acceptable amount of data loss measured in time

Critical Data: 4 hours (maximum 4 hours of data loss acceptable)
High Priority Data: 24 hours
Medium Priority Data: 48 hours
Low Priority Data: 7 days

Maximum Tolerable Downtime (MTD)
Maximum time a system can be unavailable before causing unacceptable business impact

Critical Systems: 24 hours
High Priority Systems: 72 hours
Medium Priority Systems: 1 week
Low Priority Systems: 2 weeks

System Inventory and Prioritization

Critical Systems (Priority 1)

Google Workspace (Email, Drive, Calendar)
Business Function: Communication, collaboration, document management
RTO: 2 hours
RPO: 1 hour
Recovery Strategy: Cloud-based with high availability, minimal recovery needed
Dependencies: Internet connectivity

Client Project Systems and Data
Business Function: Client service delivery, data analysis
RTO: 4 hours
RPO: 4 hours
Recovery Strategy: Cloud-based systems, restore from backups if needed
Dependencies: Cloud service provider, internet connectivity

VPN and Remote Access
Business Function: Secure remote access to systems
RTO: 4 hours
RPO: 24 hours
Recovery Strategy: Cloud-based VPN service, alternate VPN provider
Dependencies: Internet connectivity

High Priority Systems (Priority 2)

Financial and Accounting Systems
Business Function: Financial management, invoicing, payroll
RTO: 8 hours
RPO: 24 hours
Recovery Strategy: Cloud-based systems, restore from backups
Dependencies: Internet connectivity, vendor availability

Customer Relationship Management (CRM)
Business Function: Client management, sales tracking
RTO: 8 hours
RPO: 24 hours
Recovery Strategy: Cloud-based system, restore from backups
Dependencies: Internet connectivity

Project Management Tools
Business Function: Project tracking, task management
RTO: 8 hours
RPO: 24 hours
Recovery Strategy: Cloud-based tools, restore from backups
Dependencies: Internet connectivity

Medium Priority Systems (Priority 3)

Internal Documentation and Knowledge Base
Business Function: Internal procedures, knowledge management
RTO: 24 hours
RPO: 48 hours
Recovery Strategy: Cloud storage, restore from backups
Dependencies: Internet connectivity

Development and Testing Environments
Business Function: Development, testing, staging
RTO: 24 hours
RPO: 48 hours
Recovery Strategy: Rebuild from configuration, restore data from backups
Dependencies: Cloud infrastructure

Low Priority Systems (Priority 4)

Archive and Historical Data
Business Function: Long-term data retention
RTO: 72 hours
RPO: 7 days
Recovery Strategy: Restore from archival backups
Dependencies: Backup storage availability

Disaster Recovery Team

Team Structure

Disaster Recovery Manager (CISO)
Role: Jacob Johnston
Responsibilities: Overall disaster recovery management, activation decision, recovery coordination
Contact: jacob@truenorthstrategyops.com, 555-555-5555

IT Recovery Lead
Responsibilities: Technical recovery execution, system restoration, infrastructure recovery
Contact: Designated IT personnel or external support

Data Recovery Lead
Responsibilities: Data restoration, backup management, data integrity verification
Contact: Designated personnel or external support

Communications Lead
Responsibilities: Status updates, stakeholder communication, user notifications
Contact: Designated personnel

Business Liaison
Responsibilities: Business requirements, recovery prioritization, user coordination
Contact: Designated personnel

External Support
Cloud service providers (Google Cloud, etc.)
Managed service providers
Backup and recovery vendors
Hardware vendors
Internet service providers

Disaster Scenarios

Natural Disasters
Earthquake, flood, fire, severe weather affecting facilities or data centers
Regional power outages
Regional internet outages
Physical damage to equipment

Cyberattacks
Ransomware encrypting systems and data
Malware causing system failures
Denial of service attacks
Data destruction attacks

Hardware and Infrastructure Failures
Server failures
Storage system failures
Network equipment failures
Power system failures
Cooling system failures

Data Center or Cloud Provider Outages
Cloud service provider regional outage
Data center facility failure
Network connectivity failures
Provider service disruptions

Human Error
Accidental data deletion
Configuration errors causing outages
Deployment errors
Operational mistakes

Disaster Recovery Procedures

Phase 1 — Disaster Declaration

Disaster Assessment
Assess nature and scope of disaster
Determine impact on IT systems and data
Estimate recovery time and effort
Determine if disaster recovery plan activation needed

Disaster Declaration
Disaster Recovery Manager declares disaster
Declaration criteria: IT disruption affecting critical systems or expected to exceed RTO
Declaration documented with date, time, reason
Disaster severity level assigned (Critical, High, Medium, Low)

Team Activation
Disaster Recovery Team notified immediately
Team members confirm availability
Team assembles virtually or at designated location
Initial situation assessment conducted

Stakeholder Notification
Management notified of disaster and plan activation
Business units notified of expected impact and recovery timeline
Clients notified if services affected
Regular status updates scheduled

Phase 2 — Assessment and Prioritization

Damage Assessment
Identify affected systems and data
Assess extent of damage or loss
Determine what can be recovered vs. must be rebuilt
Identify dependencies and recovery sequence
Document assessment findings

Recovery Prioritization
Prioritize recovery based on system criticality and RTO
Consider business impact and dependencies
Coordinate with business units on priorities
Adjust priorities based on disaster specifics
Document recovery sequence

Resource Assessment
Assess available personnel and expertise
Assess available equipment and infrastructure
Assess backup availability and integrity
Identify resource gaps and needs
Procure additional resources as needed

Phase 3 — Recovery Execution

System Recovery

Critical Systems Recovery (Priority 1)
Restore or failover to alternate systems
Restore data from most recent backups
Verify system functionality
Verify data integrity
Notify users when systems available
Monitor systems for issues

High Priority Systems Recovery (Priority 2)
Restore systems following critical system recovery
Restore data from backups
Verify functionality and data integrity
Notify users
Monitor systems

Medium and Low Priority Systems Recovery (Priority 3 & 4)
Restore systems after higher priority systems recovered
Restore data from backups
Verify functionality
Notify users

Data Recovery

Backup Identification
Identify most recent valid backups
Verify backup integrity
Determine backup location and accessibility
Document backup details

Data Restoration
Restore data from backups per recovery priority
Verify data completeness and integrity
Reconcile data if multiple backup sources
Validate restored data with business users
Document restoration actions

Data Synchronization
Synchronize data across systems if needed
Resolve data conflicts
Verify data consistency
Update data as needed

Infrastructure Recovery

Network Recovery
Restore network connectivity
Configure network equipment
Verify network security controls
Test network performance
Document network configuration

Cloud Infrastructure Recovery
Restore cloud resources (virtual machines, storage, databases)
Reconfigure cloud services
Verify cloud security settings
Test cloud connectivity and performance
Document cloud configuration

Application Recovery
Restore or redeploy applications
Configure application settings
Integrate applications with data and infrastructure
Test application functionality
Document application configuration

Phase 4 — Verification and Testing

System Verification
Verify all systems operational
Verify system performance acceptable
Verify security controls functioning
Verify integrations working
Document verification results

Data Verification
Verify data completeness
Verify data accuracy
Verify data accessibility
Reconcile data discrepancies
Document data verification

User Acceptance Testing
Business users test recovered systems
Users verify data and functionality
Users report issues for resolution
User acceptance documented

Phase 5 — Return to Normal Operations

Transition Planning
Plan transition from disaster recovery to normal operations
Communicate transition timeline
Coordinate with business units
Address remaining issues

Normal Operations Resumption
Transition systems to normal operations
Deactivate disaster recovery procedures
Resume normal monitoring and maintenance
Communicate resumption to stakeholders

Monitoring and Support
Enhanced monitoring of recovered systems
Rapid response to post-recovery issues
User support for questions and problems
Ongoing verification of system stability

Phase 6 — Post-Disaster Review

Lessons Learned
Conduct post-disaster review meeting
Review disaster timeline and recovery actions
Identify what went well and areas for improvement
Document lessons learned
Develop action items

Plan Updates
Update disaster recovery plan based on lessons learned
Update system inventory and priorities
Update recovery procedures
Update contact information
Document plan updates

Improvement Implementation
Implement identified improvements
Enhance backup and recovery capabilities
Improve monitoring and detection
Provide additional training
Update documentation

Backup and Recovery Procedures

Backup Strategy

Backup Types
Full Backup: Complete backup of all data (weekly)
Incremental Backup: Backup of changes since last backup (daily)
Differential Backup: Backup of changes since last full backup (as needed)

Backup Schedule
Critical Data: Daily incremental, weekly full
High Priority Data: Daily incremental, weekly full
Medium Priority Data: Weekly full
Low Priority Data: Monthly full

Backup Storage
Primary Backup: Cloud backup service (Google Cloud, etc.)
Secondary Backup: Alternate cloud region or provider
Backup Encryption: AES-256 encryption
Backup Retention: 30 days daily, 90 days weekly, 1 year monthly

Backup Procedures

Automated Backups
Backups scheduled and automated
Backup jobs monitored for success
Backup failures investigated and resolved
Backup logs reviewed regularly

Backup Verification
Backup integrity verified automatically
Random backup restoration tests monthly
Full backup restoration test quarterly
Backup verification documented

Backup Security
Backups encrypted in transit and at rest
Backup access restricted to authorized personnel
Backup access logged and monitored
Backup storage secured

Recovery Procedures

Recovery Process
Identify backup to restore from
Verify backup integrity
Restore data to target system
Verify restoration success
Validate data integrity
Document recovery

Recovery Testing
Quarterly recovery tests for critical systems
Annual recovery tests for all systems
Test results documented
Issues identified and resolved

Communication Procedures

Status Updates
Regular status updates during disaster recovery
Update frequency based on disaster severity (hourly for critical, daily for others)
Updates to management, business units, and affected users
Updates via email, phone, or emergency notification system

Recovery Notifications
Notify users when systems recovered and available
Provide instructions for accessing recovered systems
Communicate any changes or limitations
Provide support contact information

Escalation Procedures
Escalation path for issues and decisions
Escalation to management for critical decisions
Escalation to vendors for technical support
Escalation documented

Testing and Maintenance

Disaster Recovery Testing

Backup Restoration Tests
Monthly random backup restoration tests
Quarterly full system recovery tests
Annual disaster recovery exercise
Test results documented and issues resolved

Tabletop Exercises
Annual tabletop exercise of disaster scenarios
Team walks through recovery procedures
Identify gaps and improvements
Document exercise results

Full-Scale Disaster Recovery Drill
Comprehensive disaster recovery drill every 2 years
Simulate realistic disaster scenario
Execute full recovery procedures
Evaluate plan effectiveness
Document lessons learned

Plan Maintenance

Quarterly Review
System inventory reviewed and updated
Contact information verified
Recovery procedures reviewed
Plan updates documented

Annual Review
Comprehensive plan review
Recovery objectives reviewed and adjusted
New systems and technologies incorporated
Plan tested and validated

Change-Driven Updates
Plan updated when significant IT changes occur
New systems added to inventory
Decommissioned systems removed
Recovery procedures updated
Version control maintained

Contact Information

For disaster recovery questions or to report a disaster, contact:

Jacob Johnston
Founder, CISO, and Disaster Recovery Manager
True North Data Strategies LLC
Email: jacob@truenorthstrategyops.com
Phone: 555-555-5555
Colorado Springs, CO

24/7 Emergency Contact: 555-555-5555

UEI: WKJXXACV8U43
CAGE Code: 16TC1
