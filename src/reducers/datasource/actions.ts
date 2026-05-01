import { createAsyncThunk } from '@reduxjs/toolkit';
import { DataService } from 'services/data';
import { DataSource } from 'models/interfaces/dataSource';
import { Column } from 'models/interfaces/column';

export const fetchDataSource = createAsyncThunk<
  { dataSource: DataSource; columns: Column[] },
  string
>('datasource/fetchDataSource', DataService.fetchDataSource);
