\# TNDS Prompt Engineering - Practical Examples \& Worksheets



\## Example 1: Email Data Extraction



\### Scenario

TNDS client needs to automatically extract customer information from incoming service request emails to populate their CRM.



\### Discovery Questions \& Answers



\*\*Q1: What should this accomplish?\*\*

A: Extract customer name, phone number, service address, and requested service type from emails.



\*\*Q2: What does good look like?\*\*

A: Clean JSON output with four fields: customer\_name, phone, service\_address, service\_type. Missing fields should be null, not hallucinated.



\*\*Q3: What information will be available?\*\*

A: Full email text including subject line, sender email address, and email body. Some customers forward previous emails, so there might be quoted text.



\*\*Q4: Who uses the output?\*\*

A: Automatically creates CRM lead record. If extraction confidence is low, flags for human review.



\*\*Q5: What should never happen?\*\*

A: Wrong phone numbers, incorrect addresses, hallucinated customer names, or misidentified service types.



\### Prompt Arms Created



\*\*Arm 1: strict-json-v1\*\*

```

You are a data extraction assistant. Extract the following from the email:

\- customer\_name

\- phone (format: XXX-XXX-XXXX)

\- service\_address

\- service\_type (must be one of: plumbing, electrical, hvac, general)



Output ONLY valid JSON. If a field is not found, use null. Do not guess or infer.



Output format:

{

&nbsp; "customer\_name": "string or null",

&nbsp; "phone": "string or null",

&nbsp; "service\_address": "string or null",

&nbsp; "service\_type": "string or null"

}

```



\*\*Arm 2: clarify-first-v1\*\*

```

You are a data extraction assistant. First, determine if the email contains clear customer information.



If the email is forwarded, has multiple people mentioned, or is ambiguous, respond:

"CLARIFICATION\_NEEDED: \[brief question]"



If clear, extract:

\- customer\_name

\- phone (format: XXX-XXX-XXXX)

\- service\_address  

\- service\_type (must be one of: plumbing, electrical, hvac, general)



Output valid JSON. If a field is not found, use null.

```



\*\*Arm 3: evidence-only-v1\*\*

```

You are a data extraction assistant. Extract ONLY information explicitly stated in the email. Do not infer, guess, or assume.



Extract:

\- customer\_name (ONLY if explicitly stated, otherwise null)

\- phone (ONLY if explicitly stated, format: XXX-XXX-XXXX, otherwise null)

\- service\_address (ONLY if explicitly stated, otherwise null)

\- service\_type (ONLY if one of: plumbing, electrical, hvac, general is mentioned, otherwise null)



If any information is ambiguous or could refer to multiple people/addresses, set that field to null.



Output valid JSON.

```



\*\*Arm 4: confidence-score-v1\*\*

```

You are a data extraction assistant. Extract customer information and rate your confidence.



Extract:

\- customer\_name

\- phone (format: XXX-XXX-XXXX)

\- service\_address

\- service\_type (must be one of: plumbing, electrical, hvac, general)



For each field, include confidence: high/medium/low



Output format:

{

&nbsp; "customer\_name": {"value": "string or null", "confidence": "high|medium|low"},

&nbsp; "phone": {"value": "string or null", "confidence": "high|medium|low"},

&nbsp; "service\_address": {"value": "string or null", "confidence": "high|medium|low"},

&nbsp; "service\_type": {"value": "string or null", "confidence": "high|medium|low"},

&nbsp; "needs\_review": boolean

}

```



\*\*Arm 5: context-aware-v1\*\*

```

You are a data extraction assistant. Consider email context before extracting.



Rules:

1\. If email is a forward, look for the MOST RECENT customer information

2\. If multiple addresses mentioned, use the SERVICE ADDRESS, not billing/mailing

3\. If multiple phone numbers, prefer mobile over landline

4\. If service type unclear, set to "general"



Extract:

\- customer\_name

\- phone (format: XXX-XXX-XXXX)

\- service\_address

\- service\_type (must be one of: plumbing, electrical, hvac, general)



Output valid JSON. Include a "notes" field explaining any ambiguity.

```



