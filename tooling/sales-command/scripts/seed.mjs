import { runSqlFile } from "./run-sql.mjs";

try {
  const filePath = await runSqlFile("src/data/seed.sql");
  console.log(`Seed complete: ${filePath}`);
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}
