import { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Input, Button, Empty, Tag, Spin } from 'antd';
import {
  CheckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ToolboxIcon,
} from '@phosphor-icons/react';
import styles from './ToolBrowser.module.css';
import { selectToolkits, selectLoading } from 'reducers/toolkits/slice';

interface ToolBrowserProps {
  mode?: 'toolkit';
  selectedToolkitIds: string[];
  onToolkitIdsChange: (ids: string[]) => void;
  height?: number;
}

// TODO: Add per-tool selection mode when individual tool APIs are available
export const ToolBrowser: FC<ToolBrowserProps> = ({
  selectedToolkitIds,
  onToolkitIdsChange,
  height,
}) => {
  const toolkits = useSelector(selectToolkits);
  const loading = useSelector(selectLoading);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredToolkits = useMemo(() => {
    if (!searchQuery) return toolkits;
    const query = searchQuery.toLowerCase();
    return toolkits.filter(
      (tk) =>
        tk.name.toLowerCase().includes(query) ||
        tk.description?.toLowerCase().includes(query),
    );
  }, [toolkits, searchQuery]);

  const isToolkitSelected = (toolkitId: string) =>
    selectedToolkitIds.includes(toolkitId);

  const handleToggleToolkit = (toolkitId: string) => {
    if (isToolkitSelected(toolkitId)) {
      onToolkitIdsChange(selectedToolkitIds.filter((id) => id !== toolkitId));
    } else {
      onToolkitIdsChange([...selectedToolkitIds, toolkitId]);
    }
  };

  if (loading) {
    return (
      <div className={styles.toolBrowser}>
        <Spin size="small" />
      </div>
    );
  }

  return (
    <div className={styles.toolBrowser}>
      <Input
        placeholder="Search toolkits..."
        prefix={<MagnifyingGlassIcon />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        allowClear
      />

      {selectedToolkitIds.length > 0 && (
        <div className={styles.selectedList}>
          {selectedToolkitIds.map((id) => {
            const tk = toolkits.find((t) => t.toolkitId === id);
            return (
              <Tag key={id} closable onClose={() => handleToggleToolkit(id)}>
                {tk?.name ?? id}
              </Tag>
            );
          })}
        </div>
      )}

      {filteredToolkits.length === 0 ? (
        <Empty description="No toolkits found" />
      ) : (
        <div className={styles.toolList} style={{ maxHeight: height ?? 400 }}>
          {filteredToolkits.map((toolkit) => {
            const selected = isToolkitSelected(toolkit.toolkitId);
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
                <div className={styles.connectAction}>
                  <Button
                    size="small"
                    type={selected ? 'primary' : 'default'}
                    icon={selected ? <CheckIcon /> : <PlusIcon />}
                    onClick={() => handleToggleToolkit(toolkit.toolkitId)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
