# Phase 5.1 — Skill Intake Validation Contract (Derived)

**Status:** Derived (Locked)
**Authority Impact:** None
**Depends On:** Phases 1–4 (Locked)
**Version:** 1.0.0
**Date:** 2026-02-04

---

## 1. Purpose of Skill Intake Validation

Skill Intake Validation is a deterministic, fail-closed gate that evaluates skill artifacts before admission to the platform. Its sole purpose is to ensure that no artifact violating constitutional constraints can reach the Execution Authority Gate (EAG).

Intake validation does not grant authority. It does not evaluate intent. It does not interpret scope. It produces a binary outcome: **Admit** or **Reject**.

---

## 2. Non-Authority Guarantees

Skill Intake Validation:

| Guarantee | Constitutional Source |
|-----------|----------------------|
| Cannot grant execution authority | Phase Anchor §4: Authority Model |
| Cannot elevate trust classification | Provenance §6.2: Classification cannot be elevated at runtime |
| Cannot modify skill artifacts | EAG §7.2: Cannot Mutate |
| Cannot infer missing scope | EAG §7.1: Cannot Infer |
| Cannot enrich incomplete declarations | EAG §7.3: Cannot Enrich |
| Cannot interpret scope semantics | Declared Scope §Ground Rules: Scope does not reason |
| Cannot expand declared boundaries | Declared Scope §8: Scope Immutability Rules |
| Cannot create provenance attestations for skills | Provenance §11: Cannot be constructed by the EAG |
| Cannot issue trust grants | Provenance §7.2: Trust Grant Constraint |

Intake validation is a predicate evaluator with audit output. It is not a policy engine.

---

## 3. Validation Inputs

Intake validation receives exactly one input: a **Skill Artifact** submitted for admission.

The skill artifact must contain:

| Component | Required Contents | Source |
|-----------|-------------------|--------|
| Skill Identity | Unique identifier, version | Declared Scope §3.3 |
| Declared Scope | Complete scope declaration | Declared Scope §1 |
| Skill Payload | Executable definition (for hashing) | Provenance §3.1 |
| Authorship Attestation | Origin claims (for provenance) | Provenance §7.1 |

Intake validation does not receive:
- Runtime context
- Session information
- Caller chain (intake is not an invocation)
- Prior skill history (each intake is independent)

---

## 4. Validation Rules

All rules are binary. Failure of any rule results in rejection.

---

### Rule 1: Scope Declaration Presence

**Statement:** The skill artifact MUST contain a Declared Scope declaration.

**Failure Condition:** Declared Scope is absent, null, or empty (unless skill invokes no capabilities).

**Constitutional Source:** Declared Scope §1 Definition; Empty Scope Invariant (§12)

---

### Rule 2: Scope Finiteness

**Statement:** The Declared Scope MUST be finite and enumerable at intake time.

**Failure Condition:** Scope contains unbounded elements, infinite sets, or elements that cannot be enumerated.

**Constitutional Source:** Declared Scope §3.1 Enumerability; Wildcard Finiteness Invariant (§12)

---

### Rule 3: Scope Element Completeness

**Statement:** Each Scope Element MUST contain all four required components: Capability Type, Permitted Operations, Parameter Boundaries, Immutable Identifier.

**Failure Condition:** Any scope element is missing one or more required components.

**Constitutional Source:** Declared Scope §4 Definition

---

### Rule 4: Scope Element Identifier Uniqueness

**Statement:** Each Scope Element identifier MUST be unique within the skill.

**Failure Condition:** Two or more scope elements share the same identifier.

**Constitutional Source:** Declared Scope §3.3: "unique within the skill"

---

### Rule 5: Scope Element Identifier Opacity

**Statement:** Scope Element identifiers MUST be opaque tokens with no semantic content that tooling could interpret.

**Failure Condition:** Identifier contains structured data, hierarchical paths, or semantic markers that imply meaning beyond identity.

**Constitutional Source:** Declared Scope §3.3; Identifier Opacity Invariant (§12)

---

### Rule 6: Capability Type Validity

**Statement:** Each Scope Element MUST reference a capability type from the platform-defined closed set.

**Failure Condition:** Scope element references an undefined, unknown, or skill-defined capability type.

**Constitutional Source:** Declared Scope §3.2; Capability Type Closure Invariant (§12)

---

### Rule 7: Capability Version Binding

