import { useSelector } from 'react-redux';
import { RouteObject } from 'react-router-dom';
import styles from 'components/layouts/PlatformLayout/PlatformLayout.module.css';
import { selectPersona } from 'reducers/app/slice';
import { selectDismissedCards } from 'reducers/workspace/slice';
import { platformRoutePaths, AppPage } from 'models/enums/appPage';
import { AuthGuard } from 'components/layouts/AuthGuard/AuthGuard';
import { PlatformLayout } from 'components/layouts/PlatformLayout/PlatformLayout';
import { Agents } from './Agents/Agents';
import { AgentDetail } from './Agents/AgentDetail/AgentDetail';
import { AgentEdit } from './Agents/AgentEdit/AgentEdit';
import { AgentChat } from './Agents/AgentChat/AgentChat';
import { AgentsMonitoring } from './Agents/AgentsMonitoring/AgentsMonitoring';
import { Applications } from './Applications/Applications';
import { Automation } from './Automation/Automation';
import { DataHealth } from './DataHealth/DataHealth';
import { DataHub } from './DataHub/DataHub';
import { DataSourceDetail } from './DataHub/DataSourceDetail/DataSourceDetail';
import { Integrations } from './Integrations/Integrations';
import { MetricCatalog } from './MetricCatalog/MetricCatalog';
import { Ontology } from './Ontology/Ontology';
import { ProfilePage } from './Profile/ProfilePage';
import { Projects } from './Projects/Projects';
import { ProjectDetail } from './Projects/ProjectDetail/ProjectDetail';
import { Session } from './Session/Session';
import { Workflows } from './Workflows/Workflows';
import { WorkflowDetail } from './Workflows/WorkflowDetail/WorkflowDetail';
import { Workspace } from './Workspace/Workspace';
import { WorkspaceDetail } from './Workspace/WorkspaceDetail/WorkspaceDetail';
import { WorkspaceCanvas } from './Workspace/WorkspaceCanvas/WorkspaceCanvas';
import { getBentoLayout } from 'config/bentoConfig';

// Home page component wrapper
const HomePage = () => {
  const persona = useSelector(selectPersona);
  const dismissedCards = useSelector(selectDismissedCards);

  const bentoLayout = getBentoLayout(persona?.department);
  const isBentoMode =
    !!bentoLayout &&
    bentoLayout.cards.some((c) => !dismissedCards.includes(c.id));

  return (
    <div className={isBentoMode ? '' : styles.home}>
      <Workspace />
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
            path: platformRoutePaths[AppPage.AGENT_DETAIL],
            element: <AgentDetail />,
          },
          {
            path: platformRoutePaths[AppPage.AGENT_EDIT],
            element: <AgentEdit />,
          },
          {
            path: platformRoutePaths[AppPage.AGENT_CHAT],
            element: <AgentChat />,
          },
          {
            path: platformRoutePaths[AppPage.AGENTS_MONITORING],
            element: <AgentsMonitoring />,
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
            path: platformRoutePaths[AppPage.DATASOURCE],
            element: <DataSourceDetail />,
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
            path: platformRoutePaths[AppPage.PROFILE],
            element: <ProfilePage />,
          },
          {
            path: platformRoutePaths[AppPage.PROJECTS],
            element: <Projects />,
          },
          {
            path: platformRoutePaths[AppPage.PROJECT_DETAIL],
            element: <ProjectDetail />,
          },
          {
            path: platformRoutePaths[AppPage.SESSION],
            element: <Session />,
          },
          {
            path: platformRoutePaths[AppPage.WORKFLOWS],
            element: <Workflows />,
          },
          {
            path: platformRoutePaths[AppPage.WORKFLOW_DETAIL],
            element: <WorkflowDetail />,
          },
          {
            path: platformRoutePaths[AppPage.WORKSPACE_DETAIL],
            element: <WorkspaceDetail />,
          },
          {
            path: platformRoutePaths[AppPage.WORKSPACE_CANVAS],
            element: <WorkspaceCanvas />,
          },
        ],
      },
    ],
  },
];
