# Phase 5.4 — Provenance Attestation Validation Contract (Derived)

**Status:** Derived (Locked)
**Authority Impact:** None
**Depends On:** Phases 1–4 (Locked)
**Version:** 1.0.0
**Date:** 2026-02-04

---

## 1. Purpose

Provenance Attestation Validation is a deterministic, fail-closed validation gate applied during invocation assembly. Its sole purpose is to ensure that every Provenance attestation presented to the Execution Authority Gate (EAG) is constitutionally admissible by construction.

This contract does not authorize, does not classify, does not elevate trust, and does not repair attestations. It validates structural integrity and classification consistency. It produces a binary outcome: **Valid** or **Invalid**.

---

## 2. Non-Authority Guarantees

Provenance Attestation Validation:

| Guarantee | Constitutional Source |
|-----------|----------------------|
| Cannot grant or deny execution | Phase Anchor §4: Authority exercised only at EAG |
| Cannot construct provenance | Provenance §11: Cannot be constructed by the EAG |
| Cannot infer missing components | Provenance §11: Cannot be inferred from partial data |
| Cannot enrich provenance | Provenance §11: Cannot be enriched |
| Cannot repair provenance | Provenance §11: Cannot be repaired |
| Cannot elevate classification | Provenance §6.2: Classification cannot be elevated at runtime |
| Cannot issue trust grants | Provenance §7.2: Trust Grant Constraint |
| Cannot override integrity status | Provenance §11: Cannot have integrity status overridden |

This validator is a predicate checker with audit output, not a classification authority.

---

## 3. Validation Inputs

Provenance Attestation Validation receives exactly one artifact:

**Provenance Attestation Artifact**, containing exactly three components:
- Source Reference
- Integrity Status
- Classification

It may also receive read-only references to:
- Intake record store (for source reference verification only)
- Platform-recognized attestation authorities (for signature verification only)

It does **not** receive:
- Runtime state
- Session information
- Caller chain
- Execution results
- Trust grant authority

---

## 4. Validation Rules

All rules are binary. Failure of any rule results in **Invalid**.

---

### Rule 1: Provenance Presence

**Statement:** Provenance attestation MUST be present.

**Failure Condition:** Provenance missing, null, or empty.

**Constitutional Source:** Phase Anchor §5.5; EAG §4.5 Input Completeness

---

### Rule 2: Three-Component Structure

**Statement:** Provenance attestation MUST contain exactly three components: Source Reference, Integrity Status, Classification.

**Failure Condition:** Missing component, extra components, or merged fields.

**Constitutional Source:** Provenance §3: Structure; §8.1: "All three components present"

---

### Rule 3: Source Reference Presence

**Statement:** Source Reference component MUST be present and complete.

**Failure Condition:** Source Reference missing or incomplete.

**Constitutional Source:** Provenance §3.1; §8.1: "Source Reference is complete"

---

### Rule 4: Intake Report Identifier Present

**Statement:** Source Reference MUST contain an intake report identifier.

**Failure Condition:** Intake report identifier missing.

**Constitutional Source:** Provenance §3.1: "Intake report identifier"

---

### Rule 5: Skill Hash Present

**Statement:** Source Reference MUST contain the cryptographic hash of the skill at intake time.

**Failure Condition:** Skill hash missing or malformed.

**Constitutional Source:** Provenance §3.1: "Skill hash"

---

### Rule 6: Intake Authority Present

**Statement:** Source Reference MUST identify which intake process admitted the skill.

**Failure Condition:** Intake authority missing or unidentified.

**Constitutional Source:** Provenance §3.1: "Intake authority"

---

### Rule 7: Intake Timestamp Present

**Statement:** Source Reference MUST contain the intake timestamp.

**Failure Condition:** Intake timestamp missing or malformed.

**Constitutional Source:** Provenance §3.1: "Intake timestamp"

---

### Rule 8: Integrity Status Presence

**Statement:** Integrity Status component MUST be present and well-formed.

**Failure Condition:** Integrity Status missing or malformed.

**Constitutional Source:** Provenance §3.2; §8.1: "Integrity Status is well-formed"

---

### Rule 9: Current Hash Present

**Statement:** Integrity Status MUST contain the current cryptographic hash of the skill.

**Failure Condition:** Current hash missing or malformed.

**Constitutional Source:** Provenance §3.2: "Current hash"

---

### Rule 10: Hash Comparison Present

**Statement:** Integrity Status MUST contain a hash comparison result.

**Failure Condition:** Hash comparison result missing.

**Constitutional Source:** Provenance §3.2: "Hash comparison"

---

