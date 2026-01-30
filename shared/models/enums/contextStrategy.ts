export enum ContextStrategyType {
  GRAPH_RAG = 'graph-rag',
  METRIC = 'metric',
  PERSONA = 'persona',
}

export const STRATEGY_EXP_MAP: Record<ContextStrategyType, string> = {
  [ContextStrategyType.GRAPH_RAG]:
    'Getting relevant data from the knowledge graph',
  [ContextStrategyType.METRIC]: 'Matching and retrieving relevant metrics',
  [ContextStrategyType.PERSONA]: 'Adapting response based on user persona',
};
