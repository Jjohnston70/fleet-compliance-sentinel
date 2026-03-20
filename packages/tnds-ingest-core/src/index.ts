import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  type BrowserCapturePayload,
  type DomainAssetMetadata,
  type DomainManifest,
  type IngestedDocument,
  type InvalidDomain,
  type LoadedDomain,
  type SavedUploadResult,
  getAiLabPaths,
  isValidDomainManifest,
} from "../../tnds-types/src/index.ts";

export interface IngestFileOptions {
  domainSlug?: string;
}

export interface IngestWebpageOptions {
  domainSlug?: string;
}

export interface DomainLoadResult {
  enabledDomains: LoadedDomain[];
  invalidDomains: InvalidDomain[];
}

export function ensureDataDirectories(): void {
  const paths = getAiLabPaths();
  mkdirSync(paths.docsDir, { recursive: true });
  mkdirSync(paths.knowledgeDir, { recursive: true });
  mkdirSync(paths.indexDir, { recursive: true });
  mkdirSync(paths.graphDir, { recursive: true });
}

export function inferSourceTypeFromFileName(fileName: string): IngestedDocument["sourceType"] {
  const extension = path.extname(fileName).toLowerCase();
  switch (extension) {
    case ".txt":
      return "txt";
    case ".md":
      return "md";
    case ".pdf":
      return "pdf";
    case ".docx":
      return "docx";
    case ".csv":
      return "csv";
    case ".html":
    case ".htm":
      return "html";
    default:
      return "unknown";
  }
}

export function saveUploadedFile(input: {
  fileName: string;
  bytes: Uint8Array;
  destinationDir?: string;
}): SavedUploadResult {
  const paths = getAiLabPaths();
  const destinationDir = input.destinationDir ?? paths.docsDir;
  mkdirSync(destinationDir, { recursive: true });

  const filePath = path.join(destinationDir, input.fileName);
  writeFileSync(filePath, Buffer.from(input.bytes));

  return {
    filePath,
    fileName: input.fileName,
    bytesWritten: input.bytes.byteLength,
  };
}

export async function ingestFile(filePath: string, options: IngestFileOptions = {}): Promise<IngestedDocument> {
  const fileName = path.basename(filePath);
  const sourceType = inferSourceTypeFromFileName(fileName);

  const text = await normalizeFileToText(filePath, sourceType);

  return {
    filePath,
    fileName,
    sourceType,
    text,
    title: fileName,
    metadata: {
      domainSlug: options.domainSlug ?? "general",
      byteSize: statSync(filePath).size,
    },
  };
}

export async function ingestWebpagePayload(
  payload: BrowserCapturePayload,
  options: IngestWebpageOptions = {},
): Promise<IngestedDocument> {
  const normalizedText = normalizeText(payload.content);
  const fileName = `${sanitizeFileToken(payload.title || "captured-page")}-${Date.now()}.txt`;

  return {
    filePath: payload.url,
    fileName,
    sourceType: "webpage",
    text: normalizedText,
    title: payload.title,
    metadata: {
      url: payload.url,
      domainSlug: options.domainSlug ?? payload.domainSlug ?? "general",
      tags: payload.tags ?? [],
    },
  };
}

export function loadDomains(): DomainLoadResult {
  const paths = getAiLabPaths();
  const enabledDomains: LoadedDomain[] = [];
  const invalidDomains: InvalidDomain[] = [];

  let domainEntries: string[] = [];
  try {
    domainEntries = readdirSync(paths.domainsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => !name.startsWith("."));
  } catch {
    return { enabledDomains, invalidDomains };
  }

  for (const domainName of domainEntries) {
    const rootPath = path.join(paths.domainsDir, domainName);
    const manifestPath = path.join(rootPath, "manifest.json");

    try {
      const manifestValue = JSON.parse(readFileSync(manifestPath, "utf8")) as DomainManifest;

      if (!isValidDomainManifest(manifestValue)) {
        invalidDomains.push({
          rootPath,
          reason: "Invalid manifest fields.",
        });
        continue;
      }

      if (!manifestValue.enabled) {
        continue;
      }

      enabledDomains.push({
        manifest: manifestValue,
        rootPath,
        assets: loadDomainAssets(rootPath),
      });
    } catch (error) {
      invalidDomains.push({
        rootPath,
        reason: error instanceof Error ? error.message : "Failed to parse manifest.json",
      });
    }
  }

  return {
    enabledDomains,
    invalidDomains,
  };
}

export function listEnabledDomainSlugs(): string[] {
  return loadDomains().enabledDomains.map((domain) => domain.manifest.slug);
}

export function getDomainBySlug(slug: string): LoadedDomain | null {
  const { enabledDomains } = loadDomains();
  return enabledDomains.find((domain) => domain.manifest.slug === slug) ?? null;
}

function loadDomainAssets(domainRoot: string): DomainAssetMetadata {
  return {
    documents: listFiles(path.join(domainRoot, "documents")),
    chunks: listFiles(path.join(domainRoot, "chunks")),
    prompts: listFiles(path.join(domainRoot, "prompts")),
    skills: listFiles(path.join(domainRoot, "skills")),
    tags: listFiles(path.join(domainRoot, "tags")),
  };
}

function listFiles(folderPath: string): string[] {
  try {
    return readdirSync(folderPath, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

async function normalizeFileToText(
  filePath: string,
  sourceType: IngestedDocument["sourceType"],
): Promise<string> {
  switch (sourceType) {
    case "txt":
    case "md":
      return normalizeText(readFileSync(filePath, "utf8"));
    case "csv":
      return normalizeText(await parseCsvToText(filePath));
    case "html":
      return normalizeText(await parseHtmlToText(filePath));
    case "docx":
      return normalizeText(await parseDocxToText(filePath));
    case "pdf":
      return normalizeText(await parsePdfToText(filePath));
    default:
      return normalizeText(readFileSync(filePath, "utf8"));
  }
}

function normalizeText(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function parseDocxToText(filePath: string): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value ?? "";
}

async function parsePdfToText(filePath: string): Promise<string> {
  const pdfParseModule = await import("pdf-parse");
  const pdfParse =
    (pdfParseModule as unknown as { default?: (input: Buffer) => Promise<{ text?: string }> })
      .default ??
    (pdfParseModule as unknown as (input: Buffer) => Promise<{ text?: string }>);
  const buffer = readFileSync(filePath);
  const result = await pdfParse(buffer);
  return result.text ?? "";
}

async function parseCsvToText(filePath: string): Promise<string> {
  const csvSync = await import("csv-parse/sync");
  const raw = readFileSync(filePath, "utf8");
  const records = csvSync.parse(raw) as string[][];

  return records
    .map((record) => record.join(" | "))
    .join("\n")
    .trim();
}

async function parseHtmlToText(filePath: string): Promise<string> {
  const cheerio = await import("cheerio");
  const raw = readFileSync(filePath, "utf8");
  const $ = cheerio.load(raw);
  return $("body").text();
}

function sanitizeFileToken(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "document";
}
