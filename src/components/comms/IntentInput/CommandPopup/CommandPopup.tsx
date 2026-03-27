import { useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './CommandPopup.module.css';
import { selectIdentity } from 'reducers/app/slice';
import { InputCommand } from 'models/enums/inputCommand';
import { CommandPopupItem } from 'models/interfaces/commandPopup';
import { CommandPopupState, CommandPopupActions } from 'hooks/useCommandPopup';

interface CommandPopupProps {
  popupRef: React.RefObject<HTMLDivElement>;
  popup: CommandPopupState & CommandPopupActions<any>;
}

export const CommandPopup = ({ popupRef, popup }: CommandPopupProps) => {
  const identity = useSelector(selectIdentity);
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const { popupItems, selectedIndex, filteredItems, trigger } = popup;

  // Group items by groupKey
  const groupedItems = useMemo(() => {
    const grouped: Record<string, CommandPopupItem[]> = {};

    for (const item of popupItems) {
      const groupKey = item.groupKey || 'default';
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(item);
    }

    return grouped;
  }, [popupItems]);

  // Flatten items for indexing
  const flatItems = useMemo(() => {
    return Object.values(groupedItems).flat();
  }, [groupedItems]);

  // Scroll selected item into view when selection changes
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  const handleSelectItem = (item: CommandPopupItem) => {
    const originalItem = filteredItems.find((i: any) => {
      // For tools: match by serverId and name
      if ('serverId' in i && 'name' in i) {
        return `${i.serverId}-${i.name}` === item.id;
      }
      // For mentions: match by id
      return i.id === item.id;
    });
    if (originalItem) {
      popup.handleSelect(originalItem);
    }
  };

  const renderItem = (item: CommandPopupItem) => {
    if (trigger === InputCommand.TOOL) {
      return (
        <>
          <span className={styles.itemName}>{item.name}</span>
          {item.description && (
            <span className={styles.itemDescription}>{item.description}</span>
          )}
        </>
      );
    } else if (trigger === InputCommand.MENTION) {
      const avatar =
        identity !== undefined
          ? `https://${identity.host}/api/content/v1/avatar/USER/${item.id}?size=100`
          : undefined;

      return (
        <div className={styles.nameWithAvatar}>
          {avatar && (
            <img
              src={avatar}
              alt={`${item.name}'s avatar`}
              className={styles.avatar}
            />
          )}
          <span className={styles.itemName}>{item.name}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={popupRef} className={`${styles.commandPopup} card`}>
      <div className={styles.itemList}>
        {Object.entries(groupedItems).map(([groupKey, groupItems]) => {
          const firstItem = groupItems[0];
          const groupName = firstItem.groupName || groupKey;

          return (
            <div key={groupKey} className={styles.itemGroup}>
              {groupKey !== 'default' && (
                <div className={styles.groupName}>{groupName}</div>
              )}
              {groupItems.map((item) => {
                const itemIndex = flatItems.findIndex((i) => i.id === item.id);
                const isSelected = itemIndex === selectedIndex;

                return (
                  <div
                    key={item.id}
                    ref={isSelected ? selectedItemRef : null}
                    className={`${styles.item} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleSelectItem(item)}
                  >
                    {renderItem(item)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className={styles.hint}>
        <span>↑↓ Navigate</span>
        <span>↵ Select</span>
        <span>Esc Cancel</span>
      </div>
    </div>
  );
};
