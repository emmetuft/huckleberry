import { FC } from 'react';
import { useSelector } from 'react-redux';
import { FunnelIcon, XIcon } from '@phosphor-icons/react';
import styles from './DataFilters.module.css';
import AppTooltip from 'components/shared/Tooltip';
import { useAppDispatch } from 'reducers';
import { selectFilters, setFilters } from 'reducers/datasource/slice';
import { FilterOperator, operatorLabelMap } from 'models/interfaces/filter';

export const DataFilters: FC = () => {
  const dispatch = useAppDispatch();

  const filters = useSelector(selectFilters);

  const onClickRemoveFilter = (filterId: string) => {
    dispatch(setFilters(filters.filter((filter) => filter.id !== filterId)));
  };

  return (
    filters.length > 0 && (
      <div className={styles.filtersContainer}>
        <FunnelIcon />
        {filters.map((filter) => (
          <div key={filter.id} className={styles.filterPill}>
            <p>{filter.column}</p>
            <p className={styles.filterOperator}>
              {operatorLabelMap[filter.operator]}
            </p>
            {filter.operator !== FilterOperator.IS_NULL &&
              filter.operator !== FilterOperator.IS_NOT_NULL && (
                <AppTooltip title={filter.value}>
                  <p className={styles.filterValue}>{filter.value}</p>
                </AppTooltip>
              )}
            <button onClick={() => onClickRemoveFilter(filter.id)}>
              <XIcon />
            </button>
          </div>
        ))}
      </div>
    )
  );
};
