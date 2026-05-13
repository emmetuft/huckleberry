import { FC } from 'react';
import { Select, Spin } from 'antd';
import { useDataSources } from 'hooks/useDataSources';

interface DataSourceSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
}

export const DataSourceSelector: FC<DataSourceSelectorProps> = ({
  value = [],
  onChange,
  placeholder = 'Search and select datasources...',
}) => {
  const { dataSources, loading, setSearchTerm, loadNextPage } =
    useDataSources();

  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 50;

    if (isNearBottom) {
      loadNextPage();
    }
  };

  return (
    <Select
      mode="multiple"
      showSearch
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onSearch={setSearchTerm}
      onPopupScroll={handlePopupScroll}
      filterOption={false}
      loading={loading}
      notFoundContent={loading ? <Spin size="small" /> : 'No datasources found'}
      optionLabelProp="label"
    >
      {dataSources.map((dataSource) => (
        <Select.Option
          key={dataSource.id}
          value={dataSource.id}
          label={dataSource.name}
        >
          <div>
            <div style={{ fontWeight: 500 }}>{dataSource.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Owner: {dataSource.owner.name} •{' '}
              {dataSource.rowCount?.toLocaleString()} rows •{' '}
              {dataSource.columnCount} columns
            </div>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};
