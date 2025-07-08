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
