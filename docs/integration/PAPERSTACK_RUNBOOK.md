# PaperStack Gateway Runbook (Phase 4)

Date: 2026-03-31
Scope: Gateway invocation for `MOD-PAPERSTACK-PP`

## Preconditions

1. Start API locally (`npm run dev`) or use a runtime that has the full `tooling/MOD-PAPERSTACK-PP` module available.
2. Authenticate as Fleet Compliance org admin (module endpoints are admin-protected).
3. Install PaperStack dependencies:

```bash
cd tooling/MOD-PAPERSTACK-PP
python -m pip install -r requirements.txt
npm install
```

4. For OCR/inspection actions, install external binaries where needed:
   - Poppler (`pdftoppm`)
   - Tesseract (`tesseract`)

## Action Catalog

| Action ID | Purpose | Args |
| --- | --- | --- |
| `list` | List PaperStack tools and readiness | none |
| `check` | Check dependencies and environment | none |
| `generate` | Generate default flyer in one format | `format: pdf|docx` |
| `convert` | Convert Markdown to HTML | `inputPath: string(.md)`, `outputPath?: string(.html)`, `dark?: boolean` |
| `reverse` | Reverse DOCX into generator code | `inputPath: string(.docx)`, `mode?: js|python|pdf|python_pdf`, `outputPath?: string` |
| `inspect` | Launch text-PDF inspector | `inputPath: string(.pdf)`, `port?: number` |
| `scan` | Launch OCR scan inspector | `inputPath: string(.pdf)`, `port?: number`, `dpi?: 200|300|400`, `forceOcr?: boolean` |

Legacy aliases retained for compatibility:
- `tools.list`, `tools.check`, `generate.pdf`, `generate.docx`

## Path Safety Rules (Gateway-Enforced)

1. User-supplied paths are validated before command execution.
2. Paths must resolve inside `tooling/MOD-PAPERSTACK-PP`.
3. Traversal and path-jump attempts are rejected (`../`, out-of-root absolute targets).
4. Input extension checks are enforced:
   - `convert.inputPath` -> `.md`
   - `reverse.inputPath` -> `.docx`
   - `inspect.inputPath` / `scan.inputPath` -> `.pdf`
5. Unknown args are rejected (`VALIDATION_ERROR`).

## Artifact Metadata

For artifact-producing PaperStack actions, run status includes `artifacts[]` with:
- `kind`: `file`
- `path`: repository-relative file path
- `sizeBytes`: file size
- `modifiedAt`: ISO timestamp

Artifact capture is enabled for:
- `generate`, `generate.pdf`, `generate.docx`
- `convert`
- `reverse`

## Example API Calls

Generate PDF flyer:

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "MOD-PAPERSTACK-PP",
    "actionId": "generate",
    "args": { "format": "pdf" },
    "timeoutMs": 120000,
    "correlationId": "paperstack-generate-pdf-01"
  }'
```

Convert markdown to html:

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
    "correlationId": "paperstack-convert-01"
  }'
```

Reverse DOCX into python generator code:

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "MOD-PAPERSTACK-PP",
    "actionId": "reverse",
    "args": {
      "inputPath": "templates/sample.docx",
      "mode": "python",
      "outputPath": "output/sample_generator.py"
    },
    "timeoutMs": 180000,
    "correlationId": "paperstack-reverse-01"
  }'
```

Poll status:

```bash
curl -X GET "http://localhost:3000/api/modules/status/<run_id>" \
  -H "Cookie: __session=<clerk-session-token>"
```

## Known Limitations

1. `inspect` and `scan` launch Flask web servers designed for interactive local use; they are not ideal for serverless production execution.
2. OCR pathways require Poppler + Tesseract available in runtime PATH.
3. Large PDF or OCR runs may require higher timeout settings up to gateway max (`900000` ms).
4. Vercel serverless environments do not reliably execute local tooling modules; use local/self-hosted workers for module execution.

## Troubleshooting

1. `MODULE_NOT_FOUND`:
   - Verify `tooling/MOD-PAPERSTACK-PP` exists in runtime and gateway process has filesystem access.
2. `VALIDATION_ERROR` for path:
   - Ensure path is inside `MOD-PAPERSTACK-PP` and has required extension.
3. `EXEC_TIMEOUT` on inspect/scan:
   - These actions are long-running; use local operator workflows or increase `timeoutMs`.
4. Missing OCR dependencies:
   - Install Poppler/Tesseract and rerun `actionId: check`.
