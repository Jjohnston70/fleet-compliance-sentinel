[COMPANY_LEGAL_NAME]
INCIDENT RESPONSE TABLETOP EXERCISE GUIDE

Purpose

This Incident Response Tabletop Exercise Guide provides [COMPANY_LEGAL_NAME] with a structured approach for conducting tabletop exercises to test incident response capabilities. These exercises ensure personnel are prepared to respond effectively to security incidents.

Scope

This guide applies to all [COMPANY_NAME] incident response tabletop exercises. It applies to all personnel involved in incident response and those conducting or participating in exercises.

Governance and Cross-Package References

This guide supports incident response preparedness through regular testing and exercises.

Universal [COMPANY_ABBREVIATION] Principles - Exercise Application:
No Sensitive Data in Logs: Exercise documentation must not contain real PII, PHI, PCI, CUI; use anonymized or fictional data

Cross-Package Integration:
internal-compliance skill (Incident Response Plan): Tabletop exercises test the Incident Response Plan
data-handling-privacy skill (Breach Notification Procedure): Exercises may include breach notification scenarios
data-handling-privacy skill (Anonymization Standard): Exercise documentation uses anonymized data per data-handling-privacy skill

For incident response procedures, see internal-compliance skill (Incident Response Plan).
For anonymization techniques, see data-handling-privacy skill (Anonymization Standard).

Tabletop Exercise Overview

What is a Tabletop Exercise
Tabletop exercise is discussion-based session where team members walk through incident response procedures in response to simulated security incident scenario
Exercise tests incident response plan, procedures, and team coordination
Exercise identifies gaps and improvement opportunities
Exercise is low-stress, collaborative learning experience

Exercise Objectives
Test incident response plan and procedures
Evaluate team readiness and coordination
Identify gaps in plans, procedures, or capabilities
Improve team communication and decision-making
Build team confidence in incident response
Document lessons learned and improvement actions

Exercise Frequency
Tabletop exercises conducted annually at minimum
Additional exercises conducted after significant changes to: Organization, systems, threats, incident response plan
Exercises may focus on different incident types

Exercise Planning

Step 1 — Define Exercise Objectives
Define specific objectives for exercise
Objectives aligned with organizational priorities and risks
Objectives measurable
Objectives documented

Step 2 — Select Exercise Scenario
Select realistic incident scenario relevant to organization
Scenario based on: Threat intelligence, risk assessment, past incidents, industry trends
Scenario complexity appropriate for team experience
Scenario documented

Step 3 — Develop Exercise Materials
Develop exercise materials: Scenario description, injects (additional information revealed during exercise), discussion questions, evaluation criteria
Materials realistic and detailed
Materials reviewed by CISO
Materials finalized

Step 4 — Identify Participants
Identify exercise participants: Incident response team, management, technical personnel, external partners (if applicable)
Participants notified in advance
Participants provided pre-exercise materials
Participant roles assigned

Step 5 — Schedule Exercise
Schedule exercise date and time
Schedule allows adequate time (2-4 hours typical)
Schedule accommodates key participants
Calendar invites sent

Step 6 — Prepare Logistics
Reserve meeting room or virtual meeting space
Prepare presentation materials
Prepare evaluation forms
Prepare documentation templates
Logistics confirmed

Exercise Execution

Step 7 — Conduct Exercise Introduction
Welcome participants
Review exercise objectives
Review exercise format and ground rules
Set expectations (learning environment, no wrong answers, active participation)
Answer questions

Step 8 — Present Scenario
Present initial scenario to participants
Provide scenario context: What happened, when, how discovered, initial impact
Allow participants to ask clarifying questions
Ensure participants understand scenario

Step 9 — Facilitate Discussion
Facilitate discussion of incident response actions
Use discussion questions to guide conversation
Introduce injects to add complexity and realism
Encourage participation from all team members
Document discussion and decisions

Step 10 — Evaluate Response
Evaluate team response against incident response plan and best practices
Identify strengths and weaknesses
Identify gaps in plans, procedures, or capabilities
Document evaluation findings

Step 11 — Conduct Debrief
Conduct debrief session with participants
Discuss what went well and what could be improved
Gather participant feedback
Identify lessons learned and improvement actions
Thank participants

