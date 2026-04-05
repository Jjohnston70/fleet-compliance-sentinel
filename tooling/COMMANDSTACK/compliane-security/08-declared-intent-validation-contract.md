# Phase 5.2 — Declared Intent Validation Contract (Derived)

**Status:** Derived (Locked)
**Authority Impact:** None
**Depends On:** Phases 1–4 (Locked)
**Version:** 1.0.0
**Date:** 2026-02-04

---

## 1. Purpose

Declared Intent Validation is a deterministic, fail-closed validation gate applied before invocation submission to the Execution Authority Gate (EAG). Its sole purpose is to ensure that every Declared Intent presented to the EAG is constitutionally admissible by construction.

This contract does not authorize, does not interpret, and does not repair. It produces a binary outcome: **Valid** or **Invalid**.

---

## 2. Non-Authority Guarantees

Declared Intent Validation:

| Guarantee | Constitutional Source |
|-----------|----------------------|
| Cannot grant or deny execution | Phase Anchor: Authority exercised only at EAG |
| Cannot infer missing intent | EAG §7.1: Cannot Infer |
| Cannot enrich or mutate intent | EAG §7.2/§7.3: Cannot Mutate/Enrich |
| Cannot interpret semantics | EAG §6.4: Evaluates predicates only |
| Cannot evaluate scope | Phase 4: Scope evaluated by EAG |
| Cannot advise remediation | EAG §7.7: Cannot Advise |
| Cannot depend on runtime state | Phase Anchor: Missing info → denial |

This validator is a predicate checker with audit output, not a policy engine.

---

## 3. Validation Inputs

Declared Intent Validation receives exactly one artifact:

**Declared Intent Artifact**, containing exactly two components:
- Purpose Statement
- Scope Reference (Identifier)

It may also receive read-only references to:
- The assembled Request (for cross-reference only)
- The invoking Skill's Declared Scope (for identifier existence only)

It does **not** receive:
- Runtime state
- Execution results
- Caller chain
- Provenance (classification handled elsewhere)

---

## 4. Validation Rules

All rules are binary. Failure of any rule results in **Invalid**.

---

### Rule 1: Intent Presence

**Statement:** Declared Intent MUST be present.

**Failure Condition:** Intent missing, null, or empty.

**Constitutional Source:** Phase Anchor §5; EAG §4 Input Completeness Rule

---

### Rule 2: Two-Component Structure

**Statement:** Declared Intent MUST contain exactly:
- One Purpose Statement
- One Scope Reference

**Failure Condition:** Missing component, extra components, or merged fields.

**Constitutional Source:** Intent Semantics §2

---

### Rule 3: Purpose Statement Presence

**Statement:** Purpose Statement MUST be present and non-empty.

**Failure Condition:** Missing or empty purpose.

**Constitutional Source:** Intent Semantics §2.1

---

### Rule 4: Invocation Specificity

**Statement:** Purpose Statement MUST be specific to this invocation.

**Failure Condition:** Purpose is reusable, generic, or invocation-agnostic.

**Constitutional Source:** Intent Semantics §3; EAG §4.3: "Intent must be specific to the invocation"

---

### Rule 5: No Generic Purpose

**Statement:** Purpose MUST NOT be generic (e.g., "to help the user").

**Failure Condition:** Generic or tautological purpose detected.

**Constitutional Source:** Intent Semantics §5.3; EAG §4.3: "Generic intent... is inadmissible"

---

### Rule 6: Request Reference Consistency

**Statement:** Purpose Statement MUST reference the actual capability, operation, and parameters being requested.

**Failure Condition:** Purpose does not align with the assembled Request.

**Constitutional Source:** Intent Semantics §3 Validity Conditions

---

### Rule 7: No Conditional Language

**Statement:** Purpose MUST be unconditional and static.

**Failure Condition:** Contains conditionals, hypotheticals, or branching language.

**Constitutional Source:** Intent Semantics §6: "Cannot be conditional"; EAG §6.4: Predicate Evaluability

---

### Rule 8: No Outcome References

**Statement:** Purpose MUST NOT reference execution results or future state.

**Failure Condition:** Mentions success/failure, outputs, or post-execution effects.

**Constitutional Source:** Intent Semantics §3: "Neither component references future state or execution outcomes"

---

### Rule 9: Scope Reference Presence

**Statement:** Scope Reference MUST be present.

**Failure Condition:** Missing scope identifier.

**Constitutional Source:** Intent Semantics §2.2

---

### Rule 10: Scope Reference Structural Form

**Statement:** Scope Reference MUST be a structural identifier, not free text.

**Failure Condition:** Descriptive text or semantic phrases used instead of identifier.

**Constitutional Source:** Intent Semantics §2.2: "structural reference (identifier, key, or path), not a semantic description"

---

### Rule 11: Scope Reference Resolution

**Statement:** Scope Reference MUST resolve to an existing Scope Element identifier.

