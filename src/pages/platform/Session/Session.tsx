import { FC, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Select } from 'antd';
import styles from './Session.module.css';
import { useAppDispatch } from 'reducers';
import { fetchSession } from 'reducers/chat/actions';
import {
  selectSessionId,
  selectAgentId,
  setAgentId,
  clearMessages,
} from 'reducers/chat/slice';
import { selectAgents } from 'reducers/agents/slice';
import { ChatMode } from 'models/enums/chatMode';
import { ChatContainer } from 'components/comms/ChatContainer/ChatContainer';

export const Session: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sessionId } = useParams<{ sessionId: string }>();
  const prevSessionIdRef = useRef<string | undefined>(undefined);
  const chatSessionId = useSelector(selectSessionId);
  const chatSessionIdRef = useRef(chatSessionId);
  chatSessionIdRef.current = chatSessionId;
  const agentId = useSelector(selectAgentId);
  const agents = useSelector(selectAgents);
  const agent = agents.find((a) => a.id === agentId) ?? null;

  const queryAgentId = searchParams.get('agentId');
  const pendingNavigate = useRef(false);

  // New session entry: initialize Redux with the agent from query param
  useEffect(() => {
    if (!sessionId && queryAgentId) {
      dispatch(clearMessages());
      dispatch(setAgentId(queryAgentId));
      pendingNavigate.current = true;
    }
  }, [queryAgentId]);

  // Once the first message creates a session, update the URL to the real session path
  useEffect(() => {
    if (chatSessionId && pendingNavigate.current) {
      pendingNavigate.current = false;
      navigate(`/sessions/${chatSessionId}`, { replace: true });
    }
  }, [chatSessionId, navigate]);

  // Load existing session by ID
  useEffect(() => {
    if (sessionId && sessionId !== prevSessionIdRef.current) {
      prevSessionIdRef.current = sessionId;
      if (sessionId !== chatSessionIdRef.current) {
        dispatch(fetchSession(sessionId));
      }
    }
  }, [sessionId]);

  return (
    <div className={styles.sessionWrapper}>
      <div className={styles.left}>
        {agent && (
          <div className={styles.chatHeader}>
            <Select
              variant="borderless"
              value={agent.id}
              options={agents.map((a) => ({ label: a.name, value: a.id }))}
            />
            <Button shape="round">Share chat</Button>
          </div>
        )}
        <ChatContainer chatMode={ChatMode.panel} placeholder="Ask anything" />
      </div>
      <div className={styles.right} />
    </div>
  );
};
