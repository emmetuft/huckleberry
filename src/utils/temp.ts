import { DataSource } from 'models/interfaces/dataSource';

export enum ActionType {
  SCHEDULE = 'schedule',
  CHART = 'chart',
  DATASET = 'dataset',
  SEND = 'send',
}

export function getSuggestedActions(
  input: string,
  dataSources: DataSource[] = [],
): { type: ActionType; text: string }[] {
  const actions: { type: ActionType; text: string }[] = [];
  const text = input.toLowerCase();

  if (
    text.includes('automate') ||
    text.includes('schedule') ||
    text.includes('remind')
  )
    actions.push({ type: ActionType.SCHEDULE, text: 'Set schedule' });
  if (text.includes('report') || text.includes('dashboard'))
    if (dataSources.length === 0) {
      actions.push({ type: ActionType.DATASET, text: 'Select data' });
    }
  if (text.includes('chart') || text.includes('visualize'))
    actions.push({ type: ActionType.CHART, text: 'Pick chart' });
  if (text.includes('send') || text.includes('email') || text.includes('slack'))
    actions.push({ type: ActionType.SEND, text: 'Set destination' });

  return actions;
}
