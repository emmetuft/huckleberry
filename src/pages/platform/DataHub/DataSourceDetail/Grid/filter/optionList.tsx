import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Input, Spin } from 'antd';
import styles from './index.module.css';
import { BLANK_LABEL } from 'constants/data';
import { Filter, FilterOperator } from 'models/interfaces/filter';
import { Column } from 'models/interfaces/column';
import { DataType, isDateType } from 'models/enums/dataType';
import { useFilterOptions } from 'hooks/useFilterOptions';
import { formatDate, formatDateTime } from 'utils/datetime';
import { selectFilters } from 'reducers/datasource/slice';

interface Option {
  label: string;
  value: string;
}

interface Props {
  columnName: string;
  dataType: DataType;
  operator: FilterOperator;
  selectedOptions: Set<string>;
  setSelectedOptions: (newSet: Set<string>) => void;
}

const buildOptionsArr = (dataType: DataType, options: (string | number)[]) =>
  options.map((x) => {
    let label = x;
    if (isDateType(dataType)) {
      label =
        dataType === DataType.DATE
          ? formatDate(new Date(x as string))
          : formatDateTime(new Date(x as string));
    }
    label = `${x === '' ? BLANK_LABEL : label}`;

    return {
      label,
      value: `${x}`,
    };
  });

type OptionListItemProp = {
  item: Option;
  checked: boolean;
  onClick: () => void;
};

const OptionListItem: FC<OptionListItemProp> = ({ item, checked, onClick }) => (
  <div key={item.value} className={styles.listItem}>
    {item.value}
    {/* <ListItemButton role={undefined} onClick={onClick}>
      <ListItemIcon style={{ minWidth: 15 }}>
        <Checkbox
          edge="start"
          checked={checked}
          classes={{ root: styles.checkbox }}
          size="small"
        />
      </ListItemIcon>
      <ListItemText
        primary={
          <>
            {item.label === BLANK_LABEL ? (
              <div className={styles.blankText}>
                <LocalTooltip title="Null" placement="right">
                  <span>{item.label}</span>
                </LocalTooltip>
              </div>
            ) : (
              <div className={styles.optionText}>{item.label}</div>
            )}
          </>
        }
        primaryTypographyProps={{
          fontSize: '12px',
          lineHeight: '12px',
          ...(item.label === BLANK_LABEL
            ? { fontStyle: 'italic', color: '#909090' }
            : item.label === SELECT_ALL_LABEL
            ? { color: '#909090' }
            : {}),
        }}
      />
    </ListItemButton> */}
  </div>
);

export const OptionList: FC<Props> = ({
  columnName,
  dataType,
  operator,
  selectedOptions,
  setSelectedOptions,
}) => {
  const filters = useSelector(selectFilters);
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const filter = useMemo(
    () => filters.find((f) => f.column === columnName),
    [filters, columnName],
  );

  const [loading, queryResults, doSearch, reset, searchApplied] =
    useFilterOptions({
      columnName,
      filters,
    });

  const displayOptions = useMemo(
    () => buildOptionsArr(dataType, queryResults),
    [dataType, queryResults],
  );

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    // Update state variables to display existing filter
    if (filter !== undefined) {
      const values: Set<string> = new Set(filter.value);
      setSelectedOptions(values);
    }
  }, [filter]);

  const handleClickClearSearch = () => {
    setSelectAll(false);
    setSearchValue('');
    reset();
  };

  const handleOptionSelect = (option: Option) => {
    // if (option.value === SELECT_ALL_LABEL) {
    //   const displayVals = displayOptions.map((x) => x.value);
    //   if (selectAll) {
    //     // Remove all selected options that are displayed
    //     const tempSet = new Set(
    //       Array.from(selectedOptions).filter((x) => !displayVals.includes(x)),
    //     );
    //     setSelectedOptions(tempSet);
    //   } else {
    //     // Add all displayed options to selected options
    //     const tempSet = new Set([
    //       ...displayOptions.map((x) => x.value),
    //       ...Array.from(selectedOptions),
    //     ]);
    //     setSelectedOptions(tempSet);
    //   }
    //   setSelectAll(!selectAll);
    //   return;
    // }

    const tempSet = new Set(selectedOptions);
    if (tempSet.has(option.value)) {
      tempSet.delete(option.value);
      setSelectedOptions(tempSet);
    } else {
      tempSet.add(option.value);
      setSelectedOptions(tempSet);
    }

    if (selectAll) setSelectAll(false);
  };

  const handleClickClear = () => {
    setSelectedOptions(new Set([]));
    setSelectAll(false);
  };

  const renderListItem = (item: Option) => (
    <OptionListItem
      item={item}
      //   checked={
      //     item.value === SELECT_ALL_LABEL
      //       ? selectAll
      //       : selectedOptions.has(item.value)
      //   }
      checked={selectedOptions.has(item.value)}
      onClick={() => {
        handleOptionSelect(item);
      }}
    />
  );

  const [currentOptions, otherOptions, blankOption] = useMemo(() => {
    const matches: JSX.Element[] = [];
    const other: JSX.Element[] = [];
    let blank = null;
    displayOptions
      .filter(
        (x, index) =>
          displayOptions.findIndex((y) => y.label === x.label) === index,
      )
      .forEach((x) => {
        if (x.label === BLANK_LABEL) {
          blank = renderListItem(x);
        } else if (filter !== undefined && filter.value.includes(x.value)) {
          matches.push(renderListItem(x));
        } else {
          other.push(renderListItem(x));
        }
      });
    return [matches, other, blank];
  }, [displayOptions, selectedOptions]);

  const renderOptions = () => (
    <div>
      {/* {searchApplied &&
        displayOptions.length > 0 &&
        renderListItem({ label: SELECT_ALL_LABEL, value: SELECT_ALL_LABEL })} */}
      {currentOptions}
      {blankOption}
      {otherOptions}
    </div>
  );

  return (
    <div className={styles.options}>
      <Input
        placeholder="Search"
        className={styles.searchInput}
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target?.value ?? '');
          doSearch(e.target?.value ?? '');
        }}
        onClear={handleClickClearSearch}
      />

      {!loading && (
        <div className={styles.info}>
          {displayOptions.length === 0 ? (
            <>No options to show</>
          ) : (
            <>
              <div className={styles.count}>
                {selectedOptions.size} selected
              </div>
              {selectedOptions.size > 0 && (
                <div className={styles.clear} onClick={handleClickClear}>
                  Clear selected
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className={`${styles.optionList} ${loading ? styles.loading : ''}`}>
        {loading ? (
          <div className={styles.loading}>
            <Spin />
          </div>
        ) : (
          <>{renderOptions()}</>
        )}
      </div>
    </div>
  );
};
