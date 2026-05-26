import { FC } from 'react';
import { Avatar as AntdAvatar } from 'antd';
import { UserIcon } from '@phosphor-icons/react';
import { getAvatarUrl } from 'utils/misc';
import AppTooltip from '../Tooltip';

interface AvatarProps {
  userId?: number;
  name?: string;
  showName?: boolean;
  height?: number;
}

export const Avatar: FC<AvatarProps> = ({
  userId,
  name,
  showName = false,
  height = 26,
}) => {
  const src = userId ? getAvatarUrl(userId) : '';

  const avatarComp = (
    <AntdAvatar
      size={height}
      style={{
        backgroundColor: 'var(--purple-light)',
        color: 'var(--purple)',
      }}
      {...(src
        ? { src }
        : !name
          ? { icon: <UserIcon size={height - 10} /> }
          : {})}
    >
      {name?.charAt(0)}
    </AntdAvatar>
  );

  return showName ? (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}
    >
      {avatarComp}
      <span>{name}</span>
    </div>
  ) : (
    <AppTooltip title={name}>{avatarComp}</AppTooltip>
  );
};
