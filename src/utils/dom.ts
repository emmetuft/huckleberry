import { ENTITIES } from 'constants/app';

export const getTextWithHighlights = (text: string, styles: any): string => {
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

export function getCaretCharacterOffsetWithin(element: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  return preCaretRange.toString().length;
}

export function setCaretPosition(element: HTMLElement, offset: number) {
  const range = document.createRange();
  const selection = window.getSelection();
  let currentOffset = 0;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let node: Text | null = null;

  while ((node = walker.nextNode() as Text | null)) {
    const textLength = node.textContent?.length ?? 0;
    if (currentOffset + textLength >= offset) {
      const localOffset = offset - currentOffset;
      range.setStart(node, localOffset);
      range.collapse(true);
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      return;
    }
    currentOffset += textLength;
  }
}

export function getCharRectAtOffset(
  el: HTMLElement,
  offset: number,
): DOMRect | null {
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);

  let currentOffset = 0;
  let node: Text | null = null;

  while ((node = walker.nextNode() as Text | null)) {
    const textLength = node.textContent?.length ?? 0;
    if (currentOffset + textLength >= offset) {
      const localOffset = offset - currentOffset;
      range.setStart(node, localOffset);
      range.setEnd(node, localOffset + 1);
      return range.getBoundingClientRect();
    }
    currentOffset += textLength;
  }

  return null;
}
