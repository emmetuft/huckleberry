import { FC } from 'react';
import {
  LightningAIcon,
  PencilSimpleIcon,
  RocketLaunchIcon,
} from '@phosphor-icons/react';
import { Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './Agents.module.css';
import { defaultTagStyle, greenTagStyle } from 'constants/styles';
import { Agent } from 'models/interfaces/agent';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { isEmpty } from 'utils/misc';

interface AgentCardProps {
  agent: Agent;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const AgentCard: FC<AgentCardProps> = ({ agent }) => {
  const navigate = useNavigate();
  const now = Date.now();
  const isNew =
    agent.created && now - new Date(agent.created).getTime() < ONE_WEEK_MS;
  const isUpdated =
    agent.updated && now - new Date(agent.updated).getTime() < ONE_WEEK_MS;

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
            <Tag style={greenTagStyle}>New</Tag>
          ) : isUpdated ? (
            <Tag>Updated</Tag>
          ) : null}
        </div>
        <p>
          {isEmpty(agent.description) ? 'No description' : agent.description}
        </p>
        <div className={styles.agentDetails}>
          <Avatar
            userId={agent.owner}
            name={agent.ownerDisplayName}
            showName={!!agent.ownerDisplayName}
            height={16}
          />
          <Tag
            onClick={() => navigate(`/agents/${agent.id}/chat`)}
            style={defaultTagStyle}
          >
            <RocketLaunchIcon />
            Launch
          </Tag>
          <Tag onClick={() => navigate(`/agents/${agent.id}/edit`)}>
            <PencilSimpleIcon />
            Edit
          </Tag>
        </div>
      </div>
    </div>
  );
};
