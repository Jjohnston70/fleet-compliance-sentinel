# Command Protocol Skill - User Manual

## Overview

The Command Protocol skill guides Claude through the complete TNDS client delivery process. It helps you implement Command modules, run through the 12-phase delivery checklist, create documentation, and manage client engagements from kickoff to ongoing support.

---

## Quick Start

### Invoking the Skill

The skill activates automatically when you use phrases like:

- "Implement for [client name]"
- "Set up command center for..."
- "Install [module] module"
- "Run through Phase [X]"
- "Client delivery checklist"
- "Training session prep"
- "Go-live for [client]"
- "Post-launch support"

### Example Prompts

**Starting a new client:**
```
"I just signed a new client, ABC Plumbing. They need data-command and 
financial-command modules. Walk me through Phase 1."
```

**Installing modules:**
```
"Help me install the analytics-command module for my current client."
```

**Creating documentation:**
```
"Create user documentation for the Smith Electric Command Center."
```

**Troubleshooting:**
```
"The OAuth flow isn't working for my client. Help me debug."
```

---

## Module Installer Usage

### Location
```
<REPO_ROOT>\Desktop\TNDS-Command-Center\10_COMMANDS\client-google-apps-module-setup
```

### How to Use

1. **Navigate to the installer folder**
2. **Select the appropriate module template**
3. **Copy to your client's Apps Script project**
4. **Customize Config.gs with client details**
5. **Deploy and test**

### Available Module Templates

| Module | Files to Copy |
|--------|---------------|
| data-command | DataCommand.gs, DataConfig.gs |
| financial-command | FinancialCommand.gs, FinancialConfig.gs |
| analytics-command | AnalyticsCommand.gs, AnalyticsConfig.gs |
| asset-command | AssetCommand.gs, AssetConfig.gs |
| office-command | OfficeCommand.gs, OfficeConfig.gs |
| onboard-command | OnboardCommand.gs, OnboardConfig.gs |
| proposal-command | ProposalCommand.gs, ProposalConfig.gs |
| workspace-command | WorkspaceCommand.gs, WorkspaceConfig.gs |
| sms-command | SMSCommand.gs, SMSConfig.gs |
| contract-command | ContractCommand.gs, ContractConfig.gs |
| realty-command | RealtyCommand.gs, RealtyConfig.gs |
| tax-command | TaxCommand.gs, TaxConfig.gs |
| seo-command | SEOCommand.gs, SEOConfig.gs |
| govcon-command | GovconCommand.gs, GovconConfig.gs |
| compliance-gov-module | ComplianceModule.gs, ComplianceConfig.gs |

### Standard Files (Always Include)

These files should be included in every client project:

| File | Purpose |
|------|---------|
| Config.gs | Client-specific configuration |
| OAuth.gs | OAuth2 authentication flow |
| EmailSender.gs | Email automation utilities |
| Automation.gs | Trigger and automation logic |
| Utils.gs | Common utility functions |

---

## Phase-by-Phase Usage

### Phase 1: Post-Launch Setup

**Ask Claude:**
```
"New client [Name] just signed. Help me run through Phase 1 setup."
```

**Claude will help you:**
- Create welcome email draft
- Generate kickoff meeting agenda
- Create pre-call prep checklist
- Set up Stripe subscription (guidance)

### Phase 2: Kickoff

**Ask Claude:**
```
"Prep me for kickoff call with [Client Name]. They need [modules]."
```

**Claude will help you:**
- Review success metrics to define
- List technical requirements to gather
- Create module confirmation checklist
- Generate questions to ask

### Phase 3: Technical Setup

**Ask Claude:**
```
"Help me set up the Google Workspace structure for [Client Name]."
```

**Claude will help you:**
- Generate folder structure commands
- Create sharing permissions checklist
- List credentials to collect
- Identify OAuth requirements

### Phase 4: Development

**Ask Claude:**
```
"Walk me through installing [module] module for [Client Name]."
```

**Claude will help you:**
- Navigate module installer
- Customize Config.gs
- Set up OAuth2 library
- Configure script properties
- Set up Google Cloud Console

### Phase 5: Customization

**Ask Claude:**
```
"Help me customize the branding for [Client Name]. 
Primary color: #1a3a5c, Logo attached."
```

**Claude will help you:**
- Apply color scheme to templates
- Customize email templates
- Configure automation triggers
- Set up business logic rules

### Phase 6: OAuth and Authorization

**Ask Claude:**
```
"Generate the authorization email for [Client Name]."
```

**Claude will help you:**
- Create authorization URL
- Draft authorization email
- Verify authorization status
- Troubleshoot OAuth issues

### Phase 7: Testing

**Ask Claude:**
```
"Create a test plan for [Client Name]'s Command Center."
```

**Claude will help you:**
- Generate unit test checklist
- Create integration test scenarios
- Document edge cases to test
- Review logs for errors

### Phase 8: Documentation

**Ask Claude:**
```
"Create user documentation for [Client Name]'s Command Center."
```

**Claude will help you:**
- Generate user guide structure
- Create step-by-step instructions
- Build troubleshooting guide
- Format for client delivery

### Phase 9: Training and Launch

**Ask Claude:**
```
"Prep me for training session with [Client Name]."
```

**Claude will help you:**
- Create training agenda
- Generate demo script
- Draft go-live email
- Create final payment reminder

### Phase 10: Post-Launch Support

**Ask Claude:**
```
"Create the 2-week support plan for [Client Name]."
```

**Claude will help you:**
- Generate check-in schedule
- Create monitoring checklist
- Draft check-in emails
- Compile system stats

### Phase 11: Handoff to Support

**Ask Claude:**
```
"Create support documentation for [Client Name] handoff."
```

