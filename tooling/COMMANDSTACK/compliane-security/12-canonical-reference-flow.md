# Phase 6.1 — Canonical Reference Flow (Non-Executable)

**Status:** Conformance Reference (Locked)
**Authority Impact:** None
**Depends On:** Phases 1–5 (Locked)
**Version:** 1.0.0
**Date:** 2026-02-04

---

## 1. Purpose

This document defines the single, linear, content-blind flow that any constitutional implementation must follow. It is the gold reference against which all implementations are validated.

This is not architecture. This is not optimization. This is the canonical sequence that cannot be reordered, parallelized, or shortcut without violating the constitution.

**Any implementation that deviates from this flow is unconstitutional by definition.**

---

## 2. Flow Properties

The canonical flow has the following properties:

| Property | Requirement |
|----------|-------------|
| Linear | Steps execute in strict sequence |
| Content-blind | Flow does not branch based on artifact content |
| Non-optimizable | No step may be skipped, cached, or speculated |
| Fail-closed | Any step failure terminates the flow |
| Audited | Every step produces an audit record |
| Stateless | No step depends on prior invocation history |

---

## 3. Canonical Reference Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTAKE PHASE (Pre-Runtime)                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: Skill Artifact Submission                                  │
│  ─────────────────────────────────                                  │
│  Input:  Raw skill artifact                                         │
│  Action: Receive artifact for intake                                │
│  Output: Artifact queued for validation                             │
│  Audit:  Submission record                                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: Skill Intake Validation (Phase 5.1)                        │
│  ───────────────────────────────────────────                        │
│  Input:  Skill artifact                                             │
│  Action: Apply 30 validation rules                                  │
│  Output: Admit | Reject                                             │
│  Audit:  Validation record with rule outcomes                       │
│                                                                     │
│  On Reject: FLOW TERMINATES                                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Admit only)
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: Provenance Record Creation                                 │
│  ──────────────────────────────────                                 │
│  Input:  Admitted skill artifact                                    │
│  Action: Compute hash, create source reference, assign sandboxed    │
│  Output: Immutable provenance record                                │
│  Audit:  Provenance creation record                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: Skill Registration                                         │
│  ────────────────────────────                                       │
│  Input:  Skill with provenance                                      │
│  Action: Register skill identity, store declared scope              │
│  Output: Skill available for invocation                             │
│  Audit:  Registration record                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
         ═══════════════════════════════════════════════════
                        INTAKE PHASE COMPLETE
                     Skill exists with fixed scope
         ═══════════════════════════════════════════════════
                                    │
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                      INVOCATION PHASE (Runtime)                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: Capability Request Receipt                                 │
│  ──────────────────────────────────                                 │
│  Input:  Skill requests capability invocation                       │
│  Action: Receive request parameters and declared intent             │
│  Output: Raw request queued for assembly                            │
│  Audit:  Request receipt record                                     │
│                                                                     │
│  Note: Skill provides parameters + intent ONLY                      │
│        Skill does NOT provide chain, provenance, or audit context   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: Declared Intent Validation (Phase 5.2)                     │
│  ──────────────────────────────────────────────                     │
│  Input:  Declared intent artifact                                   │
│  Action: Apply 17 validation rules                                  │
│  Output: Valid | Invalid                                            │
│  Audit:  Intent validation record                                   │
│                                                                     │
│  On Invalid: FLOW TERMINATES                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Valid only)
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: Caller Chain Construction                                  │
│  ─────────────────────────────────                                  │
│  Input:  Session context, invoker identity                          │
│  Action: Platform constructs chain with verification material       │
│  Output: Complete caller chain                                      │
│  Audit:  Chain construction record                                  │
│                                                                     │
│  Note: Skill does NOT construct this                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 8: Caller Chain Validation (Phase 5.3)                        │
│  ──────────────────────────────────────────                         │
│  Input:  Caller chain artifact                                      │
│  Action: Apply 34 validation rules                                  │
│  Output: Valid | Invalid                                            │
│  Audit:  Chain validation record                                    │
│                                                                     │
│  On Invalid: FLOW TERMINATES                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Valid only)
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 9: Provenance Attestation Assembly                            │
│  ───────────────────────────────────────                            │
│  Input:  Skill identity, current skill state                        │
│  Action: Compute current hash, compare to intake hash, determine    │
│          integrity and classification                               │
│  Output: Complete provenance attestation                            │
│  Audit:  Provenance assembly record                                 │
│                                                                     │
│  Note: Skill does NOT construct this                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 10: Provenance Validation (Phase 5.4)                         │
│  ──────────────────────────────────────────                         │
│  Input:  Provenance attestation artifact                            │
│  Action: Apply 32 validation rules                                  │
│  Output: Valid | Invalid                                            │
│  Audit:  Provenance validation record                               │
│                                                                     │
│  On Invalid: FLOW TERMINATES                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Valid only)
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 11: Authorization State Assembly                              │
│  ─────────────────────────────────────                              │
│  Input:  Skill's declared scope (from intake), applicable rules     │
│  Action: Assemble authorization state from intake records           │
│  Output: Complete authorization state                               │
│  Audit:  Authorization assembly record                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 12: Audit Context Generation                                  │
│  ─────────────────────────────────                                  │
│  Input:  Session, timestamp source, correlation generator           │
│  Action: Generate session ID, timestamp, correlation ID             │
│  Output: Complete audit context                                     │
│  Audit:  Context generation record                                  │
│                                                                     │
│  Note: Skill does NOT construct this                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 13: Invocation Request Assembly                               │
│  ────────────────────────────────────                               │
│  Input:  All six validated categories                               │
│  Action: Combine into single invocation request                     │
│  Output: Complete capability invocation request                     │
│  Audit:  Assembly record                                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 14: Invocation Assembly Validation (Phase 5.5)                │
│  ───────────────────────────────────────────────────                │
│  Input:  Complete invocation request                                │
│  Action: Apply 35 validation rules                                  │
│  Output: Valid | Invalid                                            │
│  Audit:  Assembly validation record                                 │
│                                                                     │
│  On Invalid: FLOW TERMINATES                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Valid only)
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 15: EAG Submission                                            │
│  ───────────────────────                                            │
│  Input:  Validated invocation request                               │
│  Action: Submit unchanged to Execution Authority Gate               │
│  Output: Request received by EAG                                    │
│  Audit:  Submission record                                          │
│                                                                     │
│  Note: Request is NOT modified during submission                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 16: EAG Evaluation                                            │
│  ───────────────────────                                            │
│  Input:  Complete invocation request                                │
│  Action: Evaluate all six categories as predicates                  │
│  Output: Permit | Deny                                              │
│  Audit:  EAG decision record (emitted BEFORE returning decision)    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│  STEP 17a: On Permit          │   │  STEP 17b: On Deny            │
│  ────────────────────         │   │  ─────────────────            │
│  Input:  Permit signal        │   │  Input:  Deny signal          │
│  Action: Proceed to execution │   │  Action: Terminate request    │
│  Output: Execution authorized │   │  Output: No execution         │
│  Audit:  Permit dispatch      │   │  Audit:  Deny record          │
│          record               │   │                               │
└───────────────────────────────┘   └───────────────────────────────┘
            │                                       │
            ▼                                       │
