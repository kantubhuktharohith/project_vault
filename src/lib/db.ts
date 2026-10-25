import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

let dbInstance: Database.Database | null = null;

export interface DbQueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
}

export interface DbClient {
  raw: Database.Database;
  query<T = unknown>(sql: string, params?: unknown[]): Promise<DbQueryResult<T>>;
}

export async function getDb(): Promise<DbClient> {
  if (!dbInstance) {
    const rawPath = process.env.DATABASE_PATH || process.env.DATABASE_URL || "vault.db";
    // If DATABASE_URL contains an old postgres URL, fall back to vault.db
    const resolvedPath =
      rawPath.startsWith("postgres://") || rawPath.startsWith("postgresql://")
        ? path.resolve(process.cwd(), "vault.db")
        : path.isAbsolute(rawPath)
          ? rawPath
          : path.resolve(process.cwd(), rawPath.replace(/^file:/, ""));

    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    dbInstance = new Database(resolvedPath);
    dbInstance.pragma("journal_mode = WAL");

    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        live_url TEXT NOT NULL DEFAULT '',
        github_url TEXT NOT NULL DEFAULT '',
        image_url TEXT NOT NULL DEFAULT '',
        tech TEXT NOT NULL DEFAULT '[]',
        category TEXT NOT NULL DEFAULT 'own',
        created_at INTEGER NOT NULL
      );
    `);
  }

  return {
    raw: dbInstance,
    async query<T = unknown>(sql: string, params: unknown[] = []): Promise<DbQueryResult<T>> {
      // Support both SQLite '?' and PostgreSQL '$1, $2, ...' placeholders
      const normalizedSql = sql.replace(/\$\d+/g, "?");
      const stmt = dbInstance!.prepare(normalizedSql);

      const isSelect = /^\s*SELECT/i.test(normalizedSql);
      if (isSelect) {
        const rows = stmt.all(...params) as T[];
        return { rows, rowCount: rows.length };
      } else {
        const info = stmt.run(...params);
        return { rows: [], rowCount: info.changes };
      }
    },
  };
}
