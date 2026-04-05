---
name: command-protocol
description: TNDS Command Protocol - Complete client delivery process from contract signing through go-live and ongoing support. Use when implementing Command modules, running through delivery phases, creating client documentation, setting up Google Apps Script projects, configuring automations, conducting training, or managing post-launch support. Triggers on phrases like "client delivery", "implement for client", "install module", "set up command center", "build for client", "training session", "go-live", "post-launch", "Command Protocol", "technical setup", or when transitioning from Direction Protocol to delivery. Integrates with the module installer at the 10_COMMANDS path for standardized deployments.
---

# TNDS Command Protocol™ Skill

A structured, twelve-phase delivery process for implementing Command modules and putting clients in command of their operations.

## Core Principle

We don't just build systems. We put clients in command of their operations.

**The Transformation:** Direction Protocol gets you clarity. Command Protocol gets you control. That's how we turn data into direction.

## Module Installer Location

```
<REPO_ROOT>\Desktop\TNDS-Command-Center\10_COMMANDS\client-google-apps-module-setup
```

This installer contains templates and setup scripts for all Command modules. Reference it during Phase 4 (Development) for standardized deployments.

## Protocol Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMMAND PROTOCOL                                     │
│                     12-Phase Delivery Process                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FROM DIRECTION PROTOCOL (LAUNCH stage)                                     │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  PHASE 1    │  │  PHASE 2    │  │  PHASE 3    │  │  PHASE 4    │        │
│  │ Post-Launch │─▶│   Kickoff   │─▶│  Technical  │─▶│ Development │        │
│  │   Setup     │  │             │  │    Setup    │  │             │        │
│  │   (1 hr)    │  │   (1 hr)    │  │   (2 hrs)   │  │   (4 hrs)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────┬──────┘        │
│                                                            │               │
│       ┌────────────────────────────────────────────────────┘               │
│       ▼                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  PHASE 5    │  │  PHASE 6    │  │  PHASE 7    │  │  PHASE 8    │        │
│  │Customization│─▶│   OAuth &   │─▶│   Testing   │─▶│Documentation│        │
│  │             │  │    Auth     │  │             │  │             │        │
│  │   (2 hrs)   │  │  (0.5 hr)   │  │   (1 hr)    │  │   (1 hr)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────┬──────┘        │
│                                                            │               │
│       ┌────────────────────────────────────────────────────┘               │
│       ▼                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  PHASE 9    │  │  PHASE 10   │  │  PHASE 11   │  │  PHASE 12   │        │
│  │  Training & │─▶│ Post-Launch │─▶│  Handoff to │─▶│   Ongoing   │        │
│  │   Launch    │  │   Support   │  │   Support   │  │             │        │
│  │   (1 hr)    │  │  (1.5 hrs)  │  │ (as needed) │  │ (continuous)│        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  TOTAL ESTIMATED TIME: 15 hours per Command Center Build                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Command Modules Reference

| Module | Purpose | Typical Use Case |
|--------|---------|------------------|
| data-command | Central data management | Single source of truth |
| financial-command | Money tracking, job costing | Profitability visibility |
| analytics-command | Reporting and KPIs | Dashboard metrics |
| asset-command | Equipment/fleet tracking | Field service operations |
| office-command | Admin workflow | Back-office efficiency |
| onboard-command | New hire/client onboarding | Consistent processes |
| proposal-command | Quotes and proposals | Sales automation |
| workspace-command | Google Workspace automation | Email, calendar, docs |
| sms-command | Text notifications | Alerts and reminders |
| contract-command | Contract management | Legal document tracking |
| realty-command | Real estate specific | MLS, transaction tracking |
| tax-command | Tax tracking | Compliance and reporting |
| seo-command | SEO tracking | Marketing metrics |
| govcon-command | Government contracting | Federal procurement |
| compliance-gov-module | Government compliance | Regulatory requirements |

## Phase Details

### Phase 1: Post-Launch Setup (1 hour)

**Purpose:** Complete administrative setup after Direction Protocol LAUNCH.

**Checklist:**
- [ ] Service Agreement signed
- [ ] 50% deposit received
- [ ] Welcome email sent
- [ ] Kickoff call scheduled
- [ ] Pre-call prep list sent

**Key Deliverable:** Kickoff meeting scheduled with client

### Phase 2: Kickoff (1 hour)

**Purpose:** Confirm scope, define success metrics, gather technical requirements.

**Checklist:**
- [ ] Current workflow documented
- [ ] Pain points confirmed from Map stage
- [ ] Success metrics defined
- [ ] System access requirements confirmed
- [ ] Command modules confirmed

**Key Questions:**
1. What does success look like in 90 days?
2. Who needs access to the system?
3. What systems do we need to connect?
4. What's your preferred communication channel?

