import { FC, useRef, useState } from 'react';
import { Button } from 'antd';
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
import { sharedIconProps } from 'constants/styles';
import { IconBtn } from 'components/IconBtn/IconBtn';
import {
  getCaretCharacterOffsetWithin,
  getTextWithHighlights,
  setCaretPosition,
} from 'utils/dom';
import { ActionType, getSuggestedActions } from 'utils/temp';
import { TemplateList } from 'components/TemplateList/TemplateList';
import { getFirstName, getTimeOfDay } from 'utils/misc';
import { useSelector } from 'react-redux';
import { selectIdentity } from 'reducers/app/slice';
import { useAppDispatch } from 'reducers';

interface WorkspaceProps {}

export const Workspace: FC<WorkspaceProps> = ({}) => {
  const dispatch = useAppDispatch();
  const identity = useSelector(selectIdentity);

  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const [suggestedActions, setSuggestedActions] = useState<
    { type: ActionType; text: string }[]
  >([]);
  const [showGreeting, setShowGreeting] = useState<boolean>(true);

  const editableRef = useRef<HTMLDivElement>(null);

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
    }

    setCaretPosition(el, preCaretOffset);
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
      <div className={styles.inputWrapper}>
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
