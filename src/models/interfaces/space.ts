import type { Edge, Node } from '@xyflow/react';
import type { CanvasNode } from 'models/interfaces/canvasNode';

export interface SpaceFile {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  memberIds: number[];
  files: SpaceFile[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Canvas {
  id: string;
  spaceId: string;
  intent: string;
  templateId?: string;
  nodes?: Node<CanvasNode>[];
  edges?: Edge[];
  ownerId: number;
  ownerName: string;
  createdAt?: string;
  updatedAt?: string;
}
