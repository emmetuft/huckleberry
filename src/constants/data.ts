import { DataType } from 'models/enums/dataType';
import { Column } from 'models/interfaces/column';

export const dataSourceColumns: (Column & { dataIndex: string })[] = [
  {
    name: 'Name',
    id: 'name',
    type: DataType.STRING,
    dataIndex: 'name',
  },
  {
    name: 'Type',
    id: 'type',
    type: DataType.STRING,
    dataIndex: 'type',
  },
  {
    name: 'Origin',
    id: 'origin',
    type: DataType.STRING,
    dataIndex: 'cloudName',
  },
  {
    name: 'Owner',
    id: 'owner',
    type: DataType.STRING,
    dataIndex: 'owner',
  },
  {
    name: 'Status',
    id: 'status',
    type: DataType.STRING,
    dataIndex: 'status',
  },
  {
    name: 'Row count',
    id: 'rowCount',
    type: DataType.DOUBLE,
    dataIndex: 'rowCount',
  },
  {
    name: 'Column count',
    id: 'columnCount',
    type: DataType.DOUBLE,
    dataIndex: 'columnCount',
  },
  {
    name: 'Tags',
    id: 'tags',
    type: DataType.STRING,
    dataIndex: 'tags',
  },
  {
    name: 'Last updated',
    id: 'lastUpdated',
    type: DataType.DATE,
    dataIndex: 'lastUpdated',
  },
  {
    name: 'Created on',
    id: 'createdOn',
    type: DataType.DATE,
    dataIndex: 'created',
  },
];
