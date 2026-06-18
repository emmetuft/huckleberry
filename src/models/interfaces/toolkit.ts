export interface Toolkit {
  toolkitId: string;
  name: string;
  description: string;
  tools: Tool[];
  context: Record<string, any>;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Tool {
  toolId: string;
  domoToolId: string;
  overrideToolName: string;
  overrideToolDescription: string;
  type: string;
  customer: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ToolkitSearchResult {
  toolkitId: string;
  name: string;
  description: string;
  type: 'CUSTOM' | 'DOMO_PROVIDED';
  status?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface ToolkitSearchPage {
  toolkits: ToolkitSearchResult[];
  pageContext?: Record<string, unknown>;
}

export interface ToolkitSearchFilter {
  type: 'CREATED_BY' | 'TYPE';
  values: unknown[];
  operator?: string;
  not?: boolean;
}

export interface SearchToolkitsRequest {
  limit?: number;
  offset?: number;
  filters?: ToolkitSearchFilter[];
  sortFieldMap?: Record<string, 'ASC' | 'DESC'>;
  searchFieldMap?: Record<string, string>;
}
