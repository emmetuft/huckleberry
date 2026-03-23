import { createSelector } from '@reduxjs/toolkit';
import { selectToolkits } from './slice';

export const selectEnabledToolkits = createSelector(
  [selectToolkits],
  (toolkits) => toolkits.filter((toolkit) => toolkit.enabled),
);
