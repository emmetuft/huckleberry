import { format, isValid } from 'date-fns';
import { Message } from 'models/interfaces/message';

export const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Formats a date or timestamp into 'yyyy-MM-dd HH:mm:ss'.
 * @param date - The date object or timestamp to format.
 * @returns The formatted date string.
 */
export function formatDateTime(date: Date | number): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

export const formatCurrentDate = (): string => {
  return format(new Date(), 'EEEE, MMMM dd, yyyy');
};

export const isValidDate = (value: string) => {
  // Reject entirely numeric strings
  if (/^\d+$/.test(value)) return false;

  const date = new Date(value);
  return isValid(date);
};

/**
 * Formats a timestamp for message display (iPhone-style).
 * Shows just the time for today, "Yesterday" prefix for yesterday,
 * or the date with time for older messages.
 */
export const formatMessageTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return timeString;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isYesterday) {
    return `Yesterday ${timeString}`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Determines whether to show a timestamp above a message.
 * Shows timestamp if it's the first message or if an hour or more has passed since the previous message.
 */
export const shouldShowTimestamp = (
  currentMessage: Message,
  previousMessage?: Message,
): boolean => {
  if (!previousMessage) {
    return true;
  }
  return currentMessage.timestamp - previousMessage.timestamp >= ONE_HOUR_MS;
};
