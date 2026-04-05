# Intent Semantics Definition

**Status:** Locked — Constitutional Truth
**Version:** 1.0.0
**Date:** 2026-02-04

---

## 1. Definition

**Declared Intent** is a structured assertion, provided as part of a capability invocation request, that:

1. States the specific purpose of the invocation
2. Explicitly references the element of the invoking skill's declared scope that the invocation serves
3. Enables the Execution Authority Gate to evaluate consistency as a predicate without interpretation

Declared Intent is an **input artifact**, not a runtime product. It arrives with the request, fully formed.

---

## 2. Structure

A well-formed Declared Intent contains exactly two components:

### 2.1 Purpose Statement

- A concrete assertion of what the specific invocation aims to accomplish
- Must be specific to this invocation (not reusable across arbitrary invocations)
- Must reference the actual capability, operation, and parameters being requested
- Must not contain placeholders, unresolved references, or conditional language

### 2.2 Scope Reference

- An explicit identifier referencing a specific element within the invoking skill's declared scope
- Must be a structural reference (identifier, key, or path), not a semantic description
- Must correspond to an element that actually exists in the skill's declared scope
- Must identify a scope element that permits the capability type being requested

The Scope Reference exists to make consistency checking a **lookup operation**, not a **judgment**.

---

## 3. Validity Conditions

Declared Intent is **valid** if and only if all of the following hold:

| Condition | Rationale |
|-----------|-----------|
| Both components (Purpose Statement, Scope Reference) are present | Completeness requirement |
| Purpose Statement is specific to this invocation | Locked requirement: "specific to the invocation" |
| Purpose Statement references the actual request parameters | Ensures intent matches request |
| Scope Reference is a structural identifier, not free text | Enables predicate evaluation without interpretation |
| Scope Reference corresponds to an element in the skill's declared scope | Consistency is checkable |
| Neither component contains unresolved references | Derived constraint: no placeholders |
| Neither component references future state or execution outcomes | Derived constraint: evaluation occurs before execution |

If any condition fails, the intent is **invalid** and the request is denied.

---

## 4. Consistency Semantics

The EAG evaluates: **"Declared intent is consistent with the skill's declared scope"**

This predicate is **true** if and only if:

1. **Scope Reference resolves:** The identifier in the Scope Reference exists in the invoking skill's declared scope
2. **Capability alignment:** The scope element permits the capability type being requested
3. **Parameter containment:** The request parameters fall within the boundaries defined by the scope element
4. **Purpose plausibility:** The Purpose Statement does not contradict the scope element's declared function

### 4.1 Evaluation Mechanics

| Check | Method | Failure Mode |
|-------|--------|--------------|
| Scope Reference resolves | Lookup: Is identifier present in declared scope? | Reference to nonexistent scope element |
| Capability alignment | Match: Does scope element permit this capability type? | Capability not covered by referenced scope |
| Parameter containment | Boundary check: Do parameters fall within scope element's constraints? | Parameters exceed scope boundaries |
| Purpose plausibility | Contradiction check: Does purpose explicitly contradict scope element? | Stated purpose incompatible with scope element |

### 4.2 What "Plausibility" Means (Narrowly Defined)

"Purpose plausibility" is **not** semantic interpretation. It is a **contradiction check**:

- If the scope element declares "read-only access" and the purpose states "to modify the file" → contradiction → inconsistent
- If the scope element declares "access to /config/" and the purpose states "to read /config/settings.json" → no contradiction → plausible
- If the purpose makes no claim that contradicts the scope element → plausible by default

The EAG does **not** evaluate whether the purpose is "good," "reasonable," or "optimal." It evaluates whether the purpose **explicitly contradicts** the referenced scope.

**Absence of contradiction is sufficient. Positive justification is not required.**

---

## 5. Failure Modes

### 5.1 Structural Failures (Intent is malformed)

| Failure | Description |
|---------|-------------|
| Missing Purpose Statement | Intent lacks the first required component |
| Missing Scope Reference | Intent lacks the second required component |
| Unresolved reference in Purpose Statement | Contains placeholder or variable requiring resolution |
| Non-structural Scope Reference | Scope Reference is free text rather than an identifier |
| Purpose references execution outcome | Circular dependency on result of the invocation being requested |

### 5.2 Consistency Failures (Intent is well-formed but inconsistent)

| Failure | Description |
|---------|-------------|
| Scope Reference does not resolve | The identifier does not exist in the skill's declared scope |
| Capability misalignment | The scope element does not permit the requested capability type |
| Parameter boundary violation | Request parameters exceed the scope element's constraints |
| Purpose contradiction | Purpose Statement explicitly contradicts the scope element's function |

### 5.3 Specificity Failures (Intent is generic)

| Failure | Description |
|---------|-------------|
| Purpose is invocation-agnostic | Purpose could apply to any invocation of this capability type |
| Purpose does not reference request parameters | Purpose is decoupled from the specific request |
| Purpose is a tautology | Purpose restates the request without asserting why |

---

## 6. Explicit Prohibitions

Declared Intent:

| Cannot | Rationale |
|--------|-----------|
| Cannot be inferred by the EAG | Locked: "Missing intent cannot be guessed" |
| Cannot be enriched by the EAG | EAG prohibition: Cannot Enrich |
| Cannot be modified to become consistent | EAG prohibition: Cannot Mutate |
| Cannot reference execution results | Results do not exist at evaluation time |
| Cannot depend on prior invocations | EAG is stateless |
| Cannot be conditional | Must be evaluable as static predicate |
| Cannot be generic | Locked: "Generic intent... is inadmissible" |
| Cannot omit scope reference | Consistency requires explicit structural reference |

---

## 7. Relationship to Other Input Categories

| Category | Relationship to Declared Intent |
|----------|--------------------------------|
| Request | Intent must reference the Request's capability, operation, and parameters |
| Caller Chain | Intent is provided by the immediate invoker; chain traces origin |
| Authorization State | Contains the declared scope against which intent is evaluated |
| Provenance | Determines trust classification; does not affect intent validity directly |
| Audit Context | Intent is captured in audit records for reconstruction |

Declared Intent does **not** subsume any other category. It is a distinct assertion that enables scope-consistency evaluation.

---

## 8. Consistency with Locked Ground Truth

| Locked Constraint | How This Definition Complies |
|-------------------|------------------------------|
| Intent must include stated purpose | §2.1 Purpose Statement |
| Intent must include relationship to declared scope | §2.2 Scope Reference |
| Generic intent is inadmissible | §5.3 Specificity Failures |
| Intent must be specific to the invocation | §3 Validity Conditions |
| Missing intent cannot be inferred | §6 Explicit Prohibitions |
| Consistency is a Permit condition | §4 Consistency Semantics |
| Inconsistency triggers Deny | §5.2 Consistency Failures |
| EAG evaluates predicates only | §4.1 Evaluation Mechanics (lookup, match, boundary check, contradiction check) |
| EAG does not interpret | §4.2 Plausibility is contradiction-only, not semantic judgment |

---

**End of Intent Semantics Definition**
