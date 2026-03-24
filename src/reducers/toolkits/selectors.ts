import { createSelector } from '@reduxjs/toolkit';
import { selectToolkits } from './slice';

export const selectAllTools = createSelector([selectToolkits], (toolkits) => {
  return toolkits.flatMap((toolkit) => toolkit.tools);
});
