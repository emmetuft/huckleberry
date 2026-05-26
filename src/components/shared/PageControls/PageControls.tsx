import { FC, ReactNode } from 'react';
import { Button, Input, Select } from 'antd';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import styles from './PageControls.module.css';

export interface PageControlsTab {
  label: ReactNode;
  value: string;
}

export interface PageControlsFilter {
  value: unknown;
  onChange: (val: any) => void;
  options: { label: ReactNode; value: any }[];
  placeholder?: string;
}

interface PageControlsProps {
  tabs?: PageControlsTab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: PageControlsFilter[];
}

export const PageControls: FC<PageControlsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
}) => {
  const hasTabs = !!tabs?.length;
  const hasSearch = onSearchChange !== undefined;
  const hasFilters = !!filters?.length;

  return (
    <div className={styles.controlsWrapper}>
      {hasTabs && (
        <div className={styles.controls}>
          {tabs!.map((tab) => (
            <Button
              key={tab.value}
              shape="round"
              type={activeTab === tab.value ? 'primary' : 'default'}
              onClick={() => onTabChange?.(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      )}
      {(hasSearch || hasFilters) && (
        <div className={styles.controls}>
          {hasSearch && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<MagnifyingGlassIcon />}
              value={searchValue}
              onChange={(e) => onSearchChange!(e.target.value)}
            />
          )}
          {filters?.map((filter, idx) => (
            <Select
              key={idx}
              variant="filled"
              popupMatchSelectWidth={false}
              value={filter.value}
              onChange={filter.onChange}
              options={filter.options}
              placeholder={filter.placeholder}
            />
          ))}
        </div>
      )}
    </div>
  );
};