**Claude will help you:**
- Document system architecture
- List known issues/quirks
- Create emergency contacts
- Generate handoff meeting agenda

### Phase 12: Ongoing

**Ask Claude:**
```
"Set up Command Partner cadence for [Client Name]."
```

**Claude will help you:**
- Create monthly review agenda
- Set up support tracking
- Generate testimonial request
- Plan quarterly tune-ups

---

## Common Workflows

### New Client Complete Walkthrough

```
1. "New client signed: [Name], [Business Type], [Modules needed]"
2. "Create welcome email for [Client]"
3. "Prep kickoff agenda for [Client]"
4. "Set up folder structure for [Client]"
5. "Install [modules] for [Client]"
6. "Customize templates for [Client]"
7. "Generate OAuth flow for [Client]"
8. "Create test plan for [Client]"
9. "Create user docs for [Client]"
10. "Prep training for [Client]"
11. "Create go-live email for [Client]"
12. "Set up post-launch monitoring for [Client]"
```

### Troubleshooting Workflow

```
1. "[Issue description]"
2. "Check execution logs for [Client]"
3. "Review Config.gs settings"
4. "Test [specific function]"
5. "Document fix for future reference"
```

### Upsell Workflow

```
1. "Identify upsell opportunity for [Client]"
2. [Switch to direction-protocol skill]
3. "Prepare scope expansion proposal"
4. [Return to command-protocol]
5. "Implement additional module"
```

---

## Tips and Best Practices

### Before Starting a New Client

1. **Review the Map stage notes** from Direction Protocol
2. **Confirm module selection** matches client needs
3. **Verify payment** received before starting work
4. **Block calendar time** for each phase

### During Development

1. **Use the module installer** - don't rebuild from scratch
2. **Test incrementally** - don't wait until the end
3. **Document as you go** - easier than documenting later
4. **Save all credentials** in 1Password immediately

### During Training

1. **Record the session** for client reference
2. **Start with the dashboard** they'll use daily
3. **Demonstrate the most important action first**
4. **Leave time for questions**

### Post-Launch

1. **Monitor Day 1 closely** - catch issues early
2. **Proactive communication** beats reactive
3. **Compile stats** for the 2-week check-in
4. **Request testimonial** while satisfaction is high

---

## Integration with Other Skills

### From Direction Protocol

When a client completes the Direction Protocol LAUNCH stage:
```
"Client [Name] just launched. Transition to Command Protocol."
```

### To Documentation Skill

When creating formal deliverables:
```
"Create formatted user guide document for [Client Name]."
```

### To Bearing Check

When evaluating scope changes:
```
"Client wants to add [feature]. Should we include this?"
```

### Back to Direction Protocol

When identifying upsell opportunities:
```
"[Client] needs additional modules. Prepare upsell conversation."
```

---

## Quick Reference

### Time Estimates by Phase

| Phase | Time | Cumulative |
|-------|------|------------|
| 1. Post-Launch Setup | 1 hr | 1 hr |
| 2. Kickoff | 1 hr | 2 hrs |
| 3. Technical Setup | 2 hrs | 4 hrs |
| 4. Development | 4 hrs | 8 hrs |
| 5. Customization | 2 hrs | 10 hrs |
| 6. OAuth | 0.5 hr | 10.5 hrs |
| 7. Testing | 1 hr | 11.5 hrs |
| 8. Documentation | 1 hr | 12.5 hrs |
| 9. Training & Launch | 1 hr | 13.5 hrs |
| 10. Post-Launch | 1.5 hrs | 15 hrs |

### Payment Checkpoints

| Checkpoint | Amount | When |
|------------|--------|------|
| Deposit | 50% | Contract signed |
| Final | 50% | Go-live complete |

### Email Templates

| # | Name | Phase |
|---|------|-------|
| 1 | Welcome | 1 |
| 4 | Authorization | 6 |
| 5 | Training Invite | 9 |
| 6 | Go-Live | 9 |
| 7 | 2-Week Check-In | 10 |

---

## Troubleshooting

### "Skill doesn't activate"

Try these trigger phrases:
- "Command Protocol for [client]"
- "Implement module for [client]"
- "Client delivery phase [X]"

### "Need module not listed"

1. Check if it exists in the installer folder
2. If new module needed, create from closest template
3. Document new module for future use

### "Client OAuth keeps failing"

1. Verify redirect URI in Cloud Console
2. Check script ID matches
3. Confirm client is using correct Google account
4. Re-run getAuthorizationUrl()

### "Automation not triggering"

1. Check trigger is created: `ScriptApp.getProjectTriggers()`
2. Review execution logs
3. Verify function name matches trigger
4. Check for script errors

---

## File Locations Reference

| Resource | Location |
|----------|----------|
| Module Installer | `<REPO_ROOT>\Desktop\TNDS-Command-Center\10_COMMANDS\client-google-apps-module-setup` |
| Client Folders | Google Drive: `[Client Name] Command Center/` |
| Templates | `10_COMMANDS\templates\` |
| Email Templates | `10_COMMANDS\email-templates\` |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 2026 | Initial release |

---

*Direction Protocol gets you clarity. Command Protocol gets you control. That's how we turn data into direction.*

---

## Legal

**Confidentiality Notice:** This document contains proprietary methodology and trade secrets of True North Data Strategies LLC. Unauthorized reproduction, distribution, or disclosure is prohibited.

**Trademarks:** Direction Protocol™, Command Protocol™, Bearing Check™, World Model Mapper™, ARO Assessment™, Battle Rhythm Install™, and Command Center Build™ are trademarks of True North Data Strategies LLC.

---

© 2026 True North Data Strategies LLC. All rights reserved.
