import { AVAILABLE_MODELS, CUSTOM_MODEL_PREFIX } from "@/constants/models";
import type { ActiveModel, ModelInfo, ModelState } from "@/types";
import { getDocumentAsync } from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import { createDownloadResumable, DownloadResumable } from "expo-file-system/legacy";
import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { zustandStorage } from "./mmkv";

// Store version for migrations
const STORE_VERSION = 1;

// Non-persisted runtime state (download refs, loading states)
interface RuntimeState {
  downloadResumables: Record<string, DownloadResumable>;
  cancelledDownloads: Set<string>;
}

const runtimeState: RuntimeState = {
  downloadResumables: {},
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
  cancelDownload: (modelId: string) => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
  loadModel: (modelId: string) => Promise<void>;
  unloadModel: () => Promise<void>;
  importModel: () => Promise<ModelInfo | null>;

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
          const { models, updateModelState, modelStates } = get();
          const model = models.find(m => m.id === modelId);
          if (!model) {
            throw new Error(`Model ${modelId} not found`);
          }

          // Check if any model is currently loading (blocks JS thread)
          const isAnyModelLoading = Object.values(modelStates).some(s => s.status === "loading");
          if (isAnyModelLoading) {
            throw new Error(
              "Cannot download while a model is loading. Please wait for the model to finish loading.",
            );
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

            // Create download resumable with progress callback (using legacy API for progress support)
            const downloadResumable = createDownloadResumable(
              model.downloadUrl,
              modelFile.uri,
              {},
              downloadProgress => {
                // Check if cancelled during download
                if (runtimeState.cancelledDownloads.has(modelId)) {
                  return;
                }
                const progress =
                  (downloadProgress.totalBytesWritten /
                    downloadProgress.totalBytesExpectedToWrite) *
                  100;
                // Round to 1 decimal place
                const roundedProgress = Math.round(progress * 10) / 10;
                updateModelState(modelId, {
                  status: "downloading",
                  progress: Math.min(roundedProgress, 99.9),
                });
              },
            );

            // Store for cancellation
            runtimeState.downloadResumables[modelId] = downloadResumable;

            const result = await downloadResumable.downloadAsync();

            delete runtimeState.downloadResumables[modelId];

            // Check if download was cancelled while in progress
            if (runtimeState.cancelledDownloads.has(modelId)) {
              runtimeState.cancelledDownloads.delete(modelId);
              updateModelState(modelId, { status: "not-downloaded", progress: 0 });
              return;
            }

            if (!result?.uri) {
              throw new Error("Download failed - no URI returned");
            }

            // Verify downloaded file size
            const downloadedFile = new File(result.uri);
            if (downloadedFile.exists && model.sizeBytes > 0) {
              const fileSize = downloadedFile.size ?? 0;
              const minExpectedSize = model.sizeBytes * 0.95;
              if (fileSize < minExpectedSize) {
                // Download is incomplete
                try {
                  downloadedFile.delete();
                } catch {
                  // Ignore delete errors
                }
                throw new Error(
                  `Download incomplete: got ${formatBytes(fileSize)}, expected ${model.size}`,
                );
              }
            }

            updateModelState(modelId, {
              status: "downloaded",
              progress: 100,
              localPath: result.uri,
            });
          } catch (error) {
            delete runtimeState.downloadResumables[modelId];

            // Check if download was cancelled
            if (runtimeState.cancelledDownloads.has(modelId)) {
              runtimeState.cancelledDownloads.delete(modelId);
              updateModelState(modelId, { status: "not-downloaded", progress: 0 });
              return;
            }

            const errorMessage = error instanceof Error ? error.message : "Unknown download error";

            // Don't report cancellation/abort as an error
            if (
              errorMessage.toLowerCase().includes("cancel") ||
              errorMessage.toLowerCase().includes("abort") ||
              errorMessage.toLowerCase().includes("pause")
            ) {
              updateModelState(modelId, { status: "not-downloaded", progress: 0 });
              // Don't throw for cancellation - it's not an error
              return;
            } else {
              updateModelState(modelId, {
                status: "error",
                error: errorMessage,
              });
              throw error;
            }
          }
        },

        cancelDownload: async (modelId: string) => {
          // Mark as cancelled FIRST and update UI immediately
          runtimeState.cancelledDownloads.add(modelId);
          get().updateModelState(modelId, { status: "not-downloaded", progress: 0 });

          const downloadResumable = runtimeState.downloadResumables[modelId];
          if (downloadResumable) {
            // Pause in background - don't wait for it
            downloadResumable.pauseAsync().catch(() => {
              // Ignore pause errors - download might already be done or failed
            });
            delete runtimeState.downloadResumables[modelId];
          }

          // Clean up partial file in background
          const { models } = get();
          const model = models.find(m => m.id === modelId);
          if (model) {
            const modelFile = getModelFilePath(model.fileName);
            // Wait a bit for the file handle to be released, then delete
            setTimeout(() => {
              if (modelFile.exists) {
                try {
                  modelFile.delete();
                } catch (e) {
                  console.warn("Failed to delete partial download:", e);
                }
              }
            }, 500);
          }
        },

        deleteModel: async (modelId: string) => {
          const { getModelState, activeModelId } = get();
          const state = getModelState(modelId);

          // Clean up any pending download state
          runtimeState.cancelledDownloads.delete(modelId);
          delete runtimeState.downloadResumables[modelId];

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
          const { models, getModelState, updateModelState, modelStates } = get();
          const model = models.find(m => m.id === modelId);
          if (!model) {
            throw new Error(`Model ${modelId} not found`);
          }

          // Check if any model is currently downloading
          const isAnyModelDownloading = Object.values(modelStates).some(
            s => s.status === "downloading",
          );
          if (isAnyModelDownloading) {
            throw new Error(
              "Cannot load a model while a download is in progress. Please wait for the download to complete or cancel it.",
            );
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

        importModel: async () => {
          const { models, updateModelState } = get();

          try {
            const result = await getDocumentAsync({
              type: "*/*",
              copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets?.[0]) {
              return null;
            }

            const asset = result.assets[0];

            // Validate file extension
            if (!asset.name.toLowerCase().endsWith(".gguf")) {
              throw new Error("Please select a GGUF model file");
            }

            ensureModelsDirectory();

            const destFile = getModelFilePath(asset.name);

            // Check if a predefined model with this filename already exists
            // If so, use that model instead of creating a duplicate
            const existingModel = models.find(m => m.fileName === asset.name);
            if (existingModel) {
              // Copy file if it doesn't exist yet
              if (!destFile.exists) {
                const sourceFile = new File(asset.uri);
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
            const sourceFile = new File(asset.uri);
            sourceFile.copy(destFile);
            // Clean up source file from cache
            try {
              sourceFile.delete();
            } catch {
              // Ignore cleanup errors
            }

            // Create a custom model entry (only for truly new models)
            const customModel: ModelInfo = {
              id: `${CUSTOM_MODEL_PREFIX}${Date.now()}`,
              name: asset.name.replace(".gguf", ""),
              description: "Imported GGUF model",
              size: asset.size ? formatBytes(asset.size) : "Unknown",
              sizeBytes: asset.size ?? 0,
              downloadUrl: "",
              fileName: asset.name,
              quantization: "Unknown",
              contextLength: 2048,
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
