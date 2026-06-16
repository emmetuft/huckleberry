export interface SearchFilter {
  type: string;
  values: string[];
  operator?: string;
  not?: boolean;
}
