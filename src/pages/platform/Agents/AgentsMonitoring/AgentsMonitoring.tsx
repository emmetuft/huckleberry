import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table } from 'antd';
import type { TableColumnsType, TablePaginationConfig } from 'antd';
import styles from './AgentsMonitoring.module.css';
import { useAppDispatch } from 'reducers';
import { fetchAllSessions } from 'reducers/agents/actions';
import {
  selectAllSessions,
  selectLoadingAllSessions,
} from 'reducers/agents/slice';
import { AgentSession } from 'models/interfaces/session';
import { formatDateTime } from 'utils/datetime';
import { SessionAnalytics } from '../AgentDetail/SessionAnalytics';

const PAGE_SIZE = 50;

const BAR_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
const FAKE_TOKENS = [142500, 98300, 76100, 45200, 23800];

const columns: TableColumnsType<AgentSession> = [
  { title: 'Session name', dataIndex: 'name', key: 'name' },
  { title: 'Group', dataIndex: 'group', key: 'group' },
  { title: 'User ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: 'Version', dataIndex: 'version', key: 'version', width: 90 },
  {
    title: 'Created',
    dataIndex: 'created',
    key: 'created',
    render: (value) => formatDateTime(value),
  },
  {
    title: 'Last activity',
    dataIndex: 'lastActivity',
    key: 'lastActivity',
    render: (value) => formatDateTime(value),
  },
];

export const AgentsMonitoring: FC = () => {
  const dispatch = useAppDispatch();
  const allSessions = useSelector(selectAllSessions);
  const loading = useSelector(selectLoadingAllSessions);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<AgentSession | null>(
    null,
  );

  const topAgents = allSessions.slice(0, 5).map((session, i) => ({
    name: session.name,
    tokens: FAKE_TOKENS[i] ?? 0,
  }));
  const maxTokens = Math.max(...topAgents.map((a) => a.tokens), 1);

  useEffect(() => {
    dispatch(fetchAllSessions({ limit: PAGE_SIZE, offset: 0 }));
  }, [dispatch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const page = pagination.current ?? 1;
    setCurrentPage(page);
    dispatch(
      fetchAllSessions({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    );
  };

  return (
    <div className={styles.agentsMonitoring}>
      <div className={styles.splitStats}>
        <div className={styles.statWithChart}>
          <p>Tokens by model</p>
        </div>
        <div className={styles.statWithChart}>
          <p>Tokens by agent</p>
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
      <Table<AgentSession>
        columns={columns}
        dataSource={allSessions}
        rowKey="id"
        loading={loading}
        pagination={{ current: currentPage, pageSize: PAGE_SIZE, simple: true }}
        onChange={handleTableChange}
      />
      <SessionAnalytics
        selectedSession={selectedSession}
        setSelectedSession={setSelectedSession}
      />
    </div>
  );
};