**Statement:** Each Scope Element MUST be bound to a specific capability type version.

**Failure Condition:** Scope element references a capability type without version binding, or references "latest" or similar dynamic version specifiers.

**Constitutional Source:** Declared Scope §12: Capability Version Binding Invariant

---

### Rule 8: Operation Enumeration

**Statement:** Permitted operations within each Scope Element MUST be individually enumerated.

**Failure Condition:** Scope element contains operation wildcards (e.g., `*`, `all`, `any`) or implicit operation sets.

**Constitutional Source:** Declared Scope §3.2; Operation Enumeration Invariant (§12)

---

### Rule 9: Parameter Boundary Explicitness

**Statement:** Parameter boundaries MUST be explicit and fully resolved.

**Failure Condition:** Boundaries contain variables, placeholders, templates, or unresolved references.

**Constitutional Source:** Declared Scope §5; Boundary Resolution Invariant (§12)

---

### Rule 10: Parameter Boundary Determinism

**Statement:** Parameter boundaries MUST be deterministically evaluable as predicates.

**Failure Condition:** Boundaries contain probabilistic rules, natural language descriptions, conditional logic, or runtime-resolved values.

**Constitutional Source:** Declared Scope §5 Prohibited Boundary Forms

---

### Rule 11: Parameter Boundary Predicate Complexity

**Statement:** Boundary predicates MUST be evaluable in constant or linear time with no external state, recursion, or backtracking.

**Failure Condition:** Boundary predicate requires exponential time, external lookups, recursive evaluation, or backtracking patterns.

**Constitutional Source:** Declared Scope §12: Predicate Complexity Invariant

---

### Rule 12: Range Boundary Closure

**Statement:** Range boundaries MUST be closed and finite.

**Failure Condition:** Range is open-ended (unbounded above or below), infinite, or has undefined limits.

**Constitutional Source:** Declared Scope §5; Range Closure Invariant (§12)

---

### Rule 13: Value Set Cardinality

**Statement:** Explicit value sets MUST NOT exceed the platform-defined maximum cardinality.

**Failure Condition:** Value set exceeds maximum cardinality limit.

**Constitutional Source:** Declared Scope §12: Value Set Cardinality Invariant

---

### Rule 14: Structural Containment Staticness

**Statement:** Structural containment boundaries MUST reference static, enumerable structures defined at intake.

**Failure Condition:** Containment references runtime-resolved paths, dynamic structures, or user-relative locations.

**Constitutional Source:** Declared Scope §5; Containment Staticness Invariant (§12)

---

### Rule 15: Scope Element Independence

**Statement:** Scope elements MUST be independent and self-contained.

**Failure Condition:** Scope element references, extends, inherits from, or composes with another scope element.

**Constitutional Source:** Declared Scope §4; Scope Independence Invariant (§12)

---

### Rule 16: No Scope Inheritance

**Statement:** Declared Scope MUST be explicitly authored for this skill.

**Failure Condition:** Scope is inherited from a template, parent skill, default set, or derived from another source.

**Constitutional Source:** Declared Scope §12: No Scope Inheritance Invariant

---

### Rule 17: Scope Element Atomicity

**Statement:** Scope elements MUST be atomic and indivisible.

**Failure Condition:** Scope element is structured to allow partial application or conditional activation.

**Constitutional Source:** Declared Scope §4: "Scope Elements are atomic and indivisible"

---

### Rule 18: No Executable Logic in Scope

**Statement:** Declared Scope MUST NOT contain executable logic.

**Failure Condition:** Scope declaration contains code, scripts, functions, or executable expressions.

**Constitutional Source:** Declared Scope §10: "Cannot contain executable logic"

---

### Rule 19: No Runtime State References

**Statement:** Declared Scope MUST NOT reference runtime state.

**Failure Condition:** Scope references session variables, user context, environment state, or dynamic configuration.

**Constitutional Source:** Declared Scope §10: "Cannot reference runtime state"

---

### Rule 20: No Embedded Policy

**Statement:** Declared Scope MUST NOT embed policy decisions.

**Failure Condition:** Scope contains conditional permissions, role-based logic, or policy expressions.

**Constitutional Source:** Declared Scope §10: "Cannot embed policy decisions"

---

### Rule 21: Minimal Scope Requirement

**Statement:** Scope elements MUST be minimally scoped to operations actually required.

