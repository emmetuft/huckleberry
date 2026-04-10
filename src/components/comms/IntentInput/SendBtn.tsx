import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { ArrowUpIcon } from '@phosphor-icons/react';
import { selectLoading } from 'reducers/chat/slice';

interface SendButtonProps {
  isEmpty: boolean;
  onClickSend: () => void;
}

export const SendButton: FC<SendButtonProps> = ({ isEmpty, onClickSend }) => {
  const requestLoading = useSelector(selectLoading);

  return (
    <Button
      type="text"
      icon={
        requestLoading ? (
          <LoadingOutlined style={{ fontSize: 16, color: 'white' }} spin />
        ) : (
          <ArrowUpIcon color={isEmpty ? '#2c2b2a' : 'white'} size={16} />
        )
      }
      style={{
        backgroundColor: isEmpty && !requestLoading ? 'transparent' : '#2c2b2a',
        transition: 'background-color 0.3s ease',
      }}
      onClick={onClickSend}
      disabled={requestLoading}
    />
  );
};
