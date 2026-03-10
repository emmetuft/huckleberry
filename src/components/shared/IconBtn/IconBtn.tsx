import { FC, ReactNode } from 'react';
import { Button } from 'antd';

interface IconBtnProps {
  icon: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const IconBtn: FC<IconBtnProps> = ({ icon, onClick }) => (
  <Button type="text" icon={icon} onClick={onClick} />
);
