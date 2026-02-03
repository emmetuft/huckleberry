import { FC, useState } from 'react';
import { Collapse, Button, Tag } from 'antd';
import { CheckCircle, CircleNotch, Warning } from 'phosphor-react';
import styles from './ProcessStep.module.scss';
import { ContextStrategyType } from '../../../../shared/models/enums/contextStrategy';
import { StreamStatus } from '../../../../shared/models/enums/stream';
import { ContextGraph } from './ContextGraph';
import {
  ProcessStep as ProcessStepType,
  ToolExecution,
} from 'services/context';
import { SaveMetricModal } from '../../SaveMetricModal/SaveMetricModal';

interface ProcessStepProps {
  step: ProcessStepType & { isOpen: boolean };
  onToggle: (stepId: string) => void;
}

export const ProcessStep: FC<ProcessStepProps> = ({ step, onToggle }) => {
  const { id, title, status, details, isOpen } = step;
  const [showSaveMetricModal, setShowSaveMetricModal] = useState(false);
  console.log('[ProcessStep] renderDetails for step:', id, 'details:', details);

  const renderDetails = () => {
    if (!details) return null;

    // Show selected strategies
    if (details.selectedStrategies) {
      const strategyText =
        details.selectedStrategies.length > 0
          ? details.selectedStrategies.join(', ')
          : 'using provided context';
      return (
        <div className={styles.details}>
          <p className={styles.detailsText}>
            Context strategies: {strategyText}
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

    // Show datasource query details
    if (details.datasourceId && details.query) {
      return (
        <div className={styles.details}>
          <div className={styles.datasourceDetails}>
            <div className={styles.querySection}>
              <p className={styles.sectionLabel}>Generated SQL Query:</p>
              <pre className={styles.sqlQuery}>
                <code>{details.query}</code>
              </pre>
            </div>
            <span className={styles.property}>
              Results: {details.resultCount} rows
            </span>
          </div>
        </div>
      );
    }

    // Show MCP tool executions
    if (
      (details.strategyName === ContextStrategyType.MCP_TOOL ||
        details.strategyName === 'mcp-tool') &&
      details.toolExecutions &&
      details.toolExecutions.length > 0
    ) {
      return (
        <div className={styles.details}>
          <div className={styles.toolExecutions}>
            {details.toolExecutions.map(
              (tool: ToolExecution, index: number) => (
                <div
                  key={`${tool.serverId}-${tool.name}-${index}`}
                  className={styles.toolExecution}
                >
                  <div className={styles.toolHeader}>
                    <div className={styles.toolStatus}>
                      {tool.status === 'running' && (
                        <CircleNotch
                          size={14}
                          weight="bold"
                          className={styles.spinner}
                        />
                      )}
                      {tool.status === 'success' && (
                        <CheckCircle
                          size={14}
                          weight="fill"
                          className={styles.checkSmall}
                        />
                      )}
                      {tool.status === 'error' && (
                        <Warning
                          size={14}
                          weight="fill"
                          className={styles.errorIcon}
                        />
                      )}
                    </div>
                    <span className={styles.toolName}>{tool.name}</span>
                    {tool.serverName && (
                      <Tag className={styles.serverTag}>{tool.serverName}</Tag>
                    )}
                    {tool.executionTime !== undefined && (
                      <span className={styles.executionTime}>
                        {tool.executionTime}ms
                      </span>
                    )}
                  </div>
                  {tool.params && Object.keys(tool.params).length > 0 && (
                    <div className={styles.toolParams}>
                      <p className={styles.sectionLabel}>Parameters:</p>
                      <pre className={styles.paramsCode}>
                        <code>{JSON.stringify(tool.params, null, 2)}</code>
                      </pre>
                    </div>
                  )}
                  {tool.error && (
                    <div className={styles.toolError}>
                      <p className={styles.errorText}>{tool.error}</p>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      );
    }

    return null;
  };

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
        {details?.datasourceId && details?.query && (
          <Button
            // type="primary"
            style={{ background: 'rgba(255, 255, 255, 0.339)' }}
            size="small"
            onClick={() => setShowSaveMetricModal(true)}
          >
            Catalog metric
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.ProcessStep}>
      <Collapse
        activeKey={isOpen ? [id] : []}
        onChange={() => onToggle(id)}
        className={styles.collapse}
        bordered={false}
        items={[
          {
            key: id,
            label: header,
            children: <div className={styles.content}>{renderDetails()}</div>,
          },
        ]}
      />
      {details?.datasourceId && details?.query && (
        <SaveMetricModal
          isOpen={showSaveMetricModal}
          onClose={() => setShowSaveMetricModal(false)}
          datasourceId={details.datasourceId}
          query={details.query}
        />
      )}
    </div>
  );
};
