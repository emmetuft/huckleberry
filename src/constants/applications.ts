import { Application } from 'models/interfaces/application';

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
    id: 'sales-dashboard',
    name: 'Sales Dashboard',
    description: 'Visualize and analyze sales data',
  },
  {
    id: 'customer-360',
    name: 'Customer 360',
    description: 'Comprehensive view of customer interactions',
  },
  {
    id: 'marketing-analytics',
    name: 'Marketing Analytics',
    description: 'Analyze marketing campaign performance',
  },
  {
    id: 'supply-chain-monitor',
    name: 'Supply Chain Monitor',
    description: 'Track and optimize supply chain operations',
  },
  {
    id: 'financial-forecasting',
    name: 'Financial Forecasting',
    description: 'Predict financial trends and outcomes',
  },
];
