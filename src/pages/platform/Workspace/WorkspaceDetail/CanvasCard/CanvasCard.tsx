import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { DotsThreeVerticalIcon, TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import styles from './CanvasCard.module.css';
import { platformRoutePaths, AppPage } from 'models/enums/appPage';
import { Canvas } from 'models/interfaces/space';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { formatMessageTimestamp } from 'utils/datetime';
import { deleteCanvas } from 'reducers/spaces/slice';

interface CanvasCardProps {
  canvas: Canvas;
  workspaceId: string;
}

export const CanvasCard: FC<CanvasCardProps> = ({ canvas, workspaceId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onClick = () => {
    const path = platformRoutePaths[AppPage.WORKSPACE_CANVAS]
      .replace(':workspaceId', workspaceId)
      .replace(':canvasId', canvas.id);
    navigate(path);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'delete',
      label: 'Delete canvas',
      icon: <TrashIcon size={14} />,
      danger: true,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        dispatch(deleteCanvas(canvas.id));
      },
    },
  ];

  return (
    <div className={`card ${styles.canvasCard}`} onClick={onClick}>
      <div
        className={styles.cardAccent}
        style={{ backgroundColor: 'var(--purple)' }}
      />
      <div className={styles.cardBody}>
        <Dropdown
          menu={{ items: menuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <button
            className={styles.menuButton}
            onClick={(e) => e.stopPropagation()}
            aria-label="Canvas options"
          >
            <DotsThreeVerticalIcon size={16} weight="bold" />
          </button>
        </Dropdown>
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
