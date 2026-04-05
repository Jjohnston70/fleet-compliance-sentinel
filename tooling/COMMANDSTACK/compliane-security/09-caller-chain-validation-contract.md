# Phase 5.3 — Caller Chain Artifact Validation Contract (Derived)

**Status:** Derived (Locked)
**Authority Impact:** None
**Depends On:** Phases 1–4 (Locked)
**Version:** 1.0.0
**Date:** 2026-02-04

---

## 1. Purpose

Caller Chain Artifact Validation is a deterministic, fail-closed validation gate applied during invocation assembly. Its sole purpose is to ensure that every Caller Chain presented to the Execution Authority Gate (EAG) is constitutionally admissible by construction.

This contract does not authorize, does not verify identity claims, and does not repair chains. It validates structural and cryptographic properties. It produces a binary outcome: **Valid** or **Invalid**.

---

## 2. Non-Authority Guarantees

Caller Chain Artifact Validation:

| Guarantee | Constitutional Source |
|-----------|----------------------|
| Cannot grant or deny execution | Phase Anchor §4: Authority exercised only at EAG |
| Cannot construct caller chains | Caller Chain §9: Cannot be constructed by the EAG |
| Cannot infer missing links | Caller Chain §9: Cannot be inferred from partial data |
| Cannot fill gaps by assumption | Caller Chain §9: Gaps cannot be filled by assumption |
| Cannot repair broken chains | Caller Chain §9: Cannot be repaired |
| Cannot enrich chain data | EAG §7.3: Cannot Enrich |
| Cannot issue verification material | Caller Chain §13: Verification Material Issuance Invariant |
| Cannot verify its own references | Caller Chain §13: Verification Authority Independence Invariant |

This validator is a predicate checker with audit output, not an identity authority.

---

## 3. Validation Inputs

Caller Chain Artifact Validation receives exactly one artifact:

**Caller Chain Artifact**, containing:
- An ordered sequence of **Links**
- Each link containing four components (per §3.1)
- Verification material for each link
- Continuation bindings between adjacent links

It may also receive read-only references to:
- Platform-recognized entity registry (for entity recognition check only)
- Platform-recognized issuing authorities (for attestation verification only)

It does **not** receive:
- Runtime state
- Session history
- Prior invocation chains
- Execution results

---

## 4. Validation Rules

All rules are binary. Failure of any rule results in **Invalid**.

---

### Rule 1: Chain Presence

**Statement:** Caller Chain MUST be present.

**Failure Condition:** Chain missing, null, or empty.

**Constitutional Source:** Phase Anchor §5.2; EAG §4.2 Input Completeness

---

### Rule 2: Chain Non-Empty

**Statement:** Caller Chain MUST contain at least one link.

**Failure Condition:** Chain is an empty sequence.

**Constitutional Source:** Caller Chain §6.1: "Chain is non-empty"

---

### Rule 3: Session Origin First

**Statement:** The first link in the chain MUST be a session origin.

**Failure Condition:** First link is not a session type (agent, command, or skill instead).

**Constitutional Source:** Caller Chain §6.1: "Chain begins at session origin"; §11.3: "Must be the first link"

---

### Rule 4: Immediate Invoker Last

**Statement:** The last link in the chain MUST be the immediate invoker (the requesting skill).

**Failure Condition:** Last link is not the skill making the capability request.

**Constitutional Source:** Caller Chain §6.1: "Chain ends at immediate invoker"

---

### Rule 5: Chain Contiguity

**Statement:** The chain MUST be contiguous with no gaps between first and last link.

**Failure Condition:** Links are not adjacent; gaps exist in the sequence.

**Constitutional Source:** Caller Chain §6.1: "Chain is contiguous"; §3.2: "no gaps between session origin and immediate invoker"

---

### Rule 6: Chain Ordering

**Statement:** Links MUST appear in invocation sequence order.

**Failure Condition:** Links are out of order or ordering is indeterminate.

**Constitutional Source:** Caller Chain §3.2: "The chain must be ordered: links appear in invocation sequence"

---

### Rule 7: Link Completeness

**Statement:** Each link MUST contain all four required components: Entity Identity, Entity Reference, Invocation Point, Continuation Binding.

**Failure Condition:** Any link is missing one or more required components.

**Constitutional Source:** Caller Chain §3.1: Link Structure

---

### Rule 8: Entity Identity Presence

**Statement:** Each link MUST have a non-empty Entity Identity component.

**Failure Condition:** Entity Identity is missing, null, or empty.

**Constitutional Source:** Caller Chain §3.1: Entity Identity component

---

### Rule 9: Entity Identity Valid Type

**Statement:** Entity Identity MUST be one of: session, agent, command, skill.

**Failure Condition:** Entity Identity is an unrecognized type.

**Constitutional Source:** Caller Chain §3.2: Chain Topology

---

### Rule 10: Entity Reference Presence

