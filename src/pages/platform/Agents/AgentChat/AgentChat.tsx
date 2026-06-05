import { FC, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import styles from './AgentChat.module.css';
import { useAppDispatch } from 'reducers';
import { selectAgents } from 'reducers/agents/slice';
import { fetchAgentById } from 'reducers/agents/actions';
import { Chat } from '../Chat/Chat';

export const AgentChat: FC = () => {
  const dispatch = useAppDispatch();
  const agents = useSelector(selectAgents);
  const { agentId } = useParams<{ agentId: string }>();

  const agent = useMemo(() => {
    return agents.find((a) => a.id === agentId) ?? null;
  }, [agents, agentId]);

  useEffect(() => {
    if (!agent && agentId) {
      dispatch(fetchAgentById(agentId));
    }
  }, [agentId]);

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.left}>
        <Chat agent={agent} showHeader />
      </div>
      <div className={styles.right}></div>
    </div>
  );
};
