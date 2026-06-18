import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { ToolkitsService } from 'services/toolkits';
import {
  Toolkit,
  ToolkitSearchResult,
  SearchToolkitsRequest,
} from 'models/interfaces/toolkit';

export const fetchToolkits = createAsyncThunk<
  Toolkit[],
  void,
  { state: RootState }
>('toolkits/fetchToolkits', async (_, { getState }) => {
  const { toolkits } = getState().toolkits;
  if (toolkits.length > 0) {
    return toolkits;
  }
  return ToolkitsService.getToolkits();
});

export const searchToolkits = createAsyncThunk<
  ToolkitSearchResult[],
  SearchToolkitsRequest | undefined,
  { state: RootState }
>('toolkits/searchToolkits', async (request) => {
  const result = await ToolkitsService.searchToolkits(request ?? { limit: 50 });
  return result.toolkits;
});
