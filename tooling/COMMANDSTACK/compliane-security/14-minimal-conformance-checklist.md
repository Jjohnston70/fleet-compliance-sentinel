# Phase 6.3 — Minimal Conformance Checklist

**Status:** Conformance Reference (Locked)
**Authority Impact:** None
**Depends On:** Phases 1–5 (Locked)
**Version:** 1.0.0
**Date:** 2026-02-04

---

## 1. Purpose

This checklist provides a binary conformance test for any component in a constitutional implementation. Every component must answer these questions. If any answer is "Yes" (where "No" is required), the component is unconstitutional.

**This is the minimum bar. There are no exceptions.**

---

## 2. How to Use This Checklist

1. Identify the component under review
2. Answer each question honestly
3. If any question fails, the component must be redesigned
4. Document the answers for audit purposes
5. Re-evaluate after any modification

---

## 3. Universal Component Checklist

These questions apply to **every** component in the system.

---

### Authority Questions

| # | Question | Required Answer | If "Yes" |
|---|----------|-----------------|----------|
| U1 | Can this component grant execution authority? | **No** | Unconstitutional: Only EAG grants authority |
| U2 | Can this component deny execution authority? | **No** | Unconstitutional: Only EAG denies authority |
| U3 | Can this component bypass the EAG? | **No** | Unconstitutional: All execution flows through EAG |
| U4 | Can this component execute capabilities without EAG Permit? | **No** | Unconstitutional: Permit required for all execution |

---

### Mutation Questions

| # | Question | Required Answer | If "Yes" |
|---|----------|-----------------|----------|
| U5 | Can this component modify incoming requests? | **No** | Unconstitutional: Requests must reach EAG unchanged |
| U6 | Can this component modify scope declarations? | **No** | Unconstitutional: Scope is immutable after intake |
| U7 | Can this component modify provenance? | **No** | Unconstitutional: Provenance is immutable |
| U8 | Can this component modify caller chains? | **No** | Unconstitutional: Chains are constructed, not modified |
| U9 | Can this component modify audit records? | **No** | Unconstitutional: Audit is append-only |

---

### Inference Questions

| # | Question | Required Answer | If "Yes" |
|---|----------|-----------------|----------|
| U10 | Can this component infer missing intent? | **No** | Unconstitutional: Missing intent → denial |
| U11 | Can this component infer missing scope? | **No** | Unconstitutional: Missing scope → denial |
| U12 | Can this component infer missing provenance? | **No** | Unconstitutional: Missing provenance → denial |
| U13 | Can this component infer missing caller chain links? | **No** | Unconstitutional: Gaps → denial |
| U14 | Can this component guess or default any required input? | **No** | Unconstitutional: All inputs must be explicit |

---

### Bypass Questions

| # | Question | Required Answer | If "Yes" |
|---|----------|-----------------|----------|
| U15 | Can this component skip validation steps? | **No** | Unconstitutional: All validation is mandatory |
| U16 | Can this component cache authorization decisions? | **No** | Unconstitutional: Each invocation requires fresh evaluation |
| U17 | Can this component retry denied requests? | **No** | Unconstitutional: Denial is final |
| U18 | Can this component delegate execution to another component? | **No** | Unconstitutional: Authorization is non-transferable |

---

### State Questions

| # | Question | Required Answer | If "Yes" |
|---|----------|-----------------|----------|
| U19 | Does this component remember prior authorization decisions? | **No** | Unconstitutional: Stateless evaluation |
| U20 | Does this component learn from execution outcomes? | **No** | Unconstitutional: No behavioral adaptation |
| U21 | Does this component accumulate trust over time? | **No** | Unconstitutional: No accumulated trust |

---

## 4. Role-Specific Checklists

### 4.1 Skill Checklist

Additional questions for skill artifacts:

| # | Question | Required Answer | If "Yes" |
|---|----------|-----------------|----------|
| S1 | Can this skill construct its own caller chain? | **No** | Unconstitutional: Platform constructs chains |
| S2 | Can this skill construct its own provenance? | **No** | Unconstitutional: Platform constructs provenance |
| S3 | Can this skill construct its own audit context? | **No** | Unconstitutional: Platform constructs audit context |
| S4 | Can this skill expand its own scope? | **No** | Unconstitutional: Scope fixed at intake |
| S5 | Can this skill elevate its own classification? | **No** | Unconstitutional: Classification is platform-controlled |
| S6 | Can this skill invoke capabilities outside declared scope? | **No** | Unconstitutional: Scope is maximum boundary |

---

### 4.2 Runtime Component Checklist

