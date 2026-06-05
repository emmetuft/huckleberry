import { useCallback, useEffect, useRef, useState } from 'react';
import {
  extractElementContext,
  extractMultiElementContext,
} from 'utils/elementContext';

const AI_CURSOR_CLASS = 'ai-cursor-active';
const DRAG_THRESHOLD = 5;

interface AICursorState {
  isActive: boolean;
  targetRect: DOMRect | null;
  targetElement: HTMLElement | null;
  selectionBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  elementContext: string;
}

export interface DragState {
  isDragging: boolean;
  points: { x: number; y: number }[];
}

export function useAICursor() {
  const [state, setState] = useState<AICursorState>({
    isActive: false,
    targetRect: null,
    targetElement: null,
    selectionBounds: null,
    elementContext: '',
  });

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    points: [],
  });

  const mouseDownRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const dragPointsRef = useRef<{ x: number; y: number }[]>([]);
  const collectedElementsRef = useRef<Set<HTMLElement>>(new Set());
  const hasDraggedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    setState({
      isActive: false,
      targetRect: null,
      targetElement: null,
      selectionBounds: null,
      elementContext: '',
    });
  }, []);

  const resetDrag = useCallback(() => {
    mouseDownRef.current = false;
    startPointRef.current = null;
    dragPointsRef.current = [];
    collectedElementsRef.current = new Set();
    hasDraggedRef.current = false;
    setDragState({ isDragging: false, points: [] });
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      mouseDownRef.current = true;
      hasDraggedRef.current = false;
      startPointRef.current = { x: e.clientX, y: e.clientY };
      dragPointsRef.current = [{ x: e.clientX, y: e.clientY }];
      collectedElementsRef.current = new Set();

      const target = document.elementFromPoint(
        e.clientX,
        e.clientY,
      ) as HTMLElement | null;
      if (
        target &&
        target !== document.documentElement &&
        target !== document.body
      ) {
        collectedElementsRef.current.add(target);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseDownRef.current) return;

      const start = startPointRef.current;
      if (!start) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (
        !hasDraggedRef.current &&
        Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD
      ) {
        return;
      }

      hasDraggedRef.current = true;
      dragPointsRef.current.push({ x: e.clientX, y: e.clientY });

      const target = document.elementFromPoint(
        e.clientX,
        e.clientY,
      ) as HTMLElement | null;
      if (
        target &&
        target !== document.documentElement &&
        target !== document.body
      ) {
        collectedElementsRef.current.add(target);
      }

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setDragState({
            isDragging: true,
            points: [...dragPointsRef.current],
          });
          rafRef.current = null;
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!mouseDownRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      const wasDragging = hasDraggedRef.current;
      const elements = Array.from(collectedElementsRef.current);
      const points = [...dragPointsRef.current];

      resetDrag();

      if (!wasDragging) {
        const target = document.elementFromPoint(
          e.clientX,
          e.clientY,
        ) as HTMLElement | null;
        if (
          !target ||
          target === document.documentElement ||
          target === document.body
        )
          return;

        const rect = new DOMRect(e.clientX, e.clientY, 0, 0);
        const context = extractElementContext(target);
        setState({
          isActive: true,
          targetRect: rect,
          targetElement: target,
          selectionBounds: null,
          elementContext: context,
        });
      } else if (elements.length > 0) {
        const lastPoint = points[points.length - 1] || {
          x: e.clientX,
          y: e.clientY,
        };
        const rect = new DOMRect(lastPoint.x, lastPoint.y, 0, 0);
        const context =
          elements.length === 1
            ? extractElementContext(elements[0])
            : extractMultiElementContext(elements);

        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
        const bounds = {
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
        };

        setState({
          isActive: true,
          targetRect: rect,
          targetElement: elements[0],
          selectionBounds: bounds,
          elementContext: context,
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetDrag();
        dismiss();
      }
      if (e.key === 'Meta' || e.key === 'Control') {
        document.documentElement.classList.add(AI_CURSOR_CLASS);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') {
        document.documentElement.classList.remove(AI_CURSOR_CLASS);
        if (mouseDownRef.current) {
          resetDrag();
        }
      }
    };

    const handleBlur = () => {
      document.documentElement.classList.remove(AI_CURSOR_CLASS);
      resetDrag();
    };

    const handleClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.documentElement.classList.remove(AI_CURSOR_CLASS);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dismiss, resetDrag]);

  return {
    isActive: state.isActive,
    targetRect: state.targetRect,
    targetElement: state.targetElement,
    selectionBounds: state.selectionBounds,
    elementContext: state.elementContext,
    dismiss,
    dragState,
  };
}
