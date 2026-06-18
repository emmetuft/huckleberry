import { FC, useEffect, useState } from 'react';
import { Button, Drawer } from 'antd';
import styles from './AgentDetail.module.css';
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
  const [sessionEvents, setSessionEvents] = useState<AISessionEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [drawerSize, setDrawerSize] = useState<number>(700);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'waterfall'>(
    'overview',
  );

  useEffect(() => {
    if (!selectedSession) {
      setSessionEvents([]);
      return;
    }
    setLoading(true);
    AgentSessionService.getSessionEvents(selectedSession.id)
      .then(setSessionEvents)
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
          loading={loading}
        />
      ) : (
        <SessionWaterfall events={sessionEvents} loading={loading} />
      )}
    </Drawer>
  );
};
