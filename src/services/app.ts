const authenticate = async () => {
  try {
    return undefined;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const fetchIdentity = async () => {
  try {
    return undefined;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const AppService = {
  authenticate,
  fetchIdentity,
};
