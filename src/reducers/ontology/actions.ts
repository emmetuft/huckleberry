import { createAsyncThunk } from '@reduxjs/toolkit';
import { GraphData, OntologySource } from 'models/interfaces/ontology';
import { DomoAIService } from 'services/ai';
import { Neo4jService } from 'services/neo4j';
import {
  getGraphFromLocalStorage,
  saveGraphToLocalStorage,
} from 'utils/localStorage';

export const generateOntology = createAsyncThunk<GraphData, OntologySource[]>(
  'ontology/generateOntology',
  DomoAIService.generateOntology,
);

/**
 * Fetch graph data from Neo4j backend with local storage caching
 * Checks cache first, falls back to server if cache is invalid/missing
 */
export const fetchGraphFromNeo4j = createAsyncThunk<
  GraphData,
  { forceRefresh?: boolean } | void
>('ontology/fetchGraphFromNeo4j', async (options) => {
  const forceRefresh =
    options && typeof options === 'object' ? options.forceRefresh : false;

  // Check local storage cache first unless force refresh is requested
  if (!forceRefresh) {
    const cachedData = getGraphFromLocalStorage();
    if (cachedData) {
      console.log('Loading graph from local storage cache');
      return cachedData;
    }
  }

  // Fetch from Neo4j if no cache or force refresh
  console.log('Fetching graph from Neo4j backend');
  const data = await Neo4jService.fetchGraph();

  // Save to local storage for future use
  saveGraphToLocalStorage(data);

  return data;
});
