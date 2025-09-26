export enum DATA_ALIAS {
  DOMOSTATS_DATASETS = 'DomoStats_Datasets',
  DOMOSTATS_DATASETS_HISTORY = 'DomoStats_Datasets_History',
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

export const DOMOSTATS_DATASETS_HISTORY_SCHEMA = [
  'executionId',
  'dataSourceId',
  'link',
  'dataSourceName',
  'dataProviderKey',
  'status',
  'updatedRows',
  'bytesInserted',
  'updateMethod',
  'createdAt',
  'runTime',
  'startedBy',
  'cancelledBy',
  'startTime',
  'endTime',
  'phaseType',
  'runType',
];

export const SCHEMA_MAP = {
  [DATA_ALIAS.DOMOSTATS_DATASETS]: DOMOSTATS_DATASETS_SCHEMA,
  [DATA_ALIAS.DOMOSTATS_DATASETS_HISTORY]: DOMOSTATS_DATASETS_HISTORY_SCHEMA,
};
