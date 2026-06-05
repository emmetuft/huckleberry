import { FC, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleNotchIcon, SparkleIcon } from '@phosphor-icons/react';
import styles from './AICursorPopover.module.css';
import { analyzeCursorContext, analyzeScreenshot } from 'services/ai';

interface AICursorPopoverProps {
  targetRect: DOMRect;
  targetElement: HTMLElement | null;
  selectionBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  elementContext: string;
  onDismiss: () => void;
}

function hasUsefulContext(context: string): boolean {
  return context.includes('"') && !context.match(/^<(canvas|svg)>$/);
}

function captureElementScreenshot(
  element: HTMLElement,
  selectionBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null,
): string | null {
  if (!(element instanceof HTMLCanvasElement)) return null;

  try {
    if (
      !selectionBounds ||
      selectionBounds.width === 0 ||
      selectionBounds.height === 0
    ) {
      return element.toDataURL('image/png');
    }

    const elRect = element.getBoundingClientRect();
    const scaleX = element.width / elRect.width;
    const scaleY = element.height / elRect.height;

    const padding = 20;
    const cropX = Math.max(
      0,
      (selectionBounds.x - elRect.left) * scaleX - padding,
    );
    const cropY = Math.max(
      0,
      (selectionBounds.y - elRect.top) * scaleY - padding,
    );
    const cropW = Math.min(
      element.width - cropX,
      selectionBounds.width * scaleX + padding * 2,
    );
    const cropH = Math.min(
      element.height - cropY,
      selectionBounds.height * scaleY + padding * 2,
    );

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropW;
    tempCanvas.height = cropH;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return element.toDataURL('image/png');

    ctx.drawImage(element, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    return tempCanvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

function computePosition(targetRect: DOMRect) {
  const OFFSET = 8;
  const POPOVER_WIDTH = 360;
  const POPOVER_MIN_HEIGHT = 48;

  let top = targetRect.bottom + OFFSET;
  let left = targetRect.left;

  if (left + POPOVER_WIDTH > window.innerWidth - 16) {
    left = window.innerWidth - POPOVER_WIDTH - 16;
  }
  if (left < 16) left = 16;

  if (top + POPOVER_MIN_HEIGHT > window.innerHeight - 16) {
    top = targetRect.top - POPOVER_MIN_HEIGHT - OFFSET;
  }

  return { top, left };
}

export const AICursorPopover: FC<AICursorPopoverProps> = ({
  targetRect,
  targetElement,
  selectionBounds,
  elementContext,
  onDismiss,
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { top, left } = computePosition(targetRect);

  const showScreenshot = true; // DEBUG
  const screenshot = targetElement
    ? captureElementScreenshot(targetElement, selectionBounds)
    : null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onDismiss();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside, true);
  }, [onDismiss]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleSubmit = async () => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let response: string;
      const useImage = !hasUsefulContext(elementContext) && targetElement;
      const submitScreenshot = useImage
        ? captureElementScreenshot(targetElement, selectionBounds)
        : null;

      if (submitScreenshot) {
        response = await analyzeScreenshot(submitScreenshot, trimmed);
      } else {
        response = await analyzeCursorContext(elementContext, trimmed);
      }
      setAnswer(response);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Failed to get a response. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showContext = hasUsefulContext(elementContext);
  const contextPreview = elementContext.includes('\n')
    ? elementContext.split('\n')[0] +
      ` (+${elementContext.split('\n').length - 1} more)`
    : elementContext;

  return (
    <motion.div
      ref={popoverRef}
      className={styles.popover}
      style={{ top, left }}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {showContext && (
        <div className={styles.contextLabel} title={elementContext}>
          {contextPreview}
        </div>
      )}

      {showScreenshot && screenshot && (
        <img
          src={screenshot}
          alt="Element screenshot"
          style={{
            width: '100%',
            maxHeight: 200,
            objectFit: 'contain',
            borderBottom: '1px solid var(--card-border)',
          }}
        />
      )}

      <div className={styles.inputWrapper}>
        <SparkleIcon size={16} weight="fill" />
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        {isLoading && <CircleNotchIcon size={16} className={styles.spinner} />}
      </div>

      <AnimatePresence>
        {answer && (
          <motion.div
            className={styles.answerSection}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <div className={styles.error}>{error}</div>}
    </motion.div>
  );
};
