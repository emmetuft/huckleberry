export enum StepType {
  ANALYZE_REQUEST = 'analyze-request',
  GENERATE_RESPONSE = 'generate-response',
  QUERY_DATASOURCE = 'query-datasource',
  USE_TOOL = 'use-tool',
}

export const StepTypeTitles: Record<StepType, string> = {
  [StepType.ANALYZE_REQUEST]: 'Analyzing your request',
  [StepType.GENERATE_RESPONSE]: 'Generating response',
  [StepType.QUERY_DATASOURCE]: 'Querying datasource',
  [StepType.USE_TOOL]: 'Using tool',
};
