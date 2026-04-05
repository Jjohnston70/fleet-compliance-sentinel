# Phase 5.5 — Invocation Assembly Validation Contract (Derived)

**Status:** Derived (Locked)
**Authority Impact:** None
**Depends On:** Phases 1–4 (Locked), Phases 5.1–5.4 (Derived, Locked)
**Version:** 1.0.0
**Date:** 2026-02-04

---

## 1. Purpose

Invocation Assembly Validation is the final deterministic, fail-closed validation gate applied before submission to the Execution Authority Gate (EAG). Its sole purpose is to ensure that the complete capability invocation request, containing all six required input categories, is constitutionally admissible by construction.

This contract does not authorize, does not assemble, and does not repair. It validates completeness, consistency, and assembly integrity. It produces a binary outcome: **Valid** or **Invalid**.

This is the terminal validation gate. If this contract passes, the request may be submitted to the EAG.

---

## 2. Non-Authority Guarantees

Invocation Assembly Validation:

| Guarantee | Constitutional Source |
|-----------|----------------------|
| Cannot grant or deny execution | Phase Anchor §4: Authority exercised only at EAG |
| Cannot assemble invocation requests | Phase Anchor §8: Request Assembly Invariant |
| Cannot infer missing categories | EAG §7.1: Cannot Infer |
| Cannot enrich incomplete requests | EAG §7.3: Cannot Enrich |
| Cannot repair malformed requests | EAG §7.2: Cannot Mutate |
| Cannot evaluate authorization | EAG §1: EAG is sole decision boundary |
| Cannot interpret scope or intent | EAG §6.4: Evaluates predicates only |
| Cannot advise remediation | EAG §7.7: Cannot Advise |

This validator is a completeness and consistency checker with audit output, not an authorization gate.

---

## 3. Validation Inputs

Invocation Assembly Validation receives exactly one artifact:

**Capability Invocation Request**, which MUST contain all six categories:

| Category | Contents | Validated By |
|----------|----------|--------------|
| 1. Request | Capability type, operation, concrete parameters | This contract |
| 2. Caller Chain | Ordered links with verification material | Phase 5.3 |
| 3. Declared Intent | Purpose statement, scope reference | Phase 5.2 |
| 4. Authorization State | Declared scope, scope boundaries, applicable rules | Phase 5.1 (intake) |
| 5. Provenance | Source reference, integrity status, classification | Phase 5.4 |
| 6. Audit Context | Session identifier, timestamp, correlation ID | This contract |

It may also receive read-only references to:
- Validation records from Phases 5.2, 5.3, 5.4
- Platform assembly authority registry (for assembly verification only)

It does **not** receive:
- Runtime state
- Execution results
- Prior invocation history
- EAG decision history

---

## 4. Validation Rules

All rules are binary. Failure of any rule results in **Invalid**.

---

### Category 1: Request Validation

---

#### Rule 1: Request Presence

**Statement:** Request category MUST be present.

**Failure Condition:** Request missing, null, or empty.

**Constitutional Source:** Phase Anchor §5.1; EAG §4.1

---

#### Rule 2: Capability Type Present

**Statement:** Request MUST contain a capability type.

**Failure Condition:** Capability type missing.

**Constitutional Source:** Phase Anchor §5.1; EAG §4.1: "Capability type"

---

#### Rule 3: Capability Type Valid

**Statement:** Capability type MUST be from the platform-defined closed set.

**Failure Condition:** Capability type unrecognized or skill-defined.

**Constitutional Source:** Declared Scope §12: Capability Type Closure Invariant

---

#### Rule 4: Operation Present

**Statement:** Request MUST contain an operation.

**Failure Condition:** Operation missing.

**Constitutional Source:** Phase Anchor §5.1; EAG §4.1: "Operation"

---

#### Rule 5: Parameters Present

**Statement:** Request MUST contain concrete parameters.

**Failure Condition:** Parameters missing (empty parameters are valid if the operation requires none).

**Constitutional Source:** Phase Anchor §5.1; EAG §4.1: "Concrete parameters"

---

#### Rule 6: Parameters Concrete

**Statement:** All parameters MUST be concrete values.

**Failure Condition:** Parameters contain placeholders, variables, or unresolved references.

**Constitutional Source:** EAG §4.1: "no placeholders, no references to be resolved"

