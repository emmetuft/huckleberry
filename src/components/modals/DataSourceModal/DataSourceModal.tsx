import { FC, useEffect, useState, useRef } from 'react';
import { Modal, Input, Checkbox, Empty, Spin, Button } from 'antd';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { DataSource } from 'models/interfaces/dataSource';
import { useDataSources } from 'hooks/useDataSources';
import styles from './DataSourceModal.module.css';

interface DataSourceModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (dataSources: DataSource[]) => void;
}

export const DataSourceModal: FC<DataSourceModalProps> = ({
  open,
  onCancel,
  onConfirm,
}) => {
  const [selectedDataSources, setSelectedDataSources] = useState<DataSource[]>(
    [],
  );

  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    dataSources,
    loading,
    hasMore,
    searchTerm,
    setSearchTerm,
    loadNextPage,
    reset,
  } = useDataSources({ loadOnMount: false });

  // Reset and load when modal opens
  useEffect(() => {
    if (open) {
      setSelectedDataSources([]);
      reset();
    }
  }, [open]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
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
  }, [hasMore, loadNextPage]);

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

  const footer = (
    <div className={styles.footer}>
      <span className={styles.selectedCount}>
        {selectedDataSources.length > 0 &&
          `${selectedDataSources.length} datasource${selectedDataSources.length !== 1 ? 's' : ''} selected`}
      </span>
      <div>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          type="primary"
          onClick={handleConfirm}
          disabled={selectedDataSources.length === 0}
        >
          Add Selected
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      title="Select Datasources"
      open={open}
      onCancel={handleCancel}
      width={600}
      footer={footer}
    >
      <div className={styles.modalContent}>
        <Input
          placeholder="Search datasources..."
          prefix={<MagnifyingGlassIcon />}
          suffix={loading && searchTerm ? <Spin size="small" /> : null}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
      </div>
    </Modal>
  );
};