\### Metrics Definition



\*\*Primary Metric:\*\*

Manual review of 10% sample - did extraction match what human would extract?



\*\*Guardrail 1:\*\*

Valid JSON format (schema validation)



\*\*Guardrail 2:\*\*

No hallucinated data (verified through spot checks)



\### Logging Template



Google Sheet with columns:

\- timestamp

\- arm\_id  

\- email\_id (hashed)

\- extraction\_success (0/1)

\- format\_valid (0/1)

\- hallucination\_flag (0/1)

\- manual\_review\_needed (0/1)

\- cost\_usd

\- latency\_ms



\### Expected Results After 2 Weeks



Based on similar implementations:

\- strict-json-v1: ~88% success (fails on edge cases)

\- clarify-first-v1: ~85% success (too many clarifications)

\- evidence-only-v1: ~90% success (conservative, reliable)

\- confidence-score-v1: ~92% success (best overall)

\- context-aware-v1: ~87% success (over-interprets sometimes)



\*\*Recommended routing:\*\*

\- 60% confidence-score-v1

\- 30% evidence-only-v1  

\- 10% exploration (rotate others)



---



\## Example 2: Support Ticket Routing



\### Scenario

Route incoming support tickets to correct department: Sales, Technical, Billing, or General.



\### Discovery Questions \& Answers



\*\*Q1: What should this accomplish?\*\*

A: Automatically classify support tickets into one of four departments so they reach the right team.



\*\*Q2: What does good look like?\*\*

A: Ticket routed correctly on first try. Customer doesn't get transferred.



\*\*Q3: What information will be available?\*\*

A: Ticket subject line, message body, customer account type (free/paid), previous ticket history count.



\*\*Q4: Who uses the output?\*\*

A: Ticket system automatically assigns to department queue. Wrong routing = customer frustration + team inefficiency.



\*\*Q5: What should never happen?\*\*

A: Technical issues routed to Sales, billing problems sent to Technical, or urgent matters misclassified.



\### Prompt Arms Created



\*\*Arm 1: dept-list-v1\*\*

```

Classify this support ticket into ONE department:

\- SALES: Product questions, pricing, demos, account upgrades

\- TECHNICAL: Bug reports, feature not working, integration issues, errors

\- BILLING: Payment problems, invoices, subscription changes, refunds

\- GENERAL: Everything else, unclear requests, general questions



Respond with ONLY the department name in caps: SALES, TECHNICAL, BILLING, or GENERAL



Ticket:

{{ticket\_text}}

```



\*\*Arm 2: urgency-first-v1\*\*

```

First, determine urgency:

\- CRITICAL: Service down, data loss, security issue

\- HIGH: Feature broken, affecting work

\- MEDIUM: General questions, minor issues

\- LOW: Nice-to-haves, suggestions



Then classify to department:

\- SALES, TECHNICAL, BILLING, or GENERAL



Output format:

{

&nbsp; "urgency": "CRITICAL|HIGH|MEDIUM|LOW",

&nbsp; "department": "SALES|TECHNICAL|BILLING|GENERAL"

}



Ticket:

{{ticket\_text}}

```



\*\*Arm 3: keyword-match-v1\*\*

```

Use these keyword indicators to classify:



TECHNICAL keywords: error, bug, broken, not working, crash, integration, API, login failed

BILLING keywords: charge, invoice, payment, refund, cancel subscription, credit card

SALES keywords: pricing, upgrade, demo, trial, features, compare plans

GENERAL keywords: question, how to, general inquiry, feedback



Choose the category with most keyword matches. If tied, choose TECHNICAL.



Output: SALES, TECHNICAL, BILLING, or GENERAL



Ticket:

{{ticket\_text}}

```



\*\*Arm 4: escalate-unclear-v1\*\*

```

Classify ticket to: SALES, TECHNICAL, BILLING, or GENERAL



If ticket is ambiguous, could apply to multiple departments, or you're uncertain, respond:

"ESCALATE\_HUMAN: \[brief reason]"



Only escalate if genuinely unclear. Most tickets should be classifiable.



Ticket:

{{ticket\_text}}

```



