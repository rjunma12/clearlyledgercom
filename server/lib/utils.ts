import fs from 'fs';

/**
 * Safely delete a temporary file.
 */
export function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    console.warn(`[Server] Failed to clean up temp file: ${filePath}`);
  }
}
