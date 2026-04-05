# FedRAMP Control Narrative - TNDS Platform

## Document Purpose

This document provides control narratives for the TNDS platform control layer in FedRAMP assessment format. Narratives are written in plain, assessable language aligned with NIST 800-53 Rev 5 control families.

This document is intended for FedRAMP assessors, government security teams, and FISMA compliance reviews.

## System Overview

The TNDS platform implements an immutable control layer that serves as command authority for AI agent operations. The control layer enforces logical access control, configuration management, and system integrity through four independent enforcement layers.

**System Boundary**: The control layer (`ai/control/`) and its enforcement mechanisms (loader, CI, runtime verification, code review).

**Authorization Boundary**: Control layer modifications require multi-layer authorization. Execution cannot override authority.

---

## AC (Access Control) Family

### AC-2: Account Management

**Control Requirement**: The organization manages information system accounts including establishing, activating, modifying, reviewing, disabling, and removing accounts.

**TNDS Implementation**:

The TNDS platform manages access to control layer modifications through GitHub team-based access control enforced via CODEOWNERS file.

**Account Types**:

- Platform Administrators (`@TNDS-Command-Center/platform-admins`) - Full control layer access
- Developers (`@TNDS-Command-Center/developers`) - Read access, no modification rights
- Architects (`@TNDS-Command-Center/architects`) - Architecture review rights

**Account Management Process**:

1. New users added to appropriate GitHub team by platform administrators
2. CODEOWNERS file enforces team-based access control
3. Branch protection rules require approval from platform-admins for control layer changes
4. GitHub audit log tracks all team membership changes

**Implementation Evidence**:

- `CODEOWNERS` file defining team-based access control
- GitHub team membership records
- Branch protection settings requiring code owner review
- GitHub audit logs

**Responsible Role**: Platform Administrators

---

### AC-3: Access Enforcement

**Control Requirement**: The information system enforces approved authorizations for logical access to information and system resources in accordance with applicable access control policies.

**TNDS Implementation**:

The TNDS platform enforces access control through four independent layers. All layers must pass for access to be granted.

**Enforcement Layers**:

1. **Version Control Enforcement**:
   - Git tags mark approved versions
   - Semantic versioning enforces intentional changes
   - Immutable version history prevents retroactive modification

2. **CI Automation Enforcement**:
   - GitHub Actions workflow validates all control layer changes
   - Automated checks enforce version bump requirements
   - Build fails if validation fails (fail-closed)

3. **Runtime Enforcement**:
   - Control layer loaded once at startup
   - Version pin enforces exact version match
   - `Object.freeze()` prevents runtime modification
   - Freeze assertion prevents future code changes from breaking immutability

4. **Code Review Enforcement**:
   - CODEOWNERS requires platform-admin approval
   - GitHub blocks merge without approval
   - No bypass mechanisms exist

**Access Control Policy**: Control layer is selected by authority, not searched. Execution cannot override authority.

**Implementation Evidence**:

- `.github/workflows/control-layer-guard.yml` - CI enforcement
- `src/control/loader.ts` - Runtime enforcement with version pin (line 138)
- `CODEOWNERS` - Code review enforcement
- Git tag history - Version control enforcement

**Responsible Role**: Automated enforcement (Git, GitHub Actions, Runtime code)

---

### AC-6: Least Privilege

**Control Requirement**: The organization employs the principle of least privilege, allowing only authorized accesses for users (or processes acting on behalf of users) which are necessary to accomplish assigned tasks in accordance with organizational missions and business functions.

**TNDS Implementation**:

The TNDS platform implements least privilege through role-based access control and immutable control layer design.

**Privilege Separation**:

- Control layer is read-only at runtime (frozen with `Object.freeze()`)
- No runtime processes can modify control layer
- Modification requires new version file, CI validation, and human approval
- Execution layer cannot override control layer authority

**Role-Based Access**:

- Platform Administrators: Control layer modification rights
- Developers: Read access only
- Runtime processes: Read-only access via frozen objects

**Implementation Evidence**:

- `Object.freeze()` calls in `src/control/loader.ts` (recursive freeze)
- Freeze assertion: `!Object.isExtensible(artifacts)` check
- CODEOWNERS role separation
- No runtime modification APIs exist

**Responsible Role**: Platform design enforces least privilege automatically

---

## CM (Configuration Management) Family

