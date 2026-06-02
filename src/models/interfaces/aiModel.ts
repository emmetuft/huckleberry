export interface AIModel {
  id: string;
  name: string;
  type: string;
  description: string;
  tasks: any[];
  executionTypes: string[];
  capabilities: any;
  batchModelConfiguration: any;
}
