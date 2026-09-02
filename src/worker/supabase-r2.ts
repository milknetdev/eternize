import { SupabaseClient } from '@supabase/supabase-js';

/**
 * R2-compatible wrapper around Supabase Storage.
 * Mimics the R2 API: put(), get(), delete()
 * 
 * Requires a Supabase Storage bucket named 'photos' to exist.
 */

interface R2PutOptions {
  httpMetadata?: {
    contentType?: string;
  };
}

interface R2Object {
  key: string;
  body: ReadableStream | null;
  httpMetadata?: { contentType?: string };
}

class R2ObjectBody {
  key: string;
  private _data: ArrayBuffer;
  httpMetadata: { contentType: string };
  httpEtag: string;

  constructor(key: string, data: ArrayBuffer, contentType: string) {
    this.key = key;
    this._data = data;
    this.httpMetadata = { contentType };
    this.httpEtag = '"' + Math.random().toString(36).substring(2) + '"';
  }

  writeHttpMetadata(headers: Headers): void {
    headers.set('Content-Type', this.httpMetadata.contentType);
  }

  get body(): ReadableStream {
    return new Response(this._data).body!;
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return this._data;
  }

  async text(): Promise<string> {
    return new TextDecoder().decode(this._data);
  }
}

export class SupabaseR2 {
  private client: SupabaseClient;
  private bucket: string;

  constructor(client: SupabaseClient, bucket = 'photos') {
    this.client = client;
    this.bucket = bucket;
  }

  async put(key: string, body: ReadableStream | ArrayBuffer | string, options?: R2PutOptions): Promise<void> {
    let data: ArrayBuffer | Blob;
    if (body instanceof ReadableStream) {
      data = await new Response(body).arrayBuffer();
    } else if (typeof body === 'string') {
      data = new TextEncoder().encode(body);
    } else {
      data = body;
    }

    const contentType = options?.httpMetadata?.contentType || 'application/octet-stream';
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(key, data, { contentType, upsert: true });

    if (error) {
      console.error('[SupabaseR2] Upload error:', error);
      throw new Error(`R2 put error: ${error.message}`);
    }
  }

  async get(key: string): Promise<R2ObjectBody | null> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .download(key);

    if (error || !data) {
      return null;
    }

    const arrayBuffer = await data.arrayBuffer();
    return new R2ObjectBody(key, arrayBuffer, data.type || 'application/octet-stream');
  }

  async delete(key: string): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([key]);

    if (error) {
      console.error('[SupabaseR2] Delete error:', error);
    }
  }
}
