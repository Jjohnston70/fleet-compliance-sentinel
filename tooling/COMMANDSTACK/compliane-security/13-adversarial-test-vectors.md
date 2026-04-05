# Phase 6.2 — Adversarial Test Vectors

**Status:** Conformance Reference (Locked)
**Authority Impact:** None
**Depends On:** Phases 1–5 (Locked)
**Version:** 1.0.0
**Date:** 2026-02-04

---

## 1. Purpose

This document defines a corpus of invalid artifacts that any constitutional implementation **must reject**. These test vectors represent adversarial attempts to bypass, subvert, or exploit the constitutional model.

If an implementation passes all these tests (correctly rejects all vectors), it provides evidence of constitutional conformance.

**This is the primary defense mechanism for the system years after initial implementation.**

---

## 2. Test Vector Categories

| Category | Attack Surface | Document Reference |
|----------|----------------|-------------------|
| A | Intent Laundering | Phase 5.2, Intent Semantics |
| B | Scope Smuggling | Phase 5.1, Declared Scope |
| C | Provenance Spoofing | Phase 5.4, Provenance Rules |
| D | Chain Replay/Injection | Phase 5.3, Caller Chain |
| E | Runtime Shortcut | Phase 3, Runtime Boundary |
| F | Validation Bypass | Phase 5.5, Assembly Validation |
| G | Authority Escalation | Phase Anchor, EAG |

---

## 3. Category A: Intent Laundering

Attempts to disguise actual intent or reuse intent across invocations.

---

### A.1: Generic Intent Substitution

**Vector:** Intent with generic purpose statement.

```
Intent: {
  purpose: "to help the user",
  scope_ref: "scope_element_1"
}
```

**Expected:** Reject at Phase 5.2, Rule 5 (No Generic Purpose)

**Attack:** Bypass specificity requirement to enable arbitrary operations.

---

### A.2: Intent Reuse Across Invocations

**Vector:** Same intent artifact used for two different requests.

```
Invocation 1: file.read("/config/a.txt") with Intent X
Invocation 2: file.read("/config/b.txt") with Intent X (same artifact)
```

**Expected:** Reject at Phase 5.2, Rule 4 (Invocation Specificity)

**Attack:** Cache intents to avoid per-invocation validation.

---

### A.3: Intent-Request Mismatch

**Vector:** Intent references different operation than request.

```
Request: file.write("/data/output.txt", content)
Intent: {
  purpose: "to read configuration from /config/settings.json",
  scope_ref: "read_scope"
}
```

**Expected:** Reject at Phase 5.5, Rule 13 (Intent-Request Consistency)

**Attack:** Declare benign intent while performing different operation.

---

### A.4: Intent with Outcome Reference

**Vector:** Intent that references execution results.

```
Intent: {
  purpose: "to write the file and verify it was created successfully",
  scope_ref: "write_scope"
}
```

**Expected:** Reject at Phase 5.2, Rule 8 (No Outcome References)

**Attack:** Create circular dependency to defer validation until post-execution.

---

### A.5: Intent with Conditional Purpose

**Vector:** Intent with branching language.

```
Intent: {
  purpose: "to read the file if it exists, otherwise create it",
  scope_ref: "file_scope"
}
```

**Expected:** Reject at Phase 5.2, Rule 7 (No Conditional Language)

**Attack:** Embed multiple operations in single intent.

---

## 4. Category B: Scope Smuggling

Attempts to exceed declared scope or introduce undeclared capabilities.

---

### B.1: Undeclared Capability Type

**Vector:** Request for capability type not in declared scope.

```
Declared Scope: [file.read]
Request: network.http_get("https://external.com/data")
```

**Expected:** Reject at Phase 5.5, Rule 20 (Request-Scope Alignment)

**Attack:** Invoke undeclared capabilities.

---

### B.2: Parameter Boundary Violation

**Vector:** Request with parameters outside declared boundaries.

```
Scope Element: {
  capability: file.read,
  boundaries: { path_prefix: "/safe/" }
}
Request: file.read("/etc/passwd")
```

**Expected:** Reject at Phase 5.5, Rule 21 (Parameters Within Boundaries)

**Attack:** Access resources outside declared scope.

---

### B.3: Operation Not Permitted

