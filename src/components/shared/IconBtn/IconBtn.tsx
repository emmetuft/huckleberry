import { FC, ReactNode } from 'react';
import { Button } from 'antd';
import styles from './IconBtn.module.css';

interface IconBtnProps {
  icon: ReactNode;
  label?: ReactNode;
  labelHidden?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const IconBtn: FC<IconBtnProps> = ({
  icon,
  label,
  labelHidden = false,
  disabled = false,
  className,
  onClick,
}) => (
  <Button
    type="text"
    icon={icon}
    disabled={disabled}
    onClick={onClick}
    className={`${styles.iconBtn} ${label ? styles.withLabel : ''} ${className ?? ''}`}
  >
    {label && (
      <span
        className={`${styles.label} ${labelHidden ? styles.labelHidden : ''}`}
      >
        {label}
      </span>
    )}
  </Button>
);
