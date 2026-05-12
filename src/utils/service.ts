interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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
