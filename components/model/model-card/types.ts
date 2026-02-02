import type { ModelInfo, ModelState } from "@/types";

export interface ModelCardProps {
  model: ModelInfo;
  state: ModelState;
  isSelected: boolean;
  isLoaded: boolean;
  onDownload: () => Promise<void>;
  onCancelDownload: () => void;
  onPauseDownload: () => Promise<void>;
  onResumeDownload: () => Promise<void>;
  onDelete: () => Promise<void>;
  onLoad: () => Promise<void>;
  onUnload: () => Promise<void>;
  onSelect: () => void;
  isLast?: boolean;
}

export interface StatusConfig {
  color: string;
  icon:
  | "checkmark-circle"
  | "hourglass-outline"
  | "cloud-download"
  | "pause-circle"
  | "checkmark-done"
  | "alert-circle"
  | "cloud-outline";
  text: string;
}
