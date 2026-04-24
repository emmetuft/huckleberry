import { GraphData, GraphEdge, GraphNode } from '../models/interfaces/ontology';

export const PERSON_NODES: GraphNode[] = [
  {
    id: 'person-1',
    labels: ['Person'],
    createdAt: '2026-04-21T09:00:00Z',
    properties: {
      name: 'Alice Chen',
      email: 'alice.chen@example.com',
      startDate: '2022-03-01T00:00:00Z',
    },
  },
  {
    id: 'person-2',
    labels: ['Person'],
    createdAt: '2026-04-21T09:04:30Z',
    properties: {
      name: 'Marcus Rivera',
      email: 'marcus.rivera@example.com',
      startDate: '2021-07-12T00:00:00Z',
    },
  },
  {
    id: 'person-3',
    labels: ['Person'],
    createdAt: '2026-04-21T09:11:00Z',
    properties: {
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      startDate: '2023-01-09T00:00:00Z',
    },
  },
  {
    id: 'person-4',
    labels: ['Person'],
    createdAt: '2026-04-21T09:19:45Z',
    properties: {
      name: 'Jordan Blake',
      email: 'jordan.blake@example.com',
      startDate: '2023-06-19T00:00:00Z',
    },
  },
  {
    id: 'person-5',
    labels: ['Person'],
    createdAt: '2026-04-21T09:31:20Z',
    properties: {
      name: 'Sam Nguyen',
      email: 'sam.nguyen@example.com',
      startDate: '2020-11-02T00:00:00Z',
    },
  },
];

export const DEPARTMENT_NODES: GraphNode[] = [
  {
    id: 'dept-1',
    labels: ['Department'],
    createdAt: '2026-04-21T08:00:00Z',
    properties: { name: 'Platform', budget: 2400000 },
  },
  {
    id: 'dept-2',
    labels: ['Department'],
    createdAt: '2026-04-21T08:01:00Z',
    properties: { name: 'Analytics', budget: 1800000 },
  },
  {
    id: 'dept-3',
    labels: ['Department'],
    createdAt: '2026-04-21T08:02:00Z',
    properties: { name: 'Design', budget: 900000 },
  },
  {
    id: 'dept-4',
    labels: ['Department'],
    createdAt: '2026-04-21T08:03:00Z',
    properties: { name: 'Infrastructure', budget: 3100000 },
  },
];

export const TEAM_NODES: GraphNode[] = [
  {
    id: 'team-1',
    labels: ['Team'],
    createdAt: '2026-04-21T08:10:00Z',
    properties: {
      name: 'Platform Core',
      focus: 'Developer productivity and internal tooling',
    },
  },
  {
    id: 'team-2',
    labels: ['Team'],
    createdAt: '2026-04-21T08:11:00Z',
    properties: {
      name: 'Data Platform',
      focus: 'Data pipelines and analytics infrastructure',
    },
  },
  {
    id: 'team-3',
    labels: ['Team'],
    createdAt: '2026-04-21T08:12:00Z',
    properties: {
      name: 'Brand & UX',
      focus: 'Visual design systems and user experience',
    },
  },
  {
    id: 'team-4',
    labels: ['Team'],
    createdAt: '2026-04-21T08:13:00Z',
    properties: {
      name: 'Site Reliability',
      focus: 'Uptime, observability, and incident response',
    },
  },
];

export const ROLE_NODES: GraphNode[] = [
  {
    id: 'role-1',
    labels: ['Role'],
    createdAt: '2026-04-21T08:20:00Z',
    properties: { title: 'Engineering Manager', level: 6, isManager: true },
  },
  {
    id: 'role-2',
    labels: ['Role'],
    createdAt: '2026-04-21T08:21:00Z',
    properties: { title: 'Senior Engineer', level: 5, isManager: false },
  },
  {
    id: 'role-3',
    labels: ['Role'],
    createdAt: '2026-04-21T08:22:00Z',
    properties: { title: 'Data Scientist', level: 5, isManager: false },
  },
  {
    id: 'role-4',
    labels: ['Role'],
    createdAt: '2026-04-21T08:23:00Z',
    properties: { title: 'Product Designer', level: 4, isManager: false },
  },
  {
    id: 'role-5',
    labels: ['Role'],
    createdAt: '2026-04-21T08:24:00Z',
    properties: { title: 'Staff Engineer', level: 6, isManager: false },
  },
];

export const OFFICE_NODES: GraphNode[] = [
  {
    id: 'office-1',
    labels: ['Office'],
    createdAt: '2026-04-21T08:30:00Z',
    properties: { city: 'American Fork', country: 'US' },
  },
  {
    id: 'office-2',
    labels: ['Office'],
    createdAt: '2026-04-21T08:31:00Z',
    properties: { city: 'New York', country: 'US' },
  },
  {
    id: 'office-3',
    labels: ['Office'],
    createdAt: '2026-04-21T08:32:00Z',
    properties: { city: 'London', country: 'UK' },
  },
];

