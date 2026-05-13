import { RouteObject } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout/PublicLayout';
import { Landing } from './Landing/Landing';
import { About } from './About/About';
import { Features } from './Features/Features';
import { Pricing } from './Pricing/Pricing';
import { Login } from './auth/Login/Login';
import { Signin } from './auth/Signin';
import { Terms } from './legal/Terms/Terms';
import { Privacy } from './legal/Privacy/Privacy';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: publicRoutePaths[PublicPage.LANDING],
        element: <Landing />,
      },
      {
        path: publicRoutePaths[PublicPage.ABOUT],
        element: <About />,
      },
      {
        path: publicRoutePaths[PublicPage.FEATURES],
        element: <Features />,
      },
      {
        path: publicRoutePaths[PublicPage.PRICING],
        element: <Pricing />,
      },
      {
        path: publicRoutePaths[PublicPage.LOGIN],
        element: <Login />,
      },
      {
        path: publicRoutePaths[PublicPage.SIGNIN],
        element: <Signin />,
      },
      {
        path: publicRoutePaths[PublicPage.TERMS],
        element: <Terms />,
      },
      {
        path: publicRoutePaths[PublicPage.PRIVACY],
        element: <Privacy />,
      },
    ],
  },
];
