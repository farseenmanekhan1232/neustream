const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function runMultiSourceMigration() {
  let client;

  try {
    console.log("Starting multi-source architecture migration...");
    console.log("Connection details:", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
    });

    client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database");

    await client.query("BEGIN");

    // Step 1: Create stream_sources table
    console.log("Creating stream_sources table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS stream_sources (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        stream_key VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP
      )
    `);

    // Add indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_stream_sources_user_id ON stream_sources(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_stream_sources_stream_key ON stream_sources(stream_key)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_stream_sources_active ON stream_sources(user_id, is_active)
    `);

    // Step 2: Create source_destinations table
    console.log("Creating source_destinations table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS source_destinations (
        id SERIAL PRIMARY KEY,
        source_id INTEGER REFERENCES stream_sources(id) ON DELETE CASCADE,
        platform VARCHAR(100) NOT NULL,
        rtmp_url TEXT NOT NULL,
        stream_key TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add indexes for source_destinations
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_source_destinations_source_id ON source_destinations(source_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_source_destinations_active ON source_destinations(source_id, is_active)
    `);

    // Step 3: Update active_streams table to include source_id
    console.log("Updating active_streams table...");
    await client.query(`
      ALTER TABLE active_streams
      ADD COLUMN IF NOT EXISTS source_id INTEGER REFERENCES stream_sources(id) ON DELETE SET NULL
    `);

    // Add index for active_streams source_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_active_streams_source_id ON active_streams(source_id)
    `);

    // Step 4: Migrate existing stream keys to stream_sources
    console.log("Migrating existing stream keys to stream_sources table...");

    // Check if we have any existing users to migrate
    const existingUsers = await client.query(`
      SELECT id, email, stream_key FROM users WHERE stream_key IS NOT NULL
    `);

    if (existingUsers.rows.length > 0) {
      console.log(`Found ${existingUsers.rows.length} users with existing stream keys`);

      for (const user of existingUsers.rows) {
        // Check if this stream key already exists in stream_sources
        const existingSource = await client.query(`
          SELECT id FROM stream_sources WHERE stream_key = $1
        `, [user.stream_key]);

        if (existingSource.rows.length === 0) {
          // Create default stream source for existing users
          await client.query(`
            INSERT INTO stream_sources (user_id, name, stream_key, description)
            VALUES ($1, $2, $3, $4)
          `, [
            user.id,
            'Default Stream',
            user.stream_key,
            'Migrated from single-stream architecture'
          ]);
          console.log(`Created default stream source for user: ${user.email}`);
        } else {
          console.log(`Stream source already exists for user: ${user.email}`);
        }
      }
    } else {
      console.log("No existing users with stream keys found");
    }

    // Step 5: Migrate existing destinations to source_destinations
    console.log("Migrating existing destinations to source_destinations table...");

    const existingDestinations = await client.query(`
      SELECT d.*, u.email, u.stream_key as user_stream_key
      FROM destinations d
      JOIN users u ON d.user_id = u.id
    `);

    if (existingDestinations.rows.length > 0) {
      console.log(`Found ${existingDestinations.rows.length} destinations to migrate`);

      for (const dest of existingDestinations.rows) {
        // Find the stream source for this user
        const streamSource = await client.query(`
          SELECT id FROM stream_sources
          WHERE user_id = $1 AND stream_key = $2
        `, [dest.user_id, dest.user_stream_key]);

        if (streamSource.rows.length > 0) {
          const sourceId = streamSource.rows[0].id;

          // Check if this destination already exists in source_destinations
          const existingSourceDest = await client.query(`
            SELECT id FROM source_destinations
            WHERE source_id = $1 AND platform = $2 AND rtmp_url = $3 AND stream_key = $4
          `, [sourceId, dest.platform, dest.rtmp_url, dest.stream_key]);

          if (existingSourceDest.rows.length === 0) {
            // Migrate destination to source_destinations
            await client.query(`
              INSERT INTO source_destinations (source_id, platform, rtmp_url, stream_key, is_active)
              VALUES ($1, $2, $3, $4, $5)
            `, [
              sourceId,
              dest.platform,
              dest.rtmp_url,
              dest.stream_key,
              dest.is_active
            ]);
            console.log(`Migrated destination for user: ${dest.email}, platform: ${dest.platform}`);
          } else {
            console.log(`Source destination already exists for user: ${dest.email}, platform: ${dest.platform}`);
          }
        }
      }
    } else {
      console.log("No existing destinations found to migrate");
    }

    // Step 6: Add created_at column to destinations if it doesn't exist (for consistency)
    console.log("Updating destinations table schema...");
    await client.query(`
      ALTER TABLE destinations
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Step 7: Create a function to get default stream source for user
    console.log("Creating helper function for default stream source...");
    await client.query(`
      CREATE OR REPLACE FUNCTION get_default_stream_source(user_id_param INTEGER)
      RETURNS TABLE (id INTEGER, stream_key VARCHAR(255)) AS $$
      BEGIN
        RETURN QUERY
        SELECT ss.id, ss.stream_key
        FROM stream_sources ss
        WHERE ss.user_id = user_id_param AND ss.is_active = true
        ORDER BY ss.created_at ASC
        LIMIT 1;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query("COMMIT");
    console.log("✅ Multi-source migration completed successfully!");

    // Show migration summary
    console.log("\n=== Migration Summary ===");

    const streamSourcesCount = await client.query("SELECT COUNT(*) as count FROM stream_sources");
    console.log(`Total stream sources: ${streamSourcesCount.rows[0].count}`);

    const sourceDestsCount = await client.query("SELECT COUNT(*) as count FROM source_destinations");
    console.log(`Total source destinations: ${sourceDestsCount.rows[0].count}`);

    const oldDestsCount = await client.query("SELECT COUNT(*) as count FROM destinations");
    console.log(`Legacy destinations (kept for compatibility): ${oldDestsCount.rows[0].count}`);

    console.log("\n=== Migration Complete ===");
    console.log("Next steps:");
    console.log("1. Update control-plane API endpoints to use stream_sources");
    console.log("2. Update media-server scripts for multi-source support");
    console.log("3. Update frontend to manage multiple sources");
    console.log("4. Test end-to-end multi-source streaming");

  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Migration error:", err);
    throw err;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the migration
if (require.main === module) {
  runMultiSourceMigration()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

module.exports = { runMultiSourceMigration };