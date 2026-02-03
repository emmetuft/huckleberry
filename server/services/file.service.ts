import { MAX_FILE_SIZE, formatFileSize } from '../../shared/constants/files.ts';
import { ProcessedFile } from '../../shared/models/interfaces/files.ts';

/**
 * Service for processing and handling uploaded files
 */
class FileService {
  /**
   * Convert ProcessedFiles to AI SDK file parts format
   * This format allows the AI to natively process files (PDFs, images, etc.)
   */
  buildFilePartsForAI(files: ProcessedFile[]): Array<{
    type: 'file';
    mediaType: string;
    data: Buffer;
    filename: string;
  }> {
    if (!files || files.length === 0) {
      return [];
    }

    return files.map((file) => {
      // All files are base64 encoded from frontend - convert to Buffer for AI SDK
      const data = Buffer.from(file.content, 'base64');

      return {
        type: 'file' as const,
        mediaType: file.type,
        data,
        filename: file.name,
      };
    });
  }

  /**
   * Validate uploaded files and filter out invalid ones
   * Returns valid files and warnings for any files that were filtered out
   */
  validateAndFilterFiles(files: ProcessedFile[]): {
    validFiles: ProcessedFile[];
    warnings: string[];
  } {
    const warnings: string[] = [];
    const validFiles: ProcessedFile[] = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        warnings.push(
          `File "${file.name}" exceeds maximum size of ${formatFileSize(MAX_FILE_SIZE)} and was excluded`,
        );
      } else {
        validFiles.push(file);
      }
    });

    return {
      validFiles,
      warnings,
    };
  }
}

export const fileService = new FileService();
