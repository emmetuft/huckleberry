const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function readCsrfCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Drop-in fetch wrapper that:
 *  - Injects x-domo-developer-token when DOMO_DEV_TOKEN is set (dev only)
 *  - Injects x-csrf-token on state-changing requests (double-submit CSRF pattern)
 */
export function apiFetch(
  url: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const method = url instanceof Request ? url.method : (init?.method ?? 'GET');

  const headers = new Headers(init?.headers);

  const devToken = import.meta.env.DOMO_DEV_TOKEN;
  if (devToken) headers.set('x-domo-developer-token', devToken);

  if (STATE_CHANGING.has(method.toUpperCase())) {
    const csrf = readCsrfCookie();
    if (csrf) headers.set('x-csrf-token', csrf);
  }

  return fetch(url, { credentials: 'same-origin', ...init, headers });
}
