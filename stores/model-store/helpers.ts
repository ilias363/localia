import type { ModelInfo } from "@/types";
import { Directory, File, Paths } from "expo-file-system";

/**
 * Gets the models directory in the app's document storage.
 */
export const getModelsDirectory = (): Directory => {
  return new Directory(Paths.document, "models");
};

/**
 * Ensures the models directory exists, creating it if necessary.
 */
export const ensureModelsDirectory = (): void => {
  const dir = getModelsDirectory();
  if (!dir.exists) {
    dir.create();
  }
};

/**
 * Gets the file path for a model file.
 */
export const getModelFilePath = (fileName: string): File => {
  const dir = getModelsDirectory();
  return new File(dir, fileName);
};

/**
 * Checks if a model file exists and is complete.
 * Returns the file URI if valid, null otherwise.
 */
export const checkModelExists = (modelId: string, models: ModelInfo[]): string | null => {
  const model = models.find(m => m.id === modelId);
  if (!model) return null;

  const filePath = getModelFilePath(model.fileName);
  if (!filePath.exists) return null;

  // Validate file size - must be at least 95% of expected size (allow some tolerance for metadata differences)
  // If sizeBytes is 0 (custom model), skip size validation
  if (model.sizeBytes > 0) {
    try {
      const fileSize = filePath.size ?? 0;
      const minExpectedSize = model.sizeBytes * 0.95;
      if (fileSize < minExpectedSize) {
        // File is incomplete - delete it
        console.warn(
          `Model ${modelId} file is incomplete (${fileSize} < ${model.sizeBytes}). Deleting...`,
        );
        try {
          filePath.delete();
        } catch {
          // Ignore delete errors
        }
        return null;
      }
    } catch {
      // If we can't get file size, just check existence
    }
  }

  return filePath.uri;
};

/**
 * Formats bytes into a human-readable string.
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
