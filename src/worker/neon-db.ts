import { neon, Pool } from '@neondatabase/serverless';

/**
 * NeonDB adapter with D1-compatible API.
 * Uses Neon's HTTP driver for serverless-friendly queries.
 */

class NeonPreparedStatement {
  private db: NeonDB;
  private sql: string;
  private params: any[];

  constructor(db: NeonDB, sql: string) {
    this.db = db;
    this.sql = sql.trim();
    this.params = [];
  }

  bind(...params: any[]): NeonPreparedStatement {
    this.params = params;
    return this;
  }

  async first<T = any>(column?: string): Promise<T | null> {
    const result = await this.all<T>();
    if (!result.results || result.results.length === 0) return null;
    if (column) return result.results[0][column] as T;
    return result.results[0] as T;
  }

  async all<T = any>(): Promise<{ results: T[] }> {
    try {
      const rows = await this.db.query(this.sql, this.params);
      return { results: (rows as T[]) || [] };
    } catch (err) {
      console.error('NeonDB query failed:', this.sql, err);
      throw err;
    }
  }

  async run(): Promise<{ success: boolean; meta: { last_row_id: number; changes: number } }> {
    try {
      const rows = await this.db.query(this.sql, this.params);
      const result = rows?.[0] || {};
      return {
        success: true,
        meta: {
          last_row_id: result.last_row_id ?? result.id ?? 0,
          changes: result.changes ?? (Array.isArray(rows) ? rows.length : 1),
        },
      };
    } catch (err) {
      console.error('NeonDB run failed:', this.sql, err);
      throw err;
    }
  }
}

export class NeonDB {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  /** Execute a parameterized query */
  async query(sql: string, params: any[] = []): Promise<any[]> {
    // Convert ? placeholders to $1, $2, etc. for PostgreSQL
    let paramIndex = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++paramIndex}`);

    const result = await this.pool.query(pgSql, params);
    return result.rows;
  }

  prepare(sql: string): NeonPreparedStatement {
    return new NeonPreparedStatement(this, sql);
  }
}
