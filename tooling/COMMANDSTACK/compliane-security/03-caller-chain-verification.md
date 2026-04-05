# Caller Chain Verification Semantics Definition

**Status:** Locked — Constitutional Truth
**Version:** 1.0.0
**Date:** 2026-02-04

---

## 1. Definition

**Caller Chain** is a structured trace, provided as part of a capability invocation request, that:

1. Identifies the immediate invoker of the capability request
2. Traces the full path from the immediate invoker back to the session origin
3. Establishes each link via a verifiable reference, not a name string
4. Enables the Execution Authority Gate to evaluate chain validity as a predicate without interpretation

The Caller Chain is an **input artifact**, not a runtime product. It arrives with the request, fully formed.

**Verification** is the predicate evaluation that determines whether the chain is valid.

---

## 2. Purpose

The Caller Chain exists to answer:

| Question | What the Chain Provides |
|----------|------------------------|
| Who is requesting this capability? | Immediate invoker identity |
| On whose behalf? | Full trace to session origin |
| Through what path? | Every intermediate entity in the invocation path |
| Is this path authentic? | Verifiable references at each link |
| Is this path intact? | Continuity between adjacent links |

The Caller Chain establishes **accountability lineage** for every capability invocation.

---

## 3. Structure

A well-formed Caller Chain is an ordered sequence of **links**, where:

- The **first link** is the session origin
- The **last link** is the immediate invoker
- Each **intermediate link** represents an entity through which the invocation passed

### 3.1 Link Structure

Each link in the chain contains exactly four components:

| Component | Description |
|-----------|-------------|
| **Entity Identity** | What this link is (session, agent, command, skill) |
| **Entity Reference** | A verifiable reference establishing the entity's identity |
| **Invocation Point** | Where within the entity the next link was invoked |
| **Continuation Binding** | Cryptographic or structural proof that this link authorized the next link |

### 3.2 Chain Topology

```
Session Origin → [Agent] → [Command] → Skill → Capability Invocation
     ↑              ↑           ↑         ↑
   Link 1        Link 2      Link 3    Link N (immediate invoker)
```

- Brackets indicate optional links (not all invocations pass through agents or commands)
- The chain must be **contiguous**: no gaps between session origin and immediate invoker
- The chain must be **ordered**: links appear in invocation sequence

---

## 4. Verifiable Reference

### 4.1 Definition

A **verifiable reference** is a value that:

1. Uniquely identifies an entity
2. Can be verified as authentic without external lookup
3. Can be verified as unmodified since issuance
4. Was issued by an authority recognized by the platform

### 4.2 What a Verifiable Reference Is

| Property | Requirement |
|----------|-------------|
| Self-contained | All information needed for verification is present in the reference or arrives with the request |
| Tamper-evident | Modification invalidates the reference |
| Non-forgeable | Cannot be produced without access to the issuing authority |
| Bound to entity | The reference is specific to one entity; cannot be reused for another |

### 4.3 What a Verifiable Reference Is NOT

| Prohibited | Rationale |
|------------|-----------|
| A name string | Names can be spoofed; they prove nothing |
| A runtime lookup key | EAG cannot fetch; verification must be self-contained |
| A session-relative identifier | Must be verifiable independent of session state |
| A self-asserted claim | The entity cannot verify itself |

### 4.4 Verification Material

For the EAG to verify a reference without fetching, **verification material** must arrive with the request:

| Material | Purpose |
|----------|---------|
| The reference itself | The value being verified |
| Issuer attestation | Proof that a recognized authority issued this reference |
| Integrity proof | Proof that the reference has not been modified |

The EAG evaluates verification material; it does not retrieve it.

---

## 5. Continuation Binding

### 5.1 Definition

**Continuation Binding** is proof that a link in the chain authorized the invocation of the next link.

### 5.2 Purpose

Continuation Binding prevents:

- **Injection attacks**: An attacker cannot insert themselves into a chain
- **Bypass attacks**: An attacker cannot skip links in a chain
- **Replay attacks**: A valid chain from one invocation cannot be reused for another

### 5.3 Properties

| Property | Requirement |
|----------|-------------|
| Directional | Link N authorizes Link N+1; not reversible |
| Specific | Binding is to a specific next link, not "any next link" |
| Non-transferable | Binding cannot be extracted and attached to a different chain |
| Fresh | Binding is specific to this invocation (not replayable) |

### 5.4 What Continuation Binding Establishes

When Link N has a valid Continuation Binding to Link N+1:

- Link N **did invoke** Link N+1
- Link N **intended to invoke** Link N+1 (not some other entity)
- This invocation occurred **in this session** (freshness)

---

## 6. Validity Conditions

The Caller Chain is **valid** if and only if all of the following hold:

### 6.1 Structural Validity

| Condition | Description |
|-----------|-------------|
| Chain is non-empty | At least one link exists |
| Chain begins at session origin | First link is a valid session |
| Chain ends at immediate invoker | Last link is the skill making the request |
| Chain is contiguous | No gaps between first and last link |
| All links are well-formed | Each link contains all four required components |

### 6.2 Reference Validity (per link)

| Condition | Description |
|-----------|-------------|
| Entity Reference is present | Not null, not empty |
| Entity Reference is verifiable | Meets verifiable reference criteria (§4) |
| Entity Reference verifies successfully | Verification material confirms authenticity and integrity |
| Entity Reference is recognized | References an entity known to the platform |

### 6.3 Continuity Validity (per adjacent pair)

