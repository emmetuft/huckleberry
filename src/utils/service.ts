import {
  AppDBDocument,
  DataFormatTypes,
  ResponseWithBody,
} from '@domoinc/toolkit';
import Cookies from 'js-cookie';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getOauthToken = () => {
  const token = Cookies.get('oauth_token');
  return token ?? '';
};

export const commonHeaders = () => ({
  'Content-Type': DataFormatTypes.json,
  accept: 'application/json',
  'X-EPS-AUTH-TOKEN': getOauthToken(),
});

export function extractAppDbData<T>(
  collection:
    | ResponseWithBody<AppDBDocument<T>>
    | ResponseWithBody<AppDBDocument<T>[]>,
) {
  const data = collection.data;
  // non-iterables throw an exception when trying to access .map
  const extractedData = Array.isArray(data)
    ? data.map((document: AppDBDocument<T>) => ({
        ...document.content,
        id: document.id,
        createdOn: document.createdOn,
        owner: document.owner,
      }))
    : [{ ...data.content, id: data.id, createdOn: data.createdOn }];

  return extractedData;
}

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }

  return result.data as T;
}

export const getDatasetRequestBody = (columnNames: string[]) => {
  // Fetch values from all columns in the dataset
  const requestBody: any = {
    columns: columnNames.map((name) => ({
      exprType: 'COLUMN',
      column: name,
    })),
  };

  return requestBody;
};
