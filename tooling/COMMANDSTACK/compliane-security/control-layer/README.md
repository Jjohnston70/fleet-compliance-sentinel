# Control Layer Usage Guide

This document is DERIVED from `ai/control/stream-policy.v1.0.0.json`, `ai/control/job-policy.v1.0.0.json`, and `ai/routing/policies/provider-fallback-policy.v1.0.0.json`.
JSON is authoritative.

## Quick Start (5 Minutes)

### For Developers

```typescript
// 1. Initialize the platform (do this ONCE at startup)
import { initialize } from "./startup";

const result = initialize();
// Platform is now ready - constitution and control layer loaded

// 2. Use control layer in your code
import { getPromptById, getPromptsByProtocol } from "./control";

// Get a specific prompt by ID
const prompt = getPromptById("bdm_v1");
console.log(prompt.system_prompt);

// Get all prompts for a protocol
const directionPrompts = getPromptsByProtocol("direction");
```

### For Administrators

```bash
# 1. Verify protection is active
git tag | grep control-layer  # Should show: control-layer-v1.0.0

# 2. Check CI is running
# Go to: https://github.com/TNDS-Command-Center/tnds-platform/actions
# Look for: "Control Layer Guard" workflow

# 3. Verify hash logging
npm start  # Check logs for: [STARTUP] Control hash: <hash>
```

---

## Developer Usage

### 1. Platform Initialization

**Always initialize before using any control layer features:**

```typescript
import { initialize } from "./startup";

// At application startup
try {
  const result = initialize();

  console.log("Platform ready!");
  console.log(`Control version: ${result.controlHash}`);
  console.log(`Timestamp: ${result.timestamp}`);
} catch (error) {
  console.error("Initialization failed:", error);
  process.exit(1); // Fail-closed: don't start if control can't load
}
```

**What this does:**

- Loads constitution from `docs/CONSTITUTION.md`
- Loads control layer from `ai/control/prompt-registry.v1.0.0.json`
- Validates immutability markers
- Verifies version pin (1.0.0)
- Computes SHA-256 hash
- Freezes all artifacts with `Object.freeze()`
- Logs control hash for audit trail

**Fail-fast behavior:**

- Missing files → throws error
- Invalid JSON → throws error
- Version mismatch → throws error
- Validation failure → throws error
- Fallback/default behavior is defined only in authoritative JSON policy files

### 2. Accessing Control Data

**Get all control artifacts:**

```typescript
import { getControl } from "./control";

const control = getControl();

// Access metadata
console.log(control.promptRegistry.meta.version); // "1.0.0"
console.log(control.promptRegistry.meta.status); // "immutable"

// Access all prompts
const allPrompts = control.promptRegistry.prompts;
console.log(`Total prompts: ${allPrompts.length}`);
```

**Get specific prompt by ID:**

```typescript
import { getPromptById } from "./control";

const prompt = getPromptById("bdm_v1");

console.log(prompt.id); // "bdm_v1"
console.log(prompt.role); // "Business Decision Maker"
console.log(prompt.tier); // "battle-tested"
console.log(prompt.protocol); // "direction"
console.log(prompt.system_prompt); // Full prompt text
```

**Filter prompts by protocol:**

```typescript
import { getPromptsByProtocol } from "./control";

// Get all direction prompts
const directionPrompts = getPromptsByProtocol("direction");

// Get all command prompts
const commandPrompts = getPromptsByProtocol("command");

// Use in routing logic
function selectPrompt(userIntent: string) {
  if (userIntent === "strategic") {
    return getPromptsByProtocol("direction")[0];
  } else {
    return getPromptsByProtocol("command")[0];
  }
}
```

**Filter prompts by tier (cost management):**

```typescript
import { getPromptsByTier } from "./control";

// Get free tier prompts
const freePrompts = getPromptsByTier("free");

// Get battle-tested prompts (highest quality)
const premiumPrompts = getPromptsByTier("battle-tested");

// Use in cost-aware routing
function selectPromptByCost(budget: string) {
  if (budget === "low") {
    return getPromptsByTier("free")[0];
  } else {
    return getPromptsByTier("battle-tested")[0];
  }
}
```

### 3. Verify Control Hash

**Get the current control hash:**

```typescript
import { getControlHash } from "./control";

const hash = getControlHash();
console.log(`Control hash: ${hash}`);

// Use in audit logging
function logAuditEvent(event: string) {
  console.log(`[AUDIT] ${event} | Control: ${getControlHash()}`);
}
```

### 4. Check if Control is Loaded

