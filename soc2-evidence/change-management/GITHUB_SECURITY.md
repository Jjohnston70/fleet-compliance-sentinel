# GitHub Branch and Repository Security Configuration

Date: 2026-03-25  
Repo Branch Target: `main`

## 1. Require Code Review Before Merge

1. Go to `Settings -> Branches -> Add branch protection rule`.
2. Branch name pattern: `main`.
3. Enable:
   - `Require a pull request before merging`
   - `Require approvals` (recommended: 1 minimum, 2 for security-sensitive changes)
   - `Dismiss stale approvals when new commits are pushed`
   - `Require review from Code Owners`

## 2. Require Status Checks

Under same rule:

1. Enable `Require status checks to pass before merging`.
2. Enable `Require branches to be up to date before merging`.
3. Select required checks (example):
   - `build` (`npm run build`)
   - `lint` (`npm run lint`)
   - security scan/audit workflow check

## 3. Prevent Direct Pushes to Main

1. Enable `Restrict who can push to matching branches`.
2. Leave push list empty (or only release bot if required).
3. Enable `Do not allow bypassing the above settings`.
4. Enable `Include administrators` (recommended).

## 4. Enable Secret Scanning

1. Go to `Settings -> Security -> Code security and analysis`.
2. Enable:
   - `Secret scanning`
   - `Push protection for secret scanning`
3. Configure alert notifications for security owners.

## 5. Enable Dependency Review

1. Enable GitHub Advanced Security features available to your plan.
2. Add workflow using `dependency-review-action` on pull requests.
3. Set policy to fail PRs introducing known high/critical vulnerabilities.

## 6. CODEOWNERS for Security-Sensitive Files

Create `.github/CODEOWNERS` with entries:

```text
# Security-sensitive controls
/src/lib/fleet-compliance-auth.ts @your-org/security-team
/src/lib/audit-logger.ts @your-org/security-team
/vercel.json @your-org/security-team
/migrations/* @your-org/security-team
```

If your org uses a specific fallback owner, include:

```text
* @your-org/platform-team
```

## 7. Validation Checklist

- PR to `main` cannot merge without review.
- PR to `main` cannot merge without required checks.
- Direct push to `main` rejected.
- Secret scan alerts generated on seeded test secret.
- Dependency review blocks vulnerable dependency introduction.

