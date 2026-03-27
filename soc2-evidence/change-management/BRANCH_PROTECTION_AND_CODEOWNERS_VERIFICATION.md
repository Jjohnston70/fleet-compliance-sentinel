# Branch Protection and CODEOWNERS Verification

Date: 2026-03-25
Owner: Jacob Johnston

## CODEOWNERS

- File created: `.github/CODEOWNERS`
- Coverage includes:
  - Entire repository (`*`)
  - `docs/policies/`
  - `soc2-evidence/`
  - Privacy/Terms legal pages
  - Key auth and lifecycle enforcement files

## Branch Protection (Main)

Status: Verified 2026-03-27 — direct push to main rejected by branch protection, PR required and confirmed working.
Verification method: Claude Code attempted git push origin main on commit 43ab98b — rejected with branch protection error. PR workflow used instead.

Classic branch protection rule created for `main` branch with the following settings:

1. Require pull request before merging: ENABLED
2. Require at least 1 approval: ENABLED
3. Require status checks to pass before merging: ENABLED
4. Force pushes: RESTRICTED (not allowed)
5. Branch deletions: RESTRICTED (not allowed)
6. Do not allow bypassing the above settings (enforce for admins): ENABLED

Verified By: Coworker (Claude)
Verification Date: 2026-03-27 20:10 UTC
Evidence: Branch protection rule visible at GitHub Settings > Branches > main
