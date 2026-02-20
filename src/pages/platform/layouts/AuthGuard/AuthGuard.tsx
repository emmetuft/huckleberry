import { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch } from 'reducers';
import {
  authenticate,
  fetchIdentity,
  selectIdentity,
} from 'reducers/app/slice';
import Loader from 'components/shared/Loader/Loader';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';

export const AuthGuard: FC = () => {
  const dispatch = useAppDispatch();
  const identity = useSelector(selectIdentity);
  const init = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (init.current) return;
    init.current = true;

    const initAuth = async () => {
      try {
        await dispatch(authenticate()).unwrap();
        await dispatch(fetchIdentity()).unwrap();
      } catch (error) {
        console.error('Authentication failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [dispatch]);

  // Show loader while authenticating
  if (isLoading) {
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
  if (!identity) {
    return <Navigate to={publicRoutePaths[PublicPage.LOGIN]} replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};
