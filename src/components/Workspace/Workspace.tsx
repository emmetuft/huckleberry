import { FC, useEffect, useRef, useState } from 'react';
import styles from './Workspace.module.scss';
import { getCaretCharacterOffsetWithin, setCaretPosition } from 'utils/dom';

interface WorkspaceProps {}

export const Workspace: FC<WorkspaceProps> = ({}) => {
  const editableRef = useRef<HTMLDivElement>(null);

  const ENTITIES = ['dataset', 'workflow', 'agent', 'dashboard', 'chart'];

  const getTextWithHighlights = (text: string): string => {
    const words = text.split(/(\s+)/);
    return words
      .map((word) => {
        const clean = word.trim().toLowerCase();
        if (ENTITIES.includes(clean)) {
          return `<span class="${styles.entity}">${word}</span>`;
        }
        return word;
      })
      .join('');
  };

  const handleInput = () => {
    const el = editableRef.current;
    if (!el) return;

    // 1. Save cursor position before updating HTML
    const preCaretOffset = getCaretCharacterOffsetWithin(el);

    // 2. Get plain text and convert it to highlighted HTML
    const plainText = el.innerText;
    const highlightedHTML = getTextWithHighlights(plainText);

    // 3. Replace HTML
    el.innerHTML = highlightedHTML;

    // 4. Restore cursor position
    setCaretPosition(el, preCaretOffset);
  };

  return (
    <div className={styles.Workspace}>
      <div>
        <div
          className={styles.editable}
          contentEditable
          ref={editableRef}
          onInput={handleInput}
          data-placeholder="Start something new: a workflow, a dashboard, an agent—your call."
        />
      </div>
      {/* <div className={styles.recWrapper}>
        <div className={styles.rec}>
          <h4>Set up automation</h4>
          <p>
            You uploaded sales data yesterday. Let's build an automated report.
          </p>
        </div>
      </div> */}
    </div>
  );
};
