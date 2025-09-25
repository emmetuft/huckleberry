import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { GraphData, OntologySource } from 'models/interfaces/ontology';
import { DomoAIService } from 'services/ai';

export const generateOntology = createAsyncThunk<GraphData, OntologySource[]>(
  'ontology/generateOntology',
  DomoAIService.generateOntology,
);
