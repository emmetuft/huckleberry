import { FC, useCallback, useState } from 'react';
import { Input, Button, Empty, Tag, Spin } from 'antd';
import {
  CheckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ToolboxIcon,
} from '@phosphor-icons/react';
import styles from './ToolBrowser.module.css';
import { Toolkit } from 'models/interfaces/toolkit';
import { ToolkitsService } from 'services/toolkits';
import { useInfiniteScroll } from 'hooks/useInfiniteScroll';

interface ToolBrowserProps {
  selectedToolkits: Toolkit[];
  onToolkitsChange: (toolkits: Toolkit[]) => void;
  height?: number;
}

// TODO: Add per-tool selection mode when individual tool APIs are available
export const ToolBrowser: FC<ToolBrowserProps> = ({
  selectedToolkits,
  onToolkitsChange,
  height,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetcher = useCallback(
    async (limit: number, offset: number) => {
      const result = await ToolkitsService.getToolkits({
        filters: [],
        limit,
        offset,
      });
      return result;
    },
    [searchTerm],
  );

  const {
    items: toolkits,
    loading,
    hasMore,
    sentinelRef,
  } = useInfiniteScroll<Toolkit>({
    fetcher,
    resetDeps: [searchTerm],
    pageSize: 20,
    debounceMs: 500,
  });

  const isToolkitSelected = (toolkit: Toolkit) =>
    selectedToolkits.some((tk) => tk.toolkitId === toolkit.toolkitId);

  const handleToggleToolkit = (toolkit: Toolkit) => {
    if (isToolkitSelected(toolkit)) {
      onToolkitsChange(
        selectedToolkits.filter((tk) => tk.toolkitId !== toolkit.toolkitId),
      );
    } else {
      onToolkitsChange([...selectedToolkits, toolkit]);
    }
  };

  return (
    <div className="itemBrowser">
      <Input
        placeholder="Search toolkits..."
        prefix={<MagnifyingGlassIcon />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        allowClear
      />

      {selectedToolkits.length > 0 && (
        <div className="selectedList">
          {selectedToolkits.map((toolkit) => (
            <Tag
              key={toolkit.toolkitId}
              closable
              onClose={() => handleToggleToolkit(toolkit)}
            >
              {toolkit.name}
            </Tag>
          ))}
        </div>
      )}

      <div className="itemList" style={{ maxHeight: height ?? 400 }}>
        {toolkits.length === 0 && !loading ? (
          <Empty description="No toolkits found" />
        ) : (
          <>
            {toolkits.map((toolkit) => {
              const selected = isToolkitSelected(toolkit);
              return (
                <div key={toolkit.toolkitId} className="appCard">
                  <div className={`defaultAppIcon ${styles.toolIcon}`}>
                    <ToolboxIcon />
                  </div>
                  <div className="appInfo">
                    <h4>{toolkit.name}</h4>
                    <p title={toolkit.description}>
                      {toolkit.description || 'No description'}
                    </p>
                  </div>
                  <div className="connectAction">
                    <Button
                      size="small"
                      type={selected ? 'primary' : 'default'}
                      icon={selected ? <CheckIcon /> : <PlusIcon />}
                      onClick={() => handleToggleToolkit(toolkit)}
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
