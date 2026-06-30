import { FC, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthService } from 'services/auth';
import styles from './Login.module.css';
import { Button, Input } from 'antd';
import { PublicPage, publicRoutePaths } from 'models/enums/appPage';
import { Preview } from './Preview';

type Mode = 'signin' | 'signup';
type SignupPath = 'new' | 'existing';

export const Login: FC = () => {
  const [searchParams] = useSearchParams();
  const urlMode: Mode =
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<Mode>(urlMode);
  const [email, setEmail] = useState('');
  const [path, setPath] = useState<SignupPath>('new');
  const [instanceUrl, setInstanceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        await AuthService.signup({
          email: email.trim(),
          path,
          ...(path === 'existing'
            ? { instanceUrl: `https://${instanceUrl.trim()}.domo.com` }
            : {}),
        });
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

  const isValidSubdomain = (s: string): boolean => {
    const trimmed = s.trim();
    if (!trimmed.length) return false;
    return trimmed
      .split('.')
      .every((label) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(label));
  };

  const instanceUrlError =
    path === 'existing' &&
    instanceUrl.trim().length > 0 &&
    !isValidSubdomain(instanceUrl)
      ? 'Letters, numbers, hyphens, and dots only'
      : null;

  const canSubmit =
    email.trim().length > 0 &&
    (mode !== 'signup' ||
      path === 'new' ||
      (path === 'existing' && isValidSubdomain(instanceUrl)));

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
        {mode === 'signup' && (
          <>
            <div className={styles.pathChoice}>
              <button
                className={`${styles.pathCard} ${path === 'new' ? styles.selected : ''}`}
                onClick={() => setPath('new')}
              >
                <span className={styles.pathCardLabel}>
                  Set up a new workspace
                </span>
                <span className={styles.pathCardDesc}>
                  We'll provision a fresh Domo instance for you
                </span>
              </button>
              <button
                className={`${styles.pathCard} ${path === 'existing' ? styles.selected : ''}`}
                onClick={() => setPath('existing')}
              >
                <span className={styles.pathCardLabel}>
                  Connect an existing instance
                </span>
                <span className={styles.pathCardDesc}>
                  Link to a Domo instance you already have
                </span>
              </button>
            </div>
            {path === 'existing' && (
              <>
                <Input
                  variant="filled"
                  size="large"
                  placeholder="your-instance"
                  value={instanceUrl}
                  onChange={(e) => setInstanceUrl(e.target.value)}
                  status={instanceUrlError ? 'error' : undefined}
                  addonBefore="https://"
                  addonAfter=".domo.com"
                />
                {instanceUrlError && (
                  <p className={styles.fieldError}>{instanceUrlError}</p>
                )}
              </>
            )}
          </>
        )}
        <Button
          type="primary"
          shape="round"
          size="large"
          loading={submitting}
          disabled={!canSubmit}
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
                If an account exists, we've sent a secure sign-in link. The link
                expires in 15 minutes.
              </>
            )}
          </p>
        )}
        {error && <p className={styles.errorMessage}>{error}</p>}
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
