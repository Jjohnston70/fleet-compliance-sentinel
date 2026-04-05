# Provenance Classification Rules Definition

**Status:** Locked — Constitutional Truth
**Version:** 1.0.0
**Date:** 2026-02-04

---

## 1. Definition

**Provenance** is a structured attestation, provided as part of a capability invocation request, that:

1. Establishes the origin of the invoking skill
2. Attests to the integrity of the skill since intake
3. Assigns a classification that determines capability permissions
4. Enables the Execution Authority Gate to evaluate capability eligibility as a predicate without interpretation

Provenance is an **input artifact**, not a runtime product. It arrives with the request, fully formed.

Provenance is **immutable** after intake. Classification cannot be elevated at runtime.

---

## 2. Purpose

Provenance exists to answer:

| Question | What Provenance Provides |
|----------|-------------------------|
| Where did this skill come from? | Source reference |
| Has it been modified? | Integrity status |
| What level of trust applies? | Classification |
| What capabilities may it invoke? | Classification-based capability permissions |

Provenance establishes **trust lineage** for the invoking skill.

---

## 3. Structure

A well-formed Provenance attestation contains exactly three components:

### 3.1 Source Reference

| Property | Description |
|----------|-------------|
| Intake report identifier | Reference to the intake record that admitted this skill |
| Skill hash | Cryptographic hash of the skill at intake time |
| Intake authority | Which intake process admitted this skill |
| Intake timestamp | When the skill was admitted |

The Source Reference answers: **Where did this come from, and when?**

### 3.2 Integrity Status

| Property | Description |
|----------|-------------|
| Current hash | Cryptographic hash of the skill as it exists now |
| Hash comparison | Whether current hash matches intake hash |
| Integrity verdict | `intact` or `modified` |

The Integrity Status answers: **Is this skill unchanged since intake?**

### 3.3 Classification

| Property | Description |
|----------|-------------|
| Classification level | One of: `trusted`, `sandboxed`, `restricted` |
| Classification basis | Why this classification was assigned |
| Classification authority | What process assigned this classification |

The Classification answers: **What trust level applies?**

---

## 4. Classification Levels

### 4.1 Overview

| Level | Trust Posture | Capability Access |
|-------|---------------|-------------------|
| `trusted` | Verified origin, verified integrity, explicit trust grant | Full capability access within declared scope |
| `sandboxed` | Verified origin, verified integrity, no explicit trust grant | Limited capability access; high-impact capabilities denied |
| `restricted` | Unverified origin, failed integrity, or explicit restriction | Minimal capability access; most capabilities denied |

**Trust is not binary.** These three levels represent meaningful gradations with distinct operational consequences.

### 4.2 Classification: `trusted`

**Criteria for assignment:**
- Skill was admitted through a verified intake process
- Skill integrity is `intact` (current hash matches intake hash)
- Skill has received an explicit trust grant from an authorized process
- Trust grant is recorded and auditable

**Capability permissions:**
- May invoke all capability types within declared scope
- No capability-type restrictions based on classification
- Declared scope remains the governing constraint

**Operational posture:**
- The platform has high confidence in this skill's origin and behavior
- Trust was explicitly granted, not assumed

### 4.3 Classification: `sandboxed`

**Criteria for assignment:**
- Skill was admitted through a verified intake process
- Skill integrity is `intact`
- Skill has NOT received an explicit trust grant
- No disqualifying factors that would require `restricted`

**Capability permissions:**
- May invoke low-impact capability types within declared scope
- May NOT invoke high-impact capability types (see §5)
- Declared scope is further constrained by classification

**Operational posture:**
- The platform has confidence in origin and integrity
- Absence of explicit trust limits capability access
- This is the default classification for newly-admitted skills

### 4.4 Classification: `restricted`

**Criteria for assignment (any of the following):**
- Skill integrity is `modified` (current hash does not match intake hash)
- Skill origin cannot be verified
- Skill has received an explicit restriction from an authorized process
- Skill has been flagged by audit or security review

**Capability permissions:**
- May invoke only minimal capability types (see §5)
- Most capability types are denied regardless of declared scope
- Effective capability access is the intersection of declared scope and minimal set

**Operational posture:**
- The platform has low confidence in this skill
- Capability access is minimized to reduce risk
- This classification may be terminal (no path to elevation) or reviewable (pending investigation)

---

## 5. Capability Type Permissions by Classification

### 5.1 Capability Type Categories

| Category | Examples | Impact Level |
|----------|----------|--------------|
| **Read-local** | Read file from allowed path | Low |
| **Write-local** | Write file to allowed path | Medium |
| **Execute-local** | Execute shell command | High |
| **Network-outbound** | HTTP request to allowed host | High |
| **Provider-inference** | Send prompt to LLM provider | Medium |
| **Provider-action** | Invoke provider tool/action | High |

