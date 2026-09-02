import { createClient, SupabaseClient } from '@supabase/supabase-js';

// D1-compatible wrapper around Supabase
// Usage: Replace c.env.DB with a SupabaseDB instance

export interface SupabaseDBConfig {
  url: string;
  serviceRoleKey: string;
}

class D1PreparedStatement {
  private db: SupabaseDB;
  private sql: string;
  private params: any[];

  constructor(db: SupabaseDB, sql: string) {
    this.db = db;
    this.sql = sql.trim();
    this.params = [];
  }

  bind(...params: any[]): D1PreparedStatement {
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
      const { data, error } = await this.db.supabase.rpc('exec_sql', {
        q: this.sql,
        p: JSON.stringify(this.params),
      });

      if (error) {
        console.error('Supabase SQL error:', error, '\nSQL:', this.sql, '\nParams:', this.params);
        throw new Error(`SQL Error: ${error.message}`);
      }

      return { results: (data as T[]) || [] };
    } catch (err) {
      console.error('Query failed:', this.sql, err);
      throw err;
    }
  }

  async run(): Promise<{ success: boolean; meta: { last_row_id: number; changes: number } }> {
    try {
      const { data, error } = await this.db.supabase.rpc('exec_sql', {
        q: this.sql,
        p: JSON.stringify(this.params),
      });

      if (error) {
        console.error('Supabase SQL error:', error, '\nSQL:', this.sql, '\nParams:', this.params);
        throw new Error(`SQL Error: ${error.message}`);
      }

      // For INSERT/UPDATE/DELETE, the function returns metadata
      const result = data?.[0] || {};
      return {
        success: true,
        meta: {
          last_row_id: result.last_row_id ?? 0,
          changes: result.changes ?? 1,
        },
      };
    } catch (err) {
      console.error('Run failed:', this.sql, err);
      throw err;
    }
  }
}

export class SupabaseDB {
  public supabase: SupabaseClient;

  constructor(config: SupabaseDBConfig) {
    this.supabase = createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  prepare(sql: string): D1PreparedStatement {
    return new D1PreparedStatement(this, sql);
  }
}

// SQL to create the exec_sql function in Supabase (run this in SQL Editor):
export const EXEC_SQL_FUNCTION = `
-- Execute parameterized SQL queries from the application
-- This function is SECURITY DEFINER so it runs with the privileges of the owner
CREATE OR REPLACE FUNCTION exec_sql(query TEXT, params TEXT DEFAULT '[]')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  param_array TEXT[];
  i INT;
  final_query TEXT;
BEGIN
  -- Parse params from JSON array
  param_array := ARRAY(SELECT jsonb_array_elements_text(params::jsonb));

  -- Replace ? placeholders with $1, $2, etc.
  final_query := query;
  FOR i IN 1..array_length(param_array, 1) LOOP
    final_query := regexp_replace(final_query, '\\?', '$' || i::TEXT, 'n');
  END LOOP;

  -- For SELECT queries, return rows as JSON array
  IF upper(trim(query)) LIKE 'SELECT%' OR upper(trim(query)) LIKE 'WITH%' THEN
    EXECUTE 'SELECT COALESCE(json_agg(t), ''[]''::json)::text FROM (' || final_query || ') t'
    INTO result
    USING param_array;
    RETURN COALESCE(result::jsonb, '[]'::jsonb);
  END IF;

  -- For INSERT queries, return the inserted row
  IF upper(trim(query)) LIKE 'INSERT%' THEN
    DECLARE
      inserted JSONB;
    BEGIN
      IF final_query LIKE '%RETURNING%' THEN
        EXECUTE 'SELECT COALESCE(json_agg(t), ''[]''::json)::text FROM (' || final_query || ') t'
        INTO inserted
        USING param_array;
        RETURN COALESCE(inserted::jsonb, '[]'::jsonb);
      ELSE
        EXECUTE final_query
        USING param_array;
        -- Get last inserted id
        RETURN jsonb_build_array(jsonb_build_object(
          'last_row_id', currval(pg_get_serial_sequence(
            (SELECT regexp_replace(query, '.*INSERT INTO\\s+(\\S+).*', '\\1', 'i')),
            'id'
          )),
          'changes', 1
        ));
      END IF;
    EXCEPTION WHEN OTHERS THEN
      EXECUTE final_query USING param_array;
      RETURN jsonb_build_array(jsonb_build_object('last_row_id', 0, 'changes', 1));
    END;
  END IF;

  -- For UPDATE/DELETE, execute and return changes count
  DECLARE
    affected INT;
  BEGIN
    EXECUTE 'WITH q AS (' || final_query || ') SELECT count(*) FROM q'
    INTO affected
    USING param_array;
    RETURN jsonb_build_array(jsonb_build_object(
      'last_row_id', 0,
      'changes', COALESCE(affected, 0)
    ));
  END;
END;
$$;

-- Grant execute to the service role
GRANT EXECUTE ON FUNCTION exec_sql(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION exec_sql(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(TEXT, TEXT) TO anon;
`;
