import { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import styles from './DetailItems.module.css';
import { selectDataSource } from 'reducers/datasource/slice';
import { formatDateTime } from 'utils/datetime';
import { getAvatarUrl } from 'utils/misc';

export const DetailItems: FC = () => {
  const dataSource = useSelector(selectDataSource);

  if (!dataSource) return null;

  const avatar = getAvatarUrl(dataSource.owner?.id);

  const metaItems: { label: string; value: ReactNode }[] = [
    { label: 'Type', value: dataSource.type },
    { label: 'Origin', value: dataSource.cloudName },
    {
      label: 'Owner',
      value: (
        <div className={styles.ownerCell}>
          <img
            className={styles.avatar}
            src={avatar}
            alt={dataSource.owner?.name}
          />
          {dataSource.owner?.name}
        </div>
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
