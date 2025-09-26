export enum DATA_ALIAS {
  DOMOSTATS_DATASETS = 'DomoStats_Datasets',
}

export const DOMOSTATS_DATASETS_SCHEMA = [
  'id',
  'name',
  'link',
  'ownerId',
  'createdDate',
  'lastRunDate',
  'status',
  'schedule',
  'importType',
  'dataProvider',
  'sourceType',
  'cardsPowered',
  'pdpEnabled',
  'shared',
  'accountId',
];

export const SCHEMA_MAP = {
  [DATA_ALIAS.DOMOSTATS_DATASETS]: DOMOSTATS_DATASETS_SCHEMA,
};
