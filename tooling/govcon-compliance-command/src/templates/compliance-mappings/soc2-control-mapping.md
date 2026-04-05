# SOC 2 Control Mapping - TNDS Platform

## Document Purpose

This document maps TNDS platform controls to SOC 2 Trust Services Criteria, specifically:

- **CC6**: Logical and Physical Access Controls
- **CC7**: System Operations

This mapping is written for SOC 2 Type II auditors and provides control implementation details, evidence artifacts, and auditor assertions.

## Scope

The TNDS platform control layer implements immutable command authority with four-layer enforcement:

1. Version Control (Git tags, semantic versioning)
2. CI Automation (GitHub Actions validation)
3. Runtime Verification (SHA-256 hash logging)
4. Code Review (CODEOWNERS enforcement)

All layers must pass for execution to proceed. Any layer failure rejects the change.

---

## CC6: Logical and Physical Access Controls

### CC6.1 - Logical Access Control

**Control Objective**: The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events to meet the entity's objectives.

#### TNDS Control Implementation

**Control ID**: TNDS-AC-001
**Control Name**: Immutable Control Layer with Version-Pinned Authority

**Description**:
The TNDS platform enforces logical access control through an immutable control layer (`ai/control/`) that defines system-level commands and policies. The control layer is:

- Loaded once at startup via `src/startup/initialize.ts`
- Version-pinned to prevent drift (enforces `meta.version === '1.0.0'`)
- Frozen recursively with `Object.freeze()` to prevent runtime modification
- Validated against 148 constitutional rules at load time
- Not exposed to vector search or agent discovery

**Implementation Artifacts**:

- `ai/control/prompt-registry.v1.0.0.json` - Immutable control registry (status: "immutable", frozen_at timestamp)
- `src/control/loader.ts` - Control layer loader with version pin enforcement (line 138)
- `src/startup/initialize.ts` - Fail-closed initialization (throws on any validation failure)
- `src/validators/prompt-validator.ts` - Prompt validation against schema

**Evidence**:

1. Control layer file marked immutable: `"status": "immutable"` in JSON metadata
2. Version pin check in loader: `if (registryData.meta?.version !== '1.0.0') { throw }`
3. Freeze assertion: `!Object.isExtensible(artifacts)` check prevents future refactors from breaking immutability
4. Fail-closed behavior: No fallbacks, no defaults, throws on any error
5. Startup logs: `[STARTUP] Control hash: <sha256>` logged at every application start

**Auditor Assertion**:
Control layer cannot be modified at runtime. All modifications require new version file, CI validation, code review approval, and version tag. Runtime attempts to modify frozen objects will throw TypeError.

---

### CC6.2 - Access Control Enforcement

**Control Objective**: Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users whose access is administered by the entity.

#### TNDS Control Implementation

**Control ID**: TNDS-AC-002
**Control Name**: Code Review Enforcement via CODEOWNERS

**Description**:
All changes to the control layer require explicit approval from designated platform administrators. This is enforced via GitHub CODEOWNERS file and branch protection rules.

**Implementation Artifacts**:

- `CODEOWNERS` - Defines required reviewers for protected paths
- GitHub branch protection rules - Enforces "Require review from Code Owners"

**Protected Paths**:

```
/ai/control/                    @TNDS-Command-Center/platform-admins
/src/control/                   @TNDS-Command-Center/platform-admins
/src/startup/                   @TNDS-Command-Center/platform-admins
/docs/CONSTITUTION.md           @TNDS-Command-Center/platform-admins
/src/constitution/              @TNDS-Command-Center/platform-admins
/src/validators/                @TNDS-Command-Center/platform-admins
/tests/conformance/             @TNDS-Command-Center/platform-admins
```

**Evidence**:

1. CODEOWNERS file in repository root
2. Branch protection settings requiring code owner review
3. Pull request history showing required approvals
4. GitHub audit log showing review enforcement

**Auditor Assertion**:
Control layer changes cannot be merged without approval from `@TNDS-Command-Center/platform-admins` team. GitHub enforces this requirement and blocks merges without approval.

---

### CC6.6 - Logical Access Control - Removal

**Control Objective**: The entity removes access to the system when access is no longer required or when access is no longer appropriate.

#### TNDS Control Implementation

**Control ID**: TNDS-AC-003
**Control Name**: Version-Based Access Revocation

**Description**:
Control layer versions are immutable. To revoke or modify access policies, a new version must be created. Old versions remain frozen and tagged for audit trail.

