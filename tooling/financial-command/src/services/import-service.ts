import { Transaction, ImportBatch, ImportBatchSchema } from '../data/firestore-schema.js';
import { IRepository } from '../data/in-memory-repository.js';
import { CategorizationService } from './categorization-service.js';

export interface CSVRow {
  date: string;
  description: string;
  amount: string;
  balance: string;
}

export class ImportService {
  constructor(
    private repo: IRepository,
    private categorizationService: CategorizationService
  ) {}

  async importUSAACSV(
    csv: string,
    accountId: string,
    entity: string,
    importedBy: string
  ): Promise<{ batch: ImportBatch; transactions: Transaction[] }> {
    const lines = csv.trim().split('\n');
    const transactions: Transaction[] = [];
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    const batch = ImportBatchSchema.parse({
      source: 'usaa_csv',
      filename: `import_${Date.now()}.csv`,
      rowCount: lines.length - 1, // exclude header
      importedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      importedBy,
    });

    const savedBatch = await this.repo.addImportBatch(batch);

    // Parse CSV: skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      try {
        const row = this.parseUSAARow(lines[i]);
        if (!row) {
          skippedCount++;
          continue;
        }

        const amountCents = Math.round(parseFloat(row.amount) * 100);
        const category = await this.categorizationService.categorizeTransaction(row.description);
        const deductiblePct = category?.deductiblePct ?? 0;

        const tx: Transaction = {
          id: crypto.randomUUID(),
          date: new Date(row.date),
          description: row.description,
          amount: amountCents,
          categoryId: category?.id ?? 'uncategorized',
          accountId,
          entity,
          taxRelevant: deductiblePct > 0,
          taxCode: category?.taxCode,
          importSource: 'usaa_csv',
          importBatchId: savedBatch.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const saved = await this.repo.addTransaction(tx);
        transactions.push(saved);
        importedCount++;
      } catch (err) {
        errorCount++;
      }
    }

    const updatedBatch = await this.repo.updateImportBatch(savedBatch.id, {
      importedCount,
      skippedCount,
      errorCount,
    });

    return { batch: updatedBatch, transactions };
  }

  private parseUSAARow(line: string): CSVRow | null {
    // USAA CSV format: Date,Description,Amount,Balance
    const parts = line.split(',');
    if (parts.length < 4) return null;

    const [date, description, amount, balance] = parts;
    
    // Validate fields
    if (!date || !description || !amount) return null;

    return {
      date: date.trim(),
      description: description.trim(),
      amount: amount.trim(),
      balance: balance.trim(),
    };
  }
}
