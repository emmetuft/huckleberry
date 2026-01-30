import { AppDBDocument, ResponseWithBody } from '@domoinc/toolkit';

interface RawAppDBDocument {
  id: string;
  content: any;
  createdOn?: string;
  owner?: number;
}

/**
 * Extract data from AppDB response
 * Converts AppDB document structure to plain objects with id
 * Supports both Domo toolkit format and raw API responses
 */
export function extractAppDbData<T>(
  collection:
    | ResponseWithBody<AppDBDocument<T>>
    | ResponseWithBody<AppDBDocument<T>[]>
    | RawAppDBDocument[]
    | RawAppDBDocument,
) {
  // Handle raw API response (direct array or single document)
  if (Array.isArray(collection)) {
    return collection.map((document: RawAppDBDocument) => ({
      ...document.content,
      id: document.id,
      createdOn: document.createdOn,
      owner: document.owner,
    }));
  }

  // Handle single raw document (not wrapped in ResponseWithBody)
  if ('content' in collection && 'id' in collection) {
    return [{
      ...collection.content,
      id: collection.id,
      createdOn: collection.createdOn,
      owner: collection.owner,
    }];
  }

  // Handle Domo toolkit format (ResponseWithBody)
  const data = (collection as ResponseWithBody<AppDBDocument<T> | AppDBDocument<T>[]>).data;
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
