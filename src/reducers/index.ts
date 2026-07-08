// WARNING: DO NOT DELETE ANY BOILERPLATE COMMENTS IN THIS FILE (start with //-- )
// IF YOU DO, GENERATED REDUCERS WILL NOT BE WIRED UP AUTOMATICALLY.

import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import AppReducer from './app/slice';
import OntologyReducer from './ontology/slice';
import ChatReducer from './chat/slice';
import MetricsReducer from './metrics/slice';
import PeopleReducer from './people/slice';
import ToolkitsReducer from './toolkits/slice';
import WorkspaceReducer from './workspace/slice';
import DatasourceReducer from './datasource/slice';
import AgentsReducer from './agents/slice';
//-- importRef
import SpacesReducer from './spaces/slice';
import { useDispatch } from 'react-redux';
import { errorToastMiddleware } from 'middleware/errorToast';

export const store = configureStore({
  reducer: {
    app: AppReducer,
    agents: AgentsReducer,
    chat: ChatReducer,
    datasource: DatasourceReducer,
    metrics: MetricsReducer,
    ontology: OntologyReducer,
    people: PeopleReducer,
    toolkits: ToolkitsReducer,
    workspace: WorkspaceReducer,
    spaces: SpacesReducer,
    //-- reducerRef
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(errorToastMiddleware),
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
