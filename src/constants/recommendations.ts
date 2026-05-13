export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: RecommendationType;
  source: string;
  reason: string;
  tags: string[];
  actionLabel: string;
  url?: string;
}

export enum RecommendationType {
  Workflow = 'workflow',
  Article = 'article',
  Contact = 'contact',
}

export const recommendations: Recommendation[] = [
  {
    id: 'rec-001',
    title: 'Automate Report Generation',
    description:
      'Based on your recent activity, this workflow can auto-send your Active Customers report each month.',
    type: RecommendationType.Workflow,
    source: 'Huckleberry AI',
    reason: "You've generated the same report multiple times recently.",
    tags: ['Analytics', 'Automation'],
    actionLabel: 'Create Workflow',
  },
  {
    id: 'rec-003',
    title: 'MCP Apps - Bringing UI Capabilities To MCP Clients',
    description:
      'Learn how to build powerful UI experiences in customer AI clients.',
    type: RecommendationType.Article,
    source: 'Model Context Protocol Blog',
    reason:
      'You’ve shown interest in leveraging AI for enhanced user experiences.',
    tags: ['AI', 'Apps', 'Strategy'],
    actionLabel: 'Read Article',
    url: 'https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/',
  },
  {
    id: 'rec-004',
    title: 'Connect with Jake Heaps in Marketing',
    description:
      'Jake recently connected survey data that could enhance your org tree graph.',
    type: RecommendationType.Contact,
    source: 'Huckleberry AI',
    reason: 'You’re both working on graph databases.',
    tags: ['Collaboration', 'Marketing'],
    actionLabel: 'Send Message',
  },
];
