import { FC } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Database, File as FileIcon } from 'phosphor-react';
import { sharedIconProps } from 'constants/styles';
import { DataSource } from 'models/interfaces/dataSource';
import styles from './Context.module.scss';

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
          <FileIcon {...sharedIconProps} size={14} />
          <span className={styles.fileName}>{file.name}</span>
          <button onClick={() => onRemoveFile(file.name)}>
            <CloseOutlined className={styles.closeIcon} />
          </button>
        </div>
      ))}
      {selectedDataSources.map((dataSource) => (
        <div key={dataSource.id} className={styles.uploadedFile}>
          <Database {...sharedIconProps} size={14} />
          <span className={styles.fileName}>{dataSource.name}</span>
          <button onClick={() => onRemoveDataSource(dataSource.id)}>
            <CloseOutlined className={styles.closeIcon} />
          </button>
        </div>
      ))}
    </div>
  );
};
