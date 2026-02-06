import { GraphContext } from './userRequest.ts';

export interface ContextResult {
  textContext: string;
  graphContext?: GraphContext;
  metadata: {
    [key: string]: any;
  };
}
