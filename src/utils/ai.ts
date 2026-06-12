import { FieldOption } from 'components/shared/LabelInput/LabelInput';
import { GraphData } from 'models/interfaces/ontology';

export const buildFieldGenerationPrompt = (
  label: string,
  description: string,
  context: any,
  options?: FieldOption[],
) => {
  const optionsHint = options?.length
    ? ` Choose one of these valid options and return its value exactly: ${options
        .map(
          (o) =>
            `"${o.value}" (${o.label})${o.description ? ` - ${o.description}` : ''}`,
        )
        .join(', ')}.`
    : '';

  const system = `You are an assistant helping configure an AI agent. Generate an appropriate value for the agent's "${label}" field. ${description ?? ''}${optionsHint} Be short and concise. Respond ONLY with the raw value, with no JSON or surrounding text.`;

  const input = context
    ? `Current agent configuration:\n${context}`
    : 'No other fields have been filled out yet. Generate a reasonable default.';

  return { system, input };
};

export const isValidGraphData = (data: any): data is GraphData => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check if nodes array exists and is valid
  if (!Array.isArray(data.nodes)) {
    return false;
  }

  // Validate each node
  for (const node of data.nodes) {
    if (
      !node ||
      typeof node !== 'object' ||
      typeof node.id !== 'string' ||
      typeof node.group !== 'number'
    ) {
      return false;
    }
  }

  // Check if links array exists and is valid
  if (!Array.isArray(data.links)) {
    return false;
  }

  // Validate each link
  for (const link of data.links) {
    if (
      !link ||
      typeof link !== 'object' ||
      typeof link.source !== 'string' ||
      typeof link.target !== 'string' ||
      typeof link.type !== 'string' ||
      typeof link.value !== 'number'
    ) {
      return false;
    }
  }

  return true;
};

export const filterInvalidLinks = (data: GraphData): GraphData => {
  const validNodeIds = new Set(data.nodes.map((node) => node.id));
  const filteredLinks = data.edges.filter(
    (link) => validNodeIds.has(link.source) && validNodeIds.has(link.target),
  );
  return { ...data, edges: filteredLinks };
};
