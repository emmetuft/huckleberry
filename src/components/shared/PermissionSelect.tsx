import { Select, SelectProps } from 'antd';
import { Permission } from 'models/enums/permission';

export default function PermissionSelect(props: SelectProps) {
  return (
    <Select
      {...props}
      options={[
        {
          label: 'Owner',
          value: Permission.OWNER,
        },
        {
          label: 'Can edit',
          value: Permission.EDIT,
        },
        {
          label: 'Can view',
          value: Permission.READ,
        },
      ]}
      style={{ border: 'none', width: 120 }}
    />
  );
}
