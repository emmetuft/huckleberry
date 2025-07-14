export enum DataType {
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  DECIMAL = 'DECIMAL',
  DOUBLE = 'DOUBLE',
  LONG = 'LONG',
  STRING = 'STRING',
}

export const cellDataTypeMap = {
  [DataType.STRING]: 'text',
  [DataType.LONG]: 'number',
  [DataType.DATETIME]: 'dateString',
  [DataType.DATE]: 'dateString',
  [DataType.DECIMAL]: 'number',
  [DataType.DOUBLE]: 'number',
};

export const isDateType = (type: DataType) =>
  type === DataType.DATE || type === DataType.DATETIME;

export const isNumericType = (type: DataType) =>
  type === DataType.LONG ||
  type === DataType.DECIMAL ||
  type === DataType.DOUBLE;
