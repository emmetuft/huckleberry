import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'antd';
import { HeartIcon, LightningIcon, PlayIcon } from '@phosphor-icons/react';
import styles from './AgentDetail.module.css';
import { selectAgents, selectAIModels } from 'reducers/agents/slice';

export const AgentDetail: FC = () => {
  const navigate = useNavigate();
  const agents = useSelector(selectAgents);
  const models = useSelector(selectAIModels);

  const { agentId } = useParams<{ agentId: string }>();

  const agent = useMemo(() => {
    const currAgent = agents.find((a) => a.id === agentId) ?? null;
    return currAgent;
  }, [agentId]);

  if (!agent) return null;

  return (
    <div>
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
          <p>{agent.createdBy}</p>
        </div>
        <div className={styles.dataItem}>
          <p className={styles.label}>Model</p>
          <p>
            {models.find((model) => model.id === agent.model)?.name ??
              'Unknown model'}
          </p>
        </div>
      </div>
    </div>
  );
};