```typescript
import { isControlLoaded } from "./control";

if (!isControlLoaded()) {
  throw new Error("Control layer not initialized");
}

// Safe to use control functions
const prompt = getPromptById("bdm_v1");
```

### 5. Verify Control Integrity

```typescript
import { verifyControlIntegrity } from "./control";

const isValid = verifyControlIntegrity();

if (!isValid) {
  console.error("Control layer integrity check failed!");
  process.exit(1);
}
```

---

## Administrator Usage

### 1. Initial Setup (One-Time)

**Step 1: Create Git Tag**

```bash
# Using the automated script (recommended)
./scripts/tag-control-release.sh 1.0.0
git push origin control-layer-v1.0.0
```

**Step 2: Create GitHub Teams**

Go to: `https://github.com/orgs/TNDS-Command-Center/teams`

Create three teams:

- `platform-admins` (control layer approvers)
- `developers` (general development)
- `architects` (architecture decisions)

**Step 3: Enable Branch Protection**

Go to: `https://github.com/TNDS-Command-Center/tnds-platform/settings/branches`

Enable for `master` branch:

- ✅ Require pull request before merging
- ✅ Require review from Code Owners
- ✅ Require status checks: `verify-control-layer`

### 2. Verify Protection is Active

**Check all four layers:**

```bash
# Layer 1: Version Control
git tag | grep control-layer
# Expected: control-layer-v1.0.0

# Layer 2: CI Automation
# Visit: https://github.com/TNDS-Command-Center/tnds-platform/actions
# Look for: "Control Layer Guard" workflow

# Layer 3: Runtime Verification
npm start
# Look for logs:
# [STARTUP] Control hash: <sha256-hash>
# [STARTUP] Control version: 1.0.0

# Layer 4: Code Review
# Visit: https://github.com/TNDS-Command-Center/tnds-platform/blob/master/CODEOWNERS
# Verify: /ai/control/ @TNDS-Command-Center/platform-admins
```

### 3. Making Control Layer Changes

**Follow this 5-step workflow:**

**Step 1: Create new version file**

```bash
# Copy current version to new version
cp ai/control/prompt-registry.v1.0.0.json ai/control/prompt-registry.v1.1.0.json
```

**Step 2: Edit the new version**

```json
{
  "meta": {
    "version": "1.1.0", // ← Update version
    "frozen_at": "2026-02-07T12:00:00.000Z", // ← Update timestamp
    "last_updated": "2026-02-07T12:00:00.000Z" // ← Update timestamp
  },
  "prompts": [
    // Make your changes here
  ]
}
```

**Step 3: Update loader**

Edit `src/control/loader.ts`:

```typescript
// Line 74: Update path
const PROMPT_REGISTRY_PATH = resolve(
  __dirname,
  "../../ai/control/prompt-registry.v1.1.0.json",
);

// Line 138: Update version check
if (registryData.meta?.version !== "1.1.0") {
  return Object.freeze({
    loaded: false as const,
    error: `Unsupported control registry version: expected 1.1.0, got ${registryData.meta?.version}`,
  });
}
```

**Step 4: Update startup logging**

Edit `src/startup/initialize.ts`:

```typescript
// Line 78: Update version in log
console.log(`[STARTUP] Control version: 1.1.0`);
```

**Step 5: Commit, tag, and push**

```bash
git add .
git commit -m "Control layer v1.1.0: <description of changes>"

# Tag the release
./scripts/tag-control-release.sh 1.1.0
git push origin master
git push origin control-layer-v1.1.0
```

**What happens next:**

1. CI workflow runs automatically
2. Validates version bump occurred
3. Checks immutability markers
4. Requires approval from platform-admins
5. Merges only if all checks pass

### 4. Monitoring and Auditing

**View control hash in logs:**

```bash
# Start the application
npm start

# Look for startup logs
# [STARTUP] Control hash: a1b2c3d4e5f6...
# [STARTUP] Control version: 1.0.0
# [STARTUP] Timestamp: 2026-02-07T12:00:00.000Z
```

**Audit control layer changes:**

```bash
# View all control layer versions
git tag | grep control-layer

# View specific version details
git show control-layer-v1.0.0

# View change history
git log --oneline ai/control/
```

**Check CI workflow status:**

```bash
# View recent workflow runs
gh run list --workflow=control-layer-guard.yml

# View specific run details
gh run view <run-id>
```

---

## Testing & Verification

### Test Layer 1: Version Control

**Verify git tag exists:**

