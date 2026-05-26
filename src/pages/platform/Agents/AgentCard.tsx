import { FC } from 'react';
import { LightningAIcon } from '@phosphor-icons/react';
import styles from './Agents.module.css';
import { Agent } from 'models/interfaces/agent';

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard: FC<AgentCardProps> = ({ agent }) => {
  return (
    <div className="appCard">
      {agent.iconUrl ? (
        <img src={agent.iconUrl} height="100%" width="100%" />
      ) : (
        <div className={styles.agentIcon}>
          <LightningAIcon color="white" size={18} />
        </div>
      )}
      <div className="appInfo">
        <h4>{agent.name}</h4>
        <p>{agent.description}</p>
      </div>
    </div>
  );
};
