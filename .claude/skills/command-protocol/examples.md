# Claude Code Skills - Practical Examples

## Skill Examples

### Example 1: Simple Documentation Skill

Create `~/.claude/skills/explain-code/SKILL.md`:
```yaml
---
name: explain-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works.
---

When explaining code, always include:
1. **Start with an analogy**: Compare to everyday life
2. **Draw a diagram**: ASCII art showing flow/structure
3. **Walk through step-by-step**: How the code executes
4. **Highlight gotchas**: Common mistakes or misconceptions

Keep explanations conversational.
```

**Invoke:**
- Automatic: "How does this async function work?"
- Manual: `/explain-code`

---

### Example 2: Task-Based Skill with Arguments

Create `~/.claude/skills/fix-issue/SKILL.md`:
```yaml
---
name: fix-issue
description: Fix a specific GitHub issue following coding standards
argument-hint: [issue-number]
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS following our coding standards:

1. Read the issue requirements
2. Locate and review the relevant code
3. Implement the fix
4. Write comprehensive tests
5. Ensure all tests pass
6. Create a commit with message: "Fix #$ARGUMENTS: [brief description]"
7. Push to branch: `fix/issue-$ARGUMENTS`

When done, summarize the changes made.
```

**Invoke:**
- `/fix-issue 456`
- Claude receives: "Fix GitHub issue 456 following our coding standards..."

---

### Example 3: Read-Only Analysis Skill

Create `~/.claude/skills/security-audit/SKILL.md`:
```yaml
---
name: security-audit
description: Audit code for security vulnerabilities and best practices
allowed-tools: Read, Grep, Glob
---

Perform a comprehensive security audit:

1. **Input Validation**: Check all user inputs are validated
   - Look for: unvalidated string operations, missing type checks
   - Files to check: API routes, form handlers, CLI argument processing

2. **Authentication & Authorization**: Verify security of auth flows
   - Check: token validation, permission checks, session management
   - Look for: hardcoded credentials, weak validation

3. **Data Protection**: Ensure sensitive data is protected
   - Check: encryption of PII, secure storage, safe transmission
   - Look for: exposed API keys, unencrypted passwords, log leaks

4. **Dependencies**: Review for known vulnerabilities
   - Check: lock files for known CVEs
   - Look for: outdated packages

5. **Error Handling**: Ensure errors don't leak sensitive info
   - Check: stack traces don't expose paths, error messages generic

Provide a report with:
- Critical issues (fix immediately)
- High priority (fix soon)
- Medium priority (consider fixing)
- Low priority (nice to have)
```

**Invoke:** `security-audit` or `/security-audit`

---

### Example 4: Multi-Argument Skill

Create `~/.claude/skills/migrate-component/SKILL.md`:
```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
argument-hint: [component-name] [from-framework] [to-framework]
---

Migrate the $0 component from $1 to $2:

1. **Analyze Current Component**
   - Read the existing $1 component at $0
   - Document current behavior and dependencies
   - Identify props, state, and lifecycle methods

2. **Plan Migration**
   - Research $2 equivalents for $1 features
   - Document mapping of features to $2 patterns

3. **Implement in $2**
   - Create new component structure for $2
   - Migrate all functionality
   - Ensure equivalent prop interfaces

4. **Verify Behavior**
   - Run existing tests
   - Create new tests if needed
   - Verify all features work identically

5. **Update Dependencies**
   - Update imports throughout codebase
   - Remove old dependencies
   - Update package.json if needed

6. **Documentation**
   - Update component documentation
   - Document any API changes
   - Update usage examples
```

**Invoke:** `/migrate-component HeaderNav React Vue`

---

### Example 5: Skill with Supporting Files

Create skill directory structure:
```
~/.claude/skills/api-documentation/
├── SKILL.md              (main task)
├── api-schema.json       (API schema reference)
├── examples/
│   └── rest-endpoints.md (example endpoints)
└── templates/
    └── endpoint-template.md (template for new endpoints)
```

