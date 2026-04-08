export const isEmpty = (variable: any): boolean =>
  variable === undefined || variable === null || variable === '';

export const getFirstName = (name?: string) => {
  if (!name) return '';
  const firstName = name.split(' ')[0];
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
