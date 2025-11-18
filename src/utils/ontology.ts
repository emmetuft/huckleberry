import { formatDateTime, isValidDate } from './datetime';

export const renderValue = (value: any): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => renderValue(v)).join(', ')}]`;
  }
  if (typeof value === 'object') {
    return `{ ${Object.entries(value)
      .map(([k, v]) => `${k}: ${renderValue(v)}`)
      .join(', ')} }`;
  }
  // Check if value is a valid date using date-fns
  if (isValidDate(value)) {
    const date = new Date(value);
    return formatDateTime(date);
  }

  return value.toString();
};
