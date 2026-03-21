# Clerk Phase 3 Readiness Checklist

Date: 2026-03-21  
Owner: Jacob Johnston  
Scope: Manual validation before starting Phase 3

## Pre-Reqs

- [ ] Clerk instance available with admin access
- [ ] Test users available (at least one user in Org A and one in Org B)
- [ ] App environment has `DATABASE_URL`, `CLERK_SECRET_KEY`, and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set
- [ ] You can sign in and switch active organization in Clerk UI

## Test 1: Org Isolation (Org A cannot see Org B assets)

### Setup

- [ ] Create Organization A in Clerk (name: `Chief Test Org A`)
- [ ] Create Organization B in Clerk (name: `Chief Test Org B`)
- [ ] Add User A as member/admin of Org A only
- [ ] Add User B as member/admin of Org B only

### Data Seeding

- [ ] Sign in as User A with Org A active
- [ ] Confirm `/chief/import` shows `Active Clerk org` matching Org A ID before import
- [ ] Import at least 1 unique asset for Org A through `/chief/import`
- [ ] Confirm asset appears in `/chief/assets` for Org A
- [ ] Sign in as User B with Org B active
- [ ] Confirm `/chief/import` shows `Active Clerk org` matching Org B ID before import
- [ ] Import at least 1 different unique asset for Org B through `/chief/import`
- [ ] Confirm asset appears in `/chief/assets` for Org B

### Isolation Verification

- [ ] While Org A is active, Org B asset does not appear in `/chief/assets`
- [ ] While Org B is active, Org A asset does not appear in `/chief/assets`
- [ ] API check as Org A: `GET /api/chief/assets` returns only Org A assets
- [ ] API check as Org B: `GET /api/chief/assets` returns only Org B assets

### Expected Result

- [ ] PASS: No cross-org asset visibility in UI or API

### Evidence to Save

- [ ] Screenshot: Org A assets view
- [ ] Screenshot: Org B assets view
- [ ] API response capture for Org A
- [ ] API response capture for Org B

---

## Test 2: Re-Import After Rollback Succeeds

### Initial Import

- [ ] Use `/chief/import` to upload test file and save approved rows
- [ ] Record returned `batch_id`
- [ ] Confirm imported rows appear in relevant Chief pages

### Rollback

- [ ] Trigger rollback via UI button (`Rollback this import`) or `POST /api/chief/import/rollback` with `batchId`
- [ ] Confirm response contains `{ rolledBack: number, batchId }`
- [ ] Confirm previously imported rows are no longer visible in UI

### Re-Import

- [ ] Re-upload the same file and save approved rows again
- [ ] Confirm save succeeds (no 4xx/5xx)
- [ ] Confirm rows appear again in UI
- [ ] Confirm a new `batch_id` is returned

### Expected Result

- [ ] PASS: Rollback soft-deletes prior batch and re-import succeeds cleanly

### Evidence to Save

- [ ] Screenshot/API response of first import with `batch_id`
- [ ] Screenshot/API response of rollback result
- [ ] Screenshot/API response of second import with new `batch_id`

---

## Sign-Off

- [ ] Both tests passed
- [ ] Evidence saved under `/soc2-evidence/access-control/`
- [ ] Phase 2 test checklist items updated in `CHIEF_TODO_v2.md`

Reviewer Notes:

```
PASS/FAIL:
Date:
Reviewer:
Notes:
```
