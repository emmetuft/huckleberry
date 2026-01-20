export interface UserRequest {
  userInput: string;
  tools?: any[];
  files?: any[];
}

export interface SystemResponse {
  output: string;
  context: GraphContext;
}

export interface SystemStreamResponse {
  textStream: ReadableStream<string>;
  context: GraphContext;
  cypherQuery: string;
}

export interface GraphContext {
  nodes: Array<{
    id: string;
    labels: string[];
    properties: Record<string, any>;
  }>;
  relationships: Array<{
    id: string;
    type: string;
    source: string;
    target: string;
    properties: Record<string, any>;
  }>;
}
