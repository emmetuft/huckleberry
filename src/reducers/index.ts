// WARNING: DO NOT DELETE ANY BOILERPLATE COMMENTS IN THIS FILE (start with //-- )
// IF YOU DO, GENERATED REDUCERS WILL NOT BE WIRED UP AUTOMATICALLY.

import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import AppReducer from './app/slice';
import OntologyReducer from './ontology/slice';
import ApplicationsReducer from './applications/slice';
import GraphRagReducer from './graphRag/slice';
//-- importRef
import { useDispatch } from 'react-redux';

export const store = configureStore({
  reducer: {
    app: AppReducer,
    ontology: OntologyReducer,
    applications: ApplicationsReducer,
    graphRag: GraphRagReducer,
    //-- reducerRef
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
