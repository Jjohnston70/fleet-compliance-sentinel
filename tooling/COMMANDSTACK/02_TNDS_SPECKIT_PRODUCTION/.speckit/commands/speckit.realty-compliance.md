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



