import { FC } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AICursorPopover } from './AICursorPopover';
import { AICursorTrail } from './AICursorTrail';
import { useAICursor } from 'hooks/useAICursor';

export const AICursor: FC = () => {
  const {
    isActive,
    targetRect,
    targetElement,
    selectionBounds,
    elementContext,
    dismiss,
    dragState,
  } = useAICursor();

  return (
    <>
      {dragState.isDragging && <AICursorTrail points={dragState.points} />}
      <AnimatePresence>
        {isActive && targetRect && (
          <AICursorPopover
            key="ai-cursor-popover"
            targetRect={targetRect}
            targetElement={targetElement}
            selectionBounds={selectionBounds}
            elementContext={elementContext}
            onDismiss={dismiss}
          />
        )}
      </AnimatePresence>
    </>
  );
};
