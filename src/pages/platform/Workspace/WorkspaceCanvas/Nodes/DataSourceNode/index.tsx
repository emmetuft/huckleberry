import { FC } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import styles from './index.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';

export interface DataSourceNodeData {
  name: string;
  sourceId: string;
  sourceType: string;
  rowCount: number;
  columnCount: number;
  lastUpdated: string;
  columns: string[];
  sampleRows: Record<string, string | number>[];
}

export const DataSourceNode: FC<NodeProps<Node<CanvasNode>>> = ({ data }) => {
  const {
    name,
    sourceId,
    sourceType,
    rowCount,
    columnCount,
    lastUpdated,
    columns,
    sampleRows,
  } = data.data as DataSourceNodeData;

  return (
    <NodeWrapper node={data} style={{ width: 320 }}>
      <div className={styles.container}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.sourceId}>{sourceId}</p>

        <div className={styles.divider} />

        <div className={styles.tableSection}>
          <p className={styles.sectionLabel}>Sample data</p>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col} className={styles.th}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row, i) => (
                  <tr key={i} className={styles.tr}>
                    {columns.map((col) => (
                      <td key={col} className={styles.td}>
                        {String(row[col] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Type</span>
            <span className={styles.metaValue}>{sourceType}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Rows</span>
            <span className={styles.metaValue}>
              {rowCount.toLocaleString()}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Columns</span>
            <span className={styles.metaValue}>{columnCount}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Updated</span>
            <span className={styles.metaValue}>{lastUpdated}</span>
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
};
