# Proposal Template Mapping

Use these template IDs when explicit routing is needed.

## TNDS Templates

- `tnds-command-center`: Command Center Build
- `tnds-battle-rhythm`: Battle Rhythm Install
- `tnds-command-partner`: Command Partner
- `tnds-workspace-automation`: Workspace Automation
- `tnds-custom-module`: Custom Command Module

## Legacy Templates

- `legacy-consulting`: Consulting Engagement
- `legacy-data-analytics`: Data Analytics Build
- `legacy-brand-design`: Brand and Design
- `legacy-strategic-planning`: Strategic Planning
- `legacy-web-development`: Web Development

## Service Type Routing Notes

- Explicit `template_id` takes priority.
- If no `template_id`, route from `SERVICE_TYPE`.
- If still unknown, default fallback is `tnds-custom-module`.

## Common Service Type Examples

- "Command Center Build" -> `tnds-command-center`
- "Battle Rhythm Install" -> `tnds-battle-rhythm`
- "Command Partner" -> `tnds-command-partner`
- "Workspace Automation" -> `tnds-workspace-automation`
- "Analytics" -> `legacy-data-analytics`
- "Strategic Planning" -> `legacy-strategic-planning`
