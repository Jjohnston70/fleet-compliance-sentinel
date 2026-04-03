# Data Layer

Data access and schema definitions for readiness-command module.

## Files

### firestore-schema.ts

TypeScript interfaces for Firestore collections:

- **Assessment** - Assessment records with scores and status
- **AssessmentClient** - Client company information
- **Question** - Assessment questions
- **Response** - Individual question responses
- **Recommendation** - Generated recommendations
- **AssessmentTemplate** - Assessment templates

### in-memory-repository.ts

Repository pattern implementation for data access.

**Current**: In-memory storage (for testing/development)
**Production**: Replace with Firestore operations

Methods:
- `createAssessment(assessment)` / `getAssessment(id)` / `updateAssessment(assessment)`
- `createClient(client)` / `getClient(id)` / `updateClient(client)`
- `createQuestion(question)` / `getQuestion(id)` / `getQuestionsByTemplate(templateId)`
- `createResponse(response)` / `getResponse(id)` / `getResponsesByAssessment(assessmentId)`
- `createRecommendation(rec)` / `getRecommendationsByAssessment(assessmentId)`
- `createTemplate(template)` / `getTemplate(id)` / `getAllTemplates()`

### seed-questions.ts

Seeded question data from 5 JSON assessment templates.

**Templates**:
1. Data Environment Scan (21 questions)
2. Document Environment Scan (22 questions)
3. Process Audit (27 questions)
4. Technology Stack Review (27 questions)
5. Opportunity Matrix Dashboard

**Categories**:
- process_maturity
- data_readiness
- tech_infrastructure
- team_capability
- budget_alignment

**Question Types**:
- scale (1-10)
- select (single choice)
- multi_select (multiple choices)
- text
- boolean

## Firebase Migration

To migrate from in-memory to Firestore:

1. Install `firebase-admin` (already in package.json)
2. Create `src/data/firestore-repository.ts`
3. Implement same interface as `InMemoryRepository`
4. Replace repository initialization:

```typescript
// Before
import { InMemoryRepository } from './data/in-memory-repository.js';
const repository = new InMemoryRepository();

// After
import { FirestoreRepository } from './data/firestore-repository.js';
const repository = new FirestoreRepository(firebaseApp);
```

## Usage

```typescript
import { InMemoryRepository } from './src/data/in-memory-repository.js';
import { SEED_QUESTIONS, TEMPLATES } from './src/data/seed-questions.js';

const repository = new InMemoryRepository();

// Seed templates and questions
for (const template of TEMPLATES) {
  repository.createTemplate(template);
}
for (const question of SEED_QUESTIONS) {
  repository.createQuestion(question);
}

// Create client and assessment
const client = repository.createClient(...);
const assessment = repository.createAssessment(...);
```
