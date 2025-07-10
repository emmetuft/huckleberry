import { Identity } from '@domoinc/toolkit';

export const getFirstName = (identity: Identity | undefined) => {
  if (!identity) return '';
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
