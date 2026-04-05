# Claude Code Skills - Technical Reference

## Complete Skill Frontmatter Options

### All Frontmatter Fields
```yaml
---
name: skill-name                    # Unique identifier (lowercase, hyphens only)
description: What this skill does   # When Claude should use it (recommended)
argument-hint: [filename]           # Hint for autocomplete
disable-model-invocation: false     # true = manual-only invocation
user-invocable: true                # false = Claude-only (hidden from menu)
allowed-tools: Read, Write, Bash    # Tools Claude can use without asking
model: inherit                      # sonnet, opus, haiku, or inherit
context: fork                       # fork = run in subagent context
agent: Explore                      # Subagent type (Explore, Plan, or custom)
hooks:                              # Lifecycle hooks
  PreToolUse: []
  PostToolUse: []
---
```

### Frontmatter Field Details

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| name | string | Directory name | Max 64 chars, lowercase, numbers, hyphens only |
| description | string | First paragraph | Max 500 chars recommended |
| argument-hint | string | None | Example: `[issue-number]` or `[filename] [format]` |
| disable-model-invocation | boolean | false | Set true for side-effect operations (deploy, send-slack) |
| user-invocable | boolean | true | Set false for background knowledge only |
| allowed-tools | string (comma-separated) | All tools | Tools Claude can use without permission |
| model | string | inherit | Must be: sonnet, opus, haiku, or inherit |
| context | string | None | Set to "fork" to run in subagent context |
| agent | string | None | Subagent type: Explore, Plan, or custom agent name |
| hooks | object | None | Lifecycle hooks (PreToolUse, PostToolUse, etc.) |

## String Substitution Reference

### Placeholder Variables

| Placeholder | Replaces With | Type | Example |
|-------------|---------------|------|---------|
| $ARGUMENTS | All arguments passed to skill | string | `Fix issue $ARGUMENTS` |
| $ARGUMENTS[N] | Specific argument by index (0-based) | string | `Migrate $ARGUMENTS[0] from $ARGUMENTS[1] to $ARGUMENTS[2]` |
| $N | Shorthand for $ARGUMENTS[N] | string | `Migrate $0 from $1 to $2` |
| ${CLAUDE_SESSION_ID} | Current session ID | string | `logs/${CLAUDE_SESSION_ID}.log` |

### Example Substitutions
```yaml
---
name: fix-github-issue
description: Fix a specific GitHub issue
---

Fix GitHub issue $ARGUMENTS following our coding standards:
1. Read the issue at https://github.com/repo/issues/$ARGUMENTS
2. Implement the fix
3. Write tests
4. Create a commit with message "Fix #$ARGUMENTS"
```

When invoked: `/fix-github-issue 123` → Claude receives "Fix GitHub issue 123..."

## Subagent Configuration Reference

### Subagent Frontmatter Options
```yaml
---
name: my-agent
description: What this agent does
tools: Read, Grep, Bash          # Comma-separated tool list
disallowedTools: Write, Edit     # Tools to explicitly deny
model: sonnet                     # sonnet, opus, haiku, or inherit
permissionMode: default           # default, acceptEdits, dontAsk, bypassPermissions, plan
skills:                           # Skills to preload
  - skill-name-1
  - skill-name-2
hooks:                            # Lifecycle hooks
  PreToolUse: []
  PostToolUse: []
---
```

### Permission Modes

| Mode | Auto-Accept | Auto-Deny | Interactive | Use Case |
|------|-------------|-----------|-------------|----------|
| default | No | No | Yes | Standard behavior with permission prompts |
| acceptEdits | File edits | No | Some | Auto-accept file modifications |
| dontAsk | No | Other tools | No | Read-only agents, deny unknown operations |
| bypassPermissions | All | All | No | High-trust operations (use with caution) |
| plan | No | Edit/Write | Yes | Planning mode, exploration only |

### Available Tools by Category

**Read-Only Tools:**
- Read: Read files
- Grep: Search in files
- Glob: Find files by pattern
- View: View file contents
- LS: List directories

**Modification Tools:**
- Write: Create/overwrite files
- Edit: Modify file contents
- Bash: Execute shell commands
- Delete: Remove files

**Advanced Tools:**
- MCPSearch: Search MCP tools by description
- MCPUse: Execute MCP server tools
- Bash(pattern): Restrict bash to specific commands (e.g., Bash(git *))

## Hook Configuration Reference

