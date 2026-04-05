# SOC 2 Evidence Index

## Purpose

This index provides direct mappings from SOC 2 controls to exact evidence artifacts for auditor walkthroughs.

**Audience**: SOC 2 Type II Auditors  
**Use Case**: Evidence collection and control testing  
**Baseline Version**: `compliance-baseline-v1.0.0`

---

## Evidence Collection Quick Reference

| Control ID | SOC 2 Criteria | Evidence Type | Artifact Location | Verification Method |
|------------|----------------|---------------|-------------------|---------------------|
| TNDS-AC-001 | CC6.1 | Code | `ai/control/prompt-registry.v1.0.0.json` | Inspect immutability markers |
| TNDS-AC-001 | CC6.1 | Code | `src/control/loader.ts` (line 138) | Verify version pin check |
| TNDS-AC-001 | CC6.1 | Code | `src/control/loader.ts` (freeze assertion) | Verify `!Object.isExtensible()` |
| TNDS-AC-002 | CC6.2 | Config | `CODEOWNERS` | Review protected paths |
| TNDS-AC-002 | CC6.2 | Config | GitHub branch protection settings | Verify "Require review from Code Owners" |
| TNDS-AC-002 | CC6.2 | Logs | GitHub PR approval history | Sample PRs for required approvals |
| TNDS-AC-003 | CC6.6 | Version Control | Git tags: `git tag \| grep control-layer` | List version history |
| TNDS-AC-003 | CC6.6 | Version Control | Git log: `git log ai/control/` | Trace version progression |
| TNDS-OP-001 | CC7.2 | Code | `src/control/loader.ts` (lines 294-321) | Review `getControlHash()` function |
| TNDS-OP-001 | CC7.2 | Logs | Application startup logs | Verify hash logging format |
| TNDS-CM-001 | CC7.3 | CI/CD | `.github/workflows/control-layer-guard.yml` | Review CI validation steps |
| TNDS-CM-001 | CC7.3 | Logs | GitHub Actions execution logs | Sample CI runs (pass and fail) |
| TNDS-CM-002 | CC7.4 | Multi-artifact | All four layers (Git, CI, Runtime, Review) | Test each layer independently |
| TNDS-OP-002 | CC7.5 | Logs | Application logs | Verify startup logging completeness |

---

## Control-by-Control Evidence Guide

### TNDS-AC-001: Immutable Control Layer (CC6.1)

**Control Assertion**: Control layer cannot be modified at runtime

**Evidence Artifacts**:

1. **Immutability Markers** (File: `ai/control/prompt-registry.v1.0.0.json`)
   - Location: Lines 2-4 (metadata section)
   - What to verify: `"status": "immutable"` and `"frozen_at": "<timestamp>"`
   - Command: `cat ai/control/prompt-registry.v1.0.0.json | head -10`

2. **Version Pin Enforcement** (File: `src/control/loader.ts`)
   - Location: Line 138
   - What to verify: `if (registryData.meta?.version !== '1.0.0') { throw }`
   - Command: `grep -n "meta?.version" src/control/loader.ts`

3. **Freeze Enforcement** (File: `src/control/loader.ts`)
   - Location: Search for `Object.freeze`
   - What to verify: Recursive freeze applied to all control artifacts
   - Command: `grep -n "Object.freeze" src/control/loader.ts`

4. **Freeze Assertion** (File: `src/control/loader.ts`)
   - Location: Search for `isExtensible`
   - What to verify: `!Object.isExtensible(artifacts)` check exists
   - Command: `grep -n "isExtensible" src/control/loader.ts`

**Test Procedure**:
1. Attempt to modify frozen object at runtime → Should throw TypeError
2. Attempt to load wrong version → Should throw version mismatch error
3. Verify no fallback or default behavior exists

---

### TNDS-AC-002: Code Review Enforcement (CC6.2)

**Control Assertion**: Control layer changes require platform-admin approval

