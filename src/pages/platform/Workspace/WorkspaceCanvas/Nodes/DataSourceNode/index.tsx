import { FC, useState } from 'react';
import { NodeProps, Node, useReactFlow } from '@xyflow/react';
import { Button } from 'antd';
import styles from './index.module.css';
import sharedStyles from '../shared.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { DataSource } from 'models/interfaces/dataSource';
import { BrowserModal } from 'components/modals/BrowserModal/BrowserModal';
import { DataSourceBrowser } from 'components/shared/DataSourceBrowser/DataSourceBrowser';

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

export const DataSourceNode: FC<NodeProps<Node<CanvasNode>>> = ({
  id,
  data,
}) => {
  const { updateNodeData } = useReactFlow();
  const [showBrowser, setShowBrowser] = useState(false);
  const nodeData = data.data as DataSourceNodeData | undefined;

  const handleConfirm = (dataSources: DataSource[]) => {
    const ds = dataSources[0];
    if (!ds) return;
    updateNodeData(id, {
      ...data,
      data: {
        name: ds.name,
        sourceId: ds.id,
        sourceType: ds.displayType,
        rowCount: ds.rowCount,
        columnCount: ds.columnCount,
        lastUpdated: ds.lastUpdated,
        columns: [],
        sampleRows: [],
      } satisfies DataSourceNodeData,
    });
    setShowBrowser(false);
  };

  const {
    name,
    sourceId,
    sourceType,
    rowCount,
    columnCount,
    lastUpdated,
    columns,
    sampleRows,
  } = nodeData ?? {};

  return (
    <>
      <NodeWrapper node={data} style={{ width: 320 }}>
        <div className={sharedStyles.container}>
          {nodeData ? (
            <div>
              <h3 className={styles.name}>{name}</h3>
              <p className={styles.sourceId}>{sourceId}</p>
            </div>
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={() => setShowBrowser(true)}
            >
              Connect data source
            </Button>
          )}

          {columns && columns.length > 0 && sampleRows && (
            <>
              <div className={sharedStyles.divider} />
              <div className={styles.tableSection}>
                <p className={sharedStyles.sectionLabel}>Sample data</p>
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
            </>
          )}

          <div className={sharedStyles.divider} />

          <div className={sharedStyles.metadata}>
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>Type</span>
              <span className={sharedStyles.metaValue}>
                {sourceType ?? '—'}
              </span>
            </div>
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>Rows</span>
              <span className={sharedStyles.metaValue}>
                {rowCount != null ? rowCount.toLocaleString() : '—'}
              </span>
            </div>
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>Columns</span>
              <span className={sharedStyles.metaValue}>
                {columnCount ?? '—'}
              </span>
            </div>
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>Updated</span>
              <span className={sharedStyles.metaValue}>
                {lastUpdated ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </NodeWrapper>
      <BrowserModal<DataSource>
        open={showBrowser}
        title="Select a data source"
        itemLabel="datasource"
        onCancel={() => setShowBrowser(false)}
        onConfirm={handleConfirm}
      >
        {(selected, onChange) => (
          <DataSourceBrowser
            selectedDataSources={selected}
            onDataSourcesChange={onChange}
          />
        )}
      </BrowserModal>
    </>
  );
};
