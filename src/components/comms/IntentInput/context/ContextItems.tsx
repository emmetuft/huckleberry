import { FC } from 'react';
import { DatabaseIcon, FileIcon, XIcon } from '@phosphor-icons/react';
import { DataSource } from 'models/interfaces/dataSource';
import styles from './Context.module.css';

interface ContextItemsProps {
  uploadedFiles: File[];
  selectedDataSources: DataSource[];
  onRemoveFile: (fileName: string) => void;
  onRemoveDataSource: (dataSourceId: string) => void;
}

export const ContextItems: FC<ContextItemsProps> = ({
  uploadedFiles,
  selectedDataSources,
  onRemoveFile,
  onRemoveDataSource,
}) => {
  if (uploadedFiles.length === 0 && selectedDataSources.length === 0) {
    return null;
  }

  return (
    <div className={styles.contextItems}>
      {uploadedFiles.map((file) => (
        <div key={file.name} className={styles.uploadedFile}>
          <FileIcon size={14} />
          <span className={styles.fileName}>{file.name}</span>
          <button onClick={() => onRemoveFile(file.name)}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
      ))}
      {selectedDataSources.map((dataSource) => (
        <div key={dataSource.id} className={styles.uploadedFile}>
          <DatabaseIcon size={14} />
          <span className={styles.fileName}>{dataSource.name}</span>
          <button onClick={() => onRemoveDataSource(dataSource.id)}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
      ))}
    </div>
  );
};
