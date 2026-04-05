# TNDS LLM Platform — Phase Anchor

**Version:** 0.2.0
**Date:** 2026-02-04
**Phase:** Phase 1 COMPLETE → Phase 2 COMPLETE → Phase 3 COMPLETE → Phase 4 COMPLETE → Phase 5 COMPLETE → Phase 6 COMPLETE (FROZEN)
**Status:** Authoritative Ground Truth (Locked)

---

## 1. Project Context (Locked)

- Project: **TNDS LLM Platform**
- This repository is a **platform kernel**, not an application
- No runtime, UI, Electron, Node environment, or orchestration exists yet
- Distribution and execution environments are intentionally deferred
- Phase 2 is focused exclusively on execution authority

---

## 2. What Is Complete (Factual)

1. **Skill Intake System is operational**
   - Located at `tools/skill-intake/`
   - ~1,350 lines of real TypeScript (CLI, validator, compiler)
   - LLM output treated as untrusted input
   - Schema-enforced, fail-closed, audited
   - Deterministic compilation

2. **Compiled external skills are installed**
   - 26 total skills under `/skills/`
   - 18 LLM-only skills
   - 8 operator skills (declared capabilities only)
   - Canonical compiled schema enforced
   - Skills are immutable assets

3. **Platform intelligence layer exists as specifications only**
   - `ai/agents/` → documented roles
   - `ai/commands/` → documented commands
   - `ai/rules/` → documented governance rules
   - `ai/skills/atomic|composite|chains` → documented skill specs
   - These are **not executable code**

4. **Governance, security, and audit posture is defined**
   - `GOVERNANCE.md`, `SECURITY.md`, `ARCHITECTURE.md`
   - `audits/` populated
   - Explicit least-privilege doctrine
   - No implicit execution authority

5. **Platform repository intentionally excludes runtime concerns**
   - No Electron
   - No `node_modules`
   - No UI
   - This is a kernel, not a product

---

## 3. Terminology Boundaries (Non-Negotiable)

- **Compiled Skill ≠ Platform-native skill**
- **Agent ≠ Executable entity**
- **Command ≠ Executable entity**
- **Intake ≠ Runtime execution**
- **Plugin = execution authority and is explicitly gated**

Terminology drift is not allowed.

---

## 4. Execution Ground Truth (Locked)

### Atomic Unit of Execution

- The **atomic unit of execution is a capability invocation**
- A capability invocation is the smallest indivisible action that:
  - Requires authority to perform
  - Either succeeds or fails atomically
  - Has observable effects (returns data, modifies state, or triggers external behavior)

Examples (non-exhaustive):
- Read bytes from a specific file path
- Write bytes to a specific file path
- Execute a specific shell command with specific arguments
- Send a specific HTTP request to a specific URL
- Send a specific prompt to a specific provider and receive a response

A skill, agent, or command may *request* one or more capability invocations, but none of them execute.

---

### Authority Model

- **Authority is exercised only at the Execution Authority Gate (EAG)**
- No other layer holds or confers execution authority
- Skills, agents, and commands are **compositional only**
- Any architecture that bypasses the Execution Authority Gate is **invalid by definition**

---

## 5. Required Information Before Execution (Locked)

No capability invocation may execute unless **all six categories** below are present and complete.
Missing information results in **rejection**, not inference.

1. **Request**
   - Capability type
   - Operation
   - Concrete parameters

2. **Caller Chain**
   - Immediate invoker identity
   - Full trace to session origin
   - Each link identified by a verifiable reference

3. **Declared Intent**
   - Stated purpose of the specific invocation
   - Relationship to the invoking skill's declared scope

4. **Authorization State**
   - Capabilities declared by the invoking skill
   - Scope boundaries in effect
   - Applicable rules

5. **Provenance**
   - Skill source reference (intake report, hash)
   - Integrity status
   - Trust classification (trusted, sandboxed, restricted)

6. **Audit Context**
   - Session identifier
   - Timestamp
   - Correlation ID

---

## 6. Explicit Non-Authorities (Locked)

The following do **not** execute and do **not** confer authority:

- Skills (compiled or platform-native)
- Agents
- Commands
- Providers (in the abstract)

They may request capability invocations but never authorize or perform execution themselves.

---

## 7. Constitutional Document Set (Locked)

The following definitions are now locked as constitutional truth:

| Document | Phase | Status |
|----------|-------|--------|
| 00-Phase Anchor | 1 | Locked |
| 01-Execution Authority Gate (EAG) | 2 | Locked |
| 02-Intent Semantics | 2 | Locked |
| 03-Caller Chain Verification Semantics | 2 | Locked |
| 04-Provenance Classification Rules | 2 | Locked |
| 05-Minimal Runtime Boundary Definition | 3 | Locked |
| 06-Declared Scope Structure | 4 | Locked |
| 07-Skill Intake Validation Contract | 5.1 | Derived (Locked) |
| 08-Declared Intent Validation Contract | 5.2 | Derived (Locked) |
| 09-Caller Chain Validation Contract | 5.3 | Derived (Locked) |
| 10-Provenance Attestation Validation Contract | 5.4 | Derived (Locked) |
| 11-Invocation Assembly Validation Contract | 5.5 | Derived (Locked) |
| 12-Canonical Reference Flow | 6.1 | Conformance (Frozen) |
| 13-Adversarial Test Vectors | 6.2 | Conformance (Frozen) |
| 14-Minimal Conformance Checklist | 6.3 | Conformance (Frozen) |
| 15-Freeze Point Declaration | 6.4 | Conformance (Frozen) |

---

## 8. Constitutional Invariants (Locked)

The following invariants apply across all constitutional documents:

### Request Assembly Invariant

The complete capability invocation request, including all six input categories, must be assembled by a platform component that is not the invoking skill. The invoking skill may provide request parameters and declare intent, but may not construct its own caller chain, provenance attestation, or audit context.

### Intake Authority Invariant

Skill intake is a platform administrative action, not a runtime operation. The intake process is subject to audit. No runtime component may perform intake, modify intake records, or bypass intake. Scope declared at intake is the maximum scope; it cannot be expanded by any process other than re-intake producing a new skill identity.

### Platform Definition

"Platform" refers to the constitutional authors and administrative processes that define capability types, cardinality limits, and intake processes. Platform-defined constraints are constitutional extensions, not runtime configurations. Platform administrative actions are distinct from runtime invocation paths.

---

## 9. Final Constraint

Any future architecture, runtime, plugin, or execution model that bypasses the Execution Authority Gate, weakens its semantics, or introduces implicit execution authority is **invalid by definition**, regardless of convenience or performance.

---

**End of Phase Anchor**
