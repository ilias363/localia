// Model constants and configuration

import type { ModelInfo } from "@/types";

// Re-export types for convenience
export type { ModelInfo, ModelState, ModelStatus } from "@/types";

// Custom model prefix for imported models
export const CUSTOM_MODEL_PREFIX = "custom-";

// Available models catalog
export const AVAILABLE_MODELS: ModelInfo[] = [
  // TinyLlama 1.1B Chat
  {
    id: "tinyllama-1.1b-chat-q4km",
    name: "TinyLlama 1.1B Q4_K_M",
    description: "Recommended. Medium size with balanced quality. Great for mobile devices.",
    size: "669 MB",
    sizeBytes: 669_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    quantization: "Q4_K_M",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
  {
    id: "tinyllama-1.1b-chat-q8_0",
    name: "TinyLlama 1.1B Q8_0",
    description:
      "Highest quality, largest size. Extremely low quality loss. Best for devices with ample storage.",
    size: "1.17 GB",
    sizeBytes: 1_170_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q8_0.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q8_0.gguf",
    quantization: "Q8_0",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
  {
    id: "tinyllama-1.1b-chat-q6k",
    name: "TinyLlama 1.1B Q6_K",
    description:
      "Very high quality with extremely low quality loss. Great balance of size and performance.",
    size: "904 MB",
    sizeBytes: 904_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q6_K.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q6_K.gguf",
    quantization: "Q6_K",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
  {
    id: "tinyllama-1.1b-chat-q5km",
    name: "TinyLlama 1.1B Q5_K_M",
    description:
      "Recommended. Large size with very low quality loss. Excellent for capable devices.",
    size: "783 MB",
    sizeBytes: 783_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q5_K_M.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q5_K_M.gguf",
    quantization: "Q5_K_M",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
  {
    id: "tinyllama-1.1b-chat-q5ks",
    name: "TinyLlama 1.1B Q5_K_S",
    description:
      "Recommended. Large size with low quality loss. Good for devices with more storage.",
    size: "767 MB",
    sizeBytes: 767_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q5_K_S.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q5_K_S.gguf",
    quantization: "Q5_K_S",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
  {
    id: "tinyllama-1.1b-chat-q5_0",
    name: "TinyLlama 1.1B Q5_0",
    description:
      "Legacy format. Medium size with balanced quality. Prefer Q4_K_M for better results.",
    size: "767 MB",
    sizeBytes: 767_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q5_0.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q5_0.gguf",
    quantization: "Q5_0",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
  {
    id: "tinyllama-1.1b-chat-q4ks",
    name: "TinyLlama 1.1B Q4_K_S",
    description:
      "Small size with slightly more quality loss than Q4_K_M. Good for limited storage.",
    size: "644 MB",
    sizeBytes: 644_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_S.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q4_K_S.gguf",
    quantization: "Q4_K_S",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
  {
    id: "tinyllama-1.1b-chat-q4_0",
    name: "TinyLlama 1.1B Q4_0",
    description:
      "Legacy format. Small size with high quality loss. Prefer Q3_K_M for similar size.",
    size: "638 MB",
    sizeBytes: 638_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_0.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q4_0.gguf",
    quantization: "Q4_0",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
  {
    id: "tinyllama-1.1b-chat-q3kl",
    name: "TinyLlama 1.1B Q3_K_L",
    description: "Small size with substantial quality loss. Good for very limited storage devices.",
    size: "593 MB",
    sizeBytes: 593_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q3_K_L.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q3_K_L.gguf",
    quantization: "Q3_K_L",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
  {
    id: "tinyllama-1.1b-chat-q3km",
    name: "TinyLlama 1.1B Q3_K_M",
    description: "Very small size with high quality loss. Use when storage is extremely limited.",
    size: "551 MB",
    sizeBytes: 551_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q3_K_M.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q3_K_M.gguf",
    quantization: "Q3_K_M",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
  {
    id: "tinyllama-1.1b-chat-q3ks",
    name: "TinyLlama 1.1B Q3_K_S",
    description:
      "Very small size with high quality loss. Fastest option with noticeable quality trade-off.",
    size: "500 MB",
    sizeBytes: 500_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q3_K_S.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q3_K_S.gguf",
    quantization: "Q3_K_S",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
  {
    id: "tinyllama-1.1b-chat-q2k",
    name: "TinyLlama 1.1B Q2_K",
    description: "Smallest size with significant quality loss. Not recommended for most use cases.",
    size: "483 MB",
    sizeBytes: 483_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q2_K.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q2_K.gguf",
    quantization: "Q2_K",
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
