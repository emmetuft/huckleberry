import { FC } from 'react';
import { LightningAIcon } from '@phosphor-icons/react';
import { Tag } from 'antd';
import styles from './Agents.module.css';
import { Agent } from 'models/interfaces/agent';
import { Avatar } from 'components/shared/Avatar/Avatar';

interface AgentCardProps {
  agent: Agent;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const AgentCard: FC<AgentCardProps> = ({ agent }) => {
  const now = Date.now();
  const isNew = now - new Date(agent.created).getTime() < ONE_WEEK_MS;
  const isUpdated = now - new Date(agent.updated).getTime() < ONE_WEEK_MS;

  return (
    <div className="appCard">
      {agent.iconUrl ? (
        <img src={agent.iconUrl} height="100%" width="100%" />
      ) : (
        <div className={styles.agentIcon}>
          <LightningAIcon color="var(--background)" size={18} />
        </div>
      )}
      <div className="appInfo">
        <div className={styles.agentDetails}>
          <h4>{agent.name}</h4>
          {isNew ? (
            <Tag
              style={{
                color: 'var(--purple)',
                backgroundColor: 'var(--purple-light)',
              }}
            >
              New
            </Tag>
          ) : isUpdated ? (
            <Tag>Updated</Tag>
          ) : null}
        </div>
        <p>{agent.description ?? 'No description'}</p>
        <div className={styles.agentDetails}>
          <Avatar
            userId={agent.owner}
            name={agent.ownerDisplayName}
            showName={!!agent.ownerDisplayName}
            height={16}
          />
          <p>{agent.model}</p>
        </div>
      </div>
    </div>
  );
};
