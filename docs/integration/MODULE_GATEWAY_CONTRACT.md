# Module Gateway Contract (Phase 1 Freeze)

Date frozen: 2026-03-31
Applies to planned endpoints:
- `POST /api/modules/run`
- `GET /api/modules/status/:id`
- `GET /api/modules/catalog`
- `GET /api/modules/artifact?runId=<id>&path=<artifact_path>`

## Design Constraints (Locked)

1. Allowlist-only execution. No arbitrary shell commands.
2. Deterministic action mapping: `moduleId + actionId -> fixed command template`.
3. Unified job lifecycle: `queued | running | success | fail`.
4. Output controls: capture `stdout`/`stderr`, truncate previews for API/UI safety.
5. Backward-safe integration: additive only; no Penny route behavior changes.

## Module and Action Identifiers (Current Registry)

| Module ID | Action IDs (frozen namespace) |
| --- | --- |
| `ML-EIA-PETROLEUM-INTEL` | `tests`, `ingest.all`, `ingest.source`, `ingest.api_update`, `pipeline.product`, `pipeline.all`, `export.report`, `export.skip_docx`, `export.json_only` |
| `ML-SIGNAL-STACK-TNCC` | `pipeline.source`, `pipeline.all`, `export.csv`, `export.csv_all`, `export.csv_source`, `report.generate`, `package.output`, `workflow.delivery` |
| `MOD-PAPERSTACK-PP` | `list`, `check`, `generate`, `convert`, `reverse`, `inspect`, `scan`, `tools.list`, `tools.check`, `generate.pdf`, `generate.docx` |
| `command-center` | `startup.initialize`, `discover.modules`, `discover.tools`, `search.tools`, `schema.tool`, `route.tool_call`, `status.system`, `detail.module`, `classifications.list`, `dashboard.system`, `usage.tools`, `tests`, `build` |

## `POST /api/modules/run`

### Request Body

```json
{
  "moduleId": "ml-eia-petroleum-intel",
  "actionId": "pipeline.product",
  "args": {
    "product": "heating_oil",
    "horizon": 90
  },
  "requestedBy": "user_123",
  "requestId": "optional-client-idempotency-key"
}
```

### Validation Rules

1. `moduleId` must match registered module.
2. `actionId` must be in module allowlist.
3. `args` must pass action schema validation.
4. Unknown keys are rejected (fail closed).
5. For path-based actions (PaperStack), paths must be relative to approved roots and must pass traversal checks.

### Response (Accepted)

```json
{
  "ok": true,
  "job": {
    "id": "job_01J...",
    "moduleId": "ml-eia-petroleum-intel",
    "actionId": "pipeline.product",
    "status": "queued",
    "createdAt": "2026-03-31T23:59:59.000Z"
  }
}
```

