import { FC, useState, useEffect } from 'react';
import { Modal, Select, Input, message } from 'antd';
import styles from './SendModal.module.scss';

const { TextArea } = Input;

interface SendModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (data: SendData) => void;
}

export interface SendData {
  recipient: string;
  channel: CommunicationChannel;
  message: string;
  subject?: string;
}

export enum CommunicationChannel {
  EMAIL = 'email',
  TEAMS = 'teams',
  TEXT = 'text',
  SLACK = 'slack',
}

const channelOptions = [
  { label: 'Email (Outlook)', value: CommunicationChannel.EMAIL },
  { label: 'Microsoft Teams', value: CommunicationChannel.TEAMS },
  { label: 'Text Message', value: CommunicationChannel.TEXT },
  { label: 'Slack', value: CommunicationChannel.SLACK },
];

// TODO: Replace with actual person data from API
const mockPeople = [
  { label: 'Daren Thayne', value: 'daren.thayne@domo.com' },
  { label: 'Adam Landefeld', value: 'adam.landefeld@domo.com' },
  { label: 'John Morgan', value: 'john.morgan@domo.com' },
];

export const SendModal: FC<SendModalProps> = ({
  open,
  onCancel,
  onConfirm,
}) => {
  const [recipient, setRecipient] = useState<string>('');
  const [channel, setChannel] = useState<CommunicationChannel>(
    CommunicationChannel.EMAIL,
  );
  const [subject, setSubject] = useState<string>('');
  const [addedMessage, setAddedMessage] = useState<string>('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setRecipient('');
      setChannel(CommunicationChannel.EMAIL);
      setSubject('');
      setAddedMessage('');
    }
  }, [open]);

  const handleConfirm = () => {
    const data: SendData = {
      recipient,
      channel,
      message: addedMessage,
      ...(channel === CommunicationChannel.EMAIL && { subject }),
    };
    message.success('Email sent!');
    onConfirm(data);
  };

  const handleCancel = () => {
    onCancel();
  };

  const isFormValid =
    recipient && message && (channel !== CommunicationChannel.EMAIL || subject);

  return (
    <Modal
      title="Send Message"
      open={open}
      onOk={handleConfirm}
      onCancel={handleCancel}
      width={600}
      okText="Send"
      okButtonProps={{ disabled: !isFormValid }}
    >
      <div className={styles.modalContent}>
        <div className={styles.formField}>
          <label className={styles.label}>Recipient</label>
          <Select
            placeholder="Select a person"
            value={recipient || undefined}
            onChange={setRecipient}
            options={mockPeople}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            className={styles.select}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Channel</label>
          <Select
            placeholder="Select communication channel"
            value={channel}
            onChange={setChannel}
            options={channelOptions}
            className={styles.select}
          />
        </div>

        {channel === CommunicationChannel.EMAIL && (
          <div className={styles.formField}>
            <label className={styles.label}>Subject</label>
            <Input
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={styles.input}
            />
          </div>
        )}

        <div className={styles.formField}>
          <label className={styles.label}>Message</label>
          <TextArea
            placeholder="Enter your message"
            value={addedMessage}
            onChange={(e) => setAddedMessage(e.target.value)}
            rows={6}
            className={styles.textArea}
          />
        </div>
      </div>
    </Modal>
  );
};
