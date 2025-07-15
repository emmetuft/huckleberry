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
    description:
      'Identity and act on business exceptions, with human in the loop.',
  },
  {
    id: '2',
    name: 'Invoice approval',
    description: 'Process and approve invoices with logging and notifications.',
  },
  {
    id: '3',
    name: 'Customer onboarding',
    description: 'Send welcome emails, collect information, and assign reps.',
  },
  {
    id: '4',
    name: 'Automated report generation',
    description:
      'Run analyses, generate report files, and send to stakeholders.',
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

export const DEFAULT_WORKFLOW_STARTS = [
  {
    id: '1',
    name: 'Run on an interval',
    description:
      'Trigger workflow execution at regular intervals, e.g., every hour.',
  },
  {
    id: '2',
    name: 'When data is updated',
    description:
      'Trigger when a row or record is added, modified, or deleted in a connected data source.',
  },
  {
    id: '3',
    name: 'On webhook received',
    description:
      'Trigger when an HTTP request is received from an external service or app.',
  },
  {
    id: '4',
    name: 'On file upload',
    description:
      'Trigger when a new file is uploaded to a connected storage location (e.g., S3, Google Drive).',
  },
  {
    id: '5',
    name: 'When a form is submitted',
    description:
      'Trigger when a user submits a form from your website or another integrated app.',
  },
  {
    id: '6',
    name: 'Manually triggered',
    description:
      'Trigger the workflow on-demand via a button, script, or API call.',
  },
];
