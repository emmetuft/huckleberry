import { FC, useState } from 'react';
import { Collapse, Tag } from 'antd';
import { CheckCircle, CircleNotch, XCircle, Pause, Play } from 'phosphor-react';
import styles from './ProcessStep.module.css';
import {
  ProcessStepStatus,
  ProcessStepWithUI,
} from 'models/interfaces/processStep';
import { StepDetails } from './StepDetails';

interface ProcessStepProps {
  step: ProcessStepWithUI;
  onToggle: (stepId: string) => void;
}

export const ProcessStep: FC<ProcessStepProps> = ({ step, onToggle }) => {
  const { id, title, status, isOpen, durationMs, stepType } = step;

  const [openSubSteps, setOpenSubSteps] = useState<Set<string>>(
    () => new Set(step.subSteps?.map((s) => s.id) ?? []),
  );

  const handleToggleSubStep = (subStepId: string) => {
    setOpenSubSteps((prev) => {
      const next = new Set(prev);
      if (next.has(subStepId)) next.delete(subStepId);
      else next.add(subStepId);
      return next;
    });
  };

  // TODO: Show "Save Metric" button when it makes sense
  /** 
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
  **/

  const getStatusIcon = () => {
    switch (status) {
      case ProcessStepStatus.STARTED:
      case ProcessStepStatus.IN_PROGRESS:
        return (
          <CircleNotch size={16} weight="bold" className={styles.spinner} />
        );
      case ProcessStepStatus.COMPLETED:
        return <CheckCircle size={16} weight="fill" className={styles.check} />;
      case ProcessStepStatus.FAILED:
        return <XCircle size={16} weight="fill" className={styles.error} />;
      case ProcessStepStatus.PAUSED:
        return <Pause size={16} weight="fill" className={styles.paused} />;
      case ProcessStepStatus.RESUMED:
        return <Play size={16} weight="fill" className={styles.resumed} />;
      default:
        return (
          <CircleNotch size={16} weight="bold" className={styles.spinner} />
        );
    }
  };

  const header = (
    <div className={styles.headerContent}>
      <div className={styles.details}>
        {getStatusIcon()}
        <span className={styles.title}>{title}</span>
        <Tag className={styles.stepTypeTag}>{stepType}</Tag>
        {durationMs && <span className={styles.duration}>{durationMs}ms</span>}
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
                {step.subSteps && step.subSteps.length > 0 && (
                  <div className={styles.subSteps}>
                    {step.subSteps.map((subStep) => (
                      <ProcessStep
                        key={subStep.id}
                        step={{
                          ...subStep,
                          isOpen: openSubSteps.has(subStep.id),
                        }}
                        onToggle={handleToggleSubStep}
                      />
                    ))}
                  </div>
                )}
              </div>
            ),
          },
        ]}
        onChange={() => onToggle(id)}
      />
    </div>
  );
};
