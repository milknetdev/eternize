/**
 * Authenticated fetch helper — always sends cookies.
 * Drop-in replacement for fetch() in the app.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!isFormData) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  return fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });
}
