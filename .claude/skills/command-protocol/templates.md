# Claude Code Skills - Templates

## Quick-Start Templates

### Skill Template - Basic
```yaml
---
name: my-skill
description: What this skill does and when to use it
---

## Overview
Brief description of what the skill accomplishes.

## Instructions
Step-by-step instructions for Claude to follow:

1. First step
2. Second step
3. Final step

## Important Notes
- Any special considerations
- Tools needed
- Prerequisites
```

---

### Skill Template - With Arguments
```yaml
---
name: template-skill
description: Skill that accepts arguments
argument-hint: [argument-name]
---

Use the following argument: $ARGUMENTS

## Process
1. Take action based on $ARGUMENTS
2. Complete the task
3. Report results
```

---

### Skill Template - Task-Based (Manual Only)
```yaml
---
name: template-task
description: Manual task you invoke with /template-task
disable-model-invocation: true
---

## Task Steps

1. **Preparation**
   - Setup necessary tools
   - Verify prerequisites

2. **Execution**
   - Main task steps here

3. **Validation**
   - Verify task completed
   - Test results

4. **Cleanup**
   - Any cleanup needed
```

---

### Skill Template - Read-Only
```yaml
---
name: template-analysis
description: Analyze without making changes
allowed-tools: Read, Grep, Glob
---

## Analysis Framework

1. **Gather Information**
   - Search for relevant files
   - Extract key data

2. **Analyze**
   - Identify patterns
   - Find issues

3. **Report**
   - Summarize findings
   - Prioritize issues
```

---

### Skill Template - Subagent-Based
```yaml
---
name: template-research
description: Research topic deeply in isolated context
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:

1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
4. Identify related components

Report your findings clearly.
```

---

### Subagent Template
```yaml
---
name: my-agent
description: What this agent specializes in. Use proactively for X tasks.
tools: Read, Grep, Bash
model: sonnet
---

You are a specialized agent for [specific domain].

## Your Role

[Description of what you do]

## Workflow

When invoked:
1. [First step]
2. [Second step]
3. [Final step]

## Key Principles

- [Important principle 1]
- [Important principle 2]
- [Important principle 3]
```

---

### Hook Template - PreToolUse (Blocking)
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/validate-bash-command.sh"
          }
        ]
      }
    ]
  }
}
```

Validation script:
```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Your validation logic here
if [[ $COMMAND == *"rm -rf"* ]]; then
  echo "Blocked: Dangerous command not allowed" >&2
  exit 2  # Exit 2 blocks the operation
fi

exit 0  # Exit 0 allows
```

---

### Hook Template - PostToolUse (Logging)
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '\"\\(.tool_name) executed at $(date)\"' >> ~/.claude/command-log.txt"
          }
        ]
      }
    ]
  }
}
```

---

### Plugin Template

**Directory structure:**
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── my-skill/
│       └── SKILL.md
├── agents/
│   └── my-agent/
│       └── my-agent.md
├── README.md
└── LICENSE
```

plugin.json template:
```json
{
  "name": "my-plugin",
  "description": "Brief description of what this plugin does",
  "version": "1.0.0",
  "author": {
    "name": "Your Name",
    "email": "your@email.com"
  },
  "homepage": "https://github.com/yourusername/my-plugin",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/my-plugin.git"
  },
  "license": "MIT"
}
```

---

### Output Style Template

Create at: `~/.claude/output-styles/my-style.md`
```yaml
---
name: My Custom Style
description: Description of what this style does
keep-coding-instructions: true
---

# My Custom Style

[Your custom system prompt instructions here]

## Key Behaviors

[Define how the assistant should behave in this style]

## Response Format

[Specify how responses should be formatted]

## Tone and Voice

[Describe the tone - professional, casual, educational, etc.]
```

---

### Settings Template

Create/edit `.claude/settings.json`:
```json
{
  "model": "sonnet",
  "outputStyle": "default",
  "permissions": {
    "allow": [],
    "deny": []
  },
  "hooks": {
    "PreToolUse": [],
    "PostToolUse": []
  },
  "env": {},
  "mcpServers": {},
  "enabledPlugins": []
}
```

---

### CLAUDE.md Companion Template

Create in project root: `CLAUDE.md`
```markdown
# Project Context

## Overview
[What this project is about]

## Key Files
- src/main.ts - Entry point
- src/lib/ - Core libraries

## Important Guidelines
- [Development guideline 1]
- [Development guideline 2]

## Active Skills
- [skill-name] - What it does

## Active Subagents
- [agent-name] - Specializes in X

## Important Commands
- `/deploy` - Deploy to production
- `/test-all` - Run full test suite

## Do's and Don'ts
✅ DO: [Do this]
❌ DON'T: [Don't do this]
```

---

## TNDS-Specific Templates

### Command Module Skill Template
```yaml
---
name: [module]-command
description: [Module description] for client implementations. Use when setting up [module type] functionality.
disable-model-invocation: true
---

# [Module Name] Command Module

## Purpose
[What this module does]

## Installation Steps

1. **Navigate to Module Installer:**
   ```
   <REPO_ROOT>\Desktop\TNDS-Command-Center\10_COMMANDS\client-google-apps-module-setup
   ```

2. **Required Files:**
   - [Module]Command.gs
   - [Module]Config.gs
   - Config.gs (standard)
   - OAuth.gs (standard)

3. **Configuration:**
   - Set CLIENT_NAME in Config.gs
   - Configure module-specific settings in [Module]Config.gs
   - Add Sheet ID for data source

4. **Testing:**
   - Run test[Module]() function
   - Verify logs for errors
   - Test end-to-end workflow

## Common Issues
| Issue | Solution |
|-------|----------|
| [Issue 1] | [Solution 1] |
| [Issue 2] | [Solution 2] |
```

---

### Client Delivery Checklist Template
```yaml
---
name: client-checklist
description: Generate delivery checklist for client implementation
argument-hint: [client-name] [modules]
disable-model-invocation: true
---

# Client Delivery Checklist: $0

## Modules: $1

### Phase 1: Post-Launch Setup
- [ ] Service Agreement signed
- [ ] 50% deposit received
- [ ] Welcome email sent
- [ ] Kickoff call scheduled

### Phase 2: Kickoff
- [ ] Current workflow documented
- [ ] Success metrics defined
- [ ] Module list confirmed

### Phase 3: Technical Setup
- [ ] Folder structure created
- [ ] System access collected
- [ ] Credentials saved to 1Password

### Phase 4: Development
- [ ] Apps Script project created
- [ ] OAuth2 library added
- [ ] Module files deployed
- [ ] Config.gs customized

### Phase 5: Customization
- [ ] Branding applied
- [ ] Email templates customized
- [ ] Business rules configured

### Phase 6: OAuth
- [ ] Authorization URL generated
- [ ] Authorization email sent
- [ ] Client authorized

### Phase 7: Testing
- [ ] Unit tests passed
- [ ] Integration tests passed
- [ ] Edge cases verified

### Phase 8: Documentation
- [ ] User guide created
- [ ] Troubleshooting guide created

### Phase 9: Training & Launch
- [ ] Training session completed
- [ ] System activated
- [ ] Go-live email sent
- [ ] Final payment collected

### Phase 10: Post-Launch
- [ ] Day 1 monitoring complete
- [ ] Day 3 check-in sent
- [ ] 2-week review complete
```
