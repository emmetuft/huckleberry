import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './AgentsMonitoring.module.css';
import { useAppDispatch } from 'reducers';
import { fetchAgents } from 'reducers/agents/actions';
import { selectAgents, selectAllSessions } from 'reducers/agents/slice';
import { AgentSessions } from '../AgentSessions/AgentSessions';

const BAR_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
const FAKE_TOKENS = [142500, 98300, 76100, 45200, 23800];

export const AgentsMonitoring: FC = () => {
  const dispatch = useAppDispatch();
  const agents = useSelector(selectAgents);
  const allSessions = useSelector(selectAllSessions);

  const topAgents = allSessions.slice(0, 5).map((session, i) => ({
    name: session.name,
    tokens: FAKE_TOKENS[i] ?? 0,
  }));
  const maxTokens = Math.max(...topAgents.map((a) => a.tokens), 1);

  useEffect(() => {
    if (agents.length === 0) {
      dispatch(fetchAgents());
    }
  }, [agents]);

  return (
    <div className={styles.agentsMonitoring}>
      <div className={styles.splitStats}>
        <div className={styles.statWithChart}>
          <p className={styles.statTitle}>Tokens by model</p>
        </div>
        <div className={styles.statWithChart}>
          <p className={styles.statTitle}>Tokens by agent</p>
          <div className={styles.tokensByAgent}>
            {topAgents.map((agent, i) => (
              <div key={i} className={styles.agentBarRow}>
                <span className={styles.agentBarName}>{agent.name}</span>
                <div className={styles.agentBarTrack}>
                  <div
                    className={styles.agentBar}
                    style={{
                      width: `${(agent.tokens / maxTokens) * 100}%`,
                      backgroundColor: BAR_COLORS[i],
                    }}
                  />
                  <span className={styles.agentBarLabel}>
                    {agent.tokens.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AgentSessions />
    </div>
  );
};
