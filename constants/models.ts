// Model constants and configuration

import type { ModelInfo } from "@/types";

// Re-export types for convenience
export type { ModelInfo, ModelState, ModelStatus } from "@/types";

// Re-export chat templates from separate module
export { CHAT_TEMPLATES, SUPPORTED_CHAT_TEMPLATES, type ChatTemplateKey } from "./chat-templates";

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
    provider: "TheBloke",
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
    provider: "TheBloke",
    description: "Highest quality TinyLlama. Best for devices with ample storage.",
    size: "1.17 GB",
    sizeBytes: 1_170_000_000,
    downloadUrl:
      "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q8_0.gguf",
    fileName: "tinyllama-1.1b-chat-v1.0.Q8_0.gguf",
    quantization: "Q8_0",
    contextLength: 2048,
    chatTemplate: "chatml",
  },

  // Qwen3 Series - Latest generation with best performance
  {
    id: "qwen3-0.6b-q8_0",
    name: "Qwen3 0.6B Q8_0",
    provider: "Qwen",
    description: "Ultra-lightweight Qwen3 model. Perfect for low-end devices with limited RAM.",
    size: "639 MB",
    sizeBytes: 639_000_000,
    downloadUrl: "https://huggingface.co/Qwen/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q8_0.gguf",
    fileName: "Qwen3-0.6B-Q8_0.gguf",
    quantization: "Q8_0",
    contextLength: 4096,
    chatTemplate: "chatml",
  },
  {
    id: "qwen3-1.7b-q8_0",
    name: "Qwen3 1.7B Q8_0",
    provider: "Qwen",
    description:
      "Recommended. Excellent balance of size and quality. Great for most mobile devices.",
    size: "1.83 GB",
    sizeBytes: 1_830_000_000,
    downloadUrl: "https://huggingface.co/Qwen/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q8_0.gguf",
    fileName: "Qwen3-1.7B-Q8_0.gguf",
    quantization: "Q8_0",
    contextLength: 4096,
    chatTemplate: "chatml",
  },
  {
    id: "qwen3-4b-q4km",
    name: "Qwen3 4B Q4_K_M",
    provider: "Qwen",
    description: "High-quality Qwen3 model. Best for high-end devices with 8GB+ RAM.",
    size: "2.5 GB",
    sizeBytes: 2_500_000_000,
    downloadUrl: "https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/Qwen3-4B-Q4_K_M.gguf",
    fileName: "Qwen3-4B-Q4_K_M.gguf",
    quantization: "Q4_K_M",
    contextLength: 4096,
    chatTemplate: "chatml",
  },
  {
    id: "qwen3-8b-q4km",
    name: "Qwen3 8B Q4_K_M",
    provider: "Qwen",
    description: "Flagship Qwen3 model. Only for high-end devices with 12GB+ RAM.",
    size: "5.03 GB",
    sizeBytes: 5_030_000_000,
    downloadUrl: "https://huggingface.co/Qwen/Qwen3-8B-GGUF/resolve/main/Qwen3-8B-Q4_K_M.gguf",
    fileName: "Qwen3-8B-Q4_K_M.gguf",
    quantization: "Q4_K_M",
    contextLength: 4096,
    chatTemplate: "chatml",
  },

  // Qwen2.5 Series - Stable and well-tested
  {
    id: "qwen2.5-0.5b-instruct-q4km",
    name: "Qwen2.5 0.5B Q4_K_M",
    provider: "Qwen",
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
    provider: "Qwen",
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
    provider: "Qwen",
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
    provider: "Qwen",
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
    provider: "Qwen",
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
    provider: "HuggingFaceTB",
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
    provider: "HuggingFaceTB",
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
    provider: "hugging-quants",
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
    provider: "lmstudio-community",
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
    provider: "lmstudio-community",
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
    provider: "microsoft",
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
    provider: "unsloth",
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
    provider: "unsloth",
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