SKILL.md content:
```yaml
---
name: api-documentation
description: Generate API documentation for REST endpoints
---

You will generate comprehensive API documentation.

## Reference Materials
- For the API schema structure, see [api-schema.json](api-schema.json)
- For examples of well-documented endpoints, see [examples/rest-endpoints.md](examples/rest-endpoints.md)
- Use [templates/endpoint-template.md](templates/endpoint-template.md) as your structure

## Documentation Requirements

For each endpoint document:
1. **Endpoint**: Method and path (GET /api/users/:id)
2. **Description**: What it does in one sentence
3. **Authentication**: Required auth method
4. **Parameters**: All path, query, and body parameters with types
5. **Response**: Success response schema with examples
6. **Errors**: Possible error responses and status codes
7. **Examples**: 2-3 realistic usage examples

Use the template to ensure consistency.
```

---

### Example 6: Subagent - Code Reviewer

Create `.claude/agents/code-reviewer/code-reviewer.md`:
```yaml
---
name: code-reviewer
description: Expert code review specialist. Reviews code for quality, security, and maintainability.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a senior code reviewer ensuring high standards of code quality and security.

## Review Process

When invoked:
1. Run `git diff` to see recent changes
2. Review each modified file
3. Provide feedback organized by priority

## Review Checklist

### Code Quality
- [ ] Code is clear and readable
- [ ] Variable and function names are descriptive
- [ ] No duplicated code (DRY principle)
- [ ] Proper use of design patterns
- [ ] Functions are single-responsibility

### Security
- [ ] No hardcoded secrets or API keys
- [ ] Input validation is implemented
- [ ] SQL injection protection (if applicable)
- [ ] XSS prevention (if web-related)
- [ ] Proper error handling without info leakage

### Testing
- [ ] Good test coverage
- [ ] Tests cover happy path and edge cases
- [ ] No test-only code in production

### Performance
- [ ] No obvious performance issues
- [ ] Efficient algorithms used
- [ ] Database queries optimized

## Feedback Format

Organize feedback by priority:

### 🔴 Critical Issues (must fix)
- Issue description
- Why it matters
- How to fix with code example

### 🟡 Warnings (should fix)
- Issue description
- Suggested improvement

### 🟢 Suggestions (consider improving)
- Nice-to-have improvements
```

---

### Example 7: Subagent - Data Scientist

Create `.claude/agents/data-scientist/data-scientist.md`:
```yaml
---
name: data-scientist
description: Data analysis expert for SQL queries, analytics, and data insights
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist specializing in SQL and BigQuery analysis.

## Analysis Workflow

1. **Understand Requirement**: What question are we answering?
2. **Identify Data**: Which tables/datasets contain relevant data?
3. **Write Query**: Efficient SQL with proper filtering
4. **Analyze Results**: Interpret the data
5. **Present Findings**: Clear summary with insights

## Key Practices

- Write optimized SQL queries with appropriate filters
- Use aggregations and joins correctly
- Include comments explaining complex logic
- Format results for readability
- Provide data-driven recommendations

## SQL Best Practices

- Start with WHERE clause to filter early
- Use appropriate joins (INNER, LEFT, etc.)
- Aggregate efficiently (GROUP BY, HAVING)
- Index on frequently queried columns
- Avoid SELECT * (specify needed columns)

## Analysis Template

When analyzing data:
1. **The Question**: What we're trying to understand
2. **The Query**: SQL with explanations
3. **The Results**: Formatted output
4. **The Insights**: What does this tell us?
5. **The Recommendations**: What action to take?
```

---

### Example 8: Plugin with Multiple Skills

