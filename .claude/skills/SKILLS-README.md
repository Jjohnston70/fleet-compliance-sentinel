---
title: "Skills"
type: readme
last_updated: 2026-03-05
---

# Skills

Claude and Cowork specialized capabilities organized as modular skill packs.

## Purpose

Each skill provides a specialized capability for document creation, sales processes, assessments, automation, or domain-specific work. Skills are self-contained and can be invoked independently.

## File Format and Structure

Each skill is a folder with a `SKILL.md` entry point file. All supporting resources are contained within the skill folder.

Structure:
```
10_SKILLS/
├── [skill-name]/
│   ├── SKILL.md (entry point, required)
│   ├── supporting-files/
│   └── resources/
├── [another-skill]/
│   └── SKILL.md
└── [skill-name]/
    └── SKILL.md
```

## Naming Conventions

- Skill folders: lowercase-kebab-case (example: `document-generator`, `sales-process-coach`)
- Entry point: `SKILL.md` (required in every skill folder)
- Supporting files: descriptive names reflecting their function

## SKILL.md Format

Entry point file that defines:
- Skill title and description
- Required inputs and parameters
- Execution instructions
- Output format
- Any dependencies or prerequisites

## Skill Development

Create new skills to encapsulate capabilities. Keep each skill focused and reusable. Include clear usage documentation in SKILL.md.