### Response (Validation Error)

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_ARGS",
    "message": "horizon must be one of [30,60,90]"
  }
}
```

## `GET /api/modules/status/:id`

### Response (Running)

```json
{
  "ok": true,
  "job": {
    "id": "job_01J...",
    "moduleId": "ml-signal-stack-tncc",
    "actionId": "pipeline.source",
    "status": "running",
    "createdAt": "2026-03-31T23:59:59.000Z",
    "startedAt": "2026-04-01T00:00:02.000Z",
    "finishedAt": null,
    "exitCode": null,
    "timeoutMs": 300000,
    "output": {
      "stdoutPreview": "first N chars...",
      "stderrPreview": "",
      "stdoutTruncated": true,
      "stderrTruncated": false
    },
    "artifacts": []
  }
}
```

### Response (Completed)

```json
{
  "ok": true,
  "job": {
    "id": "job_01J...",
    "moduleId": "mod-paperstack-pp",
    "actionId": "generate.pdf",
    "status": "success",
    "createdAt": "2026-03-31T23:59:59.000Z",
    "startedAt": "2026-04-01T00:00:02.000Z",
    "finishedAt": "2026-04-01T00:00:05.000Z",
    "exitCode": 0,
    "timeoutMs": 120000,
    "output": {
      "stdoutPreview": "Generated file: output/Pipeline_Flyer.pdf",
      "stderrPreview": "",
      "stdoutTruncated": false,
      "stderrTruncated": false
    },
    "artifacts": [
      {
        "kind": "file",
        "path": "tooling/MOD-PAPERSTACK-PP/output/Pipeline_Flyer.pdf",
        "sizeBytes": 123456,
        "modifiedAt": "2026-04-01T00:00:05.000Z"
      }
    ]
  }
}
```

## `GET /api/modules/catalog`

### Response

```json
{
  "ok": true,
  "modules": [
    {
      "moduleId": "command-center",
      "displayName": "TNDS Command Center",
      "runtime": "node",
      "actions": [
        {
          "actionId": "discover.modules",
          "label": "Discover registered modules",
          "description": "Returns command-center registered module list",
          "argsSchema": {
            "type": "object",
            "properties": {}
          }
        }
      ]
    }
  ]
}
```

## Job Record Shape (Internal Contract)

```ts
type ModuleJobStatus = 'queued' | 'running' | 'success' | 'fail';

interface ModuleJobRecord {
  id: string;
  moduleId: string;
  actionId: string;
  status: ModuleJobStatus;
  command: string[];
  cwd: string;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  timeoutMs: number;
  exitCode: number | null;
  stdoutPreview: string;
  stderrPreview: string;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
  artifacts: Array<{
    kind: 'file';
    path: string;
    sizeBytes: number;
    modifiedAt: string;
  }>;
  error?: {
    code: string;
    message: string;
    detail?: unknown;
  };
}
```

## Error Codes (Current Implementation)

- `VALIDATION_ERROR`
- `MODULE_NOT_FOUND`
- `ACTION_NOT_ALLOWED`
- `MISSING_ENV`
- `EXEC_TIMEOUT`
- `EXEC_FAILED`
- `INTERNAL_ERROR`

## Phase 1 Notes

1. `scripts/start-module.ps1` behavior is informative but not sufficient as-is for gateway orchestration because mixed-runtime modules (PaperStack) can be misclassified.
2. Command-center execution path is currently "route and record" rather than full external side-effect execution; gateway adapter should preserve this behavior and normalize output.
3. This contract is frozen for scaffold implementation in Phase 2; only additive fields are allowed in later phases.

## Endpoint Usage Examples (Phase 2-4)

Note: these routes require a valid Clerk-authenticated org-admin session. For CLI calls, pass a valid `__session` cookie value from an authenticated browser session.

### Catalog

```bash
curl -X GET "http://localhost:3000/api/modules/catalog" \
  -H "Cookie: __session=<clerk-session-token>"
```

### Run (Dry Run Validation)

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "ML-EIA-PETROLEUM-INTEL",
    "actionId": "pipeline.product",
    "args": { "product": "diesel", "horizon": 30, "trainYears": 10 },
    "dryRun": true,
    "correlationId": "phase2-smoke-001"
  }'
```

### Run (Execute ML-EIA Ingest API Update)

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "ML-EIA-PETROLEUM-INTEL",
    "actionId": "ingest.api_update",
    "args": { "forceApi": false },
    "timeoutMs": 300000,
    "correlationId": "phase3-eia-api-update-001"
  }'
```

### Run (Execute ML-SIGNAL Pipeline All)

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "ML-SIGNAL-STACK-TNCC",
    "actionId": "pipeline.all",
    "args": { "skipSearch": true },
    "timeoutMs": 900000,
    "correlationId": "phase3-signal-all-001"
  }'
```

### Run (Execute ML-SIGNAL Report)

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "ML-SIGNAL-STACK-TNCC",
    "actionId": "report.generate",
    "args": { "source": "all" },
    "timeoutMs": 300000,
    "correlationId": "phase3-signal-report-001"
  }'
