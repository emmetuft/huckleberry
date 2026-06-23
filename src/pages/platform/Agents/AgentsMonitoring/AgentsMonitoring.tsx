import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Input, Segmented } from 'antd';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import styles from './AgentsMonitoring.module.css';
import { useAppDispatch } from 'reducers';
import { fetchAgents } from 'reducers/agents/actions';
import {
  selectAgents,
  selectAIModels,
  selectAllSessions,
} from 'reducers/agents/slice';
import { AgentSessions } from '../AgentSessions/AgentSessions';
import { formatCompactNumber } from 'utils/datetime';

const FAKE_TOKENS = [142500, 98300, 76100, 45200, 23800];

enum TimeRange {
  Today = 'Today',
  ThisWeek = 'This week',
  ThisMonth = 'This month',
  AllTime = 'All time',
}

export const AgentsMonitoring: FC = () => {
  const dispatch = useAppDispatch();
  const agents = useSelector(selectAgents);
  const models = useSelector(selectAIModels);
  const allAgentSessions = useSelector(selectAllSessions);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(
    TimeRange.Today,
  );

  // TODO: Implement filtering logic based on searchTerm and selectedTimeRange

  const topModels = models.slice(0, 5).map((model, i) => ({
    name: model.name,
    tokens: FAKE_TOKENS[i] ?? 0,
  }));
  const maxModelTokens = Math.max(...topModels.map((a) => a.tokens), 1);

  const topAgents = agents.slice(0, 5).map((session, i) => ({
    name: session.name,
    tokens: FAKE_TOKENS[i] ?? 0,
  }));
  const maxAgentTokens = Math.max(...topAgents.map((a) => a.tokens), 1);

  useEffect(() => {
    if (agents.length === 0) {
      dispatch(fetchAgents());
    }
  }, [agents]);

  return (
    <div className={styles.agentsMonitoring}>
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Total sessions</p>
          <p className={styles.metricValue}>{allAgentSessions.length}</p>
        </div>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Total tokens</p>
          <p className={styles.metricValue}>840.6k</p>
        </div>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Total cost</p>
          <p className={styles.metricValue}>$319.45</p>
        </div>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Error rate</p>
          <p className={styles.metricValue}>12%</p>
        </div>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Other stat</p>
          <p className={styles.metricValue}>cool</p>
        </div>
      </div>
      <div className={styles.controls}>
        <Input
          size="large"
          placeholder="Search session, user, or agent..."
          prefix={<MagnifyingGlassIcon />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
        <Segmented<TimeRange>
          value={selectedTimeRange}
          options={[
            TimeRange.Today,
            TimeRange.ThisWeek,
            TimeRange.ThisMonth,
            TimeRange.AllTime,
          ]}
          onChange={(value) => setSelectedTimeRange(value as TimeRange)}
        />
      </div>
      <div className={styles.splitStats}>
        <div className={styles.statWithChart}>
          <p className={styles.statTitle}>Tokens by model</p>
          <div className={styles.statBreakdown}>
            {topModels.map((model, i) => (
              <div key={i} className={styles.barRow}>
                <span className={styles.barName}>{model.name}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.bar}
                    style={{
                      width: `${(model.tokens / maxModelTokens) * 100}%`,
                    }}
                  >
                    <span className={styles.barLabel}>
                      {formatCompactNumber(model.tokens)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.statWithChart}>
          <p className={styles.statTitle}>Tokens by agent</p>
          <div className={styles.statBreakdown}>
            {topAgents.map((agent, i) => (
              <div key={i} className={styles.barRow}>
                <span className={styles.barName}>{agent.name}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.bar}
                    style={{
                      width: `${(agent.tokens / maxAgentTokens) * 100}%`,
                    }}
                  >
                    <span className={styles.barLabel}>
                      {formatCompactNumber(agent.tokens)}
                    </span>
                  </div>
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
