import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * D1-compatible wrapper around Supabase.
 * Inlines parameters directly into SQL to avoid type casting issues.
 */

class SupabaseD1Statement {
  private client: SupabaseClient;
  private sql: string;
  private params: any[];

  constructor(client: SupabaseClient, sql: string) {
    this.client = client;
    this.sql = sql;
    this.params = [];
  }

  bind(...params: any[]): this {
    this.params = params;
    return this;
  }

  async first<T = any>(colOrUndef?: string): Promise<T | null> {
    const { results } = await this._run<T>();
    if (!results || results.length === 0) return null;
    return results[0] as T;
  }

  async all<T = any>(): Promise<{ results: T[] }> {
    return this._run<T>();
  }

  async run(): Promise<{ success: boolean; meta: { last_row_id: number; changes: number } }> {
    const { results } = await this._run<any>();
    const meta = results?.[0] || {};
    return {
      success: true,
      meta: {
        last_row_id: meta.last_row_id ?? 0,
        changes: meta.changes ?? 1,
      },
    };
  }

  private escapeLiteral(val: any): string {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    // String: escape single quotes
    return "'" + String(val).replace(/'/g, "''") + "'";
  }

  private async _run<T>(): Promise<{ results: T[] }> {
    try {
      // Inline parameters directly into SQL
      let finalSql = this.sql;
      let paramIdx = 0;
      finalSql = finalSql.replace(/\?/g, () => {
        if (paramIdx < this.params.length) {
          return this.escapeLiteral(this.params[paramIdx++]);
        }
        return 'NULL';
      });

      const { data, error } = await this.client.rpc('exec_sql', {
        q: finalSql,
        p: null,
      });

      if (error) {
        console.error('[SupabaseD1] SQL Error:', error.message, '\nSQL:', finalSql.substring(0, 200));
        throw new Error(`DB Error: ${error.message}`);
      }

      return { results: (data as T[]) || [] };
    } catch (err: any) {
      if (err.message?.startsWith('DB Error:')) throw err;
      console.error('[SupabaseD1] Query failed:', this.sql, err);
      throw new Error(`DB Error: ${err.message || err}`);
    }
  }
}

export class SupabaseD1 {
  public client: SupabaseClient;

  constructor(url: string, serviceKey: string) {
    this.client = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  prepare(sql: string): SupabaseD1Statement {
    return new SupabaseD1Statement(this.client, sql);
  }
}
