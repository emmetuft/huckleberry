import { FC } from 'react';
import { Form, Input, Select } from 'antd';
import { DataSourceSelector } from './DataSourceSelector';
import { DOMO_TOOLKIT_SCHEMA_ENTITY } from 'constants/agent';

interface SchemaFormFieldProps {
  confirmationId: string;
  fieldName: string;
  fieldSchema: {
    type?: string;
    description?: string;
    enum?: string[];
  };
  prefilledValue?: unknown;
  isRequired?: boolean;
}

export const SchemaFormField: FC<SchemaFormFieldProps> = ({
  confirmationId,
  fieldName,
  fieldSchema,
  prefilledValue,
  isRequired = false,
}) => {
  const formKey = `${confirmationId}.${fieldName}`;
  const fieldType = fieldSchema.type;
  const hasEnum = fieldSchema.enum && Array.isArray(fieldSchema.enum);

  const requiredRule = {
    required: isRequired,
    message: `${fieldName} is required`,
  };
  const sharedFormProps = {
    name: formKey,
    label: fieldSchema.description || fieldName,
    initialValue: prefilledValue,
    rules: [requiredRule],
  };

  // Handle Domo specific entity types
  if (fieldName === DOMO_TOOLKIT_SCHEMA_ENTITY.DATA_SOURCE) {
    return (
      <Form.Item key={formKey} {...sharedFormProps}>
        <DataSourceSelector placeholder="Search and select datasources..." />
      </Form.Item>
    );
  }

  // Handle enum/select fields
  if (hasEnum) {
    return (
      <Form.Item key={formKey} {...sharedFormProps}>
        <Select placeholder={`Select ${fieldName}`}>
          {fieldSchema.enum!.map((option: string) => (
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    );
  }

  // Handle array fields - JSON input
  if (fieldType === 'array') {
    return (
      <Form.Item
        key={formKey}
        {...sharedFormProps}
        initialValue={prefilledValue ? JSON.stringify(prefilledValue) : '[]'}
        rules={[
          requiredRule,
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              try {
                const parsed = JSON.parse(value);
                if (!Array.isArray(parsed)) {
                  return Promise.reject(
                    new Error('Must be a valid JSON array'),
                  );
                }
                return Promise.resolve();
              } catch {
                return Promise.reject(new Error('Must be valid JSON'));
              }
            },
          },
        ]}
        getValueFromEvent={(e) => e.target.value}
        getValueProps={(value) => ({
          value: typeof value === 'string' ? value : JSON.stringify(value),
        })}
        normalize={(value) => {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }}
      >
        <Input.TextArea
          placeholder={
            fieldSchema.description || `Enter ${fieldName} as JSON array`
          }
          rows={3}
        />
      </Form.Item>
    );
  }

  // Handle number/integer fields
  if (fieldType === 'number' || fieldType === 'integer') {
    return (
      <Form.Item key={formKey} {...sharedFormProps}>
        <Input
          type="number"
          placeholder={fieldSchema.description || fieldName}
        />
      </Form.Item>
    );
  }

  // Handle boolean fields
  if (fieldType === 'boolean') {
    return (
      <Form.Item key={formKey} {...sharedFormProps}>
        <Select placeholder={`Select ${fieldName}`}>
          <Select.Option value={true}>True</Select.Option>
          <Select.Option value={false}>False</Select.Option>
        </Select>
      </Form.Item>
    );
  }

  // Default to string/text input
  return (
    <Form.Item key={formKey} {...sharedFormProps}>
      <Input.TextArea
        placeholder={fieldSchema.description || fieldName}
        rows={3}
      />
    </Form.Item>
  );
};
