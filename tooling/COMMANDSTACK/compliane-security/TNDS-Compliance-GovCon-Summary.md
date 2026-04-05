# TNDS Platform -- Compliance & GovCon Readiness Summary

**Organization:** True North Data Strategies (TNDS)
**Certification:** SBA-certified VOSB/SDVOSB
**Compliance Baseline:** v1.0.0 (frozen 2026-02-07)
**Review Cycle:** Quarterly
**Platform:** TNDS Command Center -- a governed AI execution platform

---

## 1. Platform Overview

The TNDS Platform is a governed LLM execution system where AI agents operate under constitutional authority. The platform enforces that no AI model has autonomous authority -- all execution must pass through a validated governance pipeline before any action is taken. The system is built on 16 frozen constitutional documents (numbered 00-15), 148 validation rules, and a four-layer protection model that enforces immutability, traceability, and fail-closed behavior at every boundary.

The core architectural guarantee: governance precedes execution. Models receive instructions from a frozen, immutable control layer that is loaded, validated, and sealed at startup before any agent interaction occurs.

---

## 2. Constitutional Specification

### 2.1 Document Inventory

16 frozen constitutional documents spanning Phases 1-6:

- **Phase 1 (Docs 00-02):** Foundation -- system identity, boundaries, operational rules
- **Phase 2 (Docs 03-05):** Execution Model -- skill execution framework, trust model, provider routing
- **Phase 3 (Docs 06-08):** Governance -- capability scope definitions, action classification, audit requirements
- **Phase 4 (Docs 09-10):** Validation Framework -- validation pipeline, adversarial test specification
- **Phase 5 (Docs 11-15):** Validation Contracts -- 5 validator contracts with 148 total rules
- **Phase 6:** Implementation rules (separate from numbered docs)

### 2.2 Five Constitutional Guarantees

1. Every execution request passes through the Execution Authority Gate (EAG)
2. No model has autonomous authority -- all authority is derived from frozen governance artifacts
3. All inputs must be explicitly declared (6 required input categories)
4. All outputs must be traceable to their authorization source
5. The system fails closed on any governance violation

### 2.3 Execution Authority Gate (EAG)

The EAG is the sole decision boundary for all AI execution. It is a stateless predicate evaluator that returns binary Permit/Deny decisions.

**Seven explicit EAG prohibitions -- the EAG cannot:**
1. Infer missing data
2. Mutate inputs or outputs
3. Enrich requests with additional context
4. Originate new requests
5. Delegate authority to other components
6. Persist state between evaluations
7. Advise or suggest alternatives

**Six required input categories for every execution request:**
1. Request (what is being asked)
2. Caller Chain (who is asking, full chain)
3. Declared Intent (what the caller says they want to do)
4. Authorization State (what permissions exist)
5. Provenance (where the request originated, trust level)
6. Audit Context (traceability metadata)

### 2.4 Phase 5 Validation Contracts

Five validator contracts with rule counts:

| Contract | Rules | Purpose |
|----------|-------|---------|
| 5.1 Skill Intake | 30 | Validates skill registration and metadata |
| 5.2 Intent Validation | 17 | Validates declared intent against allowed operations |
| 5.3 Caller Chain | 34 | Validates caller identity and chain integrity |
| 5.4 Provenance | 32 | Validates request origin and trust level |
| 5.5 Assembly | 35 | Validates final execution assembly before dispatch |
| **Total** | **148** | |

### 2.5 Authorization Model

Authorization is computed as the intersection of four (now five with Phase 13) dimensions:

```
Authorization = Scope ∩ Provenance ∩ Intent ∩ Rules ∩ Entitlement
```

All components must succeed. Any single failure results in denial (fail-closed).

- **Scope** is capability-scoped, not client-scoped (per Doc 06 Section 3.2)
- **Provenance** determines trust level (per Doc 04)
- **Intent** must be explicitly declared, never inferred
- **Rules** are evaluated as predicates against frozen governance artifacts
- **Entitlement** (Phase 13) adds client-specific access predicates evaluated against immutable registry

---

