import { FC } from 'react';
import styles from './ProcessStep.module.scss';
import { ContextStrategyType } from 'models/enums/contextStrategy';
import { StepType } from 'models/enums/stepType';
import { ProcessStep } from 'models/interfaces/processStep';
import { ContextGraph } from '../ContextGraph';
import { isEmpty } from 'utils/misc';
import { Tag } from 'antd';

interface StepDetailsProps {
  step: ProcessStep;
}

export const StepDetails: FC<StepDetailsProps> = ({ step }) => {
  const { id, details } = step;

  if (details === undefined) return null;

  // ANALYZE REQUEST
  if (id === StepType.ANALYZE_REQUEST) {
    const strategyText = isEmpty(details.strategyName)
      ? 'using provided context'
      : details.strategyName;
    return (
      <p className={styles.detailsText}>Context strategies: {strategyText}</p>
    );
  }

  // USER PERSONA
  if (
    details.strategyName === ContextStrategyType.PERSONA &&
    details.metadata
  ) {
    return <p className={styles.detailsText}>Loaded user persona context</p>;
  }

  // GRAPH RAG
  if (
    details.strategyName === ContextStrategyType.GRAPH_RAG &&
    details.graphContext
  ) {
    return (
      <div className={styles.graphContainer}>
        <ContextGraph context={details.graphContext} minify={true} />
      </div>
    );
  }

  // METRIC CATALOG
  if (
    details.strategyName === ContextStrategyType.METRIC &&
    details.graphContext
  ) {
    const metricNode = details.graphContext.nodes.find((node) =>
      node.labels.includes('Metric'),
    );

    if (metricNode) {
      const { name, description, time_grain, time_type } =
        metricNode.properties;

      return (
        <>
          <p className={styles.metricName}>{name}</p>
          {description && <p className={styles.detailsText}>{description}</p>}
          <div className={styles.metricProperties}>
            {time_grain && (
              <span className={styles.property}>Time grain: {time_grain}</span>
            )}
            {time_type && (
              <span className={styles.property}>Metric type: {time_type}</span>
            )}
          </div>
        </>
      );
    }
  }

  // DATASOURCE
  if (
    details.strategyName === ContextStrategyType.DATASOURCE &&
    details.metadata
  ) {
    return (
      <>
        <p className={styles.sectionLabel}>Generated SQL Query:</p>
        <pre className={styles.codeBlock}>
          <code>{details.metadata.query}</code>
        </pre>
      </>
    );
  }

  // MCP TOOLS
  if (
    details.strategyName === ContextStrategyType.MCP_TOOL &&
    details.toolExecution
  ) {
    const tool = details.toolExecution;
    return (
      <>
        <div className={styles.toolHeader}>
          {tool.serverName && (
            <Tag className={styles.serverTag}>{tool.serverName}</Tag>
          )}
          {tool.executionTime && (
            <span className={styles.executionTime}>
              Execution time: {tool.executionTime}ms
            </span>
          )}
        </div>
        {tool.params && Object.keys(tool.params).length > 0 && (
          <pre className={styles.codeBlock}>
            <code>{JSON.stringify(tool.params, null, 2)}</code>
          </pre>
        )}
        {tool.error && (
          <div className={styles.toolError}>
            <p className={styles.errorText}>{tool.error}</p>
          </div>
        )}
      </>
    );
  }

  return null;
};
