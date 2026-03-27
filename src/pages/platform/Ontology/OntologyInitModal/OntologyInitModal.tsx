import { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Select, Table } from 'antd';
import { Database } from 'phosphor-react';
import styles from './OntologyInitModal.module.css';
import { useAppDispatch } from 'reducers';
import { selectLoading } from 'reducers/ontology/slice';
import { DataSource } from 'models/interfaces/dataSource';
import { OntologySource } from 'models/interfaces/ontology';
import { DataService } from 'services/data';

interface OntologyInitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OntologyInitModal: FC<OntologyInitModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const ontologyLoading = useSelector(selectLoading).initGeneration;

  const [ontologySources, setOntologySources] = useState<OntologySource[]>([]);

  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // asynchronous loading state for UI
  const [schemaLoadingIds, setSchemaLoadingIds] = useState<Set<string>>(
    new Set(),
  );
  // synchronous loading state to prevent duplicate fetches
  const schemaLoadingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDataSources();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    const fetchSchemasForEmptySources = async () => {
      const sourcesNeedingSchema = ontologySources.filter(
        (source) =>
          source.schema.length === 0 &&
          !source.error &&
          !schemaLoadingRef.current.has(source.dataSourceId),
      );

      if (sourcesNeedingSchema.length === 0) return;

      // Mark sources as loading
      sourcesNeedingSchema.forEach((source) => {
        schemaLoadingRef.current.add(source.dataSourceId);
      });
      setSchemaLoadingIds(new Set(schemaLoadingRef.current));

      const updatedSources = await Promise.all(
        sourcesNeedingSchema.map(async (source) => {
          try {
            const schema = await DataService.fetchDataSourceSchema(
              source.dataSourceId,
            );

            let sampleRows: Record<string, any>[] = [];
            let error: string | undefined = undefined;
            try {
              sampleRows = await DataService.fetchDataSourceRows({
                dataSourceId: source.dataSourceId,
                schema,
                page: 1,
                pageSize: 3,
              });
            } catch (err) {
              console.error(
                `Failed to fetch sample rows for ${source.name}:`,
                err,
              );
              error = 'Failed to fetch sample rows';
            }

            return { ...source, schema, sampleRows, error };
          } catch (error) {
            console.error(`Failed to fetch schema for ${source.name}:`, error);
            return { ...source, error: 'Failed to fetch schema' };
          } finally {
            schemaLoadingRef.current.delete(source.dataSourceId);
            setSchemaLoadingIds(new Set(schemaLoadingRef.current));
          }
        }),
      );

      setOntologySources((prev) =>
        prev.map((source) => {
          const updated = updatedSources.find(
            (updated) => updated.dataSourceId === source.dataSourceId,
          );
          return updated || source;
        }),
      );
    };

    fetchSchemasForEmptySources();
  }, [ontologySources]);

  const fetchDataSources = async () => {
    setLoading(true);
    const res = await DataService.fetchDataSources({
      page: 1,
      size: 50,
      searchTerm,
    });
    setDataSources(res.sources);
    setLoading(false);
  };

  const onSearch = (value: string) => {
    setSearchTerm(value);
  };

  const onChange = (value: string[]) => {
    const existingSources = ontologySources.filter((source) =>
      value.includes(source.dataSourceId),
    );

    const newSelectedIds = value.filter(
      (id) => !ontologySources.some((source) => source.dataSourceId === id),
    );

    const newSources = dataSources
      .filter((ds) => newSelectedIds.includes(ds.id))
      .map((ds) => ({
        dataSourceId: ds.id,
        name: ds.name,
        schema: [],
        sampleRows: [],
      }));

    setOntologySources([...existingSources, ...newSources]);
  };

  const onOk = () => {};

  const onCancel = () => {
    onClose();
  };

  const isSchemaLoading = (dataSourceId: string) => {
    return schemaLoadingIds.has(dataSourceId);
  };

  return (
    <Modal
      title="Initialize ontology"
      open={isOpen}
      okText="Generate"
      onOk={onOk}
      onCancel={onCancel}
      width={700}
      okButtonProps={{ loading: ontologyLoading }}
    >
      <div className={styles.modalContent}>
        <div className={styles.headingPill}>
          Let's build a model of your data
        </div>
        <p>
          Select one or more data sources. We'll analyze their schemas and
          sample rows to automatically discover business entities and the
          relationships between them.
        </p>
        <Select
          mode="multiple"
          filterOption={false}
          loading={loading}
          placeholder="Search data sources"
          value={ontologySources.map((ds) => ds.dataSourceId)}
          options={dataSources.map((ds) => ({
            label: ds.name,
            value: ds.id,
            numCols: ds.columnCount,
            numRows: ds.rowCount,
            ownerId: ds.owner.id,
            ownerName: ds.owner.name,
          }))}
          optionRender={(option) => (
            <div className={styles.sourceOption}>
              <p className={styles.name}>{option.label}</p>
              <p>
                <span className={styles.label}>Owner</span>
                {option.data.ownerName}
              </p>
              <div className={styles.details}>
                <p>
                  <span className={styles.label}>Columns</span>
                  {option.data.numCols}
                </p>
                <p>
                  <span className={styles.label}>Rows</span>
                  {option.data.numRows}
                </p>
              </div>
            </div>
          )}
          onSearch={onSearch}
          onChange={onChange}
        />
        <div className={styles.sourcesList}>
          {ontologySources.map((source) => (
            <div key={source.dataSourceId} className={styles.sourceWrapper}>
              <div className={styles.sourceName}>
                <Database />
                <p>{source.name}</p>
              </div>
              <Table
                dataSource={source.sampleRows.map((row) => ({
                  ...row,
                  key: JSON.stringify(row),
                }))}
                columns={source.schema.map((col) => ({
                  key: col.name,
                  dataIndex: col.name,
                  title: col.name,
                }))}
                pagination={false}
                loading={isSchemaLoading(source.dataSourceId)}
                tableLayout="auto"
                size="small"
                scroll={{
                  x: 'max-content',
                }}
              />
              {source.error && (
                <div className={styles.error}>{source.error}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