**Key Deliverable:** Confirmed module list and success metrics

### Phase 3: Technical Setup (2 hours)

**Purpose:** Configure Google Workspace, gather system access, create folder structure.

**Checklist:**
- [ ] Google Workspace user created (if applicable)
- [ ] Client folder structure created
- [ ] System access credentials collected
- [ ] Passwords saved in 1Password
- [ ] OAuth requirements identified

**Standard Folder Structure:**
```
[Client Name] Command Center/
├── 01_Documentation/
├── 02_Data/
├── 03_Templates/
├── 04_Scripts/
└── 05_Support/
```

**Key Deliverable:** All access configured, folders created

### Phase 4: Development (4 hours)

**Purpose:** Build the core system using Apps Script and Command module templates.

**Module Installation Steps:**

1. **Navigate to Installer:**
   ```
   <REPO_ROOT>\Desktop\TNDS-Command-Center\10_COMMANDS\client-google-apps-module-setup
   ```

2. **Create Apps Script Project:**
   - Project name: [Client] Command Center
   - Record Project ID and Script URL

3. **Add OAuth2 Library:**
   ```
   Library ID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF
   ```

4. **Deploy Script Files:**
   - Config.gs (customize with client details)
   - OAuth.gs (from template)
   - EmailSender.gs (from template)
   - Automation.gs (customize for client)
   - [Module].gs files as needed

5. **Configure Script Properties:**
   - Run setupScriptProperties()
   - Save OAUTH_CLIENT_ID
   - Save OAUTH_CLIENT_SECRET

6. **Google Cloud Console:**
   - Add OAuth redirect URI
   - Format: `https://script.google.com/macros/d/[SCRIPT_ID]/usercallback`

7. **Data Sheets:**
   - Create client data sheet
   - Add Sheet ID to Config.gs
   - Configure sharing permissions

**Key Deliverable:** Core system built and configured

### Phase 5: Customization (2 hours)

**Purpose:** Apply client branding and configure business logic.

**Branding Checklist:**
- [ ] Logo received and applied
- [ ] Primary color defined
- [ ] Secondary color defined
- [ ] Email templates customized

**Business Logic:**
- [ ] Automation triggers configured
- [ ] Email templates finalized
- [ ] Rules and conditions set
- [ ] Output formats configured (PDF, email, sheet)

**Key Deliverable:** System customized for client brand and workflow

### Phase 6: OAuth and Authorization (0.5 hours)

**Purpose:** Get client authorization for system access.

**Process:**
1. Generate authorization URL: `getAuthorizationUrl()`
2. Send authorization email to client
3. Client clicks link and authorizes
4. Verify: `isAuthorized()` returns true

**Key Deliverable:** Client authorization complete

### Phase 7: Testing (1 hour)

**Purpose:** Verify system works correctly before client training.

**Unit Tests:**
- [ ] Test email sending (testEmail())
- [ ] Test data processing
- [ ] Test automation triggers
- [ ] Review logs for errors

**Integration Tests:**
- [ ] End-to-end workflow
- [ ] Error handling
- [ ] Edge cases (empty data, invalid email, API failure)

**Key Deliverable:** All tests passing

### Phase 8: Documentation (1 hour)

**Purpose:** Create user guides and training materials.

**Standard Documentation:**
1. System overview (technical)
2. Dashboard user guide
3. Data management guide
4. Troubleshooting guide
5. Step-by-step walkthrough
6. FAQ document

**Key Deliverable:** Complete user documentation in client folder

### Phase 9: Training and Launch (1 hour)

**Purpose:** Train client and activate the system.

**Pre-Training:**
- [ ] Create daily trigger
- [ ] Send training invite
- [ ] Prepare demo data

**Training Session:**
- [ ] Walk through dashboard
- [ ] Demonstrate first action
- [ ] Answer questions
- [ ] Confirm access

**Go-Live:**
- [ ] Activate system
- [ ] Run first automated action
- [ ] Send go-live email
- [ ] Collect final 50% payment

**Key Deliverable:** System live, client trained, final payment received

### Phase 10: Post-Launch Support (1.5 hours)

**Purpose:** Monitor and support client during initial 2-week period.

**Week 1:**
- Day 1: Monitor first automated run
- Day 3: Send check-in email
- Day 7: Review execution logs, document feedback

**Week 2:**
- Monitor daily operations
- Respond to questions
- Make minor adjustments

**Day 14:**
- Send 2-week check-in email
- Compile system stats
- Complete final adjustments
- Begin Command Partner support (if applicable)

**Key Deliverable:** Stable system, satisfied client

### Phase 11: Handoff to Support

**Purpose:** Document and transfer knowledge for team scaling.

**Checklist:**
- [ ] Add to support roster
- [ ] Create support documentation
- [ ] Share credentials
- [ ] Complete handoff meeting

