/**
 * Auth client — talks to the huckleberry BFF's Layer A endpoints.
 *
 * All requests go through the same origin (`/api/...`) thanks to the Vite
 * dev proxy in vite.config.ts and the production reverse proxy in front of
 * the BFF. That keeps the `hb_session` cookie same-origin throughout.
 *
 * CSRF: state-changing requests must echo the `csrf_token` cookie value as
 * an `x-csrf-token` header (double-submit pattern). The cookie is NOT
 * HttpOnly so we can read it from JS here; the session cookie is HttpOnly.
 */

export interface MeResponse {
  id: string;
  email: string;
  status: 'pending_link' | 'active' | 'suspended';
  displayName: string | null;
}

export interface ConsumeResponse {
  userId: string;
  needsLinkage: boolean;
}

const BASE = '/api/auth';

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function parseJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as {
    data?: T;
    success?: boolean;
    error?: string;
  };
  if (!res.ok || body.success === false) {
    const message = body.error || `HTTP ${res.status}`;
    throw new Error(message);
  }
  if (body.data === undefined) {
    throw new Error('malformed response (no data envelope)');
  }
  return body.data;
}

function withCsrf(init: RequestInit = {}): RequestInit {
  const csrf = readCookie('csrf_token');
  const headers = new Headers(init.headers ?? {});
  if (csrf) headers.set('x-csrf-token', csrf);
  headers.set('content-type', 'application/json');
  return { ...init, headers, credentials: 'same-origin' };
}

/**
 * Send a magic-link email. Always succeeds with 202 — even for unknown
 * emails — so we can't be used as an account-existence oracle.
 */
async function requestMagicLink(email: string): Promise<void> {
  const res = await fetch(
    `${BASE}/signin/request`,
    withCsrf({
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  );
  if (!res.ok && res.status !== 202) {
    throw new Error(`signin request failed: HTTP ${res.status}`);
  }
}

/**
 * Consume a magic-link token. Server sets `hb_session` + `csrf_token`
 * cookies on success. Throws if the token is invalid, expired, or
 * already used.
 */
async function consumeMagicLink(token: string): Promise<ConsumeResponse> {
  const res = await fetch(`${BASE}/signin?token=${encodeURIComponent(token)}`, {
    credentials: 'same-origin',
  });
  return parseJson<ConsumeResponse>(res);
}

/** Returns the signed-in user — null if no valid session. */
async function me(): Promise<MeResponse | null> {
  const res = await fetch(`${BASE}/me`, { credentials: 'same-origin' });
  if (res.status === 401) return null;
  return parseJson<MeResponse>(res);
}

async function logout(): Promise<void> {
  await fetch(`${BASE}/logout`, withCsrf({ method: 'POST' }));
}

export const AuthService = {
  requestMagicLink,
  consumeMagicLink,
  me,
  logout,
};
