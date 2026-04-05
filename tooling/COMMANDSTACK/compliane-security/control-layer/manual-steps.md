# Manual Steps Required

## Overview

The control layer hardening implementation is complete. However, three manual steps are required to fully activate the protection.

---

## Step 1: Create Git Tag

### Why?
Tags provide version history and audit trail for the control layer.

### How?

**Option A: Using the script (recommended)**

Bash/Linux/Mac:
```bash
./scripts/tag-control-release.sh 1.0.0
```

PowerShell/Windows:
```powershell
.\scripts\tag-control-release.ps1 -Version "1.0.0"
```

**Option B: Manual git command**

```bash
git tag -a control-layer-v1.0.0 -m "Control Layer v1.0.0 - Immutable command authority

This release marks the first frozen version of the control layer.

Key artifacts:
- ai/control/prompt-registry.v1.0.0.json (immutable)
- src/control/loader.ts (version-pinned to 1.0.0)
- src/startup/initialize.ts (fail-closed initialization)

Governance:
- All prompts validated at load time
- SHA-256 hash computed for integrity
- Object.freeze() enforced recursively
- No modification, search, or discovery by agents

This tag represents the baseline for all future control layer changes.
Any changes to ai/control/* require a version bump and new tag."
```

### Push the tag

```bash
git push origin control-layer-v1.0.0
```

### Verify

```bash
git tag | grep control-layer
git show control-layer-v1.0.0
```

---

## Step 2: Create GitHub Teams

### Why?
CODEOWNERS requires these teams to enforce code review requirements.

### How?

1. Go to your GitHub organization: `https://github.com/orgs/TNDS-Command-Center/teams`

2. Create three teams:

   **Team 1: platform-admins**
   - Name: `platform-admins`
   - Description: "Platform administrators with control layer authority"
   - Privacy: Visible
   - Add members who should approve control layer changes

   **Team 2: developers**
   - Name: `developers`
   - Description: "General development team"
   - Privacy: Visible
   - Add all developers

   **Team 3: architects**
   - Name: `architects`
   - Description: "Architecture decision makers"
   - Privacy: Visible
   - Add architecture team members

3. Verify teams exist:
   - `@TNDS-Command-Center/platform-admins`
   - `@TNDS-Command-Center/developers`
   - `@TNDS-Command-Center/architects`

---

## Step 3: Enable Branch Protection

### Why?
Enforces CODEOWNERS and CI checks before merging.

### How?

1. Go to repository settings:
   `https://github.com/TNDS-Command-Center/tnds-platform/settings/branches`

2. Click "Add rule" or edit existing rule for `master` (or `main`)

3. Configure the following settings:

   **Branch name pattern**: `master` (or `main`)

   **Protect matching branches**:
   - ✅ Require a pull request before merging
     - ✅ Require approvals: 1
     - ✅ Require review from Code Owners
   
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - Add required check: `verify-control-layer`
   
   - ✅ Do not allow bypassing the above settings

4. Save changes

### Verify

1. Create a test branch
2. Modify `ai/control/prompt-registry.v1.0.0.json`
3. Create PR
4. Verify:
   - CI check `verify-control-layer` runs
   - Review from `@TNDS-Command-Center/platform-admins` required
   - Cannot merge without approval

---

## Verification Checklist

After completing all steps, verify:

- [ ] Git tag `control-layer-v1.0.0` exists
- [ ] Tag is pushed to remote
- [ ] GitHub teams created:
  - [ ] `@TNDS-Command-Center/platform-admins`
  - [ ] `@TNDS-Command-Center/developers`
  - [ ] `@TNDS-Command-Center/architects`
- [ ] Branch protection enabled on `master`/`main`
- [ ] "Require review from Code Owners" enabled
- [ ] Required status check `verify-control-layer` added
- [ ] Test PR shows required review and CI check

---

## What Happens After Setup

### When someone tries to modify control layer:

1. **CI Guard activates**:
   - Detects changes to `ai/control/*`
   - Validates version bump
   - Checks immutability markers
   - Fails build if violations found

2. **CODEOWNERS enforces review**:
   - PR requires approval from `@TNDS-Command-Center/platform-admins`
   - Cannot merge without approval
   - Clear ownership boundaries

3. **Hash logging at startup**:
   - Application logs control hash
   - Instant integrity verification
   - Audit trail in logs

4. **Version tags provide history**:
   - Clear version progression
   - Easy rollback capability
   - Audit trail of changes

---

## Troubleshooting

### "Permission denied" when creating tag

**Problem**: No write access to repository

**Solution**: Ensure you have write permissions or ask repository admin

### "Team not found" error in CODEOWNERS

**Problem**: Teams don't exist yet

**Solution**: Complete Step 2 (Create GitHub Teams)

### CI check not running

**Problem**: Workflow file not in `.github/workflows/`

**Solution**: Verify `.github/workflows/control-layer-guard.yml` exists and is committed

### Branch protection not enforcing

**Problem**: Settings not saved or incorrect branch name

**Solution**: 
- Verify branch name matches (master vs main)
- Check "Do not allow bypassing" is enabled
- Ensure you're not an admin (admins can bypass by default)

---

## Next Steps After Setup

1. **Test the protection**:
   - Try modifying control layer without version bump
   - Verify CI fails
   - Verify review required

2. **Document team membership**:
   - Keep track of who's in each team
   - Review membership quarterly

3. **Monitor control layer changes**:
   - Review all control layer PRs carefully
   - Check hash in logs after deployments
   - Audit tags quarterly

4. **Follow the workflow**:
   - Use `docs/control-layer-quickstart.md` for changes
   - Always create new versions
   - Never modify existing versions

---

## Support

If you encounter issues:

1. Check documentation:
   - [docs/control-layer-hardening.md](docs/control-layer-hardening.md)
   - [docs/control-layer-quickstart.md](docs/control-layer-quickstart.md)
   - [CONTROL_HARDENING_SUMMARY.md](CONTROL_HARDENING_SUMMARY.md)

2. Review CI logs:
   - Check GitHub Actions for error details
   - CI provides clear error messages

3. Verify setup:
   - Teams exist
   - Branch protection enabled
   - Workflow file committed

---

## Summary

Three manual steps required:
1. ✅ Create and push git tag
2. ✅ Create GitHub teams
3. ✅ Enable branch protection

Once complete, the control layer is fully battle-hardened.

