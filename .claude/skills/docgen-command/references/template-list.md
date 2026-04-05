# Docgen Template List

Canonical template IDs and routing targets used by proposal generation.

| Template ID | Service | Price Range | Payment |
|---|---|---|---|
| `tnds-command-center` | Command Center Build | $2,500–5,000 | 50/50 or 40/30/30 |
| `tnds-battle-rhythm` | Battle Rhythm Install | $2,000–4,000 | 50/50 or 40/30/30 |
| `tnds-command-partner` | Command Partner | $1,000–2,000/mo | Monthly |
| `tnds-workspace-automation` | Workspace Automation | $1,500–4,000 | 50/50 or 40/30/30 |
| `tnds-custom-module` | Custom Module Build | $1,500–5,000 | 50/50 or 40/30/30 |
| `legacy-consulting` | Consulting / Advisory | $2,000–10,000+ | 50/50 or 40/30/30 |
| `legacy-data-analytics` | Data Analytics | $2,000–6,000 | 50/50 or 40/30/30 |
| `legacy-brand-design` | Brand & Design | $1,500–5,000 | 50/50 or 40/30/30 |
| `legacy-strategic-planning` | Strategic Planning | $3,000–8,000 | 50/50 or 40/30/30 |
| `legacy-web-development` | Web Development | $3,000–10,000+ | 50/50 or 40/30/30 |

## Routing Notes

- Explicit `template_id` wins over inferred routing.
- If no explicit `template_id`, service-type keyword routing resolves the template.
- If routing is ambiguous, backend fallback defaults to `tnds-custom-module`.
