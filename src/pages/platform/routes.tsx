import { RouteObject } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectFullScreen } from 'reducers/chat/slice';
import { AuthGuard } from './layouts/AuthGuard/AuthGuard';
import { PlatformLayout } from './layouts/PlatformLayout/PlatformLayout';
import { Agents } from './Agents/Agents';
import { Applications } from './Applications/Applications';
import { Automation } from './Automation/Automation';
import { Background } from './layouts/PlatformLayout/Background/Background';
import { DataHealth } from './DataHealth/DataHealth';
import { DataHub } from './DataHub/DataHub';
import { Integrations } from './Integrations/Integrations';
import { MetricCatalog } from './MetricCatalog/MetricCatalog';
import { Ontology } from './Ontology/Ontology';
import { FlowCanvas } from './Workflows/FlowCanvas';
import { Workspace } from './Workspace/Workspace';
import { platformRoutePaths, AppPage } from 'models/enums/appPage';
import styles from './layouts/PlatformLayout/PlatformLayout.module.css';

// Home page component wrapper
const HomePage = () => {
  const fullScreen = useSelector(selectFullScreen);

  return (
    <div className={`${styles.home} ${fullScreen ? styles.fullScreen : ''}`}>
      <Workspace />
      {/* <Background /> */}
    </div>
  );
};

export const platformRoutes: RouteObject[] = [
  {
    element: <AuthGuard />,
    children: [
      {
        element: <PlatformLayout />,
        children: [
          {
            path: platformRoutePaths[AppPage.HOME],
            element: <HomePage />,
          },
          {
            path: platformRoutePaths[AppPage.AGENTS],
            element: <Agents />,
          },
          {
            path: platformRoutePaths[AppPage.APPS],
            element: <Applications />,
          },
          {
            path: platformRoutePaths[AppPage.AUTOMATION],
            element: <Automation />,
          },
          {
            path: platformRoutePaths[AppPage.DATA_HEALTH],
            element: <DataHealth />,
          },
          {
            path: platformRoutePaths[AppPage.DATA_HUB],
            element: <DataHub />,
          },
          {
            path: platformRoutePaths[AppPage.INTEGRATIONS],
            element: <Integrations />,
          },
          {
            path: platformRoutePaths[AppPage.METRICS],
            element: <MetricCatalog />,
          },
          {
            path: platformRoutePaths[AppPage.ONTOLOGY],
            element: <Ontology />,
          },
          {
            path: platformRoutePaths[AppPage.WORKFLOW],
            element: <FlowCanvas />,
          },
        ],
      },
    ],
  },
];