```bash
git tag | grep control-layer-v1.0.0
# Should output: control-layer-v1.0.0

git show control-layer-v1.0.0
# Should show tag details and commit
```

### Test Layer 2: CI Automation

**Test 1: Modify control without version bump (should FAIL)**

```bash
# Create test branch
git checkout -b test-ci-guard

# Modify existing version (WRONG - should fail)
echo "test" >> ai/control/prompt-registry.v1.0.0.json

# Commit and push
git add .
git commit -m "Test: modify control without version bump"
git push origin test-ci-guard

# Create PR - CI should FAIL with error:
# "❌ ERROR: Control layer files changed but no version bump detected"
```

**Test 2: Proper version bump (should PASS)**

```bash
# Create new version
cp ai/control/prompt-registry.v1.0.0.json ai/control/prompt-registry.v1.1.0.json

# Update version in file
# Update loader to use v1.1.0

# Commit and push
git add .
git commit -m "Control layer v1.1.0"
git push origin test-ci-guard

# Create PR - CI should PASS
```

### Test Layer 3: Runtime Verification

**Test hash logging:**

```bash
# Start application
npm start

# Verify logs contain:
# [STARTUP] Control hash: <64-character-hex-string>
# [STARTUP] Control version: 1.0.0
```

**Test hash verification in code:**

```typescript
import { getControlHash, verifyControlIntegrity } from "./control";

// Get hash
const hash = getControlHash();
console.log(`Hash: ${hash}`); // Should be 64-char hex string

// Verify integrity
const isValid = verifyControlIntegrity();
console.log(`Valid: ${isValid}`); // Should be true
```

### Test Layer 4: Code Review

**Test CODEOWNERS enforcement:**

```bash
# 1. Create PR that modifies ai/control/
# 2. Verify PR shows: "Review required from @TNDS-Command-Center/platform-admins"
# 3. Try to merge without approval - should be BLOCKED
# 4. Get approval from platform-admin - should be ALLOWED
```

---

## Common Scenarios

### Scenario 1: Application Startup

```typescript
// main.ts
import { initialize } from "./startup";
import { getControlHash } from "./control";

async function main() {
  try {
    // Initialize platform
    const result = initialize();

    console.log("✓ Platform initialized");
    console.log(`  Control hash: ${result.controlHash}`);
    console.log(`  Timestamp: ${result.timestamp}`);

    // Your application logic here
    await runApplication();
  } catch (error) {
    console.error("✗ Initialization failed:", error);
    process.exit(1);
  }
}

main();
```

### Scenario 2: Prompt Selection for AI Agent

```typescript
import { getPromptById, getPromptsByProtocol } from "./control";

function selectPromptForAgent(userRequest: string) {
  // Option 1: Select by ID (if you know which prompt to use)
  if (userRequest.includes("business decision")) {
    return getPromptById("bdm_v1");
  }

  // Option 2: Select by protocol
  const directionPrompts = getPromptsByProtocol("direction");
  return directionPrompts[0]; // Use first direction prompt
}

// Use the prompt
const prompt = selectPromptForAgent("Help me make a business decision");
console.log(prompt.system_prompt); // Send to LLM
```

### Scenario 3: Cost-Aware Routing

```typescript
import { getPromptsByTier } from "./control";

function selectPromptByCost(userTier: "free" | "premium") {
  if (userTier === "free") {
    // Use free tier prompts
    const freePrompts = getPromptsByTier("free");
    return freePrompts[0];
  } else {
    // Use battle-tested prompts for premium users
    const premiumPrompts = getPromptsByTier("battle-tested");
    return premiumPrompts[0];
  }
}
```

### Scenario 4: Audit Logging

```typescript
import { getControlHash } from "./control";

function logAuditEvent(event: string, userId: string) {
  const timestamp = new Date().toISOString();
  const controlHash = getControlHash();

  console.log(
    JSON.stringify({
      timestamp,
      event,
      userId,
      controlHash, // Include control hash in every audit log
    }),
  );
}

// Usage
logAuditEvent("prompt_selected", "user123");
// Output: {"timestamp":"...","event":"prompt_selected","userId":"user123","controlHash":"a1b2c3..."}
```

---

## Troubleshooting

### Error: "Control layer not loaded"

**Cause:** Trying to use control functions before calling `initialize()`

**Solution:**

```typescript
import { initialize } from "./startup";

// Call this FIRST
initialize();

// Now safe to use control functions
import { getPromptById } from "./control";
const prompt = getPromptById("bdm_v1");
```

### Error: "Unsupported control registry version"

