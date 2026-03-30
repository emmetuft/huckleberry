import { DataType } from 'models/enums/dataType';

export interface Column {
  id: string;
  name: string;
  type: DataType;
  metadata: any;
  ai: any;
  visible: boolean;
}
