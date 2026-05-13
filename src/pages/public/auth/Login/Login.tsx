import { FC, FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthService } from 'services/auth';
import styles from './Login.module.css';

/**
 * Magic-link sign-in / sign-up form. No password.
 *
 *  - Sign in: server sends a magic-link only if the email already has an
 *    account. Always returns 202 (existence-oracle protection).
 *  - Sign up: server provisions a Domo instance + user, creates the
 *    huckleberry account in `pending_link`, then sends the magic-link.
 *    First sign-in kicks the user into the PKCE auth-code flow to mint
 *    a Domo refresh token.
 *
 * Magic-link callback lands on `/auth/signin?token=...` (see Signin
 * component) which exchanges the token for a session cookie.
 */
type Mode = 'signin' | 'signup';

export const Login: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlMode: Mode =
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<Mode>(urlMode);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep `mode` in sync when the user clicks a header button that just
  // changes the URL without remounting (e.g., already on /login and clicks
  // "Try for free" → ?mode=signup).
  useEffect(() => {
    setMode(urlMode);
    setError(null);
    setSent(false);
  }, [urlMode]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await AuthService.signup(email.trim());
      } else {
        await AuthService.requestMagicLink(email.trim());
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.login}>
        <div className={styles.card}>
          <h1>Check your email</h1>
          <p>
            {mode === 'signup' ? (
              <>
                We're setting up your huckleberry workspace and just sent{' '}
                <strong>{email}</strong> a link to finish setup. It expires in
                15 minutes.
              </>
            ) : (
              <>
                If <strong>{email}</strong> has a huckleberry account, we just
                sent a one-time sign-in link. It expires in 15 minutes.
              </>
            )}
          </p>
          <p className={styles.link}>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
            >
              Use a different email
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.login}>
      <div className={styles.card}>
        <h1>{mode === 'signup' ? 'Get started' : 'Welcome back'}</h1>
        <p>
          {mode === 'signup'
            ? "Enter your work email and we'll spin up your workspace and email you a link to finish setup."
            : 'Enter your email and we’ll send you a one-time sign-in link — no password needed.'}
        </p>
        <form className={styles.form} onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            disabled={submitting}
          />
          <button type="submit" disabled={submitting || !email}>
            {submitting
              ? 'Sending…'
              : mode === 'signup'
                ? 'Create my account'
                : 'Email me a sign-in link'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.link}>
          {mode === 'signup'
            ? 'Already have an account? '
            : 'New to huckleberry? '}
          <button
            type="button"
            onClick={() => {
              const next: Mode = mode === 'signup' ? 'signin' : 'signup';
              if (next === 'signup') setSearchParams({ mode: 'signup' });
              else setSearchParams({});
            }}
          >
            {mode === 'signup' ? 'Sign in instead' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  );
};
