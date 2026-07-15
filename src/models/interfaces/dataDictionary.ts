export interface DictionaryColumnSubType {
  type: string | null;
  defaultAggregation: string | null;
}

export interface DictionaryColumn {
  columnId: string;
  name: string;
  synonyms: string[];
  subType: DictionaryColumnSubType;
  agentEnabled: boolean;
}

export interface DataDictionary {
  id: string;
  datasetId: string;
  name: string;
  columns: DictionaryColumn[];
}

export interface DataDictionaryResult {
  dataDictionary: DataDictionary;
  dataDictionaryWarnings: string[];
}
