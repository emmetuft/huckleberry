import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button } from 'antd';
import { FileIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import styles from './FilesSection.module.css';
import { addFile, selectFilesBySpaceId } from 'reducers/spaces/slice';
import { FileUploadModal } from 'components/modals/FileUploadModal/FileUploadModal';
import { formatMessageTimestamp } from 'utils/datetime';

export const FilesSection: FC = () => {
  const dispatch = useDispatch();
  const { workspaceId = '' } = useParams<{ workspaceId: string }>();
  const files = useSelector(selectFilesBySpaceId(workspaceId));
  const [modalOpen, setModalOpen] = useState(false);

  const handleConfirm = (uploaded: File) => {
    dispatch(
      addFile({
        spaceId: workspaceId,
        file: {
          id: `file-${Date.now()}`,
          name: uploaded.name,
          type: uploaded.type || 'Unknown',
          uploadedBy: 'You',
          uploadedAt: new Date().toLocaleString(),
        },
      }),
    );
    setModalOpen(false);
  };

  return (
    <>
      <div className={styles.filesSection}>
        {files.length === 0 ? (
          <div className={styles.emptyState}>
            <FileIcon size={24} />
            <span>No files yet</span>
          </div>
        ) : (
          files.map((file) => (
            <div key={file.id} className={styles.fileCard}>
              <div className={styles.top}>
                <FileIcon />
                <p className={styles.fileName}>{file.name}</p>
              </div>
              <p className={styles.fileDetails}>
                Uploaded by {file.uploadedBy} ·{' '}
                {formatMessageTimestamp(file.uploadedAt)}
              </p>
            </div>
          ))
        )}
        <Button
          shape="round"
          icon={<UploadSimpleIcon size={13} />}
          onClick={() => setModalOpen(true)}
        >
          Upload
        </Button>
      </div>

      <FileUploadModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};
