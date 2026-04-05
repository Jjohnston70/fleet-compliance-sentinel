# TNDS Prompt Engineering Skill - Multi-Armed Bandits Methodology

## What's In This Package

This is a complete prompt engineering skill for True North Data Strategies, designed for non-technical team members to create, test, and improve LLM prompts using the Multi-Armed Bandits methodology.

### Files Included

1. **SKILL.md** - Complete methodology guide
   - All four phases: Create, Modify, Evaluate, Retire
   - Multi-Armed Bandits explanation
   - Reward function design
   - Implementation workflows

2. **DESCRIPTION.md** - Executive summary
   - What this is and who it's for
   - Problems solved
   - Scope and pricing
   - Quick start paths

3. **EXAMPLES.md** - Practical templates
   - Real-world case studies (email extraction, ticket routing)
   - Worksheets for each phase
   - Common prompt arm patterns
   - Code implementations (Apps Script & Python)

4. **QUICK-REFERENCE.md** - One-page cheat sheet
   - Decision tree
   - Common patterns
   - Metrics formulas
   - Code snippets
   - Emergency procedures

## How to Use This Skill

### For New Prompts
1. Read QUICK-REFERENCE.md for overview
2. Use SKILL.md Phase 2A workflow
3. Reference EXAMPLES.md for templates
4. Fill out "New Prompt Creation Worksheet"

### For Fixing Existing Prompts
1. Start with QUICK-REFERENCE.md decision tree
2. Follow SKILL.md Phase 2B
3. Use "Modify Existing Prompt Worksheet" from EXAMPLES.md

### For Comparing Options
1. Check SKILL.md Phase 2C
2. Set up test using EXAMPLES.md case studies as reference
3. Implement logging from QUICK-REFERENCE.md

### For Daily Reference
Print QUICK-REFERENCE.md and keep at desk

## Key Concepts (Non-Technical Summary)

### The Problem
Traditional prompt engineering wastes time:
- Teams guess at best prompt
- Tweak emotionally when issues arise
- Accidentally break working prompts
- Roll back and repeat cycle

This "bad prompt tax" costs time, money, and user trust.

### The Solution: Multi-Armed Bandits
System automatically learns which prompts work best while serving real traffic:
- **Exploit:** Use best-performing prompt most of the time
- **Explore:** Try alternatives occasionally to improve
- **Adapt:** Continuously adjust as users and models change

No heavy math, no ML expertise required.

### How It Works
1. Create 5-8 prompt variations ("arms")
2. Define success metrics
3. System routes traffic and tracks results
4. Automatically increases weight on winners
5. Keeps exploring to catch drift

## Implementation Checklist

### Setup (One-Time)
- [ ] Review SKILL.md to understand methodology
- [ ] Set up logging infrastructure (Google Sheets or BigQuery)
- [ ] Choose Thompson Sampling or Epsilon-Greedy algorithm
- [ ] Create prompt arm documentation template
- [ ] Establish review schedule (hourly/daily/weekly)

### Per Prompt Project
- [ ] Complete discovery questions (3-5 questions)
- [ ] Create 5-8 distinct prompt arms
- [ ] Define 1 primary + 2 guardrail metrics
- [ ] Document each arm using template
- [ ] Deploy with initial weights
- [ ] Monitor results for test duration
- [ ] Make routing decision
- [ ] Schedule monthly arm review

## Success Metrics

You'll know this skill is working when:
- Prompt performance improves over time without manual intervention
- New edge cases are handled automatically through exploration
- Team spends less time debugging and more time building
- Clear data supports prompt decisions (no more guessing)

## TNDS Integration

This skill integrates with:
- **Command Center Builds:** Prompt routing for module automation
- **Battle Rhythm Installs:** Continuous improvement processes
- **Command Partner:** Ongoing optimization support

Store arm configs and logs in relevant Command modules (data-command, analytics-command).

## Support

**Questions about methodology:**
Reference SKILL.md sections

**Need implementation help:**
See EXAMPLES.md code samples

**Quick answers:**
Check QUICK-REFERENCE.md

**Still stuck:**
Contact Jacob Johnston  
jacob@truenorthstrategyops.com  
555-555-5555

## Version History

- **v1.0 (2026-02-13):** Initial release based on Multi-Armed Bandits methodology from reviewed article

## Next Steps

1. **If you're new:** Start with QUICK-REFERENCE.md, then read DESCRIPTION.md
2. **If you have a prompt to create:** Go straight to EXAMPLES.md worksheets
3. **If you need deep understanding:** Work through SKILL.md Phase 1-4
4. **If you're implementing:** Use code samples in EXAMPLES.md

## File Structure

```
prompt-engineering-skill/
├── README.md                 ← You are here
├── SKILL.md                  ← Complete methodology (12,000+ words)
├── DESCRIPTION.md            ← Executive summary
├── EXAMPLES.md               ← Case studies and worksheets
└── QUICK-REFERENCE.md        ← One-page cheat sheet
```

## License & Usage

Internal TNDS skill. All methodologies, templates, and code samples are for True North Data Strategies use in client delivery and internal operations.

Based on Multi-Armed Bandits methodology for prompt routing, adapted for non-technical business operations teams.

---

**Built by:** TNDS Operations Team  
**Last Updated:** February 13, 2026  
**Maintained by:** Jacob Johnston

**True North Data Strategies**  
Turning Data into Direction  
Colorado Springs, CO  
SBA-Certified VOSB/SDVOSB
