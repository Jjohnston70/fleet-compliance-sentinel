# Claude Code Skills - Setup and Testing Guide

## Part 1: Setting Up Your First Skill

### Step 1: Create the Skill Directory
```bash
# Create personal skills directory (if it doesn't exist)
mkdir -p ~/.claude/skills/build-claude-skills

# Or create a project-level skill
mkdir -p .claude/skills/build-claude-skills
```

### Step 2: Copy the SKILL.md File

Copy the complete `SKILL.md` content from this package into the skill directory:
```bash
# For personal skills (all projects)
cp SKILL.md ~/.claude/skills/build-claude-skills/SKILL.md

# OR for project skills (current project only)
cp SKILL.md .claude/skills/build-claude-skills/SKILL.md
```

### Step 3: (Optional) Add Supporting Files

If using supporting files:
```bash
# Create supporting files directory
mkdir -p ~/.claude/skills/build-claude-skills/docs

# Copy reference and examples
cp reference.md ~/.claude/skills/build-claude-skills/docs/
cp examples.md ~/.claude/skills/build-claude-skills/docs/
cp templates.md ~/.claude/skills/build-claude-skills/docs/
```

### Step 4: Verify Installation

In Claude Code, run:
```
/help
```

Look for `build-claude-skills` in the output. If you don't see it, try:
```
/context
```
This shows skill descriptions and warns if any are excluded.

---

## Part 2: Testing the Skill

### Test 1: Direct Invocation
```bash
# In Claude Code:
/build-claude-skills

# Expected: Claude responds with skill content
```

**What to verify:**
- Skill loads successfully
- Claude understands the context
- Response is relevant to the skill topic

### Test 2: Auto-Invocation

Ask Claude Code a question that matches the description:
```bash
# In Claude Code:
"Help me create a Claude skill"

# Or:
"I want to build a custom subagent"

# Or:
"How do I extend Claude with plugins?"
```

**What to verify:**
- Claude automatically loads the skill when topic matches
- Relevant sections are highlighted
- Claude provides actionable guidance

### Test 3: Specific Topics

Test each major section:
```bash
# Test Skills section
"How do I create a skill with arguments?"

# Test Subagents section
"What's the difference between skills and subagents?"

# Test Plugins section
"How do I distribute a plugin?"

# Test Hooks section
"How do I set up automatic code formatting?"

# Test MCP section
"How do I connect Claude to external tools?"

# Test Troubleshooting
"Why isn't my skill triggering?"
```

### Test 4: Argument Substitution

If you created a skill with arguments:
```bash
/skill-name argument1 argument2
```

**What to verify:**
- Arguments are properly substituted with $ARGUMENTS or $0, $1, etc.
- Claude receives the complete prompt with arguments included
- Claude acts on the specific arguments provided

### Test 5: Check Context Usage
```bash
/context
```

**What to verify:**
- Skill is loaded into context
- Character count is shown
- No warnings about excluded skills
- If character-limited, skills appear in priority order

---

## Part 3: Troubleshooting

### Skill Not Appearing

**Problem:** `/help` doesn't list your skill

**Solutions:**
1. Verify file location:
   - Personal: `~/.claude/skills/build-claude-skills/SKILL.md`
   - Project: `.claude/skills/build-claude-skills/SKILL.md`

2. Check file naming:
   - Directory name becomes the skill name
   - File must be exactly `SKILL.md` (case-sensitive)

3. Verify YAML frontmatter:
   ```yaml
   ---
   name: build-claude-skills
   description: Your description here
   ---
   ```
   - Must have opening `---` and closing `---`
   - Name and description are recommended

4. Restart Claude Code:
   - Close and reopen the terminal
   - Restart the claude session

### Skill Not Auto-Triggering

**Problem:** Claude doesn't use skill automatically even though your question matches

**Solutions:**
1. Make description more specific:
   - Current: "A guide to building Claude skills"
   - Better: "Comprehensive guide covering how to create skills, subagents, plugins, hooks, and MCP integrations"

2. Check `disable-model-invocation`:
   ```yaml
   disable-model-invocation: false  # Must be false for auto-triggering
   ```

3. Try more natural language:
   - Instead of "use skill build-claude-skills"
   - Try: "I want to create a plugin for my team"

4. Rephrase to match description keywords:
   - If description says "subagents", ask about "subagents" not "custom agents"

### Skill Triggers Too Often

**Problem:** Claude uses skill for every question

**Solutions:**
1. Make description more specific:
   - Remove generic terms
   - Focus on specific use cases