**Key Deliverable:** Complete support documentation

### Phase 12: Ongoing

**Purpose:** Manage monthly retainer and long-term relationship.

**Setup:**
- [ ] Stripe subscription created
- [ ] Add to client roster
- [ ] Request testimonial

**Monthly Cadence (Command Partner):**
- Week 1: Monthly review call (90 min)
- Week 2-3: On-call support (up to 4 hrs)
- Week 4: Prep for next month
- Quarterly: System tune-up

**Key Deliverable:** Ongoing relationship established

## Pricing Quick Reference

### Command Center Build Scoring

| Score | Price |
|-------|-------|
| 5-7 points | $2,500 |
| 8-11 points | $3,500 |
| 12-15 points | $5,000 |

**Scoring Factors (1-3 points each):**
- Number of employees (5-8 / 9-14 / 15-20)
- Current state (Organized / Scattered / Chaos)
- Data sources (2-3 / 4-5 / 6+)
- Owner availability (Available / Busy / Hard to reach)
- Technical comfort (Quick learner / Needs support / Resistant)

**Adjustments:**
- Add $500-1,000: Multiple locations, field AND office, custom reporting
- Subtract $500: Some systems working, very small, strong referral

### Payment Terms

| Project Size | Structure |
|--------------|-----------|
| Under $4,000 | 50% start, 50% completion |
| Over $4,000 | 40% start, 30% midpoint, 30% completion |

## The Three Services

| Service | What It Is | Price | Timeline |
|---------|------------|-------|----------|
| Command Center Build | Install visibility + Command modules | $2,500-5,000 | 2-4 weeks |
| Battle Rhythm Install | Install operating cadence + accountability | $2,000-4,000 | 2-4 weeks |
| Command Partner | Ongoing fractional ops support | $1,000-2,000/mo | Monthly |

## Email Templates Reference

| Template | When to Use | Phase |
|----------|-------------|-------|
| #1 Welcome | After contract signed | 1 |
| #4 Authorization | When OAuth needed | 6 |
| #5 Training Invite | Before training session | 9 |
| #6 Go-Live | After system activated | 9 |
| #7 2-Week Check-In | End of free support | 10 |

## Integration with Other Skills

### Skill Workflow

```
DIRECTION PROTOCOL (Sales)
        │
        │ Client signs → LAUNCH
        │
        ▼
COMMAND PROTOCOL (Delivery) ← THIS SKILL
        │
        ├── Phase 4 (Development): Use MODULE INSTALLER
        │   <REPO_ROOT>\Desktop\TNDS-Command-Center\10_COMMANDS\
        │   client-google-apps-module-setup
        │
        ├── Phase 8 (Documentation): Use DOCUMENTATION skill
        │
        └── Ongoing: Loop back to DIRECTION PROTOCOL for upsells
```

### When to Use Each

| Situation | Use This Skill | Use Other Skill |
|-----------|----------------|-----------------|
| Installing modules for client | **command-protocol** | - |
| Creating client docs | command-protocol | documentation (for formatting) |
| Upsell opportunity identified | - | direction-protocol |
| Decision about scope change | - | bearing-check |

## Troubleshooting Reference

### Common Issues

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| OAuth fails | Redirect URI mismatch | Check Cloud Console config |
| Emails not sending | Authorization expired | Re-run OAuth flow |
| Trigger not firing | Script error | Check execution logs |
| Data not syncing | Sheet ID wrong | Verify Config.gs |
| Client can't access | Permissions | Check folder sharing |

### Support Escalation

| Severity | Response Time | Example |
|----------|---------------|---------|
| Critical | Same day | System completely down |
| High | 24 hours | Major feature broken |
| Medium | 48 hours | Minor bug, workaround exists |
| Low | 1 week | Enhancement request |

## Quick Reference Card

**Total Time:** 15 hours per Command Center Build

**Key Milestones:**
1. Kickoff complete → Scope confirmed
2. Development complete → System built
3. Testing complete → Ready for training
4. Training complete → Go-live
5. Day 14 → Free support ends

**Payment Milestones:**
- 50% at contract signing
- 50% at go-live

**Don't Forget:**
- Save all credentials in 1Password
- Document everything in client folder
- Get testimonial before moving to ongoing

---

*Direction Protocol™ gets you clarity. Command Protocol™ gets you control. That's how we turn data into direction.*

---

## Confidentiality Notice

This document contains proprietary methodology and trade secrets of True North Data Strategies LLC. Unauthorized reproduction, distribution, or disclosure is prohibited.

---

© 2026 True North Data Strategies LLC. All rights reserved.

*Command Protocol™, Direction Protocol™, Battle Rhythm Install™, and Command Center Build™ are trademarks of True North Data Strategies LLC.*
