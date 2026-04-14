// Public pages (unauthenticated)
export enum PublicPage {
  LANDING = 'landing',
  ABOUT = 'about',
  FEATURES = 'features',
  PRICING = 'pricing',
  DOCS = 'docs',
  LOGIN = 'login',
  SIGNUP = 'signup',
  RESET_PASSWORD = 'reset_password',
  TERMS = 'terms',
  PRIVACY = 'privacy',
}

// Platform pages (authenticated)
export enum AppPage {
  AGENTS = 'agents',
  APPS = 'apps',
  AUTOMATION = 'automation',
  DATA_HEALTH = 'data_health',
  DATA_HUB = 'data_hub',
  HOME = 'home',
  INTEGRATIONS = 'integrations',
  METRICS = 'metrics',
  ONTOLOGY = 'ontology',
  PROFILE = 'profile',
}

export const AppPageLabel: Record<string, string> = {
  [AppPage.AGENTS]: 'Agents',
  [AppPage.APPS]: 'Applications',
  [AppPage.AUTOMATION]: 'Automation Rules',
  [AppPage.DATA_HEALTH]: 'Data Health',
  [AppPage.DATA_HUB]: 'Data Hub',
  [AppPage.HOME]: 'Home',
  [AppPage.INTEGRATIONS]: 'Integrations',
  [AppPage.METRICS]: 'Metric Catalog',
  [AppPage.ONTOLOGY]: 'Business Ontology',
  [AppPage.PROFILE]: 'Profile',
};

// Public route paths
export const publicRoutePaths: Record<PublicPage, string> = {
  [PublicPage.LANDING]: '/',
  [PublicPage.ABOUT]: '/about',
  [PublicPage.FEATURES]: '/features',
  [PublicPage.PRICING]: '/pricing',
  [PublicPage.DOCS]: '/docs',
  [PublicPage.LOGIN]: '/login',
  [PublicPage.SIGNUP]: '/signup',
  [PublicPage.RESET_PASSWORD]: '/reset-password',
  [PublicPage.TERMS]: '/terms',
  [PublicPage.PRIVACY]: '/privacy',
};

// Platform route paths
export const platformRoutePaths: Record<AppPage, string> = {
  [AppPage.APPS]: '/apps',
  [AppPage.AGENTS]: '/agents',
  [AppPage.AUTOMATION]: '/automation',
  [AppPage.DATA_HEALTH]: '/data-health',
  [AppPage.DATA_HUB]: '/data-hub',
  [AppPage.HOME]: '/workspace',
  [AppPage.INTEGRATIONS]: '/integrations',
  [AppPage.METRICS]: '/metrics',
  [AppPage.ONTOLOGY]: '/ontology',
  [AppPage.PROFILE]: '/profile',
};

// Helper to get AppPage from platform path
export const getAppPageFromPath = (path: string): AppPage => {
  const entry = Object.entries(platformRoutePaths).find(
    ([_, routePath]) => routePath === path,
  );
  return entry ? (entry[0] as AppPage) : AppPage.HOME;
};