2. Use `disable-model-invocation`:
   ```yaml
   disable-model-invocation: true  # Only manual invocation
   ```

3. Add `user-invocable: false`:
   ```yaml
   user-invocable: false  # Only Claude can trigger
   ```

### Context Limit Warnings

**Problem:** Warning that skill is excluded due to character limits

**Solutions:**
1. Check current usage:
   ```
   /context
   ```

2. Increase budget:
   ```bash
   export SLASH_COMMAND_TOOL_CHAR_BUDGET=50000
   claude
   ```

3. Split into smaller skills:
   - `build-skills` - Just skill creation
   - `build-subagents` - Just subagent creation
   - `build-plugins` - Just plugin creation

---

## Part 4: Creating Focused Skills

To create individual skills for specific areas, follow this pattern:

### Skill 1: Build Skills (Focused)

Create `~/.claude/skills/build-skills/SKILL.md`:
```yaml
---
name: build-skills
description: Guide to creating Claude skills with examples, configuration, and best practices.
---

[Copy just the "Extend Claude with Skills" section from SKILL.md]
```

### Skill 2: Build Subagents (Focused)

Create `~/.claude/skills/build-subagents/SKILL.md`:
```yaml
---
name: build-subagents
description: Guide to creating custom subagents with tool access control and delegation patterns.
---

[Copy just the "Create Custom Subagents" section]
```

### Skill 3: Build Plugins (Focused)

Create `~/.claude/skills/build-plugins/SKILL.md`:
```yaml
---
name: build-plugins
description: Guide to creating and distributing plugins with skills, agents, hooks, and MCP servers.
---

[Copy just the "Create Plugins" and "Discover and Install Plugins" sections]
```

### Skill 4: Advanced Extensions (Hooks & MCP)

Create `~/.claude/skills/advanced-claude/SKILL.md`:
```yaml
---
name: advanced-claude
description: Advanced Claude Code features including hooks for automation, MCP integration, output styles, and troubleshooting.
---

[Copy the "Hooks", "MCP Integration", "Output Styles", and "Troubleshooting" sections]
```

---

## Part 5: Installation Options

### Option A: Install Complete Skill (Recommended for Learning)
```bash
# 1. Create directory
mkdir -p ~/.claude/skills/build-claude-skills

# 2. Copy SKILL.md
cat > ~/.claude/skills/build-claude-skills/SKILL.md << 'EOF'
---
name: build-claude-skills
description: Comprehensive guide to building Claude skills and extensions. Covers creating skills, subagents, plugins, output styles, hooks, MCP integrations, and troubleshooting.
---

[Paste your complete SKILL.md content here]
EOF

# 3. Verify
claude
/help | grep build-claude-skills
```

### Option B: Install Focused Skills (Recommended for Using)
```bash
# Create skills directory
mkdir -p ~/.claude/skills/{build-skills,build-subagents,build-plugins,advanced-claude}

# Copy focused SKILL.md files to each
# See "Creating Focused Skills" section above for content
```

### Option C: Install as Project-Level Skills
```bash
# For team/project sharing
mkdir -p .claude/skills/build-claude-skills
cp SKILL.md .claude/skills/build-claude-skills/SKILL.md

# Commit to version control
git add .claude/skills/
git commit -m "Add Claude skill building guides"
```

---

## Part 6: Testing Checklist

Use this checklist to verify your skills work correctly:

### Basic Functionality
- [ ] Skill appears in `/help`
- [ ] Skill is listed in `/context`
- [ ] Direct invocation works: `/skill-name`
- [ ] Auto-trigger works (ask matching question)
- [ ] No character limit warnings in `/context`

### Content Verification
- [ ] All sections are readable
- [ ] Code examples are properly formatted
- [ ] Links to documentation work (if applicable)
- [ ] Command syntax is correct
- [ ] YAML frontmatter is valid

### Argument Handling (if applicable)
- [ ] Arguments substitute correctly: `/skill-name arg1`
- [ ] `$ARGUMENTS` placeholder works
- [ ] `$0`, `$1`, `$2` shortcuts work
- [ ] Multiple arguments handled properly

### Special Features (if used)
- [ ] `disable-model-invocation: true` prevents auto-triggering
- [ ] `user-invocable: false` hides from menu but Claude can use
- [ ] `allowed-tools` restriction works
- [ ] `context: fork` runs in subagent correctly

