import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const moduleRoot = path.resolve(__dirname, "..");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const idx = line.indexOf("=");
    if (idx < 1) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  readEnvFile(path.join(moduleRoot, ".env"));
  readEnvFile(path.join(moduleRoot, ".env.local"));
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  readEnvFile(path.join(moduleRoot, "..", "..", ".env"));
  readEnvFile(path.join(moduleRoot, "..", "..", ".env.local"));
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  throw new Error(
    "DATABASE_URL is not set. Add it to environment, tooling/sales-command/.env, or repo root .env."
  );
}

function loadSql(relativePath) {
  const absolute = path.join(moduleRoot, relativePath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`SQL file not found: ${absolute}`);
  }
  return {
    absolute,
    text: fs.readFileSync(absolute, "utf8"),
  };
}

export async function runSqlFile(relativePath) {
  const databaseUrl = ensureDatabaseUrl();
  const { absolute, text } = loadSql(relativePath);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("sslmode=disable")
      ? false
      : { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(text);
  } finally {
    await client.end();
  }

  return absolute;
}
