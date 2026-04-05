# Glossary

Terminology definitions for the LLM Platform.

---

## A

### Agent
A specialized persona with defined roles, capabilities, and constraints. Agents orchestrate skills to accomplish tasks. Examples: Auditor, Builder, Reviewer, Curriculum Designer.

### Atomic Skill
A single-purpose operation that does one thing well. The smallest unit of reusable capability. Examples: summarize, extract-entities, classify-risk.

### Audit
A record of actions taken, changes made, or validations performed. Required for governance and compliance.

---

## C

### Chain
An orchestrated sequence of skills for complex operations. Chains coordinate multiple composite skills with defined control flow.

### Command
A user-facing operation that invokes skills and agents. Commands are the primary interface for platform users.

### Composite Skill
A multi-step workflow combining atomic skills. Handles more complex operations than atomic skills alone.

---

## L

### Labs
Experimental environment for spikes, prototypes, and untested ideas. Work in labs is not production-ready.

---

## M

### Marketplace
Registry of installable packages including skills, templates, scaffolds, and themes.

---

## P

### Provider
An LLM backend (Claude, ChatGPT, Ollama) that executes prompts. Providers are selected based on routing rules.

### Provider Routing
Logic for selecting which provider handles a given request. Based on task type, cost, capability, and data sensitivity.

---

## R

### Rule
A governance policy enforced across platform operations. Rules ensure security, compliance, and quality.

---

## S

### Skill
A reusable capability that performs a specific function. Organized into atomic, composite, and chain tiers.

### Spike
An experimental implementation in labs to test an idea quickly. Not intended for production use.

---

## T

### Tier
Classification level for skills: Atomic (single-purpose), Composite (multi-step), Chain (orchestrated sequences).

---

## TNDS-Specific Terms

### Command Center
Client-facing dashboard providing visibility into business operations. Core TNDS deliverable.

### Command Module
Technical building block for Command Center functionality. Named with `-command` suffix (e.g., data-command, financial-command).

### Direction Protocol
TNDS sales process: Identify → Assess → Map → Chart → Launch.

### Command Protocol
TNDS delivery process for implementing solutions after sales close.
