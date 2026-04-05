# SpecKit System Rules

**For AI Assistants**: Read this file before executing any SpecKit command.

## Command Execution Order

Commands must be executed in sequence. Each command has prerequisites:

| Command | Prerequisites | Produces |
|---------|--------------|----------|
| `/speckit.constitution` | None | `.speckit/memory/constitution.md` |
| `/speckit.specify` | Constitution | `specs/###-feature/spec.md` |
| `/speckit.realty-security` | spec.md | Security requirements in spec |
| `/speckit.realty-compliance` | spec.md | Compliance requirements in spec |
| `/speckit.clarify` | spec.md | Updated spec.md |
| `/speckit.plan` | spec.md, constitution | `plan.md`, `research.md`, `data-model.md`, `contracts/` |
| `/speckit.tasks` | plan.md, spec.md | `tasks.md` |
| `/speckit.analyze` | spec.md, plan.md, tasks.md | Analysis report (no file write) |
| `/speckit.checklist` | spec.md | `checklists/*.md` |
| `/speckit.implement` | tasks.md, all checklists passed | Working code |

## File Locations

### SpecKit System Files (DO NOT MODIFY BY HAND)
```
.speckit/
├── memory/constitution.md       # Project principles
├── specs/###-feature/           # Feature-specific specs
│   ├── spec.md                  # Feature specification
│   ├── plan.md                  # Technical plan
│   ├── tasks.md                 # Task breakdown
│   ├── research.md              # Research findings
│   ├── data-model.md            # Entity definitions
│   ├── quickstart.md            # Integration scenarios
│   ├── contracts/               # API specs
│   └── checklists/              # Quality checklists
├── templates/                   # Document templates
├── scripts/                     # Automation scripts
└── commands/                    # Slash command definitions
```

### User-Managed Zones
```
docs/     → Durable documentation (guides, architecture)
notes/    → Iteration, AI drafts, thinking
tools/    → Scripts, helpers, automation
archive/  → Frozen experiments (read-only)
```

## Constitution Authority

The constitution is **non-negotiable** within the SpecKit workflow:

1. Constitution conflicts are automatically **CRITICAL** severity
2. Violations require adjustment of spec/plan/tasks, not the constitution
3. To change a principle, update constitution outside of other commands
4. All artifacts must pass constitution check before proceeding

## Script Execution

PowerShell scripts are in `.speckit/scripts/powershell/`:

```powershell
# Check prerequisites
.\.speckit\scripts\powershell\check-prerequisites.ps1 -Json

# With tasks requirement
.\.speckit\scripts\powershell\check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks

# Paths only (no validation)
.\.speckit\scripts\powershell\check-prerequisites.ps1 -PathsOnly

# Create new feature
.\.speckit\scripts\powershell\create-new-feature.ps1 -Json "Feature description"

# Setup plan
.\.speckit\scripts\powershell\setup-plan.ps1 -Json
```

## Branch Naming

Feature branches follow the pattern: `###-feature-name`

- `###` = Sequential number (001, 002, 003...)
- `feature-name` = 2-4 word slug from spec title

Examples:
- `001-user-authentication`
- `002-client-portal`
- `003-document-upload`

## Task Format

All tasks in `tasks.md` must follow this format:

```markdown
- [ ] T### [P?] [US#?] Description with exact file path
```

Components:
- `- [ ]` = Markdown checkbox (required)
- `T###` = Sequential task ID (required)
- `[P]` = Parallelizable marker (optional)
- `[US#]` = User story reference (required for story phases)
- Description with file path (required)

Examples:
```markdown
- [ ] T001 Create project structure per implementation plan
- [ ] T005 [P] Implement auth middleware in src/middleware/auth.py
- [ ] T012 [P] [US1] Create User model in src/models/user.py
```

## Checklist Format

Checklists test **requirements quality**, not implementation:

**WRONG** (tests implementation):
```markdown
- [ ] CHK001 Verify login page displays correctly
```

**CORRECT** (tests requirements):
```markdown
- [ ] CHK001 Are authentication requirements specified for all protected resources? [Coverage]
```

## Error Handling

If a command fails:
1. Read the error message
2. Check prerequisites are met
3. Run the prerequisite command if missing
4. Re-run the failed command

Common errors:
- "Feature directory not found" → Run `/speckit.specify` first
- "plan.md not found" → Run `/speckit.plan` first
- "tasks.md not found" → Run `/speckit.tasks` first
- "Constitution check failed" → Fix violations or justify in Complexity Tracking

## AI Behavior Rules

1. **Always read command definitions** before executing
2. **Never skip prerequisites** - commands depend on prior outputs
3. **Follow file location rules** - don't create files in wrong zones
4. **Preserve existing content** - update sections, don't overwrite files blindly
5. **Use absolute paths** in all file operations
6. **Check branch** before creating feature specs
