export interface SearchFilter {
  type: string;
  values: (string | number)[];
  operator?: string;
  not?: boolean;
}

export interface DateFilter {
  start: string;
  end: string;
}

export interface SearchQuery {
  filters?: SearchFilter[];
  dateFilters?: Record<string, DateFilter>;
  sortFieldMap?: Record<string, 'ASC' | 'DESC'>;
  searchFieldMap?: Record<string, string>;
  limit?: number;
  offset?: number;
}
