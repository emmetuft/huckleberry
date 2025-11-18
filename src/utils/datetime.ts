import { format, isValid } from 'date-fns';

/**
 * Formats a date or timestamp into 'yyyy-MM-dd HH:mm:ss'.
 * @param date - The date object or timestamp to format.
 * @returns The formatted date string.
 */
export function formatDateTime(date: Date | number): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

export const isValidDate = (value: string) => {
  // Reject entirely numeric strings
  if (/^\d+$/.test(value)) return false;

  const date = new Date(value);
  return isValid(date);
};
