import { format, isValid } from 'date-fns';
import { ConversationTurn } from 'models/interfaces/message';

export const ONE_HOUR_MS = 60 * 60 * 1000;

export const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

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

export const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

/**
 * Formats a timestamp for message display (iPhone-style).
 * Shows just the time for today, "Yesterday" prefix for yesterday,
 * or the date with time for older messages.
 */
export const formatMessageTimestamp = (timestamp: number | string): string => {
  const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp);
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

/** Formats an ISO timestamp as a short date/time for card header display. Today → "7:12 AM"; older → "Jun 12". */
export const formatCardTimestamp = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/** Returns a relative notice phrase for a "Noticed" status card: "14 minutes ago", "2 hours ago", "overnight", "3 days ago", etc. */
export const getRelativeNoticeTime = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;

  const hour = date.getHours();
  const isOvernightHour = hour >= 22 || hour < 6;
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isOvernightHour && (isToday || isYesterday)) return 'overnight';

  if (isToday) {
    const diffHours = Math.floor(diffMs / 3600000);
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const calDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86400000,
  );
  return `${calDays} day${calDays === 1 ? '' : 's'} ago`;
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const minutes = seconds / 60;
  return `${minutes.toFixed(2)}m`;
};

export const formatCompactNumber = (n: number): string => {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
};

/**
 * Determines whether to show a timestamp above a turn.
 * Shows timestamp if it's the first turn or if an hour or more has passed since the previous turn.
 */
export const shouldShowTimestamp = (
  currentTurn: ConversationTurn,
  previousTurn?: ConversationTurn,
): boolean => {
  if (!previousTurn) {
    return true;
  }
  return currentTurn.timestamp - previousTurn.timestamp >= ONE_HOUR_MS;
};
