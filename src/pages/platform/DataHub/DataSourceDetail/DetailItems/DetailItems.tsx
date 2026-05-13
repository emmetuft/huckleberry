import { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import styles from './DetailItems.module.css';
import { selectDataSource } from 'reducers/datasource/slice';
import { formatDateTime } from 'utils/datetime';
import { Avatar } from 'components/shared/Avatar/Avatar';

export const DetailItems: FC = () => {
  const dataSource = useSelector(selectDataSource);
  const userId = dataSource ? Number(dataSource.owner.id) : undefined;

  if (!dataSource) return null;

  const metaItems: { label: string; value: ReactNode }[] = [
    { label: 'Type', value: dataSource.type },
    { label: 'Origin', value: dataSource.cloudName },
    {
      label: 'Owner',
      value: (
        <Avatar
          userId={userId}
          name={dataSource.owner?.name}
          showName
          height={20}
        />
      ),
    },
    { label: 'Rows', value: dataSource.rowCount?.toLocaleString() },
    { label: 'Columns', value: dataSource.columnCount },
    {
      label: 'Last Updated',
      value: formatDateTime(new Date(dataSource.lastUpdated)),
    },
    { label: 'Created', value: formatDateTime(dataSource.created) },
  ];

  return (
    <div className={styles.metaGrid}>
      {metaItems.map(({ label, value }) => (
        <div key={label} className={`card ${styles.metaCard}`}>
          <span className={styles.metaLabel}>{label}</span>
          <span className={styles.metaValue}>{value}</span>
        </div>
      ))}
    </div>
  );
};
