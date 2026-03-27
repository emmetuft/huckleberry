import { FC, useEffect, useState, useRef, useCallback } from 'react';
import { Modal, Input, Checkbox, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { DataSource } from 'models/interfaces/dataSource';
import { DataService } from 'services/data';
import styles from './DataSourceModal.module.css';

interface DataSourceModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (dataSources: DataSource[]) => void;
}

const PAGE_SIZE = 20;

export const DataSourceModal: FC<DataSourceModalProps> = ({
  open,
  onCancel,
  onConfirm,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<DataSource[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  const observerTarget = useRef<HTMLDivElement>(null);

  const loadDataSources = useCallback(
    async (pageNum: number, search: string, append: boolean = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const result = await DataService.fetchDataSources({
          page: pageNum,
          size: PAGE_SIZE,
          searchTerm: search,
        });

        if (append) {
          setDataSources((prev) => [...prev, ...result.sources]);
        } else {
          setDataSources(result.sources);
        }

        setHasMore(
          result.sources.length === PAGE_SIZE &&
            result.total > pageNum * PAGE_SIZE,
        );
      } catch (error) {
        console.error('Failed to fetch data sources:', error);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  // Load initial data when modal opens
  useEffect(() => {
    if (open) {
      setPage(1);
      setDataSources([]);
      setSelectedDataSources([]);
      setSearchTerm('');
      loadDataSources(1, '');
    }
  }, [open]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      loadDataSources(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadDataSources(nextPage, searchTerm, true);
        }
      },
      { threshold: 1.0 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, page, searchTerm, loadDataSources]);

  const handleToggleDataSource = (dataSource: DataSource) => {
    const isSelected = selectedDataSources.some(
      (ds) => ds.id === dataSource.id,
    );
    if (isSelected) {
      setSelectedDataSources(
        selectedDataSources.filter((ds) => ds.id !== dataSource.id),
      );
    } else {
      setSelectedDataSources([...selectedDataSources, dataSource]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedDataSources);
    setSelectedDataSources([]);
  };

  const handleCancel = () => {
    setSelectedDataSources([]);
    onCancel();
  };

  return (
    <Modal
      title="Select Datasources"
      open={open}
      onOk={handleConfirm}
      onCancel={handleCancel}
      width={600}
      okText="Add Selected"
      okButtonProps={{ disabled: selectedDataSources.length === 0 }}
    >
      <div className={styles.modalContent}>
        <Input
          placeholder="Search datasources..."
          prefix={<SearchOutlined />}
          suffix={loading && page === 1 ? <Spin size="small" /> : null}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.dataSourceList}>
          {dataSources.length === 0 && !loading ? (
            <Empty description="No datasources found" />
          ) : (
            <>
              {dataSources.map((dataSource) => {
                const isSelected = selectedDataSources.some(
                  (ds) => ds.id === dataSource.id,
                );
                return (
                  <div
                    key={dataSource.id}
                    className={`${styles.dataSourceItem} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleToggleDataSource(dataSource)}
                  >
                    <Checkbox checked={isSelected} />
                    <div className={styles.dataSourceInfo}>
                      <div className={styles.dataSourceName}>
                        {dataSource.name}
                      </div>
                      <div className={styles.dataSourceDetails}>
                        <div>Owner: {dataSource.owner.name}</div>
                        <div className={styles.dataSourceMeta}>
                          {dataSource.rowCount?.toLocaleString()} rows •{' '}
                          {dataSource.columnCount} columns
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {hasMore && (
                <div ref={observerTarget} className={styles.loadingTrigger}>
                  {loading && <Spin />}
                </div>
              )}
            </>
          )}
        </div>

        {selectedDataSources.length > 0 && (
          <div className={styles.selectedCount}>
            {selectedDataSources.length} datasource
            {selectedDataSources.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>
    </Modal>
  );
};
