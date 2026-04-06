# Sentry Error Triage & Analysis

**Trigger:** On-demand or every 6 hours  
**Duration:** ~10 minutes  
**Output:** Detailed error analysis + recommended fixes

---

## Objective

Deep dive into recent Sentry errors to:
- Identify root causes
- Determine severity and impact
- Provide fix recommendations
- Track error trends

---

## Step 1: Retrieve Recent Issues

**Tool:** Sentry MCP  
**Action:** `Sentry:search_issues`

**Parameters:**
```json
{
  "query": "is:unresolved",
  "project": "pipeline-punks-nextjs",
  "statsPeriod": "6h",
  "sort": "freq",
  "limit": 10
}
```

**Output:** List of top 10 issues by frequency

---

## Step 2: Analyze Each Critical Issue

For each issue with >5 events in the period:

### 2a. Get Issue Details

**Tool:** Sentry MCP  
**Action:** `Sentry:get_issue_details`

**Parameters:**
```json
{
  "issue_id": "[from step 1]"
}
```

**Extract:**
- Error message
- Stack trace
- Browser/device info
- User impact (how many users affected)
- First seen / last seen timestamps

---

### 2b. Get Recent Events

**Tool:** Sentry MCP  
**Action:** `Sentry:search_issue_events`

**Parameters:**
```json
{
  "issue_id": "[from step 1]",
  "query": "",
  "limit": 5
}
```

**Analysis:**
- Is this a new error or regression?
- Is it user-specific or widespread?
- Does it correlate with a deployment? (Check timestamps)
- What user actions trigger it?

---

### 2c. Check for Related Issues

**Tool:** Sentry MCP  
**Action:** `Sentry:search_issues`

**Parameters:**
```json
{
  "query": "[error type or file path from stack trace]",
  "project": "pipeline-punks-nextjs",
  "statsPeriod": "14d"
}
```

**Analysis:**
- Is this part of a larger pattern?
- Have similar errors been resolved before?
- Are multiple components affected?

---

## Step 3: Categorize and Prioritize

For each error, assign:

### Severity Score (1-5)

**5 - Critical:**
- Breaks core functionality (contact forms, payment, data loss)
- Affects >50% of users
- Recurring frequently (>10 events/hour)

**4 - High:**
- Breaks secondary features
- Affects 10-50% of users
- Recurring regularly (>5 events/hour)

**3 - Medium:**
- Degrades user experience but workarounds exist
- Affects <10% of users
- Sporadic (1-5 events/hour)

**2 - Low:**
- Minor UI issues
- Affects <1% of users
- Rare (< 1 event/hour)

**1 - Noise:**
- Bot traffic
- Browser extension conflicts
- Known issues with no fix needed

---

### Root Cause Category

- **Code Bug:** Logic error, null reference, type mismatch
- **Integration Issue:** API timeout, external service failure
- **Environment:** Missing env vars, config mismatch
- **Browser Compatibility:** Specific browser/version issue
- **User Error:** Invalid input, unexpected behavior
- **Infrastructure:** Network issue, deployment problem

---

## Step 4: Generate Fix Recommendations

For each high/critical error:

**Template:**

```markdown
## Issue: [Error Title]

**Sentry Link:** [URL]

**Severity:** [1-5] - [Critical/High/Medium/Low/Noise]

**Impact:**
- Events: [count] in last 6 hours
- Users affected: [count or percentage]
- First seen: [timestamp]

**Root Cause:** [Category]

**Analysis:**
[Based on stack trace, events, and context - provide detailed explanation]

**Recommended Fix:**
[Specific code changes, config updates, or investigation steps]

**Example:**
File: `src/app/contact/page.tsx`
Line: 127
Change:
```typescript
// Before:
const email = formData.email.toLowerCase();

// After:
const email = formData?.email?.toLowerCase() || '';
```

**Priority:** [High/Medium/Low]

**Effort:** [Quick fix / 1-2 hours / Half day / Full day+]

**Testing:**
[How to reproduce and verify fix]
```

---

## Step 5: Track Trends

### 5a. Compare to Previous Period

**Tool:** Sentry MCP  
**Action:** `Sentry:search_events`

