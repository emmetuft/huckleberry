import { FC, ReactNode } from 'react';
import { Button } from 'antd';
import styles from './IconBtn.module.scss';

interface IconBtnProps {
  icon: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const IconBtn: FC<IconBtnProps> = ({ icon, onClick }) => (
  <Button shape="circle" type="text" icon={icon} onClick={onClick} />
);
