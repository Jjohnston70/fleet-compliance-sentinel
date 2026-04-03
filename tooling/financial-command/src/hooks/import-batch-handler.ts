import { ImportService } from '../services/import-service.js';
import { CategorizationService } from '../services/categorization-service.js';

export interface BatchJob {
  batchId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
}

export class ImportBatchHandler {
  private jobs: Map<string, BatchJob> = new Map();

  constructor(
    private importService: ImportService,
    private categService: CategorizationService
  ) {}

  async processBatch(
    batchId: string,
    csv: string,
    accountId: string,
    entity: string,
    importedBy: string
  ): Promise<BatchJob> {
    const job: BatchJob = {
      batchId,
      status: 'processing',
      progress: 0,
    };

    this.jobs.set(batchId, job);

    try {
      await this.importService.importUSAACSV(csv, accountId, entity, importedBy);
      job.status = 'completed';
      job.progress = 100;
    } catch (err) {
      job.status = 'failed';
    }

    return job;
  }

  getJobStatus(batchId: string): BatchJob | undefined {
    return this.jobs.get(batchId);
  }

  async categorizeImportedBatch(batchId: string): Promise<{ categorized: number; uncategorized: number }> {
    let categorized = 0;
    let uncategorized = 0;

    // This is a placeholder - in real impl, would fetch transactions by batch ID
    // and re-categorize them

    return { categorized, uncategorized };
  }
}
