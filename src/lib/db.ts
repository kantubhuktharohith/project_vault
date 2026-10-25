import pg from "pg";

let pool: pg.Pool | null = null;
let initialized = false;

export async function getDb(): Promise<pg.Pool> {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    pool = new pg.Pool({
      connectionString,
      ssl: connectionString?.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });
  }

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