**Vector:** Request for operation not enumerated in scope element.

```
Scope Element: {
  capability: file,
  operations: [read]
}
Request: file.write("/safe/data.txt", content)
```

**Expected:** Reject at Phase 5.5, Rule 20 (Request-Scope Alignment)

**Attack:** Perform write via read-only scope.

---

### B.4: Scope Element Reference to Nonexistent

**Vector:** Intent references scope element that doesn't exist.

```
Declared Scope: [scope_1, scope_2]
Intent: { scope_ref: "scope_99" }
```

**Expected:** Reject at Phase 5.5, Rule 19 (Intent-Scope Alignment)

**Attack:** Reference fabricated scope elements.

---

### B.5: Runtime Scope Expansion

**Vector:** Request with scope expanded since intake.

```
Intake Scope: [file.read:/safe/]
Current Scope (modified): [file.read:/safe/, file.write:/data/]
```

**Expected:** Reject at Phase 5.5, Rule 16 (Declared Scope From Intake)

**Attack:** Expand capabilities without re-intake.

---

### B.6: Wildcard Expansion Attack

**Vector:** Scope with unbounded wildcard.

```
Scope Element: {
  capability: file.read,
  boundaries: { path: "/**/*" }  // Unbounded
}
```

**Expected:** Reject at Phase 5.1, Rule 2 (Scope Finiteness)

**Attack:** Declare scope that covers entire filesystem.

---

## 5. Category C: Provenance Spoofing

Attempts to forge, elevate, or misrepresent skill provenance.

---

### C.1: Self-Constructed Provenance

**Vector:** Provenance attestation constructed by invoking skill.

```
Provenance: {
  source: { ... },
  integrity: { verdict: "intact" },
  classification: "trusted",
  _constructed_by: "invoking_skill"  // Self-constructed
}
```

**Expected:** Reject at Phase 5.4, Rule 30 (Provenance Not Self-Constructed)

**Attack:** Skill declares its own trustworthiness.

---

### C.2: Classification Elevation at Runtime

**Vector:** Provenance with runtime-elevated classification.

```
Intake Classification: "sandboxed"
Current Classification: "trusted"  // Elevated without trust grant
```

**Expected:** Reject at Phase 5.4, Rule 28 (No Runtime Classification Elevation)

**Attack:** Elevate privileges without administrative action.

---

### C.3: Integrity Mismatch

**Vector:** Provenance claiming intact when hashes differ.

```
Provenance: {
  intake_hash: "abc123",
  current_hash: "xyz789",  // Different
  verdict: "intact"  // Lie
}
```

**Expected:** Reject at Phase 5.4, Rule 14 (Integrity Verdict Consistency)

**Attack:** Hide skill modification.

---

### C.4: Modified Skill with Non-Restricted Classification

**Vector:** Modified skill claiming sandboxed or trusted.

```
Provenance: {
  integrity: { verdict: "modified" },
  classification: "sandboxed"  // Should be restricted
}
```

**Expected:** Reject at Phase 5.4, Rule 20 (Classification Integrity Consistency)

**Attack:** Retain capabilities after modification.

---

### C.5: Forged Attestation Signature

**Vector:** Provenance with invalid or forged signature.

```
Provenance: {
  ...,
  signature: "forged_signature_value"
}
```

**Expected:** Reject at Phase 5.4, Rule 24 (Attestation Verification Success)

**Attack:** Forge provenance records.

---

### C.6: Unknown Attestation Authority

**Vector:** Provenance signed by unrecognized authority.

```
Provenance: {
  ...,
  signed_by: "unknown_authority_xyz"
}
```

**Expected:** Reject at Phase 5.4, Rule 25 (Attestation Authority Recognized)

**Attack:** Introduce rogue attestation authorities.

---

## 6. Category D: Chain Replay/Injection

Attempts to forge, replay, or inject into caller chains.

---

### D.1: Chain Replay

**Vector:** Caller chain from previous invocation.

```
Previous Invocation: Chain with bindings for invocation_id_001
Current Invocation: Same chain submitted for invocation_id_002
```

**Expected:** Reject at Phase 5.3, Rule 27 (Continuation Binding Fresh)

**Attack:** Replay valid chain to authorize new request.

---

