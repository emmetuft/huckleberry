export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived' | 'on-hold';
  ownerName: string;
  ownerId: number;
  tags: string[];
  members: number[];
  color: string;
  createdAt: string;
}

export const projectList: Project[] = [
  {
    id: 'proj-001',
    name: 'Customer Segmentation Model',
    description:
      'Build and deploy ML models to segment customers by behavior, value, and engagement patterns for personalized marketing campaigns.',
    status: 'active',
    ownerName: 'Jon Tiritilli',
    ownerId: 759993477,
    tags: ['ML', 'Analytics', 'Marketing'],
    color: '#705be7',
    members: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    createdAt: '2026-03-01',
  },
  {
    id: 'proj-002',
    name: 'Data Quality Initiative',
    description:
      'Establish automated data quality checks, anomaly detection, and lineage tracking across all core data sources.',
    status: 'active',
    ownerName: 'Jon Tiritilli',
    ownerId: 759993477,
    tags: ['Data Health', 'Automation'],
    color: '#6d8ae9',
    members: [0],
    createdAt: '2026-02-15',
  },
  {
    id: 'proj-003',
    name: 'Revenue Attribution Redesign',
    description:
      'Replace the legacy multi-touch attribution model with a data-driven approach using causal inference and Shapley values.',
    status: 'completed',
    ownerName: 'Jon Tiritilli',
    ownerId: 759993477,
    tags: ['Analytics', 'Finance'],
    color: '#3a9e72',
    members: [0],
    createdAt: '2026-01-10',
  },
  {
    id: 'proj-004',
    name: 'Ontology Governance Framework',
    description:
      'Define ownership, change management, and versioning processes for the business ontology to ensure consistent metric definitions.',
    status: 'active',
    ownerName: 'Jon Tiritilli',
    ownerId: 759993477,
    tags: ['Governance', 'Ontology'],
    color: '#c048ae',
    members: [0],
    createdAt: '2026-03-20',
  },
  {
    id: 'proj-005',
    name: 'Unified Metrics Catalog',
    description:
      'Consolidate metric definitions from 12 different teams into a single source of truth with automated lineage and documentation.',
    status: 'on-hold',
    ownerName: 'Jon Tiritilli',
    ownerId: 759993477,
    tags: ['Metrics', 'Documentation'],
    color: '#e0a030',
    members: [0],
    createdAt: '2026-04-01',
  },
  {
    id: 'proj-006',
    name: 'Self-Serve Analytics Platform',
    description:
      'Enable non-technical stakeholders to build dashboards and run ad-hoc queries without engineering support.',
    status: 'active',
    ownerName: 'Jon Tiritilli',
    ownerId: 759993477,
    tags: ['BI', 'Self-Serve', 'Analytics'],
    color: '#30b8b0',
    members: [0],
    createdAt: '2026-01-20',
  },
  {
    id: 'proj-007',
    name: 'Data Mesh Migration',
    description:
      'Transition from centralized data warehousing to a domain-oriented data mesh architecture with federated ownership.',
    status: 'active',
    ownerName: 'Jon Tiritilli',
    ownerId: 759993477,
    tags: ['Architecture', 'Data Mesh'],
    color: '#c45a4a',
    members: [0],
    createdAt: '2026-04-15',
  },
  {
    id: 'proj-008',
    name: 'Legacy ETL Modernization',
    description:
      'Replace aging batch ETL jobs with streaming pipelines and modern orchestration tooling to reduce latency and improve reliability.',
    status: 'archived',
    ownerName: 'Jon Tiritilli',
    ownerId: 759993477,
    tags: ['ETL', 'Engineering'],
    color: '#6b7280',
    members: [0],
    createdAt: '2025-10-01',
  },
];
