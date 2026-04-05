# Direction Protocol Skill - Installation & Usage Guide

## What You Just Got

A complete Claude skill package for running the TNDS Direction Protocol sales process. This includes:

1. **SKILL.md** - The main skill Claude reads (22KB of structured methodology)
2. **assessment-tools.md** - Scoring systems, templates, and evaluation frameworks
3. **integration-guide.md** - How this connects with your SRO Assessment and World Mapper skills
4. **README.md** - Human-readable overview and quick reference

## Installation

### Option 1: Use in Claude.ai (Recommended for Testing)

1. In your conversation with Claude, reference the skill:
   ```
   "Use the Direction Protocol skill from the files I uploaded"
   ```

2. Claude will read SKILL.md and be able to:
   - Guide you through qualification calls
   - Run assessments using the SRO framework
   - Calculate pricing automatically
   - Generate proposals and documents
   - Track prospects through the pipeline

### Option 2: Add to MCP Skills Directory

If you're using Claude Desktop with MCP:

1. Copy the entire `direction-protocol-skill` folder to your MCP skills directory:
   ```bash
   cp -r direction-protocol-skill /path/to/your/mcp/skills/
   ```

2. Claude will auto-detect it as an available skill

3. Reference it by name in conversations:
   ```
   "Use the direction-protocol skill"
   ```

### Option 3: Store in Your TNDS Notion/Drive

1. Upload all four markdown files to your TNDS documentation workspace

2. Keep them accessible for reference during client calls

3. Share with team members who will be running the Direction Protocol

## Quick Start Usage

### Scenario 1: New Lead Comes In

```
You: "New lead from referral. Owner of 10-person HVAC company. Says they can't see their job costs and everything depends on them."

Claude (with skill): 
[Starts IDENTIFY stage]
- Analyzes initial pain signals
- Provides qualification questions
- Recommends next action
- Drafts follow-up email
```

### Scenario 2: About to Do Assessment Call

```
You: "ASSESS call with Peak HVAC in 30 minutes. 12 techs, paper-based dispatch, owner drowning."

Claude (with skill):
[Prepares ASSESS stage materials]
- Loads structured question framework
- Prepares SRO scoring template
- Reminds you of key qualification criteria
- Ready to document responses
```

### Scenario 3: Need to Calculate Pricing

```
You: "MAP session done. Scoring: 12 employees, complete chaos, 5+ data sources, owner hard to reach, resistant to tech, need field+office integration."

Claude (with skill):
[Runs pricing calculator]
- Calculates base score: 12 points = $5,000
- Applies adjustments: +$1,500
- Final price: $6,500
- Payment terms: 40/30/30
- Timeline: 4 weeks
- Modules needed: [list]
```

### Scenario 4: Generate Complete Proposal

```
You: "Ready to present. Generate the CHART package."

Claude (with skill):
[Creates complete proposal]
- Operational map (current vs desired)
- Problem analysis with root causes
- Proposed solution architecture
- Pricing breakdown
- Timeline and deliverables
- Service agreement ready to sign
```

## Integration with Other Skills

### Required Skills (for full functionality)

1. **SRO Assessment Skill**
   - Used in ASSESS and MAP stages
   - Evaluates Structure, Resources, Operations
   - You should already have this created

2. **World Mapper Skill**
   - Used in MAP stage
   - Creates visual workflow diagrams
   - You should already have this created

### How They Work Together

The Direction Protocol skill acts as the **orchestrator**:

```
Direction Protocol (conductor)
├─ Calls SRO Assessment (during ASSESS and MAP)
└─ Calls World Mapper (during MAP)
```

When you tell Claude "Start MAP session," it will:
1. Use Direction Protocol to structure the conversation
2. Invoke SRO Assessment to score operational maturity
3. Invoke World Mapper to create visual diagrams
4. Synthesize all outputs into a complete proposal

**See integration-guide.md for detailed orchestration examples.**

## Testing the Skill

### Test 1: Qualification Scoring

```
You: "Score this prospect: 8 employees, some spreadsheets but organized, 3 data sources, owner available, quick learner."

Expected: 
- Factor scores: 1+1+1+1+1 = 5 points
- Base price: $2,500
- Recommendation: Good fit, moderate complexity
```

