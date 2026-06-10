import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, Dropdown } from 'antd';
import {
  DotsThreeVerticalIcon,
  LinkSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import styles from './SessionItem.module.css';
import { useAppDispatch } from 'reducers';
import { deleteSession } from 'reducers/chat/actions';
import { AgentSession } from 'models/interfaces/session';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';

interface SessionItemProps {
  session: AgentSession;
  expanded?: boolean;
}

export const SessionItem: FC<SessionItemProps> = ({
  session,
  expanded = true,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onClickSession = (sessionId: string) => {
    navigate(`/sessions/${sessionId}`);
  };

  const onClickDeleteSession = (sessionId: string) => {
    dispatch(deleteSession(sessionId));
  };

  return (
    <div className={styles.sessionItem}>
      <IconBtn
        icon={null}
        label={session.name}
        labelHidden={!expanded}
        onClick={() => onClickSession(session.id)}
      />
      <Dropdown
        menu={{
          items: [
            {
              key: 'copy-link',
              icon: <LinkSimpleIcon size={16} />,
              label: 'Copy link',
              onClick: (e) => {
                e.domEvent.stopPropagation();
                navigator.clipboard.writeText(
                  `${window.location.origin}/sessions/${session.id}`,
                );
                toast.success('Session link copied to clipboard');
              },
            },
            {
              key: 'delete',
              icon: <TrashIcon size={16} />,
              label: 'Delete',
              danger: true,
              onClick: (e) => {
                e.domEvent.stopPropagation();
                onClickDeleteSession(session.id);
              },
            },
          ],
        }}
        trigger={['click']}
      >
        <Button
          type="text"
          size="small"
          className={styles.sessionMenu}
          icon={<DotsThreeVerticalIcon />}
          onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </div>
  );
};
