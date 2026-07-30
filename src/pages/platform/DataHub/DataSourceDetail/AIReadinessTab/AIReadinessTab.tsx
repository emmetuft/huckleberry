import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Switch, Table, TableProps } from 'antd';
import styles from './AIReadinessTab.module.css';
import { selectDataSource } from 'reducers/datasource/slice';
import { DataService } from 'services/data';
import { generateColumnSynonyms } from 'services/ai';
import {
  DataDictionary,
  DictionaryColumn,
} from 'models/interfaces/dataDictionary';

export const AIReadinessTab: FC = () => {
  const dataSource = useSelector(selectDataSource);
  const [dictionary, setDictionary] = useState<DataDictionary | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    if (!dataSource) return;
    setLoading(true);
    DataService.getDataDictionary(dataSource.id)
      .then((results) => {
        setDictionary(results[0]?.dataDictionary ?? null);
      })
      .finally(() => setLoading(false));
  }, [dataSource?.id]);

  const handleGenerateSynonyms = async (column: DictionaryColumn) => {
    if (!dataSource || !dictionary) return;
    setGeneratingId(column.columnId);
    try {
      const synonyms = await generateColumnSynonyms(
        column.name,
        dataSource.name,
      );
      const updatedDictionary: DataDictionary = {
        ...dictionary,
        columns: dictionary.columns.map((c) =>
          c.columnId === column.columnId ? { ...c, synonyms } : c,
        ),
      };
      await DataService.updateDataDictionary(dataSource.id, updatedDictionary);
      setDictionary(updatedDictionary);
    } finally {
      setGeneratingId(null);
    }
  };

  const tableColumns: TableProps<DictionaryColumn>['columns'] = [
    {
      title: 'Column',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: ['subType', 'type'],
      key: 'type',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: 'Default Aggregation',
      dataIndex: ['subType', 'defaultAggregation'],
      key: 'defaultAggregation',
      render: (value: string | null) => value ?? '—',
    },
    {
      title: 'Synonyms',
      dataIndex: 'synonyms',
      key: 'synonyms',
      render: (synonyms: string[], record: DictionaryColumn) => {
        if (synonyms.length > 0) return synonyms.join(', ');
        return (
          <Button
            size="small"
            shape="round"
            loading={generatingId === record.columnId}
            onClick={() => handleGenerateSynonyms(record)}
          >
            Generate synonyms
          </Button>
        );
      },
    },
    {
      title: 'AI Enabled',
      dataIndex: 'agentEnabled',
      key: 'agentEnabled',
      render: (enabled: boolean) => <Switch checked={enabled} />,
    },
  ];

  return (
    <div className={styles.aiReadinessTab}>
      <Table
        columns={tableColumns}
        dataSource={dictionary?.columns ?? []}
        rowKey="columnId"
        loading={loading}
        size="middle"
      />
    </div>
  );
};
