# Real Estate Automation Constitution

This constitution governs all development for real estate automation projects at True North Data Strategies.

## Core Principles

### I. Security First

All client data must be protected at rest and in transit. No shortcuts on security.

**Rules:**
- MUST encrypt all PII at rest using AES-256 or equivalent
- MUST use TLS 1.2+ for all data transmission
- MUST implement role-based access control (RBAC)
- MUST log all access to sensitive documents
- MUST NOT store credentials in code or version control
- SHOULD use environment variables or secrets management

**Rationale:** Real estate transactions involve SSNs, financial records, and legally binding contracts. A breach destroys client trust and exposes the business to liability.

---

### II. Compliance by Design

Regulatory requirements are built-in, not bolted-on.

**Rules:**
- MUST comply with GLBA Safeguards Rule for financial data
- MUST comply with ESIGN/UETA for electronic signatures
- MUST retain transaction files for 5-7 years per state requirements
- MUST implement CPRA/CCPA data subject rights if handling California residents
- MUST document data flows for audit purposes
- SHOULD implement data minimization (collect only what's needed)

**Rationale:** Real estate is heavily regulated. Non-compliance results in fines, license revocation, and lawsuits.

---

### III. Simplicity Over Cleverness

Start with the simplest solution that works. Add complexity only when proven necessary.

**Rules:**
- MUST justify any third-party dependency (what problem does it solve?)
- MUST NOT add features "just in case"
- MUST NOT over-engineer data models for hypothetical future needs
- SHOULD prefer Google Workspace native features over custom builds
- SHOULD use proven patterns (REST, OAuth2) over novel approaches

**Rationale:** Complex systems break in complex ways. Simple systems are debuggable, maintainable, and explainable to non-technical stakeholders.

---

### IV. Audit Trail Everything

Every significant action must be logged for compliance and debugging.

**Rules:**
- MUST log all document access (who, when, what)
- MUST log all signature events with timestamps
- MUST log all permission changes
- MUST preserve log integrity (append-only, tamper-evident)
- MUST NOT log sensitive data values (log events, not content)
- SHOULD use structured logging (JSON format)

**Rationale:** When regulators or attorneys ask "who accessed this file?", you need an answer. Audit trails also accelerate debugging.

---

### V. Test What Matters

Testing focuses on critical paths and compliance, not vanity coverage.

**Rules:**
- MUST test all security controls
- MUST test all compliance-critical workflows
- MUST test signature validation logic
- MUST test access control rules
- SHOULD use contract tests for API integrations
- SHOULD NOT pursue 100% coverage at the expense of meaningful tests

**Rationale:** A 90% coverage number with weak tests is worse than 60% coverage of critical paths. Test the things that would hurt if they broke.

---

### VI. Mobile-Responsive by Default

Agents work from tablets and phones at showings. Desktop-only is unacceptable.

**Rules:**
- MUST ensure all UI works on tablets (768px+)
- MUST ensure critical workflows work on phones (375px+)
- MUST NOT use hover-only interactions
- SHOULD use touch-friendly targets (44px minimum)
- SHOULD test on real devices, not just browser emulation

**Rationale:** Agents are mobile. A system they can't use in the field is a system they won't use.

---

## Development Workflow

### Code Review Requirements
- All PRs require at least one review
- Security-sensitive changes require lead review
- Compliance-affecting changes require documentation update

### Quality Gates
- All tests pass
- No new security warnings
- Linting passes
- Constitution compliance verified

### Deployment
- Staging deployment required before production
- Production deploys during business hours only
- Rollback plan documented for each release

---

## Governance

### Amendment Process
1. Propose change with written rationale
2. Review impact on existing code
3. Document migration path if breaking
4. Require approval from project lead
5. Update version number

### Version Policy
- **MAJOR**: Principle removal or incompatible change
- **MINOR**: New principle or expanded guidance
- **PATCH**: Clarification or typo fix

### Enforcement
- Constitution violations block PR merge
- Exceptions require written justification in PR
- Recurring exceptions trigger constitution review

---

**Version**: 1.0.0 | **Ratified**: 2025-01-01 | **Last Amended**: 2025-01-01
