import { RefObject, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { InputCommand } from 'models/enums/inputCommand';
import { setCaretPosition } from 'utils/dom';
import { selectTools } from 'reducers/mcp/slice';
import { selectUsers, selectGroups } from 'reducers/people/slice';
import {
  CommandPopupItem,
  toolToCommandItem,
  mentionToCommandItem,
} from 'models/interfaces/commandPopup';
import { MCPToolDefinition } from '../../shared/models/interfaces/mcpServer';
import { MentionItem } from 'models/interfaces/mention';

export interface CommandConfig<T = any> {
  /** The trigger character (e.g., '/' or '@') */
  trigger: InputCommand;
  /** Whether to remove the command text after selection */
  removeOnSelect: boolean;
  /** Optional: function to generate replacement text (e.g., '@username') */
  replaceWith?: (item: T) => string;
  /** Callback when an item is selected */
  onSelect: (item: T) => void;
  /** Ref to the popup element for click-outside detection */
  popupRef: RefObject<HTMLDivElement>;
}

export interface CommandPopupState {
  /** Whether the popup is currently visible */
  showPopup: boolean;
  /** The current search query after the trigger character */
  searchQuery: string;
  /** The currently selected item index (for keyboard navigation) */
  selectedIndex: number;
  /** The position where the trigger character was detected */
  lastTriggerIndex: number | null;
  /** Filtered items based on search query */
  filteredItems: any[];
  /** Items converted to CommandPopupItem format */
  popupItems: CommandPopupItem[];
  /** The trigger command type */
  trigger: InputCommand;
}

export interface CommandPopupActions<T = any> {
  /** Set the selected index (for keyboard navigation) */
  setSelectedIndex: (index: number | ((prev: number) => number)) => void;
  /** Control popup visibility based on text content */
  controlPopup: (text: string) => void;
  /** Handle item selection */
  handleSelect: (item: T) => void;
  /** Reset popup state */
  resetPopup: () => void;
  /** Close popup and optionally remove trigger text */
  closeAndCleanup: () => void;
  /** Handle keyboard events for the popup (returns true if event was handled) */
  handleKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => boolean;
}

export const useCommandPopup = <T = any>(
  editableRef: RefObject<HTMLDivElement>,
  config: CommandConfig<T>,
): CommandPopupState & CommandPopupActions<T> => {
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastTriggerIndex, setLastTriggerIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Select items from Redux based on trigger
  const mcpTools = useSelector(selectTools);
  const users = useSelector(selectUsers);
  const groups = useSelector(selectGroups);

  const filterMentions = (
    items: MentionItem[],
    searchQuery: string,
  ): MentionItem[] => {
    const searchLower = searchQuery.toLowerCase();
    return items.filter((item) => {
      if ('username' in item) {
        return item.displayName?.toLowerCase().includes(searchLower);
      } else {
        return item.name.toLowerCase().includes(searchLower);
      }
    });
  };

  // Get items based on command type
  const allItems: any[] = useMemo(() => {
    if (config.trigger === InputCommand.TOOL) {
      return mcpTools;
    } else if (config.trigger === InputCommand.MENTION) {
      return [...users, ...groups];
    }
    return [];
  }, [config.trigger, mcpTools, users, groups]);

  // Filter items based on search query
  const filteredItems: any[] = useMemo(() => {
    if (config.trigger === InputCommand.TOOL) {
      return (allItems as MCPToolDefinition[]).filter((tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    } else if (config.trigger === InputCommand.MENTION) {
      return filterMentions(allItems as MentionItem[], searchQuery);
    }
    return allItems;
  }, [allItems, searchQuery, config.trigger]);

  // Convert items to CommandPopupItem format
  const popupItems: CommandPopupItem[] = useMemo(() => {
    if (config.trigger === InputCommand.TOOL) {
      return (filteredItems as MCPToolDefinition[]).map(toolToCommandItem);
    } else if (config.trigger === InputCommand.MENTION) {
      return (filteredItems as MentionItem[]).map(mentionToCommandItem);
    }
    return [];
  }, [filteredItems, config.trigger]);

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsidePopup =
        config.popupRef.current && config.popupRef.current.contains(target);

      const dropdowns = document.querySelectorAll('.ant-select-dropdown');
      const clickedInsideDropdown = Array.from(dropdowns).some((dropdown) =>
        dropdown.contains(target),
      );

      if (!clickedInsidePopup && !clickedInsideDropdown) {
        resetPopup();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [config.popupRef]);

  const controlPopup = (text: string) => {
    const triggerIndex = text.lastIndexOf(config.trigger);

    // If trigger was deleted, close the popup
    if (triggerIndex === -1) {
      if (showPopup) {
        resetPopup();
      }
      return;
    }

    // Extract search query after the trigger character
    const query = text.slice(triggerIndex + 1);

    // If the query contains a space, it means the mention/command is complete
    // and we should close the popup
    if (query.includes(' ')) {
      if (showPopup) {
        resetPopup();
      }
      return;
    }

    setSearchQuery(query);

    // Show popup if it's a new trigger
    if (triggerIndex !== lastTriggerIndex) {
      setShowPopup(true);
      setLastTriggerIndex(triggerIndex);
      setSelectedIndex(0);
    }
  };

  const handleSelect = (item: T) => {
    const el = editableRef.current;
    if (!el) return;

    const text = el.innerText;
    const triggerIndex = text.lastIndexOf(config.trigger);

    if (triggerIndex === -1) return;

    if (config.removeOnSelect) {
      // Tool behavior: remove command and query
      const beforeTrigger = text.slice(0, triggerIndex);
      const newText = triggerIndex === 0 ? '' : beforeTrigger;
      el.innerText = newText;
      setCaretPosition(el, newText.length);
    } else if (config.replaceWith) {
      // Mention behavior: replace with formatted text (e.g., @username)
      const replacement = config.replaceWith(item);
      const beforeTrigger = text.slice(0, triggerIndex);
      const afterQuery = text.slice(triggerIndex + 1 + searchQuery.length);
      const newText = beforeTrigger + replacement + ' ' + afterQuery;
      el.innerText = newText;
      setCaretPosition(el, (beforeTrigger + replacement + ' ').length);
    } else {
      // Default: just close popup and keep text as-is
      const newCaretPosition = triggerIndex + 1 + searchQuery.length;
      setCaretPosition(el, newCaretPosition);
    }

    // Trigger input event to apply highlighting
    el.dispatchEvent(new Event('input', { bubbles: true }));

    config.onSelect(item);
    resetPopup();
    el.focus();
  };

  const resetPopup = () => {
    setShowPopup(false);
    setSearchQuery('');
    setLastTriggerIndex(null);
    setSelectedIndex(0);
  };

  const closeAndCleanup = () => {
    const el = editableRef.current;
    if (el && config.removeOnSelect) {
      const text = el.innerText;
      const triggerIndex = text.lastIndexOf(config.trigger);
      if (triggerIndex !== -1) {
        const newText = text.slice(0, triggerIndex);
        el.innerText = newText;
        setCaretPosition(el, triggerIndex);
      }
    }
    resetPopup();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ): boolean => {
    if (!showPopup || filteredItems.length === 0) {
      return false;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : prev,
      );
      return true;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      return true;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      handleSelect(filteredItems[selectedIndex] as T);
      return true;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeAndCleanup();
      return true;
    }

    return false;
  };

  return {
    showPopup,
    searchQuery,
    selectedIndex,
    lastTriggerIndex,
    filteredItems,
    popupItems,
    trigger: config.trigger,
    setSelectedIndex,
    controlPopup,
    handleSelect,
    resetPopup,
    closeAndCleanup,
    handleKeyDown,
  };
};
