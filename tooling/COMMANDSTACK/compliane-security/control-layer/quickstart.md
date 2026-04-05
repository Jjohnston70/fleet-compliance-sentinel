# Control Layer Quick Start

## For Platform Administrators

This guide shows you how to use the control layer hardening features.

---

## Initial Setup (One-Time)

### 1. Tag the Current Release

**Bash/Linux/Mac**:
```bash
./scripts/tag-control-release.sh 1.0.0
git push origin control-layer-v1.0.0
```

**PowerShell/Windows**:
```powershell
.\scripts\tag-control-release.ps1 -Version "1.0.0"
git push origin control-layer-v1.0.0
```

### 2. Create GitHub Teams

Go to your GitHub organization settings and create:

- `@TNDS-Command-Center/platform-admins`
- `@TNDS-Command-Center/developers`
- `@TNDS-Command-Center/architects`

Add appropriate members to each team.

### 3. Enable Branch Protection

1. Go to repository settings → Branches
2. Add rule for `master` (or `main`)
3. Enable "Require review from Code Owners"
4. Enable "Require status checks to pass"
5. Add `verify-control-layer` to required checks

---

## Making Control Layer Changes

### Step 1: Create New Version File

```bash
# Copy current version to new version
cp ai/control/prompt-registry.v1.0.0.json ai/control/prompt-registry.v1.1.0.json
```

### Step 2: Edit New Version

Open `ai/control/prompt-registry.v1.1.0.json` and update:

```json
{
  "meta": {
    "name": "TNDS Prompt Registry",
    "version": "1.1.0",              // ← Update version
    "status": "immutable",
    "frozen_at": "2026-02-07T12:34:56.789Z",  // ← Update timestamp
    "last_updated": "2026-02-07T12:34:56.789Z",  // ← Update timestamp
    ...
  },
  "prompts": [
    // Make your changes here
  ]
}
```

### Step 3: Update Loader

Edit `src/control/loader.ts`:

```typescript
// Line 74: Update path
const PROMPT_REGISTRY_PATH = resolve(__dirname, '../../ai/control/prompt-registry.v1.1.0.json');

// Line 138: Update version check
if (registryData.meta?.version !== '1.1.0') {
  return Object.freeze({
    loaded: false as const,
    error: `Unsupported control registry version: expected 1.1.0, got ${registryData.meta?.version}`,
  });
}
```

### Step 4: Update Startup Logging

Edit `src/startup/initialize.ts`:

```typescript
// Line 78: Update version in log
console.log(`[STARTUP] Control version: 1.1.0`);
```

### Step 5: Commit and Tag

```bash
git add ai/control/prompt-registry.v1.1.0.json
git add src/control/loader.ts
git add src/startup/initialize.ts
git commit -m "Control layer v1.1.0: Add new prompts for X feature"

# Tag the release
./scripts/tag-control-release.sh 1.1.0

# Push
git push origin master
git push origin control-layer-v1.1.0
```

### Step 6: Verify CI Passed

The CI guard will automatically:
- ✅ Detect control layer changes
- ✅ Verify version bump
- ✅ Validate immutability markers
- ✅ Confirm loader update

If CI fails, fix the issues and push again.

---

## Verifying Control Layer Integrity

### Check Current Version

```bash
# List all control layer tags
git tag | grep control-layer

# View specific tag
git show control-layer-v1.0.0
```

### Check Hash in Logs

When the application starts, it logs:

```
[STARTUP] Control layer loaded successfully
[STARTUP] Control hash: a1b2c3d4e5f6789abcdef...
[STARTUP] Control version: 1.0.0
[STARTUP] Timestamp: 2026-02-07T12:34:56.789Z
```

### Manually Compute Hash

**Node.js**:
```javascript
const crypto = require('crypto');
const fs = require('fs');

const content = fs.readFileSync('ai/control/prompt-registry.v1.0.0.json', 'utf8');
const hash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');
console.log(hash);
```

**Bash**:
```bash
sha256sum ai/control/prompt-registry.v1.0.0.json
```

**PowerShell**:
```powershell
Get-FileHash ai/control/prompt-registry.v1.0.0.json -Algorithm SHA256
```

---

## Common Tasks

### View Control Layer History

```bash
git log --follow ai/control/prompt-registry.v1.0.0.json
```

### Compare Versions

```bash
git diff control-layer-v1.0.0 control-layer-v1.1.0 -- ai/control/
```

### Rollback to Previous Version

```bash
# Checkout previous version
git checkout control-layer-v1.0.0

# Update loader.ts and initialize.ts to match
# Commit and tag as new version (e.g., v1.2.0)
```

---

## Troubleshooting

### CI Guard Fails: "No version bump detected"

**Problem**: You modified control layer files without creating a new version.

**Solution**: Create a new versioned file (see "Making Control Layer Changes" above).

### CI Guard Fails: "Version mismatch"

**Problem**: Version in filename doesn't match version in `meta.version`.

**Solution**: Update `meta.version` in the JSON file to match the filename.

### CI Guard Fails: "Not marked as immutable"

**Problem**: `meta.status` is not "immutable" or `meta.frozen_at` is missing.

**Solution**: Set both fields in the JSON file:
```json
{
  "meta": {
    "status": "immutable",
    "frozen_at": "2026-02-07T12:34:56.789Z"
  }
}
```

### CODEOWNERS Blocking PR

**Problem**: PR requires approval from `@TNDS-Command-Center/platform-admins`.

**Solution**: This is intentional. Request review from a platform admin.

---

## Best Practices

1. **Always use the tagging script** - It validates everything before creating the tag
2. **Never modify existing version files** - Always create a new version
3. **Document changes in commit messages** - Explain what changed and why
4. **Test locally first** - Run the loader and verify it works before pushing
5. **Keep versions sequential** - Don't skip versions (1.0.0 → 1.1.0 → 1.2.0)

---

## Related Documentation

- [control-layer-hardening.md](control-layer-hardening.md) - Detailed hardening guide
- [control-layer-integration.md](control-layer-integration.md) - Integration guide
- [control-layer-architecture.md](control-layer-architecture.md) - Architecture diagrams
- [../CONTROL_HARDENING_SUMMARY.md](../CONTROL_HARDENING_SUMMARY.md) - Implementation summary
- [../scripts/README.md](../scripts/README.md) - Script documentation

