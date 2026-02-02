// Chat template type definitions

// Thinking/reasoning tokens for models that support chain-of-thought
export interface ThinkingTokens {
  thinkingPrefix: string;
  thinkingSuffix: string;
}

export interface ChatTemplate {
  systemPrefix: string;
  systemSuffix: string;
  userPrefix: string;
  userSuffix: string;
  assistantPrefix: string;
  assistantSuffix: string;
  stopTokens: readonly string[];
  // Optional thinking tokens for reasoning models
  thinking?: ThinkingTokens;
}
