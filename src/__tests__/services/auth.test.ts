import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../../services/auth';

describe('AuthService 429 handling', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  function make429(retryAfter: string | null): Response {
    const headers = new Headers();
    if (retryAfter !== null) headers.set('Retry-After', retryAfter);
    return { ok: false, status: 429, headers } as unknown as Response;
  }

  describe('requestMagicLink', () => {
    it('throws with default 15-min message when no Retry-After header', async () => {
      fetchMock.mockResolvedValueOnce(make429(null));
      await expect(AuthService.requestMagicLink('a@b.com')).rejects.toThrow(
        'Too many attempts. Try again in 15 minutes.',
      );
    });

    it('converts numeric seconds to minutes', async () => {
      fetchMock.mockResolvedValueOnce(make429('120'));
      await expect(AuthService.requestMagicLink('a@b.com')).rejects.toThrow(
        'Too many attempts. Try again in 2 minutes.',
      );
    });

    it('rounds partial minutes up', async () => {
      fetchMock.mockResolvedValueOnce(make429('90'));
      await expect(AuthService.requestMagicLink('a@b.com')).rejects.toThrow(
        'Too many attempts. Try again in 2 minutes.',
      );
    });

    it('clamps to 1 minute minimum when seconds round to 0', async () => {
      fetchMock.mockResolvedValueOnce(make429('30'));
      await expect(AuthService.requestMagicLink('a@b.com')).rejects.toThrow(
        'Too many attempts. Try again in 1 minute.',
      );
    });

    it('uses singular "minute" for exactly 1', async () => {
      fetchMock.mockResolvedValueOnce(make429('60'));
      await expect(AuthService.requestMagicLink('a@b.com')).rejects.toThrow(
        'Too many attempts. Try again in 1 minute.',
      );
    });

    it('falls back to 15 minutes for "Infinity"', async () => {
      fetchMock.mockResolvedValueOnce(make429('Infinity'));
      await expect(AuthService.requestMagicLink('a@b.com')).rejects.toThrow(
        'Too many attempts. Try again in 15 minutes.',
      );
    });

    it('clamps to 1 minute for negative values', async () => {
      fetchMock.mockResolvedValueOnce(make429('-60'));
      await expect(AuthService.requestMagicLink('a@b.com')).rejects.toThrow(
        'Too many attempts. Try again in 1 minute.',
      );
    });

    it('parses an HTTP-date Retry-After', async () => {
      // 5 minutes from a fixed base
      const future = new Date(Date.now() + 5 * 60_000).toUTCString();
      fetchMock.mockResolvedValueOnce(make429(future));
      const err = await AuthService.requestMagicLink('a@b.com').catch(
        (e: Error) => e,
      );
      expect(err.message).toMatch(
        /Too many attempts\. Try again in \d+ minutes?\./,
      );
    });
  });

  describe('signup', () => {
    it('throws with parsed minutes on 429', async () => {
      fetchMock.mockResolvedValueOnce(make429('180'));
      await expect(
        AuthService.signup({ email: 'a@b.com', path: 'new' }),
      ).rejects.toThrow('Too many attempts. Try again in 3 minutes.');
    });

    it('throws generic error for other non-ok statuses', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
      } as unknown as Response);
      await expect(
        AuthService.signup({ email: 'a@b.com', path: 'new' }),
      ).rejects.toThrow('signup failed: HTTP 500');
    });
  });
});
