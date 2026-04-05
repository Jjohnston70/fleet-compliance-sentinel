# Design Decisions

Architectural decisions and rationale for the LLM Platform.

## Format

Each decision follows the ADR (Architecture Decision Record) format:

```
## [NUMBER] - [TITLE]

**Status**: [proposed|accepted|deprecated|superseded]  
**Date**: YYYY-MM-DD  
**Context**: What prompted this decision  
**Decision**: What we decided  
**Rationale**: Why we decided this  
**Consequences**: What this means going forward  
```

---

## 001 - Documentation-First Architecture

**Status**: Accepted  
**Date**: 2026-02-03  

**Context**: Starting a new LLM orchestration platform. Need to establish structure before writing code.

**Decision**: Use markdown files as the primary definition of agents, skills, commands, and rules. Code implementation follows documentation.

**Rationale**:
- Forces clear thinking about interfaces before implementation
- Documentation stays in sync by design
- LLMs can read and reason about the system
- Lower barrier to understanding for new contributors
- Enables non-developers to propose changes

**Consequences**:
- Must maintain discipline to update docs when behavior changes
- May need tooling to validate docs match implementation
- Some redundancy between docs and code

---

## 002 - Three-Tier Skill Architecture

**Status**: Accepted  
**Date**: 2026-02-03  

**Context**: Need to organize reusable AI capabilities in a scalable way.

**Decision**: Organize skills into three tiers: Atomic → Composite → Chains.

**Rationale**:
- Mirrors proven software patterns (functions → services → workflows)
- Atomic skills are highly reusable building blocks
- Composite skills reduce duplication of common patterns
- Chains handle complex orchestration explicitly
- Clear promotion path from simple to complex

**Consequences**:
- Must resist creating "god skills" that do too much
- Need governance to prevent tier violations
- Documentation required for each skill regardless of tier

---

## 003 - Multi-Provider Strategy

**Status**: Accepted  
**Date**: 2026-02-03  

**Context**: Different LLM providers have different strengths, costs, and constraints.

**Decision**: Support Claude, ChatGPT, and Ollama with intelligent routing.

**Rationale**:
- Claude for complex analysis and code generation
- ChatGPT for alternative approaches and broad tasks
- Ollama for local/sensitive data and rapid iteration
- Reduces vendor lock-in
- Enables cost optimization
- Supports air-gapped/offline scenarios

**Consequences**:
- Must maintain provider-agnostic skill definitions
- Need routing logic and fallback handling
- Testing complexity increases with providers

---

## 004 - Labs as Experimentation Zone

**Status**: Accepted  
**Date**: 2026-02-03  

**Context**: Need a safe space for experimentation without polluting production paths.

**Decision**: Create explicit `labs/` directory for spikes, experiments, and discarded work.

**Rationale**:
- Clear separation between production and experiments
- Preserves history of what was tried
- Reduces fear of experimentation
- Makes promotion path explicit

**Consequences**:
- Must enforce promotion process through scripts
- Labs work should never be directly referenced in production
- Regular cleanup needed to prevent bloat

---

## 005 - Audit-Before-Execute Rule

**Status**: Accepted  
**Date**: 2026-02-03  

**Context**: LLM operations can have significant consequences. Need guardrails.

**Decision**: Require audit review before execution for non-trivial operations.

**Rationale**:
- Aligns with TNDS operational directives (treat data as regulated)
- Prevents accidental destructive actions
- Creates accountability trail
- Supports compliance requirements

**Consequences**:
- Adds friction to workflows (intentionally)
- Need clear criteria for what requires audit
- Auditor agent must be well-defined
