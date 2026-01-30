import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

// Create the MMKV instance with a unique ID for the app
export const storage = createMMKV({
  id: "localia-storage",
});

// Create a StateStorage interface for Zustand's persist middleware
// This provides synchronous read/write operations which are much faster than AsyncStorage
export const zustandStorage: StateStorage = {
  getItem: name => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: name => {
    storage.remove(name);
  },
};

// Utility to clear all app data (useful for logout/reset)
export const clearAllStorage = () => {
  storage.clearAll();
};

// Utility to get storage size for debugging
export const getStorageSize = () => {
  return storage.size;
};

// Utility to get all keys for debugging
export const getAllStorageKeys = () => {
  return storage.getAllKeys();
};