### 5.2 Permission Matrix

| Capability Type | `trusted` | `sandboxed` | `restricted` |
|-----------------|-----------|-------------|--------------|
| Read-local | ✓ Permitted | ✓ Permitted | ✓ Permitted |
| Write-local | ✓ Permitted | ✓ Permitted | ✗ Denied |
| Execute-local | ✓ Permitted | ✗ Denied | ✗ Denied |
| Network-outbound | ✓ Permitted | ✗ Denied | ✗ Denied |
| Provider-inference | ✓ Permitted | ✓ Permitted | ✗ Denied |
| Provider-action | ✓ Permitted | ✗ Denied | ✗ Denied |

### 5.3 Permission Evaluation Rule

The EAG evaluates:

```
(Classification permits capability type) AND (Declared scope permits this operation)
```

Both conditions must hold. Classification and declared scope are **independent constraints**:
- Classification determines which capability types are available
- Declared scope determines which specific operations are authorized

Neither overrides the other. The effective permission is the **intersection**.

---

## 6. Integrity and Classification Dynamics

### 6.1 Integrity Affects Classification

| Integrity Status | Effect on Classification |
|------------------|-------------------------|
| `intact` | Classification as assigned at intake (or after trust grant) |
| `modified` | Classification immediately becomes `restricted` |

**Modification invalidates trust.** A skill that was `trusted` but is now `modified` is `restricted`, not `trusted`.

### 6.2 Classification Cannot Be Elevated at Runtime

| Transition | Permitted? |
|------------|------------|
| `restricted` → `sandboxed` | ✗ Not at runtime |
| `sandboxed` → `trusted` | ✗ Not at runtime |
| `trusted` → `sandboxed` | ✗ Not at runtime (but see §6.3) |
| Any → `restricted` | ✓ Yes, if integrity fails or explicit restriction applied |

Classification elevation requires a platform process outside the runtime invocation path. The EAG does not elevate classification.

### 6.3 Classification Can Be Demoted

| Trigger | Effect |
|---------|--------|
| Integrity failure detected | Immediate demotion to `restricted` |
| Explicit restriction applied | Immediate demotion to `restricted` |
| Audit/security flag | Immediate demotion to `restricted` |

Demotion is automatic and immediate. It does not require EAG action—the Provenance attestation itself reflects the current classification.

---

## 7. Provenance Establishment

### 7.1 At Intake

When a skill is admitted through the intake process:

1. Source reference is recorded (intake report, hash, authority, timestamp)
2. Initial classification is assigned (typically `sandboxed`)
3. Provenance record is created and signed by intake authority
4. Provenance record is immutable from this point

### 7.2 Trust Grant (Optional)

After intake, an authorized process may grant explicit trust:

1. Trust grant is recorded with authority and timestamp
2. Classification is elevated from `sandboxed` to `trusted`
3. Provenance record is updated (new attestation, not mutation)
4. Original intake record remains intact

**Trust Grant Constraint:** Trust grants are platform administrative actions, not runtime operations. They must be recorded with the same audit guarantees as EAG decisions. No entity in the runtime invocation path may issue, modify, or revoke trust grants. Trust grant authority is held only by platform administrative processes, never by skills, agents, commands, or the runtime.

### 7.3 At Invocation

When a capability invocation request is prepared:

1. Current skill hash is computed
2. Current hash is compared to intake hash
3. Integrity status is determined (`intact` or `modified`)
4. Current classification is determined (based on integrity and any demotions)
5. Provenance attestation is assembled and attached to request

The Provenance attestation that arrives at the EAG reflects the **current state** at invocation time.

---

## 8. Validity Conditions

Provenance is **valid** if and only if all of the following hold:

### 8.1 Structural Validity

| Condition | Description |
|-----------|-------------|
| All three components present | Source Reference, Integrity Status, Classification |
| Source Reference is complete | All required fields present |
| Integrity Status is well-formed | Contains current hash, comparison result, verdict |
| Classification is recognized | One of: `trusted`, `sandboxed`, `restricted` |

### 8.2 Integrity Validity

| Condition | Description |
|-----------|-------------|
| Hash comparison is accurate | Current hash actually matches or doesn't match intake hash |
| Integrity verdict is consistent | `intact` iff hashes match; `modified` iff they don't |
| Attestation is authentic | Provenance attestation is signed by recognized authority |

### 8.3 Classification Validity

| Condition | Description |
|-----------|-------------|
| Classification matches integrity | If `modified`, classification must be `restricted` |
| Classification is attested | Classification was assigned by authorized process |
| No conflicting attestations | Only one valid classification exists |

---

## 9. EAG Evaluation Semantics

The EAG evaluates: **"Provenance classification permits the capability type"**

This predicate is **true** if and only if:

1. Provenance is valid (§8)
2. The capability type being requested is in the permitted set for the classification (§5.2)

