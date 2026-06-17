import { FC, useEffect, useState } from 'react';
import { AgentSession } from 'models/interfaces/session';
import { AISessionEvent } from 'models/interfaces/sessionEvent';
import { AgentSessionService } from 'services/agentSession';
import { SessionWaterfall } from './SessionWaterfall/SessionWaterfall';
import { SessionOverview } from './SessionOverview/SessionOverview';

interface SessionAnalyticsProps {
  tab: 'overview' | 'waterfall' | 'graph';
  agentSession: AgentSession | null;
}

export const SessionAnalytics: FC<SessionAnalyticsProps> = ({
  tab,
  agentSession,
}) => {
  const [sessionEvents, setSessionEvents] = useState<AISessionEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!agentSession) {
      setSessionEvents([]);
      return;
    }
    setLoading(true);
    AgentSessionService.getSessionEvents(agentSession.id)
      .then(setSessionEvents)
      .finally(() => setLoading(false));
  }, [agentSession?.id]);

  if (tab === 'overview') {
    return (
      <SessionOverview
        agentSession={agentSession}
        sessionEvents={sessionEvents}
        loading={loading}
      />
    );
  } else {
    return <SessionWaterfall events={sessionEvents} loading={loading} />;
  }
};