**Failure Condition:** Scope element encompasses all operations of a capability type without operational justification.

**Constitutional Source:** Declared Scope §12: Minimal Scope Invariant

---

### Rule 22: Skill Identity Uniqueness

**Statement:** The skill identity MUST be unique within the platform namespace.

**Failure Condition:** Identity collides with an existing skill (unless this is a re-intake, which produces new identity per Rule 23).

**Constitutional Source:** Declared Scope §12: Re-Intake Identity Invariant

---

### Rule 23: Re-Intake Identity Separation

**Statement:** Re-intake with scope expansion MUST produce a new skill identity.

**Failure Condition:** Re-intake expands scope while preserving the original skill identity.

**Constitutional Source:** Declared Scope §12: Re-Intake Identity Invariant; Phase Anchor §8: Intake Authority Invariant

---

### Rule 24: Skill Hash Computation

**Statement:** A cryptographic hash of the skill artifact MUST be computed and recorded at intake.

**Failure Condition:** Hash cannot be computed, or hash computation is deferred.

**Constitutional Source:** Provenance §3.1: Skill hash; §7.1: Hash recorded at intake

---

### Rule 25: Intake Record Creation

**Statement:** An intake record MUST be created containing intake report identifier, skill hash, intake authority, and intake timestamp.

**Failure Condition:** Intake record is incomplete, missing required fields, or not persisted.

**Constitutional Source:** Provenance §3.1 Source Reference; §7.1 At Intake

---

### Rule 26: Initial Classification Assignment

**Statement:** An initial classification MUST be assigned (default: `sandboxed`).

**Failure Condition:** Skill is admitted without classification, or with classification other than the three valid levels.

**Constitutional Source:** Provenance §4.1; §7.1: "Initial classification is assigned"

---

### Rule 27: Provenance Record Immutability

**Statement:** The provenance record created at intake MUST be immutable from the point of creation.

**Failure Condition:** Provenance record is created in a mutable state, or can be modified after creation.

**Constitutional Source:** Provenance §7.1: "Provenance record is immutable from this point"; §12.1 Immutability

---

### Rule 28: Intake Authority Recording

**Statement:** The intake process MUST record which authority performed the intake.

**Failure Condition:** Intake occurs without recording the performing authority.

**Constitutional Source:** Provenance §3.1: "Intake authority"; Phase Anchor §8: Intake Authority Invariant

---

### Rule 29: Intake Audit Trail

**Statement:** The intake event MUST be recorded in an audit trail.

**Failure Condition:** Intake occurs without audit record, or audit record is incomplete.

**Constitutional Source:** Phase Anchor §8: Intake Authority Invariant: "The intake process is subject to audit"

---

### Rule 30: No Runtime Component Intake

**Statement:** Intake MUST NOT be performed by a runtime component.

**Failure Condition:** Intake is performed by a skill, agent, command, or runtime process.

**Constitutional Source:** Phase Anchor §8: Intake Authority Invariant: "No runtime component may perform intake"

---

---

## 5. Rejection Semantics

### 5.1 Rejection is Terminal

If any validation rule fails:
- The skill artifact is rejected
- No partial admission occurs
- No remediation is attempted
- No suggestion is provided

### 5.2 Rejection is Immediate

Validation may fail-fast on first rule violation. Comprehensive validation (checking all rules) is permitted but not required.

### 5.3 Rejection is Audited

Every rejection MUST be recorded with:
- Skill artifact identifier (if determinable)
- Failed rule number(s)
- Timestamp
- Intake authority that attempted admission

### 5.4 Rejection Does Not Provide Guidance

The rejection record:
- Identifies which rule(s) failed
- Does NOT explain how to fix the artifact
- Does NOT suggest alternatives
- Does NOT provide examples

**Constitutional Source:** EAG §7.7: Cannot Advise

---

## 6. Immutability Guarantees Post-Intake

Upon successful intake:

| Artifact | Immutability Guarantee | Source |
|----------|----------------------|--------|
| Skill hash | Permanent; never modified | Provenance §12.1 |
| Declared Scope | Fixed; expansion requires re-intake | Declared Scope §8 |
| Scope element identifiers | Immutable after intake | Declared Scope §3.3 |
| Intake timestamp | Permanent | Provenance §3.1 |
| Initial classification basis | Recorded permanently | Provenance §12.1 |
| Provenance record | Immutable from creation | Provenance §7.1 |

