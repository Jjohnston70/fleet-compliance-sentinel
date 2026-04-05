# Implementation Rules

**Status:** Implementation Layer (Below Freeze Line)
**Version:** 1.0.0
**Date:** 2026-02-04

---

## Hard Rule

**Any implementation prompt MUST:**

1. **Declare which constitutional documents constrain the work**
2. **State what authority the component does NOT have**
3. **Identify which Phase 5 validators gate it**

---

## Rationale

This rule exists to prevent constitutional drift. Implementation work that does not explicitly acknowledge its constraints will inevitably violate them.

The constitution does not advise; it defines. Implementation prompts that proceed without declaring constraints treat the constitution as guidance rather than law.

---

## Required Format

Every implementation prompt must begin with an explicit acknowledgment block:

```
CONSTITUTIONAL CONSTRAINTS:
- [List documents 00-15 that apply]

AUTHORITY STATEMENT:
This component has NO authority to:
- [List prohibited actions]

VALIDATION GATES:
- [List which Phase 5 contracts validate inputs/outputs]
```

---

## Examples

### Correct

```
CONSTITUTIONAL CONSTRAINTS:
- 01-execution-authority-gate.md: EAG is sole decision boundary
- 05-minimal-runtime-boundary-definition.md: Execution ordering
- 11-invocation-assembly-validation-contract.md: Request structure

AUTHORITY STATEMENT:
This component has NO authority to:
- Grant or deny execution (EAG only)
- Infer missing data (EAG §7.1)
- Mutate requests (EAG §7.2)
- Provide remediation guidance (EAG §7.7)

VALIDATION GATES:
- Phase 5.5 validates the assembled request before EAG submission
- Phase 5.2 validates intent structure
- Phase 5.3 validates caller chain integrity
```

### Incorrect

```
Let me build a component that handles capability requests...
```

This is incorrect because it proceeds without declaring constraints.

---

## Enforcement

If an implementation prompt does not include the required acknowledgment block:

1. **Stop** — Do not proceed with implementation
2. **Require** — The acknowledgment block must be provided
3. **Verify** — The declared constraints must be accurate

---

## Constitutional Basis

This rule is derived from:

- **15-freeze-point-declaration.md §9.1**: "A constitutional violation occurs if... Any component grants, denies, or bypasses authority outside EAG"
- **CONSTITUTION.md §Core Principles**: "Missing information results in denial, not inference"
- **Phase Anchor §8**: Request Assembly Invariant

The same principle that requires complete information before execution requires complete constraint acknowledgment before implementation.

---

## Phase 5 Validator Reference

| Validator | Rules | Gates |
|-----------|-------|-------|
| 5.1 Skill Intake | 30 | Skill artifacts at admission |
| 5.2 Declared Intent | 17 | Intent structure before assembly |
| 5.3 Caller Chain | 34 | Chain integrity before assembly |
| 5.4 Provenance | 32 | Provenance attestation before assembly |
| 5.5 Invocation Assembly | 35 | Complete request before EAG |

Any component that produces artifacts consumed by these validators must declare which validators gate its output.

Any component that consumes artifacts produced after these validators must declare which validators have already run.

---

## Final Statement

This rule is not optional. It is not guidance. It is not a suggestion.

**If you cannot declare the constraints, you do not understand the work.**

If you do not understand the work, you will violate the constitution.

---

**END OF IMPLEMENTATION RULES**
