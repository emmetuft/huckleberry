import { AutomationRule, RuleOperator } from 'models/interfaces/automation';

export const fakeRule: AutomationRule = {
  id: '1',
  name: 'GitHub Data Quality Gate',
  conditions: [
    {
      id: '1',
      column: "GitHub's completeness",
      operator: RuleOperator.GREATER_THAN,
      value: 95,
    },
  ],
  actions: [
    {
      id: 'daoieh',
      type: 'Halt pipeline',
      value: 'GitHub ETL',
    },
    {
      id: 'qweijpv',
      type: 'Send alert',
      value: 'Data Platform Team',
    },
  ],
  active: true,
  aiGenerated: true,
};

export const actionTypes = [
  'Suspend warehouse',
  'Halt pipeline',
  'Send alert',
  'Send email',
  'Trigger workflow',
  'Log event',
  'Assign task',
];

export const actionValues = {
  ['Suspend warehouse']: [
    'Main Warehouse',
    'Project Warehouse XL',
    'QA Warehouse 3XL',
  ],
  ['Halt pipeline']: ['GitHub ETL', 'JIRA ETL', 'Confluence ETL'],
  ['Send alert']: [
    'Data Platform Team',
    'Engineering Team',
    'Product Team',
    'DevOps Team',
    'QA Team',
  ],
  ['Send email']: [
    'Data Platform Team',
    'Engineering Team',
    'Product Team',
    'DevOps Team',
    'QA Team',
  ],
  ['Trigger workflow']: ['Team Reassignment', 'Issue Escalation'],
  ['Log event']: ['GitHub Event', 'JIRA Event', 'Confluence Event'],
  ['Assign task']: [
    'Data Platform Team',
    'Engineering Team',
    'Product Team',
    'DevOps Team',
    'QA Team',
  ],
};
