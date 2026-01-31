import type { GenerationParams } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./mmkv";

// Store version for migrations
const STORE_VERSION = 1;

// State shape - extends GenerationParams with required values
interface SettingsStoreState extends Required<GenerationParams> {
  // App preferences
  hapticEnabled: boolean;

  // Hydration state
  _hasHydrated: boolean;
}

// Actions
interface SettingsStoreActions {
  setHapticEnabled: (enabled: boolean) => void;
  setTemperature: (temperature: number) => void;
  setTopP: (topP: number) => void;
  setTopK: (topK: number) => void;
  setMinP: (minP: number) => void;
  setMaxTokens: (maxTokens: number) => void;
  setRepeatPenalty: (repeatPenalty: number) => void;
  resetToDefaults: () => void;
  setHasHydrated: (state: boolean) => void;
}

type SettingsStore = SettingsStoreState & SettingsStoreActions;

// Default values
const DEFAULT_SETTINGS: Pick<SettingsStoreState, "hapticEnabled" | keyof GenerationParams> = {
  hapticEnabled: true,
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  minP: 0.05,
  maxTokens: 512,
  repeatPenalty: 1.1,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      // Initial state
      ...DEFAULT_SETTINGS,
      _hasHydrated: false,

      // Hydration setter
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      // Actions
      setHapticEnabled: (enabled: boolean) => {
        set({ hapticEnabled: enabled });
      },

      setTemperature: (temperature: number) => {
        set({ temperature: Math.max(0, Math.min(2, temperature)) });
      },

      setTopP: (topP: number) => {
        set({ topP: Math.max(0, Math.min(1, topP)) });
      },

      setTopK: (topK: number) => {
        set({ topK: Math.max(1, Math.min(100, topK)) });
      },

      setMinP: (minP: number) => {
        set({ minP: Math.max(0, Math.min(1, minP)) });
      },

      setMaxTokens: (maxTokens: number) => {
        set({ maxTokens: Math.max(1, Math.min(4096, maxTokens)) });
      },

      setRepeatPenalty: (repeatPenalty: number) => {
        set({ repeatPenalty: Math.max(1, Math.min(2, repeatPenalty)) });
      },

      resetToDefaults: () => {
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => zustandStorage),
      version: STORE_VERSION,
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
      // Only persist specific fields
      partialize: state => ({
        hapticEnabled: state.hapticEnabled,
        temperature: state.temperature,
        topP: state.topP,
        topK: state.topK,
        minP: state.minP,
        maxTokens: state.maxTokens,
        repeatPenalty: state.repeatPenalty,
      }),
    },
  ),
);
