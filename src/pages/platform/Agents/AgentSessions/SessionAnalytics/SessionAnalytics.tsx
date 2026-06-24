import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Drawer } from 'antd';
import styles from './SessionAnalytics.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectSessionGraphs,
  selectLoadingSessionGraphs,
} from 'reducers/agents/slice';
import { fetchSessionGraphThunk } from 'reducers/agents/actions';
import { AgentSession } from 'models/interfaces/session';
import { AISessionEvent } from 'models/interfaces/sessionEvent';
import { AgentSessionService } from 'services/agentSession';
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
  const dispatch = useAppDispatch();
  const sessionGraphs = useSelector(selectSessionGraphs);
  const loadingSessionGraphs = useSelector(selectLoadingSessionGraphs);

  const [sessionEvents, setSessionEvents] = useState<AISessionEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
  const [drawerSize, setDrawerSize] = useState<number>(700);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'waterfall'>(
    'overview',
  );

  const sessionId = selectedSession?.id ?? null;
  const graphData = sessionId ? (sessionGraphs[sessionId] ?? null) : null;
  const loadingGraph = sessionId
    ? (loadingSessionGraphs[sessionId] ?? false)
    : false;
  const loading = loadingEvents || loadingGraph;

  useEffect(() => {
    if (!sessionId) {
      setSessionEvents([]);
      return;
    }
    setLoadingEvents(true);
    AgentSessionService.getSessionEvents(sessionId)
      .then(setSessionEvents)
      .catch((err) =>
        console.error('[SessionAnalytics] events fetch failed:', err),
      )
      .finally(() => setLoadingEvents(false));

    if (!(sessionId in sessionGraphs)) {
      dispatch(fetchSessionGraphThunk(sessionId));
    }
  }, [sessionId]);

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