### D.2: Self-Issued Verification Material

**Vector:** Entity provides its own verification material.

```
Link: {
  entity: skill_xyz,
  reference: { issued_by: skill_xyz }  // Self-issued
}
```

**Expected:** Reject at Phase 5.3, Rule 18 (Verification Material Not Self-Issued)

**Attack:** Self-verify to bypass identity checks.

---

### D.3: Chain Injection (Gap)

**Vector:** Caller chain with missing link.

```
Chain: [session] → [agent] → ??? → [skill]
                            ^
                        Missing link
```

**Expected:** Reject at Phase 5.3, Rule 5 (Chain Contiguity)

**Attack:** Hide malicious intermediate entity.

---

### D.4: Chain Injection (Insertion)

**Vector:** Caller chain with unauthorized entity inserted.

```
Actual Path: session → agent → skill
Claimed Chain: session → agent → [injected_skill] → skill
```

**Expected:** Reject at Phase 5.3, Rule 26 (Continuation Binding Specific)

**Attack:** Insert unauthorized entity into chain.

---

### D.5: Session Origin Spoofing

**Vector:** Chain with forged session origin.

```
Chain: [forged_session] → skill
```

**Expected:** Reject at Phase 5.3, Rule 31 (Session Origin Recognized)

**Attack:** Fabricate session to authorize requests.

---

### D.6: Entity Reference as Name String

**Vector:** Entity reference that is just a name.

```
Link: {
  entity_identity: "skill",
  entity_reference: "my_trusted_skill"  // Just a name string
}
```

**Expected:** Reject at Phase 5.3, Rule 11 (Entity Reference Is Not Name String)

**Attack:** Claim any identity via name assertion.

---

### D.7: Stale Verification Material

**Vector:** Verification material from previous invocation.

```
Current Invocation: 2026-02-04T12:00:00Z
Verification Material Timestamp: 2026-02-03T10:00:00Z  // Yesterday
```

**Expected:** Reject at Phase 5.3, Rule 19 (Verification Material Fresh)

**Attack:** Use cached verification material.

---

## 7. Category E: Runtime Shortcut

Attempts to bypass or shortcut the runtime boundary.

---

### E.1: Execute Before EAG

**Vector:** Runtime executes capability before EAG decision.

```
Sequence:
  1. Request received
  2. Capability executed (WRONG)
  3. EAG consulted
```

**Expected:** Reject (architectural violation)

**Attack:** Speculative or optimistic execution.

---

### E.2: Execute After Denial

**Vector:** Runtime executes despite Deny.

```
EAG Decision: Deny
Runtime Action: Execute anyway
```

**Expected:** Reject (architectural violation)

**Attack:** Ignore authorization decision.

---

### E.3: Retry After Denial

**Vector:** Runtime resubmits denied request.

```
First Submission: Deny
Runtime: Resubmit with same request
```

**Expected:** Reject at Runtime Boundary Invariant 1 (Denial Finality)

**Attack:** Retry until success.

---

### E.4: Decision Caching

**Vector:** Runtime caches Permit for reuse.

```
First Request: file.read("/a.txt") → Permit (cached)
Second Request: file.read("/a.txt") → Use cached Permit
```

**Expected:** Reject at Runtime Boundary Invariant 2 (Single-Use Authorization)

**Attack:** Cache authorizations.

---

### E.5: Request Modification

**Vector:** Runtime modifies request before EAG.

```
Original Request: file.read("/user/data.txt")
Modified Request: file.read("/safe/data.txt")  // "Fixed" by runtime
```

**Expected:** Reject at Runtime Boundary §3 (Cannot modify)

**Attack:** "Helpful" request correction.

---

### E.6: Execution Delegation

**Vector:** Runtime delegates execution to another component.

```
Runtime A: Receives Permit
Runtime A: Delegates to Runtime B for execution
```

**Expected:** Reject at Runtime Boundary Invariant 4 (Non-Delegation)

**Attack:** Transfer authorization between components.

---

## 8. Category F: Validation Bypass

Attempts to skip validation steps.

---

### F.1: Skip Intent Validation

**Vector:** Invocation submitted without Phase 5.2 validation.

```
Assembly Validation Check: No Phase 5.2 record exists
```

