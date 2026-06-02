import { Application } from 'models/interfaces/application';

export enum AppCategory {
  ANALYTICS = 'Analytics',
  CUSTOMER_SUCCESS = 'Customer Success',
  FINANCE = 'Finance',
  HUMAN_RESOURCES = 'Human Resources',
  MARKETING = 'Marketing',
  OPERATIONS = 'Operations',
  PROJECT_MANAGEMENT = 'Project Management',
  SALES = 'Sales',
}

export const appCategories: { label: string; value: AppCategory }[] = [
  { label: 'Analytics', value: AppCategory.ANALYTICS },
  { label: 'Customer Success', value: AppCategory.CUSTOMER_SUCCESS },
  { label: 'Finance', value: AppCategory.FINANCE },
  { label: 'Human Resources', value: AppCategory.HUMAN_RESOURCES },
  { label: 'Marketing', value: AppCategory.MARKETING },
  { label: 'Operations', value: AppCategory.OPERATIONS },
  { label: 'Project Management', value: AppCategory.PROJECT_MANAGEMENT },
  { label: 'Sales', value: AppCategory.SALES },
];

export const appList: Application[] = [
  {
    id: 'march-madness',
    name: 'March Madness',
    description: 'Track game scores and predict outcomes',
    category: AppCategory.ANALYTICS,
    favorite: true,
  },
  {
    id: 'hub-hours',
    name: 'Hub: Hours Tracker',
    description: 'Log and manage your work hours',
    category: AppCategory.HUMAN_RESOURCES,
  },
  {
    id: 'app-generator',
    name: 'App Generator',
    description: 'Create custom applications with ease',
    category: AppCategory.PROJECT_MANAGEMENT,
  },
];

export const marketplaceApps: Application[] = [
  {
    id: 'sales-dashboard',
    name: 'Sales Dashboard',
    description: 'Visualize and analyze sales data',
    category: AppCategory.SALES,
  },
  {
    id: 'customer-360',
    name: 'Customer 360',
    description: 'Comprehensive view of customer interactions',
    category: AppCategory.CUSTOMER_SUCCESS,
  },
  {
    id: 'marketing-analytics',
    name: 'Marketing Analytics',
    description: 'Analyze marketing campaign performance',
    category: AppCategory.MARKETING,
  },
  {
    id: 'supply-chain-monitor',
    name: 'Supply Chain Monitor',
    description: 'Track and optimize supply chain operations',
    category: AppCategory.OPERATIONS,
  },
  {
    id: 'financial-forecasting',
    name: 'Financial Forecasting',
    description: 'Predict financial trends and outcomes',
    category: AppCategory.FINANCE,
  },
];
