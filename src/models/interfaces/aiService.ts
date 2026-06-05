export interface TextGenRequest {
  input: string;
  system?: string;
  promptTemplate?: { template: string };
}

export interface ImageToTextRequest {
  image: { data: string; mediaType: string; type: string };
  input: string;
  system?: string;
}

export interface DomoAIResponse {
  choices: Array<{
    output: string;
  }>;
  isCustomerModel: boolean;
  modelId: string;
  output: string;
  prompt: string;
  requestId?: string;
  sessionId?: string;
}
