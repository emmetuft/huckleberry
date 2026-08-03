import { CanvasEdgeType } from 'models/enums/edgeType';
import { CanvasNodeType } from 'models/enums/nodeType';
import { Canvas, Space } from 'models/interfaces/space';

export const FAKE_SPACES: Space[] = [
  {
    id: '1',
    name: 'Demo',
    description: 'A shared exploration space for demo purposes.',
    memberIds: [1, 2, 3],
    files: [],
    createdAt: 'Jun 1, 2026',
    updatedAt: 'Jun 1, 2026',
  },
  {
    id: 'space-revenue',
    name: 'Revenue Growth',
    description:
      'Analyze and optimize revenue streams, track KPIs, and align team goals.',
    memberIds: [1, 2],
    files: [],
    createdAt: 'Jun 5, 2026',
    updatedAt: 'Jun 5, 2026',
  },
  {
    id: 'space-cx',
    name: 'Customer Insights',
    description:
      'Understand customer behavior, map journeys, and surface retention signals.',
    memberIds: [2, 3],
    files: [],
    createdAt: 'Jun 10, 2026',
    updatedAt: 'Jun 10, 2026',
  },
];

export const FAKE_CANVASES: Canvas[] = [
  {
    id: 'canvas-1',
    spaceId: '1',
    intent: 'Map out Q3 revenue drivers and blockers',
    ownerId: 1,
    ownerName: 'John Doe',
    createdAt: 'Jun 15, 2026',
    updatedAt: 'Jun 15, 2026',
    nodes: [
      {
        id: 'c1-goal',
        type: CanvasNodeType.GOAL,
        position: { x: 400, y: 50 },
        data: {
          id: 'c1-goal',
          type: CanvasNodeType.GOAL,
          capabilities: {},
          data: {
            title: 'Q3 Revenue Target',
            status: 'on_track',
            description: 'Hit $2M ARR by end of Q3 2026.',
            targetDate: 'Sep 30, 2026',
            progress: 42,
            keyResults: [
              { label: 'Close 8 enterprise deals', complete: false },
              { label: 'Reduce sales cycle to < 30 days', complete: true },
              { label: 'Launch upsell campaign', complete: false },
            ],
          },
        },
      },
      {
        id: 'c1-metric',
        type: CanvasNodeType.METRIC,
        position: { x: 100, y: 300 },
        data: {
          id: 'c1-metric',
          type: CanvasNodeType.METRIC,
          capabilities: {},
          data: {
            name: 'Current MRR',
            value: '$142k',
            unit: '/mo',
            change: 11,
            changeDirection: 'up',
            isPositive: true,
            period: 'last month',
            lastUpdated: 'Jun 28, 2026',
            target: '$167k',
          },
        },
      },
      {
        id: 'c1-data',
        type: CanvasNodeType.DATA_SOURCE,
        position: { x: 50, y: 520 },
        data: {
          id: 'c1-data',
          type: CanvasNodeType.DATA_SOURCE,
          capabilities: {},
          data: {
            name: 'Salesforce CRM',
            sourceId: 'sf-prod',
            sourceType: 'CRM',
            rowCount: 4820,
            columnCount: 32,
            lastUpdated: 'Jun 30, 2026',
            columns: ['Account', 'Stage', 'ARR', 'CloseDate', 'Owner'],
            sampleRows: [
              { Account: 'Acme Corp', Stage: 'Negotiation', ARR: 48000 },
              { Account: 'Beta Inc', Stage: 'Discovery', ARR: 12000 },
            ],
          },
        },
      },
      {
        id: 'c1-idea',
        type: CanvasNodeType.IDEA,
        position: { x: 560, y: 420 },
        data: {
          id: 'c1-idea',
          type: CanvasNodeType.IDEA,
          capabilities: {},
          data: {
            title: 'Enterprise Upsell Campaign',
            status: 'exploring',
            description:
              'Target existing mid-market accounts with premium tier offers before Q3 close.',
            category: 'Revenue',
            author: 'Jane Smith',
            createdAt: 'Jun 18, 2026',
          },
        },
      },
      {
        id: 'c1-person',
        type: CanvasNodeType.PERSON,
        position: { x: 760, y: 240 },
        data: {
          id: 'c1-person',
          type: CanvasNodeType.PERSON,
          capabilities: {},
          data: {
            user: {
              id: 2,
              displayName: 'Jane Smith',
              email: 'jane@demo.com',
              role: 'Sales Lead',
            },
          },
        },
      },
      {
        id: 'c1-decision',
        type: CanvasNodeType.DECISION,
        position: { x: 330, y: 440 },
        data: {
          id: 'c1-decision',
          type: CanvasNodeType.DECISION,
          capabilities: {},
          data: {
            title: 'Pricing Tier Restructure',
            status: 'reviewing',
            description:
              'Should we consolidate Pro and Business tiers to reduce friction in the sales process?',
            options: [
              {
                label: 'Merge Pro + Business into one $499/mo plan',
                selected: true,
              },
              { label: 'Keep tiers, add volume discounts', selected: false },
              { label: 'Move to usage-based pricing', selected: false },
            ],
          },
        },
      },
      {
        id: 'c1-ai',
        type: CanvasNodeType.AI_ANALYSIS,
        position: { x: 800, y: 50 },
        data: {
          id: 'c1-ai',
          type: CanvasNodeType.AI_ANALYSIS,
          capabilities: {},
          hint: {
            description:
              'Analyze pipeline data to forecast Q3 revenue likelihood.',
          },
          data: {
            title: 'Q3 Revenue Forecast',
            status: 'complete',
            summary:
              'Pipeline coverage is at 2.4x, with 68% of Q3 target in late-stage deals. Upsell opportunity identified in 14 existing accounts.',
            insights: [
              '3 enterprise deals have stalled in legal review for 14+ days',
              'Mid-market segment is outperforming forecast by 18%',
              'Upsell conversion rate historically highest in Aug–Sep window',
            ],
            model: 'claude-sonnet-4-6',
            confidence: 76,
            analyzedAt: 'Jun 29, 2026',
            sources: 3,
          },
        },
      },
      // --- additional nodes for topographic variety ---
      // High contribution + very high maturity → tallest WIDE hill
      {
        id: 'c1-strategy',
        type: CanvasNodeType.GOAL,
        position: { x: -100, y: -300 },
        data: {
          id: 'c1-strategy',
          type: CanvasNodeType.GOAL,
          capabilities: {},
          data: {
            title: 'Annual GTM Strategy',
            status: 'on_track',
            description:
              'Drive $5M ARR through a product-led expansion motion combined with enterprise outbound.',
            targetDate: 'Dec 31, 2026',
            progress: 68,
            keyResults: [
              { label: 'Launch PLG motion in Q3', complete: true },
              { label: 'Expand to 3 new verticals', complete: false },
              { label: 'Hire 4 enterprise AEs', complete: true },
              { label: 'Build partner ecosystem', complete: false },
            ],
          },
        },
      },
      // High contribution + medium maturity → tall, somewhat wide
      {
        id: 'c1-initiative',
        type: CanvasNodeType.PROJECT,
        position: { x: 950, y: 450 },
        data: {
          id: 'c1-initiative',
          type: CanvasNodeType.PROJECT,
          capabilities: {},
          data: {
            name: 'Enterprise Expansion Initiative',
            status: 'active',
            description:
              'Structured outbound motion targeting F500 accounts in fintech and healthtech.',
            owner: 'Jane Smith',
            startDate: 'May 1, 2026',
            dueDate: 'Sep 30, 2026',
            progress: 45,
          },
        },
      },
      // Medium contribution + high maturity → medium height, wide
      {
        id: 'c1-kpi',
        type: CanvasNodeType.METRIC,
        position: { x: 220, y: 620 },
        data: {
          id: 'c1-kpi',
          type: CanvasNodeType.METRIC,
          capabilities: {},
          data: {
            name: 'Customer Acquisition Cost',
            value: '$1,240',
            unit: 'per customer',
            change: -8,
            changeDirection: 'down',
            isPositive: true,
            period: 'last quarter',
            lastUpdated: 'Jun 28, 2026',
            target: '< $1,000',
          },
        },
      },
      // ISOLATED + very high maturity → short but very WIDE plateau
      {
        id: 'c1-research',
        type: CanvasNodeType.AI_ANALYSIS,
        position: { x: -450, y: 150 },
        data: {
          id: 'c1-research',
          type: CanvasNodeType.AI_ANALYSIS,
          capabilities: {},
          hint: {
            description:
              'Deep competitive landscape analysis across our top 5 rivals.',
          },
          data: {
            title: 'Competitive Landscape Analysis',
            status: 'complete',
            summary:
              'Competitors are converging on AI-assisted workflows. Our differentiator remains data integration depth.',
            insights: [
              'Top 3 competitors launched AI features in H1 2026',
              'No rival has native data warehouse integration',
              'Enterprise buyers rank integration ecosystem as top criterion',
              'SMB market is significantly underserved — greenfield opportunity',
            ],
            model: 'claude-opus-5',
            confidence: 92,
            analyzedAt: 'Jun 15, 2026',
            sources: 12,
          },
        },
      },
      // Low contribution + very high maturity → short but WIDE hill
      {
        id: 'c1-benchmark',
        type: CanvasNodeType.METRIC,
        position: { x: -350, y: 520 },
        data: {
          id: 'c1-benchmark',
          type: CanvasNodeType.METRIC,
          capabilities: {},
          data: {
            name: 'Industry Avg CAC',
            value: '$1,580',
            unit: 'per customer',
            change: 3,
            changeDirection: 'up',
            isPositive: false,
            period: 'industry benchmark',
            lastUpdated: 'May 30, 2026',
            target: 'baseline reference',
          },
        },
      },
      // Medium contribution + medium maturity → rounded medium hill
      {
        id: 'c1-risk',
        type: CanvasNodeType.DECISION,
        position: { x: 1050, y: 120 },
        data: {
          id: 'c1-risk',
          type: CanvasNodeType.DECISION,
          capabilities: {},
          data: {
            title: 'Q3 Execution Risk Assessment',
            status: 'reviewing',
            description:
              'Reduce scope to protect core ARR target, or maintain aggressive expansion?',
            options: [
              { label: 'Reduce scope, protect base target', selected: false },
              {
                label: 'Maintain full scope with contingency plan',
                selected: true,
              },
              {
                label: 'Pause expansion, double down on retention',
                selected: false,
              },
            ],
          },
        },
      },
      // Medium contribution + high maturity → medium-tall, wide hill
      {
        id: 'c1-idea2',
        type: CanvasNodeType.IDEA,
        position: { x: 580, y: -250 },
        data: {
          id: 'c1-idea2',
          type: CanvasNodeType.IDEA,
          capabilities: {},
          data: {
            title: 'Product-Led Growth Expansion',
            status: 'proposed',
            description:
              'Introduce a freemium tier with viral sharing mechanics to drive bottom-up enterprise adoption.',
            category: 'Growth',
            author: 'John Doe',
            createdAt: 'May 20, 2026',
          },
        },
      },
      // ISOLATED + very low maturity → tiny NARROW spike
      {
        id: 'c1-early-idea',
        type: CanvasNodeType.IDEA,
        position: { x: -80, y: 900 },
        data: {
          id: 'c1-early-idea',
          type: CanvasNodeType.IDEA,
          capabilities: {},
          data: {
            title: 'Dark Social Referral Tracking',
            status: 'exploring',
            description: null,
            category: null,
            author: null,
            createdAt: null,
          },
        },
      },
      // Low-medium contribution + medium maturity
      {
        id: 'c1-github',
        type: CanvasNodeType.GITHUB_REPO,
        position: { x: 1000, y: -300 },
        data: {
          id: 'c1-github',
          type: CanvasNodeType.GITHUB_REPO,
          capabilities: {},
          data: {
            name: 'deal-automation',
            owner: 'acme-corp',
            description:
              'Automated deal scoring and routing for Salesforce CRM.',
            language: 'Python',
            stars: 4,
            forks: 1,
            openIssues: 3,
            lastCommit: 'Jun 27, 2026',
            visibility: 'private' as const,
            defaultBranch: 'main',
          },
        },
      },
      // Low-medium contribution + high maturity
      {
        id: 'c1-data3',
        type: CanvasNodeType.DATA_SOURCE,
        position: { x: -250, y: 680 },
        data: {
          id: 'c1-data3',
          type: CanvasNodeType.DATA_SOURCE,
          capabilities: {},
          data: {
            name: 'Snowflake Data Warehouse',
            sourceId: 'snowflake-prod',
            sourceType: 'Data Warehouse',
            rowCount: 14200000,
            columnCount: 87,
            lastUpdated: 'Jul 1, 2026',
            columns: [
              'AccountId',
              'Revenue',
              'Segment',
              'Region',
              'ProductTier',
            ],
            sampleRows: [
              { AccountId: 'acme', Revenue: 48000, Segment: 'Enterprise' },
              { AccountId: 'betacorp', Revenue: 12000, Segment: 'Mid-Market' },
            ],
          },
        },
      },
      // Cluster: three nodes close together forming a merged ridge
      {
        id: 'c1-prod-goal',
        type: CanvasNodeType.GOAL,
        position: { x: 150, y: -600 },
        data: {
          id: 'c1-prod-goal',
          type: CanvasNodeType.GOAL,
          capabilities: {},
          data: {
            title: 'Free-to-Paid Conversion',
            status: 'at_risk',
            description:
              'Convert 8% of free users to paid within 30 days of signup.',
            targetDate: 'Aug 31, 2026',
            progress: 28,
            keyResults: [
              { label: 'Redesign activation checklist', complete: true },
              { label: 'Launch in-app upgrade prompts', complete: false },
              { label: 'A/B test pricing page', complete: false },
            ],
          },
        },
      },
      {
        id: 'c1-prod-metric',
        type: CanvasNodeType.METRIC,
        position: { x: -30, y: -450 },
        data: {
          id: 'c1-prod-metric',
          type: CanvasNodeType.METRIC,
          capabilities: {},
          data: {
            name: 'Free-to-Paid Conversion Rate',
            value: '2.1',
            unit: '%',
            change: -0.4,
            changeDirection: 'down',
            isPositive: false,
            period: 'last 30 days',
            lastUpdated: 'Jun 30, 2026',
            target: '8%',
          },
        },
      },
    ],
    edges: [
      {
        id: 'c1-e1',
        source: 'c1-data',
        target: 'c1-metric',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Increases },
      },
      {
        id: 'c1-e2',
        source: 'c1-metric',
        target: 'c1-goal',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.DependsOn },
      },
      {
        id: 'c1-e3',
        source: 'c1-person',
        target: 'c1-idea',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Requests },
      },
      {
        id: 'c1-e4',
        source: 'c1-idea',
        target: 'c1-goal',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c1-e5',
        source: 'c1-decision',
        target: 'c1-goal',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c1-e6',
        source: 'c1-ai',
        target: 'c1-goal',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      // c1-strategy hub (7 edges total → second tallest)
      {
        id: 'c1-es1',
        source: 'c1-strategy',
        target: 'c1-goal',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c1-es2',
        source: 'c1-metric',
        target: 'c1-strategy',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.DependsOn },
      },
      {
        id: 'c1-es3',
        source: 'c1-ai',
        target: 'c1-strategy',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c1-es4',
        source: 'c1-person',
        target: 'c1-strategy',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.OwnedBy },
      },
      {
        id: 'c1-es5',
        source: 'c1-risk',
        target: 'c1-strategy',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c1-es6',
        source: 'c1-idea2',
        target: 'c1-strategy',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c1-es7',
        source: 'c1-prod-goal',
        target: 'c1-strategy',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.DependsOn },
      },
      // c1-initiative hub (6 edges)
      {
        id: 'c1-ei1',
        source: 'c1-initiative',
        target: 'c1-goal',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c1-ei2',
        source: 'c1-decision',
        target: 'c1-initiative',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c1-ei3',
        source: 'c1-person',
        target: 'c1-initiative',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Requests },
      },
      {
        id: 'c1-ei4',
        source: 'c1-idea2',
        target: 'c1-initiative',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c1-ei5',
        source: 'c1-github',
        target: 'c1-initiative',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c1-ei6',
        source: 'c1-prod-goal',
        target: 'c1-initiative',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      // c1-kpi connections (4 edges)
      {
        id: 'c1-ek1',
        source: 'c1-kpi',
        target: 'c1-goal',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.DependsOn },
      },
      {
        id: 'c1-ek2',
        source: 'c1-data',
        target: 'c1-kpi',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Increases },
      },
      {
        id: 'c1-ek3',
        source: 'c1-data3',
        target: 'c1-kpi',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Increases },
      },
      {
        id: 'c1-ek4',
        source: 'c1-benchmark',
        target: 'c1-kpi',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      // ai gains an edge to idea2 (boosts ai degree to 4)
      {
        id: 'c1-ea1',
        source: 'c1-ai',
        target: 'c1-idea2',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Requests },
      },
      // github connections
      {
        id: 'c1-eg1',
        source: 'c1-github',
        target: 'c1-ai',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      // data3 to metric
      {
        id: 'c1-ed1',
        source: 'c1-data3',
        target: 'c1-metric',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Increases },
      },
      // risk to goal
      {
        id: 'c1-er1',
        source: 'c1-risk',
        target: 'c1-goal',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      // cluster chain
      {
        id: 'c1-ep1',
        source: 'c1-prod-metric',
        target: 'c1-prod-goal',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.DependsOn },
      },
    ],
  },
  {
    id: 'canvas-2',
    spaceId: '1',
    intent: 'Understand churn signals in the enterprise segment',
    ownerId: 2,
    ownerName: 'Jane Smith',
    createdAt: 'Jun 20, 2026',
    updatedAt: 'Jun 20, 2026',
    nodes: [
      {
        id: 'c2-metric',
        type: CanvasNodeType.METRIC,
        position: { x: 450, y: 220 },
        data: {
          id: 'c2-metric',
          type: CanvasNodeType.METRIC,
          capabilities: {},
          data: {
            name: 'Enterprise Churn Rate',
            value: '3.8',
            unit: '%',
            change: 0.6,
            changeDirection: 'up',
            isPositive: false,
            period: 'last quarter',
            lastUpdated: 'Jun 25, 2026',
            target: '< 2.5%',
          },
        },
      },
      {
        id: 'c2-data1',
        type: CanvasNodeType.DATA_SOURCE,
        position: { x: 50, y: 120 },
        data: {
          id: 'c2-data1',
          type: CanvasNodeType.DATA_SOURCE,
          capabilities: {},
          data: {
            name: 'Product Analytics (Amplitude)',
            sourceId: 'amplitude-prod',
            sourceType: 'Analytics',
            rowCount: 280000,
            columnCount: 18,
            lastUpdated: 'Jun 30, 2026',
            columns: ['UserId', 'AccountId', 'Event', 'Timestamp', 'Feature'],
            sampleRows: [
              {
                UserId: 'u-1822',
                AccountId: 'acme',
                Event: 'feature_unused_30d',
              },
              { UserId: 'u-9041', AccountId: 'betacorp', Event: 'login' },
            ],
          },
        },
      },
      {
        id: 'c2-data2',
        type: CanvasNodeType.DATA_SOURCE,
        position: { x: 50, y: 440 },
        data: {
          id: 'c2-data2',
          type: CanvasNodeType.DATA_SOURCE,
          capabilities: {},
          data: {
            name: 'Customer Feedback (Intercom)',
            sourceId: 'intercom-prod',
            sourceType: 'Support',
            rowCount: 1240,
            columnCount: 9,
            lastUpdated: 'Jun 28, 2026',
            columns: [
              'TicketId',
              'AccountId',
              'Sentiment',
              'Category',
              'CreatedAt',
            ],
            sampleRows: [
              {
                TicketId: 't-441',
                AccountId: 'globex',
                Sentiment: 'negative',
                Category: 'missing_feature',
              },
              {
                TicketId: 't-442',
                AccountId: 'acme',
                Sentiment: 'neutral',
                Category: 'billing',
              },
            ],
          },
        },
      },
      {
        id: 'c2-goal',
        type: CanvasNodeType.GOAL,
        position: { x: 820, y: 80 },
        data: {
          id: 'c2-goal',
          type: CanvasNodeType.GOAL,
          capabilities: {},
          data: {
            title: 'Reduce Enterprise Churn by 15%',
            status: 'at_risk',
            description:
              'Identify and address top churn signals before the Q3 renewal cycle.',
            targetDate: 'Aug 31, 2026',
            progress: 20,
            keyResults: [
              { label: 'Identify top 3 churn predictors', complete: true },
              {
                label: 'Launch proactive outreach to at-risk accounts',
                complete: false,
              },
              {
                label: 'Ship missing features blocking 5+ accounts',
                complete: false,
              },
            ],
          },
        },
      },
      {
        id: 'c2-person',
        type: CanvasNodeType.PERSON,
        position: { x: 230, y: 30 },
        data: {
          id: 'c2-person',
          type: CanvasNodeType.PERSON,
          capabilities: {},
          data: {
            user: {
              id: 3,
              displayName: 'Alice Johnson',
              email: 'alice@demo.com',
              role: 'Customer Success Lead',
            },
          },
        },
      },
      {
        id: 'c2-project',
        type: CanvasNodeType.PROJECT,
        position: { x: 720, y: 390 },
        data: {
          id: 'c2-project',
          type: CanvasNodeType.PROJECT,
          capabilities: {},
          data: {
            name: 'Retention Playbook',
            status: 'active',
            description:
              'Build a repeatable playbook for identifying and rescuing at-risk enterprise accounts.',
            owner: 'Alice Johnson',
            startDate: 'Jun 15, 2026',
            dueDate: 'Aug 15, 2026',
            progress: 30,
          },
        },
      },
      {
        id: 'c2-ai',
        type: CanvasNodeType.AI_ANALYSIS,
        position: { x: 470, y: 440 },
        data: {
          id: 'c2-ai',
          type: CanvasNodeType.AI_ANALYSIS,
          capabilities: {},
          hint: {
            description:
              'Surface behavioral patterns that predict churn 60–90 days out.',
          },
          data: {
            title: 'Churn Pattern Analysis',
            status: 'not_started',
            summary: '',
            insights: [],
            model: 'claude-sonnet-4-6',
            confidence: 0,
            analyzedAt: '',
          },
        },
      },
    ],
    edges: [
      {
        id: 'c2-e1',
        source: 'c2-data1',
        target: 'c2-metric',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Causes },
      },
      {
        id: 'c2-e2',
        source: 'c2-data2',
        target: 'c2-ai',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c2-e3',
        source: 'c2-metric',
        target: 'c2-ai',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c2-e4',
        source: 'c2-ai',
        target: 'c2-goal',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
      {
        id: 'c2-e5',
        source: 'c2-person',
        target: 'c2-project',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.OwnedBy },
      },
      {
        id: 'c2-e6',
        source: 'c2-project',
        target: 'c2-goal',
        type: 'simplebezier',
        data: { relationship: CanvasEdgeType.Supports },
      },
    ],
  },
];
