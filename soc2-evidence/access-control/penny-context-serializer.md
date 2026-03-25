# Penny Org Context Serializer Evidence (Phase 5)

Date: 2026-03-25  
Source File: `src/lib/penny-context.ts`

## Implemented Controls

- Server-side function: `buildOrgContext(orgId: string): Promise<string>`
- Data source: Postgres via `loadChiefData(orgId)` (`chief_records` scoped by `org_id`)
- Driver anonymization: output uses `Driver ID` only, never driver names
- Client isolation: context built in server API route only (`src/app/api/penny/query/route.ts`)
- Size control: context trimmed to max `8000` characters (~2000 tokens)
- Truncation behavior: when oversized, oldest entries are removed first
- Empty-org behavior: returns empty string when no org data exists

## Sample Serializer Output (captured)

Command run:

```powershell
$env:DOTENV_CONFIG_PATH='.env.local'
npx tsx -r dotenv/config -  # script calls buildOrgContext for first org
```

Output excerpt:

```text
--- OPERATOR FLEET DATA ---
DRIVERS (0 total):
- None

ASSETS (4 total):
- Unit: 43585 | Type: Vehicle | Status: Active | Last Inspection: Unknown
- Unit: ORGA-ISO-001 | Type: Vehicle | Status: Active | Last Inspection: Unknown
...
--- END OPERATOR DATA ---
```

## Empty Org Verification

Command result:

```text
EMPTY_CONTEXT yes
```

## Org-Specific Medical Expiry Query Check

FastAPI local query test result (with injected org context and `X-Org-Id` header):

```text
STATUS 200
PROVIDER org_context_policy
ANSWER Drivers with medical cards expiring within 60 days:
- Driver D001: 2026-03-01 (24 days overdue)
```

## Org Isolation Serializer Check

Two-org context comparison result:

```text
A_HAS_A_ASSET true
A_HAS_B_ASSET false
B_HAS_B_ASSET true
B_HAS_A_ASSET false
```
