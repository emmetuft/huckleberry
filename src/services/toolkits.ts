import { Toolkit } from 'models/interfaces/toolkit';
import { handleResponse } from 'utils/service';

const TOOLKITS_API_BASE = '/api/toolkits';

const getToolkits = async (): Promise<Toolkit[]> => {
  const response = await fetch(TOOLKITS_API_BASE);
  const data = await handleResponse<{ pageContext: any; toolkits: Toolkit[] }>(
    response,
  );
  return data.toolkits;
};

export const ToolkitsService = {
  getToolkits,
};
