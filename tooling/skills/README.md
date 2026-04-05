# Client-Facing Skills (Gateway Surface)

Skills in this directory are exposed to clients through the Module Gateway and/or Pipeline Penny. Each skill folder contains the ATLAS 5-file pattern:

- `SKILL.md` -- Entry point with methodology
- `contract.json` -- Output enforcement (required sections, forbidden phrases, fail-closed mode)
- `registry.json` -- Discovery metadata (ID, version, tags, token limits)
- `triggers.json` -- Activation rules (trigger phrases, confidence thresholds)
- `system.prompt` -- (Optional) Governance rules and identity

## Activation Path

```
Skill (SKILL.md logic)
  --> Gateway wrapper (tooling/<module>-command/)
  --> Module Gateway registry (MODULE_GATEWAY_CONTRACT)
  --> Client surface (Penny / Tools UI / API)
```

## Gateway Module Mappings

| Skill | Gateway Module | Penny Enabled |
|-------|---------------|---------------|
| aro-assessment | readiness-command | Yes |
| bid-strategist | govcon-command | Yes |
| copywriter | email-command | No |
| data-privacy-coach | compliance-command | Yes |
| docgen-command | proposal-command | No |
| file-organizer | asset-command | No |
| financial-analyst | financial-command | Yes |
| grant-proposal-writer | govcon-command | Yes |
| grant-proposal-evaluation | govcon-command | Yes |
| invoice-organizer | financial-command | No |
| marketing-strategist | sales-command | No |
| proposal-generator | proposal-command | No |
| realty-command | realty-command | Yes |
| risk-manager | readiness-command | Yes |
| world-model-mapper | -- | Yes (operator + Penny) |

## Adding a New Client-Facing Skill

1. Build the skill with ATLAS pattern files (SKILL.md, contract.json, registry.json, triggers.json)
2. Add to this directory
3. Create a gateway wrapper in `tooling/<module>-command/`
4. Register the action in the Module Gateway contract
5. Update `skills-registry.json` in project root
6. Update the relevant skill-pack manifest in `.claude/skill-packs/`
