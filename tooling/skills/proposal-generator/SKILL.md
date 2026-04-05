---
name: proposal-generator
description: Normalize proposal requests and MAP notes into structured proposal-intake payloads with missing required fields and explicit API or SOP handoff for executable generation.
---

# Proposal Generator Intake

Use this skill when the user wants to generate a client proposal or extract proposal-ready inputs from MAP notes.

Do not generate the final `.docx` inside this skill. This skill prepares structured intake only, then hands off to executable paths:
- `POST /proposals/validate`
- `POST /proposals/generate`
- SOP command: `Run Client Proposal Generation`

## Use Cases

- User asks to create a proposal and provides partial client details.
- User shares MAP notes and asks to extract proposal fields.
- User asks what fields are missing before generating a proposal.
- User asks which template should be used for a service type.

## Output Format

Include these sections:
- `Intent`
- `Template Selection`
- `Intake Payload`
- `Missing Required Fields`
- `Validation Notes`
- `Execution Path`
- `Next Action`

`Intake Payload` should contain a JSON object with normalized fields for proposal API or SOP execution.

## References

- Template/service mapping: [references/template-mapping.md](references/template-mapping.md)
- Intake schema and required fields: [references/intake-schema.md](references/intake-schema.md)
