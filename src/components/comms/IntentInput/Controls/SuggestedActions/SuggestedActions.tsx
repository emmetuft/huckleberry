import { FC, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from 'antd';
import {
  CalendarBlankIcon,
  ChartLineIcon,
  DatabaseIcon,
  PaperPlaneTiltIcon,
} from '@phosphor-icons/react';
import { SendData, SendModal } from 'components/modals/SendModal/SendModal';
import { ActionType } from 'utils/temp';

interface SuggestedActionsProps {
  suggestedActions: { type: ActionType; text: string }[];
  handleDataSourceClick: () => void;
}

export const SuggestedActions: FC<SuggestedActionsProps> = ({
  suggestedActions,
  handleDataSourceClick,
}) => {
  const [showSendModal, setShowSendModal] = useState<boolean>(false);

  const handleSendModalConfirm = (data: SendData) => {
    // TODO: Handle sending the message
    console.log('Send data:', data);
    setShowSendModal(false);
  };

  const handleSendModalCancel = () => {
    setShowSendModal(false);
  };

  const onClickAction = (action: { type: ActionType; text: string }) => {
    switch (action.type) {
      case ActionType.DATASET:
        handleDataSourceClick();
        break;
      case ActionType.SEND:
        setShowSendModal(true);
        break;
      default:
        break;
    }
  };

  const actionIconMap = {
    [ActionType.SCHEDULE]: <CalendarBlankIcon size={16} />,
    [ActionType.CHART]: <ChartLineIcon size={16} />,
    [ActionType.DATASET]: <DatabaseIcon size={16} />,
    [ActionType.SEND]: <PaperPlaneTiltIcon size={16} />,
  };

  return (
    <>
      <AnimatePresence>
        {suggestedActions.map((action) => (
          <motion.div
            key={action.type}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              type="text"
              icon={actionIconMap[action.type]}
              onClick={() => onClickAction(action)}
            >
              {action.text}
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
      <SendModal
        open={showSendModal}
        onCancel={handleSendModalCancel}
        onConfirm={handleSendModalConfirm}
      />
    </>
  );
};
