import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase database helper for Cloudflare Workers
// Provides a clean API that replaces D1's prepare().bind() pattern

let _client: SupabaseClient | null = null;

export function getSupabaseClient(url: string, serviceRoleKey: string): SupabaseClient {
  if (!_client) {
    _client = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _client;
}

// ===== QUERY HELPERS =====

export async function dbSelect<T = any>(
  supabase: SupabaseClient,
  table: string,
  filters: Record<string, any> = {},
  options: { orderBy?: string; ascending?: boolean; limit?: number; columns?: string } = {}
): Promise<T[]> {
  let query = supabase.from(table).select(options.columns || '*');

  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'object' && value._op) {
      // Custom operator: { _op: 'in', value: [1,2,3] }
      query = query.filter(key, value._op, value.value);
    } else {
      query = query.eq(key, value);
    }
  }

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? true });
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(`dbSelect(${table}): ${error.message}`);
  return (data as T[]) || [];
}

export async function dbSelectOne<T = any>(
  supabase: SupabaseClient,
  table: string,
  filters: Record<string, any> = {},
  columns?: string
): Promise<T | null> {
  const results = await dbSelect<T>(supabase, table, filters, { columns, limit: 1 });
  return results[0] || null;
}

export async function dbInsert<T = any>(
  supabase: SupabaseClient,
  table: string,
  data: Record<string, any> | Record<string, any>[]
): Promise<{ id: any; data: T }> {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`dbInsert(${table}): ${error.message}`);
  return { id: (result as any)?.id, data: result as T };
}

export async function dbUpdate(
  supabase: SupabaseClient,
  table: string,
  filters: Record<string, any>,
  data: Record<string, any>
): Promise<void> {
  let query = supabase.from(table).update(data);
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }
  const { error } = await query;
  if (error) throw new Error(`dbUpdate(${table}): ${error.message}`);
}

export async function dbDelete(
  supabase: SupabaseClient,
  table: string,
  filters: Record<string, any>
): Promise<void> {
  let query = supabase.from(table).delete();
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }
  const { error } = await query;
  if (error) throw new Error(`dbDelete(${table}): ${error.message}`);
}

// Execute raw SQL via Supabase RPC (requires exec_sql function in Supabase)
export async function dbRaw<T = any>(
  supabase: SupabaseClient,
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: sql,
    params: JSON.stringify(params),
  });
  if (error) throw new Error(`dbRaw: ${error.message}`);
  return (data as T[]) || [];
}

// ===== TYPE-SAFE TABLE HELPERS =====

export function from(supabase: SupabaseClient, table: string) {
  return supabase.from(table);
}
