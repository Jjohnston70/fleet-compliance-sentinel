import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  type BrowserCapturePayload,
  type KnowledgeRecord,
  type TimelineQuery,
  type TimelineSummary,
  getAiLabPaths,
} from "../../tnds-types/src/index.ts";

export interface KnowledgeStore {
  saveRecord(input: Omit<KnowledgeRecord, "id" | "createdAt">): Promise<KnowledgeRecord>;
  listRecords(query?: TimelineQuery): Promise<KnowledgeRecord[]>;
  summarizeTimeline(query?: TimelineQuery): Promise<TimelineSummary[]>;
}

export function createKnowledgeStore(filePath?: string): KnowledgeStore {
  const paths = getAiLabPaths();
  const targetPath = filePath ?? path.join(paths.knowledgeDir, "records.json");

  return {
    async saveRecord(input) {
      const records = readRecords(targetPath);
      const record: KnowledgeRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        ...input,
      };

      records.push(record);
      writeRecords(targetPath, records);
      return record;
    },

    async listRecords(query = {}) {
      const records = readRecords(targetPath);
      return filterTimeline(records, query);
    },

    async summarizeTimeline(query = {}) {
      const records = filterTimeline(readRecords(targetPath), query);
      const byDate = new Map<string, KnowledgeRecord[]>();

      for (const record of records) {
        const day = record.createdAt.slice(0, 10);
        const list = byDate.get(day) ?? [];
        list.push(record);
        byDate.set(day, list);
      }

      return Array.from(byDate.entries())
        .sort((a, b) => (a[0] > b[0] ? -1 : 1))
        .map(([date, dayRecords]) => ({
          date,
          highlights: dayRecords
            .slice(0, 3)
            .map((record) => record.title || record.sourceId)
            .filter(Boolean),
          relatedRecordIds: dayRecords.map((record) => record.id),
        }));
    },
  };
}

export async function saveBrowserCaptureToKnowledge(payload: BrowserCapturePayload): Promise<KnowledgeRecord> {
  const store = createKnowledgeStore();

  return store.saveRecord({
    domainSlug: payload.domainSlug ?? "general",
    sourceType: "webpage",
    sourceId: payload.url,
    title: payload.title,
    content: payload.content,
    tags: payload.tags ?? [],
    metadata: {
      url: payload.url,
    },
  });
}

function filterTimeline(records: KnowledgeRecord[], query: TimelineQuery): KnowledgeRecord[] {
  const fromDate = query.fromDate ? Date.parse(query.fromDate) : null;
  const toDate = query.toDate ? Date.parse(query.toDate) : null;

  const filtered = records.filter((record) => {
    const created = Date.parse(record.createdAt);

    if (query.domainSlug && record.domainSlug !== query.domainSlug) return false;
    if (fromDate && created < fromDate) return false;
    if (toDate && created > toDate) return false;

    return true;
  });

  filtered.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  if (query.limit && query.limit > 0) {
    return filtered.slice(0, query.limit);
  }

  return filtered;
}

function readRecords(filePath: string): KnowledgeRecord[] {
  if (!existsSync(filePath)) return [];

  try {
    const raw = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as KnowledgeRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeRecords(filePath: string, records: KnowledgeRecord[]): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(records, null, 2));
}
