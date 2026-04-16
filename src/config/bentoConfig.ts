export type CardType =
  | 'pipeline'
  | 'accountsAtRisk'
  | 'quotaAttainment'
  | 'tickets'
  | 'prQueue'
  | 'commitHeatmap';

export interface BentoCardConfig {
  id: string;
  type: CardType;
  title: string;
  colSpan: 1 | 2;
  connectLabel: string;
}

export interface BentoLayout {
  cards: BentoCardConfig[];
}

const SALES_DEPARTMENTS = new Set([
  'Sales',
  'Business Development',
  'Revenue Operations (RevOps)',
]);

const ENGINEERING_DEPARTMENTS = new Set([
  'Engineering',
  'IT',
  'Security / InfoSec',
]);

export const BENTO_LAYOUTS: Record<string, BentoLayout> = {
  sales: {
    cards: [
      {
        id: 'pipeline',
        type: 'pipeline',
        title: 'Pipeline by Stage',
        colSpan: 2,
        connectLabel: 'Connect Salesforce',
      },
      {
        id: 'accountsAtRisk',
        type: 'accountsAtRisk',
        title: 'Accounts at Risk',
        colSpan: 1,
        connectLabel: 'Connect Salesforce',
      },
      {
        id: 'quotaAttainment',
        type: 'quotaAttainment',
        title: 'Quota Attainment',
        colSpan: 1,
        connectLabel: 'Connect Salesforce',
      },
    ],
  },
  engineering: {
    cards: [
      {
        id: 'tickets',
        type: 'tickets',
        title: 'Open Tickets',
        colSpan: 2,
        connectLabel: 'Connect Jira',
      },
      {
        id: 'prQueue',
        type: 'prQueue',
        title: 'Open Pull Requests',
        colSpan: 1,
        connectLabel: 'Connect GitHub',
      },
      {
        id: 'commitHeatmap',
        type: 'commitHeatmap',
        title: 'Commit Activity',
        colSpan: 1,
        connectLabel: 'Connect GitHub',
      },
    ],
  },
};

export function getBentoLayout(
  department: string | undefined,
): BentoLayout | null {
  if (!department) return null;
  if (SALES_DEPARTMENTS.has(department)) return BENTO_LAYOUTS.sales;
  if (ENGINEERING_DEPARTMENTS.has(department)) return BENTO_LAYOUTS.engineering;
  return null;
}
