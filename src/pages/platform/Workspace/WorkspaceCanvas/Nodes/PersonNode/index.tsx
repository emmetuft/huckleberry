import { FC, useState } from 'react';
import { NodeProps, Node, useReactFlow } from '@xyflow/react';
import { Button } from 'antd';
import styles from './index.module.css';
import sharedStyles from '../shared.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { User } from 'models/interfaces/mention';
import { BrowserModal } from 'components/modals/BrowserModal/BrowserModal';
import { UserBrowser } from 'components/shared/UserBrowser/UserBrowser';
import { Avatar } from 'components/shared/Avatar/Avatar';

export interface PersonNodeData {
  user: User;
}

export const PersonNode: FC<NodeProps<Node<CanvasNode>>> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [showBrowser, setShowBrowser] = useState(false);
  const nodeData = data.data as PersonNodeData | undefined;

  const handleConfirm = (users: User[]) => {
    const user = users[0];
    if (!user) return;
    updateNodeData(id, {
      ...data,
      data: {
        user,
      } satisfies PersonNodeData,
    });
    setShowBrowser(false);
  };

  const { user } = nodeData ?? {};

  return (
    <>
      <NodeWrapper node={data} style={{ width: 260 }}>
        <div className={sharedStyles.container}>
          <div className={styles.avatarSection}>
            {nodeData && user ? (
              <>
                <Avatar userId={user.id} />
                <div className={styles.identity}>
                  <h3 className={styles.name}>{user.displayName}</h3>
                  <p className={styles.role}>{user.role}</p>
                </div>
              </>
            ) : (
              <Button
                type="primary"
                size="small"
                onClick={() => setShowBrowser(true)}
              >
                Add user
              </Button>
            )}
          </div>

          <div className={sharedStyles.divider} />

          <div className={styles.detail}>
            <span className={styles.detailLabel}>Dept</span>
            <span className={styles.detailValue}>
              {user ? 'Engineering' : '—'}
            </span>
          </div>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>
              {user ? user.email : '—'}
            </span>
          </div>
        </div>
      </NodeWrapper>
      <BrowserModal<User>
        open={showBrowser}
        title="Select a user"
        itemLabel="user"
        onCancel={() => setShowBrowser(false)}
        onConfirm={handleConfirm}
      >
        {(selected, onChange) => (
          <UserBrowser selectedUsers={selected} onUsersChange={onChange} />
        )}
      </BrowserModal>
    </>
  );
};
