import { FC, useCallback, useState } from 'react';
import { Input, Empty, Spin, Button, Tag } from 'antd';
import {
  CheckIcon,
  DatabaseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import styles from './DataSourceBrowser.module.css';
import { DataSource } from 'models/interfaces/dataSource';
import { Avatar } from '../Avatar/Avatar';
import { useInfiniteScroll } from 'hooks/useInfiniteScroll';
import { DataService } from 'services/data';

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
  const [searchTerm, setSearchTerm] = useState('');

  const fetcher = useCallback(
    async (limit: number, offset: number) => {
      const result = await DataService.getDataSources({
        page: Math.floor(offset / limit) + 1,
        size: limit,
        searchTerm: searchTerm || undefined,
      });
      return result.sources;
    },
    [searchTerm],
  );

  const {
    items: dataSources,
    loading,
    hasMore,
    sentinelRef,
  } = useInfiniteScroll<DataSource>({
    fetcher,
    resetDeps: [searchTerm],
    pageSize: 20,
    debounceMs: 500,
  });

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
    <div className="itemBrowser">
      <Input
        placeholder="Search datasources..."
        prefix={<MagnifyingGlassIcon />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        allowClear
      />

      {selectedDataSources.length > 0 && (
        <div className="selectedList">
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

      <div className="itemList" style={{ height: height ?? 400 }}>
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
                  <div className="connectAction">
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
              <div ref={sentinelRef} className="loadingTrigger">
                {loading && <Spin />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
