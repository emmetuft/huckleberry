import { FC, useEffect, useState } from 'react';
import { Button, Drawer } from 'antd';
import styles from './SessionAnalytics.module.css';
import { AgentSession } from 'models/interfaces/session';
import { AISessionEvent } from 'models/interfaces/sessionEvent';
import { GraphData } from 'models/interfaces/ontology';
import { AgentSessionService } from 'services/agentSession';
import { fetchSessionGraph } from 'utils/graph';
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

    const eventsPromise = AgentSessionService.getSessionEvents(
      selectedSession.id,
    );
    const graphPromise = fetchSessionGraph(selectedSession.id);

    Promise.all([eventsPromise, graphPromise])
      .then(([events, graph]) => {
        setSessionEvents(events);
        setGraphData(graph);
      })
      .catch((err) => {
        console.error('[SessionAnalytics] graph query failed:', err);
      })
      .finally(() => setLoading(false));
  }, [selectedSession?.id]);

  return (
    <Drawer
      title={
        <div className={styles.drawerHeader}>
          {drawerTabs.map((tab) => (
            <Button
              key={tab.value}
              shape="round"
              type={drawerTab === tab.value ? 'primary' : 'default'}
              onClick={() => setDrawerTab(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      }
      placement="bottom"
      size={drawerSize}
      resizable={{
        onResize: (newSize) => setDrawerSize(newSize),
      }}
      open={selectedSession !== null}
      onClose={() => setSelectedSession(null)}
      style={{ position: 'relative' }}
    >
      {drawerTab === 'overview' ? (
        <SessionOverview
          agentSession={selectedSession}
          sessionEvents={sessionEvents}
          graphData={graphData}
          loading={loading}
        />
      ) : (
        <SessionWaterfall events={sessionEvents} loading={loading} />
      )}
    </Drawer>
  );
};
