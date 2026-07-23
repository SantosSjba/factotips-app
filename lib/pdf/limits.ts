/** Límites alineados con factotips-py (Settings). */
export const PDF_MAX_UPLOAD_MB = 25;
export const PDF_MAX_UPLOAD_BYTES = PDF_MAX_UPLOAD_MB * 1024 * 1024;
export const PDF_MIN_FILES_MERGE = 2;
export const PDF_MAX_FILES_MERGE = 20;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