### Rule 11: Integrity Verdict Present

**Statement:** Integrity Status MUST contain an integrity verdict.

**Failure Condition:** Integrity verdict missing.

**Constitutional Source:** Provenance §3.2: "Integrity verdict"

---

### Rule 12: Integrity Verdict Valid Value

**Statement:** Integrity verdict MUST be exactly `intact` or `modified`.

**Failure Condition:** Verdict is any other value.

**Constitutional Source:** Provenance §3.2: "`intact` or `modified`"

---

### Rule 13: Hash Comparison Accuracy

**Statement:** Hash comparison result MUST accurately reflect whether current hash matches intake hash.

**Failure Condition:** Comparison result does not match actual hash comparison.

**Constitutional Source:** Provenance §8.2: "Hash comparison is accurate"

---

### Rule 14: Integrity Verdict Consistency

**Statement:** Integrity verdict MUST be consistent with hash comparison: `intact` iff hashes match; `modified` iff they differ.

**Failure Condition:** Verdict contradicts hash comparison result.

**Constitutional Source:** Provenance §8.2: "`intact` iff hashes match; `modified` iff they don't"

---

### Rule 15: Classification Presence

**Statement:** Classification component MUST be present.

**Failure Condition:** Classification missing.

**Constitutional Source:** Provenance §3.3; §8.1: "Classification is recognized"

---

### Rule 16: Classification Level Present

**Statement:** Classification MUST contain a classification level.

**Failure Condition:** Classification level missing.

**Constitutional Source:** Provenance §3.3: "Classification level"

---

### Rule 17: Classification Level Valid Value

**Statement:** Classification level MUST be exactly one of: `trusted`, `sandboxed`, `restricted`.

**Failure Condition:** Classification level is any other value.

**Constitutional Source:** Provenance §4.1; §8.1: "One of: trusted, sandboxed, restricted"

---

### Rule 18: Classification Basis Present

**Statement:** Classification MUST contain a classification basis.

**Failure Condition:** Classification basis missing.

**Constitutional Source:** Provenance §3.3: "Classification basis"

---

### Rule 19: Classification Authority Present

**Statement:** Classification MUST identify what process assigned the classification.

**Failure Condition:** Classification authority missing or unidentified.

**Constitutional Source:** Provenance §3.3: "Classification authority"

---

### Rule 20: Classification Integrity Consistency

**Statement:** If integrity is `modified`, classification MUST be `restricted`.

**Failure Condition:** Integrity is `modified` but classification is `trusted` or `sandboxed`.

**Constitutional Source:** Provenance §6.1: "Modification invalidates trust"; §8.3: "If modified, classification must be restricted"

---

### Rule 21: Classification Attested

**Statement:** Classification MUST have been assigned by an authorized process.

**Failure Condition:** Classification is self-asserted or assigned by unauthorized entity.

**Constitutional Source:** Provenance §8.3: "Classification is attested"

---

### Rule 22: No Conflicting Attestations

**Statement:** Only one valid classification attestation may exist.

**Failure Condition:** Multiple incompatible classification claims present.

**Constitutional Source:** Provenance §8.3: "No conflicting attestations"

---

### Rule 23: Attestation Authenticity

**Statement:** Provenance attestation MUST be signed by a recognized authority.

**Failure Condition:** Attestation signature missing, invalid, or from unrecognized authority.

**Constitutional Source:** Provenance §8.2: "Attestation is authentic"

---

### Rule 24: Attestation Verification Success

**Statement:** Cryptographic verification of the provenance attestation MUST succeed.

**Failure Condition:** Signature verification fails.

**Constitutional Source:** Provenance §8.2: "Provenance signature does not verify"

---

### Rule 25: Attestation Authority Recognized

**Statement:** The attestation signing authority MUST be recognized by the platform.

**Failure Condition:** Signing authority is unknown.

**Constitutional Source:** Provenance §8.2: "Unknown attestation authority"

---

### Rule 26: Source Reference Immutable

**Statement:** Source Reference MUST reference an immutable intake record.

**Failure Condition:** Source Reference points to mutable or missing intake record.

**Constitutional Source:** Provenance §12.1: "Source Reference is immutable"

---

### Rule 27: Intake Hash Immutable

**Statement:** The intake hash referenced in Source Reference MUST be the permanent hash recorded at intake.

**Failure Condition:** Intake hash has been modified since intake.

**Constitutional Source:** Provenance §12.1: "Intake hash is immutable"

---

### Rule 28: No Runtime Classification Elevation

**Statement:** Classification MUST NOT have been elevated during the runtime invocation path.

