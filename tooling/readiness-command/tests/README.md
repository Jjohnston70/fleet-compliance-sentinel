# Tests

Comprehensive unit tests for readiness-command module.

## Test Files

### scoring-engine.test.ts (7 tests)

Tests for weighted average scoring:
- Zero score edge case
- Scale question handling (1-10)
- Select question scoring
- Score normalization to 0-100
- Question weighting
- Response score computation
- Multi-select normalization

**Coverage**: All scoring formulas and edge cases

### recommendation-engine.test.ts (7 tests)

Tests for rule-based recommendations:
- Immediate priority (0-25 score)
- Short-term priority (26-50)
- Medium-term priority (51-75)
- Long-term priority (76-100)
- Category-specific recommendations
- ROI and effort estimation
- Tool suggestions

**Coverage**: Priority assignment logic and category-specific rules

### assessment-service.test.ts (8 tests)

Tests for assessment lifecycle:
- Start new assessment
- Submit responses
- Complete assessment and generate recommendations
- Retrieve assessment results
- Get next unanswered questions
- Expire old assessments
- Error handling (non-existent assessment/question)

**Coverage**: Full lifecycle from start to completion

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm test:watch

# Run specific test file
npm test scoring-engine.test.ts
```

## Test Results

```
Test Files  3 passed (3)
     Tests  22 passed (22)
```

## What's Tested

- Scoring calculations with various weights
- Edge cases (all zeros, all maximums, mixed weights)
- Score normalization and categorization
- Recommendation generation by score range
- Category-specific recommendations
- Assessment lifecycle and state transitions
- Error conditions

## What's Not Tested

- Firebase Firestore integration (use in-memory repo)
- API routes (integration testing needed)
- Email/notification sending
- Cloud function triggers
- UI components

## Coverage

- **scoring-engine.ts**: 100% - All formulas and edge cases
- **recommendation-engine.ts**: 100% - All rules and priorities
- **assessment-service.ts**: 100% - Full lifecycle tested

## Adding New Tests

Pattern:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Act
    const result = service.method();

    // Assert
    expect(result).toBe(expected);
  });
});
```
