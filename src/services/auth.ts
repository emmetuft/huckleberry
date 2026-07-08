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
  status: 'pending_provision' | 'pending_link' | 'active' | 'suspended';
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
    message?: string;
  };
  if (!res.ok || body.success === false) {
    const message = body.message || body.error || `HTTP ${res.status}`;
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

function tooManyAttemptsError(headers: Headers): Error {
  const raw = headers.get('Retry-After');
  let minutes = 15;
  if (raw) {
    const seconds = Number(raw);
    if (Number.isFinite(seconds)) {
      minutes = Math.ceil(seconds / 60);
    } else {
      const date = Date.parse(raw);
      if (!Number.isNaN(date)) {
        minutes = Math.ceil((date - Date.now()) / 60_000);
      }
    }
  }
  const clamped = Math.max(1, minutes);
  return new Error(
    `Too many attempts. Try again in ${clamped} minute${clamped !== 1 ? 's' : ''}.`,
  );
}

/**
 * Send a sign-in magic-link. Server only sends if a user with this email
 * already exists; otherwise it silently no-ops. Returns 202 either way
 * (existence-oracle protection).
 */
async function requestMagicLink(email: string): Promise<void> {
  const res = await fetch(
    `${BASE}/signin/request`,
    withCsrf({
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  );
  if (res.status === 429) throw tooManyAttemptsError(res.headers);
  if (!res.ok && res.status !== 202) {
    throw new Error(`signin request failed: HTTP ${res.status}`);
  }
}

export interface SignupParams {
  email: string;
  path: 'new' | 'existing';
  instanceUrl?: string;
}

/**
 * Sign up: dual-path — either provisions a new Domo instance or connects
 * to an existing one. Creates the huckleberry account in `pending_link`
 * status and sends a magic-link email. Returns 202 even if the email
 * already exists (idempotent, existence-oracle protection).
 */
async function signup(params: SignupParams): Promise<void> {
  const res = await fetch(
    `${BASE}/signup`,
    withCsrf({
      method: 'POST',
      body: JSON.stringify(params),
    }),
  );
  if (res.status === 429) throw tooManyAttemptsError(res.headers);
  if (!res.ok && res.status !== 202) {
    throw new Error(`signup failed: HTTP ${res.status}`);
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

/**
 * Start the Domo OAuth linkage flow. POSTs to the BFF, which generates
 * PKCE + state and returns the Gatekeeper authorize URL. Caller should
 * `window.location.href = result.authorizeUrl` to send the browser into
 * the OAuth flow. After consent, the BFF's callback redirects back to
 * `/workspace?linked=1`.
 */
async function startDomoLink(): Promise<{ authorizeUrl: string }> {
  const res = await fetch(
    `${BASE}/domo/link/start`,
    withCsrf({ method: 'POST', body: '{}' }),
  );
  return parseJson<{ authorizeUrl: string }>(res);
}

export const AuthService = {
  requestMagicLink,
  signup,
  consumeMagicLink,
  startDomoLink,
  me,
  logout,
};
