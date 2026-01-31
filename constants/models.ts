// Model constants and configuration

import type { ModelInfo } from "@/types";

// Re-export types for convenience
export type { ModelInfo, ModelState, ModelStatus } from "@/types";

// TODO: Test newly added models on device:
// - Qwen3 (0.6B, 1.7B, 4B, 8B) - chatml template
// - Qwen2.5 (0.5B, 1.5B, 3B) - chatml template
// - SmolLM2 (360M, 1.7B) - chatml template
// - Llama 3.2 (1B, 3B) - llama3 template
// - Phi-3 Mini 4K - phi3 template
// - Gemma 3 4B - gemma template

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

// Custom model prefix for imported models
export const CUSTOM_MODEL_PREFIX = "custom-";

// Available models catalog
export const AVAILABLE_MODELS: ModelInfo[] = [
  // TinyLlama 1.1B Chat - Compact and fast
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

  // Qwen3 Series - Latest generation with best performance
  {
    id: "qwen3-0.6b-q8_0",
    name: "Qwen3 0.6B Q8_0",
    description: "Ultra-lightweight Qwen3 model. Perfect for low-end devices with limited RAM.",
    size: "639 MB",
    sizeBytes: 639_000_000,
    downloadUrl: "https://huggingface.co/Qwen/Qwen3-0.6B-GGUF/resolve/main/qwen3-0.6b-q8_0.gguf",
    fileName: "qwen3-0.6b-q8_0.gguf",
    quantization: "Q8_0",
    contextLength: 4096,
    chatTemplate: "chatml",
  },
  {
    id: "qwen3-1.7b-q8_0",
    name: "Qwen3 1.7B Q8_0",
    description:
      "Recommended. Excellent balance of size and quality. Great for most mobile devices.",
    size: "1.83 GB",
    sizeBytes: 1_830_000_000,
    downloadUrl: "https://huggingface.co/Qwen/Qwen3-1.7B-GGUF/resolve/main/qwen3-1.7b-q8_0.gguf",
    fileName: "qwen3-1.7b-q8_0.gguf",
    quantization: "Q8_0",
    contextLength: 4096,
    chatTemplate: "chatml",
  },
  {
    id: "qwen3-4b-q4km",
    name: "Qwen3 4B Q4_K_M",
    description: "High-quality Qwen3 model. Best for high-end devices with 8GB+ RAM.",
    size: "2.5 GB",
    sizeBytes: 2_500_000_000,
    downloadUrl: "https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/qwen3-4b-q4_k_m.gguf",
    fileName: "qwen3-4b-q4_k_m.gguf",
    quantization: "Q4_K_M",
    contextLength: 4096,
    chatTemplate: "chatml",
  },
  {
    id: "qwen3-8b-q4km",
    name: "Qwen3 8B Q4_K_M",
    description: "Flagship Qwen3 model. Only for high-end devices with 12GB+ RAM.",
    size: "5.03 GB",
    sizeBytes: 5_030_000_000,
    downloadUrl: "https://huggingface.co/Qwen/Qwen3-8B-GGUF/resolve/main/qwen3-8b-q4_k_m.gguf",
    fileName: "qwen3-8b-q4_k_m.gguf",
    quantization: "Q4_K_M",
    contextLength: 4096,
    chatTemplate: "chatml",
  },

  // Qwen2.5 Series - Stable and well-tested
  {
    id: "qwen2.5-0.5b-instruct-q4km",
    name: "Qwen2.5 0.5B Q4_K_M",
    description: "Ultra-compact Qwen2.5 model. Great for devices with limited storage.",
    size: "491 MB",
    sizeBytes: 491_000_000,
    downloadUrl:
      "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf",
    fileName: "qwen2.5-0.5b-instruct-q4_k_m.gguf",
    quantization: "Q4_K_M",
    contextLength: 4096,
    chatTemplate: "chatml",
  },
  {
    id: "qwen2.5-0.5b-instruct-q8_0",
    name: "Qwen2.5 0.5B Q8_0",
    description: "Ultra-compact with highest quality. Perfect for low-end devices.",
    size: "676 MB",
    sizeBytes: 676_000_000,
    downloadUrl:
      "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q8_0.gguf",
    fileName: "qwen2.5-0.5b-instruct-q8_0.gguf",
    quantization: "Q8_0",
    contextLength: 4096,
    chatTemplate: "chatml",
  },
  {
    id: "qwen2.5-1.5b-instruct-q4km",
    name: "Qwen2.5 1.5B Q4_K_M",
    description: "Recommended. Well-balanced Qwen2.5 model with excellent performance.",
    size: "1.12 GB",
    sizeBytes: 1_120_000_000,
    downloadUrl:
      "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf",
    fileName: "qwen2.5-1.5b-instruct-q4_k_m.gguf",
    quantization: "Q4_K_M",
    contextLength: 4096,
    chatTemplate: "chatml",
  },
  {
    id: "qwen2.5-1.5b-instruct-q8_0",
    name: "Qwen2.5 1.5B Q8_0",
    description: "High quality Qwen2.5 1.5B. Excellent for mid-range devices.",
    size: "1.89 GB",
    sizeBytes: 1_890_000_000,
    downloadUrl:
      "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q8_0.gguf",
    fileName: "qwen2.5-1.5b-instruct-q8_0.gguf",
    quantization: "Q8_0",
    contextLength: 4096,
    chatTemplate: "chatml",
  },
  {
    id: "qwen2.5-3b-instruct-q4km",
    name: "Qwen2.5 3B Q4_K_M",
    description: "Powerful Qwen2.5 model. Best for high-end devices with 8GB+ RAM.",
    size: "2.1 GB",
    sizeBytes: 2_100_000_000,
    downloadUrl:
      "https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf",
    fileName: "qwen2.5-3b-instruct-q4_k_m.gguf",
    quantization: "Q4_K_M",
    contextLength: 4096,
    chatTemplate: "chatml",
  },

  // SmolLM2 Series - Ultra-compact models by HuggingFace
  {
    id: "smollm2-360m-instruct-q8_0",
    name: "SmolLM2 360M Q8_0",
    description:
      "Ultra-tiny model by HuggingFace. Perfect for very low-end devices with minimal RAM.",
    size: "386 MB",
    sizeBytes: 386_000_000,
    downloadUrl:
      "https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF/resolve/main/smollm2-360m-instruct-q8_0.gguf",
    fileName: "smollm2-360m-instruct-q8_0.gguf",
    quantization: "Q8_0",
    contextLength: 2048,
    chatTemplate: "chatml",
  },
  {
    id: "smollm2-1.7b-instruct-q4km",
    name: "SmolLM2 1.7B Q4_K_M",
    description: "Recommended. Compact and efficient model by HuggingFace. Great for mobile.",
    size: "1.06 GB",
    sizeBytes: 1_060_000_000,
    downloadUrl:
      "https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct-GGUF/resolve/main/smollm2-1.7b-instruct-q4_k_m.gguf",
    fileName: "smollm2-1.7b-instruct-q4_k_m.gguf",
    quantization: "Q4_K_M",
    contextLength: 2048,
    chatTemplate: "chatml",
  },

  // Llama 3.2 Series - Meta's latest compact models
  {
    id: "llama-3.2-1b-instruct-q8_0",
    name: "Llama 3.2 1B Q8_0",
    description: "Recommended. Meta's compact multilingual model. Supports 8 languages.",
    size: "1.32 GB",
    sizeBytes: 1_320_000_000,
    downloadUrl:
      "https://huggingface.co/hugging-quants/Llama-3.2-1B-Instruct-Q8_0-GGUF/resolve/main/llama-3.2-1b-instruct-q8_0.gguf",
    fileName: "llama-3.2-1b-instruct-q8_0.gguf",
    quantization: "Q8_0",
    contextLength: 4096,
    chatTemplate: "llama3",
  },
  {
    id: "llama-3.2-3b-instruct-q4km",
    name: "Llama 3.2 3B Q4_K_M",
    description: "Recommended. Meta's powerful compact model. 128K context, 8 languages support.",
    size: "2.02 GB",
    sizeBytes: 2_020_000_000,
    downloadUrl:
      "https://huggingface.co/lmstudio-community/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf",
    fileName: "Llama-3.2-3B-Instruct-Q4_K_M.gguf",
    quantization: "Q4_K_M",
    contextLength: 8192,
    chatTemplate: "llama3",
  },
  {
    id: "llama-3.2-3b-instruct-q8_0",
    name: "Llama 3.2 3B Q8_0",
    description: "High quality Llama 3.2 3B. Best for capable devices with 6GB+ RAM.",
    size: "3.42 GB",
    sizeBytes: 3_420_000_000,
    downloadUrl:
      "https://huggingface.co/lmstudio-community/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q8_0.gguf",
    fileName: "Llama-3.2-3B-Instruct-Q8_0.gguf",
    quantization: "Q8_0",
    contextLength: 8192,
    chatTemplate: "llama3",
  },

  // Phi-3 Series - Microsoft's compact reasoning models
  {
    id: "phi-3-mini-4k-instruct-q4",
    name: "Phi-3 Mini 4K Q4",
    description:
      "Microsoft's reasoning-focused model. Excels at math, logic and code. 3.8B params.",
    size: "2.2 GB",
    sizeBytes: 2_200_000_000,
    downloadUrl:
      "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf",
    fileName: "Phi-3-mini-4k-instruct-q4.gguf",
    quantization: "Q4_K_M",
    contextLength: 4096,
    chatTemplate: "phi3",
  },

  // Gemma 3 Series - Google's latest multimodal models
  {
    id: "gemma-3-4b-it-q4km",
    name: "Gemma 3 4B Q4_K_M",
    description: "Google's latest compact model. 128K context, multimodal capable, 140+ languages.",
    size: "2.49 GB",
    sizeBytes: 2_490_000_000,
    downloadUrl:
      "https://huggingface.co/unsloth/gemma-3-4b-it-GGUF/resolve/main/gemma-3-4b-it-Q4_K_M.gguf",
    fileName: "gemma-3-4b-it-Q4_K_M.gguf",
    quantization: "Q4_K_M",
    contextLength: 8192,
    chatTemplate: "gemma",
  },
  {
    id: "gemma-3-4b-it-q8_0",
    name: "Gemma 3 4B Q8_0",
    description:
      "High quality Gemma 3. Best for devices with 8GB+ RAM. Great multilingual support.",
    size: "4.13 GB",
    sizeBytes: 4_130_000_000,
    downloadUrl:
      "https://huggingface.co/unsloth/gemma-3-4b-it-GGUF/resolve/main/gemma-3-4b-it-Q8_0.gguf",
    fileName: "gemma-3-4b-it-Q8_0.gguf",
    quantization: "Q8_0",
    contextLength: 8192,
    chatTemplate: "gemma",
  },
];

// Chat templates for different model families
export const CHAT_TEMPLATES = {
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
} as const;
