import { Integration } from 'models/interfaces/integration';

export const integrationList: Integration[] = [
  {
    id: '1',
    name: 'Google Sheets',
    description: 'Connect and manage your Google Sheets data seamlessly.',
    iconUrl:
      'https://images.icon-icons.com/3053/PNG/512/google_sheets_alt_macos_bigsur_icon_190110.png',
    category: 'Productivity',
  },
  {
    id: '2',
    name: 'Slack',
    description: 'Integrate Slack to enhance team communication.',
    iconUrl:
      'https://images.icon-icons.com/3041/PNG/512/slack_logo_icon_189220.png',
    category: 'Communication',
  },
  {
    id: '3',
    name: 'Salesforce',
    description: 'Sync your Salesforce data for better CRM management.',
    iconUrl:
      'https://www.sparkplug.ai/wp-content/uploads/2023/10/salesforce-logo.png',
    category: 'CRM',
  },
  {
    id: '4',
    name: 'Mailchimp',
    description: 'Manage your email marketing campaigns with Mailchimp.',
    iconUrl: 'https://www.drupal.org/files/project-images/MC_Logo.jpg',
    category: 'Marketing',
  },
  {
    id: '5',
    name: 'Dropbox',
    description: 'Access and manage your Dropbox files directly.',
    iconUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqOhuAvgXSsgdtbtMOOuI2B_g3I0pPkwcocw&s',
    category: 'Storage',
  },
];
