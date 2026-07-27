import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

let initialized = false;

export async function getDb() {
  if (!initialized) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        live_url TEXT NOT NULL DEFAULT '',
        github_url TEXT NOT NULL DEFAULT '',
        image_url TEXT NOT NULL DEFAULT '',
        tech TEXT NOT NULL DEFAULT '[]',
        category TEXT NOT NULL DEFAULT 'own',
        created_at BIGINT NOT NULL
      );
    `);
    initialized = true;
  }
  return pool;
}
