export interface StreamRequest {
  userInput: string;
  tools?: any[];
  dataSources?: any[];
  files?: any[];
}

export interface ResumeRequest {
  batchId: string;
  sourceRequestId: string;
  aiAssistantContext: any;
  responseItems: Array<ElicitationResponse>;
}

export interface ElicitationResponse {
  confirmationId: string;
  action: ElicitationAction;
  content: Record<string, unknown>;
}

export enum ElicitationAction {
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE',
  CANCEL = 'CANCEL',
}

export interface GraphContext {
  nodes: Array<{
    id: string;
    labels: string[];
    properties: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    type: string;
    source: string;
    target: string;
    properties: Record<string, any>;
  }>;
}
