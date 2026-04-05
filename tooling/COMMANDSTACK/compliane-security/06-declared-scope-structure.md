# Declared Scope Structure Definition

**Status:** Locked — Constitutional Truth
**Version:** 1.0.0
**Date:** 2026-02-04

---

## Phase 4 Objective (Locked)

Define the conceptual structure of Declared Scope such that:

- It can be referenced structurally by Declared Intent
- It can be evaluated as predicates by the Execution Authority Gate (EAG)
- It does not embed policy, reasoning, or interpretation
- It does not grant authority, only constrain it
- It is static, explicit, finite, and enumerable

This phase answers one question only:

> **What shape must "scope" have so that intent consistency, provenance constraints, and capability authorization can be evaluated without inference?**

---

## Phase 4 Ground Rules (Non-Negotiable)

The following are already locked and apply fully here:

- Scope does not execute
- Scope does not authorize
- Scope does not reason
- Scope does not infer
- Scope is not dynamic
- Scope is not runtime-generated
- Scope is evaluated only as lookup + boundary checks
- Scope is an input to the EAG, never an output

**Any design that violates these is invalid by definition.**

---

## 1. Definition: Declared Scope

### Conceptual Definition

Declared Scope is a structured, immutable declaration attached to a skill that:

1. Enumerates the maximum set of capability operations the skill may ever request
2. Defines explicit boundaries for each permitted operation
3. Provides stable identifiers that Declared Intent may reference
4. Enables the EAG to evaluate authorization as predicates without interpretation

**Declared Scope is restrictive by nature.**
It limits what may be requested; it never causes execution.

---

## 2. Scope Is a Constraint Set, Not Permission

Declared Scope does not grant permission.

Effective permission at runtime is always the intersection of:

```
Declared Scope
∩ Provenance Classification
∩ Declared Intent
∩ Authorization Rules
```

**Scope alone is never sufficient to authorize execution.**

---

## 3. Structural Requirements of Declared Scope

A valid Declared Scope must satisfy all of the following:

### 3.1 Enumerability

- Scope must be finite and enumerable at intake
- Implicit, open-ended, or unbounded permissions are prohibited
- If a boundary cannot be enumerated or mechanically checked, it is invalid

### 3.2 Capability-Scoped Structure

- Scope is organized by capability type
- Each scope element corresponds to:
  - One capability type
  - One or more explicitly enumerated operations
  - Explicit parameter boundaries
- Scope is never organized by intent, agent, command, or session

### 3.3 Stable Scope Element Identifiers

Each scope element must have an identifier that:

- Is unique within the skill
- Is immutable after intake
- Is referenceable by Declared Intent
- Has no semantic meaning beyond identity

**Identifiers are structural handles, not descriptions.**

---

## 4. Scope Element (Conceptual Unit)

### Definition

A Scope Element is the smallest indivisible unit of declared scope.

Each Scope Element defines:

- Capability Type
- Permitted Operations
- Parameter Boundaries
- Immutable Identifier

**Scope Elements are atomic and indivisible.**
They cannot be partially applied or composed.

---

## 5. Parameter Boundary Semantics

Parameter boundaries must be:

- Explicit
- Deterministic
- Predicate-evaluable
- Non-inferential

### Allowed Boundary Forms (Conceptual)

- Explicit value sets
- Closed numeric or lexical ranges
- Finite prefixes
- Static structural containment

### Prohibited Boundary Forms

- Natural language descriptions
- Probabilistic rules
- Conditional logic
- Runtime-resolved values
- Variables, placeholders, or templates

**If a boundary cannot be checked mechanically using only request inputs, it is invalid.**

---

## 6. Relationship Between Scope and Intent

Declared Intent must reference exactly one Scope Element identifier.

This guarantees:

- Intent–scope alignment is a lookup
- Consistency is decidable
- No interpretation is required

**Intent does not expand scope.**
Intent only selects which scope element it claims to operate under.

---

## 7. Scope and Provenance Interaction

- Declared Scope defines what a skill could request
- Provenance Classification defines what a skill is allowed to request

Rules:

- Scope may include elements that provenance later disallows
- Provenance never expands scope
- Effective permission is always the intersection

---

## 8. Scope Immutability Rules

Declared Scope:

- Is fixed at skill intake
- Cannot be expanded at runtime
- Cannot be inferred or synthesized
- Cannot be modified by intent
- Cannot be altered by the runtime

**Any scope change requires re-intake.**

---

## 9. Scope Failure Semantics

A capability invocation must be denied if:

- No scope element matches the requested capability
- The intent references a nonexistent scope element
- The scope element does not permit the requested operation
- Request parameters exceed declared boundaries

**Failure is immediate and terminal.**

---

## 10. Explicit Prohibitions

Declared Scope:

- Cannot contain executable logic
- Cannot reference runtime state
- Cannot embed policy decisions
- Cannot be conditional
- Cannot be open-ended
- Cannot be inferred by the EAG
- Cannot be enriched by the runtime

---

## 11. Scope of This Phase

### What Phase 4 Covers

- Conceptual structure of Declared Scope
- Relationship to Intent, Provenance, and EAG
- Boundary semantics
- Failure rules

### What Phase 4 Does NOT Cover

- Concrete schemas
- Storage formats
- Authoring tools
- UI representations
- Runtime enforcement mechanisms

**These belong to later phases.**

---

## 12. Declared Scope Invariants (Locked)

The following invariants are constitutional and non-negotiable:

### Wildcard Finiteness Invariant
Wildcard boundaries must expand to a finite, decidable set at intake. Unbounded wildcards are invalid.

### Containment Staticness Invariant
Structural containment boundaries must reference static, enumerable structures defined at intake. Runtime-resolved containment is prohibited.

### Range Closure Invariant
Range boundaries must be closed and finite. Open-ended ranges are prohibited.

### Minimal Scope Invariant
Scope elements must be minimally scoped to operations actually required. Capability-wide scope elements are invalid.

### Capability Type Closure Invariant
Capability types are platform-defined and form a closed set. Skill authors may not introduce new capability types.

### Re-Intake Identity Invariant
Re-intake that expands scope produces a new skill identity. Trust and provenance do not transfer.

### Empty Scope Invariant
A skill with empty Declared Scope may not invoke any capability.

### Scope Independence Invariant
Scope elements are independent and self-contained. They may not reference or compose with other scope elements.

### Capability Version Binding Invariant
Scope elements are bound to a specific capability type version. Capability evolution does not modify existing scope.

### Predicate Complexity Invariant
Boundary predicates must be evaluable in constant or linear time with no external state, recursion, or backtracking.

### Value Set Cardinality Invariant
Explicit value sets must not exceed a platform-defined maximum cardinality.

### Operation Enumeration Invariant
Permitted operations must be individually enumerated. Operation wildcards are prohibited.

### Boundary Resolution Invariant
Scope boundaries must be fully resolved at intake. Variables, placeholders, and templates are prohibited.

### Identifier Opacity Invariant
Scope element identifiers are opaque tokens. Tooling must not interpret identifier content.

### No Scope Inheritance Invariant
Declared Scope must be explicitly authored per skill. Inheritance, templates, defaults, and derived scope are prohibited.

---

**End of Declared Scope Structure Definition**