### CM-2: Baseline Configuration

**Control Requirement**: The organization develops, documents, and maintains under configuration control, a current baseline configuration of the information system.

**TNDS Implementation**:

The TNDS platform maintains baseline configuration through versioned, immutable control layer files.

**Baseline Definition**:

- Each control layer version represents a configuration baseline
- Baselines are marked immutable with `"status": "immutable"` and `frozen_at` timestamp
- Version pin in loader enforces exact baseline match
- No drift from baseline possible at runtime

**Configuration Control**:

- Git tags mark approved baselines (e.g., `control-layer-v1.0.0`)
- Version files are immutable (cannot be modified after creation)
- New baselines require new version file
- Complete audit trail via git history

**Baseline Documentation**:

- `ai/control/prompt-registry.v1.0.0.json` - Baseline configuration
- `meta.version` field documents version
- `frozen_at` timestamp documents freeze time
- Git tag message documents baseline purpose

**Implementation Evidence**:

- Immutability markers in JSON files
- Git tag history
- Version pin check in loader
- Freeze assertion preventing modification

**Responsible Role**: Platform Administrators (baseline approval), Git (baseline enforcement)

---

### CM-3: Configuration Change Control

**Control Requirement**: The organization determines the types of changes to the information system that are configuration-controlled, reviews proposed configuration-controlled changes to the information system and approves or disapproves such changes with explicit consideration for security impact analyses.

**TNDS Implementation**:

The TNDS platform implements configuration change control through a four-layer authorization process. All control layer changes are configuration-controlled.

**Change Control Process**:

1. **Change Proposal**: Developer creates new versioned control layer file
2. **Automated Review**: CI workflow validates version bump, immutability markers, loader updates
3. **Security Impact Analysis**: Platform administrators review change for security impact
4. **Approval**: Required approval from `@TNDS-Command-Center/platform-admins` team
5. **Implementation**: Merge to main branch, tag new version
6. **Verification**: Runtime hash verification confirms deployed version

**Configuration-Controlled Changes**:

- All modifications to `ai/control/` directory
- All modifications to `src/control/` loader
- All modifications to `src/startup/` initialization
- All modifications to constitution and validators

**Change Rejection**:

- CI fails if version bump missing
- GitHub blocks merge without approval
- Runtime refuses to load if version mismatch
- Any layer failure rejects the change

**Implementation Evidence**:

- `.github/workflows/control-layer-guard.yml` - Automated validation
- Pull request approval history
- CI execution logs showing validation steps
- Git tag history showing approved changes

**Responsible Role**: Platform Administrators (approval), CI (validation), GitHub (enforcement)

---

### CM-6: Configuration Settings

**Control Requirement**: The organization establishes and documents configuration settings for information technology products employed within the information system using security configuration checklists that reflect the most restrictive mode consistent with operational requirements.

**TNDS Implementation**:

The TNDS platform enforces configuration settings through version pinning and immutability markers.

**Configuration Settings**:

1. **Version Pin**: Loader enforces exact version match
   - Code: `if (registryData.meta?.version !== '1.0.0') { throw }`
   - Location: `src/control/loader.ts` line 138
   - Effect: Prevents version drift

2. **Immutability Markers**: Control layer marked immutable
   - Setting: `"status": "immutable"`
   - Setting: `"frozen_at": "<ISO-timestamp>"`
   - Effect: Documents freeze point for audit

3. **Freeze Enforcement**: Runtime immutability enforced
   - Code: `Object.freeze(artifacts)` (recursive)
   - Assertion: `!Object.isExtensible(artifacts)`
   - Effect: Prevents runtime modification

4. **Fail-Closed Mode**: No fallbacks or defaults
   - Behavior: Throw on any validation failure
   - Effect: Most restrictive mode enforced

**Configuration Documentation**:

- Version pin documented in loader code
- Immutability markers in JSON metadata
- Freeze assertion in loader
- No configuration overrides possible

**Implementation Evidence**:

- `src/control/loader.ts` - Version pin and freeze code
- `ai/control/prompt-registry.v1.0.0.json` - Immutability markers
- No environment variables or runtime overrides exist

**Responsible Role**: Platform design enforces configuration settings automatically

---

## SI (System and Information Integrity) Family

### SI-7: Software, Firmware, and Information Integrity

**Control Requirement**: The organization employs integrity verification mechanisms to detect unauthorized changes to software, firmware, and information.

