import { RouteObject } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectFullScreen } from 'reducers/chat/slice';
import { AppPage } from 'models/enums/appPage';
import { Agents } from 'components/Agents/Agents';
import { Applications } from 'components/Applications/Applications';
import { Automation } from 'components/Automation/Automation';
import { Background } from 'components/layout/Background/Background';
import { DataHealth } from 'components/DataHealth/DataHealth';
import { DataHub } from 'components/DataHub/DataHub';
import { Integrations } from 'components/Integrations/Integrations';
import { MetricCatalog } from 'components/MetricCatalog/MetricCatalog';
import { Ontology } from 'components/Ontology/Ontology';
import { FlowCanvas } from 'components/Workflows/FlowCanvas';
import { Workspace } from 'components/Workspace/Workspace';
import styles from 'components/App/App.module.scss';

// Home page component wrapper
const HomePage = () => {
  const fullScreen = useSelector(selectFullScreen);

  return (
    <div className={`${styles.home} ${fullScreen ? styles.fullScreen : ''}`}>
      <Workspace />
      <Background />
    </div>
  );
};

// Route path mapping from AppPage enum
export const routePaths: Record<AppPage, string> = {
  [AppPage.HOME]: '/',
  [AppPage.APPS]: '/apps',
  [AppPage.AGENTS]: '/agents',
  [AppPage.AUTOMATION]: '/automation',
  [AppPage.DATA_HEALTH]: '/data-health',
  [AppPage.DATA_HUB]: '/data-hub',
  [AppPage.INTEGRATIONS]: '/integrations',
  [AppPage.METRICS]: '/metrics',
  [AppPage.ONTOLOGY]: '/ontology',
  [AppPage.WORKFLOW]: '/workflow',
};

// Helper to get AppPage from path
export const getAppPageFromPath = (path: string): AppPage => {
  const entry = Object.entries(routePaths).find(
    ([_, routePath]) => routePath === path,
  );
  return entry ? (entry[0] as AppPage) : AppPage.HOME;
};

export const routes: RouteObject[] = [
  {
    path: routePaths[AppPage.HOME],
    element: <HomePage />,
  },
  {
    path: routePaths[AppPage.AGENTS],
    element: <Agents />,
  },
  {
    path: routePaths[AppPage.APPS],
    element: <Applications />,
  },
  {
    path: routePaths[AppPage.AUTOMATION],
    element: <Automation />,
  },
  {
    path: routePaths[AppPage.DATA_HEALTH],
    element: <DataHealth />,
  },
  {
    path: routePaths[AppPage.DATA_HUB],
    element: <DataHub />,
  },
  {
    path: routePaths[AppPage.INTEGRATIONS],
    element: <Integrations />,
  },
  {
    path: routePaths[AppPage.METRICS],
    element: <MetricCatalog />,
  },
  {
    path: routePaths[AppPage.ONTOLOGY],
    element: <Ontology />,
  },
  {
    path: routePaths[AppPage.WORKFLOW],
    element: <FlowCanvas />,
  },
];
