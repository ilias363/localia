import { AVAILABLE_MODELS, CUSTOM_MODEL_PREFIX } from "@/constants/models";
import type { ActiveModel, CustomModelInfo, ModelInfo, ModelState } from "@/types";
import {
  completeHandler,
  createDownloadTask,
  type DownloadTask,
} from "@kesha-antonov/react-native-background-downloader";
import { Directory, File, Paths } from "expo-file-system";
import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { zustandStorage } from "./mmkv";

// Store version for migrations
const STORE_VERSION = 1;

// Non-persisted runtime state (download refs, loading states)
interface RuntimeState {
  downloadTasks: Record<string, DownloadTask>;
  cancelledDownloads: Set<string>;
}

const runtimeState: RuntimeState = {
  downloadTasks: {},
  cancelledDownloads: new Set(),
};

// Persisted state
interface ModelStoreState {
  models: ModelInfo[];
  modelStates: Record<string, ModelState>;
  activeModelId: string | null;
  activeModelPath: string | null;
  initialized: boolean;
  _hasHydrated: boolean;
}

// Actions
interface ModelStoreActions {
  // Hydration
  setHasHydrated: (state: boolean) => void;

  // Getters
  getActiveModel: () => ActiveModel | null;
  getModelState: (modelId: string) => ModelState;
  isModelReady: () => boolean;

  // State mutations
  updateModelState: (modelId: string, update: Partial<ModelState>) => void;
  setModelError: (modelId: string, error: string) => void;
  setModelReady: (modelId: string, localPath: string) => void;
  setActiveModel: (model: ActiveModel | null) => void;

  // Model operations
  downloadModel: (modelId: string) => Promise<void>;
  cancelDownload: (modelId: string) => void;
  deleteModel: (modelId: string) => Promise<void>;
  loadModel: (modelId: string) => Promise<void>;
  unloadModel: () => Promise<void>;
  importModel: (customInfo: CustomModelInfo) => Promise<ModelInfo | null>;

  // Initialization
  initialize: () => void;
}

type ModelStore = ModelStoreState & ModelStoreActions;

// Helper functions
const getModelsDirectory = (): Directory => {
  return new Directory(Paths.document, "models");
};

const ensureModelsDirectory = (): void => {
  const dir = getModelsDirectory();
  if (!dir.exists) {
    dir.create();
  }
};

const getModelFilePath = (fileName: string): File => {
  const dir = getModelsDirectory();
  return new File(dir, fileName);
};

