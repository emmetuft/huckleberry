import mammoth from 'mammoth';
import { ProcessedFile } from 'models/interfaces/files';

/**
 * Maximum file size allowed for upload (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`;
  } else if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  } else {
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  }
}

/**
 * Convert a file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Read text content from a file
 */
export const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Process a file for upload - converts all files to base64
 * This ensures consistent handling and compatibility with AI SDK
 */
export const processFile = async (file: File): Promise<ProcessedFile> => {
  // Convert all files to base64 for consistent handling
  const content = await fileToBase64(file);

  return {
    name: file.name,
    type: file.type,
    size: file.size,
    content,
  };
};

/**
 * Process multiple files
 */
export const processFiles = async (files: File[]): Promise<ProcessedFile[]> => {
  return Promise.all(files.map(processFile));
};

export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
