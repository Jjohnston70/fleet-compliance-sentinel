# SpecKit: Production-Grade AI Development Framework

**Version**: 1.0.0 | **Author**: True North Data Strategies | **License**: Proprietary

A spec-driven development system for production and compliance-grade projects. Built for teams that need audit trails, regulatory alignment, and predictable AI output.

## What This Is

SpecKit enforces a structured workflow where every feature goes through:

1. **Constitution** - Define project principles (your non-negotiables)
2. **Specification** - Document what you're building (no tech stack yet)
3. **Compliance/Security** - Inject domain-specific requirements (real estate, finance, etc.)
4. **Clarification** - Resolve ambiguities before planning
5. **Planning** - Create technical architecture and data models
6. **Tasks** - Generate dependency-ordered, executable task lists
7. **Analysis** - Cross-artifact consistency checks
8. **Implementation** - Execute tasks with checkpoints

## Quick Start

```bash
# 1. Initialize SpecKit in your project
specify init my-project --ai claude

# 2. Establish project principles
/speckit.constitution Create principles for code quality, testing, security...

# 3. Define what you're building (no tech stack)
/speckit.specify I want to build a client portal for real estate agents...

# 4. Clarify any ambiguities
/speckit.clarify

# 5. Add compliance requirements (if applicable)
/speckit.realty-compliance
/speckit.realty-security

# 6. Create technical plan (NOW you specify tech stack)
/speckit.plan Using Next.js 14, PostgreSQL, deployed on Vercel...

# 7. Generate task breakdown
/speckit.tasks

# 8. Validate everything aligns
/speckit.analyze

# 9. Execute implementation
/speckit.implement
```

## Repo Structure Rules

**Root stays boring.** Only runtime/build/deploy files live in root.

```
my-project/
├── .speckit/                    # SpecKit system (DO NOT MODIFY)
│   ├── memory/                  # Project constitution
│   ├── specs/                   # Feature specifications (auto-generated)
│   ├── templates/               # Document templates
│   ├── scripts/                 # Automation scripts
│   └── commands/                # Slash command definitions
├── docs/                        # Durable documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── ARCHITECTURE.md
│   └── COMPLIANCE-CHECKLIST.md
├── notes/                       # Iteration & AI output
│   ├── session-2025-01-15.md
│   └── research-findings.md
├── tools/                       # Scripts & helpers
│   ├── deploy.ps1
│   └── setup-dev.sh
├── archive/                     # Frozen experiments
├── src/                         # Your actual code
├── tests/                       # Test files
├── package.json                 # Runtime config
├── README.md                    # This file
└── .gitignore
```

## Available Commands

| Command | Description |
|---------|-------------|
| `/speckit.constitution` | Create/update project principles |
| `/speckit.specify` | Create feature specification from natural language |
| `/speckit.clarify` | Resolve ambiguities in spec |
| `/speckit.realty-compliance` | Inject real estate compliance requirements |
| `/speckit.realty-security` | Inject real estate security requirements |
| `/speckit.plan` | Generate technical implementation plan |
| `/speckit.tasks` | Generate task breakdown |
| `/speckit.analyze` | Cross-artifact consistency check |
| `/speckit.checklist` | Generate domain-specific quality checklists |
| `/speckit.implement` | Execute implementation plan |
| `/speckit.taskstoissues` | Convert tasks to GitHub issues |

## AI Output Rules

When prompting AI, specify where output goes:

```
"Create the document and place it in /docs following repo structure rules."
"Save iteration notes to /notes/session-YYYY-MM-DD.md"
"Put this script in /tools/helper-name.ps1"
```

**What goes where:**

| Content Type | Location | Example |
|--------------|----------|---------|
| Final documentation | `/docs` | DEPLOYMENT_GUIDE.md |
| Iteration/thinking | `/notes` | research-draft.md |
| Scripts/automation | `/tools` | deploy.ps1 |
| Frozen/deprecated | `/archive` | old-approach-v1/ |
| Runtime files | root | package.json |

## Workflow Diagram

```
/speckit.constitution
    ↓ defines governance, principles, mandatory rules
/speckit.specify
    ↓ creates feature spec (functional + non-functional)
/speckit.realty-security (optional)
    ↓ injects domain-specific security requirements
/speckit.realty-compliance (optional)
    ↓ injects regulatory requirements
/speckit.clarify
    ↓ resolves ambiguities, updates spec
/speckit.plan
    ↓ produces architecture, data model, contracts
/speckit.tasks
    ↓ generates actionable, dependency-ordered tasks
/speckit.analyze
    ↓ cross-artifact consistency + quality audit
/speckit.implement
    ↓ executes task plan to produce working solution
```

## Constitution Example

Your constitution defines non-negotiable rules for the project:

```markdown
## Core Principles

### I. Test-First Development
All features require tests written before implementation.
Red-Green-Refactor cycle strictly enforced.

### II. Security by Default
No plaintext credentials. All PII encrypted at rest.
GLBA/CPRA compliance mandatory for client data.

### III. Simplicity
Start with the simplest solution. YAGNI principles.
Complexity must be justified in PR description.
```

## For Real Estate Projects

SpecKit includes specialized commands for real estate automation:

- **`/speckit.realty-compliance`**: GLBA, FTC Safeguards, ESIGN/UETA, state retention laws
- **`/speckit.realty-security`**: PII protection, Drive DLP, signature audit trails

These inject mandatory requirements into your spec before planning.

## Support

- Documentation: `/docs` folder
- Issues: GitHub Issues
- Author: jacob@truenorthstrategyops.com
