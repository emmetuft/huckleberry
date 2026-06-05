function getVisibleText(element: HTMLElement): string {
  if (element instanceof HTMLSelectElement) {
    const selected = element.options[element.selectedIndex];
    return selected?.text?.trim() || '';
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    const value = element.value?.trim();
    const placeholder = element.placeholder?.trim();
    if (value && placeholder) return `${value} (${placeholder})`;
    if (value) return value;
    if (placeholder) return placeholder;
    const parentText = element.parentElement?.innerText?.trim() || '';
    if (parentText.length > 0 && parentText.length < 200) return parentText;
    return '';
  }

  if (element instanceof HTMLImageElement) {
    return element.alt?.trim() || '';
  }

  const text = element.innerText?.trim() || '';
  if (text.length > 200) return text.slice(0, 200) + '...';
  return text;
}

export function extractElementContext(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  const text = getVisibleText(element);

  if (!text) return `<${tag}>`;
  return `<${tag}> "${text}"`;
}

export function extractMultiElementContext(elements: HTMLElement[]): string {
  const parentsWithChildren = new Set<HTMLElement>();
  for (const el of elements) {
    for (const other of elements) {
      if (el !== other && el.contains(other)) {
        parentsWithChildren.add(el);
        break;
      }
    }
  }

  const unique = elements.filter((el) => !parentsWithChildren.has(el));
  const contexts = unique
    .map((el) => extractElementContext(el))
    .filter((ctx) => ctx.length > 0);

  const joined = contexts.join('\n');
  if (joined.length > 2000) {
    return joined.slice(0, 2000) + '\n...(truncated)';
  }
  return joined;
}
