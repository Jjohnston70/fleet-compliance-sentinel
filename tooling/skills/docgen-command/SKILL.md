---
name: docgen-command
description: Execute document operations for True North Data Strategies. Generates TNDS-branded proposals (.docx + PDF) using the proposal engine, parses incoming vendor documents using schema matching, and lists available document templates. Use for direct generation requests, parse-document demos, and template discovery.
---

# docgen-command

docgen-command is the execution layer for TNDS document operations inside Pipeline Penny.

It runs four operations: generate proposals, parse vendor documents, export PDF, and list available templates. It does not handle intake normalization — that is proposal-generator's job. When proposal-generator produces a validated payload, docgen-command executes it.

## Relationship to proposal-generator

| Skill | Responsibility |
|---|---|
| `proposal-generator` | Intake, normalization, MAP note extraction, field validation, payload prep |
| `docgen-command` | Execution — generate the .docx, run the parse engine, export PDF, list templates |

If the user sends raw MAP notes or partial client data, route to `proposal-generator` first. If the user sends a validated payload or a direct generation command with complete data, execute here.

## Use Cases

- User provides complete client data and asks to generate a proposal.
- User uploads a vendor document and asks to extract structured data.
- User asks what proposal templates are available.
- User asks to export an existing .docx to PDF.
- Direction Protocol MAP session hands off a validated payload for proposal generation.

## Supported Operations

### GENERATE_PROPOSAL

Generate a TNDS-branded .docx proposal using the proposal engine.

Requires: `CLIENT_NAME`, `CLIENT_COMPANY`, `SERVICE_TYPE`, `TOTAL_INVESTMENT`, `PROJECT_TIMELINE`, `SCOPE_SUMMARY`

Optional: `CLIENT_TITLE`, `CLIENT_INDUSTRY`, `CURRENT_SITUATION`, `PAIN_POINTS`, `DELIVERABLES_LIST`, `MILESTONES`, `export_pdf`

Auto-generated: `PROPOSAL_NUMBER`, `PROPOSAL_DATE`, `VALID_UNTIL`, `PAYMENT_STRUCTURE`, `PAYMENT_DEPOSIT`, `PAYMENT_FINAL`

Output sections required:
- `Intent`
- `Template Selected`
- `Payment Structure`
- `Generated File`
- `Next Action`

### PARSE_DOCUMENT

Extract structured field data from a PDF or DOCX using a vendor schema.

Requires: uploaded document, schema name (or auto-detect from available schemas)

Output sections required:
- `Intent`
- `Schema Used`
- `Fields Matched`
- `Unmatched Required Fields` (if any)
- `Download`
- `Next Action`

### EXPORT_PDF

Convert an existing .docx to PDF using LibreOffice headless.

Note: Requires the local docgen-render pipeline. Not available in Claude's cloud runtime. If running locally, call `generate_proposal(export_pdf=True)` directly.

### LIST_TEMPLATES

List all available proposal templates with service type, price range, and payment structure.

Output sections required:
- `Intent`
- `Template List`
- `Next Action`

## Output Format

Every response must include `Intent` and `Next Action` sections. Operation-specific required sections are listed above.

`Intent` must state which operation was executed and why.
`Next Action` must be a concrete, single sentence telling the user exactly what to do next.

## Engine Reference

Proposal engine: `knowledge/agent/proposals/tnds_proposal_engine.py`
Proposal API endpoint: `POST /proposals/generate` in `knowledge/agent/api.py`
Parse engine: `parse/parser.py`
Schema library: `parse/schemas/`
Demo app: `demo/app.py` (localhost:8501)

## References

Engine API and parameters: [references/engine-api.md](references/engine-api.md)
Template list and routing: [references/template-list.md](references/template-list.md)
Schema library and tuning: [references/schema-guide.md](references/schema-guide.md)