**Statement:** Each link MUST have a non-empty Entity Reference component.

**Failure Condition:** Entity Reference is missing, null, or empty.

**Constitutional Source:** Caller Chain §6.2: "Entity Reference is present"

---

### Rule 11: Entity Reference Is Not Name String

**Statement:** Entity Reference MUST NOT be a simple name string.

**Failure Condition:** Reference is a name without cryptographic properties.

**Constitutional Source:** Caller Chain §4.3: "A name string... Names can be spoofed; they prove nothing"

---

### Rule 12: Entity Reference Self-Contained

**Statement:** Entity Reference MUST be self-contained (all verification information present).

**Failure Condition:** Reference requires external lookup for verification.

**Constitutional Source:** Caller Chain §4.2: "Self-contained"; §4.3: "A runtime lookup key" is prohibited

---

### Rule 13: Entity Reference Tamper-Evident

**Statement:** Entity Reference MUST be tamper-evident.

**Failure Condition:** Reference can be modified without detection.

**Constitutional Source:** Caller Chain §4.2: "Tamper-evident"

---

### Rule 14: Entity Reference Non-Forgeable

**Statement:** Entity Reference MUST be non-forgeable.

**Failure Condition:** Reference could be produced without issuing authority access.

**Constitutional Source:** Caller Chain §4.2: "Non-forgeable"

---

### Rule 15: Entity Reference Entity-Bound

**Statement:** Entity Reference MUST be bound to exactly one entity.

**Failure Condition:** Reference is reusable for multiple entities.

**Constitutional Source:** Caller Chain §4.2: "Bound to entity"

---

### Rule 16: Verification Material Presence

**Statement:** Verification material MUST accompany each Entity Reference.

**Failure Condition:** Verification material is missing for any link.

**Constitutional Source:** Caller Chain §4.4: "verification material must arrive with the request"

---

### Rule 17: Verification Material Complete

**Statement:** Verification material MUST include: the reference itself, issuer attestation, and integrity proof.

**Failure Condition:** Any of the three verification material components is missing.

**Constitutional Source:** Caller Chain §4.4: Verification Material table

---

### Rule 18: Verification Material Not Self-Issued

**Statement:** Verification material MUST be issued by an authority independent of the entity being verified.

**Failure Condition:** Entity issued its own verification material.

**Constitutional Source:** Caller Chain §13: Verification Material Issuance Invariant

---

### Rule 19: Verification Material Fresh

**Statement:** Verification material MUST be generated for the current invocation.

**Failure Condition:** Verification material is pre-computed, cached, or replayed.

**Constitutional Source:** Caller Chain §13: Verification Material Freshness Invariant

---

### Rule 20: Issuing Authority Recognized

**Statement:** The issuing authority for verification material MUST be recognized by the platform.

**Failure Condition:** Issuer is unknown or not in the platform's recognized authority set.

**Constitutional Source:** Caller Chain §4.1: "Was issued by an authority recognized by the platform"

---

### Rule 21: Entity Reference Verification Success

**Statement:** Cryptographic verification of each Entity Reference MUST succeed.

**Failure Condition:** Signature verification, hash check, or attestation validation fails.

**Constitutional Source:** Caller Chain §6.2: "Entity Reference verifies successfully"

---

### Rule 22: Entity Recognized

**Statement:** Each verified entity MUST be recognized by the platform.

**Failure Condition:** Entity reference verifies but entity is unknown to platform.

**Constitutional Source:** Caller Chain §6.2: "Entity Reference is recognized"

---

### Rule 23: Invocation Point Presence

**Statement:** Each link MUST have an Invocation Point component.

**Failure Condition:** Invocation Point is missing.

**Constitutional Source:** Caller Chain §3.1: Invocation Point component

---

### Rule 24: Continuation Binding Presence

**Statement:** Each link (except the last) MUST have a Continuation Binding to the next link.

**Failure Condition:** Continuation Binding is missing for a non-terminal link.

**Constitutional Source:** Caller Chain §6.3: "Continuation Binding is present"

---

### Rule 25: Continuation Binding Valid

**Statement:** Each Continuation Binding MUST verify successfully.

**Failure Condition:** Binding verification fails.

**Constitutional Source:** Caller Chain §6.3: "Continuation Binding is valid"

---

### Rule 26: Continuation Binding Specific

**Statement:** Each Continuation Binding MUST point to the exact next link.

**Failure Condition:** Binding points to a different entity than the actual next link.

**Constitutional Source:** Caller Chain §6.3: "Continuation Binding is specific"; §5.3: "Specific"

---

### Rule 27: Continuation Binding Fresh

**Statement:** Each Continuation Binding MUST be for this invocation only.

**Failure Condition:** Binding is replayed from a previous invocation.

**Constitutional Source:** Caller Chain §6.3: "Continuation Binding is fresh"; §5.3: "Fresh"