Step 12 — Document Exercise
Document exercise: Scenario, participants, discussion, decisions, evaluation findings, lessons learned, improvement actions
Documentation reviewed by CISO
Documentation stored for future reference

Post-Exercise Activities

Step 13 — Develop After-Action Report
Develop after-action report summarizing exercise
Report includes: Executive summary, objectives, scenario, participants, findings, lessons learned, recommendations, improvement actions
Report reviewed and approved by CISO
Report distributed to participants and management

Step 14 — Implement Improvements
Implement improvement actions identified during exercise
Actions assigned to owners with due dates
Action implementation tracked
Action completion verified

Step 15 — Update Plans and Procedures
Update incident response plan and procedures based on lessons learned
Updates address gaps and weaknesses identified
Updates reviewed and approved
Updates communicated to team

Sample Tabletop Exercise Scenarios

Scenario 1: Ransomware Attack

Initial Scenario
Monday 8:00 AM: Help desk receives multiple calls from employees unable to access files
IT staff investigates and discovers files encrypted with .locked extension
Ransom note displayed on affected systems demanding $50,000 in Bitcoin within 48 hours
Approximately 20 workstations affected
File server also affected

Inject 1 (30 minutes into exercise)
Investigation reveals ransomware spread through phishing email opened by employee on Friday afternoon
Email contained malicious attachment that installed ransomware
Ransomware remained dormant over weekend and activated Monday morning

Inject 2 (60 minutes into exercise)
Backup system also affected by ransomware
Some backups encrypted
Last clean backup is 1 week old
Potential data loss of 1 week

Inject 3 (90 minutes into exercise)
Client calls asking about project deliverable due today
Deliverable files encrypted and unavailable
Client is frustrated and threatens to terminate contract

Discussion Questions
How do you detect and confirm ransomware incident?
Who do you notify internally and externally?
Do you isolate affected systems? How?
Do you pay ransom? Why or why not?
How do you recover systems and data?
How do you communicate with clients?
How do you prevent future ransomware attacks?

Scenario 2: Data Breach

Initial Scenario
Tuesday 2:00 PM: Security monitoring alerts on unusual data transfer from database server
Investigation reveals unauthorized access to client database
Attacker downloaded customer records including names, email addresses, phone numbers, and account information
Approximately 10,000 customer records affected
Attacker access occurred over past 3 days

Inject 1 (30 minutes into exercise)
Investigation reveals attacker gained access using compromised employee credentials
Employee fell victim to phishing attack 1 week ago
Employee did not report phishing email
Attacker used credentials to access VPN and database

Inject 2 (60 minutes into exercise)
Forensic analysis reveals attacker also accessed financial records
Financial records include credit card numbers (last 4 digits) and bank account information
Extent of financial data exposure unclear
Potential for identity theft and fraud

Inject 3 (90 minutes into exercise)
Client becomes aware of breach through social media post
Client is angry and demands immediate explanation
Media outlets contacting company for comment
Potential for significant reputational damage

Discussion Questions
How do you detect and confirm data breach?
Who do you notify internally and externally?
What are legal notification requirements (GDPR, CCPA, state laws)?
How do you contain breach and prevent further data loss?
How do you investigate breach and determine scope?
How do you communicate with affected individuals?
How do you communicate with clients and media?
How do you prevent future breaches?

Scenario 3: Insider Threat

Initial Scenario
Wednesday 10:00 AM: Manager reports employee behaving suspiciously
Employee recently gave notice of resignation (last day in 2 weeks)
Employee accessing files and systems outside normal job responsibilities
Employee downloading large amounts of data to USB drive
Manager concerned about data theft

Inject 1 (30 minutes into exercise)
Security monitoring confirms employee downloaded confidential client data, proprietary methodologies, and employee contact information
Downloads occurred over past week
Employee also forwarded emails to personal email account
Employee may be taking data to competitor

Inject 2 (60 minutes into exercise)
HR reviews employee file and discovers employee signed offer letter with competitor
Competitor is direct competitor in same market
Employee has access to sensitive client information and trade secrets
Potential for significant competitive harm

