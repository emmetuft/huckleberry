import { FC } from 'react';
import { useSelector } from 'react-redux';
import {
  DatabaseIcon,
  FileIcon,
  ToolboxIcon,
  XIcon,
} from '@phosphor-icons/react';
import { DataSource } from 'models/interfaces/dataSource';
import { selectToolkits } from 'reducers/toolkits/slice';
import styles from './Context.module.css';

interface ContextItemsProps {
  uploadedFiles: File[];
  selectedDataSources: DataSource[];
  selectedToolkitIds: string[];
  onRemoveFile: (fileName: string) => void;
  onRemoveDataSource: (dataSourceId: string) => void;
  onRemoveToolkit: (toolkitId: string) => void;
}

export const ContextItems: FC<ContextItemsProps> = ({
  uploadedFiles,
  selectedDataSources,
  selectedToolkitIds,
  onRemoveFile,
  onRemoveDataSource,
  onRemoveToolkit,
}) => {
  const toolkits = useSelector(selectToolkits);

  if (
    uploadedFiles.length === 0 &&
    selectedDataSources.length === 0 &&
    selectedToolkitIds.length === 0
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
      {selectedToolkitIds.map((id) => {
        const tk = toolkits.find((t) => t.toolkitId === id);
        return (
          <div key={id} className={styles.contextItem}>
            <ToolboxIcon size={14} />
            <span className={styles.contextItemTitle} title={tk?.name ?? id}>
              {tk?.name ?? id}
            </span>
            <button onClick={() => onRemoveToolkit(id)}>
              <XIcon className={styles.closeIcon} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
