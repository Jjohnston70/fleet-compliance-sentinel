import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  type ChunkRecord,
  type IngestedDocument,
  type RetrievedChunk,
  getAiLabPaths,
} from "@tnds/types";

export interface ChunkingOptions {
  maxChunkChars?: number;
  overlapChars?: number;
}

export interface RetrievalQuery {
  query: string;
  topK: number;
  domainSlug?: string;
}

export interface RetrievalIndex {
  addDocument(record: {
    recordId: string;
    sourceId: string;
    domainSlug: string;
    document: IngestedDocument;
    chunking?: ChunkingOptions;
  }): Promise<ChunkRecord[]>;
  search(query: RetrievalQuery): Promise<RetrievedChunk[]>;
  clear(): Promise<void>;
  listChunks(): Promise<ChunkRecord[]>;
}

export interface PromptBuilder {
  buildContextPrompt(params: {
    question: string;
    chunks: RetrievedChunk[];
    instruction?: string;
  }): string;
}

export function estimateTokenCount(text: string): number {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount * 1.3));
}

export function chunkText(input: string, options: ChunkingOptions = {}): string[] {
  const maxChunkChars = options.maxChunkChars ?? 1200;
  const overlapChars = options.overlapChars ?? 120;
  const normalizedInput = input.trim();

  if (!normalizedInput) return [];

  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < normalizedInput.length) {
    const end = Math.min(cursor + maxChunkChars, normalizedInput.length);
    const slice = normalizedInput.slice(cursor, end).trim();
    if (slice) chunks.push(slice);
    if (end >= normalizedInput.length) break;
    cursor = Math.max(0, end - overlapChars);
  }

  return chunks;
}

export function buildGroundedPrompt(params: {
  question: string;
  chunks: RetrievedChunk[];
  instruction?: string;
}): string {
  const instruction =
    params.instruction ??
    "Use the context chunks when relevant. If context is insufficient, say what is missing.";

  const context = params.chunks
    .map((chunk, index) => `Source ${index + 1} [${chunk.sourceId}]\n${chunk.text}`)
    .join("\n\n");

  return [instruction, "", "Context:", context || "(no retrieved context)", "", `Question: ${params.question}`, "Answer:"].join(
    "\n",
  );
}

export class JsonChunkIndex implements RetrievalIndex {
  private readonly filePath: string;
  private chunks: ChunkRecord[] | null = null;
  private sourceIdsByChunk = new Map<string, string>();

  constructor(filePath?: string) {
    const paths = getAiLabPaths();
    this.filePath = filePath ?? path.join(paths.indexDir, "chunks.json");
  }

  async addDocument(input: {
    recordId: string;
    sourceId: string;
    domainSlug: string;
    document: IngestedDocument;
    chunking?: ChunkingOptions;
  }): Promise<ChunkRecord[]> {
    const existing = await this.getChunks();

    const chunkTexts = chunkText(input.document.text, input.chunking);
    const createdChunks: ChunkRecord[] = chunkTexts.map((text, index) => ({
      id: `${input.recordId}:chunk:${index}`,
      recordId: input.recordId,
      domainSlug: input.domainSlug,
      chunkIndex: index,
      text,
      tokenCount: estimateTokenCount(text),
      metadata: {
        sourceId: input.sourceId,
        sourceType: input.document.sourceType,
      },
    }));

    const prefix = `${input.recordId}:chunk:`;
    const withoutRecord = existing.filter((chunk) => !chunk.id.startsWith(prefix));

    this.chunks = [...withoutRecord, ...createdChunks];

    for (const chunk of createdChunks) {
      this.sourceIdsByChunk.set(chunk.id, input.sourceId);
    }

    await this.flush();
    return createdChunks;
  }

  async search(query: RetrievalQuery): Promise<RetrievedChunk[]> {
    const chunks = await this.getChunks();
    const queryTokens = tokenize(query.query);

    const ranked = chunks
      .filter((chunk) => (query.domainSlug ? chunk.domainSlug === query.domainSlug : true))
      .map((chunk) => {
        const chunkTokens = tokenize(chunk.text);
        const score = overlapScore(queryTokens, chunkTokens);
        const sourceId =
          this.sourceIdsByChunk.get(chunk.id) ??
          (typeof chunk.metadata?.sourceId === "string" ? chunk.metadata.sourceId : chunk.recordId);

        return {
          chunkId: chunk.id,
          recordId: chunk.recordId,
          sourceId,
          domainSlug: chunk.domainSlug,
          text: chunk.text,
          score,
        } satisfies RetrievedChunk;
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, query.topK);

    return ranked;
  }

  async clear(): Promise<void> {
    this.chunks = [];
    this.sourceIdsByChunk.clear();
    await this.flush();
  }

  async listChunks(): Promise<ChunkRecord[]> {
    return this.getChunks();
  }

  private async getChunks(): Promise<ChunkRecord[]> {
    if (this.chunks) return this.chunks;

    if (!existsSync(this.filePath)) {
      this.chunks = [];
      return this.chunks;
    }

    try {
      const raw = readFileSync(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as ChunkRecord[];
      this.chunks = parsed;

      for (const chunk of parsed) {
        const sourceId =
          typeof chunk.metadata?.sourceId === "string" ? chunk.metadata.sourceId : chunk.recordId;
        this.sourceIdsByChunk.set(chunk.id, sourceId);
      }

      return this.chunks;
    } catch {
      this.chunks = [];
      return this.chunks;
    }
  }

  private async flush(): Promise<void> {
    const target = this.chunks ?? [];
    mkdirSync(path.dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(target, null, 2));
  }
}

function tokenize(input: string): Set<string> {
  return new Set(
    input
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2),
  );
}

function overlapScore(queryTokens: Set<string>, chunkTokens: Set<string>): number {
  if (queryTokens.size === 0 || chunkTokens.size === 0) return 0;

  let overlap = 0;
  for (const token of queryTokens) {
    if (chunkTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / queryTokens.size;
}
