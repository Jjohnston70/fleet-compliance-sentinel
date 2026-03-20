import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type DocumentSourceType =
  | "txt"
  | "md"
  | "pdf"
  | "docx"
  | "csv"
  | "html"
  | "webpage"
  | "unknown";

export interface PromptTemplateArgs {
  [key: string]: string | number | boolean | null | undefined | string[];
}

export type PromptTemplateFn<TArgs extends PromptTemplateArgs = PromptTemplateArgs> = (
  args: TArgs,
) => string;

export interface PromptTemplateDescriptor {
  id: string;
  category: string;
  name: string;
  version: string;
  filePath: string;
  source: "core" | "domain";
  domainSlug?: string;
}

export interface SkillProfile {
  id: string;
  description: string;
  behaviorNotes: string[];
  linkedPrompts?: string[];
  source: "core" | "domain";
  domainSlug?: string;
}

export interface DomainManifest {
  name: string;
  slug: string;
  version: string;
  description: string;
  enabled: boolean;
  defaultSkills: string[];
  defaultPrompts: string[];
  tags: string[];
}

export interface DomainAssetMetadata {
  documents: string[];
  chunks: string[];
  prompts: string[];
  skills: string[];
  tags: string[];
}

export interface LoadedDomain {
  manifest: DomainManifest;
  rootPath: string;
  assets: DomainAssetMetadata;
}

export interface InvalidDomain {
  rootPath: string;
  reason: string;
}

export interface KnowledgeRecord {
  id: string;
  domainSlug: string;
  sourceType: DocumentSourceType;
  sourceId: string;
  title?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ChunkRecord {
  id: string;
  recordId: string;
  domainSlug: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  metadata?: Record<string, unknown>;
}

export interface RetrievedChunk {
  chunkId: string;
  recordId: string;
  sourceId: string;
  domainSlug: string;
  text: string;
  score: number;
}

export interface TimelineQuery {
  domainSlug?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

export interface TimelineSummary {
  date: string;
  highlights: string[];
  relatedRecordIds: string[];
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  properties?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relation: string;
  weight?: number;
  properties?: Record<string, unknown>;
}

export interface GraphSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface IngestedDocument {
  filePath: string;
  fileName: string;
  sourceType: DocumentSourceType;
  text: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface SavedUploadResult {
  filePath: string;
  fileName: string;
  bytesWritten: number;
}

export interface BrowserCapturePayload {
  title: string;
  url: string;
  content: string;
  domainSlug?: string;
  tags?: string[];
}

export interface AiLabPaths {
  rootDir: string;
  appsDir: string;
  packagesDir: string;
  dataDir: string;
  docsDir: string;
  knowledgeDir: string;
  indexDir: string;
  graphDir: string;
  domainsDir: string;
  promptsDir: string;
  skillsDir: string;
}

export function resolveProjectRoot(
  startDir: string = process.cwd(),
  rootMarkerName?: string
): string {
  if (rootMarkerName) {
    let current = path.resolve(startDir);
    while (true) {
      const packageJsonPath = path.join(current, 'package.json');
      if (existsSync(packageJsonPath)) {
        try {
          const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { name?: string };
          if (parsed.name === rootMarkerName) return current;
        } catch { /* keep searching */ }
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  let current = path.resolve(startDir);
  while (true) {
    const packageJsonPath = path.join(current, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
          name?: string;
          workspaces?: unknown;
        };
        if (parsed.workspaces || parsed.name === 'ai-lab') return current;
      } catch { /* keep searching */ }
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(
        `Could not resolve project root from: ${startDir}. Pass an explicit rootDir to getPaths() instead.`
      );
    }
    current = parent;
  }
}

export function resolveAiLabRoot(startDir: string = process.cwd()): string {
  return resolveProjectRoot(startDir, 'ai-lab');
}

export interface PathConfig {
  rootDir: string;
  dataDir?: string;
  domainsDir?: string;
}

export function getPaths(config: PathConfig): AiLabPaths {
  const { rootDir } = config;
  const dataDir = config.dataDir ?? path.join(rootDir, 'data');
  return {
    rootDir,
    appsDir: path.join(rootDir, 'apps'),
    packagesDir: path.join(rootDir, 'packages'),
    dataDir,
    docsDir: path.join(dataDir, 'docs'),
    knowledgeDir: path.join(dataDir, 'knowledge'),
    indexDir: path.join(dataDir, 'index'),
    graphDir: path.join(dataDir, 'graph'),
    domainsDir: config.domainsDir ?? path.join(rootDir, 'domains'),
    promptsDir: path.join(rootDir, 'prompts'),
    skillsDir: path.join(rootDir, 'skills'),
  };
}

export function getAiLabPaths(startDir: string = process.cwd()): AiLabPaths {
  const rootDir = resolveProjectRoot(startDir);
  return getPaths({ rootDir });
}

export function isValidDomainManifest(value: unknown): value is DomainManifest {
  if (!value || typeof value !== "object") return false;

  const candidate = value as DomainManifest;

  return (
    typeof candidate.name === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.version === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.enabled === "boolean" &&
    Array.isArray(candidate.defaultSkills) &&
    Array.isArray(candidate.defaultPrompts) &&
    Array.isArray(candidate.tags)
  );
}
