import { NodeType } from 'models/enums/nodeType';

export const TEMPLATE_NODES = [
  {
    id: 'node-1',
    type: NodeType.START,
    position: { x: 800, y: 200 },
    data: { value: 123 },
  },
  {
    id: 'node-2',
    type: NodeType.ACTION,
    position: { x: 1000, y: 200 },
    data: { value: 123 },
  },
  {
    id: 'node-3',
    type: NodeType.END,
    position: { x: 1200, y: 200 },
    data: { value: 123 },
  },
];

export const DEFAULT_TEMPLATES = [
  {
    id: '1',
    name: 'Exception management',
    description: 'Development travel expenses less than expected',
    image: '/static/resources/expenses.png',
  },
  {
    id: '2',
    name: 'Invoice approval',
    description:
      'Development morale is trending downward according to latest CONFIRM',
    image: '/static/resources/morale.png',
  },
  {
    id: '3',
    name: 'Customer onboarding',
    description: 'Data center costs in APAC reach 2-year high in December 2025',
    image: '/static/resources/costs.png',
  },
  {
    id: '4',
    name: 'Automated report generation',
    description: 'R&D spending is on-track with budget forecasts for Q2 2026',
    image: '/static/resources/spending.png',
  },
];

export const DEFAULT_AGENTS = [
  {
    id: '1',
    name: 'Data Analyst',
    description: 'Analyzes data and generates reports.',
  },
  {
    id: '2',
    name: 'Customer Support',
    description: 'Handles customer inquiries and issues.',
  },
  {
    id: '3',
    name: 'Sales Assistant',
    description: 'Assists with sales processes and customer interactions.',
  },
  {
    id: '4',
    name: 'Marketing Specialist',
    description: 'Develops marketing strategies and campaigns.',
  },
  {
    id: '5',
    name: 'Product Manager',
    description: 'Oversees product development and strategy.',
  },
  {
    id: '6',
    name: 'UX Designer',
    description: 'Designs user experiences and interfaces.',
  },
];
