# Reporting

Analytics and insights from assessment data.

## Reports

### score-distribution.ts

Generate average scores by category across all assessments.

```typescript
export interface ScoreDistribution {
  category: string;
  averageScore: number;
  medianScore: number;
  minScore: number;
  maxScore: number;
  assessmentCount: number;
}

export function generateScoreDistribution(): ScoreDistribution[]
```

### industry-benchmarks.ts

Average scores by industry for comparison and benchmarking.

```typescript
export interface IndustryBenchmark {
  industry: string;
  category: string;
  averageScore: number;
  assessmentCount: number;
  percentile: number;
}

export function getIndustryBenchmarks(
  industry: string
): IndustryBenchmark[]
```

### recommendation-frequency.ts

Most common recommendations generated across assessments.

```typescript
export interface RecommendationFrequency {
  title: string;
  category: string;
  priority: string;
  frequency: number;
  percentageOfAssessments: number;
}

export function getRecommendationFrequency(
  limit?: number
): RecommendationFrequency[]
```

## Usage

```typescript
import { generateScoreDistribution } from './score-distribution';
import { getIndustryBenchmarks } from './industry-benchmarks';

const distribution = generateScoreDistribution();
const benchmarks = getIndustryBenchmarks('healthcare');

// Generate insights
const insights = {
  averageOrganizationScore: distribution[0].averageScore,
  industryLeader: benchmarks[0],
  topRecommendations: getRecommendationFrequency(5),
};
```

## Implementation

Query Firestore collections:
- `assessments` - get scores and categories
- `clients` - get industry info
- `recommendations` - get frequency data

Generate CSV/JSON exports for dashboards.