┌───────────────────────────────┐                   │
│  STEP 18: Capability Execution│                   │
│  ─────────────────────────────│                   │
│  Input:  Authorized request   │                   │
│  Action: Execute exactly as   │                   │
│          specified, exactly   │                   │
│          once                 │                   │
│  Output: Execution result     │                   │
│  Audit:  Execution record     │                   │
└───────────────────────────────┘                   │
            │                                       │
            ▼                                       │
┌───────────────────────────────────────────────────┴───────────────┐
│                         FLOW COMPLETE                              │
└────────────────────────────────────────────────────────────────────┘
```

---

## 4. Step Dependencies

| Step | Depends On | Cannot Proceed Without |
|------|------------|------------------------|
| 1 | None | — |
| 2 | 1 | Valid artifact submission |
| 3 | 2 | Admit outcome |
| 4 | 3 | Provenance record |
| 5 | 4 | Registered skill |
| 6 | 5 | Request receipt |
| 7 | 6 | Valid intent |
| 8 | 7 | Constructed chain |
| 9 | 8 | Valid chain |
| 10 | 9 | Assembled provenance |
| 11 | 10 | Valid provenance |
| 12 | 11 | Authorization state |
| 13 | 12 | Audit context |
| 14 | 13 | Assembled request |
| 15 | 14 | Valid assembly |
| 16 | 15 | EAG receipt |
| 17 | 16 | EAG decision |
| 18 | 17a | Permit only |

---

## 5. Prohibited Optimizations

The following optimizations are **unconstitutional**:

| Optimization | Why Prohibited |
|--------------|----------------|
| Parallel validation | Order matters; earlier failures must prevent later steps |
| Validation caching | Each invocation requires fresh validation |
| Step skipping | All steps are mandatory |
| Speculative execution | Execution before Permit is prohibited |
| Batch processing | Each invocation is independent |
| Chain reuse | Chains are per-invocation |
| Provenance caching | Integrity must be checked each time |
| Audit deferral | Audit is synchronous |

---

## 6. Termination Points

The flow terminates at exactly these points:

| Termination | Step | Outcome |
|-------------|------|---------|
| Intake rejection | 2 | Skill not admitted |
| Intent invalid | 6 | Invocation rejected |
| Chain invalid | 8 | Invocation rejected |
| Provenance invalid | 10 | Invocation rejected |
| Assembly invalid | 14 | Invocation rejected |
| EAG Deny | 16 | Invocation denied |
| Execution complete | 18 | Normal termination |

**There are no other termination points.**

---

## 7. Audit Trail

Every step produces an audit record. The complete audit trail for one invocation contains:

| Phase | Records |
|-------|---------|
| Intake (once per skill) | Submission, validation, provenance, registration |
| Invocation (per request) | Receipt, intent validation, chain construction, chain validation, provenance assembly, provenance validation, authorization assembly, context generation, request assembly, assembly validation, EAG submission, EAG decision, execution (if permitted) |

**Minimum audit records per invocation: 13**
**Maximum audit records per invocation: 14 (if execution occurs)**

---

## 8. Conformance Requirement

An implementation conforms to this flow if and only if:

1. All 18 steps are present
2. Steps execute in the specified order
3. No step is skipped
4. No step is cached
5. No step is parallelized with dependencies
6. All termination points are honored
7. All audit records are produced
8. No additional authority-bearing steps are introduced

**Deviation from this flow is unconstitutional.**

---

**End of Canonical Reference Flow**