\*\*Arm 5: multi-factor-v1\*\*

```

Consider these factors:

1\. Customer account type: {{account\_type}}

2\. Previous ticket count: {{ticket\_count}}

3\. Ticket content: {{ticket\_text}}



Classification rules:

\- Free accounts asking about features → SALES

\- Paid accounts with errors → TECHNICAL (high priority)

\- Payment questions always → BILLING

\- Vague questions from new users (ticket\_count < 3) → GENERAL



Output department: SALES, TECHNICAL, BILLING, or GENERAL

```



\### Metrics Definition



\*\*Primary Metric:\*\*

Ticket NOT reassigned to different department within 24 hours



\*\*Guardrail 1:\*\*

<5% escalated to human review (avoid overusing)



\*\*Guardrail 2:\*\*

Zero critical/urgent tickets sent to wrong department



\### Results After 3 Weeks



\- dept-list-v1: 89% success

\- urgency-first-v1: 84% success (over-complicates)

\- keyword-match-v1: 78% success (too brittle)

\- escalate-unclear-v1: 91% success, BUT 18% escalation rate (too cautious)

\- multi-factor-v1: 93% success (winner)



\*\*Final routing:\*\*

\- 70% multi-factor-v1

\- 20% dept-list-v1 (simple, reliable)

\- 10% exploration



---



\## Worksheet: New Prompt Creation



\### Project Name: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



\### STEP 1: Discovery

\*\*What should this accomplish?\*\*

\[Answer:]



\*\*What does good look like?\*\*

\[Answer:]



\*\*What information will be available?\*\*

\[Answer:]



\*\*Who uses the output?\*\*

\[Answer:]



\*\*What should never happen?\*\*

\[Answer:]



\### STEP 2: Prompt Arms (Create 5-8)



\*\*Arm 1 Name:\*\* \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\*\*Approach:\*\* 

\[Description:]



\*\*Prompt Text:\*\*

```

\[Write prompt here]

```



\*\*Arm 2 Name:\*\* \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\*\*Approach:\*\* 

\[Description:]



\*\*Prompt Text:\*\*

```

\[Write prompt here]

```



\[Continue for Arms 3-8]



\### STEP 3: Metrics



\*\*Primary Metric (choose one):\*\*

\- \[ ] Task completion rate

\- \[ ] User acceptance rate  

\- \[ ] Human review success label

\- \[ ] Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



\*\*Guardrail 1:\*\*

\[Metric and threshold:]



\*\*Guardrail 2:\*\*

\[Metric and threshold:]



\### STEP 4: Logging Setup



\*\*Storage location:\*\* \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



\*\*Log fields:\*\*

\- \[ ] timestamp

\- \[ ] arm\_id

\- \[ ] primary\_metric (0/1)

\- \[ ] guardrail\_1 (0/1)

\- \[ ] guardrail\_2 (0/1)

\- \[ ] cost\_usd

\- \[ ] latency\_ms

\- \[ ] Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



\*\*Review schedule:\*\* 

\- \[ ] Hourly

\- \[ ] Daily

\- \[ ] Weekly



\### STEP 5: Initial Deployment



\*\*Initial weights:\*\* 

\- Arm 1: \_\_\_\_%

\- Arm 2: \_\_\_\_%

\- Arm 3: \_\_\_\_%

\- \[etc.]



\*\*Target sample size:\*\* \_\_\_\_\_\_\_ requests



\*\*Evaluation date:\*\* \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



---



\## Worksheet: Modify Existing Prompt



\### Prompt Name: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\### Current Version: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



\### STEP 1: Diagnose



\*\*What's not working?\*\*

\[Answer:]



\*\*How often does it fail?\*\*

\- \[ ] Every time

\- \[ ] ~50% of time

\- \[ ] Occasionally (<10%)



\*\*Example of failure:\*\*

\[Paste example:]



\*\*What would fix it?\*\*

\[Answer:]



