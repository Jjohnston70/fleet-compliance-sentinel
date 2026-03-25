# Two-Org Isolation Test Results

Date: 2026-03-25
Owner: Codex automation

## Test Scope

Validated org-level data isolation for Chief multi-tenant scoping using two Clerk organizations and org-scoped `chief_records` queries.

## Clerk Test Organizations

- Org A: `org_3BRjuemrfCkz36K31xEJhx2nUV9` (`Chief Isolation Org A 1774458999176`)
- Org B: `org_3BRjucb99fBnsia9IqDNquFkB9z` (`Chief Isolation Org B 1774458999176`)

## Procedure

1. Created two Clerk orgs via Clerk Admin API.
2. Called `ensureOrgProvisioned` for both org IDs.
3. Inserted org-scoped records into `chief_records`:
   - Org A: asset `A-CLERK-001`
   - Org B: asset `B-CLERK-001`
4. Loaded data through `loadChiefData(orgId)` for each org.
5. Verified no cross-org visibility.
6. Set Org A `trial_ends_at` to yesterday and verified `getOrgPlan` blocks access.
7. Updated Org B onboarding metadata and set `onboarding_complete = true`.
8. Loaded `org_default` to ensure legacy access path remains valid.

## Result Snapshot

```json
{
  "orgA": "org_3BRjuemrfCkz36K31xEJhx2nUV9",
  "orgB": "org_3BRjucb99fBnsia9IqDNquFkB9z",
  "isolation": {
    "orgA_has_A_asset": true,
    "orgA_has_B_asset": false,
    "orgB_has_B_asset": true,
    "orgB_has_A_asset": false,
    "orgA_asset_count": 1,
    "orgB_asset_count": 1
  },
  "trial_gate": {
    "plan": "trial",
    "isTrialActive": false,
    "trialEndsAt": "2026-03-24T17:17:13.000Z",
    "isActive": false
  },
  "onboarding": {
    "orgB_onboarding_complete": true,
    "orgB_metadata": {
      "fleetSize": "12",
      "primaryContact": "Org B Contact",
      "primaryDotConcern": "Permit renewals"
    }
  },
  "org_default_access": {
    "accessible": true,
    "asset_count": 0
  }
}
```

## Conclusion

- Isolation check passed: neither org could read the other org’s imported records.
- Trial expiration gate check passed for Org A.
- Onboarding completion + metadata persistence check passed for Org B.
- Legacy `org_default` access path remains readable (no breakage).

