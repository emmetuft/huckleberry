export interface Space {
  id: string;
  name: string;
  description: string;
  memberIds: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Canvas {
  id: string;
  spaceId: string;
  intent: string;
  ownerId: number;
  ownerName: string;
  createdAt?: string;
  updatedAt?: string;
}
