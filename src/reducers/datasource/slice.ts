import { createAppSlice } from '../createAppSlice';
import { DataSource } from 'models/interfaces/dataSource';
import { Column } from 'models/interfaces/column';
import { fetchDataSource } from './actions';
import { Filter } from 'models/interfaces/filter';

interface State {
  dataSource: DataSource | null;
  schema: Column[];
  columnDistributions: Record<string, Record<string, number>>;
  pageData: any[];
  dataLoadedList: string[];
  filters: Filter[];
  page: number;
  numRows: number;
  loading: {
    dataSource: boolean;
    schema: boolean;
  };
}

const initialState: State = {
  dataSource: null,
  schema: [],
  columnDistributions: {},
  pageData: [],
  dataLoadedList: [],
  filters: [],
  page: 1,
  numRows: 0,
  loading: {
    dataSource: false,
    schema: false,
  },
};

export const DatasourceReducer = createAppSlice({
  name: 'datasource',
  initialState,
  reducers: (create) => ({
    clearDataSource: create.reducer((state) => {
      state.dataSource = null;
      state.schema = [];
      state.page = initialState.page;
      state.numRows = initialState.numRows;
    }),
    setColumnDistributions: create.reducer(
      (state, action: { payload: Record<string, Record<string, number>> }) => {
        state.columnDistributions = action.payload;
      },
    ),
    setPageData: create.reducer((state, action: { payload: any[] }) => {
      state.pageData = action.payload;
    }),
    addDataLoaded: create.reducer((state, action: { payload: string }) => {
      if (!state.dataLoadedList.includes(action.payload)) {
        state.dataLoadedList.push(action.payload);
      }
    }),
    setFilters: create.reducer((state, action: { payload: Filter[] }) => {
      state.filters = action.payload;
    }),
    setPage: create.reducer((state, action: { payload: number }) => {
      state.page = action.payload;
    }),
    setNumRows: create.reducer((state, action: { payload: number }) => {
      state.numRows = action.payload;
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataSource.pending, (state) => {
        state.loading.dataSource = true;
      })
      .addCase(fetchDataSource.rejected, (state) => {
        state.loading.dataSource = false;
      })
      .addCase(fetchDataSource.fulfilled, (state, { payload }) => {
        state.dataSource = payload.dataSource;
        state.schema = payload.columns;
        state.loading.dataSource = false;
      });
  },
  selectors: {
    selectDataSource: (state) => state.dataSource,
    selectDataSourceSchema: (state) => state.schema,
    selectColumnDistributions: (state) => state.columnDistributions,
    selectPageData: (state) => state.pageData,
    selectDataLoadedList: (state) => state.dataLoadedList,
    selectFilters: (state) => state.filters,
    selectPage: (state) => state.page,
    selectNumRows: (state) => state.numRows,
    selectDataSourceLoading: (state) => state.loading,
  },
});

export const {
  clearDataSource,
  setColumnDistributions,
  setPageData,
  addDataLoaded,
  setFilters,
  setPage,
  setNumRows,
} = DatasourceReducer.actions;
export const {
  selectDataSource,
  selectDataSourceSchema,
  selectColumnDistributions,
  selectPageData,
  selectDataLoadedList,
  selectFilters,
  selectPage,
  selectNumRows,
  selectDataSourceLoading,
} = DatasourceReducer.selectors;

export default DatasourceReducer.reducer;
