import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import styles from './CanvasCard.module.css';
import { platformRoutePaths, AppPage } from 'models/enums/appPage';
import { Canvas } from 'models/interfaces/space';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { formatDate, formatMessageTimestamp } from 'utils/datetime';

interface CanvasCardProps {
  canvas: Canvas;
  workspaceId: string;
}

export const CanvasCard: FC<CanvasCardProps> = ({ canvas, workspaceId }) => {
  const navigate = useNavigate();

  const onClick = () => {
    const path = platformRoutePaths[AppPage.WORKSPACE_CANVAS]
      .replace(':workspaceId', workspaceId)
      .replace(':canvasId', canvas.id);
    navigate(path);
  };

  return (
    <div className={`card ${styles.canvasCard}`} onClick={onClick}>
      <div
        className={styles.cardAccent}
        style={{ backgroundColor: 'var(--purple)' }}
      />
      <div className={styles.cardBody}>
        <h4 className={styles.canvasName}>{canvas.intent}</h4>
        <p className={styles.created}>
          Last updated:{' '}
          {canvas.updatedAt
            ? formatMessageTimestamp(canvas.updatedAt)
            : 'Unknown'}
        </p>
        <div className={styles.cardFooter}>
          <Avatar
            userId={canvas.ownerId}
            name={canvas.ownerName}
            showName
            height={20}
          />
        </div>
      </div>
    </div>
  );
};
