\# TNDS Prompt Engineering - Quick Reference



\## Fast Path Decision Tree



```

What do you need to do?

│

├─ Create new prompt → Use Phase 2A

│  ├─ Ask 3-5 discovery questions

│  ├─ Create 5-8 arm variations

│  ├─ Define 1 primary + 2 guardrail metrics

│  └─ Set up logging \& deploy

│

├─ Fix broken prompt → Use Phase 2B

│  ├─ Diagnose specific issue

│  ├─ Create ONE variant (don't edit existing)

│  ├─ Add to pool at 5-10% weight

│  └─ Monitor for 1-2 weeks

│

├─ Compare options → Use Phase 2C

│  ├─ Set up comparison test

│  ├─ Log results for 2-4 weeks

│  ├─ Review metrics

│  └─ Make decision

│

└─ Remove old prompt → Use Phase 2D

&nbsp;  ├─ Confirm retirement criteria

&nbsp;  ├─ Mark deprecated (Week 1)

&nbsp;  ├─ Archive (Week 2)

&nbsp;  └─ Final removal (Week 3+)

```



\## 5 Most Common Prompt Arm Types



1\. \*\*Strict Structured:\*\* Force exact format (JSON, schema)

2\. \*\*Clarify-First:\*\* Ask question if input ambiguous

3\. \*\*Evidence-Only:\*\* Only use provided sources (RAG-safe)

4\. \*\*Confidence Score:\*\* Flag uncertain outputs for review

5\. \*\*Tool-First:\*\* Decide if external tool needed, then act



\## Metrics Formula



\*\*ONE Primary Metric:\*\*

\- Task completion rate, OR

\- User acceptance rate, OR  

\- Human review success label



\*\*TWO Guardrail Metrics:\*\*

\- Hallucination/error flag (<2%)

\- Format compliance (>98%)

\- Safety violations (0%)

\- Cost budget (<$0.01/request)

\- Latency budget (<2000ms)



\*\*Rule:\*\* Reward "useful" + Punish "confidently wrong" + Track cost



\## Thompson Sampling in 3 Steps



1\. \*\*Track:\*\* Successes and failures for each arm

2\. \*\*Sample:\*\* Draw from Beta(successes+1, failures+1) for each arm

3\. \*\*Select:\*\* Pick arm with highest sample



Update daily/hourly (not every request)



\## Common Mistakes to Avoid



❌ \*\*Modifying prompt directly\*\* → ✅ Create variant, test side-by-side  

❌ \*\*Using only thumbs-up metric\*\* → ✅ Add guardrails (hallucination, format)  

❌ \*\*Testing 20+ arms\*\* → ✅ Start with 5-8 arms  

❌ \*\*Picking winner after 10 tests\*\* → ✅ Wait for 100+ requests per arm  

❌ \*\*Using winner 100%\*\* → ✅ Keep 10-20% exploration forever  

❌ \*\*Updating weights every request\*\* → ✅ Update daily/hourly  

❌ \*\*Emotional tweaking when fails\*\* → ✅ Create variant, A/B test it



\## When to Retire an Arm



Retire if:

\- Consistently bottom performer for 2+ months

\- <5% traffic share for 2+ months

\- Replaced by strictly better approach

\- Outdated (model deprecated, use case changed)



Don't retire if:

\- Handles specific edge cases well

\- Recent addition (needs more testing)

\- Part of exploration budget



\## Logging Checklist



Minimum required fields:

\- \[ ] timestamp

\- \[ ] arm\_id

\- \[ ] primary\_metric (0 or 1)

\- \[ ] guardrail\_1 (0 or 1)

\- \[ ] guardrail\_2 (0 or 1)

\- \[ ] cost\_usd

\- \[ ] latency\_ms



Storage options:

\- Google Sheets (development)

\- BigQuery (production)

\- Always append-only (never delete)



\## Testing Timeline



| Traffic Level | Update Frequency | Test Duration | Sample Size |

|---------------|------------------|---------------|-------------|

| High (1000+/day) | Hourly | 3-5 days | 100+/arm |

| Medium (100-1000/day) | Daily | 1-2 weeks | 100+/arm |

| Low (<100/day) | Weekly | 2-4 weeks | 50+/arm |



\## Emergency Procedures



\*\*If prompt breaks production:\*\*

1\. Immediately route 100% to last known good arm

2\. Mark broken arm as deprecated

3\. Investigate failure (logs, examples)

4\. Create fix variant

5\. Test variant at 10% before scaling up



\*\*If all arms failing:\*\*

1\. Check if input data format changed

2\. Verify metrics calculation still correct

3\. Review recent model updates

4\. Fallback to human routing temporarily

5\. Create emergency fix arm



\## 1-Page Prompt Arm Template



```markdown

\## Prompt Arm: \[NAME]

\*\*ID:\*\* \[unique-id-v1]

\*\*Created:\*\* \[YYYY-MM-DD]

\*\*Use Case:\*\* \[when this works best]



\*\*System Prompt:\*\*

\[exact text]



\*\*User Prompt:\*\*

\[template with {{variables}}]



\*\*Success Criteria:\*\*

\- Primary: \[metric] > \[threshold]

\- Guard 1: \[metric] > \[threshold]

\- Guard 2: \[metric] < \[threshold]



\*\*Limitations:\*\*

\[what this doesn't handle]

```



\## Code Snippets



\*\*Select arm (Google Apps Script):\*\*

```javascript

function selectArm() {

&nbsp; const sheet = SpreadsheetApp.getActiveSpreadsheet()

&nbsp;   .getSheetByName('PromptConfig');

&nbsp; const data = sheet.getDataRange().getValues();

&nbsp; 

&nbsp; let best = {arm: null, sample: -1};

&nbsp; for (let i = 1; i < data.length; i++) {

&nbsp;   const s = data\[i]\[1], f = data\[i]\[2];

&nbsp;   const sample = sampleBeta(s+1, f+1);

&nbsp;   if (sample > best.sample) {

&nbsp;     best = {arm: data\[i]\[0], sample};

&nbsp;   }

&nbsp; }

&nbsp; return best.arm;

}

```



\*\*Log result (Google Apps Script):\*\*

```javascript

function logResult(armId, success, guardrails) {

&nbsp; SpreadsheetApp.getActiveSpreadsheet()

&nbsp;   .getSheetByName('PromptLogs')

&nbsp;   .appendRow(\[

&nbsp;     new Date(), armId, success,

&nbsp;     guardrails.g1, guardrails.g2

&nbsp;   ]);

}

```



\## TNDS Integration Points



\*\*Command Center Modules:\*\*

\- Store arm configs in module's data-command

\- Log to module analytics dashboard

\- Review monthly with module performance



\*\*Client Deliverables:\*\*

\- Document arms in project folder

\- Align metrics with client SLA

\- Transfer ownership post-delivery



\*\*Internal Automation:\*\*

\- Focus on cost/latency optimization

\- Share learnings across team

\- Iterate quickly (weekly reviews)



\## Support Contacts



\*\*Prompt Engineering Questions:\*\*

Jacob Johnston  

jacob@truenorthstrategyops.com  

555-555-5555



\*\*Technical Implementation:\*\*

TNDS Operations Team  

Via Slack #operations channel



\*\*Skill Updates:\*\*

Check `/mnt/skills/user/prompt-engineering/` for latest version



---



\*\*Print this page and keep at desk for quick reference\*\*



Version 1.0 | Last Updated: 2026-02-13