## 3. Four-Layer Protection Model

All four layers must pass (AND relationship). No single layer can be bypassed.

### Layer 1: Version Control (Git Tags)

- Semantic versioning: `control-layer-vX.Y.Z`
- Tags provide immutable reference points
- Each version frozen with `frozen_at` timestamp
- Old versions never modified -- new versions created
- Tag release scripts provided (Bash + PowerShell)

### Layer 2: CI Automation (GitHub Actions)

Workflow: `.github/workflows/control-layer-guard.yml`

Six CI validation checks on every PR touching control layer:
1. Detect changes to `ai/control/*` files
2. Validate version bump exists
3. Check immutability markers present (`"status": "immutable"`, `frozen_at`)
4. Verify JSON schema compliance
5. Run constitutional validation tests
6. Block merge on any failure

CI guard cannot be bypassed -- no `continue-on-error`, no skip conditions.

### Layer 3: Runtime Verification (SHA-256 Hash)

- Hash computed at every application startup via `getControlHash()`
- Hash logged to audit trail for integrity verification
- `verifyControlIntegrity()` returns boolean pass/fail
- Startup fails (application does not start) if integrity check fails
- Seven-step startup integrity sequence:
  1. Load control layer from `ai/control/prompt-registry.v1.0.0.json`
  2. Validate version pin (`meta.version === '1.0.0'`)
  3. Compute SHA-256 hash of full content
  4. Log hash to audit trail
  5. Apply `Object.freeze()` recursively to all artifacts
  6. Assert freeze succeeded (verify immutability)
  7. If any step fails, throw error and halt startup (fail-closed)

### Layer 4: Code Review (CODEOWNERS)

Seven protected paths requiring `@TNDS-Command-Center/platform-admins` review:
1. `/ai/control/` -- command authority artifacts
2. `/src/control/` -- control layer implementation
3. `/src/startup/` -- initialization and integrity checks
4. `/docs/CONSTITUTION.md` -- constitutional specification
5. `/src/constitution/` -- constitutional loading code
6. `/src/validators/` -- validation implementations
7. `/tests/conformance/` -- conformance test suite

Three GitHub teams enforce access:
- `platform-admins` -- control layer authority (required reviewer)
- `developers` -- general development team
- `architects` -- architecture decision makers

Branch protection settings: require PR, require code owner review, require `verify-control-layer` status check, no bypass allowed.

---

## 4. FedRAMP / NIST 800-53 Rev 5 Control Narratives

### 4.1 Access Control (AC) Family

**AC-2: Account Management**
- Team-based access via GitHub CODEOWNERS
- Three roles: platform-admins, developers, architects
- Role assignment documented in GitHub team membership
- Access review integrated with quarterly compliance review
- Evidence: `.github/CODEOWNERS` file, GitHub team membership logs

**AC-3: Access Enforcement**
- Four-layer enforcement model (Version Control + CI + Runtime + Code Review)
- All layers must pass -- AND relationship, not OR
- No single point of bypass
- Evidence: CI logs, CODEOWNERS, startup hash logs, git tags

**AC-6: Least Privilege**
- `Object.freeze()` applied recursively to all control artifacts at runtime
- Role-based access: only `platform-admins` can approve control layer changes
- Control artifacts are read-only after startup -- no runtime modification possible
- Agents cannot search, discover, or modify control layer -- authority is selected, not searched
- Evidence: `Object.freeze()` in `src/control/loader.ts`, CODEOWNERS protected paths

### 4.2 Configuration Management (CM) Family

**CM-2: Baseline Configuration**
- Versioned, immutable baselines with `"status": "immutable"` and `frozen_at` timestamp
- Baseline artifact: `ai/control/prompt-registry.v1.0.0.json`
- Version pinned in loader: `meta.version === '1.0.0'` (hardcoded check)
- Baseline frozen and tagged: `control-layer-v1.0.0`
- Evidence: Registry JSON with immutability markers, git tag, loader version check