### Test 2: Red Flag Detection

```
You: "Prospect says 'Just tell me the price, I've tried 5 other companies, and I need guaranteed ROI or I want my money back.'"

Expected:
- Red flags detected: 3
- Recommendation: WALK AWAY
- Reasoning: Wants price before assessment, tried everything mentality, wants guaranteed outcomes
```

### Test 3: Module Selection

```
You: "Client needs: centralized data, job costing, dispatch automation, tech notifications, custom KPI dashboard."

Expected:
- Modules: data-command, financial-command, office-command, sms-command, analytics-command
- Estimated modules: 5
- Complexity indicator: Medium-High
```

## Common Commands

Tell Claude any of these and it will know what to do:

**Starting a Stage**:
- "New lead from [source]"
- "Start IDENTIFY with this prospect"  
- "ASSESS call scheduled for tomorrow"
- "Begin MAP session"
- "Generate CHART presentation"

**Getting Analysis**:
- "Should we take this client?"
- "Calculate pricing for this engagement"
- "What's the qualification score?"
- "Identify red flags"

**Generating Documents**:
- "Create the proposal"
- "Generate service agreement"
- "Draft follow-up email"
- "Write methodology capture"

**Checking Process**:
- "What stage are we in?"
- "What's the next step?"
- "Are we ready to present?"

## Troubleshooting

### Issue: Claude isn't using the skill

**Solution**: Explicitly reference it:
```
"Using the Direction Protocol skill, analyze this prospect..."
```

### Issue: Pricing calculation seems wrong

**Solution**: Verify all 5 scoring factors were captured:
1. Number of employees
2. Current state of systems
3. Number of data sources
4. Owner availability  
5. Technical comfort

Missing data = inaccurate pricing.

### Issue: Claude wants to skip to pricing

**Solution**: Remind it of the core rule:
```
"Never quote without mapping. We're still in ASSESS stage. We need to complete MAP before pricing."
```

### Issue: Not getting visual diagrams

**Solution**: Make sure World Mapper skill is available and explicitly request:
```
"Use World Mapper to create the workflow diagram"
```

## Tips for Maximum Effectiveness

### 1. Use Real Prospect Data
The skill works best with actual prospect information, not hypotheticals.

Good: "Peak HVAC, 12 techs, uses paper job tickets and text messages"
Bad: "Generic HVAC company"

### 2. Quote Their Exact Words
When prospects say things, quote them directly:

"They said: 'I found out about the equipment failure 3 days after it happened when the customer called to complain.'"

Claude picks up on language patterns that reveal fit.

### 3. Follow the Stages
Don't try to shortcut. The stages exist for a reason:
- IDENTIFY (15-20 min) - Worth it to avoid wasting time later
- ASSESS (30 min) - Builds trust and understanding
- MAP (90-120 min) - Where the real value happens
- CHART (30-45 min) - Professional presentation closes deals
- LAUNCH - Smooth transition to delivery

### 4. Trust the Red Flags
If you're asking "Should we walk away?" - you probably should.

### 5. Document Everything
After each stage, ask Claude to:
```
"Capture this in the methodology template for Pipeline Punks content"
```

This builds your knowledge base for future engagements.

## Advanced Usage

### Multi-Prospect Pipeline Management

```
You: "Show me status of all prospects in pipeline"

Claude (with proper tracking):
├─ Peak HVAC - MAP stage, scheduled Friday
├─ Mountain Electric - ASSESS stage, strong fit
├─ Valley Plumbing - IDENTIFY stage, needs follow-up
└─ Summit Construction - CLOSED-LOST, budget issues
```

### Pricing Scenario Analysis

```
You: "Run 3 pricing scenarios for this client: minimum, recommended, premium"

Claude:
Minimum ($3,500): Core modules only, 3 weeks
Recommended ($5,000): Full solution, 4 weeks  
Premium ($6,500): + custom reporting, 5 weeks

Recommended path: $5,000 (best value for their complexity)
```

### Objection Handling Practice

