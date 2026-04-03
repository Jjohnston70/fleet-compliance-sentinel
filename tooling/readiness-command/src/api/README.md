# API Routes

Next.js API routes for readiness-command module.

## Endpoints

### Assessments

- `POST /api/assessments` - Start new assessment
- `GET /api/assessments/[id]` - Get assessment with progress
- `POST /api/assessments/[id]/responses` - Submit batch of responses
- `POST /api/assessments/[id]/complete` - Finalize and generate score
- `GET /api/assessments/[id]/results` - Full results with scores
- `GET /api/assessments/[id]/report` - Formatted report data

### Clients

- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get client details
- `PUT /api/clients/[id]` - Update client

### Templates

- `GET /api/templates` - List available templates
- `GET /api/templates/[id]/questions` - Get questions for template

## Implementation

Each route should:
1. Validate input using zod or similar
2. Call appropriate service method
3. Return structured JSON response
4. Handle errors gracefully

Example:

```typescript
// pages/api/assessments.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AssessmentService } from '@/services/assessment-service';
import { repository } from '@/data/repository';

const service = new AssessmentService(repository);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const assessment = service.startAssessment(
        req.body.clientId,
        req.body.assessorEmail,
        req.body.templateId,
        req.body.assessmentType
      );
      res.status(201).json(assessment);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }
}
```
