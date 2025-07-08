import { Identity, IdentityClient } from '@domoinc/toolkit';

const fetchIdentity = async (): Promise<Identity> => {
  try {
    const response = await IdentityClient.get();
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const AppService = {
  fetchIdentity,
};
