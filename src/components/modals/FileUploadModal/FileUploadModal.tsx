import { FC, useRef, useState, DragEvent, useEffect } from 'react';
import { Modal } from 'antd';
import { FileIcon, UploadSimpleIcon, XIcon } from '@phosphor-icons/react';
import styles from './FileUploadModal.module.css';

interface FileUploadModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const FileUploadModal: FC<FileUploadModalProps> = ({
  open,
  onCancel,
  onConfirm,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setFile(null);
  }, [open]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleInputChange = () => {
    const selected = inputRef.current?.files?.[0];
    if (selected) setFile(selected);
  };

  return (
    <Modal
      title="Upload file"
      open={open}
      onOk={() => file && onConfirm(file)}
      onCancel={onCancel}
      width={520}
      okText="Upload"
      okButtonProps={{ disabled: !file }}
    >
      <div className={styles.modalContent}>
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <UploadSimpleIcon size={32} />
          <div className={styles.dropText}>
            <span className={styles.dropPrimary}>
              Drag and drop a file here
            </span>
            <span className={styles.dropSecondary}>
              or <span className={styles.browseLink}>browse your computer</span>
            </span>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        {file && (
          <>
            <div className={styles.divider}>Selected file</div>
            <div className={styles.selectedFile}>
              <FileIcon size={20} className={styles.fileIcon} />
              <div className={styles.fileMeta}>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{formatBytes(file.size)}</p>
              </div>
              <button
                className={styles.removeButton}
                onClick={() => setFile(null)}
                aria-label="Remove file"
              >
                <XIcon size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
