export const isEmpty = (variable: any): boolean =>
  variable === undefined || variable === null || variable === '';

export const getFirstName = (name?: string) => {
  if (!name) return '';
  const firstName = name.split(' ')[0];
  return firstName || '';
};

export const getAvatarUrl = (
  userId: number | string,
  host: string = 'domo-labs-dev.dev.domo.com',
  size: number = 100,
): string => {
  return `https://${host}/api/content/v1/avatar/USER/${userId}?size=${size}`;
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