**Implementation Artifacts**:

- Git tags: `control-layer-v1.0.0`, `control-layer-v1.1.0`, etc.
- Version history in git log
- Immutability markers prevent modification of existing versions

**Evidence**:

1. Git tag history: `git tag | grep control-layer`
2. Immutable version files: Cannot modify `prompt-registry.v1.0.0.json` after freeze
3. Version progression: Each change creates new version file
4. Audit trail: Complete history via `git log ai/control/`

**Auditor Assertion**:
Access policies cannot be retroactively modified. All changes create new versions with complete audit trail. Old versions remain frozen and accessible for audit.

---

## CC7: System Operations

### CC7.2 - System Monitoring

**Control Objective**: The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors affecting the entity's ability to meet its objectives; anomalies are analyzed to determine whether they represent security events.

#### TNDS Control Implementation

**Control ID**: TNDS-OP-001
**Control Name**: Runtime Integrity Verification via Cryptographic Hashing

**Description**:
The platform computes a SHA-256 hash of the control layer at startup and logs it for audit purposes. This hash provides cryptographic verification that the control layer has not been tampered with.

**Implementation Artifacts**:

- `src/control/loader.ts` - `getControlHash()` function (lines 294-321)
- `src/startup/initialize.ts` - Hash logging at startup (lines 66-92)
- Application logs containing control hash

**Hash Computation**:

```typescript
// SHA-256 hash of entire control layer content
const hash = crypto
  .createHash("sha256")
  .update(JSON.stringify(controlArtifacts), "utf8")
  .digest("hex");
```

**Evidence**:

1. Startup logs: `[STARTUP] Control hash: <64-character-hex-string>`
2. Hash verification function: `verifyControlIntegrity()` returns boolean
3. Fail-closed behavior: Application refuses to start if integrity check fails
4. Audit trail: Hash logged with timestamp on every startup

**Auditor Assertion**:
Control layer integrity is verified cryptographically at every application startup. Hash mismatch indicates tampering and prevents application start. All startups are logged with hash and timestamp.

---

### CC7.3 - Change Management

**Control Objective**: The entity implements change management processes to support system changes and ensure that changes are authorized, designed, developed, configured, documented, tested, approved, and implemented to meet the entity's objectives.

#### TNDS Control Implementation

**Control ID**: TNDS-CM-001
**Control Name**: CI-Enforced Version Bump Validation

**Description**:
All control layer changes are validated by automated CI workflow that enforces version bump requirements, immutability markers, and loader updates.

**Implementation Artifacts**:

- `.github/workflows/control-layer-guard.yml` - CI validation workflow
- GitHub Actions execution logs
- Pull request status checks

**CI Validation Steps**:

1. Detect changes to `ai/control/**` paths
2. Validate new versioned file created (e.g., `prompt-registry.v1.1.0.json`)
3. Check version in filename matches `meta.version` in JSON
4. Verify immutability markers (`status: "immutable"`, `frozen_at` timestamp)
5. Confirm `src/control/loader.ts` updated to use new version
6. Fail build if any check fails

**Evidence**:

1. GitHub Actions workflow file
2. CI execution logs showing validation steps
3. Failed builds when version bump missing
4. Pull request status checks requiring CI pass

**Auditor Assertion**:
Control layer changes cannot be merged without passing automated CI validation. CI enforces version bump, immutability markers, and loader updates. Build fails with clear error messages if requirements not met.

---

### CC7.4 - Change Management - Authorization

**Control Objective**: The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures to meet its objectives.

#### TNDS Control Implementation

**Control ID**: TNDS-CM-002
**Control Name**: Multi-Layer Change Authorization

**Description**:
Control layer changes require authorization at four independent layers. All layers must pass for change to be accepted.

**Four Authorization Layers**:

1. **Version Control**: Git tag required for each version
   - Artifact: `git tag control-layer-v1.0.0`
   - Evidence: Tag history via `git tag | grep control-layer`

2. **CI Automation**: Automated validation must pass
   - Artifact: `.github/workflows/control-layer-guard.yml`
   - Evidence: GitHub Actions status checks

3. **Runtime Verification**: Cryptographic hash verification
   - Artifact: `getControlHash()` function
   - Evidence: Startup logs with hash

4. **Code Review**: Human approval required
   - Artifact: `CODEOWNERS` file
   - Evidence: Pull request approvals

