import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { GraphData, OntologySource } from 'models/interfaces/ontology';
import { DomoAIService } from 'services/ai';
import { Neo4jService } from 'services/neo4j';

export const generateOntology = createAsyncThunk<GraphData, OntologySource[]>(
  'ontology/generateOntology',
  DomoAIService.generateOntology,
);

/**
 * Fetch graph data from Neo4j backend
 */
export const fetchGraphFromNeo4j = createAsyncThunk<GraphData, void>(
  'ontology/fetchGraphFromNeo4j',
  Neo4jService.fetchGraph,
);
