import type { ActiveModel, CustomModelInfo, LoadedModel, ModelInfo, ModelState } from "@/types";
import type { DownloadTask } from "@kesha-antonov/react-native-background-downloader";

// Store version for migrations
export const STORE_VERSION = 1;

// Non-persisted runtime state (download refs, loading states)
export interface RuntimeState {
  downloadTasks: Record<string, DownloadTask>;
  cancelledDownloads: Set<string>;
  pausedDownloads: Set<string>;
}

// Persisted state
export interface ModelStoreState {
  models: ModelInfo[];
  modelStates: Record<string, ModelState>;
  // Multiple loaded models support (runtime only - cleared on app restart)
  loadedModels: Record<string, string>; // modelId -> localPath
  selectedModelId: string | null;
  initialized: boolean;
  _hasHydrated: boolean;
}

// Actions
export interface ModelStoreActions {
  // Hydration
  setHasHydrated: (state: boolean) => void;

  // Getters
  getActiveModel: () => ActiveModel | null;
  getModelState: (modelId: string) => ModelState;
  isModelReady: () => boolean;
  getLoadedModels: () => LoadedModel[];
  isModelLoaded: (modelId: string) => boolean;

  // State mutations
  updateModelState: (modelId: string, update: Partial<ModelState>) => void;
  setModelError: (modelId: string, error: string) => void;
  setModelReady: (modelId: string, localPath: string) => void;
  setActiveModel: (model: ActiveModel | null) => void;

  // Model operations
  downloadModel: (modelId: string) => Promise<void>;
  pauseDownload: (modelId: string) => Promise<void>;
  resumeDownload: (modelId: string) => Promise<void>;
  cancelDownload: (modelId: string) => void;
  deleteModel: (modelId: string) => Promise<void>;
  loadModel: (modelId: string) => Promise<void>;
  unloadModel: (modelId?: string) => Promise<void>;
  unloadAllModels: () => Promise<void>;
  selectModel: (modelId: string) => void;
  importModel: (customInfo: CustomModelInfo) => Promise<ModelInfo | null>;

  // Initialization
  initialize: () => void;
}

export type ModelStore = ModelStoreState & ModelStoreActions;