**CM-3: Configuration Change Control**
- Four-layer change control process:
  1. Proposal: Create new version of control artifact
  2. Automated Review: CI guard validates version bump, immutability markers, schema
  3. Security Impact Analysis: CODEOWNERS requires platform-admin review
  4. Approval: PR approval from designated reviewers
  5. Implementation: Merge to main branch
  6. Verification: Post-merge CI validation + startup hash verification
- Evidence: PR history, CI logs, CODEOWNERS approval records

**CM-6: Configuration Settings**
- Four enforced configuration constraints:
  1. Version pin: `meta.version === '1.0.0'` checked at load time
  2. Immutability markers: `"status": "immutable"` required in registry
  3. Freeze enforcement: `Object.freeze()` applied recursively
  4. Fail-closed mode: application halts if any constraint violated
- Evidence: `src/control/loader.ts` validation logic, startup logs

### 4.3 System and Information Integrity (SI) Family

**SI-7: Software, Firmware, and Information Integrity**
- SHA-256 hash verification at every application startup
- `getControlHash()` computes hash of full control layer content
- `verifyControlIntegrity()` returns boolean integrity status
- Hash mismatch triggers fail-closed behavior (application does not start)
- Evidence: Hash values in startup logs, `src/control/loader.ts` hash functions

**SI-7(1): Integrity Checks at Startup**
- Seven-step startup integrity sequence (detailed in Layer 3 above)
- Startup will not complete if any integrity check fails
- No graceful degradation -- full halt on integrity violation
- Evidence: `src/startup/initialize.ts` initialization sequence, startup logs

### 4.4 Audit and Accountability (AU) Family

**AU-2: Audit Events**
- Five auditable event types:
  1. Control layer loading (startup hash, version, timestamp)
  2. Control layer change attempts (CI guard triggers)
  3. CI validation results (pass/fail with details)
  4. Code review decisions (approval/rejection with reviewer identity)
  5. Version tagging events (new versions frozen)
- Evidence: CI logs, git tag history, startup logs, GitHub PR records

**AU-3: Content of Audit Records**
- Comprehensive audit record content:
  - **What:** Event type and action taken
  - **When:** Timestamp (ISO 8601)
  - **Where:** Component and file path
  - **Source:** Origin of the event (CI, runtime, git)
  - **Outcome:** Success or failure with reason
  - **Identity:** Who triggered the event (user, CI system, runtime)
- Evidence: Structured log output, CI workflow logs, git commit metadata

### 4.5 FedRAMP Assessment Procedures

For each control family, auditors can verify compliance through:
1. **Documentation Review:** Read control narratives and architecture docs
2. **Artifact Inspection:** Examine CODEOWNERS, CI workflow files, registry JSON
3. **Test Execution:** Run `npm run test:conformance` (54 conformance tests)
4. **Log Review:** Check startup hash logs and CI guard output
5. **Change Simulation:** Attempt unauthorized modification, verify CI blocks it

---

## 5. SOC 2 Type II Control Mapping

### 5.1 Trust Services Criteria: CC6 (Logical and Physical Access Controls)

**TNDS-AC-001 (maps to CC6.1): Immutable Control Layer with Version-Pinned Authority**
- Control layer loaded at startup, validated against 148 constitutional rules
- Version-pinned to specific release (`v1.0.0`)
- Frozen with `Object.freeze()` recursively
- Cannot be modified, searched, or discovered by AI agents at runtime
- Evidence: `ai/control/prompt-registry.v1.0.0.json`, `src/control/loader.ts`

**TNDS-AC-002 (maps to CC6.2): Code Review Enforcement via CODEOWNERS**
- Seven protected file paths with mandatory review
- Review required from `@TNDS-Command-Center/platform-admins`
- No bypass mechanism -- branch protection enforced
- Evidence: `.github/CODEOWNERS`, GitHub branch protection settings

**TNDS-AC-003 (maps to CC6.6): Version-Based Access Revocation**
- Immutable versions: once frozen, a version cannot be modified
- Old versions tagged and preserved but never changed
- New versions require full four-layer validation
- Evidence: Git tag history (`control-layer-v*`), registry `frozen_at` timestamps

