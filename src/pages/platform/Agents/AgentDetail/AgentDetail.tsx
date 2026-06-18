import { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { AgentSession } from 'models/interfaces/session';
import {
  ArrowLeftIcon,
  HeartIcon,
  LightningIcon,
  PlayIcon,
} from '@phosphor-icons/react';
import styles from './AgentDetail.module.css';
import { useAppDispatch } from 'reducers';
import { fetchAgentById, fetchSessions } from 'reducers/agents/actions';
import {
  selectAgents,
  selectAgentSessions,
  selectAIModels,
} from 'reducers/agents/slice';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { SessionAnalytics } from './SessionAnalytics';
import { formatDateTime } from 'utils/datetime';
import { PeopleService } from 'services/people';

export const AgentDetail: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const agents = useSelector(selectAgents);
  const agentSessions = useSelector(selectAgentSessions);
  const models = useSelector(selectAIModels);

  const [ownerName, setOwnerName] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<AgentSession | null>(
    null,
  );

  const { agentId } = useParams<{ agentId: string }>();

  const agent = useMemo(() => {
    const currAgent = agents.find((a) => a.id === agentId) ?? null;
    return currAgent;
  }, [agentId, agents]);

  useEffect(() => {
    if (!agentId) return;
    dispatch(fetchAgentById(agentId));
    dispatch(fetchSessions({ agentId }));
    fetchOwnerName();
  }, [agent]);

  const fetchOwnerName = async () => {
    const ownerId = agent?.createdBy;
    if (ownerId) {
      const user = await PeopleService.getUserById(ownerId.toString());
      setOwnerName(user?.displayName ?? 'Unknown');
    }
  };

  if (!agent) return null;

  const sessionColumns: TableColumnsType<AgentSession> = [
    { title: 'Session name', dataIndex: 'name', key: 'name' },
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
      <Button
        type="text"
        icon={<ArrowLeftIcon />}
        onClick={() => navigate('/agents')}
      >
        Back to Agents
      </Button>
      <div className={styles.agentHeading}>
        <div className={styles.agentIcon}>
          <LightningIcon size={50} color="black" />
        </div>
        <div className={styles.agentInfo}>
          <h2>{agent.name}</h2>
          <p className={styles.description}>
            {agent.description ?? 'No description'}
          </p>
          <div className={styles.actions}>
            <Button
              shape="round"
              type="primary"
              icon={<PlayIcon weight="fill" color="white" />}
              onClick={() => navigate(`/agents/${agentId}/chat`)}
            >
              Run agent
            </Button>
            <div className={styles.sideActions}>
              <Button shape="round" icon={<HeartIcon />}>
                Like
              </Button>
              <Button
                shape="round"
                onClick={() => navigate(`/agents/${agentId}/edit`)}
              >
                Edit info
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.agentMetadata}>
        <div className={styles.dataItem}>
          <p className={styles.label}>Created by</p>
          <Avatar userId={agent.createdBy} name={ownerName} showName />
        </div>
        <div className={styles.dataItem}>
          <p className={styles.label}>Model</p>
          <p>
            {models.find((model) => model.id === agent.model)?.name ??
              'Default'}
          </p>
        </div>
      </div>
      <Table<AgentSession>
        columns={sessionColumns}
        dataSource={agentSessions}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => setSelectedSession(record),
          style: { cursor: 'pointer' },
        })}
      />
      <SessionAnalytics
        selectedSession={selectedSession}
        setSelectedSession={setSelectedSession}
      />
    </div>
  );
};
