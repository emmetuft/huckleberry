import { FC, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { layout, prepareWithSegments, walkLineRanges } from '@chenglou/pretext';
import styles from './MessageItem.module.css';

const BUBBLE_FONT = '14px Inter, sans-serif';
const BUBBLE_LINE_HEIGHT = 21; // 14px × 1.5
const BUBBLE_PADDING_H = 14; // matches CSS padding: 10px 14px
const BUBBLE_MAX_RATIO = 0.8;

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

export const MessageContent: FC<MessageContentProps> = ({
  content,
  isUser,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tightWidth, setTightWidth] = useState<number | null>(null);

  // Prepare text for measurement (memoized — the expensive Canvas step)
  const prepared = useMemo(() => {
    if (!isUser || !content) return null;
    return prepareWithSegments(content, BUBBLE_FONT);
  }, [isUser, content]);

  // Compute tight bubble width, re-running whenever content or container width changes
  useLayoutEffect(() => {
    if (!ref.current || !prepared) {
      setTightWidth(null);
      return;
    }

    const compute = () => {
      if (!ref.current) return;
      // .message spans full container width; use its clientWidth as the available space
      const containerWidth =
        ref.current.parentElement?.clientWidth ?? ref.current.clientWidth;
      const bubbleMaxWidth = Math.floor(containerWidth * BUBBLE_MAX_RATIO);
      const contentMaxWidth = bubbleMaxWidth - BUBBLE_PADDING_H * 2;

      // Walk lines at max width to get initial line count + widest line
      let maxLineWidth = 0;
      const lineCount = walkLineRanges(prepared, contentMaxWidth, (line) => {
        if (line.width > maxLineWidth) maxLineWidth = line.width;
      });

      // Binary search: find minimum content width that keeps the same line count
      let lo = 1;
      let hi = Math.max(1, Math.ceil(contentMaxWidth));
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (layout(prepared, mid, BUBBLE_LINE_HEIGHT).lineCount <= lineCount) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      }

      // Measure the widest line at the tight content width
      let tightMaxLineWidth = 0;
      walkLineRanges(prepared, lo, (line) => {
        if (line.width > tightMaxLineWidth) tightMaxLineWidth = line.width;
      });

      // Set content width only — CSS padding: 10px 14px is content-box, so it adds on top
      setTightWidth(Math.ceil(tightMaxLineWidth));
    };

    compute();

    // Re-compute whenever the container changes width (e.g. viewport resize)
    const observer = new ResizeObserver(compute);
    observer.observe(ref.current.parentElement ?? ref.current);

    return () => observer.disconnect();
  }, [prepared]);

  return (
    <div
      ref={ref}
      className={styles.content}
      style={tightWidth != null ? { width: tightWidth } : undefined}
    >
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
};
