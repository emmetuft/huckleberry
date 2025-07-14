export interface DataSource {
  adc: boolean;
  adcExternal: boolean;
  cardInfo: {
    cardCount: number;
    cardViewCount: number;
  };
  cloudId: string;
  cloudName: string;
  columnCount: number;
  created: number;
  dataProviderType?: string;
  description: string;
  displayType: string;
  hidden: boolean;
  id: string;
  lastTouched: number;
  lastUpdated: string;
  name: string;
  owner: {
    id: string;
    name: string;
    type: string;
    group: boolean;
  };
  permissions: string;
  properties: {
    formulas: {
      formulas: unknown;
    };
  };
  rowCount: number;
  scheduleActive: boolean;
  state: string;
  status: string;
  streamId: number;
  transportType: string;
  type: string;
  validAccount: boolean;
  validConfiguration: boolean;
}
