export interface Workflow {
  uuid: string;
  name: string;
  description: string;
  active: boolean;
  deployedVersions?: number;
  totalVersions?: number;
  ownedById?: number;
  ownedByName?: string;
  ownedByType?: string;
  createDate?: number;
  lastModified?: number;
  iconUrl?: string;
}

export interface WorkflowFilter {
  filterType: string;
  field: string;
  queryString?: string;
  value?: any;
  not?: boolean;
}
