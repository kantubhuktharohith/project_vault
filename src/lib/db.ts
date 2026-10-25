import pg from "pg";

let pool: pg.Pool | null = null;
let initialized = false;

function getSslConfig(url?: string): boolean | { rejectUnauthorized: boolean } {
  if (!url) return false;
  // Normal local / intranet PostgreSQL instances do not use SSL
  if (
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes("::1") ||
    url.includes("sslmode=disable")
  ) {
    return false;
  }
  // Cloud databases requiring SSL (Supabase, Neon, AWS RDS, etc.)
  if (
    url.includes("sslmode=require") ||
    url.includes("supabase.co") ||
    url.includes("neon.tech") ||
    url.includes(".pooler.")
  ) {
    return { rejectUnauthorized: false };
  }
  return false;
}

export async function getDb(): Promise<pg.Pool> {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    pool = new pg.Pool({
      connectionString: connectionString || undefined,
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: getSslConfig(connectionString),
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