---

#### Rule 7: Request Unambiguous

**Statement:** Request MUST be unambiguous.

**Failure Condition:** Request is incomplete or ambiguous.

**Constitutional Source:** EAG §4.1: "Incomplete or ambiguous requests are inadmissible"

---

### Category 2: Caller Chain Validation

---

#### Rule 8: Caller Chain Presence

**Statement:** Caller Chain category MUST be present.

**Failure Condition:** Caller Chain missing, null, or empty.

**Constitutional Source:** Phase Anchor §5.2; EAG §4.2

---

#### Rule 9: Caller Chain Pre-Validated

**Statement:** Caller Chain MUST have passed Phase 5.3 validation.

**Failure Condition:** No valid Phase 5.3 validation record exists for this caller chain.

**Constitutional Source:** Phase 5.3: Caller Chain Validation Contract

---

#### Rule 10: Caller Chain Fresh

**Statement:** Caller Chain validation MUST be for this invocation.

**Failure Condition:** Validation record is stale or from a different invocation.

**Constitutional Source:** Caller Chain §13: Verification Material Freshness Invariant

---

### Category 3: Declared Intent Validation

---

#### Rule 11: Declared Intent Presence

**Statement:** Declared Intent category MUST be present.

**Failure Condition:** Declared Intent missing, null, or empty.

**Constitutional Source:** Phase Anchor §5.3; EAG §4.3

---

#### Rule 12: Declared Intent Pre-Validated

**Statement:** Declared Intent MUST have passed Phase 5.2 validation.

**Failure Condition:** No valid Phase 5.2 validation record exists for this intent.

**Constitutional Source:** Phase 5.2: Declared Intent Validation Contract

---

#### Rule 13: Intent-Request Consistency

**Statement:** Declared Intent purpose MUST reference this Request's capability, operation, and parameters.

**Failure Condition:** Intent references different capability, operation, or parameters than the Request.

**Constitutional Source:** Intent Semantics §3: "Must reference the actual request parameters"

---

### Category 4: Authorization State Validation

---

#### Rule 14: Authorization State Presence

**Statement:** Authorization State category MUST be present.

**Failure Condition:** Authorization State missing, null, or empty.

**Constitutional Source:** Phase Anchor §5.4; EAG §4.4

---

#### Rule 15: Declared Scope Present

**Statement:** Authorization State MUST contain the invoking skill's Declared Scope.

**Failure Condition:** Declared Scope missing.

**Constitutional Source:** Phase Anchor §5.4; EAG §4.4: "Capabilities declared by the invoking skill"

---

#### Rule 16: Declared Scope From Intake

**Statement:** Declared Scope MUST be the scope fixed at skill intake.

**Failure Condition:** Scope differs from intake record, or scope was modified post-intake.

**Constitutional Source:** Declared Scope §8: "Is fixed at skill intake"

---

#### Rule 17: Scope Boundaries Present

**Statement:** Authorization State MUST contain scope boundaries in effect.

**Failure Condition:** Scope boundaries missing.

**Constitutional Source:** Phase Anchor §5.4; EAG §4.4: "Scope boundaries in effect"

---

#### Rule 18: Applicable Rules Present

**Statement:** Authorization State MUST contain applicable rules.

**Failure Condition:** Applicable rules missing (empty set is valid if no rules apply).

**Constitutional Source:** Phase Anchor §5.4; EAG §4.4: "Rules applicable to this invocation"

---

#### Rule 19: Intent-Scope Alignment

**Statement:** Declared Intent scope reference MUST resolve to an existing scope element in the Declared Scope.

**Failure Condition:** Intent references nonexistent scope element.

**Constitutional Source:** Intent Semantics §4.1; Declared Scope §6

---

#### Rule 20: Request-Scope Alignment

**Statement:** Requested capability and operation MUST be permitted by the referenced scope element.

**Failure Condition:** Capability type or operation not in scope element's permitted set.

**Constitutional Source:** Intent Semantics §4; Declared Scope §9

---

#### Rule 21: Parameters Within Boundaries

**Statement:** Request parameters MUST fall within the scope element's parameter boundaries.

**Failure Condition:** Parameters exceed declared boundaries.

**Constitutional Source:** Intent Semantics §4.3; Declared Scope §9

---

### Category 5: Provenance Validation

---