**Evidence Artifacts**:

1. **CODEOWNERS File** (File: `CODEOWNERS`)
   - Location: Lines 14, 18, 22, 26, 29
   - What to verify: Protected paths require `@TNDS-Command-Center/platform-admins`
   - Command: `grep "platform-admins" CODEOWNERS`

2. **Branch Protection Settings** (GitHub UI)
   - Location: Repository Settings → Branches → Branch protection rules
   - What to verify: "Require review from Code Owners" enabled
   - Access: https://github.com/TNDS-Command-Center/tnds-platform/settings/branches

3. **Pull Request History** (GitHub)
   - Location: Pull requests affecting `ai/control/` or `src/control/`
   - What to verify: All PRs have required approvals from platform-admins
   - Command: Review PR list filtered by path

**Test Procedure**:
1. Create test PR modifying `ai/control/` without approval → Should block merge
2. Review sample of historical PRs → All should have required approvals
3. Verify no bypass mechanisms exist (no admin override without approval)

---

### TNDS-AC-003: Version-Based Access Revocation (CC6.6)

**Control Assertion**: Access policies cannot be retroactively modified

**Evidence Artifacts**:

1. **Git Tags** (Version Control)
   - Location: Git repository tags
   - What to verify: Immutable version tags exist (e.g., `control-layer-v1.0.0`)
   - Command: `git tag | grep control-layer`

2. **Version File Immutability** (File System)
   - Location: `ai/control/prompt-registry.v1.0.0.json`
   - What to verify: File cannot be modified after freeze (enforced by version pin)
   - Command: `git log --follow ai/control/prompt-registry.v1.0.0.json`

3. **Version Progression** (Git History)
   - Location: Git commit history
   - What to verify: Each change creates new version file, old versions unchanged
   - Command: `git log --oneline ai/control/`

**Test Procedure**:
1. Verify git tags are immutable (cannot be moved without force)
2. Trace version history → Should show progression, not modification
3. Confirm old versions remain accessible for audit

---

### TNDS-OP-001: Runtime Integrity Verification (CC7.2)

**Control Assertion**: Control layer integrity verified cryptographically at startup

**Evidence Artifacts**:

1. **Hash Computation Function** (File: `src/control/loader.ts`)
   - Location: Lines 294-321
   - What to verify: SHA-256 hash computation of control layer content
   - Command: `sed -n '294,321p' src/control/loader.ts`

2. **Startup Hash Logging** (File: `src/startup/initialize.ts`)
   - Location: Lines 66-92
   - What to verify: Hash logged at every startup with timestamp
   - Command: `sed -n '66,92p' src/startup/initialize.ts`

3. **Application Logs** (Runtime Logs)
   - Location: Application log files
   - What to verify: `[STARTUP] Control hash: <64-char-hex>` entries
   - Command: `grep "Control hash" application.log`

**Test Procedure**:
1. Review hash computation algorithm → Verify SHA-256
2. Sample startup logs → Verify hash format (64 hex characters)
3. Correlate hash changes with version changes → Should match

---

### TNDS-CM-001: CI-Enforced Version Bump (CC7.3)

**Control Assertion**: Control layer changes require CI validation to pass

**Evidence Artifacts**:

1. **CI Workflow File** (File: `.github/workflows/control-layer-guard.yml`)
   - Location: Entire file
   - What to verify: Validation steps for version bump, immutability markers, loader updates
   - Command: `cat .github/workflows/control-layer-guard.yml`

2. **CI Execution Logs** (GitHub Actions)
   - Location: Actions tab → Control Layer Guard workflow runs
   - What to verify: Validation steps execute, failures block merge
   - Access: https://github.com/TNDS-Command-Center/tnds-platform/actions

3. **Failed Build Examples** (GitHub Actions)
   - Location: Failed workflow runs
   - What to verify: CI fails when version bump missing
   - Access: Filter Actions by "failure" status

