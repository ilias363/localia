import type { RuntimeState } from "./types";

/**
 * Runtime state that is not persisted.
 * Contains download tasks, cancelled downloads, and paused downloads.
 * This state is reset when the app restarts.
 */
export const runtimeState: RuntimeState = {
  downloadTasks: {},
  cancelledDownloads: new Set(),
  pausedDownloads: new Set(),
};
