import { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import {
  ArrowUp,
  CalendarBlank,
  ChartLine,
  Database,
  PaperPlaneTilt,
  Plus,
} from 'phosphor-react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Workspace.module.scss';
import { useAppDispatch } from 'reducers';
import { selectIdentity } from 'reducers/app/slice';
import { COMMANDS } from 'constants/app';
import { sharedIconProps } from 'constants/styles';
import { IconBtn } from 'components/IconBtn/IconBtn';
import { TemplateList } from 'components/TemplateList/TemplateList';
import { ToolPopup } from './ToolPopup';
import {
  getCaretCharacterOffsetWithin,
  getTextWithHighlights,
  setCaretPosition,
} from 'utils/dom';
import { getFirstName, getTimeOfDay } from 'utils/misc';
import { ActionType, getSuggestedActions } from 'utils/temp';

interface WorkspaceProps {}

export const Workspace: FC<WorkspaceProps> = ({}) => {
  const dispatch = useAppDispatch();
  const identity = useSelector(selectIdentity);

  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const [suggestedActions, setSuggestedActions] = useState<
    { type: ActionType; text: string }[]
  >([]);
  const [showGreeting, setShowGreeting] = useState<boolean>(true);
  const [showToolPopup, setShowToolPopup] = useState<boolean>(false);
  const [lastPopupTriggerIndex, setLastPopupTriggerIndex] = useState<
    number | null
  >(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const editableRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsidePopup =
        popupRef.current && popupRef.current.contains(target);

      const dropdowns = document.querySelectorAll('.ant-select-dropdown');
      const clickedInsideDropdown = Array.from(dropdowns).some((dropdown) =>
        dropdown.contains(target),
      );

      if (!clickedInsidePopup && !clickedInsideDropdown) {
        setShowToolPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onInput = () => {
    setShowGreeting(false);
    const el = editableRef.current;
    if (!el) return;

    const preCaretOffset = getCaretCharacterOffsetWithin(el);

    const text = el.innerText;
    const isNowEmpty = text.trim() === '';
    setIsEmpty(isNowEmpty);

    if (isNowEmpty) {
      el.innerHTML = '';
    } else {
      setSuggestedActions(getSuggestedActions(text));
      const highlightedHTML = getTextWithHighlights(text, styles);
      el.innerHTML = highlightedHTML;
      controlToolPopup(text, el);
    }

    setCaretPosition(el, preCaretOffset);
  };

  const controlToolPopup = (text: string, el: HTMLElement) => {
    // Reset popup trigger if the command was removed
    if (
      lastPopupTriggerIndex !== null &&
      (text.length < lastPopupTriggerIndex ||
        text[lastPopupTriggerIndex] !== COMMANDS.TOOL)
    ) {
      setLastPopupTriggerIndex(null);
    }

    // Check if user typed tool command and trigger popup
    const atIndex = text.lastIndexOf(COMMANDS.TOOL);
    if (atIndex === -1 || atIndex === lastPopupTriggerIndex) return;

    setShowToolPopup(true);
    setLastPopupTriggerIndex(atIndex);

    setTimeout(() => popupInputRef.current?.focus(), 0);
  };

  const onPopupKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(event);
    if (event.key === 'Backspace' && !event.currentTarget.value) {
      event.preventDefault(); // Prevent deleting command
      setShowToolPopup(false);

      const el = editableRef.current;
      if (el) {
        el.focus();
        const text = el.innerText;
        const atIndex = text.lastIndexOf(COMMANDS.TOOL);
        if (atIndex !== -1) {
          setCaretPosition(el, atIndex + 1);
        }
      }
    }
  };

  const onSelectTool = (value: string) => {
    // Add value to selectedTools, avoiding duplicates
    if (selectedTools.includes(value)) return;
    setSelectedTools([...selectedTools, value]);
    setShowToolPopup(false);

    // Remove command from the editable content
    const el = editableRef.current;
    if (!el) return;
    const text = el.innerText;
    const atIndex = text.lastIndexOf(COMMANDS.TOOL);
    if (atIndex !== -1) {
      el.innerText = text.slice(0, atIndex) + text.slice(atIndex + 1);
    }
    // Refocus the editable element
    el.focus();
    // Set caret position after the inserted tool
    const newText = el.innerText + ' ';
    el.innerText = newText;
    setCaretPosition(el, newText.length);
  };

  const onRemoveTool = (tool: string) => {
    setSelectedTools(selectedTools.filter((t) => t !== tool));
  };

  const onClickSend = () => {
    // TODO: Implement send action
  };

  const actionIconMap = {
    [ActionType.SCHEDULE]: <CalendarBlank {...sharedIconProps} size={16} />,
    [ActionType.CHART]: <ChartLine {...sharedIconProps} size={16} />,
    [ActionType.DATASET]: <Database {...sharedIconProps} size={16} />,
    [ActionType.SEND]: <PaperPlaneTilt {...sharedIconProps} size={16} />,
  };

  return (
    <div className={styles.Workspace}>
      {showToolPopup && (
        <ToolPopup
          popupRef={popupRef}
          inputRef={popupInputRef}
          onPopupKeyDown={onPopupKeyDown}
          onSelectTool={onSelectTool}
        />
      )}
      <div className={styles.inputWrapper}>
        {selectedTools.length > 0 && (
          <div className={styles.selectedTools}>
            {selectedTools.map((tool) => (
              <div key={tool} className={styles.tool}>
                <p>{tool}</p>
                <button onClick={() => onRemoveTool(tool)}>
                  <CloseOutlined className={styles.closeIcon} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div>
          <div
            className={`${styles.editable} ${isEmpty ? styles.empty : ''}`}
            contentEditable
            ref={editableRef}
            onInput={onInput}
            data-placeholder="Start something new: a workflow, a dashboard, an agent—your call."
          />
        </div>
        <div className={styles.actions}>
          <div className={styles.buttons}>
            <IconBtn icon={<Plus {...sharedIconProps} size={16} />} />
            <AnimatePresence>
              {suggestedActions.map((action) => (
                <motion.div
                  key={action.type}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button type="text" icon={actionIconMap[action.type]}>
                    {action.text}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {showGreeting && identity && (
              <motion.p
                className={styles.greeting}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {`Good ${getTimeOfDay()}, ${getFirstName(identity)}!`}
              </motion.p>
            )}
          </AnimatePresence>
          <Button
            shape="circle"
            type="text"
            icon={<ArrowUp color={isEmpty ? '#2c2b2a' : 'white'} size={16} />}
            style={{ backgroundColor: isEmpty ? 'transparent' : '#4a23d1' }}
            onClick={onClickSend}
          />
        </div>
      </div>
      <TemplateList />
    </div>
  );
};
