# Git Workflow Guide

Owner: Jacob Johnston
Last Updated: 2026-03-27

This guide covers the day-to-day git workflow for Fleet-Compliance Sentinel. Branch protection is enabled on `main`, so all changes go through pull requests.

---

## The Short Version

Every change follows this pattern:
1. Create a branch
2. Make changes and commit
3. Push the branch
4. Open a pull request (PR)
5. Merge the PR
6. Pull the updated main locally

---

## Step-by-Step: Making Changes

### 1. Start from an up-to-date main

Before starting any work, make sure your local `main` is current:

```bash
git checkout main
git pull origin main
```

### 2. Create a feature branch

Branch names should describe what you're doing. Use prefixes:
- `feat/` for new features (e.g., `feat/telematics-dashboard`)
- `fix/` for bug fixes (e.g., `fix/auth-redirect-loop`)
- `ops/` for operational/infrastructure work (e.g., `ops/soc2-secret-rotation`)
- `docs/` for documentation only (e.g., `docs/rotation-runbook`)

```bash
git checkout -b ops/soc2-secret-rotation
```

This creates the branch AND switches to it. You're now working on the new branch, not main.

### 3. Make your changes

Edit files, run the Sentry wizard, update configs, whatever the task requires.

### 4. Stage your changes

See what changed:
```bash
git status
```

Stage specific files (recommended):
```bash
git add next.config.js sentry.server.config.ts sentry.edge.config.ts
git add soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md
```

Or stage everything (use with caution -- review `git status` first to make sure you're not adding secrets or junk):
```bash
git add .
```

### 5. Commit

Write a clear commit message. First line is the summary (under 72 chars), then a blank line, then details if needed:

```bash
git commit -m "ops(soc2): complete secret rotation and Sentry SDK integration"
```

For longer messages:
```bash
git commit -m "ops(soc2): complete secret rotation and Sentry SDK integration

- Rotated Clerk, Neon, Penny, Cron secrets
- Ran Sentry wizard, hardened PII settings
- Updated evidence logs"
```

### 6. Push the branch

First time pushing a new branch:
```bash
git push -u origin ops/soc2-secret-rotation
```

The `-u` flag sets up tracking so future pushes are just `git push`.

Subsequent pushes on the same branch:
```bash
git push
```

### 7. Create a Pull Request (PR)

**Option A: GitHub CLI (gh)**

```bash
gh pr create --base main --head ops/soc2-secret-rotation \
  --title "ops(soc2): secret rotation and Sentry integration" \
  --body "Completed rotation for all secrets, integrated Sentry SDK, updated evidence logs."
```

**Option B: GitHub website**

1. Go to https://github.com/Pipeline-Punks/website-pipeline-punks-pipelinex-v2
2. You'll see a yellow banner: "[branch name] had recent pushes" with a green "Compare & pull request" button
3. Click it
4. Fill in:
   - **Title**: Short description of what changed
   - **Description**: Details, context, what to test
   - **Base**: `main` (should be selected by default)
   - **Compare**: your branch name
5. Click "Create pull request"

### 8. Merge the PR

**Option A: GitHub CLI**

```bash
gh pr merge --squash
```

The `--squash` flag combines all your commits into one clean commit on main. Other options:
- `--merge` keeps all individual commits
- `--rebase` replays commits on top of main

**Option B: GitHub website**

1. On the PR page, scroll to the bottom
2. Click the green "Merge pull request" button (or the dropdown arrow to choose squash/rebase)
3. Click "Confirm merge"
4. Optionally click "Delete branch" to clean up

### 9. Update your local main

After merging, switch back to main and pull:

```bash
git checkout main
git pull origin main
```

Now you're ready to start the next branch.

---

## Common Scenarios

### "I committed to the wrong branch"

If you committed to main instead of a feature branch:

```bash
# Create the branch from your current position (keeps your commits)
git checkout -b feat/my-feature

# Push the new branch
git push -u origin feat/my-feature

# Now reset main back (only if you haven't pushed main)
git checkout main
git reset --hard origin/main
```

### "I need to update my branch with changes from main"

If main has been updated while you were working on your branch:

```bash
git checkout your-branch-name
git pull origin main
```

This merges main into your branch. If there are conflicts, git will tell you which files to fix.

### "I forgot to create a branch and pushed to main"

Branch protection will reject the push. You'll see an error like:
```
! [remote rejected] main -> main (protected branch hook declined)
```

Solution: create a branch from your current state and push that instead:
```bash
git checkout -b fix/whatever-i-was-working-on
git push -u origin fix/whatever-i-was-working-on
```

Then create a PR from GitHub.

### "The PR has merge conflicts"

This means someone else changed the same files on main. Fix it:

```bash
git checkout your-branch
git pull origin main
# Git will mark conflicts in the affected files
# Open each file, find the <<<<<<< markers, resolve them
git add .
git commit -m "resolve merge conflicts with main"
git push
```

The PR will automatically update.

### "I want to see what a PR changed before merging"

```bash
gh pr diff 3    # where 3 is the PR number
```

Or on GitHub: click the "Files changed" tab on the PR page.

### "I want to add more commits to an open PR"

Just push more commits to the same branch. The PR updates automatically:

```bash
# Make more changes
git add .
git commit -m "address review feedback"
git push
```

---

## GitHub Issues

Issues track bugs, feature requests, and tasks. They're useful for SOC 2 evidence (shows change management process).

### Creating an Issue

**GitHub CLI:**
```bash
gh issue create --title "Bug: telematics page crashes on empty data" \
  --body "Steps to reproduce: navigate to /fleet-compliance/telematics with no vehicle data loaded."
```

**GitHub website:**
1. Go to your repo > "Issues" tab > "New issue"
2. Fill in title and description
3. Optionally add labels (bug, enhancement, soc2, etc.)

### Linking Issues to PRs

Reference an issue in your PR description to link them:
- `Fixes #5` -- closes issue #5 when the PR merges
- `Closes #5` -- same as above
- `Relates to #5` -- links without auto-closing

Example PR body:
```
Fixes #5

Added null check for empty telematics data array.
```

### Viewing Issues

```bash
gh issue list                    # all open issues
gh issue list --state closed     # closed issues
gh issue view 5                  # details of issue #5
```

---

## Branch Protection Rules (Currently Active)

These rules are enforced on `main`:
- Direct pushes to main are blocked
- Pull requests are required for all changes
- At least 1 approval is required (currently set; may be bypassed for solo dev)
- Force pushes are disabled
- Branch deletion is disabled

This means you will ALWAYS need to use the branch > PR > merge workflow described above.

---

## Quick Reference Card

```
# Start work
git checkout main && git pull origin main
git checkout -b feat/my-feature

# Do work, then commit
git add file1.ts file2.ts
git commit -m "feat: add new feature"
git push -u origin feat/my-feature

# Create PR
gh pr create --title "feat: add new feature" --body "Description here"

# After merge
git checkout main && git pull origin main

# Clean up old branch (optional)
git branch -d feat/my-feature
```

---

## Installing GitHub CLI (gh)

If you don't have `gh` installed:

**Windows (winget):**
```bash
winget install --id GitHub.cli
```

**Windows (scoop):**
```bash
scoop install gh
```

**Then authenticate:**
```bash
gh auth login
```

Follow the prompts -- it'll open a browser for GitHub authentication.

After that, all `gh` commands work directly from PowerShell or your terminal.
