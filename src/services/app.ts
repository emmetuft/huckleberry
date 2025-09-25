import { AuthClient, AuthResponse } from '@appteam6/domoapps.js';
import { Identity, IdentityClient } from '@domoinc/toolkit';

const authenticate = async (): Promise<AuthResponse> =>
  await AuthClient.authenticate('huckleberry');

const fetchIdentity = async (): Promise<Identity> => {
  try {
    const response = await IdentityClient.get();
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const AppService = {
  authenticate,
  fetchIdentity,
};
