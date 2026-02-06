import { FC, useState, useEffect } from 'react';
import { Modal, Input, Form, message } from 'antd';
import styles from './SaveMetricModal.module.scss';

const { TextArea } = Input;

interface SaveMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasourceId: string;
  query: string;
}

export const SaveMetricModal: FC<SaveMetricModalProps> = ({
  isOpen,
  onClose,
  datasourceId,
  query,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({ query });
    }
  }, [isOpen, query, form]);

  const onOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // TODO: Implement API call to save metric
      // await MetricService.saveMetric({
      //   name: values.name,
      //   description: values.description,
      //   datasourceId,
      //   query: values.query,
      // });

      message.success('Metric saved successfully!');
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Failed to save metric:', error);
      message.error('Failed to save metric. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Save as Metric"
      open={isOpen}
      okText="Save"
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
    >
      <div className={styles.modalContent}>
        <p className={styles.description}>
          Save this query as a reusable metric that can be accessed in future
          requests.
        </p>
        <Form form={form} layout="vertical">
          <Form.Item
            label="Metric Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter a metric name' },
              { max: 100, message: 'Name must be 100 characters or less' },
            ]}
          >
            <Input placeholder="e.g., Total Revenue, Active Users" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: 'Please enter a description' },
              {
                max: 500,
                message: 'Description must be 500 characters or less',
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Describe what this metric measures and when to use it"
            />
          </Form.Item>
          <Form.Item
            label="SQL Query"
            name="query"
            rules={[{ required: true, message: 'Please enter a SQL query' }]}
          >
            <TextArea
              rows={8}
              placeholder="Enter your SQL query"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
