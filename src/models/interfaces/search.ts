export interface SearchFilter {
  type: string;
  values: string[];
  operator?: string;
  not?: boolean;
}

export interface SearchQuery {
  filters?: SearchFilter[];
  sortFieldMap?: Record<string, 'ASC' | 'DESC'>;
  searchFieldMap?: Record<string, string>;
  limit?: number;
  offset?: number;
}
