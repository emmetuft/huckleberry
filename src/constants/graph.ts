import { GraphData, GraphEdge, GraphNode } from '../models/interfaces/ontology';

export const PEOPLE_NODES: GraphNode[] = [
  {
    id: 'person-1',
    labels: ['Person'],
    createdAt: '2026-04-21T09:00:00Z',
    properties: {
      name: 'Alice Chen',
      role: 'Engineering Manager',
      department: 'Platform',
      email: 'alice.chen@example.com',
    },
  },
  {
    id: 'person-2',
    labels: ['Person'],
    createdAt: '2026-04-21T09:04:30Z',
    properties: {
      name: 'Marcus Rivera',
      role: 'Senior Engineer',
      department: 'Platform',
      email: 'marcus.rivera@example.com',
    },
  },
  {
    id: 'person-3',
    labels: ['Person'],
    createdAt: '2026-04-21T09:11:00Z',
    properties: {
      name: 'Priya Patel',
      role: 'Data Scientist',
      department: 'Analytics',
      email: 'priya.patel@example.com',
    },
  },
  {
    id: 'person-4',
    labels: ['Person'],
    createdAt: '2026-04-21T09:19:45Z',
    properties: {
      name: 'Jordan Blake',
      role: 'Product Designer',
      department: 'Design',
      email: 'jordan.blake@example.com',
    },
  },
  {
    id: 'person-5',
    labels: ['Person'],
    createdAt: '2026-04-21T09:31:20Z',
    properties: {
      name: 'Sam Nguyen',
      role: 'Staff Engineer',
      department: 'Infrastructure',
      email: 'sam.nguyen@example.com',
    },
  },
];

export const SKILL_NODES: GraphNode[] = [
  {
    id: 'skill-1',
    labels: ['Skill'],
    createdAt: '2026-04-21T09:02:00Z',
    properties: {
      name: 'TypeScript',
      category: 'Programming Language',
      level: 'advanced',
    },
  },
  {
    id: 'skill-2',
    labels: ['Skill'],
    createdAt: '2026-04-21T09:07:15Z',
    properties: {
      name: 'Python',
      category: 'Programming Language',
      level: 'intermediate',
    },
  },
  {
    id: 'skill-3',
    labels: ['Skill'],
    createdAt: '2026-04-21T09:13:40Z',
    properties: { name: 'React', category: 'Frontend', level: 'advanced' },
  },
  {
    id: 'skill-4',
    labels: ['Skill'],
    createdAt: '2026-04-21T09:15:55Z',
    properties: {
      name: 'Machine Learning',
      category: 'Data Science',
      level: 'advanced',
    },
  },
  {
    id: 'skill-5',
    labels: ['Skill'],
    createdAt: '2026-04-21T09:22:10Z',
    properties: {
      name: 'Kubernetes',
      category: 'Infrastructure',
      level: 'advanced',
    },
  },
  {
    id: 'skill-6',
    labels: ['Skill'],
    createdAt: '2026-04-21T09:25:30Z',
    properties: { name: 'SQL', category: 'Data', level: 'intermediate' },
  },
  {
    id: 'skill-7',
    labels: ['Skill'],
    createdAt: '2026-04-21T09:28:00Z',
    properties: { name: 'Figma', category: 'Design', level: 'advanced' },
  },
  {
    id: 'skill-8',
    labels: ['Skill'],
    createdAt: '2026-04-21T09:35:00Z',
    properties: { name: 'GraphQL', category: 'API', level: 'intermediate' },
  },
];

export const SKILL_EDGES: GraphEdge[] = [
  {
    id: 'e-1',
    source: 'person-1',
    target: 'skill-1',
    type: 'HAS_SKILL',
    properties: { years: 4, proficiency: 'expert' },
  },
  {
    id: 'e-2',
    source: 'person-1',
    target: 'skill-3',
    type: 'HAS_SKILL',
    properties: { years: 3, proficiency: 'proficient' },
  },
  {
    id: 'e-3',
    source: 'person-2',
    target: 'skill-1',
    type: 'HAS_SKILL',
    properties: { years: 5, proficiency: 'expert' },
  },
  {
    id: 'e-4',
    source: 'person-2',
    target: 'skill-8',
    type: 'HAS_SKILL',
    properties: { years: 2, proficiency: 'proficient' },
  },
  {
    id: 'e-5',
    source: 'person-2',
    target: 'skill-6',
    type: 'HAS_SKILL',
    properties: { years: 4, proficiency: 'proficient' },
  },
  {
    id: 'e-6',
    source: 'person-3',
    target: 'skill-4',
    type: 'HAS_SKILL',
    properties: { years: 6, proficiency: 'expert' },
  },
  {
    id: 'e-7',
    source: 'person-3',
    target: 'skill-2',
    type: 'HAS_SKILL',
    properties: { years: 7, proficiency: 'expert' },
  },
  {
    id: 'e-8',
    source: 'person-3',
    target: 'skill-6',
    type: 'HAS_SKILL',
    properties: { years: 5, proficiency: 'expert' },
  },
  {
    id: 'e-9',
    source: 'person-4',
    target: 'skill-7',
    type: 'HAS_SKILL',
    properties: { years: 3, proficiency: 'expert' },
  },
  {
    id: 'e-10',
    source: 'person-4',
    target: 'skill-3',
    type: 'HAS_SKILL',
    properties: { years: 2, proficiency: 'familiar' },
  },
  {
    id: 'e-11',
    source: 'person-5',
    target: 'skill-5',
    type: 'HAS_SKILL',
    properties: { years: 5, proficiency: 'expert' },
  },
  {
    id: 'e-12',
    source: 'person-5',
    target: 'skill-1',
    type: 'HAS_SKILL',
    properties: { years: 6, proficiency: 'expert' },
  },
  {
    id: 'e-13',
    source: 'person-5',
    target: 'skill-8',
    type: 'HAS_SKILL',
    properties: { years: 3, proficiency: 'proficient' },
  },
];

export const PEOPLE_SKILLS_GRAPH: GraphData = {
  nodes: [...PEOPLE_NODES, ...SKILL_NODES],
  edges: SKILL_EDGES,
};

export const NODE_LABELS = ['Person', 'Skill'];
