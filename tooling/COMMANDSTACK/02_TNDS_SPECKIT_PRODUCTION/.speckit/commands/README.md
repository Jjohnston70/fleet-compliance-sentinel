speckit.realty-compliance.md

---

description: Generate domain-specific compliance requirements for U.S. real estate transactions, aligned with GLBA, FTC Safeguards Rule, CPRA/State Privacy Acts, ESIGN/UETA, Fair Housing Act, NAR Code of Ethics, and state retention laws.

---



\# /speckit.realty-compliance



\## Purpose

Real estate workflows carry uniquely high legal exposure: financial documents, ID verification, buyer agency contracts, offer documents, inspection reports, and signatures all fall under multiple mandatory compliance regimes.



This command generates \*\*regulatory compliance requirements\*\* that must be incorporated into the feature specification before planning.



It ensures alignment with:

\- \*\*GLBA (Gramm-Leach-Bliley Act) Safeguards Rule\*\*

\- \*\*FTC Privacy and Data Handling Rules\*\*

\- \*\*CPRA/CCPA, CPA, VCDPA, CTDPA, U.S. state privacy laws\*\*

\- \*\*ESIGN \& UETA e-signature legality\*\*

\- \*\*Fair Housing Act considerations\*\*

\- \*\*NAR Code of Ethics confidentiality duties\*\*

\- \*\*State real-estate file retention laws (5–7 years)\*\*



---



\# Execution Flow



\## 1. Load Context

Parse the active `FEATURE\_SPEC` for:

\- Document types (contracts, IDs, financial docs)

\- Workflows (offers, listings, showings, signatures, scheduling)

\- Roles (agents, clients, TCs, admins)

\- System components (portal, AppSheet apps, Workspace storage)



If the spec is missing, error and instruct user to run `/speckit.specify`.



---



\## 2. Compliance Domain Classification

Organize requirements into these regulatory categories:



1\. \*\*GLBA Financial Data Protection (GLBA)\*\*  

2\. \*\*FTC Safeguards Rule (FTC-SAFE)\*\*  

3\. \*\*State Privacy Acts (STATE-PRIV)\*\*  

4\. \*\*ESIGN/UETA Signature Legality (SIGN-LAW)\*\*  

5\. \*\*Fair Housing Act Compliance (FHA)\*\*  

6\. \*\*NAR Ethical Handling of Client Data (NAR-ETHICS)\*\*  

7\. \*\*State Document Retention Rules (RET)\*\*  

8\. \*\*Consumer Disclosure Requirements (DISC)\*\*  



---



\## 3. Generate Compliance Requirements

Create a new section:



```markdown

\## Compliance Requirements (Generated)





Each requirement includes:



REQ-COMP-###



Description



Legal rationale



Testability marker (how compliance is demonstrated)



Example Requirements



REQ-COMP-004 (GLBA):

Any document containing financial information (bank statements, tax returns, paystubs) MUST be stored in encrypted systems with access limited to essential transaction personnel.



Rationale: GLBA Safeguards Rule



Testability: Verify Workspace DLP + Drive Access Logs



REQ-COMP-012 (SIGN-LAW):

All e-signatures MUST maintain audit trails (timestamp, intent-to-sign confirmation, identity binding).



Rationale: ESIGN \& UETA



Testability: Confirm signature provider retains metadata.



REQ-COMP-020 (RET):

Transaction files MUST be retained for 5–7 years depending on the state.



Rationale: State Real Estate Commission



Testability: Workspace retention policy configured.



4\. Constitution Alignment



Verify all MUST-level governance rules are satisfied:



No violation of data minimization



Requirements remain testable



Logging + auditability preserved



Constitution violations are CRITICAL.



5\. Deliverables



The command outputs:



A. Compliance Requirements Block



Insertable directly into the feature spec.



B. Coverage Matrix



Shows which workflows have mandatory regulatory considerations.



C. Clarification Questions (max 5)



Used when rules vary by state or signature workflow.



6\. Error Modes



Error if:



No document/data types found



Retention window undefined



Signature method unclear



Compliance category missing



Completion Message



Return:



Number of compliance requirements generated



Coverage completeness (%)



Next recommended command





---



\# ✅ \*\*2. TNDS Speckit Workflow (End-to-End)\*\*  



Below is a clean, unified workflow describing how all Speckit commands work together for real estate modernization kits.







/speckit.constitution

↓ defines governance, principles, mandatory rules

/speckit.specify

↓ creates feature spec (functional + non-functional)

/speckit.realty-security

↓ injects domain-specific security requirements

/speckit.realty-compliance

↓ injects regulatory requirements (GLBA, ESIGN, etc.)

/speckit.clarify

↓ resolves ambiguities, updates spec

/speckit.plan

↓ produces architecture, data model, contracts

/speckit.tasks

↓ generates actionable, dependency-ordered tasks

/speckit.analyze

↓ cross-artifact consistency + quality audit

/speckit.implement

↓ executes task plan to produce working solution





\### The two new modules slot in \*after specifying the feature\* but \*before planning\*, which ensures:



\- The architecture inherently satisfies legal \& security constraints  

\- Tasks include all required compliance/security enforcement  

\- Automated pipeline prevents overlooked risk or violations  



---



\# ✅ \*\*3. README for the Real Estate Speckit System\*\*



Here is a clean, professional README designed for TNDS or GitHub.



---



\## \*\*TNDS Real Estate Speckit System\*\*

A modular, AI-assisted feature development system for secure, compliant real estate automation workflows.



\### \*\*Overview\*\*

Real Estate software involves sensitive consumer data, legally binding signatures, workflows across multiple parties, and strict regulatory expectations.  

The TNDS Speckit System ensures every feature is:



\- Secure  

\- Compliant  

\- Traceable  

\- Testable  

\- Architecturally sound  

\- Easily implemented  



Speckit generates specs, security controls, compliance rules, plans, tasks, and analysis—end-to-end.



---



\## \*\*Command Suite\*\*



\### \*\*1. `/speckit.constitution`\*\*  

Defines the governance rules for all future specs and plans.



\### \*\*2. `/speckit.specify`\*\*  

Creates a complete feature specification using natural language input.



\### \*\*3. `/speckit.realty-security`\*\*  

Injects industry-specific security requirements:  

PII protection, Drive DLP, Workspace zero-trust, signature audit trails, and more.



\### \*\*4. `/speckit.realty-compliance`\*\*  

Injects regulatory requirements:  

GLBA, FTC, CPRA, ESIGN/UETA, NAR ethics, state retention laws.



\### \*\*5. `/speckit.clarify`\*\*  

Asks targeted clarification questions to remove ambiguity.



\### \*\*6. `/speckit.plan`\*\*  

Generates architecture diagrams, data models, and API contracts.



\### \*\*7. `/speckit.tasks`\*\*  

Builds dependency-ordered, test-ready tasks for implementation.



\### \*\*8. `/speckit.analyze`\*\*  

Ensures spec, plan, and tasks align with constitution \& compliance.



\### \*\*9. `/speckit.implement`\*\*  

Executes the task list to generate a working solution.



---



\## \*\*Why This Matters\*\*

Real estate software requires strict handling of:



\- Client identity documentation  

\- Financial pre-approval data  

\- Legally binding contracts  

\- E-signature compliance  

\- PII retention rules  

\- Access-controlled documents  



TNDS Speckit ensures every feature you build is \*\*audit-ready, compliant, secure, and standardized\*\*.



---



\## \*\*Workflow Summary\*\*





Specify → Security → Compliance → Clarify → Plan → Tasks → Analyze → Implement

