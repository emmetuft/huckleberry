export interface Identity {
  id: number;
  displayName: string;
  roleId: number;
  role: string;
  detail: {
    email: string;
  };
}
