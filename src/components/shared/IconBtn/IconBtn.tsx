import { FC, ReactNode } from 'react';
import { Button } from 'antd';
import styles from './IconBtn.module.css';

interface IconBtnProps {
  icon: ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const IconBtn: FC<IconBtnProps> = ({
  icon,
  disabled = false,
  onClick,
}) => (
  <Button
    type="text"
    icon={icon}
    disabled={disabled}
    onClick={onClick}
    className={styles.iconBtn}
  />
);
