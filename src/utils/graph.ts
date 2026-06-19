import { CypherSearchResult } from 'models/interfaces/graph';
import { GraphData } from 'models/interfaces/ontology';
import { GraphService } from 'services/graph';

export async function fetchSessionGraph(
  sessionId: string,
): Promise<GraphData | null> {
  const cypherResult: CypherSearchResult = await GraphService.cypherSearch({
    cypherQuery:
      'MATCH (s:Session {localId: $sessionId})-[r*1..8]->(m) RETURN s, r, m',
    parameters: { sessionId },
  });

  if (!cypherResult.graph || cypherResult.graph.nodes.length === 0) {
    return null;
  }

  return {
    nodes: cypherResult.graph.nodes.map((n) => ({
      id: n.id,
      labels: n.labels,
      properties: n.properties as Record<string, any>,
      createdAt: (n.properties as any).createdAt,
      updatedAt: (n.properties as any).updatedAt,
    })),
    edges: cypherResult.graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type,
      properties: e.properties as Record<string, any>,
      createdAt: (e.properties as any).createdAt,
      updatedAt: (e.properties as any).updatedAt,
    })),
  };
}
