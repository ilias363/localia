// Model constants and configuration

import type { ModelInfo } from "@/types";

// Re-export types for convenience
export type { ModelInfo, ModelState, ModelStatus } from "@/types";

// Custom model prefix for imported models
export const CUSTOM_MODEL_PREFIX = "custom-";

// Available models catalog
export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: "tinyllama-1.1b-chat-q4km",
    name: "TinyLlama 1.1B Chat",
    description:
      "A compact and efficient 1.1B parameter model fine-tuned for chat. Great for mobile devices with limited memory.",
    size: "669 MB",
    sizeBytes: 669_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    quantization: "Q4_K_M",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
];

// TinyLlama uses ChatML format
export const CHAT_TEMPLATES = {
  chatml: {
    systemPrefix: "<|im_start|>system\n",
    systemSuffix: "<|im_end|>\n",
    userPrefix: "<|im_start|>user\n",
    userSuffix: "<|im_end|>\n",
    assistantPrefix: "<|im_start|>assistant\n",
    assistantSuffix: "<|im_end|>\n",
    stopTokens: ["<|im_end|>", "<|im_start|>"],
  },
} as const;

// Default model parameters
export const DEFAULT_GENERATION_PARAMS = {
  n_ctx: 2048,
  n_predict: 512,
  temperature: 0.7,
  top_k: 40,
  top_p: 0.95,
  min_p: 0.05,
  penalty_repeat: 1.1,
  penalty_last_n: 64,
  n_gpu_layers: 99,
  n_threads: 4,
  use_mlock: true,
  use_mmap: true,
};
