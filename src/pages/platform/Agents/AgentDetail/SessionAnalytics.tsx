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
        'MATCH (n)-[r]->(m) WHERE n.sessionId = $sessionId RETURN n, r, m',
      parameters: { sessionId: agentSession.id },
    });

    Promise.all([eventsPromise, graphPromise])
      .then(([events, cypherResult]) => {
        setSessionEvents(events);
        if (cypherResult.graph) {
          setGraphData({
            nodes: cypherResult.graph.nodes.map((n) => ({
              id: n.id,
              labels: n.labels,
              properties: n.properties as Record<string, any>,
            })),
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
