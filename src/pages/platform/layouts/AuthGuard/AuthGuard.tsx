import { FC, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch } from 'reducers';
import { authenticate } from 'reducers/app/actions';
import { selectIdentity, selectLoading } from 'reducers/app/slice';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';
import Loader from 'components/shared/Loader/Loader';

export const AuthGuard: FC = () => {
  const dispatch = useAppDispatch();
  const identity = useSelector(selectIdentity);
  const init = useRef<boolean>(false);
  const isAuthenticating = useSelector(selectLoading).identity;

  useEffect(() => {
    if (init.current) return;
    init.current = true;
    dispatch(authenticate());
  }, [dispatch]);

  if (isAuthenticating) {
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

  // Redirect to login if not authenticated
  // if (!identity) {
  //   return <Navigate to={publicRoutePaths[PublicPage.LOGIN]} replace />;
  // }

  // Render child routes if authenticated
  return <Outlet />;
};