**Cause:** Version in JSON doesn't match expected version in loader

**Solution:**

1. Check `ai/control/prompt-registry.vX.Y.Z.json` → `meta.version`
2. Check `src/control/loader.ts` → version check on line ~138
3. Ensure they match

### Error: "Prompt not found"

**Cause:** Requesting a prompt ID that doesn't exist

**Solution:**

```typescript
import { getControl } from "./control";

// List all available prompt IDs
const control = getControl();
const allIds = control.promptRegistry.prompts.map((p) => p.id);
console.log("Available prompts:", allIds);

// Use a valid ID
const prompt = getPromptById(allIds[0]);
```

### CI Workflow Fails: "No version bump detected"

**Cause:** Modified control layer without creating new version file

**Solution:**

1. Don't modify existing version files
2. Create new version: `cp ai/control/prompt-registry.v1.0.0.json ai/control/prompt-registry.v1.1.0.json`
3. Update version in new file
4. Update loader to use new version

### PR Blocked: "Review required"

**Cause:** CODEOWNERS requires approval from platform-admins

**Solution:**

1. Request review from a member of `@TNDS-Command-Center/platform-admins`
2. Wait for approval
3. Merge after approval

---

## Best Practices

### For Developers

1. **Always initialize first**

   ```typescript
   initialize(); // Do this before using any control functions
   ```

2. **Use typed imports**

   ```typescript
   import { getPromptById, type Prompt } from "./control";
   ```

3. **Handle errors**

   ```typescript
   try {
     const prompt = getPromptById("bdm_v1");
   } catch (error) {
     console.error("Prompt not found:", error);
   }
   ```

4. **Include control hash in logs**
   ```typescript
   console.log(`[AUDIT] Event | Control: ${getControlHash()}`);
   ```

### For Administrators

1. **Never modify existing versions**
   - Always create new version files
   - Never edit `prompt-registry.v1.0.0.json` directly

2. **Always update all three locations**
   - New JSON file in `ai/control/`
   - Loader path in `src/control/loader.ts`
   - Version in `src/startup/initialize.ts`

3. **Always tag releases**

   ```bash
   ./scripts/tag-control-release.sh <version>
   git push origin control-layer-v<version>
   ```

4. **Monitor CI workflows**
   - Check GitHub Actions after every PR
   - Investigate failures immediately

5. **Review control hash in production**
   - Check logs after deployment
   - Verify hash matches expected value

---

## Quick Reference

### Key Functions

| Function                         | Purpose                     | Returns                |
| -------------------------------- | --------------------------- | ---------------------- |
| `initialize()`                   | Load constitution + control | `InitializationResult` |
| `getControl()`                   | Get all control artifacts   | `ControlArtifacts`     |
| `getPromptById(id)`              | Get specific prompt         | `Prompt`               |
| `getPromptsByProtocol(protocol)` | Filter by protocol          | `Prompt[]`             |
| `getPromptsByTier(tier)`         | Filter by tier              | `Prompt[]`             |
| `getControlHash()`               | Get SHA-256 hash            | `string`               |
| `isControlLoaded()`              | Check if loaded             | `boolean`              |
| `verifyControlIntegrity()`       | Verify integrity            | `boolean`              |

### Key Files

| File                                        | Purpose                        |
| ------------------------------------------- | ------------------------------ |
| `ai/control/prompt-registry.v1.0.0.json`    | Control layer data (immutable) |
| `src/control/loader.ts`                     | Control layer loader           |
| `src/startup/initialize.ts`                 | Platform initialization        |
| `.github/workflows/control-layer-guard.yml` | CI validation                  |
| `CODEOWNERS`                                | Code review enforcement        |
| `scripts/tag-control-release.sh`            | Tagging automation             |

### Key Commands

```bash
# Initialize
npm start

# Tag release
./scripts/tag-control-release.sh 1.0.0

# View tags
git tag | grep control-layer

# View CI status
gh run list --workflow=control-layer-guard.yml

# Run tests
npm test
```

---

## Next Steps

1. **New to the platform?** Start with [README.md](README.md)
2. **Need architecture details?** See [docs/control-layer-architecture.md](docs/control-layer-architecture.md)
3. **Making changes?** Follow [docs/control-layer-quickstart.md](docs/control-layer-quickstart.md)
4. **Need code examples?** Check [examples/control-layer-usage.ts](examples/control-layer-usage.ts)
5. **Setting up protection?** See [MANUAL_STEPS_REQUIRED.md](MANUAL_STEPS_REQUIRED.md)
