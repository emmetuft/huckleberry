import { Integration } from 'models/interfaces/integration';

export const integrationCategories: string[] = [
  'CDW',
  'Communication',
  'CRM',
  'Marketing',
  'Productivity',
  'Storage',
];

export const integrationList: Integration[] = [
  {
    id: '6',
    name: 'Snowflake',
    description: 'Connect and manage your Snowflake data warehouse',
    iconUrl:
      'https://images.softwaresuggest.com/software_logo/1547639328_Snowflake%20logo.png',
    category: 'CDW',
    connected: true,
  },
  {
    id: '7',
    name: 'Databricks',
    description: 'Connect and manage your Databricks workspace',
    iconUrl:
      'https://cdn.brandfetch.io/databricks.com/fallback/lettermark/theme/dark/h/256/w/256/icon?c=1bfwsmEH20zzEfSNTed',
    category: 'CDW',
  },
  {
    id: '1',
    name: 'Google Sheets',
    description: 'Connect and manage your Google Sheets data',
    iconUrl:
      'https://img.freepik.com/premium-vector/google-sheets-logo_578229-309.jpg',
    category: 'Productivity',
    connected: true,
  },
  {
    id: '2',
    name: 'Slack',
    description: 'Integrate Slack to enhance team communication',
    iconUrl:
      'https://www.logo.wine/a/logo/Slack_Technologies/Slack_Technologies-Mark-Logo.wine.svg',
    category: 'Communication',
  },
  {
    id: '3',
    name: 'Salesforce',
    description: 'Sync your Salesforce data for better CRM management',
    iconUrl:
      'https://www.sparkplug.ai/wp-content/uploads/2023/10/salesforce-logo.png',
    category: 'CRM',
  },
  {
    id: '4',
    name: 'Mailchimp',
    description: 'Manage your email marketing campaigns',
    iconUrl: 'https://www.drupal.org/files/project-images/MC_Logo.jpg',
    category: 'Marketing',
  },
  {
    id: '5',
    name: 'Dropbox',
    description: 'Access and manage your Dropbox files directly',
    iconUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqOhuAvgXSsgdtbtMOOuI2B_g3I0pPkwcocw&s',
    category: 'Storage',
    connected: true,
  },
];