#### Rule 22: Provenance Presence

**Statement:** Provenance category MUST be present.

**Failure Condition:** Provenance missing, null, or empty.

**Constitutional Source:** Phase Anchor §5.5; EAG §4.5

---

#### Rule 23: Provenance Pre-Validated

**Statement:** Provenance MUST have passed Phase 5.4 validation.

**Failure Condition:** No valid Phase 5.4 validation record exists for this provenance.

**Constitutional Source:** Phase 5.4: Provenance Attestation Validation Contract

---

#### Rule 24: Provenance-Skill Consistency

**Statement:** Provenance MUST be for the skill identified as immediate invoker in the Caller Chain.

**Failure Condition:** Provenance skill identity does not match caller chain's immediate invoker.

**Constitutional Source:** Caller Chain §10; Provenance §13

---

#### Rule 25: Provenance-Scope Consistency

**Statement:** Provenance skill hash MUST correspond to the skill whose Declared Scope is in Authorization State.

**Failure Condition:** Provenance references different skill than Authorization State.

**Constitutional Source:** Provenance §3.1; Declared Scope §8

---

### Category 6: Audit Context Validation

---

#### Rule 26: Audit Context Presence

**Statement:** Audit Context category MUST be present.

**Failure Condition:** Audit Context missing, null, or empty.

**Constitutional Source:** Phase Anchor §5.6; EAG §4.6

---

#### Rule 27: Session Identifier Present

**Statement:** Audit Context MUST contain a session identifier.

**Failure Condition:** Session identifier missing.

**Constitutional Source:** Phase Anchor §5.6; EAG §4.6: "Session identifier"

---

#### Rule 28: Session-Chain Consistency

**Statement:** Session identifier MUST match the session origin in the Caller Chain.

**Failure Condition:** Audit context session differs from caller chain session origin.

**Constitutional Source:** Caller Chain §11; Phase Anchor §5.6

---

#### Rule 29: Timestamp Present

**Statement:** Audit Context MUST contain a timestamp.

**Failure Condition:** Timestamp missing or malformed.

**Constitutional Source:** Phase Anchor §5.6; EAG §4.6: "Timestamp"

---

#### Rule 30: Correlation ID Present

**Statement:** Audit Context MUST contain a correlation ID.

**Failure Condition:** Correlation ID missing.

**Constitutional Source:** Phase Anchor §5.6; EAG §4.6: "Correlation ID"

---

### Cross-Category Consistency

---

#### Rule 31: All Six Categories Present

**Statement:** The invocation request MUST contain exactly six categories, no more, no fewer.

**Failure Condition:** Missing categories or extraneous categories.

**Constitutional Source:** Phase Anchor §5: "all six categories below are present and complete"

---

#### Rule 32: No Category Null

**Statement:** No category may be null or a placeholder.

**Failure Condition:** Any category is null, undefined, or a stub.

**Constitutional Source:** EAG §4: Input Completeness Rule

---

#### Rule 33: Assembly Authority Valid

**Statement:** The invocation request MUST have been assembled by a platform component, not the invoking skill.

**Failure Condition:** Assembly performed by the invoking skill or unrecognized component.

**Constitutional Source:** Phase Anchor §8: Request Assembly Invariant

---

#### Rule 34: No Skill Self-Assembly

**Statement:** The invoking skill MUST NOT have constructed its own caller chain, provenance, or audit context.

**Failure Condition:** Evidence of skill self-construction in caller chain, provenance, or audit context.

**Constitutional Source:** Phase Anchor §8: Request Assembly Invariant

---

#### Rule 35: Invocation Audit Capturability

**Statement:** The entire invocation request MUST be capturable verbatim in the audit record.

**Failure Condition:** Request contains non-serializable or transient elements.

**Constitutional Source:** Phase Anchor §5.6; EAG §5.2

---

---

## 5. Failure Semantics

| Semantic | Behavior |
|----------|----------|
| Fail-closed | Any failure → Invalid |
| Terminal | No retries, no repair, no enrichment |
| Immediate | Fail-fast on first failure permitted |
| Non-advisory | Identify failed rule(s) only |
| Blocking | Invalid request MUST NOT be submitted to EAG |

**Constitutional Source:** Phase Anchor §5: "Missing information results in rejection, not inference"

---

## 6. Outputs

### On Valid

