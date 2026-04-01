# Module Gateway Contract (Phase 1 Freeze)

Date frozen: 2026-03-31
Applies to planned endpoints:
- `POST /api/modules/run`
- `GET /api/modules/status/:id`
- `GET /api/modules/catalog`

## Design Constraints (Locked)

1. Allowlist-only execution. No arbitrary shell commands.
2. Deterministic action mapping: `moduleId + actionId -> fixed command template`.
3. Unified job lifecycle: `queued | running | success | fail | timeout`.
4. Output controls: capture `stdout`/`stderr`, truncate previews for API/UI safety.
5. Backward-safe integration: additive only; no Penny route behavior changes.

## Module and Action Identifiers (Phase 1 Registry)

| Module ID | Action IDs (frozen namespace) |
| --- | --- |
| `ml-eia-petroleum-intel` | `ingest.all`, `ingest.source`, `ingest.api_update`, `pipeline.all`, `pipeline.product`, `export.report`, `export.json_only` |
| `ml-signal-stack-tncc` | `export.csv_all`, `export.csv_source`, `pipeline.source`, `pipeline.all`, `report.generate`, `package.output` |
| `mod-paperstack-pp` | `tools.list`, `tools.check`, `generate.pdf`, `generate.docx`, `convert.markdown`, `reverse.docx`, `inspect.pdf`, `scan.pdf` |
| `command-center` | `discover.modules`, `discover.tools`, `search.tools`, `schema.tool`, `route.tool_call`, `status.system`, `detail.module`, `classifications.list`, `dashboard.system`, `usage.tools` |

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
type ModuleJobStatus = 'queued' | 'running' | 'success' | 'fail' | 'timeout';

interface ModuleJobRecord {
  id: string;
  moduleId: string;
  actionId: string;
  status: ModuleJobStatus;
  command: string[];
  cwd: string;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  timeoutMs: number;
  exitCode: number | null;
  output: {
    stdoutPreview: string;
    stderrPreview: string;
    stdoutTruncated: boolean;
    stderrTruncated: boolean;
  };
  artifacts: Array<{
    kind: 'file' | 'report' | 'dataset';
    path: string;
    sizeBytes?: number;
    modifiedAt?: string;
  }>;
  error?: {
    code: string;
    message: string;
    detail?: unknown;
  };
}
```

## Error Codes (Frozen Set for Phase 2/3)

- `UNKNOWN_MODULE`
- `UNKNOWN_ACTION`
- `INVALID_ARGS`
- `MISSING_ENV`
- `PRECHECK_FAILED`
- `EXECUTION_FAILED`
- `EXECUTION_TIMEOUT`
- `INTERNAL_ERROR`

## Phase 1 Notes

1. `scripts/start-module.ps1` behavior is informative but not sufficient as-is for gateway orchestration because mixed-runtime modules (PaperStack) can be misclassified.
2. Command-center execution path is currently "route and record" rather than full external side-effect execution; gateway adapter should preserve this behavior and normalize output.
3. This contract is frozen for scaffold implementation in Phase 2; only additive fields are allowed in later phases.

## Phase 2 Endpoint Usage Examples

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
    "args": { "product": "diesel", "horizon": 30 },
    "dryRun": true,
    "correlationId": "phase2-smoke-001"
  }'
```

### Run (Execute)

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

### Status Poll

```bash
curl -X GET "http://localhost:3000/api/modules/status/<run_id>" \
  -H "Cookie: __session=<clerk-session-token>"
```

### Current Scaffold Allowlist (Phase 2)

- `ML-EIA-PETROLEUM-INTEL`: `tests`, `pipeline.product`, `export.skip_docx`
- `ML-SIGNAL-STACK-TNCC`: `pipeline.source`, `export.csv`
- `MOD-PAPERSTACK-PP`: `tools.list`, `tools.check`, `generate.pdf`, `generate.docx`
- `command-center`: `tests`, `build`
