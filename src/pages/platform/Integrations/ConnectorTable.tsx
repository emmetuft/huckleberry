import { FC } from 'react';
import { Table, TableProps } from 'antd';
import { Connector } from 'models/interfaces/connector';

interface ConnectorTableProps {}

export const ConnectorTable: FC<ConnectorTableProps> = () => {
  const columns: TableProps<Connector>['columns'] = [
    {
      title: 'Connector',
      dataIndex: 'connector',
      key: 'connector',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Assets',
      dataIndex: 'assets',
      key: 'assets',
    },
    {
      title: 'Used by',
      dataIndex: 'usedBy',
      key: 'usedBy',
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
    },
  ];

  return <Table columns={columns} />;
};
