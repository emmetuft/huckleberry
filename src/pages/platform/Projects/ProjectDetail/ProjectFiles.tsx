import { FC, useState } from 'react';
import { Upload } from 'antd';
import type { UploadFile } from 'antd';
import {
  ArrowSquareOutIcon,
  FileIcon,
  FileImageIcon,
  FilePdfIcon,
  FileTextIcon,
  TrashIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react';
import styles from './ProjectDetail.module.css';

const { Dragger } = Upload;

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <FileImageIcon size={18} />;
  if (type === 'application/pdf') return <FilePdfIcon size={18} />;
  if (type.startsWith('text/')) return <FileTextIcon size={18} />;
  return <FileIcon size={18} />;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ProjectFiles: FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const onRemove = (uid: string) => {
    setFiles((prev) => prev.filter((f) => f.uid !== uid));
  };

  return (
    <div className={styles.filesSection}>
      <Dragger
        multiple
        fileList={[]}
        beforeUpload={(file) => {
          setFiles((prev) => [
            ...prev,
            {
              uid: `${file.name}-${Date.now()}`,
              name: file.name,
              size: file.size,
              type: file.type,
              status: 'done',
              originFileObj: file,
            },
          ]);
          return false;
        }}
        className={styles.uploadDragger}
        showUploadList={false}
      >
        <div className={styles.uploadHint}>
          <UploadSimpleIcon size={20} />
          <span>Drop files here or click to upload</span>
        </div>
      </Dragger>

      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((file) => (
            <div key={file.uid} className={styles.fileItem}>
              <span className={styles.fileIcon}>
                {getFileIcon(file.type ?? '')}
              </span>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>
                {formatBytes(file.size ?? 0)}
              </span>
              <button
                className={styles.fileAction}
                onClick={() =>
                  window.open(URL.createObjectURL(file.originFileObj as File))
                }
                title="Open"
              >
                <ArrowSquareOutIcon size={14} />
              </button>
              <button
                className={styles.fileAction}
                onClick={() => onRemove(file.uid)}
                title="Remove"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