const checkModelExists = (modelId: string, models: ModelInfo[]): string | null => {
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

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const useModelStore = create<ModelStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        models: [...AVAILABLE_MODELS],
        modelStates: {},
        activeModelId: null,
        activeModelPath: null,
        initialized: false,
        _hasHydrated: false,

        // Hydration setter
        setHasHydrated: (state: boolean) => {
          set({ _hasHydrated: state });
        },

        // Getters
        getActiveModel: () => {
          const { activeModelId, activeModelPath, models } = get();
          if (!activeModelId || !activeModelPath) return null;
          const model = models.find(m => m.id === activeModelId);
          if (!model) return null;
          return { info: model, localPath: activeModelPath };
        },

        getModelState: (modelId: string) => {
          const { modelStates } = get();
          return modelStates[modelId] ?? { status: "not-downloaded", progress: 0 };
        },

        isModelReady: () => {
          const { activeModelId, modelStates } = get();
          if (!activeModelId) return false;
          return modelStates[activeModelId]?.status === "ready";
        },

        // State mutations
        updateModelState: (modelId: string, update: Partial<ModelState>) => {
          set(state => {
            const existing = state.modelStates[modelId] ?? {
              status: "not-downloaded" as const,
              progress: 0,
            };
            return {
              modelStates: {
                ...state.modelStates,
                [modelId]: { ...existing, ...update },
              },
            };
          });
        },

        setModelError: (modelId: string, error: string) => {
          get().updateModelState(modelId, { status: "error", error });
        },

        setModelReady: (modelId: string, localPath: string) => {
          const { models, updateModelState } = get();
          const model = models.find(m => m.id === modelId);
          if (model) {
            updateModelState(modelId, { status: "ready", localPath });
            set({ activeModelId: modelId, activeModelPath: localPath });
          }
        },

        setActiveModel: (model: ActiveModel | null) => {
          if (model) {
            set({ activeModelId: model.info.id, activeModelPath: model.localPath });
          } else {
            set({ activeModelId: null, activeModelPath: null });
          }
        },

        // Model operations
        downloadModel: async (modelId: string) => {
          const { models, updateModelState } = get();
          const model = models.find(m => m.id === modelId);
          if (!model) {
            throw new Error(`Model ${modelId} not found`);
          }

          try {
            ensureModelsDirectory();

            // Check if already downloaded
            const existingPath = checkModelExists(modelId, models);
            if (existingPath) {
              updateModelState(modelId, {
                status: "downloaded",
                progress: 100,
                localPath: existingPath,
              });
              return;
            }

            updateModelState(modelId, { status: "downloading", progress: 0 });

            const modelFile = getModelFilePath(model.fileName);

            // Clear any previous cancelled state for this model
            runtimeState.cancelledDownloads.delete(modelId);

            // Use a unique task ID to avoid library caching issues
            const taskId = `${modelId}-${Date.now()}`;

            // Use background downloader for non-blocking downloads
            const task = createDownloadTask({
              id: taskId,
              url: model.downloadUrl,
              destination: modelFile.uri,
            });

            // Store for cancellation
            runtimeState.downloadTasks[modelId] = task;

            return new Promise<void>((resolve, reject) => {
              task
                .begin(({ expectedBytes }) => {
                  console.log(`Starting download of ${model.name}: ${expectedBytes} bytes`);
                })
                .progress(({ bytesDownloaded, bytesTotal }) => {
                  // Check if cancelled during download
                  if (runtimeState.cancelledDownloads.has(modelId)) {
                    return;
                  }
                  const progress = bytesTotal > 0 ? (bytesDownloaded / bytesTotal) * 100 : 0;
                  const roundedProgress = Math.round(progress * 10) / 10;
                  updateModelState(modelId, {
                    status: "downloading",
                    progress: Math.min(roundedProgress, 99.9),
                  });
                })
                .done(({ bytesDownloaded, bytesTotal }) => {
                  delete runtimeState.downloadTasks[modelId];
                  completeHandler(taskId);

                  // Check if download was cancelled while in progress
                  if (runtimeState.cancelledDownloads.has(modelId)) {
                    runtimeState.cancelledDownloads.delete(modelId);
                    updateModelState(modelId, { status: "not-downloaded", progress: 0 });
                    resolve();
                    return;
                  }

                  // Verify downloaded file size
                  const downloadedFile = new File(modelFile.uri);
                  if (downloadedFile.exists && model.sizeBytes > 0) {
                    const fileSize = downloadedFile.size ?? 0;
                    const minExpectedSize = model.sizeBytes * 0.95;
                    if (fileSize < minExpectedSize) {
                      try {
                        downloadedFile.delete();
                      } catch {
                        // Ignore delete errors
                      }
                      reject(
                        new Error(
                          `Download incomplete: got ${formatBytes(fileSize)}, expected ${model.size}`,
                        ),
                      );
                      return;
                    }
                  }

                  updateModelState(modelId, {
                    status: "downloaded",
                    progress: 100,
                    localPath: modelFile.uri,
                  });
                  resolve();
                })
                .error(({ error, errorCode }) => {
                  delete runtimeState.downloadTasks[modelId];

                  // Check if download was cancelled
                  if (runtimeState.cancelledDownloads.has(modelId)) {
                    runtimeState.cancelledDownloads.delete(modelId);
                    updateModelState(modelId, { status: "not-downloaded", progress: 0 });
                    resolve();
                    return;
                  }

                  // Don't report cancellation/abort as an error
                  if (
                    error.toLowerCase().includes("cancel") ||
                    error.toLowerCase().includes("abort") ||
                    error.toLowerCase().includes("stop")
                  ) {
                    updateModelState(modelId, { status: "not-downloaded", progress: 0 });
                    resolve();
                    return;
                  }

                  updateModelState(modelId, {
                    status: "error",
                    error: error,
                  });
                  reject(new Error(error));
                });

              // Start the download
              task.start();
            });
          } catch (error) {
            delete runtimeState.downloadTasks[modelId];

            // Check if download was cancelled
            if (runtimeState.cancelledDownloads.has(modelId)) {
              runtimeState.cancelledDownloads.delete(modelId);
              updateModelState(modelId, { status: "not-downloaded", progress: 0 });
              return;
            }

            const errorMessage = error instanceof Error ? error.message : "Unknown download error";
            updateModelState(modelId, {
              status: "error",
              error: errorMessage,
            });
            throw error;
          }
        },

        cancelDownload: (modelId: string) => {
          // Update UI immediately
          runtimeState.cancelledDownloads.add(modelId);
          get().updateModelState(modelId, { status: "not-downloaded", progress: 0 });

          // Stop the download task (instant, non-blocking)
          const task = runtimeState.downloadTasks[modelId];
          if (task) {
            delete runtimeState.downloadTasks[modelId];
            task.stop().catch(() => { });
          }

          // Clean up partial file after a delay
          const { models } = get();
          const model = models.find(m => m.id === modelId);
          if (model) {
            const modelFile = getModelFilePath(model.fileName);
            setTimeout(() => {
              try {
                if (modelFile.exists) modelFile.delete();
              } catch { }
            }, 500);
          }
        },

        deleteModel: async (modelId: string) => {
          const { getModelState, activeModelId } = get();
          const state = getModelState(modelId);

          // Clean up any pending download state
          runtimeState.cancelledDownloads.delete(modelId);
          const task = runtimeState.downloadTasks[modelId];
          if (task) {
            delete runtimeState.downloadTasks[modelId];
            task.stop().catch(() => { });
          }

          // Unload if active
          if (activeModelId === modelId) {
            set({ activeModelId: null, activeModelPath: null });
          }

          // Delete file if exists
          if (state.localPath) {
            try {
              const file = new File(state.localPath);
              if (file.exists) {
                file.delete();
              }
            } catch (error) {
              console.warn("Failed to delete model file:", error);
            }
          }

          // Remove custom models from the list
          if (modelId.startsWith(CUSTOM_MODEL_PREFIX)) {
            set(state => ({
              models: state.models.filter(m => m.id !== modelId),
            }));
          }

          // Reset state
          set(state => {
            const newStates = { ...state.modelStates };
            delete newStates[modelId];
            return { modelStates: newStates };
          });
        },

        loadModel: async (modelId: string) => {
          const { models, getModelState, updateModelState } = get();
          const model = models.find(m => m.id === modelId);
          if (!model) {
            throw new Error(`Model ${modelId} not found`);
          }

          const state = getModelState(modelId);

          // Check if model is downloaded
          let localPath = state.localPath;
          if (!localPath) {
            localPath = checkModelExists(modelId, models) ?? undefined;
            if (!localPath) {
              throw new Error("Model not downloaded");
            }
          }

          updateModelState(modelId, { status: "loading", progress: 0, localPath });
          // The actual model loading will be done by the LLM service
          // which will call setModelReady when done
        },

        unloadModel: async () => {
          const activeModel = get().getActiveModel();
          if (activeModel) {
            get().updateModelState(activeModel.info.id, {
              status: "downloaded",
              localPath: activeModel.localPath,
            });
            set({ activeModelId: null, activeModelPath: null });
          }
        },

        importModel: async (customInfo: CustomModelInfo) => {
          const { models, updateModelState } = get();

          try {
            ensureModelsDirectory();

            const destFile = getModelFilePath(customInfo.fileName);

            // Check if a predefined model with this filename already exists
            // If so, use that model instead of creating a duplicate
            const existingModel = models.find(m => m.fileName === customInfo.fileName);
            if (existingModel) {
              // Copy file if it doesn't exist yet
              if (!destFile.exists) {
                const sourceFile = new File(customInfo.fileUri);
                sourceFile.copy(destFile);
                // Clean up source file from cache
                try {
                  sourceFile.delete();
                } catch {
                  // Ignore cleanup errors
                }
              }

              updateModelState(existingModel.id, {
                status: "downloaded",
                progress: 100,
                localPath: destFile.uri,
              });
              return existingModel;
            }

            // Copy file to app's documents directory
            const sourceFile = new File(customInfo.fileUri);
            sourceFile.copy(destFile);
            // Clean up source file from cache
            try {
              sourceFile.delete();
            } catch {
              // Ignore cleanup errors
            }

            // Create a custom model entry with user-provided info
            const customModel: ModelInfo = {
              id: `${CUSTOM_MODEL_PREFIX}${Date.now()}`,
              name: customInfo.name,
              provider: customInfo.provider,
              description: customInfo.description,
              size: customInfo.fileSize ? formatBytes(customInfo.fileSize) : "Unknown",
              sizeBytes: customInfo.fileSize ?? 0,
              downloadUrl: "",
              fileName: customInfo.fileName,
              quantization: customInfo.quantization,
              contextLength: customInfo.contextLength,
              chatTemplate: customInfo.chatTemplate,
            };

            set(state => ({
              models: [...state.models, customModel],
            }));

            updateModelState(customModel.id, {
              status: "downloaded",
              progress: 100,
              localPath: destFile.uri,
            });

            return customModel;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to import model";
            console.error("Import error:", errorMessage);
            throw error;
          }
        },

        // Initialization
        initialize: () => {
          const { initialized, models, updateModelState } = get();
          if (initialized) return;

          ensureModelsDirectory();

          for (const model of models) {
            const localPath = checkModelExists(model.id, models);
            if (localPath) {
              updateModelState(model.id, {
                status: "downloaded",
                progress: 100,
                localPath,
              });
            }
          }

          set({ initialized: true });
        },
      }),
      {
        name: "model-store",
        version: STORE_VERSION,
        storage: createJSONStorage(() => zustandStorage),

        // Only persist data fields, not functions or transient state
        partialize: state => ({
          models: state.models,
          modelStates: state.modelStates,
          activeModelId: state.activeModelId,
          activeModelPath: state.activeModelPath,
          // Note: initialized is NOT persisted - we want to re-check files on each app start
        }),

        // Deep merge persisted state with current state
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<ModelStoreState> | undefined;

          // Merge models: keep AVAILABLE_MODELS and add any custom models from storage
          const baseModels = [...AVAILABLE_MODELS];
          const customModels = (persisted?.models ?? []).filter(m =>
            m.id.startsWith(CUSTOM_MODEL_PREFIX),
          );
          const mergedModels = [...baseModels, ...customModels];

          return {
            ...currentState,
            models: mergedModels,
            modelStates: persisted?.modelStates ?? currentState.modelStates,
            activeModelId: persisted?.activeModelId ?? currentState.activeModelId,
            activeModelPath: persisted?.activeModelPath ?? currentState.activeModelPath,
          };
        },

        // Handle hydration completion
        onRehydrateStorage: () => {
          return (state, error) => {
            if (error) {
              console.error("Model store hydration failed:", error);
            } else {
              state?.setHasHydrated(true);
            }
          };
        },

        // Migration handler for future schema changes
        migrate: (persistedState, version) => {
          let state = persistedState as Partial<ModelStoreState>;

          if (version < 1) {
            // Reset model states on first migration to re-validate files
            state = {
              ...state,
              modelStates: {},
              initialized: false,
            };
          }

          return state as ModelStoreState;
        },
      },
    ),
  ),
);

// Selector hooks for optimized re-renders
export const useModels = () => useModelStore(state => state.models);
export const useModelStates = () => useModelStore(state => state.modelStates);
export const useActiveModelId = () => useModelStore(state => state.activeModelId);
export const useModelHasHydrated = () => useModelStore(state => state._hasHydrated);

// Legacy compatibility exports for easier migration
// These can be removed once all components are updated
export const ModelProvider = ({ children }: { children: React.ReactNode }) => children;
