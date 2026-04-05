# Control Layer Integration

This document is DERIVED from `ai/control/stream-policy.v1.0.0.json`, `ai/control/job-policy.v1.0.0.json`, and `ai/routing/policies/provider-fallback-policy.v1.0.0.json`.
JSON is authoritative.

## Status: ✅ COMPLETE (2026-02-07)

The `ai/control` layer has been successfully integrated into the TNDS platform as **immutable command authority**, following strict governance principles.

> **The platform now hands the AI its job description before it is allowed to do anything.**
> **That job description cannot change, cannot be searched for, and cannot be ignored.**

### Integration Complete

All core requirements met:
- ✅ Control loaded at startup
- ✅ Validation enforced at load time
- ✅ Fail-closed on any error
- ✅ Immutability guaranteed
- ✅ Isolation from agent discovery
- ✅ No architectural drift

All polish items applied:
- ✅ Freeze assertion added
- ✅ Version pin check enforced
- ✅ Documentation pointers added

**Files Created:** 9 total (see details at end)

---

## Overview

The `ai/control` layer has been integrated into the TNDS platform as **command authority**, following the same immutable, fail-closed pattern as the constitution loader.

## Architecture Principles

### Control vs. Knowledge

- **ai/control** = Command authority (selected, not searched)
- **tnds-knowledge** = Reference library (searched, not commanded)
- Agents receive prompts from control; they do not discover them
- Control data is NOT exposed to vector search or embeddings

### Immutability

- `prompt-registry.v1.0.0.json` is frozen (status: "immutable", frozen_at timestamp)
- All artifacts are loaded once at startup and frozen with `Object.freeze()`
- **Freeze assertion**: `Object.isExtensible()` check verifies freeze succeeded
- **Version pin**: Enforces `meta.version === '1.0.0'` matches filename
- No runtime modification or reloading; fallback behavior is defined only in authoritative JSON policy files
- Fails fast if validation fails or freeze assertion fails

## Integration Points

### 1. Startup Initialization

**Location:** `src/startup/initialize.ts`

```typescript
import { initialize } from "./startup";

// Call this BEFORE any execution logic
const result = initialize();
// Loads constitution + control, validates both, verifies integrity
```

**Load Order:**

1. Constitution (frozen law)
2. Control layer (command authority)

**Fail-Fast Behavior:**

- Constitution load failure → throws
- Control load failure → throws
- Version mismatch → throws
- Immutability marker missing → throws
- Validation failure → throws
- Freeze assertion failure → throws
- Integrity check failure → throws

### 2. Control Loader

**Location:** `src/control/loader.ts`

Follows the exact pattern of `src/constitution/loader.ts`:

- Singleton pattern (load once, never reload)
- Frozen artifacts (Object.freeze recursively)
- Hash-based integrity verification
- Fail-closed on any error

**Validation:**

- Uses `src/validators/prompt-validator.ts`
- Validates each prompt against schema
- Fails if any prompt is invalid
- Fails if registry is not marked immutable
- Fails if version doesn't match expected '1.0.0'

**Immutability Guarantees:**

- All artifacts frozen with `Object.freeze()` recursively
- Freeze assertion verifies `!Object.isExtensible(artifacts)`
- Prevents future refactors from breaking immutability
- Version pin prevents accidental version drift

### 3. Accessor Functions

**Get all control artifacts:**

```typescript
import { getControl } from "./control";

const control = getControl();
// Returns frozen ControlArtifacts
```

**Get specific prompt by ID:**

```typescript
import { getPromptById } from "./control";

const prompt = getPromptById("bdm_v1");
// Returns frozen Prompt object
// Throws if not found
```

**Filter by protocol:**

```typescript
import { getPromptsByProtocol } from "./control";

const directionPrompts = getPromptsByProtocol("direction");
const commandPrompts = getPromptsByProtocol("command");
```

**Filter by tier:**

```typescript
import { getPromptsByTier } from "./control";

const freePrompts = getPromptsByTier("free");
const lowCostPrompts = getPromptsByTier("low-cost");
const battleTestedPrompts = getPromptsByTier("battle-tested");
```

## Files Created

### Core Implementation

- `src/control/loader.ts` - Control layer loader (mirrors constitution loader)
- `src/control/index.ts` - Module exports
- `src/startup/initialize.ts` - Platform initialization
- `src/startup/index.ts` - Startup module exports

### Integration

- `src/index.ts` - Updated to export control and startup modules

### Examples & Tests

- `examples/control-layer-usage.ts` - Usage examples
- `tests/integration/control-layer.test.ts` - Integration tests

## Usage Pattern

```typescript
// 1. Initialize platform (once, at startup)
import { initialize } from "./startup";
const result = initialize();

// 2. Access control data (anywhere in runtime)
import { getPromptById } from "./control";
const prompt = getPromptById("bdm_v1");

// 3. Use prompt in execution
// (Control data flows INTO execution, not reverse)
```

## Governance Constraints

### What Control Layer Does

- Loads immutable prompt registry
- Validates all prompts at startup
- Provides read-only access to prompts
- Enforces immutability via Object.freeze
- Verifies integrity via hash

### What Control Layer Does NOT Do

- Modify prompts at runtime
- Allow agent discovery of prompts
- Expose prompts to vector search
- Grant or deny execution (that's EAG's job)
- Interpret or override policies

## Testing

Run integration tests:

```bash
npm test tests/integration/control-layer.test.ts
```

Run usage example:

```bash
npx ts-node examples/control-layer-usage.ts
```

## Next Steps

The control layer is now available to:

- Runtime execution logic
- Prompt routing decisions
- Cost tier enforcement
- Protocol-based model selection

The control layer is NOT available to:

- Vector search
- Agent discovery
- Runtime modification
- Embedding generation
