import { FC, useEffect, useRef } from 'react';
import { Input, Empty, Spin, Button, Tag } from 'antd';
import {
  CheckIcon,
  DatabaseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { DataSource } from 'models/interfaces/dataSource';
import { useDataSources } from 'hooks/useDataSources';
import styles from './DataSourceBrowser.module.css';
import { Avatar } from '../Avatar/Avatar';

interface DataSourceBrowserProps {
  selectedDataSources: DataSource[];
  onDataSourcesChange: (dataSources: DataSource[]) => void;
  height?: number;
}

export const DataSourceBrowser: FC<DataSourceBrowserProps> = ({
  selectedDataSources,
  onDataSourcesChange,
  height,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    dataSources,
    loading,
    hasMore,
    searchTerm,
    setSearchTerm,
    loadNextPage,
  } = useDataSources();

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

  const isDataSourceSelected = (dataSource: DataSource) =>
    selectedDataSources.some((ds) => ds.id === dataSource.id);

  const handleToggleDataSource = (dataSource: DataSource) => {
    if (isDataSourceSelected(dataSource)) {
      onDataSourcesChange(
        selectedDataSources.filter((ds) => ds.id !== dataSource.id),
      );
    } else {
      onDataSourcesChange([...selectedDataSources, dataSource]);
    }
  };

  return (
    <div className={styles.dataSourceBrowser}>
      <Input
        placeholder="Search datasources..."
        prefix={<MagnifyingGlassIcon />}
        suffix={loading && searchTerm ? <Spin size="small" /> : null}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        allowClear
      />

      {selectedDataSources.length > 0 && (
        <div className={styles.selectedList}>
          {selectedDataSources.map((dataSource) => (
            <Tag
              key={dataSource.id}
              closable
              onClose={() => handleToggleDataSource(dataSource)}
            >
              {dataSource.name}
            </Tag>
          ))}
        </div>
      )}

      <div className={styles.dataSourceList} style={{ height: height ?? 400 }}>
        {dataSources.length === 0 && !loading ? (
          <Empty description="No datasources found" />
        ) : (
          <>
            {dataSources.map((dataSource) => {
              const selected = isDataSourceSelected(dataSource);
              return (
                <div key={dataSource.id} className="appCard">
                  <div className={`defaultAppIcon ${styles.dataSourceIcon}`}>
                    <DatabaseIcon />
                  </div>
                  <div className="appInfo">
                    <h4>{dataSource.name}</h4>
                    <p className={styles.dataSourceDetails}>
                      <span>
                        <Avatar
                          userId={Number(dataSource.owner.id)}
                          name={dataSource.owner.name}
                          showName
                          height={16}
                        />
                      </span>
                      <span>
                        {dataSource.rowCount?.toLocaleString()} rows •{' '}
                        {dataSource.columnCount} columns
                      </span>
                    </p>
                  </div>
                  <div className={styles.connectAction}>
                    <Button
                      size="small"
                      type={selected ? 'primary' : 'default'}
                      icon={selected ? <CheckIcon /> : <PlusIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDataSource(dataSource);
                      }}
                    />
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
  );
};