\*\*Is this a new issue?\*\*

\- \[ ] Yes, started recently

\- \[ ] No, always been like this



\### STEP 2: Modification Type



\*\*Issue type:\*\*

\- \[ ] Format fix

\- \[ ] Edge case handling

\- \[ ] Accuracy improvement

\- \[ ] Performance issue



\### STEP 3: Variant Creation



\*\*New variant name:\*\* \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\*\*Parent version:\*\* \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



\*\*What changed:\*\*

\[Description:]



\*\*New prompt text:\*\*

```

\[Write modified prompt:]

```



\*\*Expected impact:\*\*

\[What should improve:]



\### STEP 4: Testing Plan



\*\*Initial weight:\*\* \_\_\_\_% (recommend 5-10%)



\*\*Monitor for:\*\* \_\_\_\_\_\_ weeks



\*\*Success criteria:\*\*

\[How will you know if it worked?]



\### STEP 5: Review



\*\*Review date:\*\* \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



\*\*Questions to answer:\*\*

\- \[ ] Did variant solve the issue?

\- \[ ] Did it create new problems?

\- \[ ] Worth keeping or retiring?



---



\## Common Prompt Arm Patterns



\### Pattern 1: Strict Structured

\*\*When to use:\*\* Need exact format compliance

\*\*Template:\*\*

```

You are a \[role]. Extract/classify/transform \[task].



Output MUST be valid JSON following this schema:

{

&nbsp; "field1": "type",

&nbsp; "field2": "type"

}



Do not include any text before or after the JSON. No markdown formatting.

```



\### Pattern 2: Clarify-First

\*\*When to use:\*\* Input often ambiguous or incomplete

\*\*Template:\*\*

```

You are a \[role]. 



First, check if the request is clear and complete.



If ambiguous, unclear, or missing information, respond:

"CLARIFICATION\_NEEDED: \[ask one specific question]"



If clear, proceed with \[task].

```



\### Pattern 3: Evidence-Only (RAG-Safe)

\*\*When to use:\*\* Must avoid hallucination, source-grounded responses only

\*\*Template:\*\*

```

You are a \[role]. Answer ONLY using information from the provided sources.



If the answer is not in the sources, respond: "Not found in provided sources."



Do not infer, guess, or use general knowledge. Only cite what is explicitly stated.



Sources: {{sources}}

Question: {{question}}

```



\### Pattern 4: Confidence Scoring

\*\*When to use:\*\* Need to flag uncertain outputs for human review

\*\*Template:\*\*

```

You are a \[role]. \[Complete task], then rate your confidence.



For each output, include confidence level:

\- HIGH: Clearly stated in input, no ambiguity

\- MEDIUM: Reasonable inference, some assumption

\- LOW: Uncertain, multiple interpretations possible



Output format:

{

&nbsp; "result": \[your answer],

&nbsp; "confidence": "HIGH|MEDIUM|LOW",

&nbsp; "reasoning": "brief explanation",

&nbsp; "needs\_review": boolean (true if LOW confidence)

}

```



\### Pattern 5: Teaching Mode

\*\*When to use:\*\* Users need to learn, not just get answers

\*\*Template:\*\*

```

You are a \[role]. Help the user learn by:



1\. Explain the concept step-by-step with examples

2\. Show your reasoning process

3\. Provide the answer

4\. Summarize key takeaways



Be thorough but concise. Use examples from the user's context when possible.

```



\### Pattern 6: Tool-First (Agent Style)

\*\*When to use:\*\* Task requires external data or actions

\*\*Template:\*\*

```

You are a \[role]. Before responding, determine if you need additional information.



Available tools:

\- \[list tools and when to use them]



Process:

1\. Assess if current information is sufficient

2\. If not, decide which tool(s) to call

3\. Call tool(s) and get results

4\. Synthesize results into answer

5\. Explain your reasoning



If tools fail or return no data, say so and explain limitations.

```



---



\## Metrics Reference Guide



\### Primary Metrics (Choose One)



\*\*Task Completion Rate\*\*