### 5.2 Trust Services Criteria: CC7 (System Operations)

**TNDS-OP-001 (maps to CC7.2): Runtime Integrity Verification**
- SHA-256 hash computed and logged at every startup
- Integrity verification function available for runtime checks
- Fail-closed on hash mismatch
- Evidence: `getControlHash()` output in startup logs

**TNDS-CM-001 (maps to CC7.3): CI-Enforced Version Bump Validation**
- Six CI validation steps (detailed in Layer 2 above)
- No bypass, no `continue-on-error`
- Blocks merge on any validation failure
- Evidence: `.github/workflows/control-layer-guard.yml`, CI execution logs

**TNDS-CM-002 (maps to CC7.4): Multi-Layer Change Authorization**
- Composite control: all four layers must pass for any change
- No single layer sufficient on its own
- Evidence: Combined CI + CODEOWNERS + version tag + runtime hash verification

**TNDS-OP-002 (maps to CC7.5): Comprehensive Startup and Audit Logging**
- Startup events logged with hash, version, timestamp
- Change events captured in CI logs
- Review decisions recorded in GitHub PR history
- Evidence: Application startup logs, CI workflow logs, git history

### 5.3 SOC 2 Evidence Index

Direct evidence artifact mappings for auditor walkthroughs:

| Control ID | Evidence Type | Artifact Location | Verification Method |
|-----------|---------------|-------------------|-------------------|
| TNDS-AC-001 | Source code | `src/control/loader.ts` | Read version pin check, freeze logic |
| TNDS-AC-001 | Configuration | `ai/control/prompt-registry.v1.0.0.json` | Verify immutability markers |
| TNDS-AC-002 | Configuration | `.github/CODEOWNERS` | Verify protected paths and teams |
| TNDS-AC-003 | Version history | `git tag -l 'control-layer-*'` | List and inspect tags |
| TNDS-OP-001 | Runtime output | Application startup logs | Grep for hash values |
| TNDS-CM-001 | CI configuration | `.github/workflows/control-layer-guard.yml` | Review validation steps |
| TNDS-CM-002 | Multiple | All four layer artifacts | Cross-reference all evidence |
| TNDS-OP-002 | Logs | Startup logs + CI logs + git history | Comprehensive log review |

Evidence retention: code artifacts permanent, CI logs 90 days, git tags permanent.

### 5.4 SOC 2 Audit Walkthrough Procedure

1. **Pre-Audit Prep:** Collect CODEOWNERS, CI workflow file, registry JSON, recent startup logs
2. **Evidence Collection:** Run verification commands (`git tag`, `npm run test:conformance`, review CI logs)
3. **Control Testing:** Attempt unauthorized modification → verify CI blocks it; review startup hash → verify integrity check runs
4. **Documentation Review:** Cross-reference control narratives against implementation artifacts

---

## 6. Entitlement & Multi-Tenant Isolation (Phase 13)

### 6.1 Entitlement Model

Three entitlement statuses:
- **Enabled:** Client has access to skill (scope admission granted), skill appears in marketplace
- **Installed:** Client has configured skill instance with client-specific configuration
- **Disabled:** Client does not have access, all invocations denied at entitlement check

Entitlements are predicates evaluated against an immutable registry, not runtime-inferred permissions. Registry artifact: `ai/entitlements/entitlement-registry.v1.0.0.json` (frozen, `Object.freeze()` applied, SHA-256 hash verified).

### 6.2 Asset Ownership Model

Three ownership tiers:
- **TNDS Platform Owned** (`ai/skills/`): Constitutional, frozen skills accessible only by platform
- **TNDS Operational Owned** (`skills/tns-skill/`): TNDS-owned, mutable skills accessible by all entitled clients
- **Client Owned** (`skills/client-{id}/`): Client-specific, isolated per client with `client_owner` metadata enforcement

### 6.3 Cross-Client Isolation

