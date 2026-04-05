# TNDS LLM Platform — Constitutional Specification

**Version:** 1.0.0
**Date:** 2026-02-04
**Status:** FROZEN

---

## Executive Summary

This document is the authoritative index of the TNDS LLM Platform constitutional specification. The constitution defines the execution authority model, validation contracts, and conformance requirements that govern all platform behavior.

**The constitution is frozen. No modifications are permitted.**

---

## Constitutional Guarantees

| Guarantee | Enforcement |
|-----------|-------------|
| Authority is contained | Only the EAG grants or denies execution |
| Execution is lawful | No capability invocation without Permit |
| Validation is complete | 148 rules across 5 contracts |
| Conformance is provable | 40 test vectors + 53 checklist questions |
| The system is auditable | Every step produces audit records |

---

## Document Index

### Core Constitutional Documents (Phases 1–4)

| # | Document | Phase | Purpose |
|---|----------|-------|---------|
| 00 | [Phase Anchor](00-phase-anchor.md) | 1 | Ground truth, terminology, authority model |
| 01 | [Execution Authority Gate](01-execution-authority-gate.md) | 2 | Sole decision boundary, Permit/Deny semantics |
| 02 | [Intent Semantics](02-intent-semantics.md) | 2 | Purpose statement, scope reference, consistency |
| 03 | [Caller Chain Verification](03-caller-chain-verification.md) | 2 | Accountability lineage, verifiable references |
| 04 | [Provenance Classification](04-provenance-classification.md) | 2 | Trust levels, integrity, capability permissions |
| 05 | [Runtime Boundary Definition](05-minimal-runtime-boundary-definition.md) | 3 | Non-authoritative relay, execution ordering |
| 06 | [Declared Scope Structure](06-declared-scope-structure.md) | 4 | Constraint sets, boundaries, immutability |

### Validation Contracts (Phase 5)

| # | Document | Phase | Rules | Target |
|---|----------|-------|-------|--------|
| 07 | [Skill Intake Validation](07-skill-intake-validation-contract.md) | 5.1 | 30 | Scope at admission |
| 08 | [Declared Intent Validation](08-declared-intent-validation-contract.md) | 5.2 | 17 | Intent structure |
| 09 | [Caller Chain Validation](09-caller-chain-validation-contract.md) | 5.3 | 34 | Chain integrity |
| 10 | [Provenance Attestation Validation](10-provenance-attestation-validation-contract.md) | 5.4 | 32 | Provenance structure |
| 11 | [Invocation Assembly Validation](11-invocation-assembly-validation-contract.md) | 5.5 | 35 | Complete request |

### Conformance References (Phase 6)

| # | Document | Phase | Purpose |
|---|----------|-------|---------|
| 12 | [Canonical Reference Flow](12-canonical-reference-flow.md) | 6.1 | 18-step gold reference |
| 13 | [Adversarial Test Vectors](13-adversarial-test-vectors.md) | 6.2 | 40 attack scenarios |
| 14 | [Minimal Conformance Checklist](14-minimal-conformance-checklist.md) | 6.3 | 53 binary questions |
| 15 | [Freeze Point Declaration](15-freeze-point-declaration.md) | 6.4 | Constitutional boundary |

---

## Core Principles

### 1. Atomic Unit of Execution

The **capability invocation** is the atomic unit of execution. It is the smallest indivisible action that:
- Requires authority to perform
- Either succeeds or fails atomically
- Has observable effects

### 2. Sole Authority

**Authority is exercised only at the Execution Authority Gate (EAG).**

No other component holds or confers execution authority. Skills, agents, commands, providers, and runtimes are non-authoritative.

### 3. Six Required Categories

No capability invocation may execute unless all six categories are present:

1. **Request** — Capability type, operation, concrete parameters
2. **Caller Chain** — Full trace from session origin to immediate invoker
3. **Declared Intent** — Purpose statement + scope reference
4. **Authorization State** — Declared scope, boundaries, applicable rules
5. **Provenance** — Source reference, integrity status, classification
6. **Audit Context** — Session identifier, timestamp, correlation ID

**Missing information results in denial, not inference.**

### 4. Binary Decision

The EAG returns exactly **Permit** or **Deny**.

- No partial permission
- No conditional approval
- No suggestions or alternatives

### 5. Fail Closed

All validation and the runtime boundary fail closed:
- Missing data → denial
- Ambiguous data → denial
- Verification failure → denial
- Runtime failure → no execution

---

## Invariant Summary

### Phase Anchor Invariants

| Invariant | Statement |
|-----------|-----------|
| Request Assembly | Skills cannot construct their own caller chain, provenance, or audit context |
| Intake Authority | Intake is administrative, not runtime; scope cannot be expanded |
| Platform Definition | Platform = constitutional authors + administrative processes |

### Runtime Boundary Invariants

| Invariant | Statement |
|-----------|-----------|
| Denial Finality | Denied invocations are terminal; no retry |
| Single-Use Authorization | Decisions are non-cacheable; fresh evaluation required |
| Transport vs. Semantic | Runtime may only reject for transport failure |
| Non-Delegation | Authorization is non-transferable |
| Behavioral Immutability | Runtime does not adapt based on outcomes |
| Execution Atomicity | Partial execution states are prohibited |
| Cleanup Authorization | Cleanup is itself a capability invocation |
| Temporal Immutability | Temporal constraints cannot be modified |
| Audit Emission | Audit is synchronous, direct, not runtime-controlled |

