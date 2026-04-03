# Services

Business logic layer for readiness-command module.

## Services

### assessment-service.ts

Manages assessment lifecycle:
- `startAssessment(clientId, assessorEmail, templateId, type)` - Create new assessment
- `submitResponse(assessmentId, questionId, value, notes)` - Record response
- `completeAssessment(assessmentId)` - Finalize and calculate scores
- `getAssessmentResults(assessmentId)` - Get full results with recommendations
- `getNextQuestions(assessmentId, templateId, count)` - Get unanswered questions
- `expireOldAssessments()` - Expire assessments over 30 days old

### scoring-engine.ts

Calculates weighted average scores:
- `calculateAssessmentScore(responses, questions)` - Compute total and category scores
- `computeResponseScore(value, question)` - Convert response to 0-10 scale

**Algorithm**: Category Score = sum(response_score × weight) / sum(max_possible × weight) × 100

### recommendation-engine.ts

Generates rule-based recommendations:
- `generateRecommendations(assessmentId, totalScore, categoryScores)` - Create recommendations

**Rules**:
- Score 0-25: Immediate priority
- Score 26-50: Short-term (3-6 months)
- Score 51-75: Medium-term (6-12 months)
- Score 76-100: Long-term (12+ months)

Plus category-specific recommendations based on low-scoring areas.

### client-service.ts

Client CRUD operations:
- `createClient(...)` - Create new client
- `getClient(id)` - Get client details
- `updateClient(id, updates)` - Update client
- `getAllClients()` - List all clients
- `getClientsByIndustry(industry)` - Filter by industry
- `getClientsBySize(min, max)` - Filter by employee count

### report-generator.ts

Generates structured assessment reports:
- `generateReport(assessment, responses, recommendations)` - Create JSON report

Report includes:
- Assessment metadata
- Total and category scores
- Summary and next steps
- Recommendations with details

## Dependencies

- **firestore-schema.ts** - Type definitions
- **in-memory-repository.ts** - Data access layer (swap with Firestore)

## Testing

All services have comprehensive unit tests in `/tests`:
- ScoringEngine: 7 tests (weighting, normalization, scale handling)
- RecommendationEngine: 7 tests (priority assignment, category-specific)
- AssessmentService: 8 tests (lifecycle, expiration, error handling)
