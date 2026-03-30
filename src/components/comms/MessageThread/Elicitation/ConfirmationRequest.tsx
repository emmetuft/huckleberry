import { FC, useState } from 'react';
import { Button, Form, Card, Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import { Check, X } from 'phosphor-react';
import styles from './ConfirmationRequest.module.css';
import { ConfirmationRequest as SessionConfirmationRequest } from 'models/interfaces/sessionEvent';
import {
  ElicitationAction,
  ElicitationResponse,
} from 'models/interfaces/userRequest';
import { SchemaFormField } from './SchemaFormField';

interface ConfirmationRequestProps {
  confirmationRequests: SessionConfirmationRequest[];
  onSubmit: (responses: ElicitationResponse[]) => void;
}

export const ConfirmationRequest: FC<ConfirmationRequestProps> = ({
  confirmationRequests,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleAccept = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      // Build the responses array from form values
      const responses = confirmationRequests.map((request) => {
        const responseValues: Record<string, unknown> = {};

        // Extract values for this confirmation from the form
        const schema = request.requestedSchema as any;
        if (schema?.properties) {
          Object.keys(schema.properties).forEach((key) => {
            const formKey = `${request.confirmationId}.${key}`;
            if (values[formKey] !== undefined) {
              responseValues[key] = values[formKey];
            }
          });
        }

        return {
          confirmationId: request.confirmationId,
          action: ElicitationAction.ACCEPT,
          content: responseValues,
        };
      });

      await onSubmit(responses);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      // Send empty responses to decline
      const responses = confirmationRequests.map((request) => ({
        confirmationId: request.confirmationId,
        action: ElicitationAction.DECLINE,
        content: {},
      }));

      await onSubmit(responses);
    } finally {
      setLoading(false);
    }
  };

  const items: CollapseProps['items'] = confirmationRequests.map((request) => {
    const schema = request.requestedSchema as any;
    return {
      key: request.confirmationId,
      label: request.title || 'Confirmation request',
      children: (
        <div className={styles.requestSection}>
          {request.message && (
            <p className={styles.requestMessage}>{request.message}</p>
          )}

          {schema?.properties && (
            <div>
              {Object.entries(schema.properties).map(
                ([fieldName, fieldSchema]) => {
                  const prefilledValue = request.content?.[fieldName];
                  const isRequired = schema?.required?.includes(fieldName);
                  return (
                    <SchemaFormField
                      key={`${request.confirmationId}.${fieldName}`}
                      confirmationId={request.confirmationId}
                      fieldName={fieldName}
                      fieldSchema={fieldSchema as any}
                      prefilledValue={prefilledValue}
                      isRequired={isRequired}
                    />
                  );
                },
              )}
            </div>
          )}
        </div>
      ),
    };
  });

  return (
    <Card className={styles.confirmationCard}>
      <h4>Execution paused</h4>

      <Form form={form} layout="vertical" onFinish={handleAccept}>
        <Collapse className={styles.collapseContainer} items={items} />
        <Form.Item>
          <div className={styles.buttonGroup}>
            <Button htmlType="submit" icon={<Check />} loading={loading}>
              Accept
            </Button>
            <Button icon={<X />} onClick={handleDecline} loading={loading}>
              Decline
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};