**Failure Condition:** Identifier does not exist in the invoking skill's Declared Scope.

**Constitutional Source:** Intent Semantics §4.1; Declared Scope §6

---

### Rule 12: Single Scope Reference

**Statement:** Intent MUST reference exactly one Scope Element.

**Failure Condition:** Multiple identifiers or composite references.

**Constitutional Source:** Declared Scope §6: "Declared Intent must reference exactly one Scope Element identifier"

---

### Rule 13: No Scope Expansion Claims

**Statement:** Purpose MUST NOT imply permissions beyond the referenced Scope Element.

**Failure Condition:** Purpose contradicts or exceeds scope boundaries.

**Constitutional Source:** Intent Semantics §4.2: Purpose Plausibility / Contradiction Check

---

### Rule 14: No Variables or Placeholders

**Statement:** Intent MUST be fully resolved.

**Failure Condition:** Variables, templates, or placeholders present in either component.

**Constitutional Source:** Intent Semantics §3: "Neither component contains unresolved references"

---

### Rule 15: No Runtime Dependencies

**Statement:** Intent MUST NOT depend on runtime, session, or external data.

**Failure Condition:** References to runtime context detected.

**Constitutional Source:** Phase Anchor §5; Intent Semantics §6: "Cannot depend on prior invocations"

---

### Rule 16: Static Artifact

**Statement:** Intent MUST be immutable for the duration of evaluation.

**Failure Condition:** Intent mutated after validation or during assembly.

**Constitutional Source:** EAG §7.2: Cannot Mutate; Intent Semantics §1: "input artifact, not a runtime product"

---

### Rule 17: Audit Capturability

**Statement:** Intent MUST be capturable verbatim in the audit record.

**Failure Condition:** Non-serializable or transient intent content.

**Constitutional Source:** Intent Semantics §7; Phase Anchor §5.6: Audit Context

---

---

## 5. Failure Semantics

| Semantic | Behavior |
|----------|----------|
| Fail-closed | Any failure → Invalid |
| Terminal | No retries, no repair |
| Immediate | Fail-fast permitted |
| Non-advisory | Identify failed rule(s) only |

**Constitutional Source:** EAG §7.7: Cannot Advise

---

## 6. Outputs

### On Valid

- Intent eligible for invocation assembly
- Validation record emitted

### On Invalid

- Invocation assembly halts
- Validation failure audited

**No modification to the intent occurs in either case.**

---

## 7. Audit Requirements

Each validation produces an audit record containing:

| Field | Required |
|-------|----------|
| Intent hash or canonical representation | Yes |
| Validation outcome (valid/invalid) | Yes |
| Failed rule numbers (if invalid) | If applicable |
| Timestamp | Yes |
| Validator identity | Yes |

Audit records are append-only and independently queryable.

**Constitutional Source:** Phase Anchor §5.6; Runtime Boundary §10: Audit Emission Invariant

---

## 8. Traceability Matrix

| Rule | Source Document | Section |
|------|-----------------|---------|
| 1 | Phase Anchor, EAG | §5, §4 (Input Completeness) |
| 2 | Intent Semantics | §2 |
| 3 | Intent Semantics | §2.1 |
| 4 | Intent Semantics | §3 |
| 5 | Intent Semantics | §5.3 |
| 6 | Intent Semantics | §3 |
| 7 | Intent Semantics, EAG | §6, §6.4 |
| 8 | Intent Semantics | §3 |
| 9 | Intent Semantics | §2.2 |
| 10 | Intent Semantics | §2.2 |
| 11 | Intent Semantics, Declared Scope | §4.1, §6 |
| 12 | Declared Scope | §6 |
| 13 | Intent Semantics | §4.2 |
| 14 | Intent Semantics | §3 |
| 15 | Phase Anchor, Intent Semantics | §5, §6 |
| 16 | EAG, Intent Semantics | §7.2, §1 |
| 17 | Intent Semantics, Phase Anchor | §7, §5.6 |

---

## 9. Explicit Non-Goals

This contract does NOT define:

| Non-Goal | Reason |
|----------|--------|
| How to author intent | Validation checks; it does not guide |
| Remediation guidance | Validation rejects; it does not advise |
| Scope evaluation | Scope is evaluated by EAG, not this validator |
| Authorization outcomes | Authorization is EAG's sole domain |
| Runtime behavior | This is pre-invocation validation |
| EAG logic | EAG is a separate constitutional boundary |
| Storage schemas or APIs | This is a validation contract, not implementation |

---

## 10. Compliance Statement

If this contract is applied mechanically:

1. No ambiguous or generic intent reaches the EAG
2. Intent–scope alignment is decidable without interpretation
3. The EAG evaluates intent as a pure predicate
4. Runtime cannot "fix" or guess intent
5. Audit records are complete and reconstructable

**Declared Intent becomes constitutionally safe by construction.**

---

**End of Phase 5.2 — Declared Intent Validation Contract**