\- \*\*Measure:\*\* Did user say "that works" or not return with issue?

\- \*\*Good for:\*\* Clear success/failure tasks

\- \*\*Calculate:\*\* successes / total\_attempts

\- \*\*Target:\*\* >85%



\*\*Acceptance Rate\*\*  

\- \*\*Measure:\*\* Did user copy/paste output, click accept, or use in workflow?

\- \*\*Good for:\*\* Intermediate outputs fed into other systems

\- \*\*Calculate:\*\* accepted\_outputs / total\_outputs

\- \*\*Target:\*\* >90%



\*\*Human Review Success\*\*

\- \*\*Measure:\*\* Random sample manually reviewed and labeled

\- \*\*Good for:\*\* High-stakes domains, compliance-sensitive

\- \*\*Calculate:\*\* reviewed\_correct / reviewed\_total

\- \*\*Target:\*\* >95%



\*\*User Rating\*\*

\- \*\*Measure:\*\* Explicit thumbs up/down or 1-5 star

\- \*\*Good for:\*\* Subjective quality assessment

\- \*\*WARNING:\*\* Can train hallucinations if only metric

\- \*\*Calculate:\*\* positive\_ratings / total\_ratings

\- \*\*Target:\*\* >4.0/5.0



\### Guardrail Metrics (Choose 2+)



\*\*Hallucination / Factual Error Flag\*\*

\- \*\*Measure:\*\* Output contains made-up information or wrong facts

\- \*\*Calculate:\*\* flagged\_errors / total\_outputs

\- \*\*Target:\*\* <2%



\*\*Format Compliance\*\*

\- \*\*Measure:\*\* Output matches required schema/structure

\- \*\*Calculate:\*\* valid\_format / total\_outputs

\- \*\*Target:\*\* >98%



\*\*Safety Violations\*\*

\- \*\*Measure:\*\* Output triggers policy failure (harmful, biased, etc.)

\- \*\*Calculate:\*\* violations / total\_outputs

\- \*\*Target:\*\* 0%



\*\*Cost Budget\*\*

\- \*\*Measure:\*\* Average cost per request

\- \*\*Calculate:\*\* total\_cost / total\_requests

\- \*\*Target:\*\* <$0.01 per request (adjust based on task)



\*\*Latency Budget\*\*

\- \*\*Measure:\*\* Response time

\- \*\*Calculate:\*\* avg(response\_times)

\- \*\*Target:\*\* <2000ms (adjust based on UX requirements)



\*\*Escalation Rate\*\*

\- \*\*Measure:\*\* How often system punts to human review

\- \*\*Calculate:\*\* escalations / total\_requests

\- \*\*Target:\*\* <5% (too high = system not useful)



---



\## Thompson Sampling Implementation (Simple)



\### Google Apps Script Version



