import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { WarningCircle } from '@phosphor-icons/react';
import styles from './MessageItem.module.css';
import { useAppDispatch } from 'reducers';
import { selectDataSources, toggleProcessStep } from 'reducers/chat/slice';
import { fetchDataSources, resumeStream } from 'reducers/chat/actions';
import { ConversationTurn, TurnType } from 'models/interfaces/message';
import { ElicitationResponse } from 'models/interfaces/userRequest';
import { ConfirmationRequest } from '../Elicitation/ConfirmationRequest';
import { MessageContent } from './MessageContent';
import { ProcessStep } from '../ProcessStep/ProcessStep';
import { formatMessageTimestamp } from 'utils/datetime';
import { getDataSourceIcon } from 'utils/dataSourceIcon';

interface MessageItemProps {
  turn: ConversationTurn;
  showTimestamp: boolean;
}

export const MessageItem: FC<MessageItemProps> = ({ turn, showTimestamp }) => {
  const dispatch = useAppDispatch();
  const dataSourceNameMap = useSelector(selectDataSources);

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

  useEffect(() => {
    if (turn.kind === TurnType.USER && turn.context?.dataSourceIds?.length) {
      dispatch(fetchDataSources(turn.context.dataSourceIds));
    }
  }, [turn]);

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
        {!isUser && turn.error ? (
          <div className={styles.errorMessage}>
            <WarningCircle size={16} weight="fill" />
            {turn.error}
          </div>
        ) : (
          <MessageContent content={turn.content} isUser={isUser} />
        )}
        {isUser &&
          turn.context?.dataSourceIds &&
          turn.context.dataSourceIds.length > 0 && (
            <div className={styles.dataSourcePills}>
              {turn.context.dataSourceIds.map((id) => {
                const DataSourceIcon = getDataSourceIcon(
                  dataSourceNameMap[id]?.type,
                );
                return (
                  <span key={id} className={styles.dataSourcePill}>
                    <DataSourceIcon size={14} />
                    {dataSourceNameMap[id]?.name || id}
                  </span>
                );
              })}
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