**Failure Condition:** Evidence of runtime classification elevation detected.

**Constitutional Source:** Provenance §6.2: Classification elevation "Not at runtime"; §7.2 Trust Grant Constraint

---

### Rule 29: Trust Grant Authority Valid

**Statement:** If classification is `trusted`, trust grant MUST have been issued by a platform administrative process.

**Failure Condition:** Trust grant issued by skill, agent, command, or runtime component.

**Constitutional Source:** Provenance §7.2: Trust Grant Constraint

---

### Rule 30: Provenance Not Self-Constructed

**Statement:** The invoking skill MUST NOT have constructed its own provenance attestation.

**Failure Condition:** Provenance attestation was self-issued by the invoking skill.

**Constitutional Source:** Phase Anchor §8: Request Assembly Invariant; Provenance §11

---

### Rule 31: Provenance Queryable

**Statement:** Provenance MUST be independently queryable against the intake record store.

**Failure Condition:** Provenance cannot be verified against stored intake records.

**Constitutional Source:** Provenance §12.2: "Provenance can be retrieved for any skill"

---

### Rule 32: Provenance Audit Capturability

**Statement:** The entire Provenance attestation MUST be capturable verbatim in the audit record.

**Failure Condition:** Provenance contains non-serializable or transient elements.

**Constitutional Source:** Provenance §12.3; Phase Anchor §5.6

---

---

## 5. Failure Semantics

| Semantic | Behavior |
|----------|----------|
| Fail-closed | Any failure → Invalid |
| Terminal | No retries, no repair, no enrichment |
| Immediate | Fail-fast on first failure permitted |
| Non-advisory | Identify failed rule(s) only |

**Constitutional Source:** Provenance §11: Cannot be repaired; EAG §7.7: Cannot Advise

---

## 6. Outputs

### On Valid

- Provenance attestation eligible for invocation assembly
- Validation record emitted

### On Invalid

- Invocation assembly halts
- Validation failure audited

**No modification to the provenance occurs in either case.**

---

## 7. Audit Requirements

Each validation produces an audit record containing:

| Field | Required |
|-------|----------|
| Provenance hash or canonical representation | Yes |
| Skill identity reference | Yes |
| Classification level | Yes |
| Integrity verdict | Yes |
| Validation outcome (valid/invalid) | Yes |
| Failed rule numbers (if invalid) | If applicable |
| Timestamp | Yes |
| Validator identity | Yes |

Audit records are append-only and independently queryable.

**Constitutional Source:** Provenance §12.3; Runtime Boundary §10: Audit Emission Invariant

---

## 8. Traceability Matrix

| Rule | Source Document | Section |
|------|-----------------|---------|
| 1 | Phase Anchor, EAG | §5.5, §4.5 |
| 2 | Provenance | §3, §8.1 |
| 3–7 | Provenance | §3.1, §8.1 |
| 8–14 | Provenance | §3.2, §8.2 |
| 15–22 | Provenance | §3.3, §4.1, §8.3 |
| 23–25 | Provenance | §8.2 |
| 26–27 | Provenance | §12.1 |
| 28–29 | Provenance | §6.2, §7.2 |
| 30 | Phase Anchor, Provenance | §8, §11 |
| 31 | Provenance | §12.2 |
| 32 | Provenance, Phase Anchor | §12.3, §5.6 |

---

## 9. Explicit Non-Goals

This contract does NOT define:

| Non-Goal | Reason |
|----------|--------|
| How to construct provenance | Construction is a platform function at intake |
| Trust grant procedures | Trust grants are platform administrative actions |
| Classification elevation | Elevation is outside the runtime invocation path |
| Intake process | Intake is defined by Phase 5.1 |
| Capability type permissions | Permission matrix is EAG's domain |
| Hash algorithms | Cryptographic choices are infrastructure |
| Remediation guidance | Validation rejects; it does not advise |
| Authorization outcomes | Authorization is EAG's sole domain |
| Runtime behavior | This is pre-invocation validation |
| Storage schemas or APIs | This is a validation contract, not implementation |

---

## 10. Compliance Statement

If this contract is applied mechanically:

1. No provenance with missing or malformed components reaches the EAG
2. No provenance with inconsistent integrity/classification reaches the EAG
3. No self-constructed or unattested provenance reaches the EAG
4. No runtime-elevated classification reaches the EAG
5. Provenance evaluation at the EAG becomes pure predicate lookup
6. Trust lineage is complete and reconstructable
7. Modified skills are always classified as restricted

**Provenance becomes constitutionally safe by construction.**

---

**End of Phase 5.4 — Provenance Attestation Validation Contract**
