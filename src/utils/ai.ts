import { GraphData } from 'models/interfaces/ontology';

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
  const filteredLinks = data.relationships.filter(
    (link) => validNodeIds.has(link.source) && validNodeIds.has(link.target),
  );
  return { ...data, relationships: filteredLinks };
};