**Parameters for current period:**
```json
{
  "query": "event.type:error",
  "project": "pipeline-punks-nextjs",
  "statsPeriod": "6h"
}
```

**Parameters for previous period:**
```json
{
  "query": "event.type:error",
  "project": "pipeline-punks-nextjs",
  "start": "12h",
  "end": "6h"
}
```

**Calculate:**
- Trend direction: ↑ increasing, → stable, ↓ decreasing
- Percentage change
- New error types introduced

---

### 5b. Identify Patterns

**Questions to answer:**
- Are errors clustered around specific times? (Deployment correlation?)
- Are errors device-specific? (Mobile vs desktop)
- Are errors user-segment specific? (Logged in vs anonymous)
- Are errors route-specific? (Which pages have most errors)

---

## Step 6: Generate Report

### Output Format

```markdown
# Sentry Error Analysis Report
**Generated:** [Timestamp]
**Period:** Last 6 hours

---

## Executive Summary

- Total errors: [count]
- Trend: [↑/→/↓] [X%] vs previous 6h
- Critical issues: [count]
- Users impacted: [count or %]
- Action required: [YES/NO]

---

## Critical Issues (Severity 4-5)

[For each critical issue, use template from Step 4]

---

## Medium Issues (Severity 3)

[Brief list with Sentry links]

---

## Trends & Patterns

**Error Distribution:**
- [Route/component]: [X]% of errors
- [Browser]: [X]% of errors
- [Time period]: Peak errors at [time]

**New Issues:**
- [List any new error types first seen in this period]

**Resolved:**
- [List any issues marked as resolved in this period]

---

## Recommended Actions

**Immediate (Today):**
1. [Fix for critical issue #1]
2. [Fix for critical issue #2]

**This Week:**
1. [Fix for high-priority issue]
2. [Investigation for pattern identified]

**Backlog:**
- [Lower priority fixes]

---

## Deployment Risk Assessment

**Safe to deploy?**
- ✅ YES - Error rate stable, no critical issues
- ⚠️ CAUTION - Monitor closely, critical issue exists but isolated
- ❌ NO - Critical issues affecting users, fix first

---

Generated by Pipeline Penny via Cowork
```

---

## Step 7: Post Results

**If Critical Issues Found:**
- Post to Slack #tech-alerts
- Tag yourself
- Include top 2-3 issues with fix recommendations

**If No Critical Issues:**
- Post summary to Slack #ops-daily
- "Sentry check complete - [X] total errors, all low severity"

**Always:**
- Save full report to: `~/cowork-reports/sentry-analysis-[YYYY-MM-DD-HHMM].md`
- Update tracking spreadsheet (if you maintain one)

---

## Advanced: Auto-Resolution

For known noise patterns, use Sentry MCP to auto-resolve:

**Tool:** Sentry MCP  
**Action:** `Sentry:update_issue`

**Example - Resolve bot errors:**
```json
{
  "issue_id": "[from step 1]",
  "status": "resolved",
  "statusDetails": {
    "inNextRelease": false
  }
}
```

**Criteria for auto-resolution:**
- Issue tagged as "bot-traffic"
- Error message contains known false positive patterns
- User-agent indicates crawler/bot
- You've manually resolved this pattern 3+ times

---

## Notes

**First Time Setup:**
- Run manually to establish baseline
- Identify which errors are "normal noise" vs actionable
- Create Sentry issue tags: `critical`, `bot-traffic`, `known-issue`, `investigating`

**Customization:**
- Adjust severity thresholds based on your traffic volume
- Add custom analysis for your specific error patterns
- Integrate with GitHub Issues (create issue from Sentry link)

**Integration with Daily Standup:**
- Daily standup shows counts
- This playbook provides the deep dive when counts are elevated
- Run this before starting work on any Sentry-flagged issues

---

## Maintenance

**Weekly:**
- Review auto-resolution rules (are we missing real errors?)
- Update error categorization based on actual fixes
- Tune notification thresholds

**After Major Deployments:**
- Run this immediately post-deploy
- Compare error patterns before/after
- Quick rollback decision if error rate spikes
