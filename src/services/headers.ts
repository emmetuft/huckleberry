/**
 * Drop-in fetch wrapper that injects x-domo-developer-token when
 * DOMO_DEV_TOKEN is set. The value must match DEV_TOKEN in
 * huckleberry-server's .env. Vite strips it from production builds.
 */
export function apiFetch(
  url: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const token = import.meta.env.DOMO_DEV_TOKEN;
  if (!token) return fetch(url, init);
  const headers = new Headers(init?.headers);
  headers.set('x-domo-developer-token', token);
  return fetch(url, { ...init, headers });
}