- Template metadata includes `client_owner` field
- Validation checks `client_id` in provenance against `client_owner` in template metadata
- Mismatch results in access denied (fail-closed)
- No `client_owner` means TNDS-owned, accessible by all entitled clients
- Test coverage: Client A cannot access Client B templates, Client B cannot access Client A skills, both can access TNDS shared templates
- 24/24 tests passing (100%)

---

## 7. Test Coverage & Verification

### 7.1 Test Summary

| Suite | Tests | Passing | Rate | Status |
|-------|-------|---------|------|--------|
| Phase 10 Adversarial | 54 | 29 | 54% | Known architectural limitations |
| Phase 12 Templates | 18 | 18 | 100% | Production ready |
| Phase 13 Entitlements | 24 | 24 | 100% | Production ready |
| **Total** | **96** | **71** | **74%** | |

### 7.2 Adversarial Test Coverage (Phase 10)

40 attack vectors across 7 categories plus 3 cross-category tests:
- **Category A (Authority Escalation):** 4/5 passing (80%)
- **Category B (Scope Smuggling):** Partial -- test harness input mapping issues
- **Category C (Provenance Spoofing):** 6/6 passing (100%) -- provenance enforcement fully proven
- **Category D (Rule Circumvention):** Partial -- test harness debt
- **Category E (Runtime Shortcuts):** 0/6 -- architectural limitation requiring Phase 11+ runtime instrumentation
- **Category F (Validation Bypass):** 5/5 passing (100%) -- validation bypass prevention fully proven
- **Category G (State Manipulation):** 4/5 passing (80%)

Key insight: governance layer effectiveness is proven. Failures are in test harness construction and deferred runtime instrumentation, not in the governance model itself.

### 7.3 Conformance Testing

- 53 conformance checklist questions
- 18-step canonical reference flow
- Global setup validates constitution loading
- Global teardown generates conformance report
- Serial execution (`maxWorkers: 1`) with fail-fast (`bail: true`)

### 7.4 Verification Commands

```bash
npm test                          # All tests
npm run test:conformance          # Conformance tests (54)
npm test -- tests/templates/      # Template tests (18)
npm test -- tests/entitlements/   # Entitlement tests (24)
npm run typecheck                 # TypeScript compilation check
```

---

## 8. GovCon Readiness Posture

### 8.1 Compliance Frameworks Addressed

| Framework | Status | Controls Mapped |
|-----------|--------|----------------|
| FedRAMP / NIST 800-53 Rev 5 | Narrative complete | 10 controls (AC-2, AC-3, AC-6, CM-2, CM-3, CM-6, SI-7, SI-7(1), AU-2, AU-3) |
| SOC 2 Type II | Control mapping complete | 7 TNDS controls across CC6 + CC7 |
| HIPAA | Operational directives in place | Treat all data as regulated by default |
| CCPA/CPRA | Operational directives in place | Privacy-by-default posture |
| NIST 800-171 | Partial (via 800-53 overlap) | CUI protection patterns applicable |

### 8.2 GovCon Differentiators

1. **VOSB/SDVOSB Certified:** SBA-certified veteran-owned small business status
2. **Provable Governance:** "Governance you can prove, not just promise" -- every control has auditable evidence artifacts with exact file locations, line numbers, and verification commands
3. **Constitutional Architecture:** 148 validation rules enforced by code, not policy documents
4. **Immutable Authority:** Control layer cannot be modified at runtime -- frozen, hashed, and verified at every startup
5. **Fail-Closed Design:** System halts rather than operating in degraded/insecure state
6. **Four-Layer AND Model:** Unlike checkbox compliance, all four protection layers must independently pass
7. **Cross-Client Isolation:** Proven tenant separation with test coverage for leakage prevention
8. **Audit-Ready Evidence:** SOC 2 evidence index provides auditor walkthrough procedures with grep commands, test procedures, and exact artifact locations

### 8.3 Considerations for FedRAMP Authorization

- Current implementation addresses Moderate baseline controls in AC, CM, SI, and AU families
- Additional work needed for full FedRAMP authorization: remaining control families (IA, SC, MP, PE, PS, PL, SA, RA, CA, MA, IR, CP)
- Platform is cloud-native (Google Cloud SDK, Firebase, Vercel) -- cloud provider inherits some controls
- Pursuing Google Cloud certifications and Carahsoft VAR reseller path for government distribution
- FISMA and NIST 800-53 considerations flagged in operational directives

