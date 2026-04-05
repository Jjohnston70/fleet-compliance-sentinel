# Phase 3 — Minimal Runtime Boundary Definition (Conceptual)

## Objective (Locked)

Define the minimal conceptual boundary between a future runtime and the Execution Authority Gate (EAG) such that:

- No execution authority leaks
- The EAG remains pure, stateless, and constitutional
- A runtime cannot accidentally (or conveniently) bypass controls
- The boundary is necessary, sufficient, and minimal

This phase answers one question only:

> **What is the smallest thing a runtime must do to lawfully cause execution, without ever possessing authority itself?**

---

## Phase 3 Ground Rules (Re-stated)

The following remain non-negotiable:

- The EAG is the sole authority
- The atomic unit of execution is a capability invocation
- The EAG returns `Permit | Deny`, nothing else
- Missing information → denial
- No inference, enrichment, mutation, persistence, or advice
- No runtime placement, orchestration, or implementation

---

## 1. Definition: Minimal Runtime Boundary

### Conceptual Definition

The Runtime Boundary is a **non-authoritative relay** that:

1. Receives a fully-formed capability invocation request
2. Submits it unchanged to the Execution Authority Gate
3. Observes the binary decision
4. Either:
   - Causes the already-specified capability invocation to occur exactly as requested, or
   - Terminates the request with no side effects

**The runtime never decides.**
**The runtime never modifies.**
**The runtime never authorizes.**

---

## 2. What the Runtime Boundary IS

The runtime boundary is:

- A submission mechanism
- A decision observer
- An execution dispatcher **only after authorization**
- A transport layer for:
  - Inputs → EAG
  - Decision ← EAG
  - Audit artifacts → append-only store

It exists solely to connect a permitted decision to real-world execution.

---

## 3. What the Runtime Boundary is NOT (Hard Prohibitions)

The runtime boundary is **not allowed** to:

- Evaluate intent
- Validate provenance
- Verify caller chains
- Interpret scope
- Apply policy
- Retry with modifications
- Cache decisions
- Batch or reorder requests
- Collapse multiple invocations
- Execute anything pre-authorization
- Execute anything other than the authorized invocation
- Execute after denial
- Execute before audit emission

**If a runtime performs any of the above, it is invalid by definition.**

---

## 4. Inputs to the Runtime Boundary

The runtime boundary may receive only:

1. A capability invocation request containing all six required categories
2. A binary decision from the EAG
3. An audit artifact produced by the EAG

The runtime boundary must treat all inputs as **opaque**.

- It does not interpret them.
- It does not repair them.
- It does not derive new meaning from them.

---

## 5. Outputs of the Runtime Boundary

The runtime boundary may produce only:

### On Permit

Exactly one execution of:
- The capability
- The operation
- The parameters

**Exactly as authorized**
**Exactly once**

### On Deny

- No execution
- No side effects
- No retries
- No substitutions

### In All Cases

- No modification of audit records
- No additional audit interpretation
- No explanatory output to upstream callers

---

## 6. Execution Ordering Constraint (Critical)

The following order is **mandatory**:

1. Runtime receives fully-formed request
2. Runtime submits request to EAG
3. EAG emits audit record
4. EAG returns Permit or Deny
5. **Only if Permit:** runtime executes the invocation

**Any reordering is invalid.**

Especially prohibited:
- "Execute then audit"
- "Speculative execution"
- "Dry-run execution"
- "Optimistic execution"

---

## 7. Authority Containment Invariant

The following invariant must always hold:

> **The runtime must be removable without changing the authorization outcome.**

If removing the runtime changes:
- What is permitted
- What is denied
- What is logged
- What is attributable

Then the runtime is holding authority — and the design is invalid.

---

## 8. Runtime Boundary Failure Semantics

The runtime boundary must **fail closed**.

If:
- The EAG is unreachable
- The decision is missing
- The audit artifact is missing
- The decision is ambiguous
- The execution mechanism fails

Then:
- No execution occurs
- The request terminates

**Runtime failure must never degrade into implicit permission.**

---

## 9. Relationship to Existing Constitutional Documents

| Document | Relationship |
|----------|--------------|
| Phase Anchor | Defines why the runtime cannot be authoritative |
| EAG | Sole decision-maker |
| Intent Semantics | Runtime does not interpret |
| Caller Chain Verification | Runtime does not verify |
| Provenance Rules | Runtime does not classify |
| Audit Semantics | Runtime cannot alter |

**The runtime boundary is downstream of all reasoning and upstream of all side effects.**
Section 10 — Runtime Boundary Invariants (Locked)

This section should enumerate exactly eight invariants, consolidated from both our analysis and Claude’s.

They are:

Denial Finality Invariant
A denied invocation is terminal. The runtime must not retry, replay, or resubmit a denied request.

Single-Use Authorization Invariant
Authorization decisions are non-reusable and non-cacheable. Every invocation requires fresh EAG adjudication.

Transport vs. Semantic Rejection Invariant
The runtime may only reject requests for transport-level failure. Semantic validity is determined exclusively by the EAG.

Non-Delegation Invariant
The entity that receives a Permit must be the entity that executes the invocation. Authorization is non-transferable.

Behavioral Immutability Invariant
The runtime must not modify its behavior based on execution outcomes, history, or observed reliability.

Execution Atomicity Invariant
Capability invocation execution must be atomic. Partial execution states are prohibited.

Cleanup Authorization Invariant
Cleanup, rollback, or compensation actions are themselves capability invocations and require EAG authorization.

Temporal Constraint Immutability Invariant
Temporal constraints included in an invocation are part of the authorization and may not be modified by the runtime.

Audit Emission Invariant
The EAG must emit audit records directly to an append-only store not controlled by the runtime. The runtime has no role in audit transport, storage, or acknowledgment. Audit emission is synchronous with the Permit/Deny decision and must complete before the decision is returned.

These are constitutional guardrails, not features.
