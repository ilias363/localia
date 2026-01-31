// Message-related type definitions

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
