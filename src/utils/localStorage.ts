import { GraphData } from 'models/interfaces/ontology';

const GRAPH_DATA_KEY = 'huckleberry_graph_data';
const GRAPH_DATA_TIMESTAMP_KEY = 'huckleberry_graph_timestamp';

// Cache duration in milliseconds (24 hours by default)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

interface CachedGraphData {
  data: GraphData;
  timestamp: number;
}

/**
 * Save graph data to local storage with timestamp
 */
export const saveGraphToLocalStorage = (data: GraphData): void => {
  try {
    const cachedData: CachedGraphData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(GRAPH_DATA_KEY, JSON.stringify(cachedData));
  } catch (error) {
    console.error('Failed to save graph to local storage:', error);
  }
};

/**
 * Retrieve graph data from local storage if valid
 * Returns null if cache is expired or doesn't exist
 */
export const getGraphFromLocalStorage = (): GraphData | null => {
  try {
    const cached = localStorage.getItem(GRAPH_DATA_KEY);
    if (!cached) {
      return null;
    }

    const cachedData: CachedGraphData = JSON.parse(cached);
    const now = Date.now();
    const age = now - cachedData.timestamp;

    // Check if cache is still valid
    if (age > CACHE_DURATION) {
      // Cache expired, remove it
      clearGraphFromLocalStorage();
      return null;
    }

    return cachedData.data;
  } catch (error) {
    console.error('Failed to retrieve graph from local storage:', error);
    return null;
  }
};

/**
 * Clear graph data from local storage
 */
export const clearGraphFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(GRAPH_DATA_KEY);
    localStorage.removeItem(GRAPH_DATA_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Failed to clear graph from local storage:', error);
  }
};

/**
 * Check if cached graph data exists and is valid
 */
export const hasCachedGraph = (): boolean => {
  return getGraphFromLocalStorage() !== null;
};

/**
 * Get the age of cached data in milliseconds
 * Returns null if no cache exists
 */
export const getCacheAge = (): number | null => {
  try {
    const cached = localStorage.getItem(GRAPH_DATA_KEY);
    if (!cached) {
      return null;
    }

    const cachedData: CachedGraphData = JSON.parse(cached);
    return Date.now() - cachedData.timestamp;
  } catch (error) {
    console.error('Failed to get cache age:', error);
    return null;
  }
};
