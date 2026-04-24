# Repo Agent Context

## Purpose
Public-facing Fleet-Compliance Sentinel repository focused on architecture, product surface, and safe demo workflows.

## Non-negotiables
- Never commit secrets, tokens, credentials, or local `.env` files.
- Never include real client data, names, or operational identifiers.
- Keep docs direct and operator-focused.

## Safe contribution defaults
- Prefer synthetic/demo records in examples and tests.
- Use relative paths in docs.
- Keep SOC2 evidence and internal operational artifacts out of public commits unless explicitly sanitized.

## Release rule
If any secret scan hit or client-identifying artifact exists, stop publish and remediate before push.
