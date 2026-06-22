import { FC } from 'react';
import {
  DatabaseIcon,
  FileIcon,
  ToolboxIcon,
  XIcon,
} from '@phosphor-icons/react';
import styles from './Context.module.css';
import { DataSource } from 'models/interfaces/dataSource';
import { Toolkit } from 'models/interfaces/toolkit';

interface ContextItemsProps {
  uploadedFiles: File[];
  selectedDataSources: DataSource[];
  selectedToolkits: Toolkit[];
  onRemoveFile: (fileName: string) => void;
  onRemoveDataSource: (dataSourceId: string) => void;
  onRemoveToolkit: (toolkitId: string) => void;
}

export const ContextItems: FC<ContextItemsProps> = ({
  uploadedFiles,
  selectedDataSources,
  selectedToolkits,
  onRemoveFile,
  onRemoveDataSource,
  onRemoveToolkit,
}) => {
  if (
    uploadedFiles.length === 0 &&
    selectedDataSources.length === 0 &&
    selectedToolkits.length === 0
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
      {selectedToolkits.map((tk) => (
        <div key={tk.toolkitId} className={styles.contextItem}>
          <ToolboxIcon size={14} />
          <span className={styles.contextItemTitle} title={tk.name}>
            {tk.name}
          </span>
          <button onClick={() => onRemoveToolkit(tk.toolkitId)}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
      ))}
    </div>
  );
};
