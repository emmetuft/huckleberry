import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'antd';
import { ArrowUpIcon, CircleNotchIcon } from '@phosphor-icons/react';
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
          <CircleNotchIcon
            size={16}
            color="var(--background)"
            style={{ animation: 'spin 1s linear infinite' }}
          />
        ) : (
          <ArrowUpIcon
            color={isEmpty ? 'var(--grey-dark)' : 'var(--background)'}
            size={16}
          />
        )
      }
      style={{
        backgroundColor:
          isEmpty && !requestLoading ? 'transparent' : 'var(--grey-dark)',
        transition: 'background-color 0.3s ease',
      }}
      onClick={onClickSend}
      disabled={requestLoading}
    />
  );
};
