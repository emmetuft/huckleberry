import { FC } from 'react';
import { Button, Select } from 'antd';
import styles from './Chat.module.css';
import { AgentList } from 'constants/agent';
import { ChatMode } from 'models/enums/chatMode';
import { Agent } from 'models/interfaces/agent';
import { ChatContainer } from 'components/comms/ChatContainer/ChatContainer';
import { PromptBar } from 'components/comms/PromptBar/PromptBar';
import { useIsMobile } from 'hooks/useIsMobile';

interface ChatProps {
  agent: Agent | null;
}

export const Chat: FC<ChatProps> = ({ agent }) => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <PromptBar />
  ) : (
    <div className={styles.chat}>
      <div className={styles.chatHeader}>
        <Select
          variant="borderless"
          value={agent?.id}
          options={AgentList.map((agent) => ({
            label: agent.name,
            value: agent.id,
          }))}
        />
        <Button shape="round">Share chat</Button>
      </div>
      <ChatContainer
        chatMode={isMobile ? ChatMode.modal : ChatMode.panel}
        placeholder={"What's the first domino?"}
      />
    </div>
  );
};
