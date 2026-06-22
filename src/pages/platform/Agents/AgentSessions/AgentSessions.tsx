import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { AgentSession } from 'models/interfaces/session';
import { ScalesIcon } from '@phosphor-icons/react';
import styles from './AgentSessions.module.css';
import { useAppDispatch } from 'reducers';
import { fetchAllSessions, fetchSessions } from 'reducers/agents/actions';
import {
  selectAgents,
  selectAgentSessions,
  selectAIModels,
  selectAllSessions,
} from 'reducers/agents/slice';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { SessionAnalytics } from './SessionAnalytics/SessionAnalytics';
import { SessionCompare } from './SessionCompare/SessionCompare';
import { formatDateTime } from 'utils/datetime';

interface AgentSessionsProps {
  agentId?: string;
}

export const AgentSessions: FC<AgentSessionsProps> = ({ agentId }) => {
  const dispatch = useAppDispatch();
  const agents = useSelector(selectAgents);
  const agentSessions = useSelector(selectAgentSessions);
  const allAgentSessions = useSelector(selectAllSessions);
  const models = useSelector(selectAIModels);

  const sessionList = agentId ? agentSessions : allAgentSessions;

  const [selectedSession, setSelectedSession] = useState<AgentSession | null>(
    null,
  );
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    if (agentId) {
      dispatch(fetchSessions({ agentId }));
    } else {
      // TODO: This endpoint does not exist in production or in DEV-3 and needs to be scoped, designed, and protected
      dispatch(fetchAllSessions());
    }
  }, [agentId]);

  const sessionColumns: TableColumnsType<AgentSession> = [
    { title: 'Session name', dataIndex: 'name', key: 'name' },
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId, record) => (
        <Avatar
          userId={userId}
          name={
            agents.find((a) => a.id === record.groupEntityId)
              ?.ownerDisplayName || 'N/A'
          }
          showName
        />
      ),
    },
    ...(!agentId
      ? [
          {
            title: 'Agent',
            dataIndex: 'groupEntityId',
            key: 'groupEntityId',
            render: (agentId: string) =>
              agents.find((a) => a.id === agentId)?.name || 'N/A',
          },
          {
            title: 'Model',
            dataIndex: 'groupEntityId',
            key: 'model',
            render: (agentId: string) => {
              const agent = agents.find((a) => a.id === agentId);
              const modelId = agent?.model;
              return models.find((m) => m.id === modelId)?.name || 'N/A';
            },
          },
        ]
      : []),
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

  return (
    <div>
      <Table<AgentSession>
        columns={sessionColumns}
        dataSource={sessionList}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        rowSelection={{
          selectedRowKeys: compareIds,
          onChange: (keys) => setCompareIds((keys as string[]).slice(0, 2)),
          getCheckboxProps: (record) => ({
            disabled: compareIds.length >= 2 && !compareIds.includes(record.id),
          }),
        }}
        onRow={(record) => ({
          onClick: () => setSelectedSession(record),
          style: { cursor: 'pointer' },
        })}
      />
      {compareIds.length === 2 && (
        <div className={styles.compareFab}>
          <span className={styles.fabLabel}>
            {sessionList.find((s) => s.id === compareIds[0])?.name} vs{' '}
            {sessionList.find((s) => s.id === compareIds[1])?.name}
          </span>
          <Button
            type="primary"
            shape="round"
            icon={<ScalesIcon />}
            onClick={() => setShowCompare(true)}
          >
            Compare
          </Button>
          <Button shape="round" size="small" onClick={() => setCompareIds([])}>
            Clear
          </Button>
        </div>
      )}
      {showCompare && compareIds.length === 2 && (
        <SessionCompare
          sessionA={sessionList.find((s) => s.id === compareIds[0])!}
          sessionB={sessionList.find((s) => s.id === compareIds[1])!}
          onClose={() => setShowCompare(false)}
        />
      )}
      <SessionAnalytics
        selectedSession={selectedSession}
        setSelectedSession={setSelectedSession}
      />
    </div>
  );
};
