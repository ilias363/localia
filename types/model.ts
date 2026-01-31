// Model-related type definitions

export interface ModelInfo {
  id: string;
  name: string;
  provider: string; // Who provided the model
  description: string;
  size: string; // Human readable size
  sizeBytes: number;
  downloadUrl: string;
  fileName: string;
  quantization: string;
  contextLength: number;
  chatTemplate?: string; // Chat template format
}

export type ModelStatus =
  | "not-downloaded"
  | "downloading"
  | "downloaded"
  | "loading"
  | "ready"
  | "error";

export interface ModelState {
  status: ModelStatus;
  progress: number; // 0-100
  error?: string;
  localPath?: string;
}

export interface ActiveModel {
  info: ModelInfo;
  localPath: string;
}
