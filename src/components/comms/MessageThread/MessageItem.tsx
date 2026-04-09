import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MessageThread.module.css';
import { useAppDispatch } from 'reducers';
import { selectPage } from 'reducers/app/slice';
import { selectFullScreen, toggleProcessStep } from 'reducers/chat/slice';
import { resumeStream } from 'reducers/chat/actions';
import { AppPage } from 'models/enums/appPage';
import { ConversationTurn, TurnType } from 'models/interfaces/message';
import { ElicitationResponse } from 'models/interfaces/userRequest';
import { ConfirmationRequest } from './Elicitation/ConfirmationRequest';
import { MetricChart } from './MetricChart';
import { ProcessStep } from './ProcessStep/ProcessStep';
import { formatMessageTimestamp } from 'utils/datetime';

interface MessageItemProps {
  turn: ConversationTurn;
  showTimestamp: boolean;
}

export const MessageItem: FC<MessageItemProps> = ({ turn, showTimestamp }) => {
  const dispatch = useAppDispatch();
  const appPage = useSelector(selectPage);
  const fullScreen = useSelector(selectFullScreen);

  const isFullScreen = appPage === AppPage.HOME && fullScreen;

  // const metricNode = useMemo(() => {
  //   if (turn.kind !== 'user') return null;
  //   if (!turn.context?.nodes?.length) return null;
  //   return (
  //     turn.context.nodes.find(
  //       (node) =>
  //         node.labels.includes('Metric') &&
  //         node.properties.vis_type &&
  //         node.properties.queryData,
  //     ) ?? null
  //   );
  // }, [turn]);

  const handleToggleStep = (stepId: string) => {
    dispatch(toggleProcessStep({ turnId: turn.id, stepId }));
  };

  const handleElicitationResponse = (responses: ElicitationResponse[]) => {
    if (turn.kind !== 'assistant') return;
    const batchId = turn.confirmationRequests?.[0].batchId;
    const requestId = turn.requestId;
    if (!batchId || !requestId) return;
    dispatch(resumeStream({ batchId, requestId, responses }));
  };

  const isUser = turn.kind === TurnType.USER;

  return (
    <div key={turn.id}>
      {showTimestamp && (
        <div className={styles.timestamp}>
          {formatMessageTimestamp(turn.timestamp)}
        </div>
      )}
      <div
        className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}
      >
        {!isUser && turn.processingSteps.length > 0 && (
          <div className={styles.processingSteps}>
            {turn.processingSteps.map((step) => (
              <ProcessStep
                key={step.id}
                step={step}
                onToggle={(stepId) => handleToggleStep(stepId)}
              />
            ))}
          </div>
        )}
        {!isUser &&
          turn.confirmationRequests &&
          turn.confirmationRequests.length > 0 && (
            <ConfirmationRequest
              confirmationRequests={turn.confirmationRequests}
              onSubmit={handleElicitationResponse}
            />
          )}
        <div className={styles.content}>
          <Markdown remarkPlugins={[remarkGfm]}>{turn.content}</Markdown>
        </div>
        {isUser &&
          turn.context?.dataSourceIds &&
          turn.context.dataSourceIds.length > 0 && (
            <div className={styles.dataSourcePills}>
              {turn.context.dataSourceIds.map((id) => (
                <span key={id} className={styles.dataSourcePill}>
                  {id}
                </span>
              ))}
            </div>
          )}
        {/* {metricNode && (
          <div className={styles.metricChart}>
            <MetricChart
              visType={metricNode.properties.vis_type}
              data={metricNode.properties.queryData}
              metricName={metricNode.properties.name}
              timeColumn={metricNode.properties.time_column}
              minify={!isFullScreen}
            />
          </div>
        )} */}
      </div>
    </div>
  );
};
