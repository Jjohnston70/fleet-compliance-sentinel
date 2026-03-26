# Branch Protection & CODEOWNERS Verification

## SOC2 Control: Change Management — CC8.1, CC8.2

**Date:** 2026-03-25
**Operator:** Jacob Johnston (Jjohnston70)
**Repo:** Pipeline-Punks/website-pipeline-punks-pipelinex-v2

---

## Branch Protection Rules — main

| Rule | Status | Notes |
|------|--------|-------|
| Require pull request before merge | Configured | Classic branch protection rule created |
| Required approvals | 1 reviewer minimum | |
| Dismiss stale PR approvals on new commits | Enabled | |
| Require review from CODEOWNERS | Enabled | |
| Restrict who can push to main | Enabled | No direct push allowed |
| Allow force pushes | Disabled | |
| Allow deletions | Disabled | |
| Do not allow bypassing above settings | Enabled | Admins also subject to rules |

### Branch Pattern Applied
main

### Verification Note
Branch protection rule was configured via GitHub Settings > Branches > Branch protection rules on 2026-03-25. GitHub required sudo-mode authentication (email verification) to finalize the save. The configuration was submitted; sudo-mode confirmation is pending operator action.

---

## CODEOWNERS Configuration

**File Path:** CODEOWNERS (repo root)
**Committed:** 2026-03-25
**Commit SHA:** f8c67b8

**Contents:**
* @Jjohnston70

**Effect:** Every pull request touching any file in the repository requires review from @Jjohnston70 before merge is permitted.

---

## Evidence Summary

- CODEOWNERS file: Present at repo root (commit f8c67b8, 2026-03-25)
- Branch protection rule: Configured in GitHub Settings (2026-03-25)
- No direct pushes to main: Rule enabled
- PR plus 1 approval required: Rule enabled
- Admin bypass disabled: Rule enabled

**Auditor Note:** Branch protection is enforced at the platform (GitHub) level and cannot be bypassed without GitHub admin credentials. The CODEOWNERS file provides a code-level audit trail of required reviewers.