- Invocation request eligible for EAG submission
- Validation record emitted
- Request may proceed to Runtime Boundary for EAG submission

### On Invalid

- EAG submission blocked
- Validation failure audited
- Request terminates

**No modification to the request occurs in either case.**

---

## 7. Audit Requirements

Each validation produces an audit record containing:

| Field | Required |
|-------|----------|
| Request hash or canonical representation | Yes |
| All six category hashes | Yes |
| Validation outcome (valid/invalid) | Yes |
| Failed rule numbers (if invalid) | If applicable |
| Pre-validation references (5.2, 5.3, 5.4) | Yes |
| Timestamp | Yes |
| Validator identity | Yes |
| Assembly authority identity | Yes |

Audit records are append-only and independently queryable.

**Constitutional Source:** Phase Anchor §5.6; Runtime Boundary §10: Audit Emission Invariant

---

## 8. Traceability Matrix

| Rule | Source Document | Section |
|------|-----------------|---------|
| 1–7 | Phase Anchor, EAG | §5.1, §4.1 |
| 8–10 | Phase Anchor, Caller Chain, Phase 5.3 | §5.2, §4.2, §13 |
| 11–13 | Phase Anchor, Intent Semantics, Phase 5.2 | §5.3, §4.3, §3 |
| 14–21 | Phase Anchor, EAG, Declared Scope, Intent Semantics | §5.4, §4.4, §6–§9 |
| 22–25 | Phase Anchor, Provenance, Phase 5.4 | §5.5, §4.5, §3, §13 |
| 26–30 | Phase Anchor, EAG, Caller Chain | §5.6, §4.6, §11 |
| 31–32 | Phase Anchor, EAG | §5, §4 |
| 33–34 | Phase Anchor | §8 |
| 35 | Phase Anchor, EAG | §5.6, §5.2 |

---

## 9. Validation Chain Summary

This contract is the terminal gate in the validation chain:

```
Skill Intake (5.1)
        ↓
   [Skill admitted with Declared Scope]
        ↓
   At Invocation Time:
        ↓
   ┌────────────────────────────────────┐
   │  Intent Validation (5.2)          │
   │  Caller Chain Validation (5.3)    │  ← Parallel
   │  Provenance Validation (5.4)      │
   └────────────────────────────────────┘
        ↓
   Invocation Assembly Validation (5.5)  ← This Contract
        ↓
   [If Valid: Submit to EAG]
        ↓
   Execution Authority Gate
        ↓
   Permit | Deny
```

---

## 10. Explicit Non-Goals

This contract does NOT define:

| Non-Goal | Reason |
|----------|--------|
| How to assemble invocation requests | Assembly is a platform function |
| Request routing or dispatch | Routing is runtime infrastructure |
| EAG decision logic | EAG is a separate constitutional boundary |
| Capability execution | Execution follows EAG Permit only |
| Error handling after denial | Denial handling is runtime behavior |
| Remediation guidance | Validation rejects; it does not advise |
| Storage schemas or APIs | This is a validation contract, not implementation |
| Performance optimization | Optimization is implementation concern |

---

## 11. Compliance Statement

If this contract is applied mechanically:

1. No incomplete invocation request reaches the EAG
2. No request with missing categories reaches the EAG
3. No request with cross-category inconsistencies reaches the EAG
4. No skill-self-assembled request reaches the EAG
5. The EAG receives only constitutionally well-formed requests
6. EAG evaluation becomes pure predicate checking
7. Every request is fully auditable and reconstructable

**The complete invocation request becomes constitutionally safe by construction.**

---

## 12. Phase 5 Completion Statement

With this contract, the Phase 5 validation chain is complete:

| Phase | Contract | Validates |
|-------|----------|-----------|
| 5.1 | Skill Intake Validation | Declared Scope at admission |
| 5.2 | Declared Intent Validation | Intent structure and specificity |
| 5.3 | Caller Chain Validation | Chain integrity and verification material |
| 5.4 | Provenance Attestation Validation | Provenance structure and classification |
| 5.5 | Invocation Assembly Validation | Complete request and cross-category consistency |

**Total validation rules across Phase 5: 130**

If all five contracts are applied mechanically, no unconstitutional artifact can reach the Execution Authority Gate.

---

**End of Phase 5.5 — Invocation Assembly Validation Contract**
