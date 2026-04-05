# Developer Onboarding Guide

**Welcome to the TNDS Platform!**

This guide will get you from zero to productive in 30-60 minutes.

**Last Updated:** 2026-02-07

---

## What You'll Learn

1. [What is TNDS?](#what-is-tnds) — System overview
2. [Prerequisites](#prerequisites) — What you need installed
3. [Getting Started](#getting-started) — Clone, install, verify (15 min)
4. [Project Structure](#project-structure) — Where things live
5. [First Tasks](#first-tasks) — Hands-on exercises (30 min)
6. [Key Concepts](#key-concepts) — Essential knowledge
7. [Development Workflow](#development-workflow) — Day-to-day operations
8. [Getting Help](#getting-help) — Resources and support

---

## What is TNDS?

**TNDS Platform** (True North Command Center) is a **governed LLM execution system** where:

- **Governance precedes execution** — 148 validation rules run before any capability
- **EAG is sole authority** — Execution Authority Gate grants explicit Permit/Deny
- **Models are text generators** — LLMs have zero authority
- **Execution is traceable** — Complete audit trails
- **Fail-closed by default** — Unknown states → denial

### What Makes TNDS Different?

| Traditional LLM Systems | TNDS Platform |
|------------------------|---------------|
| Models make decisions | EAG makes decisions |
| Prompts define behavior | Constitution defines behavior |
| Trust assumed | Trust explicit |
| No formal validation | 148 frozen validation rules |

### Core Innovation

**Separation of concerns** where models generate text, governance validates requests, and execution occurs only after explicit authorization—with complete audit trails.

---

## Prerequisites

### Required

- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)
- **Text Editor** — VS Code recommended

### Recommended

- **TypeScript knowledge** — ES6+ syntax familiarity
- **Jest experience** — Testing framework
- **Git workflow** — Basic branching and commits

### Verify Installation

```bash
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 9.0.0
git --version     # Any recent version
```

---

## Getting Started (15 minutes)

### Step 1: Clone the Repository

```bash
# Clone the repo
git clone <repository-url> tnds-platform
cd tnds-platform

# Check current branch
git branch
# Should show: * master
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# Expected output:
# added X packages in Xs
```

**Troubleshooting:** If install fails, ensure Node 18+ is installed.

### Step 3: Verify TypeScript Compilation

```bash
# Check TypeScript compiles without errors
npm run typecheck

# Expected output:
# (no output = success)
```

### Step 4: Run Tests

```bash
# Run implementation tests (should be fast)
npm test -- tests/templates/ tests/entitlements/

# Expected output:
# Test Suites: 2 passed, 2 total
# Tests:       42 passed, 42 total
```

**✅ If all tests pass, your environment is ready!**

---

## Project Structure

### High-Level Overview

```
tnds-platform/
├── src/                    # Implementation code
│   ├── validators/         # Phase 5 validation contracts (148 rules)
│   ├── control/            # EAG and control loader
│   ├── execution/          # Phase 8-9 execution layer
│   ├── templates/          # Phase 12 template system
│   └── entitlements/       # Phase 13 entitlement system
├── tests/                  # Test suites
│   ├── conformance/        # Constitutional compliance tests
│   ├── templates/          # Phase 12 tests
│   ├── entitlements/       # Phase 13 tests
│   └── integration/        # Cross-component tests
├── docs/                   # Documentation
│   ├── PROGRESS.md         # Phase tracking
│   ├── CONSTITUTION.md     # 148 validation rules
│   ├── phases/             # Phase-by-phase docs
│   └── guides/             # This guide!
├── ai/                     # Immutable artifacts
│   ├── control/            # Control layer (frozen)
│   ├── templates/          # Template registry
│   └── entitlements/       # Entitlement registry
├── skills/                 # Operational skills
├── legacy/                 # Legacy skills (pre-constitution)
└── archive/                # Superseded documentation
```

### Key Directories

#### `src/` — Implementation Code

**What:** Production TypeScript code
**Who:** Developers working on core system
**Key Files:**
- `src/validators/` — Phase 5.1-5.5 validators
- `src/control/eag.ts` — Execution Authority Gate
- `src/templates/loader.ts` — Template system
- `src/entitlements/validator.ts` — Entitlement system

#### `tests/` — Test Suites

**What:** Jest test files
**Who:** Developers, QA engineers
**Key Files:**
- `tests/templates/loader.test.ts` — 18 tests (100% passing)
- `tests/entitlements/validator.test.ts` — 24 tests (100% passing)
- `tests/conformance/adversarial/` — 54 tests (54% passing, known limitations)

#### `docs/` — Documentation

**What:** Markdown documentation
**Who:** All contributors
**Key Files:**
- `docs/PROGRESS.md` — Phase implementation status
- `docs/CONSTITUTION.md` — 148 frozen validation rules
- `docs/phases/` — Phase-by-phase completion reports
- `docs/guides/` — This guide and test execution guide

#### `ai/` — Immutable Artifacts

**What:** Frozen metadata and control files
**Who:** Platform admins (rarely modified)
**Key Files:**
- `ai/control/prompt-registry.v1.0.0.json` — Control layer
- `ai/templates/template-registry.v1.0.0.json` — Template metadata
- `ai/entitlements/entitlement-registry.v1.0.0.json` — Entitlement registry

---

## First Tasks (30 minutes)

### Task 1: Read Core Documentation (10 min)

**Goal:** Understand system architecture

**Files to Read:**
1. [README.md](../../README.md) — Project overview
2. [ARCHITECTURE.md](../../ARCHITECTURE.md) — System design
3. [TODO.md](../../TODO.md) — Phase roadmap

**Key Questions:**
- What is the Execution Authority Gate (EAG)?
- What are the 5 architectural invariants?
- Which phases are complete?

**Check Your Understanding:**
- Can you explain the difference between governance and execution layers?
- What happens when EAG denies a request?

---

### Task 2: Explore Phase 12 (Template System) (10 min)

**Goal:** Understand a production-ready implementation

**Files to Read:**
1. [docs/phases/phase-12/Phase_12_COMPLETE.md](../phases/phase-12/Phase_12_COMPLETE.md)
2. [src/templates/types.ts](../../src/templates/types.ts)
3. [tests/templates/loader.test.ts](../../tests/templates/loader.test.ts)

**Exercise:**
```bash
# Run Phase 12 tests
npm test -- tests/templates/

# Read the test output
# Can you identify the 5 test categories?
```

**Key Concepts:**
- Templates are files, not model state
- Folder-level access control
- Hash verification for integrity
- Fail-closed error handling

---

### Task 3: Run Conformance Tests (5 min)

**Goal:** See governance layer in action

**Exercise:**
```bash
# Run conformance tests
npm run test:conformance

# Expected: Mix of passing and failing tests
# This is normal! Phase 10 has known limitations.
```

**Observe:**
- Which test categories pass 100%? (Category C, F)
- Which categories have failures? (Category B, D, E)
- What does this tell you about governance effectiveness?

**Answer:** Governance layer proven effective (Categories C & F = 100%), but test harness needs iteration.

---

### Task 4: Explore Constitutional Documents (5 min)

**Goal:** Understand governance foundation

**Files to Read:**
1. [docs/01-execution-authority-gate.md](../01-execution-authority-gate.md) — EAG definition
2. [docs/12-canonical-reference-flow.md](../12-canonical-reference-flow.md) — 18-step flow
3. [docs/CONSTITUTION.md](../CONSTITUTION.md) — 148 validation rules

**Key Questions:**
- What is the canonical 18-step flow?
- How many validation rules exist? (148)
- What are the 5 validation phases? (5.1-5.5)

---

## Key Concepts

### 1. Governance Precedes Execution

**Principle:** No capability runs without prior validation

**Flow:**
```
Request → Validators (5.1-5.5) → EAG → Execution
          ↑                      ↑      ↑
          148 rules              Permit/Deny only
```

**Example:**
```typescript
// This will NOT execute until EAG grants Permit
const request = {
  capability_type: 'filesystem',
  operation: 'read',
  parameters: { path: '/data/file.txt' }
};

// Validators run first
const validationResult = await validate(request);

// EAG decides
const decision = eag.evaluate(validationResult);

// Execution occurs only after Permit
if (decision === 'Permit') {
  await executeCapability(request);
}
```

---

### 2. EAG is Sole Authority

**Principle:** Only the Execution Authority Gate grants Permit

**What this means:**
- No other component can authorize execution
- Models cannot grant capabilities
- Validators can deny but never permit
- EAG is the only "Permit" source

**Code Example:**
```typescript
// ❌ WRONG - Component cannot grant execution
function myFunction() {
  if (someCondition) {
    execute(); // Violates sole authority principle
  }
}

// ✅ CORRECT - All paths go through EAG
function myFunction() {
  const request = buildRequest();
  const decision = eag.evaluate(request);
  if (decision === 'Permit') {
    execute();
  }
}
```

---

### 3. Models Have No Authority

**Principle:** LLMs are text generators, not decision makers

**What this means:**
- Provider layer (Claude, GPT, Ollama) has zero authority
- Models cannot modify governance
- Models cannot grant capabilities
- Models are interchangeable

**Architecture:**
```
Governance Layer  →  EAG decisions
Execution Layer   →  Step traversal
Capability Layer  →  Platform operations
Provider Layer    →  Text generation ONLY
```

---

### 4. Execution is Traceable

**Principle:** Every step produces audit record

**What this means:**
- ExecutionTrace captures all steps
- StepResult includes rejection reasons
- Audit records include failed rules
- Complete audit trail for compliance

**Example:**
```typescript
interface ExecutionTrace {
  steps: StepResult[];
  outcome: 'permit' | 'deny';
  rejection_point?: string;
  failed_rules?: string[];
}
```

---

### 5. Fail-Closed by Default

**Principle:** Unknown states result in denial

**What this means:**
- Missing data → validation failure
- Parse errors → explicit denial
- Unknown capability → deny
- Registry not loaded → error

**Code Pattern:**
```typescript
// ✅ CORRECT - Explicit error handling
function validate(input: unknown): ValidationResult {
  if (!input) {
    return { status: 'error', error: 'Missing input' };
  }

  try {
    const parsed = parse(input);
    return validateParsed(parsed);
  } catch (error) {
    return { status: 'error', error: 'Parse failed' };
  }
}

// ❌ WRONG - Implicit success
function validate(input: unknown): ValidationResult {
  const parsed = parse(input); // Throws on error
  return { status: 'success' }; // No explicit error path
}
```

---

## Development Workflow

### Day-to-Day Development

#### 1. Start Your Work

```bash
# Pull latest changes
git pull origin master

# Create feature branch
git checkout -b feature/my-feature

# Verify tests pass before starting
npm test
```

#### 2. Make Changes

```bash
# Edit source files in src/
# Edit tests in tests/

# Run TypeScript check frequently
npm run typecheck

# Run relevant tests
npm test -- tests/path/to/my-tests.test.ts
```

#### 3. Run Tests

```bash
# Run tests related to your changes
npm test

# Expected: All tests should still pass
# (Or add new tests for new functionality)
```

#### 4. Commit Changes

```bash
# Stage changes
git add src/my-file.ts tests/my-test.test.ts

# Commit with clear message
git commit -m "feat: add new validation rule for X"

# Follow commit message conventions:
# feat: new feature
# fix: bug fix
# docs: documentation only
# test: test changes
# refactor: code restructuring
```

#### 5. Create Pull Request

```bash
# Push branch to remote
git push origin feature/my-feature

# Create PR via GitHub UI
# Include: description, test results, phase reference
```

---

### Before Committing

**Checklist:**
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Tests pass (`npm test`)
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] Commit message follows conventions
- [ ] Constitutional compliance maintained

---

## Common Tasks

### Adding a New Validation Rule

**Location:** `src/validators/`

**Steps:**
1. Read [docs/CONSTITUTION.md](../CONSTITUTION.md) for rule context
2. Identify which phase (5.1-5.5) the rule belongs to
3. Add rule to appropriate validator file
4. Add test case in `tests/conformance/phase5/`
5. Update rule count in documentation

**Example:**
```typescript
// src/validators/intent.ts
export function validateIntent(intent: Intent): ValidationResult {
  // Add new rule
  if (!intent.purpose) {
    return {
      status: 'error',
      error: 'Intent must declare purpose',
      rule: 'intent-purpose-required'
    };
  }

  // ... other rules
}
```

---

### Adding a New Test

**Location:** `tests/` directory

**Steps:**
1. Determine test category (conformance, implementation, integration)
2. Create or edit test file
3. Follow naming conventions
4. Test fail-closed behavior
5. Run tests to verify

**Example:**
```typescript
// tests/templates/loader.test.ts
describe('Template Loader', () => {
  describe('New Feature', () => {
    it('should handle new scenario', () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = templateLoader.load(input);

      // Assert
      expect(result.status).toBe('success');
      expect(result.data).toBeDefined();
    });

    it('should fail closed on error', () => {
      const badInput = createInvalidInput();

      expect(() => templateLoader.load(badInput))
        .toThrow('Expected error message');
    });
  });
});
```

---

### Understanding a Phase

**Resources:**
1. Check `TODO.md` for phase overview
2. Read phase completion report in `docs/phases/phase-N/`
3. Review implementation in `src/`
4. Run phase tests
5. Check constitutional docs for rules

**Example: Understanding Phase 12**
```bash
# 1. Check TODO.md for Phase 12 overview
cat TODO.md | grep -A 20 "PHASE 12"

# 2. Read completion report
cat docs/phases/phase-12/Phase_12_COMPLETE.md

# 3. Review implementation
ls -la src/templates/

# 4. Run tests
npm test -- tests/templates/

# 5. Check constitutional docs
cat docs/12-canonical-reference-flow.md
```

---

## Getting Help

### Documentation Resources

| Resource | Purpose |
|----------|---------|
| [DOCUMENTATION_INDEX.md](../../DOCUMENTATION_INDEX.md) | Complete documentation index |
| [README.md](../../README.md) | Project overview |
| [ARCHITECTURE.md](../../ARCHITECTURE.md) | System design |
| [TODO.md](../../TODO.md) | Phase roadmap |
| [FINAL_PROJECT_SUMMARY.md](../../FINAL_PROJECT_SUMMARY.md) | Executive summary |
| [docs/guides/test-execution.md](test-execution.md) | Test execution guide |

### Quick Navigation

**Need to understand:**
- **Architecture?** → [ARCHITECTURE.md](../../ARCHITECTURE.md)
- **Phases?** → [docs/phases/](../phases/)
- **Tests?** → [test-execution.md](test-execution.md)
- **Constitutional rules?** → [docs/CONSTITUTION.md](../CONSTITUTION.md)
- **Current status?** → [docs/PROGRESS.md](../PROGRESS.md)

### Common Questions

**Q: Which phase should I work on?**
A: Check [TODO.md](../../TODO.md) status table. Currently: Phase 14 (Curriculum Extraction) is next.

**Q: How do I run tests?**
A: See [test-execution.md](test-execution.md) for comprehensive guide.

**Q: Can I modify constitutional documents?**
A: No, docs/00-15 are frozen. Modifications require constitutional amendment process (see [GOVERNANCE.md](../../GOVERNANCE.md)).

**Q: Why do some conformance tests fail?**
A: Phase 10 has known limitations (Category E requires runtime instrumentation, 19 tests have input construction issues). See [docs/phases/phase-10/](../phases/phase-10/).

**Q: How do I add a new phase?**
A: Read [TODO.md](../../TODO.md) global rules. Each phase must declare authority granted/prohibited. Consult [GOVERNANCE.md](../../GOVERNANCE.md).

---

## Next Steps

### After Onboarding

1. **Pick a Task**
   - Review open issues
   - Check TODO.md for next phase
   - Ask maintainers for good first issues

2. **Dive Deeper**
   - Read phase completion reports
   - Study constitutional documents
   - Review code review reports

3. **Contribute**
   - Fix test failures
   - Add documentation
   - Implement next phase
   - Improve test coverage

### Recommended Reading Order

**Week 1: Foundations**
1. [README.md](../../README.md)
2. [ARCHITECTURE.md](../../ARCHITECTURE.md)
3. [TODO.md](../../TODO.md)
4. [docs/PROGRESS.md](../PROGRESS.md)

**Week 2: Deep Dive**
1. [docs/CONSTITUTION.md](../CONSTITUTION.md)
2. [docs/01-execution-authority-gate.md](../01-execution-authority-gate.md)
3. [docs/12-canonical-reference-flow.md](../12-canonical-reference-flow.md)
4. Phase 12 & 13 completion reports

**Week 3: Implementation**
1. Read source code in `src/`
2. Study test patterns in `tests/`
3. Review control layer integration
4. Understand entitlement system

---

## Keyboard Shortcuts (VS Code)

```
Ctrl/Cmd + P       → Quick file open
Ctrl/Cmd + Shift + F → Search across files
Ctrl/Cmd + `       → Open terminal
F12                → Go to definition
Shift + F12        → Find references
Ctrl/Cmd + B       → Toggle sidebar
```

---

## Checklist: Onboarding Complete

- [ ] Cloned repository
- [ ] Installed dependencies (`npm install`)
- [ ] Verified TypeScript compilation (`npm run typecheck`)
- [ ] Ran tests successfully (`npm test`)
- [ ] Read README.md, ARCHITECTURE.md, TODO.md
- [ ] Explored Phase 12 implementation
- [ ] Ran conformance tests
- [ ] Understand EAG and governance layer
- [ ] Know where to find documentation
- [ ] Ready to contribute!

---

**Welcome to the team!**

**Questions?** Open an issue or ask in team chat.

**Ready to contribute?** Check [TODO.md](../../TODO.md) for next phase.

---

**Last Updated:** 2026-02-07
**Maintained By:** TNDS Platform Team
