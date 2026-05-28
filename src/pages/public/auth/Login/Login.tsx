import { FC, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthService } from 'services/auth';
import styles from './Login.module.css';
import { Button, Input } from 'antd';
import { PublicPage, publicRoutePaths } from 'models/enums/appPage';
import { Preview } from './Preview';

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

  const onSubmit = async () => {
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

  return (
    <div className={styles.login}>
      <div className={styles.left}>
        <div className={styles.attribution}>
          <div className={styles.sphere} />
          From Domo
        </div>
        <h1>Welcome to Huckleberry</h1>
        <p className={styles.subtitle}>
          Your intent engine for AI - built to get more from your data and the
          work you already do.
        </p>
        <Input
          variant="filled"
          size="large"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          type="primary"
          shape="round"
          size="large"
          loading={submitting}
          onClick={onSubmit}
        >
          Continue with email
        </Button>
        {sent && (
          <p className={styles.sentMessage}>
            {mode === 'signup' ? (
              <>
                We're setting up your workspace. Please use the link sent to
                your email to finish setup. It expires in 15 minutes.
              </>
            ) : (
              <>
                If an account exists, we’ve sent a secure sign-in link. The link
                expires in 15 minutes.
              </>
            )}
          </p>
        )}
        <p className={styles.disclaimer}>
          By continuing, you agree to the{' '}
          <Link to={publicRoutePaths[PublicPage.TERMS]}>Terms of Use</Link> and{' '}
          <Link to={publicRoutePaths[PublicPage.PRIVACY]}>Privacy Notice</Link>.
        </p>
      </div>
      <div className={styles.right}>
        <Preview />
      </div>
    </div>
  );
};
