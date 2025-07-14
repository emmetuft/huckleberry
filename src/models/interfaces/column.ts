import { DataType } from 'models/enums/dataType';

export interface Column {
  name: string;
  id: string;
  type: DataType;
}