**Expected:** Reject at Phase 5.5, Rule 12 (Declared Intent Pre-Validated)

**Attack:** Submit unvalidated intent.

---

### F.2: Skip Chain Validation

**Vector:** Invocation with unvalidated caller chain.

```
Assembly Validation Check: No Phase 5.3 record exists
```

**Expected:** Reject at Phase 5.5, Rule 9 (Caller Chain Pre-Validated)

**Attack:** Submit unvalidated chain.

---

### F.3: Skip Provenance Validation

**Vector:** Invocation with unvalidated provenance.

```
Assembly Validation Check: No Phase 5.4 record exists
```

**Expected:** Reject at Phase 5.5, Rule 23 (Provenance Pre-Validated)

**Attack:** Submit unvalidated provenance.

---

### F.4: Missing Input Category

**Vector:** Invocation request with only 5 of 6 categories.

```
Request: Present
Caller Chain: Present
Intent: Present
Authorization State: Present
Provenance: MISSING
Audit Context: Present
```

**Expected:** Reject at Phase 5.5, Rule 31 (All Six Categories Present)

**Attack:** Submit incomplete request.

---

### F.5: Stale Validation Record

**Vector:** Validation record from different invocation.

```
Current Invocation: INV-002
Intent Validation Record: For INV-001
```

**Expected:** Reject at Phase 5.5, Rule (validation freshness)

**Attack:** Reuse validation across invocations.

---

## 9. Category G: Authority Escalation

Attempts to gain authority beyond what the constitution permits.

---

### G.1: Runtime Issues Trust Grant

**Vector:** Runtime component grants trust to skill.

```
Actor: Runtime
Action: Elevate skill from sandboxed to trusted
```

**Expected:** Reject at Provenance §7.2 (Trust Grant Constraint)

**Attack:** Runtime self-grants trust.

---

### G.2: Skill Modifies Own Scope

**Vector:** Skill attempts to expand its own scope.

```
Original Scope: [file.read:/safe/]
Skill Action: Add file.write:/safe/ to scope
```

**Expected:** Reject at Declared Scope §8 (Scope Immutability)

**Attack:** Self-expansion of capabilities.

---

### G.3: Skill Constructs Own Audit Context

**Vector:** Skill provides its own audit context.

```
Audit Context: {
  session_id: "fabricated_session",
  timestamp: "chosen_timestamp",
  correlation_id: "controlled_id"
}
_constructed_by: invoking_skill
```

**Expected:** Reject at Phase Anchor §8 (Request Assembly Invariant)

**Attack:** Control audit trail.

---

### G.4: EAG Inference

**Vector:** Implementation where EAG infers missing intent.

```
Request: file.read("/config/settings.json")
Intent: MISSING
EAG: Infers "read configuration" intent
```

**Expected:** Reject (EAG cannot infer)

**Attack:** Remove intent requirement.

---

### G.5: EAG Mutation

**Vector:** Implementation where EAG "fixes" requests.

```
Request: file.read("/etc/passwd")
Scope: file.read:/safe/
EAG: Changes path to "/safe/passwd"
```

**Expected:** Reject (EAG cannot mutate)

**Attack:** Sanitization bypasses denial.

---

---

## 10. Test Vector Summary

| Category | Vectors | Attack Surface |
|----------|---------|----------------|
| A: Intent Laundering | 5 | Intent specificity, freshness, consistency |
| B: Scope Smuggling | 6 | Scope boundaries, alignment, immutability |
| C: Provenance Spoofing | 6 | Classification, integrity, attestation |
| D: Chain Replay/Injection | 7 | Verification, continuity, freshness |
| E: Runtime Shortcut | 6 | Ordering, caching, delegation |
| F: Validation Bypass | 5 | Completeness, pre-validation |
| G: Authority Escalation | 5 | Trust grants, scope expansion, EAG behavior |
| **Total** | **40** | |

---

## 11. Conformance Requirement

An implementation is constitutionally conformant if:

1. All 40 test vectors are correctly rejected
2. Rejection occurs at the specified phase/rule
3. No vector reaches the EAG (except G.4, G.5 which test EAG behavior)
4. Rejection produces appropriate audit records

**Passing all test vectors provides evidence of constitutional conformance.**

---

**End of Adversarial Test Vectors**
