import { FC, useEffect, useState } from 'react';
import { Button, Drawer } from 'antd';
import styles from './AgentDetail.module.css';
import { AgentSession } from 'models/interfaces/session';
import { AISessionEvent } from 'models/interfaces/sessionEvent';
import { GraphData } from 'models/interfaces/ontology';
import { AgentSessionService } from 'services/agentSession';
import { GraphService } from 'services/graph';
import { SessionWaterfall } from './SessionWaterfall/SessionWaterfall';
import { SessionOverview } from './SessionOverview/SessionOverview';

const drawerTabs = [
  { label: 'Overview', value: 'overview' },
  { label: 'Event waterfall', value: 'waterfall' },
] as const;

interface SessionAnalyticsProps {
  selectedSession: AgentSession | null;
  setSelectedSession: (session: AgentSession | null) => void;
}

function getGraphNodeName(
  labels: string[],
  props: Record<string, any>,
): string {
  const type = labels.find(
    (l) => l !== 'Entity' && l !== 'AISessionEvent' && l !== 'AIContext',
  );

  switch (type) {
    case 'Session':
      return 'Session';
    case 'Request':
      return props.inputPreview ? props.inputPreview.slice(0, 50) : 'Request';
    case 'Generation':
      return props.service || 'Generation';
    case 'ToolCall':
      return props.toolName || 'Tool Call';
    case 'ActionExecution':
      return props.actionType || 'Action';
    case 'ThinkingStep':
      return 'Thinking';
    case 'McpExchange':
      return props.method || 'MCP';
    case 'Dataset':
      return props.name || 'Dataset';
    case 'Card':
      return props.name || 'Card';
    case 'Page':
      return props.name || 'Page';
    default:
      return type || 'Node';
  }
}

export const SessionAnalytics: FC<SessionAnalyticsProps> = ({
  selectedSession,
  setSelectedSession,
}) => {
  const [sessionEvents, setSessionEvents] = useState<AISessionEvent[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [drawerSize, setDrawerSize] = useState<number>(700);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'waterfall'>(
    'overview',
  );

  useEffect(() => {
    if (!selectedSession) {
      setSessionEvents([]);
      setGraphData(null);
      return;
    }
    setLoading(true);

    const eventsPromise = AgentSessionService.getSessionEvents(agentSession.id);
    const graphPromise = GraphService.cypherSearch({
      cypherQuery:
        'MATCH (s:Session {localId: $sessionId})-[r*1..5]-(m) RETURN s, r, m',
      parameters: { sessionId: agentSession.id },
    });

    Promise.all([eventsPromise, graphPromise])
      .then(([events, cypherResult]) => {
        setSessionEvents(events);
        if (cypherResult.graph && cypherResult.graph.nodes.length > 0) {
          setGraphData({
            nodes: cypherResult.graph.nodes.map((n) => {
              const props = n.properties as Record<string, any>;
              const name = getGraphNodeName(n.labels, props);
              return {
                id: n.id,
                labels: n.labels,
                properties: { ...props, name },
              };
            }),
            edges: cypherResult.graph.edges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
              type: e.type,
              properties: e.properties as Record<string, any>,
            })),
          });
        }
      })
      .finally(() => setLoading(false));
  }, [selectedSession?.id]);

  if (tab === 'overview') {
    return (
      <SessionOverview
        agentSession={agentSession}
        sessionEvents={sessionEvents}
        graphData={graphData}
        loading={loading}
      />
    );
  } else {
    return <SessionWaterfall events={sessionEvents} loading={loading} />;
  }
};
