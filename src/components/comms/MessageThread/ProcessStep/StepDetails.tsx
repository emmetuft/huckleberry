import { FC } from 'react';
import styles from './ProcessStep.module.css';
import { ProcessStep } from 'models/interfaces/processStep';
import { Tag } from 'antd';

interface StepDetailsProps {
  step: ProcessStep;
}

export const StepDetails: FC<StepDetailsProps> = ({ step }) => {
  const {
    stepType,
    tool,
    actionType,
    inputs,
    outputs,
    mcpData,
    error,
    description,
  } = step;

  // Error Display (shown for all step types if present)
  const renderError = () => {
    if (!error) return null;
    return (
      <div className={styles.errorSection}>
        <p className={styles.sectionLabel}>Error:</p>
        <div className={styles.errorContent}>
          <p className={styles.errorText}>
            {error.localizedMessage || error.message}
          </p>
          {error.errorCode && (
            <Tag color="red" className={styles.errorCode}>
              {error.errorCode}
            </Tag>
          )}
        </div>
      </div>
    );
  };

  // ACTION Step Details
  const renderActionDetails = () => (
    <>
      {actionType && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Action Type:</p>
          <Tag className={styles.actionTypeTag}>{actionType}</Tag>
        </div>
      )}
      {description && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Description:</p>
          <p className={styles.detailsText}>{description}</p>
        </div>
      )}
      {inputs && Object.keys(inputs).length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Inputs:</p>
          <pre className={styles.codeBlock}>
            <code>{JSON.stringify(inputs, null, 2)}</code>
          </pre>
        </div>
      )}
      {outputs && outputs.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Outputs:</p>
          <pre className={styles.codeBlock}>
            <code>{JSON.stringify(outputs, null, 2)}</code>
          </pre>
        </div>
      )}
    </>
  );

  // TOOL Step Details
  const renderToolDetails = () => (
    <>
      {tool && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Tool:</p>
          <Tag className={styles.toolTag}>{tool}</Tag>
        </div>
      )}
      {inputs && Object.keys(inputs).length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Arguments:</p>
          <pre className={styles.codeBlock}>
            <code>{JSON.stringify(inputs, null, 2)}</code>
          </pre>
        </div>
      )}
      {outputs && outputs.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Response:</p>
          <pre className={styles.codeBlock}>
            <code>{JSON.stringify(outputs[0], null, 2)}</code>
          </pre>
        </div>
      )}
    </>
  );

  // MCP Step Details
  const renderMcpDetails = () => {
    if (!mcpData) return null;

    return (
      <>
        <div className={styles.section}>
          <p className={styles.sectionLabel}>MCP Method:</p>
          <Tag className={styles.mcpMethodTag}>{mcpData.method}</Tag>
          <Tag className={styles.directionTag}>{mcpData.direction}</Tag>
        </div>
        {mcpData.requestPayload && (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Request Payload:</p>
            <pre className={styles.codeBlock}>
              <code>{JSON.stringify(mcpData.requestPayload, null, 2)}</code>
            </pre>
          </div>
        )}
        {mcpData.responsePayload && (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Response Payload:</p>
            <pre className={styles.codeBlock}>
              <code>{JSON.stringify(mcpData.responsePayload, null, 2)}</code>
            </pre>
          </div>
        )}
      </>
    );
  };

  // Main render logic based on step type
  return (
    <div className={styles.stepDetailsContent}>
      {stepType === 'action' && renderActionDetails()}
      {stepType === 'tool' && renderToolDetails()}
      {stepType === 'mcp' && renderMcpDetails()}
      {renderError()}
    </div>
  );
};
