import { CypherSearchResult } from 'models/interfaces/graph';
import { GraphData } from 'models/interfaces/ontology';
import { GraphService } from 'services/graph';

function getGraphNodeName(
  labels: string[],
  props: Record<string, any>,
): string {
  const type = labels.find(
    (l) => l !== 'Entity' && l !== 'AISessionEvent' && l !== 'AIContext',
  );

  return type || 'Node';

  //   switch (type) {
  //     case 'Session':
  //       return 'Session';
  //     case 'Request':
  //       return 'Request';
  //     case 'Generation':
  //       return props.service || 'Generation';
  //     case 'ToolCall':
  //       return props.toolName || 'Tool Call';
  //     case 'ActionExecution':
  //       return props.actionType || 'Action';
  //     case 'ThinkingStep':
  //       return 'Thinking';
  //     case 'McpExchange':
  //       return props.method || 'MCP';
  //     case 'Dataset':
  //       return props.name || 'Dataset';
  //     case 'Card':
  //       return props.name || 'Card';
  //     case 'Page':
  //       return props.name || 'Page';
  //     default:
  //       return type || 'Node';
  //   }
}

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
    nodes: cypherResult.graph.nodes.map((n) => {
      const props = n.properties as Record<string, any>;
      const name = getGraphNodeName(n.labels, props);
      return {
        id: n.id,
        labels: n.labels,
        properties: { ...props, name },
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      };
    }),
    edges: cypherResult.graph.edges.map((e) => {
      const props = e.properties as Record<string, any>;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        properties: props,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      };
    }),
  };
}