```
You: "Client says 'That's more than I expected. Can you come down?'"

Claude:
[Loads objection response]
"I understand. Let me show you what you're getting for that investment..."
[Provides value breakdown]
[Reframes cost vs. current situation cost]
```

## Team Training

If you're training someone else to use this skill:

### Week 1: Learn the Stages
- Read README.md (overview)
- Study SKILL.md (detailed methodology)
- Shadow 2-3 live calls
- Practice IDENTIFY stage

### Week 2: Run Assess and Map
- Practice ASSESS calls with role-play
- Learn SRO Assessment framework
- Learn World Mapper tool
- Shadow 1-2 MAP sessions

### Week 3: Pricing and Proposals
- Learn scoring system (assessment-tools.md)
- Practice pricing calculations
- Study CHART presentation structure
- Generate sample proposals

### Week 4: Full Process
- Run complete Direction Protocol on real prospect
- Generate and present CHART
- Handle objections
- Close or walk away appropriately

## Files Reference

### SKILL.md (Main Documentation)
- Complete 5-stage methodology
- Scripts for every stage
- ICP definition
- Red flags and walk-away signals
- Command modules reference
- Integration instructions

**When to reference**: Always. This is the authoritative source.

### assessment-tools.md (Scoring and Templates)
- IDENTIFY qualification scorecard
- ASSESS evaluation framework  
- MAP pricing calculator
- CHART presentation structure
- Email templates
- Methodology capture

**When to reference**: During scoring, pricing, and documentation.

### integration-guide.md (Multi-Skill Usage)
- How Direction Protocol works with SRO and World Mapper
- Data flow examples
- Complete orchestration walkthrough
- Best practices
- Common mistakes to avoid

**When to reference**: When using multiple skills together (ASSESS and MAP stages).

### README.md (Quick Reference)
- Overview and quick start
- Common scenarios
- Troubleshooting
- Quick reference card

**When to reference**: As a refresher or when onboarding someone new.

## Success Metrics

Track these to know if you're using the skill effectively:

**Conversion Rates**:
- IDENTIFY → ASSESS: Target 50%+
- ASSESS → MAP: Target 60%+
- MAP → CHART: Target 90%+  
- CHART → LAUNCH: Target 50%+
- Overall (IDENTIFY → LAUNCH): Target 15-25%

**Efficiency Metrics**:
- Time per stage (should match targets in skill)
- Red flags identified early (before MAP stage)
- Pricing accuracy (quoted price matches actual complexity)
- Client satisfaction with process

**Quality Indicators**:
- Walking away from bad fits (good!)
- Strong referrals from closed clients
- Repeat business and upsells
- Methodology capture completion rate

## Next Steps

1. **Test the skill** with a hypothetical prospect
2. **Run IDENTIFY stage** on your next lead
3. **Complete a full Direction Protocol** on a real prospect
4. **Capture methodology** after your first win
5. **Train team members** using this guide

## Support

Questions about using this skill?

**Internal**: Review the documentation files in this package
**External**: Contact TNDS - jacob@truenorthstrategyops.com

## Updates and Versions

As you use this skill, you'll discover improvements and refinements.

**To update the skill**:
1. Edit SKILL.md with your learnings
2. Add new templates to assessment-tools.md
3. Document integration patterns in integration-guide.md
4. Update README.md with new examples

Keep a version history so you can track what changed and why.

---

## Quick Reference: Stage Triggers

Just say these phrases and Claude will know what to do:

| You Say | Claude Does |
|---------|-------------|
| "New lead from [source]" | Start IDENTIFY stage |
| "ASSESS tomorrow" | Prepare ASSESS materials |
| "MAP session" | Structure 90-min deep dive |
| "Generate proposal" | Create CHART presentation |
| "Client signed" | Initiate LAUNCH process |
| "Should we take them?" | Run qualification analysis |
| "Calculate pricing" | Run scoring system |
| "Create agreement" | Generate service contract |

---

**You're all set!**

You now have a complete, production-ready Claude skill for running the TNDS Direction Protocol. 

Start with a real prospect and let Claude guide you through the process.

**Remember**: Direction Protocol gets you clarity. Command Protocol gets you control. That's how we turn data into direction.

---

**END OF INSTALLATION GUIDE**