**TNDS Implementation**:

The TNDS platform employs cryptographic hashing (SHA-256) to verify control layer integrity at every application startup.

**Integrity Verification Mechanism**:

1. **Hash Computation**:
   - Algorithm: SHA-256
   - Input: Complete control layer content (JSON stringified)
   - Output: 64-character hexadecimal hash
   - Location: `src/control/loader.ts` lines 294-321

2. **Hash Logging**:
   - Logged at every application startup
   - Format: `[STARTUP] Control hash: <hash>`
   - Includes version and timestamp
   - Location: `src/startup/initialize.ts` lines 66-92

3. **Integrity Verification**:
   - Function: `verifyControlIntegrity()`
   - Returns: Boolean (true if integrity verified)
   - Behavior: Compares current hash to expected hash
   - Fail-closed: Application refuses to start if verification fails

**Unauthorized Change Detection**:

- Hash mismatch indicates tampering
- Startup logs provide audit trail
- Hash changes correlate with version changes
- Unexpected hash changes trigger investigation

**Implementation Evidence**:

- `getControlHash()` function in `src/control/loader.ts`
- Startup logs containing hash values
- Hash verification function
- Fail-closed behavior on integrity failure

**Responsible Role**: Runtime code (automated integrity verification)

---

### SI-7(1): Integrity Checks - Integrity Checks

**Control Enhancement**: The information system performs an integrity check of software, firmware, and information at startup.

**TNDS Implementation**:

The TNDS platform performs integrity checks at every application startup as a mandatory initialization step.

**Startup Integrity Check Process**:

1. **Load Control Layer**: Read control layer file from disk
2. **Validate Version**: Verify `meta.version === '1.0.0'`
3. **Compute Hash**: Calculate SHA-256 hash of content
4. **Log Hash**: Write hash to application logs with timestamp
5. **Freeze Objects**: Apply `Object.freeze()` recursively
6. **Assert Freeze**: Verify `!Object.isExtensible(artifacts)`
7. **Fail-Closed**: Throw exception if any check fails

**Integrity Check Frequency**: Every application startup (no exceptions)

**Integrity Check Logging**:

```
[STARTUP] Control layer loaded successfully
[STARTUP] Control hash: a1b2c3d4e5f6...
[STARTUP] Control version: 1.0.0
[STARTUP] Timestamp: 2026-02-07T12:00:00.000Z
```

**Implementation Evidence**:

- `src/startup/initialize.ts` - Startup integrity checks
- Application logs - Hash and version logging
- Fail-closed behavior - No startup without integrity verification

**Responsible Role**: Startup initialization code (automated)

---

## AU (Audit and Accountability) Family

### AU-2: Audit Events

**Control Requirement**: The organization determines that the information system is capable of auditing specific events and coordinates the security audit function with other organizational entities requiring audit-related information.

**TNDS Implementation**:

The TNDS platform audits all control layer lifecycle events.

**Auditable Events**:

1. **Control Layer Loading**:
   - Event: Control layer loaded at startup
   - Logged: Hash, version, timestamp
   - Location: Application logs

2. **Control Layer Changes**:
   - Event: Pull request created/merged
   - Logged: GitHub audit log, PR history
   - Location: GitHub

3. **CI Validation**:
   - Event: CI workflow execution
   - Logged: Validation results, pass/fail status
   - Location: GitHub Actions logs

4. **Code Review**:
   - Event: Approval granted/denied
   - Logged: Reviewer, timestamp, decision
   - Location: GitHub PR history

5. **Version Tagging**:
   - Event: Git tag created
   - Logged: Tag name, message, author, timestamp
   - Location: Git history

**Audit Coordination**:

- Application logs available to security team
- GitHub audit logs available to administrators
- CI logs available for compliance review

**Implementation Evidence**:

- Application startup logs
- GitHub audit logs
- GitHub Actions execution logs
- Git history

**Responsible Role**: Platform (application logs), GitHub (change logs)

---

### AU-3: Content of Audit Records

**Control Requirement**: The information system generates audit records containing information that establishes what type of event occurred, when the event occurred, where the event occurred, the source of the event, the outcome of the event, and the identity of any individuals or subjects associated with the event.

**TNDS Implementation**:

The TNDS platform generates comprehensive audit records for all control layer events.

**Audit Record Content**:

1. **Startup Events**:
   - What: Control layer loaded
   - When: ISO timestamp
   - Where: Application startup
   - Source: `src/startup/initialize.ts`
   - Outcome: Success (with hash) or failure (with error)
   - Identity: Application instance

2. **Change Events** (GitHub):
   - What: Control layer modified
   - When: PR merge timestamp
   - Where: GitHub repository
   - Source: Pull request
   - Outcome: Merged or rejected
   - Identity: Author, approver

3. **CI Events**:
   - What: Validation executed
   - When: Workflow run timestamp
   - Where: GitHub Actions
   - Source: `.github/workflows/control-layer-guard.yml`
   - Outcome: Pass or fail (with details)
   - Identity: Triggering user

**Audit Record Format**:

```
[STARTUP] Control layer loaded successfully
[STARTUP] Control hash: a1b2c3d4e5f6...
[STARTUP] Control version: 1.0.0
[STARTUP] Timestamp: 2026-02-07T12:00:00.000Z
```

**Implementation Evidence**:

- Structured log format in `src/startup/initialize.ts`
- GitHub audit log format (standard)
- CI log format (GitHub Actions standard)

**Responsible Role**: Platform (application logs), GitHub (change and CI logs)

---

## Control Implementation Summary

| Control Family | Control | Control Name                                  | Implementation Status |
| -------------- | ------- | --------------------------------------------- | --------------------- |
| AC             | AC-2    | Account Management                            | Implemented           |
| AC             | AC-3    | Access Enforcement                            | Implemented           |
| AC             | AC-6    | Least Privilege                               | Implemented           |
| CM             | CM-2    | Baseline Configuration                        | Implemented           |
| CM             | CM-3    | Configuration Change Control                  | Implemented           |
| CM             | CM-6    | Configuration Settings                        | Implemented           |
| SI             | SI-7    | Software, Firmware, and Information Integrity | Implemented           |
| SI             | SI-7(1) | Integrity Checks                              | Implemented           |
| AU             | AU-2    | Audit Events                                  | Implemented           |
| AU             | AU-3    | Content of Audit Records                      | Implemented           |

## Implementation Artifacts

All control narratives reference real, verifiable artifacts:

| Artifact Type    | Location                                    | Purpose                                     |
| ---------------- | ------------------------------------------- | ------------------------------------------- |
| Control Layer    | `ai/control/prompt-registry.v1.0.0.json`    | Immutable command authority                 |
| Loader           | `src/control/loader.ts`                     | Version-pinned loader with integrity checks |
| Initialization   | `src/startup/initialize.ts`                 | Fail-closed startup with logging            |
| CI Workflow      | `.github/workflows/control-layer-guard.yml` | Automated validation                        |
| Code Ownership   | `CODEOWNERS`                                | Access control enforcement                  |
| Git Tags         | `git tag \| grep control-layer`             | Version history                             |
| Application Logs | Runtime logs                                | Integrity verification audit trail          |
| GitHub Logs      | GitHub audit log                            | Change and approval audit trail             |

## Assessment Procedures

To assess controls during FedRAMP evaluation:

1. **Review Access Control (AC)**:
   - Verify CODEOWNERS file and team membership
   - Test access enforcement by attempting unauthorized change
   - Confirm least privilege through role separation

2. **Review Configuration Management (CM)**:
   - Inspect baseline configuration files
   - Trace change control process through PR history
   - Verify configuration settings enforcement in code

3. **Review System Integrity (SI)**:
   - Review hash computation code
   - Verify startup integrity checks in logs
   - Test integrity verification function

4. **Review Audit and Accountability (AU)**:
   - Review application logs for audit events
   - Verify audit record content completeness
   - Confirm audit log availability

## Compliance Statement

The TNDS platform control layer implements NIST 800-53 controls through automated, code-enforced mechanisms. All controls are implemented in code and enforced by Git, GitHub, and runtime validation. No manual processes or human discretion can bypass these controls.

Control implementation is verifiable through:

- Source code inspection
- Runtime behavior testing
- Audit log review
- CI/CD pipeline testing

This is governance enforced by code, not policy.

---

**Document Version**: 1.0
**Last Updated**: 2026-02-07
**Maintained By**: TNDS Platform Administrators
**Review Frequency**: Quarterly or upon control changes
**Classification**: Public - Audit-Ready Documentation
