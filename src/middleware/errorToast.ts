import { isRejected, Middleware } from '@reduxjs/toolkit';
import { toast } from 'sonner';

const errorMessages: Record<string, string> = {
  'agents/fetchAgents': 'Could not load agents.',
  'agents/fetchAIModels': 'Could not load AI models.',
  'agents/fetchAgentById': 'Could not load agent details.',
  'agents/createCustomAgent': 'Could not create agent. Please try again.',
  'app/authenticate': 'Authentication failed.',
  'app/fetchUserPersona': 'Could not load your profile.',
  'app/saveUserPersona': 'Could not save profile. Please try again.',
  'chat/fetchDataSources': 'Could not load data sources.',
  'chat/fetchSessions': 'Could not load sessions.',
  'chat/fetchSession': 'Could not load session.',
  'chat/deleteSession': 'Could not delete session. Please try again.',
  'chat/executeStream': 'Something went wrong. Please try again.',
  'chat/resumeStream': 'Something went wrong. Please try again.',
  'datasource/fetchDataSourceList': 'Could not load data sources.',
  'datasource/fetchDataSource': 'Could not load data source.',
  'metrics/fetchMetricCatalog': 'Could not load metrics.',
  'ontology/fetchAllNodeLabels': 'Could not load labels.',
  'ontology/fetchNodes': 'Could not load nodes.',
  'people/fetchUsers': 'Could not load users.',
  'people/fetchGroups': 'Could not load groups.',
  'toolkits/fetchToolkits': 'Could not load toolkits.',
};

const DEFAULT_MESSAGE = 'Something went wrong.';

export const errorToastMiddleware: Middleware = () => (next) => (action) => {
  if (isRejected(action)) {
    const message =
      errorMessages[action.type.replace('/rejected', '')] || DEFAULT_MESSAGE;
    toast.error(message);
  }
  return next(action);
};
