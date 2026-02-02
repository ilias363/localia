import { AVAILABLE_MODELS, CUSTOM_MODEL_PREFIX } from "@/constants/models";
import type { ActiveModel, CustomModelInfo, ModelInfo, ModelState } from "@/types";
import {
  completeHandler,
  createDownloadTask,
  getExistingDownloadTasks,
} from "@kesha-antonov/react-native-background-downloader";
import { File } from "expo-file-system";
import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { zustandStorage } from "../mmkv";
import { checkModelExists, ensureModelsDirectory, formatBytes, getModelFilePath } from "./helpers";
import { runtimeState } from "./runtime-state";
import type { ModelStore, ModelStoreState } from "./types";
import { STORE_VERSION } from "./types";

export const useModelStore = create<ModelStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        models: [...AVAILABLE_MODELS],
        modelStates: {},
        loadedModels: {},
        selectedModelId: null,
        initialized: false,
        _hasHydrated: false,

        // Hydration setter
        setHasHydrated: (state: boolean) => {
          set({ _hasHydrated: state });
        },

        // Getters
        getActiveModel: () => {
          const { selectedModelId, loadedModels, models } = get();
          if (!selectedModelId) return null;
          const localPath = loadedModels[selectedModelId];
          if (!localPath) return null;
          const model = models.find(m => m.id === selectedModelId);
          if (!model) return null;
          return { info: model, localPath };
        },

        getModelState: (modelId: string) => {
          const { modelStates } = get();
          return modelStates[modelId] ?? { status: "not-downloaded", progress: 0 };
        },

        isModelReady: () => {
          const { selectedModelId, modelStates } = get();
          if (!selectedModelId) return false;
          return modelStates[selectedModelId]?.status === "ready";
        },

        getLoadedModels: () => {
          const { loadedModels } = get();
          return Object.entries(loadedModels).map(([modelId, localPath]) => ({
            modelId,
            localPath,
          }));
        },

        isModelLoaded: (modelId: string) => {
          const { loadedModels } = get();
          return modelId in loadedModels;
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
          const { models, updateModelState, loadedModels, selectedModelId } = get();
          const model = models.find(m => m.id === modelId);
          if (model) {
            updateModelState(modelId, { status: "ready", localPath });
            // Add to loaded models
            const newLoadedModels = { ...loadedModels, [modelId]: localPath };
            // Auto-select if first model
            const newSelectedModelId = selectedModelId ?? modelId;
            set({
              loadedModels: newLoadedModels,
              selectedModelId: newSelectedModelId,
            });
          }
        },

        setActiveModel: (model: ActiveModel | null) => {
          if (model) {
            set({ selectedModelId: model.info.id });
          } else {
            set({ selectedModelId: null });
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
                .begin(() => { })
                .progress(({ bytesDownloaded, bytesTotal }) => {
                  // Check if cancelled or paused during download
                  if (runtimeState.cancelledDownloads.has(modelId)) {
                    return;
                  }
                  // Don't update status if paused - just track progress silently
                  if (runtimeState.pausedDownloads.has(modelId)) {
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
                  runtimeState.pausedDownloads.delete(modelId);
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
                  runtimeState.pausedDownloads.delete(modelId);

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
          runtimeState.pausedDownloads.delete(modelId);
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

        pauseDownload: async (modelId: string) => {
          const task = runtimeState.downloadTasks[modelId];
          if (!task) {
            console.warn(`No active download task for ${modelId}`);
            return;
          }

          try {
            // Mark as paused and update UI immediately before calling pause()
            runtimeState.pausedDownloads.add(modelId);
            const currentState = get().getModelState(modelId);
            get().updateModelState(modelId, {
              status: "paused",
              progress: currentState.progress,
            });
            await task.pause();
          } catch (error) {
            console.error(`Failed to pause download for ${modelId}:`, error);
            // Revert state on error
            runtimeState.pausedDownloads.delete(modelId);
            const currentState = get().getModelState(modelId);
            get().updateModelState(modelId, {
              status: "downloading",
              progress: currentState.progress,
            });
          }
        },

        resumeDownload: async (modelId: string) => {
          const task = runtimeState.downloadTasks[modelId];
          if (!task) {
            // If no task exists, try to restart the download
            runtimeState.pausedDownloads.delete(modelId);
            await get().downloadModel(modelId);
            return;
          }

          try {
            runtimeState.pausedDownloads.delete(modelId);
            const currentState = get().getModelState(modelId);
            get().updateModelState(modelId, {
              status: "downloading",
              progress: currentState.progress,
            });
            await task.resume();
          } catch (error) {
            console.error(`Failed to resume download for ${modelId}:`, error);
            get().updateModelState(modelId, {
              status: "error",
              error: error instanceof Error ? error.message : "Failed to resume download",
            });
          }
        },

        deleteModel: async (modelId: string) => {
          const { getModelState, loadedModels, unloadModel } = get();
          const state = getModelState(modelId);

          // Clean up any pending download state
          runtimeState.cancelledDownloads.delete(modelId);
          const task = runtimeState.downloadTasks[modelId];
          if (task) {
            delete runtimeState.downloadTasks[modelId];
            task.stop().catch(() => { });
          }

          // Unload if loaded
          if (modelId in loadedModels) {
            await unloadModel(modelId);
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

        unloadModel: async (modelId?: string) => {
          const { loadedModels, selectedModelId, updateModelState } = get();

          // If no modelId provided, unload the selected model (legacy behavior)
          const targetId = modelId ?? selectedModelId;
          if (!targetId) return;

          const localPath = loadedModels[targetId];
          if (!localPath) return;

          // Update model state to downloaded
          updateModelState(targetId, {
            status: "downloaded",
            localPath,
          });

          // Remove from loaded models
          const newLoadedModels = { ...loadedModels };
          delete newLoadedModels[targetId];

          // If this was the selected model, select another or clear
          let newSelectedModelId = selectedModelId;
          if (selectedModelId === targetId) {
            const remainingIds = Object.keys(newLoadedModels);
            newSelectedModelId = remainingIds.length > 0 ? remainingIds[0] : null;
          }

          set({
            loadedModels: newLoadedModels,
            selectedModelId: newSelectedModelId,
          });
        },

        unloadAllModels: async () => {
          const { loadedModels, updateModelState } = get();

          // Update all loaded models to downloaded status
          for (const [modelId, localPath] of Object.entries(loadedModels)) {
            updateModelState(modelId, {
              status: "downloaded",
              localPath,
            });
          }

          set({
            loadedModels: {},
            selectedModelId: null,
          });
        },

        selectModel: (modelId: string) => {
          const { loadedModels } = get();

          // Can only select a loaded model
          if (!(modelId in loadedModels)) {
            console.warn(`Cannot select model ${modelId}: not loaded`);
            return;
          }

          set({ selectedModelId: modelId });
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
          const { initialized, models, updateModelState, modelStates } = get();
          if (initialized) return;

          ensureModelsDirectory();

          // Check for existing downloaded models
          for (const model of models) {
            const currentState = modelStates[model.id];
            // Skip models that are in downloading/paused state - we'll handle those via getExistingDownloadTasks
            if (currentState?.status === "downloading" || currentState?.status === "paused") {
              continue;
            }
            const localPath = checkModelExists(model.id, models);
            if (localPath) {
              updateModelState(model.id, {
                status: "downloaded",
                progress: 100,
                localPath,
              });
            }
          }

          // Re-attach to any background downloads that may have continued while app was closed
          getExistingDownloadTasks()
            .then(existingTasks => {
              // Create a set of model IDs that have active tasks
              const activeTaskModelIds = new Set<string>();

              for (const task of existingTasks) {
                // Extract modelId from taskId (format: "modelId-timestamp")
                const taskIdParts = task.id.split("-");
                // Remove the timestamp (last part) to get the modelId
                taskIdParts.pop();
                const modelId = taskIdParts.join("-");

                const model = models.find(m => m.id === modelId);
                if (!model) {
                  // Unknown task, stop it
                  task.stop().catch(() => { });
                  continue;
                }

                activeTaskModelIds.add(modelId);

                // Store the task reference
                runtimeState.downloadTasks[modelId] = task;

                // Check persisted state to determine if it was paused
                const persistedState = modelStates[modelId];
                const wasPaused = persistedState?.status === "paused";

                if (wasPaused) {
                  runtimeState.pausedDownloads.add(modelId);
                }

                // Re-attach callbacks
                task
                  .progress(({ bytesDownloaded, bytesTotal }) => {
                    if (runtimeState.cancelledDownloads.has(modelId)) return;
                    if (runtimeState.pausedDownloads.has(modelId)) return;

                    const progress = bytesTotal > 0 ? (bytesDownloaded / bytesTotal) * 100 : 0;
                    const roundedProgress = Math.round(progress * 10) / 10;
                    updateModelState(modelId, {
                      status: "downloading",
                      progress: Math.min(roundedProgress, 99.9),
                    });
                  })
                  .done(({ bytesDownloaded, bytesTotal }) => {
                    delete runtimeState.downloadTasks[modelId];
                    runtimeState.pausedDownloads.delete(modelId);
                    completeHandler(task.id);

                    if (runtimeState.cancelledDownloads.has(modelId)) {
                      runtimeState.cancelledDownloads.delete(modelId);
                      updateModelState(modelId, { status: "not-downloaded", progress: 0 });
                      return;
                    }

                    const modelFile = getModelFilePath(model.fileName);
                    updateModelState(modelId, {
                      status: "downloaded",
                      progress: 100,
                      localPath: modelFile.uri,
                    });
                  })
                  .error(({ error }) => {
                    delete runtimeState.downloadTasks[modelId];
                    runtimeState.pausedDownloads.delete(modelId);

                    if (runtimeState.cancelledDownloads.has(modelId)) {
                      runtimeState.cancelledDownloads.delete(modelId);
                      updateModelState(modelId, { status: "not-downloaded", progress: 0 });
                      return;
                    }

                    if (
                      error.toLowerCase().includes("cancel") ||
                      error.toLowerCase().includes("abort") ||
                      error.toLowerCase().includes("stop")
                    ) {
                      updateModelState(modelId, { status: "not-downloaded", progress: 0 });
                      return;
                    }

                    updateModelState(modelId, { status: "error", error });
                  });

                // Update initial UI state based on whether it was paused
                if (wasPaused) {
                  updateModelState(modelId, {
                    status: "paused",
                    progress: persistedState?.progress ?? 0,
                  });
                } else {
                  updateModelState(modelId, {
                    status: "downloading",
                    progress: persistedState?.progress ?? 0,
                  });
                }
              }

              // Clean up stale "downloading"/"paused" states for models without active tasks
              for (const modelId of Object.keys(modelStates)) {
                const state = modelStates[modelId];
                if (
                  (state.status === "downloading" || state.status === "paused") &&
                  !activeTaskModelIds.has(modelId)
                ) {
                  // No active task for this model - check if file is complete
                  const localPath = checkModelExists(modelId, models);
                  if (localPath) {
                    updateModelState(modelId, {
                      status: "downloaded",
                      progress: 100,
                      localPath,
                    });
                  } else {
                    // No task and incomplete file - reset to not-downloaded
                    updateModelState(modelId, {
                      status: "not-downloaded",
                      progress: 0,
                      localPath: undefined,
                    });
                  }
                }
              }
            })
            .catch(error => {
              console.error("Failed to re-attach to existing downloads:", error);
              // On error, clean up all stale downloading/paused states
              for (const modelId of Object.keys(modelStates)) {
                const state = modelStates[modelId];
                if (state.status === "downloading" || state.status === "paused") {
                  const localPath = checkModelExists(modelId, models);
                  if (localPath) {
                    updateModelState(modelId, {
                      status: "downloaded",
                      progress: 100,
                      localPath,
                    });
                  } else {
                    updateModelState(modelId, {
                      status: "not-downloaded",
                      progress: 0,
                      localPath: undefined,
                    });
                  }
                }
              }
            });

          set({ initialized: true });
        },
      }),
      {
        name: "model-store",
        version: STORE_VERSION,
        storage: createJSONStorage(() => zustandStorage),

        // Only persist data fields, not functions or transient state
        // Note: loadedModels and selectedModelId are NOT persisted - contexts are gone on app restart
        partialize: state => ({
          models: state.models,
          modelStates: state.modelStates,
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
            // loadedModels and selectedModelId start fresh - contexts are gone on app restart
            loadedModels: {},
            selectedModelId: null,
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
export const useSelectedModelId = () => useModelStore(state => state.selectedModelId);
export const useLoadedModels = () => useModelStore(state => state.loadedModels);
export const useModelHasHydrated = () => useModelStore(state => state._hasHydrated);

// Legacy compatibility exports for easier migration
// These can be removed once all components are updated
export const ModelProvider = ({ children }: { children: React.ReactNode }) => children;

// Re-export types for convenience
export type { ModelStore, ModelStoreActions, ModelStoreState } from "./types";

