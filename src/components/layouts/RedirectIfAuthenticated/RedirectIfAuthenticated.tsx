import { FC, useEffect, useRef, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthService } from 'services/auth';
import { AppPage, platformRoutePaths } from 'models/enums/appPage';
import Loader from 'components/shared/Loader/Loader';

/**
 * Wraps a route element. On mount, checks whether the visitor already has
 * a valid huckleberry session. If they do, bounces them to /workspace
 * (so signed-in users hitting / or /login don't have to re-enter anything);
 * otherwise renders the wrapped public page.
 *
 * Deliberately not applied to the magic-link callback (`/auth/signin`) —
 * that route's job is to *create* the session, and short-circuiting it
 * would strand users on a working token they couldn't consume.
 */
export const RedirectIfAuthenticated: FC = () => {
  const init = useRef(false);
  const [state, setState] = useState<
    'checking' | 'authenticated' | 'unauthenticated'
  >('checking');

  useEffect(() => {
    if (init.current) return;
    init.current = true;
    (async () => {
      const me = await AuthService.me();
      setState(me ? 'authenticated' : 'unauthenticated');
    })();
  }, []);

  if (state === 'checking') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <Loader />
      </div>
    );
  }
  if (state === 'authenticated') {
    return <Navigate to={platformRoutePaths[AppPage.HOME]} replace />;
  }
  return <Outlet />;
};
