# AI Output Rules

**CRITICAL**: AI assistants must follow these rules when generating files.

## The Rule of the Root (Non-Negotiable)

Only files required to run, build, or deploy the app may live in root.

A file belongs in root ONLY if it meets at least one of these criteria:
- **build**: Required for compilation (tsconfig.json, package.json)
- **runtime**: Required for app execution (next.config.js, .env.example)
- **deploy**: Required for deployment (vercel.json, Dockerfile)
- **package manager**: Required for dependencies (package-lock.json, yarn.lock)
- **framework config**: Required by framework (tailwind.config.js, postcss.config.js)

Everything else gets pushed down one level.

## Zone Definitions

### `/docs` - Durable Documentation
Move here if it's:
- Real, valuable, meant to be read later
- Shareable with stakeholders
- Part of the project record

Examples:
- DEPLOYMENT_GUIDE.md
- ARCHITECTURE.md
- COMPLIANCE-CHECKLIST.md
- API_DOCUMENTATION.md

### `/notes` - Iteration & AI Output
Move here if it:
- Helped you think, but isn't the final truth
- Is a draft or work-in-progress
- Is AI-generated exploration

Examples:
- CONTINUE_PROMPT.md
- research-findings.md
- todo.md
- improvement_plan_draft.txt

### `/tools` - Scripts & Helpers
Move here if it's:
- An execution tool
- Not app logic
- One-off automation

Examples:
- deploy.ps1
- setup-dev.sh
- clean-install.bat
- git-push.sh

### `/archive` - Frozen Experiments
Move here when:
- The decision is done
- The experiment is over
- The file should never be edited again

**Archive is read-only by policy.**

## AI Prompting Patterns

When generating content, specify the destination:

```
"Create the guide and place it in /docs following repo structure rules."
"Save this iteration to /notes/session-YYYY-MM-DD.md"
"Put the script in /tools/helper-name.ps1"
```

## Files That Stay in Root

```
package.json
package-lock.json
next.config.js
next-env.d.ts
tsconfig.json
tailwind.config.js
postcss.config.js
vercel.json
.next/
node_modules/
public/
src/
.env.example
.gitignore
README.md
```

## Enforcement

Before creating any file in root, ask:
1. Does it meet build/runtime/deploy/package/framework criteria?
2. If no, which zone does it belong in?

**No new root files without justification.**