### Integration
- [ ] Skill references supporting files correctly
- [ ] Examples are clear and runnable
- [ ] Templates can be copied and used
- [ ] Cross-skill references work

---

## Part 7: One-Command Setup Scripts

### For macOS/Linux:
```bash
#!/bin/bash
# save as: setup-skills.sh

echo "Setting up Claude Code skills..."

# Create directories
mkdir -p ~/.claude/skills/build-claude-skills
mkdir -p ~/.claude/skills/build-skills
mkdir -p ~/.claude/skills/build-subagents
mkdir -p ~/.claude/skills/build-plugins
mkdir -p ~/.claude/skills/advanced-claude

# Copy main skill
cp SKILL.md ~/.claude/skills/build-claude-skills/SKILL.md

# Copy focused skills (create from the content in setup section)
# [You'd create separate SKILL.md files for each focused skill]

echo "Skills installed!"
echo ""
echo "Verify with:"
echo "  claude"
echo "  /help"
echo ""
echo "View complete guide with:"
echo "  /build-claude-skills"
```

Run with:
```bash
chmod +x setup-skills.sh
./setup-skills.sh
```

### For Windows PowerShell:
```powershell
# save as: setup-skills.ps1

Write-Host "Setting up Claude Code skills..."

# Create directories
$skillsDir = "$env:USERPROFILE\.claude\skills"
New-Item -ItemType Directory -Path "$skillsDir\build-claude-skills" -Force
New-Item -ItemType Directory -Path "$skillsDir\build-skills" -Force
New-Item -ItemType Directory -Path "$skillsDir\build-subagents" -Force
New-Item -ItemType Directory -Path "$skillsDir\build-plugins" -Force
New-Item -ItemType Directory -Path "$skillsDir\advanced-claude" -Force

# Copy main skill
Copy-Item "SKILL.md" "$skillsDir\build-claude-skills\SKILL.md"

Write-Host "Skills installed!" -ForegroundColor Green
Write-Host ""
Write-Host "Verify with:"
Write-Host "  claude"
Write-Host "  /help"
```

Run with:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-skills.ps1
```

---

## Part 8: Directory Structure Reference

Here's the complete directory structure you should create:
```
your-project/
├── SKILL.md                          ← Main comprehensive skill
├── reference.md                      ← Technical reference
├── examples.md                       ← Practical examples
├── templates.md                      ← Quick-start templates
├── setup-and-test-guide.md          ← This guide
├── USER_MANUAL.md                    ← User manual
│
├── .claude/
│   ├── settings.json                 (optional project settings)
│   └── skills/
│       ├── build-claude-skills/
│       │   └── SKILL.md             (comprehensive - copy from SKILL.md)
│       ├── build-skills/
│       │   └── SKILL.md             (focused on skills)
│       ├── build-subagents/
│       │   └── SKILL.md             (focused on subagents)
│       ├── build-plugins/
│       │   └── SKILL.md             (focused on plugins)
│       └── advanced-claude/
│           └── SKILL.md             (hooks, MCP, output styles)
│
├── ~/.claude/
│   └── skills/                       (personal skills - for user-level)
│       └── [same structure as above]
│
└── README.md                         (project overview)
```

---

## Part 9: Summary Checklist

Complete this checklist to ensure everything is set up:

- [ ] Downloaded/copied all files (SKILL.md, reference.md, examples.md, templates.md, setup-guide.md, USER_MANUAL.md)
- [ ] Created skill directories (`~/.claude/skills/build-claude-skills/`)
- [ ] Copied SKILL.md to correct location
- [ ] Verified skill appears in `/help`
- [ ] Tested direct invocation: `/build-claude-skills`
- [ ] Tested auto-invocation (asked matching question)
- [ ] Checked context usage: `/context`
- [ ] (Optional) Created focused skills for specific areas
- [ ] (Optional) Set up project-level skills in `.claude/skills/`
- [ ] Tested all major sections work correctly
- [ ] (Optional) Set up hooks if needed
- [ ] (Optional) Configured MCP servers if needed

---

## You're All Set!

Your comprehensive Claude skill system is now ready. You can:

- Reference the complete guide with `/build-claude-skills`
- Access focused guides with `/build-skills`, `/build-subagents`, `/build-plugins`, `/advanced-claude`
- Look up technical details in `reference.md`
- See real examples in `examples.md`
- Use quick templates from `templates.md`
- Follow the user manual in `USER_MANUAL.md`

---

*Direction Protocol gets you clarity. Command Protocol gets you control. That's how we turn data into direction.*
