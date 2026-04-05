# Control Layer Hardening

## Overview

This document describes the hardening steps applied to the control layer to protect it from casual edits and ensure auditability.

These steps transform the control layer from "production-ready" to "battle-hardened."

---

## Hardening Steps Implemented

### 1. Release Tagging

**Purpose**: Mark immutable versions for audit and rollback

**Implementation**:
```bash
git tag -a control-layer-v1.0.0 -m "Control Layer v1.0.0 - Immutable command authority"
git push origin control-layer-v1.0.0
```

**Benefits**:
- Clear version history
- Easy rollback to known-good state
- Audit trail of control layer changes
- Semantic versioning for control layer

**Convention**:
- Tag format: `control-layer-vX.Y.Z`
- Major version (X): Breaking changes to control structure
- Minor version (Y): New prompts or non-breaking changes
- Patch version (Z): Bug fixes or clarifications

---

### 2. CI Guard

**Purpose**: Prevent control layer changes without version bump

**Implementation**: `.github/workflows/control-layer-guard.yml`

**What it does**:
1. Detects changes to `ai/control/*`
2. Verifies a new versioned file was created
3. Validates version in filename matches version in meta
4. Confirms immutability markers are present
5. Checks that loader.ts was updated
6. Fails build if any check fails

**Benefits**:
- Prevents accidental control layer modifications
- Enforces version bump discipline
- Ensures immutability markers are set
- Provides clear error messages for violations

**Bypass**: Not possible - this is intentional

---

### 3. Control Hash Logging

**Purpose**: Log control hash at startup for trivial audits

**Implementation**: 
- Added `getControlHash()` to `src/control/loader.ts`
- Updated `src/startup/initialize.ts` to log hash at startup
- Hash included in `InitializationResult`

**Output**:
```
[STARTUP] Control layer loaded successfully
[STARTUP] Control hash: a1b2c3d4e5f6...
[STARTUP] Control version: 1.0.0
[STARTUP] Timestamp: 2026-02-07T12:34:56.789Z
```

**Benefits**:
- Instant verification of control layer integrity
- Audit trail in application logs
- Detect unauthorized modifications immediately
- No need to manually compute hashes

**Usage**:
```typescript
import { initialize } from './startup';

const result = initialize();
console.log(`Control hash: ${result.controlHash}`);
```

---

### 4. CODEOWNERS

**Purpose**: Protect control layer from casual edits via GitHub

**Implementation**: `CODEOWNERS` file at repository root

**Protected Paths**:
- `/ai/control/` - Control layer artifacts
- `/src/control/` - Control layer loader
- `/src/startup/` - Platform initialization
- `/docs/CONSTITUTION.md` - Constitution
- `/src/constitution/` - Constitution loader
- `/src/validators/` - Validation contracts
- `/tests/conformance/` - Conformance tests

**Required Teams**:
- `@TNDS-Command-Center/platform-admins` - Control layer, constitution, security
- `@TNDS-Command-Center/developers` - General development
- `@TNDS-Command-Center/architects` - Architecture decisions

**Benefits**:
- Requires explicit approval for control layer changes
- Prevents accidental merges
- Enforces review discipline
- Clear ownership boundaries

**Setup**:
1. Create teams in GitHub organization settings
2. Add members to appropriate teams
3. Enable "Require review from Code Owners" in branch protection rules

---

## Architecture Impact

These hardening steps do NOT change the architecture. They protect what's already built.

**No changes to**:
- Control layer structure
- Loader implementation
- Validation logic
- Runtime behavior

**Only additions**:
- CI guard workflow
- Hash logging
- CODEOWNERS file
- Release tags

---

## Workflow for Control Layer Changes

### Step 1: Create New Version

```bash
# Copy current version to new version
cp ai/control/prompt-registry.v1.0.0.json ai/control/prompt-registry.v1.1.0.json

# Edit new version
# - Update meta.version to "1.1.0"
# - Update meta.last_updated
# - Make your changes
# - Set meta.status to "immutable"
# - Set meta.frozen_at to current timestamp
```

### Step 2: Update Loader

```typescript
// src/control/loader.ts

// Update path
const PROMPT_REGISTRY_PATH = resolve(__dirname, '../../ai/control/prompt-registry.v1.1.0.json');

// Update version check
if (registryData.meta?.version !== '1.1.0') {
  return Object.freeze({
    loaded: false as const,
    error: `Unsupported control registry version: expected 1.1.0, got ${registryData.meta?.version}`,
  });
}
```

### Step 3: Update Logging

```typescript
// src/startup/initialize.ts

console.log(`[STARTUP] Control version: 1.1.0`);
```

### Step 4: Commit and Tag

```bash
git add ai/control/prompt-registry.v1.1.0.json
git add src/control/loader.ts
git add src/startup/initialize.ts
git commit -m "Control layer v1.1.0: [description of changes]"
git tag -a control-layer-v1.1.0 -m "Control Layer v1.1.0 - [description]"
git push origin master
git push origin control-layer-v1.1.0
```

### Step 5: CI Verification

The CI guard will automatically:
- Detect control layer changes
- Verify version bump
- Validate immutability markers
- Confirm loader update
- Pass or fail the build

---

## Audit Procedures

### Verify Control Layer Integrity

```bash
# Check current version
git tag | grep control-layer

# View tag details
git show control-layer-v1.0.0

# Check hash in logs
grep "Control hash" application.log
```

### Investigate Unauthorized Changes

```bash
# Check control layer history
git log --follow ai/control/prompt-registry.v1.0.0.json

# Compare versions
git diff control-layer-v1.0.0 control-layer-v1.1.0 -- ai/control/

# Verify hash
node -e "
const crypto = require('crypto');
const fs = require('fs');
const content = fs.readFileSync('ai/control/prompt-registry.v1.0.0.json', 'utf8');
console.log(crypto.createHash('sha256').update(content, 'utf8').digest('hex'));
"
```

---

## Summary

| Hardening Step | Purpose | Impact |
|----------------|---------|--------|
| Release Tagging | Version history | Audit trail |
| CI Guard | Prevent casual edits | Build fails on violation |
| Hash Logging | Instant verification | Trivial audits |
| CODEOWNERS | Require approval | Enforced review |

All steps are **non-breaking** and **additive only**.

The control layer architecture remains unchanged.

Protection is now **automated** and **enforced**.

