# Execution Authority Gate (EAG) Definition

**Status:** Locked — Constitutional Truth
**Version:** 1.0.0
**Date:** 2026-02-04

---

## 1. Definition

The **Execution Authority Gate (EAG)** is the sole conceptual boundary that adjudicates capability invocation requests and returns a binary **Permit** or **Deny** decision.

---

## 2. What the EAG Is Not

The Execution Authority Gate is not:

- A policy engine
- A reasoning system
- An orchestrator
- A trust negotiator
- A capability granter
- A runtime component

---

## 3. Core Properties

- Evaluates predicates only
- Performs no inference, mutation, enrichment, orchestration, delegation, persistence, or advice
- Has no state and initiates no actions
- Audit records are its only side effect

---

## 4. Inputs

The EAG receives a capability invocation request. Evaluation does not begin unless all six information categories are present and complete.

### 4.1 Request

- Capability type (filesystem, network, shell, provider)
- Operation (read, write, execute, request, infer)
- Parameters (concrete values — no placeholders, no references to be resolved)

Incomplete or ambiguous requests are inadmissible.

### 4.2 Caller Chain

- Immediate invoker identity (which skill, which invocation point)
- Full trace to session origin (skill → command → agent → session)
- Each link present and identified — gaps are inadmissible
- "Identified" means a verifiable reference, not a name string

### 4.3 Declared Intent

- The stated purpose for this specific invocation
- Its relationship to the invoking skill's declared scope

Generic intent (e.g., "to help the user") is inadmissible. Intent must be specific to the invocation.

### 4.4 Authorization State

- Capabilities declared by the invoking skill
- Scope boundaries in effect (allowed paths, allowed hosts, etc.)
- Rules applicable to this invocation

Authorization state arrives with the request. The EAG does not compute or fetch it.

### 4.5 Provenance

- Source reference (intake report, skill hash)
- Integrity status (unmodified since compilation, or not)
- Classification (trusted, sandboxed, restricted)

### 4.6 Audit Context

- Session identifier
- Timestamp
- Correlation ID

Audit context enables reconstruction. It is not evaluated for permit/deny.

### Input Completeness Rule

If any category is missing, incomplete, or malformed:
- Evaluation does not proceed
- The request is denied without further analysis

---

## 5. Outputs

### 5.1 Primary Output

Binary decision: **Permit** or **Deny**

- No partial permission
- No conditional approval
- No "try again with modifications"

### 5.2 On Permit

- The original request proceeds unchanged
- A permit record is produced containing:
  - What was permitted (capability, operation, parameters)
  - Full input context (all six categories)
  - Timestamp

Nothing else is returned to the caller. No enrichment. No metadata beyond the permit signal.

### 5.3 On Deny

- The request does not proceed
- A deny record is produced containing:
  - What was denied
  - Which condition failed (first failure encountered, or all failures)
  - Full input context
  - Timestamp

The caller receives:
- Denial signal
- Failed condition identifier

The caller does not receive:
- Full context
- Suggestions
- Alternatives
- Partial grants

### 5.4 What Is Never Returned

- No permission grant that persists beyond this invocation
- No modified or sanitized version of the request
- No guidance on how to reformulate
- No inference about caller intent

---

## 6. Decision Semantics

### 6.1 Sufficiency (all must hold for Permit)

- All six input categories are present and well-formed
- The requested capability is declared by the invoking skill
- Request parameters fall within permitted scope boundaries
- No applicable rule prohibits the invocation
- Provenance classification permits the capability type
- Declared intent is consistent with the skill's declared scope

### 6.2 Failure (any triggers Deny)

- Any input category missing or malformed
- Capability not declared
- Parameters exceed permitted scope
- A rule prohibits the invocation
- Provenance classification disallows the capability
- Intent inconsistent with declared scope

### 6.3 Conflict Resolution

- Multiple applicable rules → most restrictive wins
- Ambiguity about whether a condition is met → condition is not met
- No override mechanism exists at this boundary
- Conflicts do not produce negotiation — they produce denial

### 6.4 Evaluation Posture

The EAG evaluates predicates only.

- It does not reason
- It does not weigh
- It does not interpret

A condition is satisfied or it is not. There is no "probably acceptable."

---

## 7. Explicit Prohibitions

### 7.1 Cannot Infer

- Missing intent cannot be guessed
- Undeclared capabilities cannot be assumed
- Unspecified scope cannot be derived

### 7.2 Cannot Mutate

- Requests cannot be altered to become permissible
- Parameters cannot be sanitized
- Scope cannot be narrowed to fit

### 7.3 Cannot Enrich

- Missing categories cannot be populated from external sources
- Partial data cannot be completed
- Defaults cannot be substituted

### 7.4 Cannot Originate

- The gate cannot initiate invocations
- The gate cannot call providers
- The gate produces no side effects except audit records

### 7.5 Cannot Delegate

- Decisions cannot be deferred
- Decisions cannot be conditional on future events
- Decisions cannot be handed to another evaluator

### 7.6 Cannot Persist

- No session-level grants
- No accumulated trust
- No learning from prior decisions

### 7.7 Cannot Advise

- No suggestions to caller
- No alternatives offered
- No explanation of what would have succeeded

---

## 8. Structural Scope Constraint

The Execution Authority Gate is a predicate evaluator with audit output.

It is not:
- A policy engine
- A reasoning system
- An orchestrator
- A trust negotiator
- A capability granter

It receives complete input.
It returns a binary decision.
It emits audit artifacts.
It holds no state.
It initiates nothing.

**If future design pressure attempts to add inference, enrichment, mutation, orchestration, or persistence to this boundary — that design is invalid by definition.**

---

**End of Execution Authority Gate Definition**