```javascript

// In Google Sheet "PromptConfig" with columns: arm\_id, successes, failures



function selectArm() {

&nbsp; const sheet = SpreadsheetApp.getActiveSpreadsheet()

&nbsp;   .getSheetByName('PromptConfig');

&nbsp; const data = sheet.getDataRange().getValues();

&nbsp; 

&nbsp; let bestArm = null;

&nbsp; let bestSample = -1;

&nbsp; 

&nbsp; // Skip header row

&nbsp; for (let i = 1; i < data.length; i++) {

&nbsp;   const armId = data\[i]\[0];

&nbsp;   const successes = data\[i]\[1];

&nbsp;   const failures = data\[i]\[2];

&nbsp;   

&nbsp;   // Sample from Beta distribution (simplified)

&nbsp;   const sample = sampleBeta(successes + 1, failures + 1);

&nbsp;   

&nbsp;   if (sample > bestSample) {

&nbsp;     bestSample = sample;

&nbsp;     bestArm = armId;

&nbsp;   }

&nbsp; }

&nbsp; 

&nbsp; return bestArm;

}



function sampleBeta(alpha, beta) {

&nbsp; // Simplified Beta sampling using Gamma distributions

&nbsp; const x = sampleGamma(alpha, 1);

&nbsp; const y = sampleGamma(beta, 1);

&nbsp; return x / (x + y);

}



function sampleGamma(shape, scale) {

&nbsp; // Simplified Gamma sampling (Marsaglia \& Tsang method)

&nbsp; // This is approximate but good enough for bandit routing

&nbsp; if (shape < 1) {

&nbsp;   return sampleGamma(shape + 1, scale) \* Math.pow(Math.random(), 1/shape);

&nbsp; }

&nbsp; 

&nbsp; const d = shape - 1/3;

&nbsp; const c = 1 / Math.sqrt(9 \* d);

&nbsp; 

&nbsp; while (true) {

&nbsp;   let x, v;

&nbsp;   do {

&nbsp;     x = randomNormal();

&nbsp;     v = 1 + c \* x;

&nbsp;   } while (v <= 0);

&nbsp;   

&nbsp;   v = v \* v \* v;

&nbsp;   const u = Math.random();

&nbsp;   

&nbsp;   if (u < 1 - 0.0331 \* x \* x \* x \* x) {

&nbsp;     return scale \* d \* v;

&nbsp;   }

&nbsp;   if (Math.log(u) < 0.5 \* x \* x + d \* (1 - v + Math.log(v))) {

&nbsp;     return scale \* d \* v;

&nbsp;   }

&nbsp; }

}



function randomNormal() {

&nbsp; // Box-Muller transform

&nbsp; const u1 = Math.random();

&nbsp; const u2 = Math.random();

&nbsp; return Math.sqrt(-2 \* Math.log(u1)) \* Math.cos(2 \* Math.PI \* u2);

}



function updateArmResult(armId, success) {

&nbsp; const sheet = SpreadsheetApp.getActiveSpreadsheet()

&nbsp;   .getSheetByName('PromptConfig');

&nbsp; const data = sheet.getDataRange().getValues();

&nbsp; 

&nbsp; for (let i = 1; i < data.length; i++) {

&nbsp;   if (data\[i]\[0] === armId) {

&nbsp;     if (success) {

&nbsp;       sheet.getRange(i + 1, 2).setValue(data\[i]\[1] + 1); // successes

&nbsp;     } else {

&nbsp;       sheet.getRange(i + 1, 3).setValue(data\[i]\[2] + 1); // failures

&nbsp;     }

&nbsp;     break;

&nbsp;   }

&nbsp; }

}

```



\### Python Version (for production)



