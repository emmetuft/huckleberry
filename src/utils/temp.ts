export enum ActionType {
  SCHEDULE = 'schedule',
  CHART = 'chart',
  DATASET = 'dataset',
  SEND = 'send',
}

export function getSuggestedActions(
  input: string,
): { type: ActionType; text: string }[] {
  const actions: { type: ActionType; text: string }[] = [];
  const text = input.toLowerCase();

  if (
    text.includes('automate') ||
    text.includes('schedule') ||
    text.includes('remind')
  )
    actions.push({ type: ActionType.SCHEDULE, text: 'Set a schedule' });
  if (text.includes('report') || text.includes('dashboard'))
    actions.push({ type: ActionType.DATASET, text: 'Choose a dataset' });
  if (text.includes('chart') || text.includes('visualize'))
    actions.push({ type: ActionType.CHART, text: 'Pick a chart type' });
  if (text.includes('send') || text.includes('email') || text.includes('slack'))
    actions.push({ type: ActionType.SEND, text: 'Set a destination' });

  return actions;
}