### 9.1 Evaluation Mechanics

| Check | Method |
|-------|--------|
| Provenance validity | Structural inspection + attestation verification |
| Capability type extraction | From Request (capability type, operation) |
| Permission lookup | Classification → permitted capability types (§5.2) |
| Permission check | Is requested capability type in permitted set? |

### 9.2 Interaction with Other Conditions

Provenance evaluation is **independent** of:
- Declared Intent evaluation (intent can be valid while provenance denies)
- Caller Chain evaluation (chain can be valid while provenance denies)
- Declared Scope evaluation (scope can permit while provenance denies)

All conditions must hold for Permit. Provenance denial is sufficient for Deny.

---

## 10. Failure Modes

### 10.1 Structural Failures

| Failure | Description |
|---------|-------------|
| Missing component | Source Reference, Integrity Status, or Classification absent |
| Incomplete Source Reference | Missing intake report, hash, authority, or timestamp |
| Malformed Integrity Status | Missing hash, comparison, or verdict |
| Unrecognized classification | Classification is not one of the three valid levels |

### 10.2 Integrity Failures

| Failure | Description |
|---------|-------------|
| Hash mismatch misreported | Attestation claims `intact` but hashes differ |
| Attestation verification failure | Provenance signature does not verify |
| Unknown attestation authority | Provenance signed by unrecognized authority |

### 10.3 Classification Failures

| Failure | Description |
|---------|-------------|
| Classification inconsistent with integrity | Claims `trusted` or `sandboxed` but integrity is `modified` |
| Capability type not permitted | Requested capability type denied for this classification |
| Conflicting attestations | Multiple incompatible classification claims |

---

## 11. Explicit Prohibitions

Provenance:

| Cannot | Rationale |
|--------|-----------|
| Cannot be constructed by the EAG | EAG receives input; does not construct it |
| Cannot be inferred from partial data | Missing components → denial |
| Cannot be enriched | EAG prohibition: Cannot Enrich |
| Cannot have classification elevated at runtime | Classification elevation is a platform process, not a runtime action |
| Cannot have integrity status overridden | Hash comparison is deterministic |
| Cannot be repaired | EAG prohibition: Cannot Mutate |

---

## 12. Immutability, Queryability, Auditability

Per the Phase Anchor, Provenance must be immutable, queryable, and independently auditable.

### 12.1 Immutability

| Property | How Satisfied |
|----------|---------------|
| Source Reference is immutable | Recorded at intake; never modified |
| Intake hash is immutable | Cryptographic hash at intake is permanent |
| Classification basis is immutable | Original classification assignment is recorded |
| Trust grants are append-only | New attestations; no mutation of prior records |

### 12.2 Queryability

| Property | How Satisfied |
|----------|---------------|
| Provenance can be retrieved for any skill | Source Reference provides lookup key |
| Classification history is available | Attestation chain shows all classification events |
| Integrity can be verified independently | Current hash can be recomputed; intake hash is on record |

### 12.3 Auditability

| Property | How Satisfied |
|----------|---------------|
| All classification decisions are recorded | Intake, trust grants, demotions have audit trail |
| Provenance is captured in EAG audit records | Full Provenance attestation in every audit event |
| Independent verification is possible | Hash comparison, attestation verification, classification lookup |

---

## 13. Relationship to Other Input Categories

| Category | Relationship to Provenance |
|----------|---------------------------|
| Request | Provenance constrains which capability types the request may use |
| Caller Chain | Chain identifies invoker; Provenance classifies the invoking skill |
| Declared Intent | Intent validity is independent; Provenance may still deny |
| Authorization State | Declared scope is further constrained by Provenance classification |
| Audit Context | Provenance is captured in audit for reconstruction |

---

## 14. Consistency with Locked Ground Truth

| Locked Constraint | How This Definition Complies |
|-------------------|------------------------------|
| Provenance is required input | §1: Provenance is an input artifact |
| Source reference required | §3.1: Source Reference component |
| Integrity status required | §3.2: Integrity Status component |
| Classification required | §3.3: Classification component |
| Classifications: trusted, sandboxed, restricted | §4: Three classification levels defined |
| Trust is not binary | §4.1: Three levels with distinct permissions |
| Invocation rules vary by provenance class | §5: Capability type permissions vary by classification |
| Provenance classification permits/disallows capability type | §9: EAG evaluation semantics |
| Provenance must be immutable | §12.1: Immutability properties |
| Provenance must be queryable | §12.2: Queryability properties |
| Provenance must be independently auditable | §12.3: Auditability properties |
| EAG evaluates predicates only | §9.1: Evaluation is lookup and comparison |
| EAG does not fetch | §7.3: Provenance arrives with request |
| Missing information → denial | §11: Cannot infer, cannot enrich, cannot repair |

---

**End of Provenance Classification Rules Definition**