```python

import numpy as np

from typing import List, Dict

import json



class ThompsonSamplingRouter:

&nbsp;   def \_\_init\_\_(self, arms: List\[str]):

&nbsp;       """Initialize with list of arm IDs"""

&nbsp;       self.arms = arms

&nbsp;       self.successes = {arm: 1 for arm in arms}  # Prior: Beta(1,1)

&nbsp;       self.failures = {arm: 1 for arm in arms}

&nbsp;       

&nbsp;   def select\_arm(self) -> str:

&nbsp;       """Select arm using Thompson Sampling"""

&nbsp;       samples = {}

&nbsp;       for arm in self.arms:

&nbsp;           alpha = self.successes\[arm]

&nbsp;           beta = self.failures\[arm]

&nbsp;           samples\[arm] = np.random.beta(alpha, beta)

&nbsp;       

&nbsp;       return max(samples, key=samples.get)

&nbsp;   

&nbsp;   def update(self, arm: str, reward: float):

&nbsp;       """Update arm statistics with reward (0 or 1)"""

&nbsp;       if reward >= 0.5:  # Success

&nbsp;           self.successes\[arm] += 1

&nbsp;       else:  # Failure

&nbsp;           self.failures\[arm] += 1

&nbsp;   

&nbsp;   def get\_weights(self) -> Dict\[str, float]:

&nbsp;       """Get current routing probabilities (for monitoring)"""

&nbsp;       total\_pulls = sum(self.successes.values()) + sum(self.failures.values())

&nbsp;       weights = {}

&nbsp;       

&nbsp;       for arm in self.arms:

&nbsp;           success\_rate = self.successes\[arm] / (self.successes\[arm] + self.failures\[arm])

&nbsp;           pull\_count = self.successes\[arm] + self.failures\[arm]

&nbsp;           weights\[arm] = {

&nbsp;               'success\_rate': success\_rate,

&nbsp;               'pull\_count': pull\_count,

&nbsp;               'estimated\_weight': pull\_count / total\_pulls

&nbsp;           }

&nbsp;       

&nbsp;       return weights

&nbsp;   

&nbsp;   def save\_state(self, filepath: str):

&nbsp;       """Save current state to JSON"""

&nbsp;       state = {

&nbsp;           'arms': self.arms,

&nbsp;           'successes': self.successes,

&nbsp;           'failures': self.failures

&nbsp;       }

&nbsp;       with open(filepath, 'w') as f:

&nbsp;           json.dump(state, f)

&nbsp;   

&nbsp;   @classmethod

&nbsp;   def load\_state(cls, filepath: str):

&nbsp;       """Load state from JSON"""

&nbsp;       with open(filepath, 'r') as f:

&nbsp;           state = json.load(f)

&nbsp;       

&nbsp;       router = cls(state\['arms'])

&nbsp;       router.successes = state\['successes']

&nbsp;       router.failures = state\['failures']

&nbsp;       return router



\# Usage example:

if \_\_name\_\_ == "\_\_main\_\_":

&nbsp;   # Initialize with arm IDs

&nbsp;   router = ThompsonSamplingRouter(\[

&nbsp;       'strict-json-v1',

&nbsp;       'clarify-first-v1',

&nbsp;       'evidence-only-v1',

&nbsp;       'confidence-score-v1'

&nbsp;   ])

&nbsp;   

&nbsp;   # Select arm for request

&nbsp;   selected\_arm = router.select\_arm()

&nbsp;   print(f"Selected: {selected\_arm}")

&nbsp;   

&nbsp;   # ... run prompt, get result ...

&nbsp;   

&nbsp;   # Update with result (1 = success, 0 = failure)

&nbsp;   router.update(selected\_arm, reward=1)

&nbsp;   

&nbsp;   # View current weights

&nbsp;   print(router.get\_weights())

&nbsp;   

&nbsp;   # Save state

&nbsp;   router.save\_state('router\_state.json')

```



---



\## FAQ



\*\*Q: How many prompt arms should I start with?\*\*

A: 5-8 arms. Fewer than 5 doesn't give enough variation. More than 10 slows learning and is usually overkill.



\*\*Q: How long should I test before making a decision?\*\*

A: Minimum 1-2 weeks for low-traffic systems, 3-5 days for high-traffic. Aim for 100+ requests per arm before drawing conclusions.



\*\*Q: Can I just pick the best arm and use it 100%?\*\*

A: No! Keep 10-20% exploration budget. The "best" arm changes as users, models, and tasks drift. Continuous learning is the point.



\*\*Q: What if all arms perform similarly?\*\*

A: Either (1) task is too simple to optimize, (2) arms aren't different enough, or (3) need more test time. Review arm designs.



\*\*Q: Should I use Thompson Sampling or Epsilon-Greedy?\*\*

A: Thompson Sampling is usually better. It's not much harder to implement and adapts faster.



\*\*Q: How do I handle new arms?\*\*

A: Add to pool with initial prior (1 success, 1 failure). System will quickly learn if it's good or not. Don't remove other arms immediately.



\*\*Q: Can I use this for other optimization problems (not prompts)?\*\*

A: Yes! Multi-Armed Bandits work for any scenario with: (1) discrete options, (2) fast feedback, (3) changing environment. Examples: UI layouts, email subject lines, pricing tiers.



\*\*Q: What about compliance and explainability?\*\*

A: Log every decision (which arm, why). Keep audit trail of weight changes. Document arm creation rationale. For high-stakes: add human-review arm or approval step.



---



\*\*Version:\*\* 1.0  

\*\*Last Updated:\*\* 2026-02-13  

\*\*Maintained By:\*\* TNDS Operations Team