```

### Run (Execute PaperStack Convert)

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "MOD-PAPERSTACK-PP",
    "actionId": "convert",
    "args": {
      "inputPath": "README.md",
      "outputPath": "output/README_converted.html",
      "dark": true
    },
    "timeoutMs": 120000,
    "correlationId": "phase4-paperstack-convert-001"
  }'
```

### Run (Execute command-center baseline validation)

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "command-center",
    "actionId": "tests",
    "args": {},
    "timeoutMs": 180000
  }'
```

### Run (Execute command-center discovery)

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "command-center",
    "actionId": "discover.modules",
    "args": {},
    "correlationId": "phase5-cc-discover-modules-001"
  }'
```

### Run (Route command-center qualified tool call)

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
    "correlationId": "phase5-cc-route-tool-001"
  }'
```

### Status Poll

```bash
curl -X GET "http://localhost:3000/api/modules/status/<run_id>" \
  -H "Cookie: __session=<clerk-session-token>"
```

### Current Allowlist (Phase 5)

- `ML-EIA-PETROLEUM-INTEL`: `tests`, `ingest.all`, `ingest.source`, `ingest.api_update`, `pipeline.product`, `pipeline.all`, `export.report`, `export.skip_docx`, `export.json_only`
- `ML-SIGNAL-STACK-TNCC`: `pipeline.source`, `pipeline.all`, `export.csv`, `export.csv_all`, `export.csv_source`, `report.generate`, `package.output`, `workflow.delivery`
- `MOD-PAPERSTACK-PP`: `list`, `check`, `generate`, `convert`, `reverse`, `inspect`, `scan`, `tools.list`, `tools.check`, `generate.pdf`, `generate.docx`
- `command-center`: `startup.initialize`, `discover.modules`, `discover.tools`, `search.tools`, `schema.tool`, `route.tool_call`, `status.system`, `detail.module`, `classifications.list`, `dashboard.system`, `usage.tools`, `tests`, `build`

## Phase 4 Additions

1. PaperStack path arguments are validated to remain inside `tooling/MOD-PAPERSTACK-PP`; traversal and unsafe absolute path jumps are rejected.
2. Extension guards are enforced for path-bearing PaperStack actions:
   - `convert.inputPath`: `.md`
   - `reverse.inputPath`: `.docx`
   - `inspect.inputPath`/`scan.inputPath`: `.pdf`
3. Run status now includes PaperStack artifact metadata (`artifacts[]`) for generator/converter/reverse actions with path, size, and modified timestamp.

## Phase 5 Additions

1. `command-center` bridge actions now execute through an in-process adapter, preserving command-center discovery/routing semantics without shelling out.
2. `route.tool_call` and discovery/status actions are normalized into the gateway run shape:
   - success/failure mapped to `run.status`
   - handler `data` returned as `run.result`
   - bridge message/error surfaced via `stdoutPreview`/`stderrPreview`
3. `discover.tools` supports optional `moduleId` and `classification` filtering through gateway-side post-filtering.

## Phase 6 Additions

1. Operator UI path added: `/fleet-compliance/tools` (admin-only run controls).
2. UI flow uses existing module API endpoints (`/api/modules/catalog`, `/api/modules/run`, `/api/modules/status/:id`) without expanding privileged surface area.
3. Failed run hooks now emit:
   - structured server log event (`[module-gateway] run failed`)
   - optional webhook notification when `MODULE_GATEWAY_FAILURE_WEBHOOK_URL` is configured.

## Phase 7 Additions

1. Artifact retrieval endpoint added:
   - `GET /api/modules/artifact?runId=<id>&path=<artifact_path>`
   - supports browser-open for `.html` and download for ZIP/DOCX/other files.
2. ML-SIGNAL packaging now writes both ZIP and standalone HTML to the output directory and returns both as run artifacts.
3. New ML-SIGNAL one-click operator action:
   - `workflow.delivery` runs export -> pipeline -> report -> package in a single run.
