import { handleResponse } from 'utils/service';

const IDENTITY_API_BASE = '/api/identity';

const authenticate = async () => {
  try {
    const res = await getIdentity();
    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getIdentity = async () => {
  const response = await fetch(IDENTITY_API_BASE);
  const data = await handleResponse<any>(response);
  return data;
};

export const IdentityService = {
  authenticate,
};
