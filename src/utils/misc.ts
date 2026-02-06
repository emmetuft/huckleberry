import { Identity } from '@domoinc/toolkit';

export const isEmpty = (variable: any): boolean =>
  variable === undefined || variable === null || variable === '';

export const getFirstName = (identity: Identity | undefined) => {
  if (!identity) return '';
  if (identity.userId === 1250228141) return 'Mark'; // TODO: Remove later
  const firstName = identity.userName?.split(' ')[0];
  return firstName || '';
};

export const getTimeOfDay = (): string => {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return 'morning';
  } else if (currentHour >= 12 && currentHour < 18) {
    return 'afternoon';
  } else {
    return 'evening';
  }
};
