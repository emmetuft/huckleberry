export interface Connector {
  databaseId: string;
  title: string;
  description: string;
  categories: string[];
  tags: string[];
}

export interface ConnectorFilter {
  filterType: string;
  field: string;
  queryString?: string;
  value?: any;
  not?: boolean;
}