### Declared Scope Invariants

| Invariant | Statement |
|-----------|-----------|
| Wildcard Finiteness | Wildcards must expand to finite sets |
| Containment Staticness | Containment must be static, not runtime-resolved |
| Range Closure | Ranges must be closed and finite |
| Minimal Scope | Scope elements must be minimally scoped |
| Capability Type Closure | Capability types are platform-defined, closed |
| Re-Intake Identity | Scope expansion produces new identity |
| Empty Scope | Empty scope = no capability invocations |
| Scope Independence | Scope elements are self-contained |
| Capability Version Binding | Scope bound to capability version |
| Predicate Complexity | Constant/linear time evaluation |
| Value Set Cardinality | Platform-defined maximum |
| Operation Enumeration | Operations individually enumerated |
| Boundary Resolution | Fully resolved at intake |
| Identifier Opacity | Identifiers are opaque tokens |
| No Scope Inheritance | No templates, defaults, or derivation |

### Verification Material Invariants

| Invariant | Statement |
|-----------|-----------|
| Issuance | Must be issued by independent platform authority |
| Freshness | Must be generated for current invocation |
| Authority Independence | No self-verification |

---

## Validation Chain

```
┌─────────────────────────────────────────────┐
│            INTAKE (Pre-Runtime)             │
│  Phase 5.1: Skill Intake Validation         │
│  30 rules → Admit | Reject                  │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│         INVOCATION (At Runtime)             │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Phase 5.2: Intent Validation (17)  │    │
│  │ Phase 5.3: Chain Validation (34)   │    │
│  │ Phase 5.4: Provenance Valid. (32)  │    │
│  └─────────────────────────────────────┘    │
│                      │                      │
│                      ▼                      │
│  Phase 5.5: Assembly Validation (35)        │
│                      │                      │
│                      ▼                      │
│  ┌─────────────────────────────────────┐    │
│  │    Execution Authority Gate        │    │
│  │         Permit | Deny              │    │
│  └─────────────────────────────────────┘    │
│                      │                      │
│         ┌───────────┴───────────┐           │
│         ▼                       ▼           │
│    [Execute]               [Terminate]      │
└─────────────────────────────────────────────┘
```

---

## Constitutional Statistics

| Metric | Value |
|--------|-------|
| Constitutional Documents | 16 |
| Core Documents (Phases 1–4) | 7 |
| Validation Contracts (Phase 5) | 5 |
| Conformance References (Phase 6) | 4 |
| Total Validation Rules | 148 |
| Total Invariants | 45+ |
| Adversarial Test Vectors | 40 |
| Conformance Checklist Questions | 53 |
| Canonical Flow Steps | 18 |

---

## Conformance Requirements

An implementation is constitutionally conformant if:

1. **All 148 validation rules are enforced**
2. **All 40 adversarial test vectors are rejected**
3. **All 53 conformance checklist questions are "No"**
4. **The 18-step canonical flow is followed exactly**
5. **All invariants are preserved**
6. **All audit records are produced**

---

## Freeze Declaration

```
┌─────────────────────────────────────────────────────────────┐
│                    CONSTITUTIONAL LAYER                      │
│                                                              │
│  Documents 00–15                                             │
│  Status: FROZEN                                              │
│                                                              │
│  Cannot be modified, reinterpreted, weakened, or overridden │
├──────────────────────────────────────────────────────────────┤
│                    ═══ FREEZE LINE ═══                       │
├──────────────────────────────────────────────────────────────┤
│                   IMPLEMENTATION LAYER                       │
│                                                              │
│  Documents 16+, src/, tests/, tools/                         │
│  Status: Free to design                                      │
│                                                              │
│  Must conform to constitution                                │
│  Must fail adversarial vectors                               │
│  Must pass conformance checklist                             │
└──────────────────────────────────────────────────────────────┘
```

---

## Reading Order

For new contributors, read in this order:

1. **This document** — Overview and index
2. **00-Phase Anchor** — Ground truth and terminology
3. **01-Execution Authority Gate** — Core authority model
4. **15-Freeze Point Declaration** — What is frozen and why
5. **12-Canonical Reference Flow** — How execution works
6. **13-Adversarial Test Vectors** — What must fail
7. **14-Minimal Conformance Checklist** — How to validate components
8. Remaining documents as needed

---

## Final Statement

This constitution defines a system where:

- **Authority cannot leak** — Only the EAG decides
- **Execution cannot occur unlawfully** — Permit required
- **Conformance is provable** — Tests and checklists exist
- **Audit is complete** — Every step is recorded

**If this constitution is followed mechanically, no unconstitutional execution can occur.**

---

**END OF CONSTITUTIONAL INDEX**

---

*For implementation guidance, see documents numbered 16 and above.*
*For questions about the constitution, consult the adversarial test vectors and conformance checklist.*
*The constitution does not advise; it defines.*
