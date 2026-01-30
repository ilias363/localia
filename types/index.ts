// Centralized type definitions for the Localia app

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number; // Unix timestamp in milliseconds
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: () => void;
  onError?: (error: Error) => void;
}

export interface ModelLoadCallbacks {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// Model Types
// ============================================================================

export interface ModelInfo {
  id: string;
  name: string;
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

// ============================================================================
// Conversation Types
// ============================================================================

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number; // Unix timestamp in milliseconds
  updatedAt: number; // Unix timestamp in milliseconds
}
