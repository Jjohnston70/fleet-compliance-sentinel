# command-center Bridge Runbook (Phase 5)

Date: 2026-03-31  
Scope: Gateway bridge invocation for `command-center` discovery/routing actions

## Preconditions

1. Module gateway endpoints are deployed (`/api/modules/run`, `/api/modules/status/:id`, `/api/modules/catalog`).
2. Caller is authenticated as Fleet Compliance org admin (module gateway routes are admin-protected).
3. `tooling/command-center/dist/src/tools.js` exists in the runtime image.
4. Optional but recommended: run command-center build before local testing:

```bash
cd tooling/command-center
npm install
npm run build
```

## Actions

| Action ID | Purpose | Args |
| --- | --- | --- |
| `startup.initialize` | Initialize command-center discovery registry from manifest | none |
| `discover.modules` | List registered modules with metadata/health | none |
| `discover.tools` | List tools across registered modules | `moduleId?: string`, `classification?: string` |
| `search.tools` | Keyword search over command-center tool surface | `query: string`, `moduleId?: string`, `classification?: string` |
| `schema.tool` | Fetch schema for one qualified tool | `qualifiedName: string` |
| `route.tool_call` | Route one qualified tool call through command-center | `qualifiedName: string`, `parameters?: object` |
| `status.system` | Return command-center health summary | none |
| `detail.module` | Return a module-level detail payload | `moduleId: string` |
| `classifications.list` | Return known module classifications | none |
| `dashboard.system` | Return aggregate command-center dashboard metrics | none |
| `usage.tools` | Return tool invocation usage report | none |
| `tests` | Run command-center Vitest suite (process execution path) | none |
| `build` | Run command-center build (process execution path) | none |

## Example API Payloads

Initialize discovery:

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "command-center",
    "actionId": "startup.initialize",
    "args": {},
    "correlationId": "cc-init-01"
  }'
```

Discover tools by classification:

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "command-center",
    "actionId": "discover.tools",
    "args": {
      "classification": "Operations"
    },
    "correlationId": "cc-discover-tools-ops-01"
  }'
```

Route a qualified tool call:

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "command-center",
    "actionId": "route.tool_call",
    "args": {
      "qualifiedName": "asset-command.list_assets",
      "parameters": {
        "page": 1,
        "pageSize": 25
      }
    },
    "correlationId": "cc-route-asset-list-01"
  }'
```

Poll status:

```bash
curl -X GET "http://localhost:3000/api/modules/status/<run_id>" \
  -H "Cookie: __session=<clerk-session-token>"
```

## Response Notes

1. Bridge actions execute in-process (no external shell spawn).
2. Run status includes normalized fields from command-center handler output:
   - `run.status`: `success` or `fail`
   - `run.result`: raw `data` payload from command-center handler (if present)
   - `run.stdoutPreview`: bridge message summary
   - `run.stderrPreview`: bridge error text (if present)
3. `route.tool_call` confirms routing/invocation metadata; it does not deep-execute downstream business side effects inside command-center itself.
4. Bridge failure responses may include `errorCode` (`VALIDATION_ERROR`, `PERMISSION_DENIED`, `MODULE_NOT_FOUND`, etc.), which the gateway uses to classify retryable vs non-retryable failures.

## Retry and Escalation

1. Module gateway retries retryable bridge/process failures up to a hard cap of 3 attempts.
2. Retry metadata is attached to run status payload:
   - `attemptCount`
   - `maxAttempts`
   - `retryHistory[]` (attempt status, duration, error code/message)
3. When retryable failures still fail at cap, the run is marked with:
   - `error.code = RETRY_EXHAUSTED`
   - `escalation.reason = retry_exhausted`
4. Escalations are persisted in `module_gateway_retry_escalations` for operator handoff.

## Troubleshooting

`command-center bridge runtime is not available`:
1. Ensure `tooling/command-center/dist/src/tools.js` is present.
2. Run `npm run build` in `tooling/command-center`.

`Handler not found for command-center tool`:
1. Confirm `tooling/command-center/src/tools.ts` exports the expected tool in `toolHandlers`.
2. Verify action ID maps to the intended handler in `src/lib/modules-gateway/command-center-bridge.ts`.

Validation error (`args.<field> is required` or enum mismatch):
1. Pull current action schema from `GET /api/modules/catalog`.
2. Use only allowlisted action IDs and arguments.
