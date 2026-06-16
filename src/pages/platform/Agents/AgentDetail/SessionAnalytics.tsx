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

  useEffect(() => {
    if (!agentSession) {
      setSessionEvents([]);
      return;
    }
    AgentSessionService.getSessionEvents(agentSession.id).then(
      setSessionEvents,
    );
  }, [agentSession?.id]);

  if (tab === 'overview') {
    return (
      <SessionOverview
        agentSession={agentSession}
        sessionEvents={sessionEvents}
      />
    );
  } else {
    return <SessionWaterfall events={sessionEvents} />;
  }
};