### Hook Event Types
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "script.sh"
          }
        ]
      }
    ]
  }
}
```

### Hook Event Triggers

| Event | When it Fires | Can Block | Exit Code Behavior |
|-------|---------------|-----------|-------------------|
| PreToolUse | Before tool execution | Yes (exit 2) | 0=allow, 1=error, 2=block |
| PostToolUse | After tool completes | No | 0=success, 1=error |
| PermissionRequest | Permission dialog shown | Yes (exit 2) | 0=allow, 1=error, 2=block |
| UserPromptSubmit | User submits prompt | No | 0=continue, 1=error |
| Notification | Claude sends notification | No | N/A |
| Stop | Claude finishes responding | No | N/A |
| SubagentStart | Subagent begins | No | N/A |
| SubagentStop | Subagent completes | No | N/A |
| PreCompact | Before context compaction | No | N/A |
| Setup | Init operations | No | N/A |
| SessionStart | Session begins | No | N/A |
| SessionEnd | Session ends | No | N/A |

### Hook Matchers

| Matcher | Matches | Example |
|---------|---------|---------|
| Tool name | Single tool | "Bash", "Read", "Write" |
| Multiple tools | Pipe-separated | "Edit\\|Write", "Bash\\|Grep" |
| All tools | Asterisk | "*" |
| Subagent name | Agent type | "code-reviewer", "debugger" |

### Hook Input Schema

Hooks receive JSON via stdin:
```json
{
  "type": "tool_call",
  "tool_name": "Bash",
  "tool_input": {
    "command": "ls -la",
    "description": "Lists files in directory"
  },
  "file_path": "/path/to/file",
  "timestamp": "2025-01-28T14:30:00Z"
}
```

Hook scripts can parse with jq:
```bash
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')
FILE=$(echo "$INPUT" | jq -r '.file_path')
```

## MCP Server Configuration Reference

### HTTP Server Configuration
```bash
claude mcp add --transport http my-server https://api.example.com/mcp \
  --header "Authorization: Bearer token" \
  --header "X-Custom-Header: value"
```

### Stdio Server Configuration
```bash
claude mcp add --transport stdio my-server --env VAR1=value1 --env VAR2=value2 \
  -- npx my-server --arg1 value --arg2 value
```

### Environment Variable Expansion
```json
{
  "mcpServers": {
    "database": {
      "type": "stdio",
      "command": "python",
      "args": ["server.py"],
      "env": {
        "DB_URL": "${DB_URL}",
        "API_KEY": "${API_KEY:-default-key}",
        "PORT": "5432"
      }
    }
  }
}
```

### Managed MCP Configuration

**Allowlist Entry Schema:**
```json
{
  "serverName": "github",           // Match by server name
  "serverCommand": ["npx", "pkg"],  // Match stdio command exactly
  "serverUrl": "https://api.*/mcp"  // Match HTTP URL with wildcards
}
```

**Denylist Entry Schema:**
Same as allowlist - blocks matching servers.

## Plugin Structure Reference

### Plugin.json Schema
```json
{
  "name": "my-plugin",
  "description": "What this plugin does",
  "version": "1.0.0",
  "author": {
    "name": "Your Name",
    "email": "your@email.com"
  },
  "homepage": "https://github.com/you/my-plugin",
  "repository": {
    "type": "git",
    "url": "https://github.com/you/my-plugin"
  },
  "license": "MIT",
  "mcpServers": {
    "server-name": {
      "type": "http",
      "url": "https://example.com/mcp"
    }
  }
}
```

### Plugin File Organization
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          ← Only plugin.json here!
├── skills/
│   └── skill-name/
│       └── SKILL.md
├── agents/
│   └── agent-name/
│       └── agent.md
├── hooks/
│   └── hooks.json
├── commands/                 ← Legacy (still supported)
│   └── command-name.md
├── .mcp.json               ← Plugin MCP servers
├── README.md
├── LICENSE
└── package.json            ← Optional, for distribution
```

## Settings File Hierarchy

### Priority Order (highest to lowest)

1. CLI flags: `--model sonnet`, `--disallowedTools "Skill(deploy)"`
2. Local settings: `.claude/settings.local.json` (not committed)
3. Project settings: `.claude/settings.json` (checked in)
4. User settings: `~/.claude/settings.json`
5. Managed settings: System admin configuration

### Settings File Schema
```json
{
  "model": "sonnet",
  "outputStyle": "default",
  "permissions": {
    "allow": ["Read", "Write"],
    "deny": ["Task(Explore)"]
  },
  "hooks": {
    "PreToolUse": [],
    "PostToolUse": []
  },
  "env": {
    "CUSTOM_VAR": "value"
  },
  "enabledPlugins": ["plugin-name"],
  "extraKnownMarketplaces": [
    "anthropics/claude-code"
  ],
  "mcpServers": {
    "server-name": {}
  }
}
```

## Common Error Messages and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Skill not triggering" | Description doesn't match user language | Rephrase description with natural keywords, test with `/skill-name` |
| "Claude doesn't see skill" | Exceeds character budget | Run `/context` and increase `SLASH_COMMAND_TOOL_CHAR_BUDGET` |
| "/plugin command not recognized" | Outdated version | Update: `brew upgrade claude-code` |
| "Language server not found" | Binary not in PATH | Install binary, verify with `which <binary>` |
| "MCP timeout" | Server slow to start | Increase `MCP_TIMEOUT` environment variable |
| "High memory usage" | Large codebase or language server | Use `/compact` regularly, disable LSP plugins |
| "WSL: Node not found" | Using Windows npm in WSL | Install Node.js in WSL with nvm |

## Version Compatibility

| Feature | Min Version | Notes |
|---------|-------------|-------|
| Skills (basic) | 1.0.0 | Slash commands |
| Subagents | 1.0.10 | /agents command |
| Plugins | 1.0.33 | /plugin command |
| MCP Integration | 1.0.20 | claude mcp commands |
| Hooks | 1.0.0 | Settings configuration |
| Output Styles | 1.0.5 | /output-style command |
| Tool Search | 1.1.0 | Dynamic MCP tool loading |

Check version: `claude --version`

Update: `brew upgrade claude-code` (macOS) or native installer
