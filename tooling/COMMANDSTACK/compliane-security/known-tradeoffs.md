# Known Tradeoffs

Documented compromises and their implications.

## Purpose

Every system makes tradeoffs. This document captures them explicitly so future decisions account for known limitations.

---

## Documentation vs. Code

**Tradeoff**: Documentation-first means documentation can drift from implementation.

**What We Chose**: Documentation as source of truth, with validation tooling.

**What We Gave Up**: 
- Automatic documentation generation from code
- Single source of truth in code
- Type-level guarantees

**Mitigation**: 
- `scripts/validate-structure.sh` checks alignment
- CI/CD validation before merge
- Culture of doc-first development

---

## Multi-Provider vs. Simplicity

**Tradeoff**: Supporting multiple providers adds complexity.

**What We Chose**: Claude + ChatGPT + Ollama with routing logic.

**What We Gave Up**:
- Simplicity of single-provider architecture
- Guaranteed consistent behavior
- Simpler testing matrix

**Mitigation**:
- Provider-agnostic skill definitions
- Comprehensive fallback handling
- Provider-specific integration tests

---

## Audit Requirements vs. Speed

**Tradeoff**: Audit-before-execute adds friction to workflows.

**What We Chose**: Required audits for non-trivial operations.

**What We Gave Up**:
- Rapid execution without review
- Autonomous agent operations
- Frictionless user experience

**Mitigation**:
- Clear criteria for what requires audit
- Fast-track path for low-risk operations
- Audit agent designed for speed when appropriate

---

## Local-First (Ollama) vs. Capability

**Tradeoff**: Ollama provides privacy/cost benefits but limited capability.

**What We Chose**: Include Ollama as primary option for appropriate workloads.

**What We Gave Up**:
- Consistent quality across all operations
- Simpler capability assumptions
- Reduced routing complexity

**Mitigation**:
- Clear routing rules for when to use Ollama
- Automatic fallback to cloud providers
- Quality validation in output

---

## Explicit Structure vs. Flexibility

**Tradeoff**: Rigid folder structure limits creative organization.

**What We Chose**: Predefined directory structure with clear purposes.

**What We Gave Up**:
- Flexibility to organize differently per project
- Gradual structure evolution
- Team-specific conventions

**Mitigation**:
- Labs for experimental structures
- Clear extension points
- Regular structure reviews

---

## Markdown vs. Structured Data

**Tradeoff**: Markdown is human-readable but harder to parse programmatically.

**What We Chose**: Markdown for documentation, JSON for configuration.

**What We Gave Up**:
- Single format for everything
- Perfect machine parseability
- Schema validation for docs

**Mitigation**:
- JSON for anything machines need to consume
- Markdown structure conventions (headers, lists)
- Tooling to extract structured data from markdown when needed

---

## Template for New Tradeoffs

```markdown
## [Title]

**Tradeoff**: Brief description of the tension.

**What We Chose**: The decision we made.

**What We Gave Up**:
- Specific capability or benefit lost
- Another thing sacrificed

**Mitigation**:
- How we address the downside
- Workarounds or future plans
```
