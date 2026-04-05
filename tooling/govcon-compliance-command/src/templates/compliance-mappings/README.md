# Compliance Documentation

This directory contains audit-ready compliance documentation for the TNDS LLM Platform.

## Purpose

These documents map TNDS platform controls to industry-standard compliance frameworks. All content is written for external auditors, assessors, and enterprise security teams.

## Documents

| Document                                                     | Framework             | Audience          | Purpose                                                                        |
| ------------------------------------------------------------ | --------------------- | ----------------- | ------------------------------------------------------------------------------ |
| [soc2-control-mapping.md](soc2-control-mapping.md)           | SOC 2 Type II         | SOC 2 Auditors    | Maps TNDS controls to Trust Services Criteria CC6 & CC7                        |
| [soc2-evidence-index.md](soc2-evidence-index.md)             | SOC 2 Type II         | SOC 2 Auditors    | Direct mappings from controls to exact evidence artifacts                      |
| [fedramp-control-narrative.md](fedramp-control-narrative.md) | FedRAMP / NIST 800-53 | FedRAMP Assessors | Control narratives for access control, configuration management, and integrity |

## Executive Materials

| Material                         | Format | Audience                        | Location                                           |
| -------------------------------- | ------ | ------------------------------- | -------------------------------------------------- |
| Control Layer Executive Overview | PDF    | Executives, Buyers, Procurement | `TNDS_Control_Layer_Executive_Overview.pdf` (root) |

The executive overview provides a one-page, non-technical summary suitable for board presentations and procurement reviews.

## Compliance Scope

The TNDS platform implements controls for:

- **Logical Access Control** (SOC 2 CC6 / NIST AC family)
- **System Operations & Monitoring** (SOC 2 CC7 / NIST SI, CM families)
- **Configuration Management** (NIST CM family)
- **System Integrity** (NIST SI family)

## Mental Model

```
ai/control = command authority (selected, not searched)
tnds-knowledge = reference library (searched, not commanded)
docs/compliance = audit truth
```

Control is selected by authority, not discovered by search.
Execution cannot override authority.

## Audit Trail

All compliance claims reference real artifacts:

- `ai/control/` - Immutable control layer artifacts
- `src/control/loader.ts` - Control layer loader with version pinning
- `src/startup/initialize.ts` - Fail-closed initialization
- `.github/workflows/control-layer-guard.yml` - CI enforcement
- `CODEOWNERS` - Code review enforcement

## Compliance Alignment

Per TNDS operational directives (see `audits/README.md`):

- Treat all data as regulated by default
- Follow HIPAA, SOC 2, GDPR, CCPA/CPRA, GLBA alignment
- Apply least privilege principles
- Flag FedRAMP, NIST 800-53, FISMA for government work

## Document Maintenance

These documents are audit-facing and must not:

- Invent new compliance claims
- Weaken or generalize existing assertions
- Duplicate content unnecessarily
- Include speculative or future claims

All claims must be traceable to code or process.

## Related Documentation

- [../control-layer-architecture.md](../control-layer-architecture.md) - Technical architecture
- [../control-layer-hardening.md](../control-layer-hardening.md) - Hardening procedures
- [../../CONTROL_HARDENING_SUMMARY.md](../../CONTROL_HARDENING_SUMMARY.md) - Implementation summary
- [../../CODEOWNERS](../../CODEOWNERS) - Code ownership enforcement
- [../../audits/README.md](../../audits/README.md) - Audit requirements

## Compliance Baseline

**Current Baseline**: `compliance-baseline-v1.0.0`
**Baseline Date**: 2026-02-07
**Next Review**: Quarterly or upon control changes

The compliance baseline tag locks the evidence set for audits. All compliance documentation references this baseline.

To create a new baseline:

```bash
./scripts/tag-compliance-baseline.sh <version>
```

## Compliance Protection

Compliance documentation is protected by multiple layers:

### 1. Code Review Enforcement

- **CODEOWNERS**: Changes to `docs/compliance/` require `@TNDS-Command-Center/platform-admins` approval
- **Branch Protection**: GitHub enforces required reviews
- **No Bypass**: Merge blocked without approval

### 2. CI Guardrail

- **Workflow**: `.github/workflows/compliance-guard.yml`
- **Triggers**: On changes to `ai/control/`, `docs/compliance/`, `src/control/`, `src/startup/`, `CODEOWNERS`
- **Warnings**: Alerts for compliance-affecting changes
- **Guidance**: Provides compliance constraints and mental model reminders

### 3. Version Control

- **Baseline Tags**: Immutable compliance baselines (e.g., `compliance-baseline-v1.0.0`)
- **Git History**: Complete audit trail of all changes
- **Tag References**: Compliance docs reference baseline tags

## Contact

For compliance questions or audit requests, contact the platform administrators team.
