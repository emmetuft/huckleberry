import { FC, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from 'services/auth';
import styles from './Signin.module.css';

/**
 * Magic-link callback. Lands at `/auth/signin?token=...` from the email,
 * calls the BFF to exchange the token for a session cookie, then routes
 * the user onward:
 *   - new user with no Domo linkage    → /onboarding/link-domo
 *   - existing active user             → /home
 *   - bad / expired / used-up token    → error state
 */
export const Signin: FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const consumed = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent the React-strict-mode double effect from consuming twice.
    if (consumed.current) return;
    consumed.current = true;

    const token = params.get('token');
    if (!token) {
      setError('Missing token in URL. Open the link from your email.');
      return;
    }

    AuthService.consumeMagicLink(token)
      .then(async ({ needsLinkage }) => {
        if (needsLinkage) {
          // First sign-in for this user — bounce straight into the Domo
          // OAuth linkage flow so they don't have to click anything else.
          // The BFF callback redirects to /workspace?linked=1 on success.
          const { authorizeUrl } = await AuthService.startDomoLink();
          window.location.href = authorizeUrl;
          return;
        }
        const next = params.get('next');
        // Only honor in-app paths — never redirect to off-site URLs even if
        // an attacker controls the magic-link query string.
        const target = next && next.startsWith('/') ? next : '/workspace';
        navigate(target, { replace: true });
      })
      .catch((err: Error) => {
        setError(
          err.message === 'invalid_or_expired_token'
            ? 'This sign-in link is invalid or has expired. Request a new one.'
            : err.message || 'Sign-in failed.',
        );
      });
  }, [params, navigate]);

  return (
    <div className={styles.Signin}>
      <div className={styles.card}>
        {error ? (
          <>
            <h1>Sign-in failed</h1>
            <p>{error}</p>
            <p>
              <a href="/login">Request a new sign-in link</a>
            </p>
          </>
        ) : (
          <>
            <h1>Signing you in…</h1>
            <p>One moment.</p>
          </>
        )}
      </div>
    </div>
  );
};
