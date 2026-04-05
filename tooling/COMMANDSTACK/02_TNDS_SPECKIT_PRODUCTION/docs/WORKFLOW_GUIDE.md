# SpecKit Workflow Guide

Complete step-by-step guide for using SpecKit in production projects.

## Overview

SpecKit enforces a structured development workflow:

```
Constitution → Specify → [Compliance] → Clarify → Plan → Tasks → Analyze → Implement
```

Each step builds on the previous. Skipping steps creates downstream problems.

## Step 1: Constitution

**Command**: `/speckit.constitution`

**Purpose**: Define project principles that govern all decisions.

**When to Use**:
- Starting a new project
- Changing project direction
- Adding new compliance requirements

**Input**:
```
/speckit.constitution Create principles focused on:
- Security requirements (encryption, access control)
- Compliance needs (GLBA, HIPAA, etc.)
- Testing standards (TDD, coverage targets)
- Code quality (simplicity, documentation)
- Performance requirements (response times, scale)
```

**Output**: `.speckit/memory/constitution.md`

**Tips**:
- Be specific: "All PII encrypted at rest" not "secure data"
- Include rationale: why does this principle exist?
- Limit to 5-7 principles (more becomes unenforceable)

---

## Step 2: Specification

**Command**: `/speckit.specify`

**Purpose**: Document WHAT you're building and WHY. No tech stack yet.

**When to Use**:
- Starting a new feature
- Documenting requirements for planning

**Input**:
```
/speckit.specify I want to build a client portal where real estate agents can:
- Upload transaction documents
- Share files securely with buyers and sellers
- Track document signatures
- Generate compliance reports

The primary users are agents who are not tech-savvy. They work from tablets at showings.
Key concern is handling sensitive financial documents (GLBA compliance).
```

**Output**: `specs/###-feature-name/spec.md`

**Tips**:
- Focus on user value, not implementation
- Include user personas ("agents who are not tech-savvy")
- Mention constraints ("mobile-first", "GLBA compliant")
- Don't mention frameworks, databases, or tech choices

---

## Step 3: Compliance & Security (Optional)

**Commands**: `/speckit.realty-compliance`, `/speckit.realty-security`

**Purpose**: Inject domain-specific requirements into the spec.

**When to Use**:
- Real estate projects
- Any project with regulatory requirements

**Input**:
```
/speckit.realty-compliance
```

**Output**: Updated `spec.md` with compliance requirements section

**What Gets Added**:
- GLBA requirements for financial data
- ESIGN/UETA requirements for signatures
- State retention requirements
- PII handling requirements
- Audit trail requirements

---

## Step 4: Clarification

**Command**: `/speckit.clarify`

**Purpose**: Resolve ambiguities before planning.

**When to Use**:
- After `/speckit.specify`
- Before `/speckit.plan`
- When spec has [NEEDS CLARIFICATION] markers

**Input**:
```
/speckit.clarify
```

**Process**:
1. AI scans spec for ambiguities
2. Asks up to 5 targeted questions
3. Records answers in spec.md under `## Clarifications`
4. Updates relevant sections with clarified details

**Tips**:
- Answer concisely (options or short phrases)
- If you're unsure, say "defer to planning"
- Run again if major clarifications needed

---

## Step 5: Planning

**Command**: `/speckit.plan`

**Purpose**: Create technical architecture. NOW you specify tech stack.

**When to Use**:
- After spec is clarified
- When ready to make technical decisions

**Input**:
```
/speckit.plan Using Next.js 14 with TypeScript, PostgreSQL database,
deployed on Vercel. Use Tailwind for styling, shadcn/ui for components.
Authentication via Clerk. File storage on Google Drive via API.
```

**Output**:
- `plan.md` - Technical implementation plan
- `research.md` - Research findings
- `data-model.md` - Entity definitions
- `contracts/` - API specifications
- `quickstart.md` - Integration scenarios

**Tips**:
- Be specific about versions (Next.js 14, not just "Next.js")
- Include deployment target (Vercel, Railway, etc.)
- Mention key integrations (Google Drive, Clerk, etc.)

---

## Step 6: Task Generation

**Command**: `/speckit.tasks`

**Purpose**: Generate executable task breakdown.

**When to Use**:
- After plan is complete
- Before implementation

**Input**:
```
/speckit.tasks
```

**Output**: `tasks.md` with:
- Setup phase (project initialization)
- Foundational phase (blocking prerequisites)
- User story phases (one per story, in priority order)
- Polish phase (cross-cutting concerns)

**Task Format**:
```markdown
- [ ] T001 Create project structure per implementation plan
- [ ] T005 [P] Implement auth middleware in src/middleware/auth.py
- [ ] T012 [P] [US1] Create User model in src/models/user.py
```

---

## Step 7: Analysis

**Command**: `/speckit.analyze`

**Purpose**: Cross-artifact consistency check before implementation.

**When to Use**:
- After `/speckit.tasks`
- Before `/speckit.implement`

**Input**:
```
/speckit.analyze
```

**Output**: Analysis report (displayed, not saved) with:
- Duplication findings
- Ambiguity findings
- Coverage gaps
- Constitution violations
- Recommendations

**Severity Levels**:
- **CRITICAL**: Blocks implementation
- **HIGH**: Should fix before implementing
- **MEDIUM**: Fix during polish
- **LOW**: Nice to have

---

## Step 8: Checklists (Optional)

**Command**: `/speckit.checklist`

**Purpose**: Generate domain-specific quality checklists.

**When to Use**:
- Before implementation for quality gates
- For specific concerns (security, UX, API design)

**Input**:
```
/speckit.checklist Create a security checklist for the document upload feature
```

**Output**: `checklists/security.md`

**Important**: Checklists test REQUIREMENTS QUALITY, not implementation:
- WRONG: "Verify file uploads work"
- RIGHT: "Are file size limits specified in requirements?"

---

## Step 9: Implementation

**Command**: `/speckit.implement`

**Purpose**: Execute the task plan.

**When to Use**:
- After all checklists pass
- After analysis issues resolved

**Input**:
```
/speckit.implement
```

**Process**:
1. Checks all checklists are complete
2. Loads implementation context
3. Creates/verifies ignore files
4. Executes tasks phase by phase
5. Reports progress and errors

**Tips**:
- Commit after each phase
- Run tests after each user story completes
- Document any deviations from plan

---

## Workflow Decision Tree

```
Starting new project?
    → /speckit.constitution

Adding new feature?
    → /speckit.specify

Spec has ambiguities?
    → /speckit.clarify

Need compliance requirements?
    → /speckit.realty-compliance
    → /speckit.realty-security

Ready to pick tech stack?
    → /speckit.plan

Need task breakdown?
    → /speckit.tasks

Want quality gates?
    → /speckit.checklist

Ready to verify alignment?
    → /speckit.analyze

Ready to build?
    → /speckit.implement
```

---

## Common Issues

### "Feature directory not found"
Run `/speckit.specify` first to create the feature structure.

### "plan.md not found"
Run `/speckit.plan` first to create the implementation plan.

### "Constitution check failed"
Either fix the violation or justify it in the Complexity Tracking section.

### "Checklist incomplete"
Complete all checklist items or explicitly override with "proceed anyway".

### Branch naming conflicts
SpecKit auto-numbers branches. If conflict, it increments automatically.