export const ORG_EDGES: GraphEdge[] = [
  // REPORTS_TO
  {
    id: 'e-r1',
    source: 'person-2',
    target: 'person-1',
    type: 'REPORTS_TO',
    properties: {},
  },
  {
    id: 'e-r2',
    source: 'person-3',
    target: 'person-1',
    type: 'REPORTS_TO',
    properties: {},
  },
  {
    id: 'e-r3',
    source: 'person-4',
    target: 'person-1',
    type: 'REPORTS_TO',
    properties: {},
  },
  {
    id: 'e-r4',
    source: 'person-5',
    target: 'person-1',
    type: 'REPORTS_TO',
    properties: {},
  },
  // BELONGS_TO
  {
    id: 'e-b1',
    source: 'person-1',
    target: 'dept-1',
    type: 'BELONGS_TO',
    properties: {},
  },
  {
    id: 'e-b2',
    source: 'person-2',
    target: 'dept-1',
    type: 'BELONGS_TO',
    properties: {},
  },
  {
    id: 'e-b3',
    source: 'person-3',
    target: 'dept-2',
    type: 'BELONGS_TO',
    properties: {},
  },
  {
    id: 'e-b4',
    source: 'person-4',
    target: 'dept-3',
    type: 'BELONGS_TO',
    properties: {},
  },
  {
    id: 'e-b5',
    source: 'person-5',
    target: 'dept-4',
    type: 'BELONGS_TO',
    properties: {},
  },
  // MEMBER_OF
  {
    id: 'e-m1',
    source: 'person-1',
    target: 'team-1',
    type: 'MEMBER_OF',
    properties: {},
  },
  {
    id: 'e-m2',
    source: 'person-2',
    target: 'team-1',
    type: 'MEMBER_OF',
    properties: {},
  },
  {
    id: 'e-m3',
    source: 'person-3',
    target: 'team-2',
    type: 'MEMBER_OF',
    properties: {},
  },
  {
    id: 'e-m4',
    source: 'person-4',
    target: 'team-3',
    type: 'MEMBER_OF',
    properties: {},
  },
  {
    id: 'e-m5',
    source: 'person-5',
    target: 'team-4',
    type: 'MEMBER_OF',
    properties: {},
  },
  // HAS_ROLE
  {
    id: 'e-h1',
    source: 'person-1',
    target: 'role-1',
    type: 'HAS_ROLE',
    properties: {},
  },
  {
    id: 'e-h2',
    source: 'person-2',
    target: 'role-2',
    type: 'HAS_ROLE',
    properties: {},
  },
  {
    id: 'e-h3',
    source: 'person-3',
    target: 'role-3',
    type: 'HAS_ROLE',
    properties: {},
  },
  {
    id: 'e-h4',
    source: 'person-4',
    target: 'role-4',
    type: 'HAS_ROLE',
    properties: {},
  },
  {
    id: 'e-h5',
    source: 'person-5',
    target: 'role-5',
    type: 'HAS_ROLE',
    properties: {},
  },
  // WORKS_AT
  {
    id: 'e-w1',
    source: 'person-1',
    target: 'office-1',
    type: 'WORKS_AT',
    properties: {},
  },
  {
    id: 'e-w2',
    source: 'person-2',
    target: 'office-1',
    type: 'WORKS_AT',
    properties: {},
  },
  {
    id: 'e-w3',
    source: 'person-3',
    target: 'office-2',
    type: 'WORKS_AT',
    properties: {},
  },
  {
    id: 'e-w4',
    source: 'person-4',
    target: 'office-2',
    type: 'WORKS_AT',
    properties: {},
  },
  {
    id: 'e-w5',
    source: 'person-5',
    target: 'office-3',
    type: 'WORKS_AT',
    properties: {},
  },
  // CONTAINS
  {
    id: 'e-c1',
    source: 'dept-1',
    target: 'team-1',
    type: 'CONTAINS',
    properties: {},
  },
  {
    id: 'e-c2',
    source: 'dept-2',
    target: 'team-2',
    type: 'CONTAINS',
    properties: {},
  },
  {
    id: 'e-c3',
    source: 'dept-3',
    target: 'team-3',
    type: 'CONTAINS',
    properties: {},
  },
  {
    id: 'e-c4',
    source: 'dept-4',
    target: 'team-4',
    type: 'CONTAINS',
    properties: {},
  },
];

export const PEOPLE_SKILLS_GRAPH: GraphData = {
  nodes: [
    ...PERSON_NODES,
    ...DEPARTMENT_NODES,
    ...TEAM_NODES,
    ...ROLE_NODES,
    ...OFFICE_NODES,
  ],
  edges: ORG_EDGES,
};