---

### Rule 28: Continuation Binding Directional

**Statement:** Continuation Bindings MUST be directional (Link N → Link N+1 only).

**Failure Condition:** Binding direction is reversed or bidirectional.

**Constitutional Source:** Caller Chain §5.3: "Directional"

---

### Rule 29: Continuation Binding Non-Transferable

**Statement:** Continuation Bindings MUST NOT be extractable for use in different chains.

**Failure Condition:** Binding structure allows extraction and reuse.

**Constitutional Source:** Caller Chain §5.3: "Non-transferable"

---

### Rule 30: Session Origin Verifiable

**Statement:** Session origin MUST have a verifiable reference like any other link.

**Failure Condition:** Session origin lacks verification material.

**Constitutional Source:** Caller Chain §11.3: "Must be verifiable"

---

### Rule 31: Session Origin Recognized

**Statement:** Session origin MUST be recognized as valid by the platform.

**Failure Condition:** Session is unknown, expired, or revoked.

**Constitutional Source:** Caller Chain §11.3: "Must be recognized"

---

### Rule 32: Session Origin Type Valid

**Statement:** Session origin MUST be one of: human session, scheduled task, external trigger.

**Failure Condition:** Session type is agent, command, or skill.

**Constitutional Source:** Caller Chain §11.2; §11.3: "Cannot be an agent, command, or skill"

---

### Rule 33: No Self-Verification

**Statement:** No entity in the caller chain may verify its own references.

**Failure Condition:** An entity's reference is verified by that same entity.

**Constitutional Source:** Caller Chain §13: Verification Authority Independence Invariant

---

### Rule 34: Chain Audit Capturability

**Statement:** The entire Caller Chain MUST be capturable verbatim in the audit record.

**Failure Condition:** Chain contains non-serializable or transient elements.

**Constitutional Source:** Caller Chain §10; Phase Anchor §5.6

---

---

## 5. Failure Semantics

| Semantic | Behavior |
|----------|----------|
| Fail-closed | Any failure → Invalid |
| Terminal | No retries, no repair, no gap-filling |
| Immediate | Fail-fast on first failure permitted |
| Non-advisory | Identify failed rule(s) only |

**Constitutional Source:** Caller Chain §9: Cannot be repaired; EAG §7.7: Cannot Advise

---

## 6. Outputs

### On Valid

- Caller Chain eligible for invocation assembly
- Validation record emitted

### On Invalid

- Invocation assembly halts
- Validation failure audited

**No modification to the chain occurs in either case.**

---

## 7. Audit Requirements

Each validation produces an audit record containing:

| Field | Required |
|-------|----------|
| Chain hash or canonical representation | Yes |
| Link count | Yes |
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
| 1 | Phase Anchor, EAG | §5.2, §4.2 |
| 2 | Caller Chain | §6.1 |
| 3 | Caller Chain | §6.1, §11.3 |
| 4 | Caller Chain | §6.1 |
| 5 | Caller Chain | §6.1, §3.2 |
| 6 | Caller Chain | §3.2 |
| 7 | Caller Chain | §3.1 |
| 8–9 | Caller Chain | §3.1, §3.2 |
| 10–15 | Caller Chain | §4.2, §4.3, §6.2 |
| 16–17 | Caller Chain | §4.4 |
| 18–20 | Caller Chain | §13, §4.1 |
| 21–22 | Caller Chain | §6.2 |
| 23 | Caller Chain | §3.1 |
| 24–29 | Caller Chain | §5.3, §6.3 |
| 30–32 | Caller Chain | §11.2, §11.3 |
| 33 | Caller Chain | §13 |
| 34 | Caller Chain, Phase Anchor | §10, §5.6 |

---

## 9. Explicit Non-Goals

This contract does NOT define:

| Non-Goal | Reason |
|----------|--------|
| How to construct caller chains | Construction is a platform function, not validation |
| Verification material issuance | Issuance is a platform authority function |
| Identity management | Identity is managed by platform authorities |
| Session management | Sessions are platform administrative concerns |
| Key management | Keys are infrastructure, not constitution |
| Remediation guidance | Validation rejects; it does not advise |
| Authorization outcomes | Authorization is EAG's sole domain |
| Runtime behavior | This is pre-invocation validation |
| Storage schemas or APIs | This is a validation contract, not implementation |

---

## 10. Compliance Statement

If this contract is applied mechanically:

1. No chain with gaps, missing links, or broken bindings reaches the EAG
2. No self-asserted or unverified entity references reach the EAG
3. No replayed or stale verification material reaches the EAG
4. Chain verification at the EAG becomes pure predicate evaluation
5. Accountability lineage is complete and reconstructable
6. No entity can inject itself into or bypass the chain

**Caller Chain becomes constitutionally safe by construction.**

---

**End of Phase 5.3 — Caller Chain Artifact Validation Contract**
