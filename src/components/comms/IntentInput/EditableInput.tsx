import { forwardRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './IntentInput.module.css';
import {
  getCaretCharacterOffsetWithin,
  getTextWithHighlights,
  setCaretPosition,
} from 'utils/dom';

interface EditableInputProps {
  isEmpty: boolean;
  disabled: boolean;
  placeholder: string;
  onTextChange: (text: string, isEmpty: boolean) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

export const EditableInput = forwardRef<HTMLDivElement, EditableInputProps>(
  ({ isEmpty, disabled, placeholder, onTextChange, onKeyDown }, ref) => {
    const onInput = () => {
      const el = ref as React.RefObject<HTMLDivElement>;
      if (!el || !el.current) return;

      const element = el.current;
      const preCaretOffset = getCaretCharacterOffsetWithin(element);

      const text = element.innerText;
      const isNowEmpty = text.trim() === '';

      if (isNowEmpty) {
        element.innerHTML = '';
      } else {
        const highlightedHTML = getTextWithHighlights(text, styles);
        element.innerHTML = highlightedHTML;
      }

      setCaretPosition(element, preCaretOffset);
      onTextChange(text, isNowEmpty);
    };

    return (
      <div className={styles.wrapper}>
        <AnimatePresence mode="wait">
          {isEmpty && (
            <motion.span
              key={placeholder}
              className={styles.placeholder}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {placeholder}
            </motion.span>
          )}
        </AnimatePresence>

        <div
          className={`${styles.editable} ${disabled ? styles.disabled : ''}`}
          contentEditable={!disabled}
          ref={ref}
          onInput={onInput}
          onKeyDown={onKeyDown}
        />
      </div>
    );
  },
);

EditableInput.displayName = 'EditableInput';
