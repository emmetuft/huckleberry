export const DEFAULT_WORKFLOW_STARTS = [
  {
    id: '1',
    name: 'Run on an interval',
    description:
      'Trigger workflow execution at regular intervals, e.g., every hour.',
    icon: 'clock',
  },
  {
    id: '2',
    name: 'When data is updated',
    description:
      'Trigger when a row or record is added, modified, or deleted in a connected data source.',
    icon: 'refresh',
  },
  {
    id: '3',
    name: 'On webhook received',
    description:
      'Trigger when an HTTP request is received from an external service or app.',
    icon: 'webhook',
  },
  {
    id: '4',
    name: 'On file upload',
    description:
      'Trigger when a new file is uploaded to a connected storage location (e.g., S3, Google Drive).',
    icon: 'upload',
  },
  {
    id: '5',
    name: 'When a form is submitted',
    description:
      'Trigger when a user submits a form from your website or another integrated app.',
    icon: 'form',
  },
  {
    id: '6',
    name: 'Manually triggered',
    description:
      'Trigger the workflow on-demand via a button, script, or API call.',
    icon: 'manual',
  },
];
