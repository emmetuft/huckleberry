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
  AGENT_CHAT = 'agent_chat',
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
}

export const AppPageTitle: Record<string, string> = {
  [AppPage.AGENTS]: 'Agents',
  [AppPage.AGENT_DETAIL]: 'Agent',
  [AppPage.AGENT_EDIT]: 'Agent',
  [AppPage.AGENT_CHAT]: 'Agent Chat',
  [AppPage.APPS]: 'Apps',
  [AppPage.AUTOMATION]: 'Automations',
  [AppPage.DATA_HEALTH]: 'Data Health',
  [AppPage.DATA_HUB]: 'Data',
  [AppPage.HOME]: 'Huckleberry',
  [AppPage.INTEGRATIONS]: 'Connectors',
  [AppPage.METRICS]: 'Metric Catalog',
  [AppPage.ONTOLOGY]: 'Business Ontology',
  [AppPage.PROFILE]: 'Profile',
  [AppPage.PROJECTS]: 'Projects',
  [AppPage.PROJECT_DETAIL]: 'Project Detail',
  [AppPage.SESSION]: 'Session',
  [AppPage.WORKFLOWS]: 'Workflows',
  [AppPage.WORKFLOW_DETAIL]: 'Workflow',
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
  [AppPage.AGENT_CHAT]: '/agents/:agentId/chat',
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
  [AppPage.SESSION]: '/sessions/:sessionId',
  [AppPage.WORKFLOWS]: '/workflows',
  [AppPage.WORKFLOW_DETAIL]: '/workflows/:workflowId',
};

// Helper to get AppPage from platform path
export const getAppPageFromPath = (path: string): AppPage => {
  const entry = Object.entries(platformRoutePaths).find(
    ([_, routePath]) => matchPath(routePath, path) !== null,
  );
  return entry ? (entry[0] as AppPage) : AppPage.HOME;
};
