import { GraphDataType } from 'models/enums/graphDataType';
import { GraphModelData } from 'models/interfaces/ontology';

export const INITIAL_GRAPH_MODEL_DATA: GraphModelData = {
  nodes: [
    {
      id: '1',
      label: 'Person',
      properties: [
        { name: 'name', type: GraphDataType.STRING },
        { name: 'email', type: GraphDataType.STRING },
        { name: 'startDate', type: GraphDataType.DATETIME },
      ],
    },
    {
      id: '2',
      label: 'Department',
      properties: [
        { name: 'name', type: GraphDataType.STRING },
        { name: 'budget', type: GraphDataType.FLOAT },
      ],
    },
    {
      id: '3',
      label: 'Team',
      properties: [
        { name: 'name', type: GraphDataType.STRING },
        { name: 'focus', type: GraphDataType.STRING },
      ],
    },
    {
      id: '4',
      label: 'Role',
      properties: [
        { name: 'title', type: GraphDataType.STRING },
        { name: 'level', type: GraphDataType.INTEGER },
        { name: 'isManager', type: GraphDataType.BOOLEAN },
      ],
    },
    {
      id: '5',
      label: 'Office',
      properties: [
        { name: 'city', type: GraphDataType.STRING },
        { name: 'country', type: GraphDataType.STRING },
      ],
    },
  ],
  edges: [
    {
      id: 'r1',
      name: 'REPORTS_TO',
      fromNodeId: '1',
      toNodeId: '1',
      properties: [],
    },
    {
      id: 'r2',
      name: 'BELONGS_TO',
      fromNodeId: '1',
      toNodeId: '2',
      properties: [],
    },
    {
      id: 'r3',
      name: 'MEMBER_OF',
      fromNodeId: '1',
      toNodeId: '3',
      properties: [],
    },
    {
      id: 'r4',
      name: 'HAS_ROLE',
      fromNodeId: '1',
      toNodeId: '4',
      properties: [],
    },
    {
      id: 'r5',
      name: 'WORKS_AT',
      fromNodeId: '1',
      toNodeId: '5',
      properties: [],
    },
    {
      id: 'r6',
      name: 'CONTAINS',
      fromNodeId: '2',
      toNodeId: '3',
      properties: [],
    },
  ],
};
