import { Application, MarketplaceApp } from 'models/interfaces/application';

export const appCategories: string[] = [
  'Analytics',
  'Customer Success',
  'Finance',
  'Human Resources',
  'Marketing',
  'Operations',
  'Project Management',
  'Sales',
];

export const appList: Application[] = [
  {
    id: 'march-madness',
    name: 'March Madness',
    description: 'Track game scores and predict outcomes',
    inDock: true,
    favorite: true,
  },
  {
    id: 'hub-hours',
    name: 'Hub: Hours Tracker',
    description: 'Log and manage your work hours',
  },
  {
    id: 'app-generator',
    name: 'App Generator',
    description: 'Create custom applications with ease',
  },
];

export const marketplaceApps: MarketplaceApp[] = [
  {
    id: 'sales-dashboard',
    name: 'Sales Dashboard',
    description: 'Visualize and analyze sales data',
    category: 'Sales',
  },
  {
    id: 'customer-360',
    name: 'Customer 360',
    description: 'Comprehensive view of customer interactions',
    category: 'Customer Success',
  },
  {
    id: 'marketing-analytics',
    name: 'Marketing Analytics',
    description: 'Analyze marketing campaign performance',
    category: 'Marketing',
  },
  {
    id: 'supply-chain-monitor',
    name: 'Supply Chain Monitor',
    description: 'Track and optimize supply chain operations',
    category: 'Operations',
  },
  {
    id: 'financial-forecasting',
    name: 'Financial Forecasting',
    description: 'Predict financial trends and outcomes',
    category: 'Finance',
  },
];
