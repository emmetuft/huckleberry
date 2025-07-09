import { AppDBDocument, ResponseWithBody } from '@domoinc/toolkit';

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
