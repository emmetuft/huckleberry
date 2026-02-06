import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MessageThread.module.scss';
import { useAppDispatch } from 'reducers';
import { selectPage } from 'reducers/app/slice';
import { selectFullScreen, toggleProcessStep } from 'reducers/chat/slice';
import { AppPage } from 'models/enums/appPage';
import { Message } from 'models/interfaces/message';
import { MetricChart } from './MetricChart';
import { ProcessStep } from './ProcessStep/ProcessStep';
import { formatMessageTimestamp } from 'utils/datetime';

interface MessageItemProps {
  message: Message;
  showTimestamp: boolean;
}

export const MessageItem: FC<MessageItemProps> = ({
  message,
  showTimestamp,
}) => {
  const dispatch = useAppDispatch();
  const appPage = useSelector(selectPage);
  const fullScreen = useSelector(selectFullScreen);

  const isFullScreen = appPage === AppPage.HOME && fullScreen;

  const metricNode = useMemo(() => {
    if (message.context && message.context.nodes.length > 0) {
      const metricNode = message.context.nodes.find(
        (node) =>
          node.labels.includes('Metric') &&
          node.properties.vis_type &&
          node.properties.queryData,
      );
      return metricNode;
    }
    return null;
  }, [message.context]);

  const handleToggleStep = (stepId: string) => {
    dispatch(toggleProcessStep({ messageId: message.id, stepId }));
  };

  return (
    <div key={message.id}>
      {showTimestamp && (
        <div className={styles.timestamp}>
          {formatMessageTimestamp(message.timestamp)}
        </div>
      )}
      <div
        className={`${styles.message} ${
          message.role === 'user' ? styles.user : styles.assistant
        }`}
      >
        {message.processingSteps && message.processingSteps.length > 0 && (
          <div className={styles.processingSteps}>
            {message.processingSteps.map((step) => (
              <ProcessStep
                key={step.id}
                step={step}
                onToggle={(stepId) => handleToggleStep(stepId)}
              />
            ))}
          </div>
        )}
        <div className={styles.content}>
          <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
        </div>
        {metricNode && (
          <div className={styles.metricChart}>
            <MetricChart
              visType={metricNode.properties.vis_type}
              data={metricNode.properties.queryData}
              metricName={metricNode.properties.name}
              timeColumn={metricNode.properties.time_column}
              minify={!isFullScreen}
            />
          </div>
        )}
      </div>
    </div>
  );
};
