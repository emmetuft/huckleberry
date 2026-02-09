import { forwardRef, KeyboardEvent } from 'react';
import styles from './IntentInput.module.scss';
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
      <div>
        <div
          className={`${styles.editable} ${isEmpty ? styles.empty : ''} ${disabled ? styles.disabled : ''}`}
          contentEditable={!disabled}
          ref={ref}
          onInput={onInput}
          onKeyDown={onKeyDown}
          data-placeholder={placeholder}
        />
      </div>
    );
  },
);

EditableInput.displayName = 'EditableInput';
