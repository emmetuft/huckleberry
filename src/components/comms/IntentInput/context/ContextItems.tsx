import { FC } from 'react';
import {
  DatabaseIcon,
  FileIcon,
  WrenchIcon,
  XIcon,
} from '@phosphor-icons/react';
import { DataSource } from 'models/interfaces/dataSource';
import styles from './Context.module.css';
import { Tool } from 'models/interfaces/toolkit';

interface ContextItemsProps {
  uploadedFiles: File[];
  selectedDataSources: DataSource[];
  selectedTools: Tool[];
  onRemoveFile: (fileName: string) => void;
  onRemoveDataSource: (dataSourceId: string) => void;
  onRemoveTool: (tool: Tool) => void;
}

export const ContextItems: FC<ContextItemsProps> = ({
  uploadedFiles,
  selectedDataSources,
  selectedTools,
  onRemoveFile,
  onRemoveDataSource,
  onRemoveTool,
}) => {
  if (
    uploadedFiles.length === 0 &&
    selectedDataSources.length === 0 &&
    selectedTools.length === 0
  ) {
    return null;
  }

  return (
    <div className={styles.contextItems}>
      {uploadedFiles.map((file) => (
        <div key={file.name} className={styles.contextItem}>
          <FileIcon size={14} />
          <span className={styles.contextItemTitle} title={file.name}>
            {file.name}
          </span>
          <button onClick={() => onRemoveFile(file.name)}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
      ))}
      {selectedDataSources.map((dataSource) => (
        <div key={dataSource.id} className={styles.contextItem}>
          <DatabaseIcon size={14} />
          <span className={styles.contextItemTitle} title={dataSource.name}>
            {dataSource.name}
          </span>
          <button onClick={() => onRemoveDataSource(dataSource.id)}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
      ))}
      {selectedTools.map((tool) => (
        <div key={tool.toolId} className={styles.contextItem}>
          <WrenchIcon size={14} />
          <span
            className={styles.contextItemTitle}
            title={tool.overrideToolName}
          >
            {tool.overrideToolName}
          </span>
          <button onClick={() => onRemoveTool(tool)}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
      ))}
    </div>
  );
};
