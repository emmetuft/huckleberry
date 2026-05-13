import { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch } from 'reducers';
import { authenticate } from 'reducers/app/actions';
import { selectLoading } from 'reducers/app/slice';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';
import Loader from 'components/shared/Loader/Loader';
import { AuthService } from 'services/auth';

/**
 * Gate for platform routes. Resolves to one of four states:
 *
 *   loading     — checking the session
 *   signed-out  → Navigate to /login?next=<path>
 *   linking     → window.location.href = Gatekeeper authorize URL
 *   signed-in   → render <Outlet />
 *   link-error  → show error + "Sign out and start over" button
 *
 * The `link-error` state matters because a misconfigured Gatekeeper client
 * would otherwise hang the user on a loading spinner with no escape.
 */
export const AuthGuard: FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const init = useRef<boolean>(false);
  const [sessionState, setSessionState] = useState<
    'loading' | 'signed-in' | 'signed-out' | 'link-error'
  >('loading');
  const [linkError, setLinkError] = useState<string | null>(null);
  const isAuthenticating = useSelector(selectLoading).identity;

  useEffect(() => {
    if (init.current) return;
    init.current = true;

    (async () => {
      const me = await AuthService.me();
      if (!me) {
        setSessionState('signed-out');
        return;
      }
      // `pending_link` means the user has signed up (huckleberry account
      // created, Domo instance provisioned) but hasn't yet completed the
      // PKCE auth-code flow to mint a Domo refresh token. Kick into the
      // browser-side OAuth dance now.
      if (me.status === 'pending_link') {
        try {
          const { authorizeUrl } = await AuthService.startDomoLink();
          window.location.href = authorizeUrl;
          return;
        } catch (err) {
          setLinkError(
            err instanceof Error ? err.message : 'Failed to start Domo linkage',
          );
          setSessionState('link-error');
          return;
        }
      }
      setSessionState('signed-in');
      // Domo identity is independent — kick it off but don't block on it.
      dispatch(authenticate());
    })();
  }, [dispatch]);

  const onSignOut = async () => {
    await AuthService.logout();
    window.location.href = publicRoutePaths[PublicPage.LOGIN];
  };

  if (sessionState === 'link-error') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h1>Couldn't connect to Domo</h1>
        <p style={{ maxWidth: 480, color: '#666' }}>{linkError}</p>
        <p style={{ maxWidth: 480, color: '#888', fontSize: '0.9rem' }}>
          This usually means the Gatekeeper OAuth client isn't configured on the
          backend (<code>DOMO_OAUTH_CLIENT_ID</code>,{' '}
          <code>GATEKEEPER_ISSUERS</code>). Check the BFF logs.
        </p>
        <button type="button" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    );
  }

  if (sessionState === 'loading' || isAuthenticating) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Loader />
      </div>
    );
  }

  if (sessionState === 'signed-out') {
    const next = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate
        to={`${publicRoutePaths[PublicPage.LOGIN]}?next=${next}`}
        replace
      />
    );
  }

  return <Outlet />;
};