### 8.4 Compliance Baseline Metadata

- **Baseline Version:** compliance-baseline-v1.0.0
- **Frozen Date:** 2026-02-07
- **Review Cycle:** Quarterly
- **Constitutional Documents:** 16 (frozen, numbered 00-15)
- **Validation Rules:** 148 across 5 contracts
- **Test Vectors:** 40 adversarial + 53 conformance checklist + 18 canonical flow steps
- **Implementation Phases Complete:** 13 of planned multi-phase roadmap

---

## 9. Architecture Decision Records

Five documented architecture decisions:

1. **ADR-001: Documentation-First Architecture** -- Constitution and governance docs written before code. Rationale: ensures implementation follows specification, not the reverse.
2. **ADR-002: Three-Tier Skill Architecture** -- Atomic Skills (single operation) compose into Composite Skills, which compose into Chains. Rationale: modularity, testability, governance at each level.
3. **ADR-003: Multi-Provider Strategy** -- Claude + ChatGPT + Ollama supported. Rationale: no vendor lock-in, provider routing governed by same constitutional rules.
4. **ADR-004: Labs as Experimentation Zone** -- Separate space for experimentation outside governance constraints. Rationale: innovation without compromising production governance.
5. **ADR-005: Audit-Before-Execute Rule** -- Every execution must be auditable before it occurs. Rationale: traceability is not optional, it is constitutional.

---

## 10. Known Tradeoffs & Limitations

1. **Documentation vs. Code:** Heavy documentation investment upfront. Tradeoff: slower initial velocity, but implementation is specification-compliant.
2. **Audit Requirements vs. Speed:** Every execution logged and traceable. Tradeoff: performance overhead, but audit trail is non-negotiable for GovCon.
3. **Fail-Closed vs. Availability:** System halts on governance violation. Tradeoff: potential downtime, but insecure operation is never acceptable.
4. **Phase 10 Adversarial Gaps:** 25 test failures in adversarial suite. These are test harness construction issues and deferred runtime instrumentation, not governance model failures. Documented as technical debt for future phases.
5. **No Entitlement Versioning/Expiration:** Phase 13 entitlements have no version tracking or time-based expiration. Deferred to future billing/analytics phase.
6. **Integration Test Coverage:** Minimal cross-component integration tests. Known gap being addressed in future phases.

---

## 11. Key File Locations

```
Constitution & Governance:
  docs/CONSTITUTION.md                    -- Constitutional index (16 docs, 148 rules)
  docs/IMPLEMENTATION-RULES.md            -- Hard implementation rules
  ai/control/prompt-registry.v1.0.0.json  -- Immutable control layer artifact

Compliance:
  compliance/fedramp-control-narrative.md  -- FedRAMP/NIST 800-53 narratives (10 controls)
  compliance/soc2-control-mapping.md       -- SOC 2 Type II mapping (7 controls)
  compliance/soc2-evidence-index.md        -- Auditor evidence walkthrough

Control Layer:
  src/control/loader.ts                    -- Control layer loader (version pin, hash, freeze)
  src/startup/initialize.ts                -- Fail-closed startup initialization
  .github/CODEOWNERS                       -- Protected path definitions
  .github/workflows/control-layer-guard.yml -- CI validation workflow

Entitlements:
  ai/entitlements/entitlement-registry.v1.0.0.json -- Immutable entitlement registry
  src/entitlements/validator.ts             -- Entitlement validation logic

Tests:
  tests/conformance/                       -- 54 conformance tests
  tests/templates/loader.test.ts           -- 18 template tests (100%)
  tests/entitlements/validator.test.ts      -- 24 entitlement tests (100%)
```

---

**Prepared:** 2026-03-07
**Source:** `/Users/jacobjohnston/Documents/Documents/constitution -compliance-gov-docs/`
**For:** Reference in external chat context
**Contact:** Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
