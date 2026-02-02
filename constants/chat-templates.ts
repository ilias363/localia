// Chat templates for different model families

import type { ChatTemplate, ThinkingTokens } from "@/types";

// Re-export types for convenience
export type { ChatTemplate, ThinkingTokens } from "@/types";

export const CHAT_TEMPLATES: Record<string, ChatTemplate> = {
  // ChatML format (used by TinyLlama, Qwen, SmolLM2, and many other models)
  chatml: {
    systemPrefix: "<|im_start|>system\n",
    systemSuffix: "<|im_end|>\n",
    userPrefix: "<|im_start|>user\n",
    userSuffix: "<|im_end|>\n",
    assistantPrefix: "<|im_start|>assistant\n",
    assistantSuffix: "<|im_end|>\n",
    stopTokens: ["<|im_end|>", "<|im_start|>"],
  },
  // Llama 3 format (used by Meta's Llama 3.x models)
  llama3: {
    systemPrefix: "<|start_header_id|>system<|end_header_id|>\n\n",
    systemSuffix: "<|eot_id|>",
    userPrefix: "<|start_header_id|>user<|end_header_id|>\n\n",
    userSuffix: "<|eot_id|>",
    assistantPrefix: "<|start_header_id|>assistant<|end_header_id|>\n\n",
    assistantSuffix: "<|eot_id|>",
    stopTokens: ["<|eot_id|>", "<|start_header_id|>"],
  },
  // Phi-3 format (used by Microsoft's Phi-3 models)
  phi3: {
    systemPrefix: "<|system|>\n",
    systemSuffix: "<|end|>\n",
    userPrefix: "<|user|>\n",
    userSuffix: "<|end|>\n",
    assistantPrefix: "<|assistant|>\n",
    assistantSuffix: "<|end|>\n",
    stopTokens: ["<|end|>", "<|user|>", "<|assistant|>"],
  },
  // Gemma format (used by Google's Gemma models)
  gemma: {
    systemPrefix: "",
    systemSuffix: "",
    userPrefix: "<start_of_turn>user\n",
    userSuffix: "<end_of_turn>\n",
    assistantPrefix: "<start_of_turn>model\n",
    assistantSuffix: "<end_of_turn>\n",
    stopTokens: ["<end_of_turn>", "<start_of_turn>"],
  },
  // Qwen3 with thinking support (uses /think and /no_think modes)
  qwen3_thinking: {
    systemPrefix: "<|im_start|>system\n",
    systemSuffix: "<|im_end|>\n",
    userPrefix: "<|im_start|>user\n",
    userSuffix: "<|im_end|>\n",
    assistantPrefix: "<|im_start|>assistant\n",
    assistantSuffix: "<|im_end|>\n",
    stopTokens: ["<|im_end|>", "<|im_start|>"],
    thinking: {
      thinkingPrefix: "<think>",
      thinkingSuffix: "</think>",
    },
  },
};

// Export supported chat template keys for UI
export const SUPPORTED_CHAT_TEMPLATES = Object.keys(CHAT_TEMPLATES);

// Helper to check if a template supports thinking
export function templateSupportsThinking(templateKey: string): boolean {
  const template = CHAT_TEMPLATES[templateKey];
  return !!template?.thinking;
}

// Get thinking tokens for a template (if supported)
export function getThinkingTokens(templateKey: string): ThinkingTokens | null {
  const template = CHAT_TEMPLATES[templateKey];
  return template?.thinking ?? null;
}