Any modification to these artifacts invalidates the skill and triggers integrity failure at invocation time.

---

## 7. Audit & Traceability Requirements

### 7.1 Intake Audit Record

Every intake (successful or rejected) MUST produce an audit record containing:

| Field | Required | Source |
|-------|----------|--------|
| Intake event type (admit/reject) | Yes | Phase Anchor §8 |
| Timestamp | Yes | Provenance §3.1 |
| Intake authority | Yes | Provenance §3.1 |
| Skill artifact hash | Yes | Provenance §3.1 |
| Validation outcome | Yes | Derived |
| Failed rules (if rejected) | If applicable | Derived |

### 7.2 Audit Independence

The audit store for intake records:
- MUST be append-only
- MUST NOT be modifiable by skills, agents, or runtime components
- MUST be independently queryable

**Constitutional Source:** Provenance §12.3 Auditability; Runtime Boundary §10: Audit Emission Invariant

---

## 8. Traceability Matrix

| Rule | Document | Section |
|------|----------|---------|
| 1 | Declared Scope | §1, §12 (Empty Scope) |
| 2 | Declared Scope | §3.1, §12 (Wildcard Finiteness) |
| 3 | Declared Scope | §4 |
| 4 | Declared Scope | §3.3 |
| 5 | Declared Scope | §3.3, §12 (Identifier Opacity) |
| 6 | Declared Scope | §3.2, §12 (Capability Type Closure) |
| 7 | Declared Scope | §12 (Capability Version Binding) |
| 8 | Declared Scope | §3.2, §12 (Operation Enumeration) |
| 9 | Declared Scope | §5, §12 (Boundary Resolution) |
| 10 | Declared Scope | §5 |
| 11 | Declared Scope | §12 (Predicate Complexity) |
| 12 | Declared Scope | §5, §12 (Range Closure) |
| 13 | Declared Scope | §12 (Value Set Cardinality) |
| 14 | Declared Scope | §5, §12 (Containment Staticness) |
| 15 | Declared Scope | §4, §12 (Scope Independence) |
| 16 | Declared Scope | §12 (No Scope Inheritance) |
| 17 | Declared Scope | §4 |
| 18 | Declared Scope | §10 |
| 19 | Declared Scope | §10 |
| 20 | Declared Scope | §10 |
| 21 | Declared Scope | §12 (Minimal Scope) |
| 22 | Declared Scope | §12 (Re-Intake Identity) |
| 23 | Declared Scope, Phase Anchor | §12 (Re-Intake Identity), §8 |
| 24 | Provenance | §3.1, §7.1 |
| 25 | Provenance | §3.1, §7.1 |
| 26 | Provenance | §4.1, §7.1 |
| 27 | Provenance | §7.1, §12.1 |
| 28 | Provenance, Phase Anchor | §3.1, §8 |
| 29 | Phase Anchor | §8 |
| 30 | Phase Anchor | §8 |

---

## 9. Explicit Non-Goals

This contract does NOT define:

| Non-Goal | Reason |
|----------|--------|
| How to author valid skills | Intake validates; it does not guide |
| Remediation paths for failed intake | Intake rejects; it does not advise |
| Runtime validation behavior | Intake is pre-runtime |
| EAG evaluation behavior | EAG is a separate constitutional boundary |
| Trust grant procedures | Trust grants are post-intake administrative actions |
| Provenance elevation | Classification elevation is outside intake |
| Scope interpretation | Scope is evaluated as predicates, not interpreted |
| Intent validation | Intent is invocation-time; intake precedes invocation |
| Caller chain construction | Caller chains exist only at invocation time |
| Storage format or schema | This is a validation contract, not an implementation spec |
| UI or authoring tooling | Tooling is implementation, not constitution |

---

## 10. Contract Compliance Statement

If this contract is followed mechanically:

1. No skill with unbounded, dynamic, or unverifiable scope can be admitted
2. No skill can self-declare its own provenance or classification
3. No skill can bypass intake through runtime paths
4. No unconstitutional artifact can reach the Execution Authority Gate
5. Every admitted skill has an immutable, auditable provenance record
6. Every admission or rejection is independently verifiable

**This contract produces constitutional compliance through mechanical application. Judgment, interpretation, and discretion are prohibited.**

---

**End of Skill Intake Validation Contract**
