export interface DomoUserAttribute {
  key: string;
  values: (number | string)[];
}

export interface DomoUser {
  id: number;
  displayName: string;
  userName: string;
  roleId: number;
  emailAddress: string;
  attributes: DomoUserAttribute[];
}

export interface DomoUsersResponse {
  users: DomoUser[];
}
