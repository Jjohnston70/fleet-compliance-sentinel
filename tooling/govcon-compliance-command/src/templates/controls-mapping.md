Compliance Skills → System Controls Mapping
Mental model (important)

Each Skill answers three questions:

What must be true? (policy intent)

Where is this enforced? (system)

What proves it? (evidence)

Compliance only exists if all three are satisfied.

1. Internal Compliance & Governance Skill
   What this skill covers

Organizational authority

Policy ownership

Decision accountability

Review cadence

System controls

Google Workspace

Org Unit structure reflects roles (Leadership, Ops, Contractors)

Shared Drives with restricted ownership

Docs / Notion

Policy registry (read-only to staff)

Version history enabled

Calendar

Standing quarterly compliance review events

Access

Only designated roles can approve policy changes

Evidence

Policy version history

Named policy owners

Meeting records for reviews

Access logs to governance docs

2. Identity & Access Management Skill
   What this skill covers

Least privilege

Role-based access

Account lifecycle (joiner/mover/leaver)

System controls

Google Workspace IAM

Role-based Groups (no direct user grants)

MFA enforced for all users

Admin roles split (no super-admin by default)

SSO

Central identity provider

Offboarding

Automated account suspension

Drive ownership transfer rules

Evidence

Group membership exports

MFA enforcement settings

Admin role assignments

Offboarding logs

3. Data Handling & Privacy Skill
   What this skill covers

Data classification

Storage rules

Sharing constraints

Retention

System controls

Google Drive

Shared Drive usage enforced (no My Drive for business data)

External sharing restricted by OU

DLP Rules

Block sharing of sensitive data types

Sheets / BigQuery

Access via Groups only

Retention

Drive retention policies defined

Evidence

DLP rule configurations

Sharing audit logs

Data classification definitions

Retention policy screenshots

4. Logging, Monitoring & Audit Skill
   What this skill covers

Activity visibility

Tamper resistance

Audit readiness

System controls

Google Admin Audit Logs

Login, access, admin actions enabled

Central Log Sink

Export to BigQuery / SIEM

Alerting

Admin privilege changes

External sharing spikes

Retention

Logs retained per policy

Evidence

Log retention settings

Sample log queries

Alert configurations

Export destinations

5. Incident Response & Continuity Skill
   What this skill covers

Detection

Response

Communication

Recovery

System controls

Incident Runbooks

Stored in restricted Shared Drive

Access

Incident responders pre-authorized

Backups

Workspace backup solution enabled

Comms

Predefined incident notification templates

Evidence

Incident response plan

Test or tabletop records

Backup configuration proof

Incident logs (sanitized)

6. Vendor & Third-Party Risk Skill
   What this skill covers

Vendor access

Data exposure

Risk acceptance

System controls

Vendor Register

Central Sheet or database

OAuth App Controls

Restricted third-party app access

Access Reviews

Periodic review of vendor accounts

Contracts

Standard security addenda

Evidence

Vendor inventory

Approved OAuth app list

Review timestamps

Contract clauses

7. Government Contracting Compliance Skill
   What this skill covers

Federal contract hygiene

Flow-down requirements

Audit defensibility

System controls

Contract Repository

Restricted Shared Drive

Role Segregation

Contract execution ≠ billing ≠ reporting

Document Integrity

No anonymous edits

Audit Trails

Version history preserved

Evidence

Contract access logs

Role assignments

Immutable document history

Audit request responses

8. Change Management Skill
   What this skill covers

Controlled changes

Risk awareness

Traceability

System controls

Change Log

Centralized change record

Approvals

Required for system or policy changes

Version Control

Docs / GitHub where applicable

Rollback

Backups or prior versions available

Evidence

Change records

Approval history

Version diffs

Rollback confirmation

9. Training & Awareness Skill
   What this skill covers

Staff understanding

Role clarity

Human risk reduction

System controls

Training Tracker

Completion records per role

Docs

Read-only training materials

Onboarding Workflow

Training before access granted

Evidence

Training completion logs

Onboarding checklists

Access timestamps vs training dates

Canonical control principle (important)

If a skill cannot be pointed to a system control, it is not implemented.

Policies describe intent.
Controls enforce behavior.
Evidence proves reality.

How this plugs into TNDS Platform

Each skill becomes:

<skill-name>-command

Each command module includes:

Required system configurations

Validation checks

Evidence outputs

Review cadence

This is how compliance becomes installable, repeatable, and auditable.

One-sentence summary for AI context

Each compliance skill maps directly to enforceable system controls (IAM, Workspace, logging, workflows) with defined evidence outputs, turning policies into operational reality rather than documentation.

If you want, next steps could be:

Skill → Google Workspace exact settings checklist

Skill → Automation opportunities

Skill → Client maturity scoring

Skill → Battle Rhythm tasks

This is where compliance stops being scary and starts being engineering.
