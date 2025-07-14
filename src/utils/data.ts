import { DataType } from 'models/enums/dataType';
import { Column } from 'models/interfaces/column';
import { formatDateTime } from './datetime';

export const renderVal = (col: Column, val: any) => {
  switch (col.type) {
    case DataType.DECIMAL:
    case DataType.DOUBLE:
    case DataType.LONG:
      return val
        ? Number.isInteger(parseFloat(val))
          ? val
          : parseFloat(val).toFixed(2)
        : val;
    case DataType.DATE:
    case DataType.DATETIME:
      return val ? formatDateTime(val) : val;
    default:
      return val;
  }
};
