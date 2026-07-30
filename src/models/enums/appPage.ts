import { matchPath } from 'react-router-dom';

// Public pages (unauthenticated)
export enum PublicPage {
  LANDING = 'landing',
  ABOUT = 'about',
  FEATURES = 'features',
  PRICING = 'pricing',
  LOGIN = 'login',
  // Magic-link callback — lands here from the email with ?token=...
  SIGNIN = 'signin',
  TERMS = 'terms',
  PRIVACY = 'privacy',
}

// Platform pages (authenticated)
export enum AppPage {
  AGENTS = 'agents',
  AGENT_DETAIL = 'agent_detail',
  AGENT_EDIT = 'agent_edit',
  AGENTS_MONITORING = 'agents_monitoring',
  APPS = 'apps',
  AUTOMATION = 'automation',
  DATA_HEALTH = 'data_health',
  DATA_HUB = 'data_hub',
  DATASOURCE = 'datasource',
  HOME = 'home',
  INTEGRATIONS = 'integrations',
  METRICS = 'metrics',
  ONTOLOGY = 'ontology',
  PROFILE = 'profile',
  PROJECTS = 'projects',
  PROJECT_DETAIL = 'project_detail',
  SESSION = 'session',
  WORKFLOWS = 'workflows',
  WORKFLOW_DETAIL = 'workflow_detail',
  WORKSPACE_DETAIL = 'workspace_detail',
  WORKSPACE_CANVAS = 'workspace_canvas',
}

export const AppPageTitle: Record<string, string> = {
  [AppPage.AGENTS]: 'Agents',
  [AppPage.AGENT_DETAIL]: 'Agent',
  [AppPage.AGENT_EDIT]: 'Agent',
  [AppPage.AGENTS_MONITORING]: 'Agent Monitoring',
  [AppPage.APPS]: 'Apps',
  [AppPage.AUTOMATION]: 'Automations',
  [AppPage.DATA_HEALTH]: 'Data Health',
  [AppPage.DATA_HUB]: 'Data',
  [AppPage.HOME]: 'Huckleberry',
  [AppPage.INTEGRATIONS]: 'Connectors',
  [AppPage.METRICS]: 'Metric Catalog',
  [AppPage.ONTOLOGY]: 'Ontology',
  [AppPage.PROFILE]: 'Profile',
  [AppPage.PROJECTS]: 'Projects',
  [AppPage.PROJECT_DETAIL]: 'Project Detail',
  [AppPage.SESSION]: 'Session',
  [AppPage.WORKFLOWS]: 'Workflows',
  [AppPage.WORKFLOW_DETAIL]: 'Workflow',
  [AppPage.WORKSPACE_DETAIL]: 'Space',
  [AppPage.WORKSPACE_CANVAS]: 'Canvas',
};

export const AppPageSubtitle: Record<string, string> = {
  [AppPage.AGENTS]:
    'Discover and create custom agents that combine instructions, extra knowledge, and any combination of tasks.',
  [AppPage.WORKFLOWS]:
    'Repeatable processes with defined inputs and steps when you need consistent output or actions.',
  [AppPage.APPS]:
    'Launch the apps you use every day, or explore the marketplace to add new ones to your workspace.',
  [AppPage.DATA_HUB]: 'Browse the data sources powering your workspace.',
  [AppPage.INTEGRATIONS]: 'Manage your connected data sources.',
  [AppPage.PROFILE]:
    'Manage your account, connect services, and personalize how Huckleberry works for you.',
};

// Public route paths
export const publicRoutePaths: Record<PublicPage, string> = {
  [PublicPage.LANDING]: '/',
  [PublicPage.ABOUT]: '/about',
  [PublicPage.FEATURES]: '/features',
  [PublicPage.PRICING]: '/pricing',
  [PublicPage.LOGIN]: '/login',
  [PublicPage.SIGNIN]: '/auth/signin',
  [PublicPage.TERMS]: '/terms',
  [PublicPage.PRIVACY]: '/privacy',
};

// Platform route paths
export const platformRoutePaths: Record<AppPage, string> = {
  [AppPage.APPS]: '/apps',
  [AppPage.AGENTS]: '/agents',
  [AppPage.AGENT_DETAIL]: '/agents/:agentId',
  [AppPage.AGENT_EDIT]: '/agents/:agentId/edit',
  [AppPage.AGENTS_MONITORING]: '/agents/monitoring',
  [AppPage.AUTOMATION]: '/automation',
  [AppPage.DATA_HEALTH]: '/data-health',
  [AppPage.DATA_HUB]: '/data-hub',
  [AppPage.DATASOURCE]: '/data-hub/:id',
  [AppPage.HOME]: '/workspace',
  [AppPage.INTEGRATIONS]: '/integrations',
  [AppPage.METRICS]: '/metrics',
  [AppPage.ONTOLOGY]: '/ontology',
  [AppPage.PROFILE]: '/profile',
  [AppPage.PROJECTS]: '/projects',
  [AppPage.PROJECT_DETAIL]: '/projects/:id',
  [AppPage.SESSION]: '/sessions/:sessionId?',
  [AppPage.WORKFLOWS]: '/workflows',
  [AppPage.WORKFLOW_DETAIL]: '/workflows/:workflowId',
  [AppPage.WORKSPACE_DETAIL]: '/workspace/:workspaceId',
  [AppPage.WORKSPACE_CANVAS]: '/workspace/:workspaceId/:canvasId',
};

export interface NavSubPageEntry {
  page: AppPage;
  label: string;
}

export const navSubPages: Partial<Record<AppPage, NavSubPageEntry[]>> = {
  [AppPage.AGENTS]: [
    { page: AppPage.AGENTS, label: 'All agents' },
    { page: AppPage.AGENTS_MONITORING, label: 'Agent monitoring' },
  ],
};

// Helper to get AppPage from platform path
// Static (param-free) paths are checked first so e.g. /agents/monitoring
// doesn't match /agents/:agentId before its own entry is tested.
export const getAppPageFromPath = (path: string): AppPage => {
  const entries = Object.entries(platformRoutePaths).sort(([, a], [, b]) => {
    const isDynamicA = a.includes(':');
    const isDynamicB = b.includes(':');
    if (isDynamicA === isDynamicB) return 0;
    return isDynamicA ? 1 : -1;
  });
  const entry = entries.find(
    ([, routePath]) => matchPath(routePath, path) !== null,
  );
  return entry ? (entry[0] as AppPage) : AppPage.HOME;
};
