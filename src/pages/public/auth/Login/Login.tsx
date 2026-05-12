import { FC, FormEvent, useState } from 'react';
import { AuthService } from 'services/auth';
import styles from './Login.module.scss';

/**
 * Magic-link sign-in form. No password — user enters their email and we
 * send a one-time signed link. The link lands on `/auth/signin?token=...`
 * (see Signin component) which exchanges the token for a session cookie.
 *
 * There is no public Sign up: huckleberry accounts are seeded by vetted
 * operator onboarding (see huckleberry-server `POST /api/admin/users`).
 */
export const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await AuthService.requestMagicLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.Login}>
        <div className={styles.card}>
          <h1>Check your email</h1>
          <p>
            If <strong>{email}</strong> is registered with huckleberry, we just
            sent you a one-time sign-in link. It expires in 15 minutes.
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
    <div className={styles.Login}>
      <div className={styles.card}>
        <h1>Sign in</h1>
        <p>Enter your email and we'll send you a sign-in link.</p>
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
            {submitting ? 'Sending…' : 'Send me a sign-in link'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.link}>
          New here? Huckleberry is invite-only — contact your administrator for
          access.
        </p>
      </div>
    </div>
  );
};
