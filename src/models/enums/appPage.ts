export enum AppPage {
  AGENTS = 'agents',
  APPS = 'apps',
  AUTOMATION = 'automation',
  DATA_HEALTH = 'data_health',
  DATA_HUB = 'data_hub',
  HOME = 'home',
  INTEGRATIONS = 'integrations',
  ONTOLOGY = 'ontology',
  WORKFLOW = 'workflow',
}

export const AppPageLabel = {
  [AppPage.AGENTS]: 'Agents',
  [AppPage.APPS]: 'Applications',
  [AppPage.AUTOMATION]: 'Automation Rules',
  [AppPage.DATA_HEALTH]: 'Data Health',
  [AppPage.DATA_HUB]: 'Data Hub',
  [AppPage.HOME]: 'Home',
  [AppPage.INTEGRATIONS]: 'Integrations',
  [AppPage.ONTOLOGY]: 'Business Ontology',
  [AppPage.WORKFLOW]: 'Workflow',
};