Inject 3 (90 minutes into exercise)
Legal counsel advises immediate action to prevent further data theft
Potential for legal action against employee and competitor
Need to preserve evidence for potential litigation
Need to notify affected clients

Discussion Questions
How do you investigate insider threat?
How do you prevent further data theft?
Do you terminate employee immediately or allow to work notice period?
How do you preserve evidence?
Do you involve law enforcement?
How do you notify affected clients?
What legal actions do you take?
How do you prevent future insider threats?

Scenario 4: Cloud Service Outage

Initial Scenario
Thursday 3:00 PM: Google Workspace services become unavailable
Gmail, Drive, Meet, and other services not accessible
Employees unable to access email, files, or conduct video meetings
Client meetings scheduled for this afternoon cannot proceed
Cause of outage unknown

Inject 1 (30 minutes into exercise)
Google status dashboard confirms widespread outage affecting multiple regions
Google estimates 4-6 hours for restoration
No estimated time for full restoration
Business operations significantly impacted

Inject 2 (60 minutes into exercise)
Client deliverable due today stored in Google Drive and inaccessible
Client expecting deliverable by 5:00 PM
No alternative way to access deliverable
Potential for contract penalty if deliverable late

Inject 3 (90 minutes into exercise)
Outage extends beyond 6 hours
Google provides no updated ETA
Employees frustrated and unable to work
Clients complaining about lack of communication
Need to activate business continuity plan

Discussion Questions
How do you detect and confirm cloud service outage?
Who do you notify internally and externally?
How do you communicate with employees?
How do you communicate with clients?
What alternative work arrangements do you implement?
How do you meet client commitments during outage?
When do you activate business continuity plan?
How do you prevent or mitigate future cloud outages?

Exercise Evaluation Criteria

Incident Detection and Reporting
Incident detected promptly
Incident reported to appropriate personnel
Incident severity assessed accurately

Incident Response Activation
Incident response plan activated
Incident response team assembled
Roles and responsibilities clear

Containment and Eradication
Incident contained to prevent further damage
Root cause identified
Threat eradicated

Communication
Internal communication effective and timely
External communication (clients, partners, regulators) appropriate
Communication consistent and accurate

Documentation
Incident documented throughout response
Evidence preserved
Documentation adequate for post-incident review

Recovery
Systems and data recovered
Normal operations restored
Recovery verified

Post-Incident Activities
Post-incident review conducted
Lessons learned documented
Improvements implemented

Exercise Documentation Template

Exercise Title
[Enter exercise title]

Exercise Date
[Enter date]

Exercise Duration
[Enter duration]

Exercise Facilitator
[Enter facilitator name]

Participants
[List participants and roles]

Scenario
[Describe scenario]

Objectives
[List objectives]

Discussion Summary
[Summarize key discussion points and decisions]

Strengths Identified
[List strengths demonstrated during exercise]

Weaknesses Identified
[List weaknesses or gaps identified]

Lessons Learned
[List lessons learned]

Improvement Actions
[List improvement actions with owners and due dates]

Participant Feedback
[Summarize participant feedback]

Overall Assessment
[Provide overall assessment of exercise and team readiness]

Facilitator Guidance

Facilitator Role
Facilitator guides exercise without dominating discussion
Facilitator asks open-ended questions
Facilitator encourages participation from all team members
Facilitator keeps exercise on track and on schedule
Facilitator remains neutral and non-judgmental

Facilitator Preparation
Review scenario and materials thoroughly
Understand incident response plan and procedures
Prepare discussion questions and injects
Anticipate potential discussion topics
Be ready to adapt based on team responses

Facilitator Tips
Create safe learning environment
Encourage "what if" thinking
Challenge assumptions constructively
Recognize good ideas and decisions
Redirect off-topic discussions
Manage time effectively
Document key points and decisions

Contact Information

For incident response tabletop exercise questions or to schedule an exercise, contact:

[OWNER_NAME]
Chief Information Security Officer
[COMPANY_LEGAL_NAME]
Email: [CONTACT_EMAIL]
Phone: [CONTACT_PHONE]

UEI: [COMPANY_UEI]
CAGE Code: [COMPANY_CAGE_CODE]
