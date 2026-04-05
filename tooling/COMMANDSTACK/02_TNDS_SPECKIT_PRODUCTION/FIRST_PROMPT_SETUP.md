# SpecKit First Prompt: Project Setup

Copy and customize this prompt to initialize a new project with SpecKit.

---

## The Prompt

```
I'm starting a new project and want to use the SpecKit workflow for production-grade development.

**Project Name**: [YOUR PROJECT NAME]
**Domain**: [e.g., Real Estate, Finance, Healthcare, SaaS, Internal Tool]
**AI Tool**: Claude Code (or specify: Cursor, Copilot, Gemini, etc.)

**What I'm Building**:
[2-3 sentences describing the core purpose. Focus on WHAT and WHY, not HOW.]

Example: "A client portal for real estate agents to manage transactions, share documents securely with buyers/sellers, and track deal progress. Needs to be GLBA compliant for handling financial documents."

**Project Principles** (customize these):
1. [Principle 1 - e.g., "Test-first development - no feature ships without tests"]
2. [Principle 2 - e.g., "Security by default - all PII encrypted at rest"]
3. [Principle 3 - e.g., "Simplicity over cleverness - YAGNI principles"]
4. [Principle 4 - e.g., "Mobile-responsive - all UI works on tablets"]
5. [Principle 5 - e.g., "Audit trail - all user actions logged"]

**Compliance Requirements** (if applicable):
- [ ] Real estate (GLBA, ESIGN/UETA, state retention)
- [ ] Financial (SOX, PCI-DSS)
- [ ] Healthcare (HIPAA)
- [ ] General privacy (CPRA/CCPA, GDPR)
- [ ] None specific

Please:
1. Initialize the SpecKit structure
2. Create the constitution with my principles
3. Walk me through the next steps
```

---

## What Happens Next

After the first prompt, the AI will:

1. **Create the folder structure**:
   ```
   .speckit/
   ├── memory/constitution.md
   ├── templates/
   ├── scripts/
   └── commands/
   docs/
   notes/
   tools/
   archive/
   ```

2. **Generate your constitution** based on your principles

3. **Guide you to the next command**: `/speckit.specify`

---

## Example Complete First Prompt

```
I'm starting a new project and want to use the SpecKit workflow.

**Project Name**: AgentFlow
**Domain**: Real Estate
**AI Tool**: Claude Code

**What I'm Building**:
A transaction management portal for real estate agents. Agents can create deals, upload documents, share files with clients, track milestones, and generate compliance reports. Must handle sensitive financial documents securely.

**Project Principles**:
1. Security first - all client data encrypted, GLBA compliant
2. Mobile-responsive - agents work from tablets at showings
3. Audit everything - complete trail of document access and changes
4. Simple UX - agents are not tech-savvy, minimize clicks
5. Offline-capable - basic functionality without internet

**Compliance Requirements**:
- [x] Real estate (GLBA, ESIGN/UETA, state retention)
- [ ] Financial
- [ ] Healthcare
- [x] General privacy (CPRA/CCPA)

Please initialize SpecKit and create the constitution with my principles.
```

---

## After Initialization

Your next prompts will follow the SpecKit workflow:

```
/speckit.specify I want to build the deal creation feature where agents can...

/speckit.clarify

/speckit.realty-compliance

/speckit.plan Using Next.js 14, PostgreSQL, Vercel deployment...

/speckit.tasks

/speckit.analyze

/speckit.implement
```

---

## Tips

1. **Be specific about principles** - vague principles create vague specs
2. **Include compliance upfront** - easier than retrofitting
3. **Don't mention tech stack yet** - that comes in `/speckit.plan`
4. **Focus on user value** - what problem does this solve?
