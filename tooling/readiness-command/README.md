# readiness-command

A comprehensive AI Readiness Assessment module for identifying and prioritizing AI/automation opportunities in organizations.

## Stack

- **Language**: TypeScript 5.6+
- **Runtime**: Node.js (ESM)
- **Database**: Firebase/Firestore (Project: singular-silo-463000-j6)
- **Testing**: Vitest

## Architecture

### Data Layer (`src/data/`)

- **firestore-schema.ts**: Interfaces for Assessment, Client, Question, Response, Recommendation, and Template
- **in-memory-repository.ts**: Simple repository pattern for data access (swap with Firebase in production)
- **seed-questions.ts**: Seeded questions and templates from 5 JSON assessment forms

### Services Layer (`src/services/`)

- **assessment-service.ts**: Assessment lifecycle (start, respond, complete, get results)
- **scoring-engine.ts**: Weighted average scoring (0-100) across 5 categories
- **recommendation-engine.ts**: Rule-based recommendations by score range and category
- **client-service.ts**: Client CRUD operations
- **report-generator.ts**: Structured JSON report generation

### Configuration (`src/config/`)

- **firebase-config.ts**: Firebase project settings and scoring weights

### Tools (`src/tools.ts`)

LLM-integrated tools for assessment workflow:
- `start_assessment`: Create new assessment for client
- `submit_response`: Record response to assessment question
- `get_score`: Get current assessment score breakdown
- `get_recommendations`: Get AI readiness recommendations
- `generate_report`: Generate formatted assessment report
- `get_next_questions`: Get unanswered questions
- `complete_assessment`: Finalize assessment and generate recommendations

## Assessment Templates

1. **Data Environment Scan** (tmpl-data-scan) - 21 questions
   - Data sources, formats, quality, accessibility, security, compliance

2. **Document Environment Scan** (tmpl-doc-scan) - 22 questions
   - Document types, formats, processing, management, automation opportunities

3. **Process Audit** (tmpl-process-audit) - 27 questions
   - Process details, pain points, data types, improvement goals

4. **Technology Stack Review** (tmpl-tech-stack) - 27 questions
   - System details, capabilities, limitations, usage, automation potential

5. **Opportunity Matrix Dashboard** (tmpl-opportunity-matrix)
   - Analysis and visualization of opportunities

## Scoring & Categories

### Categories

1. **process_maturity** - Process standardization and governance
2. **data_readiness** - Data quality, accessibility, and completeness
3. **tech_infrastructure** - Technology systems and integration capabilities
4. **team_capability** - Skills, experience, and organizational readiness
5. **budget_alignment** - Financial planning and investment strategy

### Scoring Algorithm

- Weighted average: 0-100 scale
- Category Score = sum(response_score × question_weight) / sum(max_possible × question_weight) × 100
- Total Score = average of all category scores

### Priority Assignment

- **0-25**: Immediate action required
- **26-50**: Short-term priorities (3-6 months)
- **51-75**: Medium-term initiatives (6-12 months)
- **76-100**: Long-term optimization (12+ months)

## Installation

```bash
npm install
```

## Development

```bash
# Build (type-check)
npm run build

# Run tests
npm test

# Watch tests
npm test:watch
```

## Configuration

Set environment variables in `.env`:

```env
FIREBASE_PROJECT_ID=singular-silo-463000-j6
FIREBASE_SERVICE_ACCOUNT_KEY=./config/firebase-service-account.json
APP_URL=http://localhost:3000
TIMEZONE=America/Denver
ASSESSMENT_EXPIRATION_DAYS=30
```

## Database Schema

### Collections

- **assessments** - Assessment records with scores and status
- **clients** - Client company information
- **questions** - Assessment questions (seeded from templates)
- **responses** - Individual question responses
- **recommendations** - Generated recommendations
- **templates** - Assessment templates

### Assessment Lifecycle

1. **Start**: Create assessment for client/template
2. **In Progress**: Submit responses to questions (30-day expiration)
3. **Complete**: Calculate scores and generate recommendations
4. **Results**: View assessment scores, categories, and recommendations

## Example Usage

```typescript
import { InMemoryRepository } from './src/data/in-memory-repository.js';
import { AssessmentService } from './src/services/assessment-service.js';
import { SEED_QUESTIONS, TEMPLATES } from './src/data/seed-questions.js';

const repository = new InMemoryRepository();
const service = new AssessmentService(repository);

// Seed questions
for (const template of TEMPLATES) {
  repository.createTemplate(template);
}
for (const question of SEED_QUESTIONS) {
  repository.createQuestion(question);
}

// Start assessment
const assessment = service.startAssessment(
  'client-123',
  'assessor@example.com',
  'tmpl-data-scan',
  'full'
);

// Submit responses
service.submitResponse(assessment.id, 'q-data-completeness-data', 8);
service.submitResponse(assessment.id, 'q-data-accuracy-data', 7);

// Complete and get results
const completed = service.completeAssessment(assessment.id);
const results = service.getAssessmentResults(assessment.id);
```

## Testing

- **22 passing tests**
- Unit tests for scoring, recommendations, and assessment service
- Edge case coverage (zero scores, all max, mixed weights)

## Firebase Project

**GCP Project**: singular-silo-463000-j6

Reference this project ID in Firestore database setup.

## Status

- Core implementation: Complete
- Type checking: Passing (`npx tsc --noEmit`)
- Tests: All passing (22/22)
- Firebase integration: Ready for implementation (currently in-memory)

## Next Steps

1. Connect to Firebase/Firestore (replace InMemoryRepository)
2. Implement API routes (src/api/)
3. Add automation hooks (src/hooks/) - expiration checker, reminder sender
4. Add reporting endpoints (src/reporting/)
5. Deploy to Vercel with Next.js wrapper
