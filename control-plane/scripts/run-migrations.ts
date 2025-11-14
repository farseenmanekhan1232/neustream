import Database from "../lib/database";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function runMigrations(): Promise<void> {
  const db = new Database();

  try {
    console.log("🚀 Starting database migrations...");

    // Create migrations table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Get list of already executed migrations
    const executedMigrations = await db.query<{ name: string }>("SELECT name FROM migrations");
    const executedNames = new Set(executedMigrations.map((m) => m.name));

    // Read migration files
    const migrationsDir = path.join(__dirname, "../migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`📁 Found ${files.length} migration files`);

    for (const file of files) {
      if (executedNames.has(file)) {
        console.log(`✅ ${file} - already executed`);
        continue;
      }

      console.log(`📝 Executing ${file}...`);

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      try {
        await db.query(sql);
        await db.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
        console.log(`✅ ${file} - executed successfully`);
      } catch (error: any) {
        console.error(`❌ ${file} - failed:`, error.message);
        console.error(`Full error details:`, error);
        throw error;
      }
    }

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations;
