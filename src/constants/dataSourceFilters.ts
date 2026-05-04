import { FilterColumn, FilterDataType } from 'models/interfaces/filter';

export const DATA_SOURCE_FILTER_COLUMNS: FilterColumn[] = [
  {
    key: 'owner',
    label: 'Owner',
    type: FilterDataType.STRING,
  },
  {
    key: 'type',
    label: 'Type',
    type: FilterDataType.STRING,
  },
];
