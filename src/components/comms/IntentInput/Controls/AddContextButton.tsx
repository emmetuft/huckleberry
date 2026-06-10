import { FC } from 'react';
import { Dropdown, Upload, message } from 'antd';
import type { MenuProps, UploadProps } from 'antd';
import {
  PlusIcon,
  UploadSimpleIcon,
  DatabaseIcon,
} from '@phosphor-icons/react';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { formatFileSize, MAX_FILE_SIZE } from 'utils/file';

interface AddContextButtonProps {
  onFileUpload?: (file: File) => void;
  onDataSourceClick?: () => void;
}

export const AddContextButton: FC<AddContextButtonProps> = ({
  onFileUpload,
  onDataSourceClick,
}) => {
  const validateFile = (file: File): boolean | Promise<boolean> => {
    // Check file type
    if (file.type !== 'application/pdf') {
      message.error('Only PDF files are allowed');
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      message.error(
        `File "${file.name}" exceeds maximum size of ${formatFileSize(MAX_FILE_SIZE)}`,
      );
      return false;
    }

    return true;
  };

  const handleFileUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      if (file instanceof File) {
        onFileUpload?.(file);
        onSuccess?.(file);
      }
    } catch (error) {
      message.error('File upload failed');
      onError?.(error as Error);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'upload-file',
      label: (
        <Upload
          beforeUpload={validateFile}
          customRequest={handleFileUpload}
          showUploadList={false}
          accept=".pdf,application/pdf"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
            }}
          >
            <UploadSimpleIcon size={16} />
            <span>Upload PDF</span>
          </div>
        </Upload>
      ),
    },
    {
      key: 'connect-datasource',
      label: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}
          onClick={onDataSourceClick}
        >
          <DatabaseIcon size={16} />
          <span>Connect Datasource</span>
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomLeft"
    >
      <div>
        <IconBtn icon={<PlusIcon size={16} />} />
      </div>
    </Dropdown>
  );
};