**Evidence**:

1. Git tag history showing version progression
2. CI workflow execution logs
3. Application startup logs with hashes
4. Pull request approval history

**Auditor Assertion**:
All four authorization layers must pass. If any layer fails, change is rejected. No bypasses exist. Authorization is enforced by Git, GitHub, and runtime code.

---

### CC7.5 - System Monitoring - Logging

**Control Objective**: The entity implements system monitoring to detect, analyze, and respond to security events.

#### TNDS Control Implementation

**Control ID**: TNDS-OP-002
**Control Name**: Comprehensive Startup and Audit Logging

**Description**:
The platform logs control layer hash, version, and timestamp at every startup. This provides audit trail for integrity verification.

**Implementation Artifacts**:

- `src/startup/initialize.ts` - Startup logging (lines 66-92)
- Application logs

**Log Format**:

```
[STARTUP] Control layer loaded successfully
[STARTUP] Control hash: a1b2c3d4e5f6...
[STARTUP] Control version: 1.0.0
[STARTUP] Timestamp: 2026-02-07T12:00:00.000Z
```

**Evidence**:

1. Application logs containing startup entries
2. Hash values logged for each startup
3. Timestamp correlation with deployment events
4. Version tracking across deployments

**Auditor Assertion**:
Every application startup logs control layer hash, version, and timestamp. Logs provide complete audit trail of control layer state across all deployments. Hash changes indicate control layer modifications.

---

## Control Summary

| Control ID  | SOC 2 Criteria | Control Name                     | Implementation Status |
| ----------- | -------------- | -------------------------------- | --------------------- |
| TNDS-AC-001 | CC6.1          | Immutable Control Layer          | Implemented           |
| TNDS-AC-002 | CC6.2          | Code Review Enforcement          | Implemented           |
| TNDS-AC-003 | CC6.6          | Version-Based Access Revocation  | Implemented           |
| TNDS-OP-001 | CC7.2          | Runtime Integrity Verification   | Implemented           |
| TNDS-CM-001 | CC7.3          | CI-Enforced Version Bump         | Implemented           |
| TNDS-CM-002 | CC7.4          | Multi-Layer Change Authorization | Implemented           |
| TNDS-OP-002 | CC7.5          | Startup and Audit Logging        | Implemented           |

## Evidence Artifacts

All controls reference real, auditable artifacts:

| Artifact               | Location                                    | Purpose                       |
| ---------------------- | ------------------------------------------- | ----------------------------- |
| Control registry       | `ai/control/prompt-registry.v1.0.0.json`    | Immutable control data        |
| Control loader         | `src/control/loader.ts`                     | Version-pinned loader         |
| Startup initialization | `src/startup/initialize.ts`                 | Fail-closed init with logging |
| CI workflow            | `.github/workflows/control-layer-guard.yml` | Automated validation          |
| Code ownership         | `CODEOWNERS`                                | Review enforcement            |
| Git tags               | `git tag \| grep control-layer`             | Version history               |
| Application logs       | Runtime logs                                | Hash and version tracking     |

## Audit Procedures

To verify controls during SOC 2 audit:

1. **Review control layer immutability**:
   - Inspect `ai/control/prompt-registry.v1.0.0.json` for immutability markers
   - Verify `Object.freeze()` calls in `src/control/loader.ts`
   - Confirm freeze assertion check exists

2. **Test CI enforcement**:
   - Create test PR modifying control layer without version bump
   - Verify CI fails with error message
   - Confirm build cannot pass without version bump

3. **Verify code review requirement**:
   - Review `CODEOWNERS` file
   - Check branch protection settings
   - Inspect PR history for required approvals

4. **Validate runtime verification**:
   - Review application startup logs
   - Verify hash logging present
   - Confirm hash format (64-character hex)

5. **Trace version history**:
   - List git tags: `git tag | grep control-layer`
   - Review tag details: `git show control-layer-v1.0.0`
   - Verify version progression

## Compliance Attestation

The TNDS platform control layer implements defense-in-depth access control and change management through four independent, automated enforcement layers. All controls are implemented in code and enforced by Git, GitHub, and runtime validation. No manual processes or human discretion can bypass these controls.

This is governance you can prove, not just promise.

---

**Document Version**: 1.0
**Last Updated**: 2026-02-07
**Maintained By**: TNDS Platform Administrators
**Review Frequency**: Quarterly or upon control changes
