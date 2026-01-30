import { FC } from 'react';
import { Collapse } from 'antd';
import { CheckCircle, CircleNotch } from 'phosphor-react';
import styles from './ProcessStep.module.scss';
import { ContextStrategyType } from '../../../../shared/models/enums/contextStrategy';
import { ContextGraph } from './ContextGraph';
import { ProcessStep as ProcessStepType } from 'services/context';
import { StreamStatus } from '../../../../shared/models/enums/stream';

interface ProcessStepProps {
  step: ProcessStepType & { isOpen: boolean };
  onToggle: (stepId: string) => void;
}

export const ProcessStep: FC<ProcessStepProps> = ({ step, onToggle }) => {
  const { id, title, status, details, isOpen } = step;

  const renderDetails = () => {
    if (!details) return null;

    // Show selected strategies
    if (details.selectedStrategies) {
      return (
        <div className={styles.details}>
          <p className={styles.detailsText}>
            Selected strategies: {details.selectedStrategies.join(', ')}
          </p>
        </div>
      );
    }

    // Show graph context for graph-rag strategy
    if (
      details.strategyName === ContextStrategyType.GRAPH_RAG &&
      details.graphContext
    ) {
      return (
        <div className={styles.details}>
          <div className={styles.graphContainer}>
            <ContextGraph context={details.graphContext} minify={true} />
          </div>
        </div>
      );
    }

    // Show metric details for metric strategy
    if (
      details.strategyName === ContextStrategyType.METRIC &&
      details.graphContext
    ) {
      const metricNode = details.graphContext.nodes.find((node) =>
        node.labels.includes('Metric'),
      );

      if (metricNode) {
        const { name, description, time_grain } = metricNode.properties;

        return (
          <div className={styles.details}>
            <div className={styles.metricDetails}>
              <p className={styles.metricName}>{name}</p>
              {description && (
                <p className={styles.metricDescription}>{description}</p>
              )}
              <div className={styles.metricProperties}>
                {time_grain && (
                  <span className={styles.property}>
                    Time grain: {time_grain}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }
    }

    // Show persona details
    if (
      details.strategyName === ContextStrategyType.PERSONA &&
      details.metadata
    ) {
      return (
        <div className={styles.details}>
          <p className={styles.detailsText}>Loaded user persona context</p>
        </div>
      );
    }

    return null;
  };

  const header = (
    <div className={styles.headerContent}>
      {status === StreamStatus.IN_PROGRESS ? (
        <CircleNotch size={16} weight="bold" className={styles.spinner} />
      ) : (
        <CheckCircle size={16} weight="fill" className={styles.check} />
      )}
      <span className={styles.title}>{title}</span>
    </div>
  );

  return (
    <div className={styles.ProcessStep}>
      <Collapse
        activeKey={isOpen ? [id] : []}
        onChange={() => onToggle(id)}
        className={styles.collapse}
        bordered={false}
      >
        <Collapse.Panel header={header} key={id}>
          <div className={styles.content}>{renderDetails()}</div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
