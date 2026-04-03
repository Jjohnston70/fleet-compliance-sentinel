import { runSqlFile } from "./run-sql.mjs";

try {
  const filePath = await runSqlFile("src/data/schema.sql");
  console.log(`Migration complete: ${filePath}`);
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exit(1);
}