| Condition | Description |
|-----------|-------------|
| Continuation Binding is present | Link N has binding to Link N+1 |
| Continuation Binding is valid | Binding verifies successfully |
| Continuation Binding is specific | Binding is to this exact Link N+1, not another entity |
| Continuation Binding is fresh | Binding is for this invocation, not replayed |

---

## 7. Verification Semantics

The EAG evaluates: **"Caller Chain is valid"**

This predicate is **true** if and only if:

1. **Structural validity holds** (§6.1)
2. **Reference validity holds for every link** (§6.2)
3. **Continuity validity holds for every adjacent pair** (§6.3)

### 7.1 Evaluation Order

1. Check structural validity first (fail-fast on malformed chains)
2. Verify each link's reference (fail on first invalid reference)
3. Verify each continuation binding (fail on first broken binding)

### 7.2 Evaluation Mechanics

| Check | Method | What EAG Does |
|-------|--------|---------------|
| Structural | Inspection | Examines chain shape; no cryptography |
| Reference validity | Cryptographic verification | Verifies signatures/proofs using provided material |
| Continuation validity | Cryptographic verification | Verifies bindings using provided material |

All verification is performed using material that **arrives with the request**. The EAG does not fetch keys, certificates, or attestations.

---

## 8. Failure Modes

### 8.1 Structural Failures

| Failure | Description |
|---------|-------------|
| Empty chain | No links provided |
| Missing session origin | First link is not a session |
| Missing immediate invoker | Last link is not the requesting skill |
| Gap in chain | Links are not contiguous |
| Malformed link | Link missing required components |

### 8.2 Reference Failures

| Failure | Description |
|---------|-------------|
| Missing reference | Entity Reference component is absent |
| Unverifiable reference | Reference is a name string or lacks verification material |
| Verification failure | Cryptographic verification does not succeed |
| Unknown entity | Reference verifies but entity is not recognized by platform |

### 8.3 Continuity Failures

| Failure | Description |
|---------|-------------|
| Missing binding | Continuation Binding component is absent |
| Invalid binding | Binding does not verify |
| Misdirected binding | Binding points to different entity than actual next link |
| Stale binding | Binding is from a previous invocation (replay) |

---

## 9. Explicit Prohibitions

The Caller Chain:

| Cannot | Rationale |
|--------|-----------|
| Cannot be constructed by the EAG | EAG receives input; does not construct it |
| Cannot be inferred from partial data | Missing links → denial, not inference |
| Cannot be enriched | EAG prohibition: Cannot Enrich |
| Cannot contain unverifiable links | "Name string" is explicitly prohibited |
| Cannot have gaps filled by assumption | Gaps are inadmissible |
| Cannot be repaired | EAG prohibition: Cannot Mutate |
| Cannot be delegated for verification | EAG prohibition: Cannot Delegate |

---

## 10. Relationship to Other Input Categories

| Category | Relationship to Caller Chain |
|----------|------------------------------|
| Request | Caller Chain traces who made this Request |
| Declared Intent | Intent is declared by the immediate invoker (last link in chain) |
| Authorization State | Authorization is scoped to entities in the chain |
| Provenance | Provenance of the immediate invoker; chain does not override provenance |
| Audit Context | Chain is captured in audit records for reconstruction |

The Caller Chain establishes **who** is requesting. Other categories establish **what**, **why**, and **with what authority**.

---

## 11. Session Origin

### 11.1 Definition

The **session origin** is the root of all authority in a Caller Chain. It represents:

- The boundary where authority entered the platform
- The point of human authorization or scheduled task initiation
- The anchor for all downstream accountability

### 11.2 Session Origin Types

| Type | Description |
|------|-------------|
| Human session | A human user initiated an interactive session |
| Scheduled task | A pre-authorized automated task initiated execution |
| External trigger | An authorized external system initiated a request |

### 11.3 Session Origin Properties

| Property | Requirement |
|----------|-------------|
| Must be verifiable | Session origin has a verifiable reference like any other link |
| Must be recognized | Platform must recognize the session as valid |
| Must be the first link | No links may precede session origin |
| Cannot be an agent, command, or skill | These are intermediate; session is the root |

---

## 12. Consistency with Locked Ground Truth

| Locked Constraint | How This Definition Complies |
|-------------------|------------------------------|
| Caller Chain is required input | §1: Chain is an input artifact |
| Immediate invoker identity required | §3.1: Entity Identity component |
| Full trace to session origin required | §3.2: Chain topology from session to invoker |
| Each link identified | §3.1: Entity Reference component |
| "Identified" means verifiable reference | §4: Verifiable Reference definition |
| Gaps are inadmissible | §6.1: Contiguity requirement; §8.1: Gap failure mode |
| EAG evaluates predicates only | §7: Verification is predicate evaluation |
| EAG does not fetch | §7.2: All verification uses material that arrives with request |
| Missing information → denial | §9: Cannot infer, cannot enrich, cannot repair |

---

## 13. Verification Material Invariants (Locked)

### Verification Material Issuance Invariant

Verification material (issuer attestations, integrity proofs, continuation bindings) must be issued by a platform authority independent of the requesting entity. Self-issued verification material is invalid. The invoking skill may not provide its own entity reference, continuation binding, or attestation.

### Verification Material Freshness Invariant

Verification material must be generated for the current invocation. Pre-computed or cached verification material is invalid. Replay of verification material from prior invocations is prohibited.

### Verification Authority Independence Invariant

The authority that issues verification material must be independent of the runtime invocation path. No entity in the caller chain may issue its own verification material or verify its own references.

---

**End of Caller Chain Verification Semantics Definition**
