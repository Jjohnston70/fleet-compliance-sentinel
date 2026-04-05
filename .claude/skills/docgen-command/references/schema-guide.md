# Parse Schema Guide

The parse engine is implemented in:
- `parse/parser.py`
- `parse/schemas/`

Current schema set:
- `vendor-invoice-basic` (`parse/schemas/vendor-invoice-basic.json`)
- `work-order-basic` (`parse/schemas/work-order-basic.json`)
- `purchase-order-basic` (`parse/schemas/purchase-order-basic.json`)

## Schema Format

Each schema JSON includes:
- `schema_id`
- `schema_name`
- `version`
- `description`
- `fields`

Each field includes:
- `name`
- `label`
- `required`
- `type` (`text`, `currency`, `date`, `integer`)
- `patterns` (regex list)

Pattern recommendation:
- Use a named capture group `(?P<value>...)` for deterministic extraction.
- Keep required fields specific first; broad fallbacks last.

## Parse Execution Flow

1. Select schema:
- If `schema_id` is provided, use it.
- If omitted and exactly one schema exists, auto-select.
- If omitted and multiple schemas exist, request explicit selection.

2. Extract text from supported document types:
- `.pdf` (via `pypdf`)
- `.docx` (via `python-docx`)
- `.txt`/`.md`/`.csv`/`.log`/`.json`

3. Extract fields:
- Evaluate patterns in order.
- Mark fields `MATCHED`/`UNMATCHED`.
- Score confidence by match quality and pattern order.

4. Export CSV artifact:
- Default output directory: `output/parsed/`
- Override with `PARSE_OUTPUT_DIR` env var or explicit `output_csv_path`.

## API Endpoints

- `GET /parse/schemas`
  - Returns available schemas.
- `POST /parse/documents`
  - Request:
    - `document_path` (required)
    - `schema_id` (optional)
    - `output_csv_path` (optional)
  - Response includes:
    - `fields` with confidence/status
    - `matched_count`, `total_fields`, `unmatched_required_fields`
    - `csv_artifact` metadata (`path`, `url`, `file_name`, `file_size_bytes`)