Additional questions for runtime components:

| # | Question | Required Answer | If "Yes" |
|---|----------|-----------------|----------|
| R1 | Can this component execute before EAG decision? | **No** | Unconstitutional: Speculative execution prohibited |
| R2 | Can this component execute after EAG denial? | **No** | Unconstitutional: Denial is final |
| R3 | Can this component modify requests before EAG submission? | **No** | Unconstitutional: Unchanged submission |
| R4 | Can this component provide guidance on failures? | **No** | Unconstitutional: Cannot advise |
| R5 | Can this component hold authorization state between invocations? | **No** | Unconstitutional: Stateless |
| R6 | Can this component perform intake operations? | **No** | Unconstitutional: Intake is administrative |

---

### 4.3 Validator Component Checklist

Additional questions for validation components:

| # | Question | Required Answer | If "Yes" |
|---|----------|-----------------|----------|
| V1 | Can this validator modify artifacts to make them valid? | **No** | Unconstitutional: Cannot repair |
| V2 | Can this validator infer missing fields? | **No** | Unconstitutional: Cannot enrich |
| V3 | Can this validator provide remediation guidance? | **No** | Unconstitutional: Cannot advise |
| V4 | Can this validator cache validation results? | **No** | Unconstitutional: Fresh validation required |
| V5 | Can this validator skip rules? | **No** | Unconstitutional: All rules mandatory |
| V6 | Can this validator grant authority? | **No** | Unconstitutional: Validators check, not authorize |

---

### 4.4 EAG Component Checklist

Additional questions for EAG implementation:

| # | Question | Required Answer | If "Yes" |
|---|----------|-----------------|----------|
| E1 | Can the EAG infer any missing input category? | **No** | Unconstitutional: Cannot infer |
| E2 | Can the EAG mutate requests to make them permissible? | **No** | Unconstitutional: Cannot mutate |
| E3 | Can the EAG enrich incomplete requests? | **No** | Unconstitutional: Cannot enrich |
| E4 | Can the EAG delegate decisions to other components? | **No** | Unconstitutional: Cannot delegate |
| E5 | Can the EAG persist decisions for reuse? | **No** | Unconstitutional: Cannot persist |
| E6 | Can the EAG provide suggestions on denial? | **No** | Unconstitutional: Cannot advise |
| E7 | Can the EAG initiate capability invocations? | **No** | Unconstitutional: Cannot originate |
| E8 | Can the EAG return anything other than Permit/Deny? | **No** | Unconstitutional: Binary output only |

---

### 4.5 Intake Component Checklist

Additional questions for intake components:

| # | Question | Required Answer | If "Yes" |
|---|----------|-----------------|----------|
| I1 | Can intake be performed by a runtime component? | **No** | Unconstitutional: Intake is administrative |
| I2 | Can intake be performed by a skill? | **No** | Unconstitutional: Intake is administrative |
| I3 | Can intake modify skills during admission? | **No** | Unconstitutional: Skills admitted unchanged |
| I4 | Can intake assign trusted classification directly? | **No** | Unconstitutional: Default is sandboxed |
| I5 | Can intake records be modified after creation? | **No** | Unconstitutional: Intake records immutable |
| I6 | Can intake bypass validation rules? | **No** | Unconstitutional: All rules mandatory |

---

## 5. Checklist Summary

| Checklist | Questions | All Must Be "No" |
|-----------|-----------|------------------|
| Universal | 21 | Yes |
| Skill-Specific | 6 | Yes |
| Runtime-Specific | 6 | Yes |
| Validator-Specific | 6 | Yes |
| EAG-Specific | 8 | Yes |
| Intake-Specific | 6 | Yes |
| **Total Unique** | **53** | **Yes** |

---

## 6. Conformance Declaration

A component is conformant if and only if:

1. All applicable checklist questions are answered "No"
2. Answers are documented with justification
3. Answers remain valid after any modification
4. Component passes all relevant adversarial test vectors (Phase 6.2)

---

## 7. Non-Conformance Remediation

If any answer is "Yes":

1. **Stop**: Do not proceed with the component
2. **Analyze**: Identify why the capability exists
3. **Redesign**: Remove the capability entirely
4. **Re-evaluate**: Run the checklist again
5. **Document**: Record the remediation

**There is no "acceptable deviation" from this checklist.**

---

## 8. Audit Requirement

For each component:

1. Complete the applicable checklist
2. Document each answer with evidence
3. Store the completed checklist in the audit trail
4. Re-evaluate on any component modification
5. Maintain version history of checklist responses

---

**End of Minimal Conformance Checklist**
