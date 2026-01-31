// Centralized type definitions for the Localia app

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number; // Unix timestamp in milliseconds
  stats?: MessageStats; // Generation stats for assistant messages
}

// Stats for nerds - generation performance metrics
export interface MessageStats {
  tokensGenerated: number;
  tokensPerSecond: number;
  generationTimeMs: number;
  promptTokens?: number;
  promptTimeMs?: number;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (stats?: MessageStats) => void;
  onError?: (error: Error) => void;
}

export interface ModelLoadCallbacks {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// Generation parameters that can be customized
export interface GenerationParams {
  temperature?: number;
  topP?: number;
  topK?: number;
  minP?: number;
  maxTokens?: number;
  repeatPenalty?: number;
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
