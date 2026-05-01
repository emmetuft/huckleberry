import { DataType } from 'models/enums/dataType';
import { Column } from 'models/interfaces/column';
import { ConnectorFilter } from 'models/interfaces/connector';
import { formatDateTime } from './datetime';
import { ConnectorType } from 'constants/integrations';

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

// Data connectors
export const buildFilters = (
  category: string | null,
  type: string | null,
  search: string,
): ConnectorFilter[] => {
  const filters: ConnectorFilter[] = [];

  if (category && category !== 'All') {
    filters.push({
      filterType: 'term',
      field: 'tag_facet',
      value: category,
    });
  }

  if (type && type !== ConnectorType.ALL) {
    switch (type) {
      case ConnectorType.CLOUD:
      case ConnectorType.DATABASE:
      case ConnectorType.IOT:
      case ConnectorType.UPLOAD:
        filters.push({
          filterType: 'term',
          field: 'tag_facet',
          value: type,
        });
        break;
      case ConnectorType.WRITEBACK:
        filters.push({
          filterType: 'term',
          field: 'connector_writeback_enabled',
          value: true,
        });
        break;
      default:
        break;
    }
  }

  if (search.trim()) {
    filters.push({
      filterType: 'queryString',
      field: 'title',
      queryString: `${search.trim()}*`,
    });
  }

  return filters;
};

export const formatNumber = (num: number): string => {
  if (num === null || num === undefined) {
    return '';
  }
  if (num < 1000) {
    return num.toFixed(2).replace(/\.00$/, '');
  }
  const units = ['K', 'M', 'B', 'T'];
  let unitIndex = -1;
  let formattedNumber = num;

  while (formattedNumber >= 1000 && unitIndex < units.length - 1) {
    formattedNumber /= 1000;
    unitIndex += 1;
  }

  return `${formattedNumber.toFixed(2)}${units[unitIndex]}`;
};