**Test Procedure**:
1. Review CI workflow → Verify validation logic
2. Sample successful runs → Verify all checks passed
3. Sample failed runs → Verify appropriate error messages

---

### TNDS-CM-002: Multi-Layer Change Authorization (CC7.4)

**Control Assertion**: All four authorization layers must pass

**Evidence Artifacts**:

This control is a composite of four independent layers. Test each layer separately:

1. **Layer 1: Version Control**
   - Evidence: Git tags (see TNDS-AC-003)
   - Test: Verify tag exists for each version

2. **Layer 2: CI Automation**
   - Evidence: CI workflow (see TNDS-CM-001)
   - Test: Verify CI runs on all control layer changes

3. **Layer 3: Runtime Verification**
   - Evidence: Hash logging (see TNDS-OP-001)
   - Test: Verify hash logged at startup

4. **Layer 4: Code Review**
   - Evidence: CODEOWNERS (see TNDS-AC-002)
   - Test: Verify approval required

**Test Procedure**:
1. Test each layer independently → All should enforce
2. Test layer bypass attempts → All should fail
3. Verify no override mechanisms exist

---

### TNDS-OP-002: Startup and Audit Logging (CC7.5)

**Control Assertion**: Every startup logs control layer state

**Evidence Artifacts**:

1. **Startup Logging Code** (File: `src/startup/initialize.ts`)
   - Location: Lines 66-92
   - What to verify: Logs hash, version, timestamp
   - Command: `sed -n '66,92p' src/startup/initialize.ts`

2. **Application Logs** (Runtime Logs)
   - Location: Application log files
   - What to verify: Startup entries with complete information
   - Command: `grep "\[STARTUP\]" application.log`

**Test Procedure**:
1. Review log format → Verify completeness (hash, version, timestamp)
2. Sample logs from multiple deployments → Verify consistency
3. Correlate log timestamps with deployment events

---

## Auditor Walkthrough Checklist

Use this checklist during SOC 2 audit:

### Pre-Audit Preparation
- [ ] Clone repository at tag `compliance-baseline-v1.0.0`
- [ ] Verify git tag exists: `git tag | grep compliance-baseline`
- [ ] Access GitHub repository with appropriate permissions
- [ ] Request access to application logs (sample period: last 90 days)

### Evidence Collection
- [ ] **CC6.1**: Collect immutability evidence (4 artifacts)
- [ ] **CC6.2**: Collect code review evidence (3 artifacts)
- [ ] **CC6.6**: Collect version control evidence (3 artifacts)
- [ ] **CC7.2**: Collect integrity verification evidence (3 artifacts)
- [ ] **CC7.3**: Collect CI enforcement evidence (3 artifacts)
- [ ] **CC7.4**: Collect multi-layer authorization evidence (4 layers)
- [ ] **CC7.5**: Collect logging evidence (2 artifacts)

### Control Testing
- [ ] Test runtime immutability (attempt modification)
- [ ] Test code review enforcement (create test PR)
- [ ] Test CI validation (trigger workflow)
- [ ] Test integrity verification (review logs)
- [ ] Test version control (trace history)

### Documentation Review
- [ ] Review [soc2-control-mapping.md](soc2-control-mapping.md) for control descriptions
- [ ] Review [fedramp-control-narrative.md](fedramp-control-narrative.md) for implementation details
- [ ] Review [README.md](README.md) for compliance scope

---

## Evidence Retention

All evidence artifacts are retained in version control:

- **Code artifacts**: Permanent (Git history)
- **Configuration artifacts**: Permanent (Git history)
- **CI logs**: 90 days (GitHub Actions retention)
- **Application logs**: Per organization retention policy
- **Git tags**: Permanent (immutable)

**Baseline Tag**: `compliance-baseline-v1.0.0`  
**Baseline Date**: 2026-02-07  
**Next Review**: Quarterly or upon control changes

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-07  
**Maintained By**: TNDS Platform Administrators