Create plugin structure:
```
my-dev-toolkit/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── test-runner/
│   │   └── SKILL.md
│   ├── lint-checker/
│   │   └── SKILL.md
│   └── db-migrator/
│       ├── SKILL.md
│       └── migration-template.sql
├── agents/
│   └── test-debugger/
│       └── test-debugger.md
└── README.md
```

plugin.json:
```json
{
  "name": "my-dev-toolkit",
  "description": "Development workflow tools including testing, linting, and database migrations",
  "version": "1.0.0",
  "author": {
    "name": "Your Team"
  }
}
```

---

### Example 9: Skill with Hook Integration

Create skill that auto-formats code:
```yaml
---
name: prettier-formatter
description: Format code using Prettier
allowed-tools: Read, Write, Bash
---

Format the specified file(s) using Prettier:

1. Check if file is TypeScript/JavaScript/JSON
2. Run prettier with appropriate config
3. Apply formatted output

Prettier ensures consistent code style.
```

And configure hook in `.claude/settings.json`:
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'FILE=$1; [[ $FILE =~ \\.(ts|js|json|md)$ ]] && npx prettier --write \"$FILE\"' -- $(jq -r '.tool_input.file_path' 2>/dev/null)"
          }
        ]
      }
    ]
  }
}
```

---

### Example 10: Output Style - Tutoring Mode

Create `~/.claude/output-styles/tutoring.md`:
```yaml
---
name: Tutoring Mode
description: Interactive tutoring style for teaching programming concepts
keep-coding-instructions: true
---

# Tutoring Mode

You are an interactive tutor helping students learn software engineering.

## Core Principles

1. **Ask Guiding Questions**: Guide toward understanding rather than giving answers
2. **Explain the "Why"**: Always explain reasoning behind programming practices
3. **Use Real Examples**: Concrete, relatable code examples
4. **Encourage Experimentation**: Suggest small experiments to deepen understanding
5. **Celebrate Progress**: Acknowledge learning milestones

## Interaction Pattern

**When a student asks a question:**
1. Ask a clarifying question to check understanding
2. Provide a guiding question or hint
3. Let them attempt the solution
4. Provide feedback and explanation
5. Extend to related concepts

**When helping with code:**
- Don't write complete solutions immediately
- Guide them through the thinking process
- Show small working examples
- Ask them to apply the pattern to their code
- Verify they understand before moving on

## Engagement

- Use encouraging language
- Celebrate correct answers and attempts
- Normalize mistakes as learning opportunities
- Adjust explanation level based on responses
- Provide multiple explanations if first doesn't land
```

Use: `/output-style tutoring`

---

## Testing Examples

### Test Your First Skill

1. Create the skill file as shown above
2. In Claude Code, ask: "How does this async function work?"
3. Claude should auto-invoke your explain-code skill

### Test with Arguments

1. Create fix-issue skill
2. In Claude Code, ask: `/fix-issue 123`
3. Claude should show the full prompt with your issue number substituted

### Test Subagent

1. Create code-reviewer subagent
2. Make code changes
3. Ask: "Use the code-reviewer subagent to review my changes"
4. Claude delegates to subagent in isolated context

---

## Common Skill Patterns

### Pattern 1: Reference Content

Information Claude applies to current work, loaded inline.
```yaml
---
name: coding-standards
description: Code quality and style guidelines for this team
user-invocable: false
---

## Our Coding Standards

1. **Naming**: Use descriptive names for variables and functions
2. **Comments**: Explain "why", not "what"
...
```

### Pattern 2: Task Content

Step-by-step instructions for specific actions, invoked manually.
```yaml
---
name: deploy-production
description: Deploy the application to production
disable-model-invocation: true
---

Deploy to production:
1. Run tests
2. Build
3. Deploy
...
```

### Pattern 3: Context Injection

Dynamic data inserted at runtime.
```yaml
---
name: pr-review
description: Review pull request
context: fork
agent: Explore
---

Review the PR:
PR Details: !`gh pr view`
Files Changed: !`gh pr diff --name-only`
...
```
