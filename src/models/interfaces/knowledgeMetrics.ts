export interface KnowledgeMetrics {
  contribution: number; // 0-1: how much this node influences the current decision
  maturity: number; // 0-1: breadth of understanding (wide hill = mature)
  confidence: number; // 0-1: certainty of the information (smooth = confident)
  consensus: number; // 0-1: agreement across contributors
  freshness: number; // 0-1: recency of the information
}
