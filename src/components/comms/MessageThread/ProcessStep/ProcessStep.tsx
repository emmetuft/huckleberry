import { FC, useState } from 'react';
import { Collapse, Button } from 'antd';
import { CheckCircle, CircleNotch } from 'phosphor-react';
import styles from './ProcessStep.module.scss';
import { StreamStatus } from 'models/enums/stream';
import { ContextStrategyType } from 'models/enums/contextStrategy';
import { ProcessStepWithUI } from 'models/interfaces/processStep';
import { SaveMetricModal } from '../../../modals/SaveMetricModal/SaveMetricModal';
import { StepDetails } from './StepDetails';

interface ProcessStepProps {
  step: ProcessStepWithUI;
  onToggle: (stepId: string) => void;
}

export const ProcessStep: FC<ProcessStepProps> = ({ step, onToggle }) => {
  const { id, title, status, details, isOpen } = step;
  const [showSaveMetricModal, setShowSaveMetricModal] = useState(false);

  const header = (
    <div className={styles.headerContent}>
      <div className={styles.details}>
        {status === StreamStatus.IN_PROGRESS ? (
          <CircleNotch size={16} weight="bold" className={styles.spinner} />
        ) : (
          <CheckCircle size={16} weight="fill" className={styles.check} />
        )}
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.actions}>
        {details?.strategyName === ContextStrategyType.DATASOURCE && (
          <>
            <Button
              style={{ background: 'rgba(255, 255, 255, 0.339)' }}
              size="small"
              onClick={() => setShowSaveMetricModal(true)}
            >
              Save metric
            </Button>
            <SaveMetricModal
              isOpen={showSaveMetricModal}
              onClose={() => setShowSaveMetricModal(false)}
              datasourceId={details.metadata?.datasourceId}
              query={details.metadata?.query}
            />
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.ProcessStep}>
      <Collapse
        bordered={false}
        activeKey={isOpen ? [id] : []}
        items={[
          {
            key: id,
            label: header,
            children: (
              <div className={styles.stepDetails}>
                <StepDetails step={step} />
              </div>
            ),
          },
        ]}
        onChange={() => onToggle(id)}
      />
    </div>
  );
};
