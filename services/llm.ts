// LLM Service - integrates with llama.rn for local model inference

import { CHAT_TEMPLATES, DEFAULT_GENERATION_PARAMS } from "@/constants/models";
import type { GenerationParams, Message, ModelInfo, ModelLoadCallbacks, StreamCallbacks } from "@/types";
import { initLlama, releaseAllLlama, type LlamaContext } from "llama.rn";

// Re-export types for convenience
export type { GenerationParams, Message, ModelLoadCallbacks, StreamCallbacks } from "@/types";

// Singleton LLM context manager
class LLMService {
  private context: LlamaContext | null = null;
  private currentModelId: string | null = null;
  private isLoading = false;

  get isModelLoaded(): boolean {
    return this.context !== null;
  }

  get loadedModelId(): string | null {
    return this.currentModelId;
  }

  async loadModel(
    modelInfo: ModelInfo,
    localPath: string,
    callbacks?: ModelLoadCallbacks,
  ): Promise<void> {
    if (this.isLoading) {
      throw new Error("Another model is currently loading");
    }

    // Release any existing context
    await this.unloadModel();

    this.isLoading = true;

    try {
      // Prepare model path - ensure it has proper URI format
      let modelPath = localPath;
      if (!modelPath.startsWith("file://")) {
        modelPath = `file://${localPath}`;
      }

      this.context = await initLlama(
        {
          model: modelPath,
          n_ctx: modelInfo.contextLength || DEFAULT_GENERATION_PARAMS.n_ctx,
          n_gpu_layers: DEFAULT_GENERATION_PARAMS.n_gpu_layers,
          n_threads: DEFAULT_GENERATION_PARAMS.n_threads,
          use_mlock: DEFAULT_GENERATION_PARAMS.use_mlock,
          use_mmap: DEFAULT_GENERATION_PARAMS.use_mmap,
        },
        (progress: number) => {
          // progress is already an integer, no need to round it
          callbacks?.onProgress?.(progress);
        },
      );

      this.currentModelId = modelInfo.id;

      callbacks?.onComplete?.();
    } catch (error) {
      console.error("Failed to load model:", error);
      this.context = null;
      this.currentModelId = null;

      const err = error instanceof Error ? error : new Error("Failed to load model");
      callbacks?.onError?.(err);
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  async unloadModel(): Promise<void> {
    if (this.context) {
      try {
        await this.context.release();
      } catch (error) {
        console.warn("Error releasing context:", error);
      }
      this.context = null;
      this.currentModelId = null;
    }
  }

  async releaseAll(): Promise<void> {
    try {
      await releaseAllLlama();
    } catch (error) {
      console.warn("Error releasing all contexts:", error);
    }
    this.context = null;
    this.currentModelId = null;
  }

  async generateResponse(
    messages: Message[],
    callbacks: StreamCallbacks,
    modelInfo?: ModelInfo,
    params?: GenerationParams,
  ): Promise<void> {
    if (!this.context) {
      callbacks.onError?.(new Error("No model loaded"));
      return;
    }

    try {
      // Build prompt using chat template
      const template =
        CHAT_TEMPLATES[modelInfo?.chatTemplate as keyof typeof CHAT_TEMPLATES] ||
        CHAT_TEMPLATES.chatml;

      let prompt = "";

      // Add system message if not present
      const hasSystemMessage = messages.some(m => m.role === "system");
      if (!hasSystemMessage) {
        prompt += `${template.systemPrefix}You are a helpful, friendly AI assistant. Respond concisely and helpfully.${template.systemSuffix}`;
      }

      // Build conversation history
      for (const message of messages) {
        if (message.role === "system") {
          prompt += `${template.systemPrefix}${message.content}${template.systemSuffix}`;
        } else if (message.role === "user") {
          prompt += `${template.userPrefix}${message.content}${template.userSuffix}`;
        } else if (message.role === "assistant") {
          prompt += `${template.assistantPrefix}${message.content}${template.assistantSuffix}`;
        }
      }

      // Add assistant prefix for the response
      prompt += template.assistantPrefix;

      // Use custom params if provided, otherwise use defaults
      const temperature = params?.temperature ?? DEFAULT_GENERATION_PARAMS.temperature;
      const topP = params?.topP ?? DEFAULT_GENERATION_PARAMS.top_p;
      const topK = params?.topK ?? DEFAULT_GENERATION_PARAMS.top_k;
      const minP = params?.minP ?? DEFAULT_GENERATION_PARAMS.min_p;
      const maxTokens = params?.maxTokens ?? DEFAULT_GENERATION_PARAMS.n_predict;
      const repeatPenalty = params?.repeatPenalty ?? DEFAULT_GENERATION_PARAMS.penalty_repeat;

      await this.context.completion(
        {
          prompt,
          n_predict: maxTokens,
          temperature,
          top_k: topK,
          top_p: topP,
          min_p: minP,
          penalty_repeat: repeatPenalty,
          penalty_last_n: DEFAULT_GENERATION_PARAMS.penalty_last_n,
          stop: [...template.stopTokens],
        },
        (data: { token: string }) => {
          callbacks.onToken(data.token);
        },
      );

      callbacks.onComplete();
    } catch (error) {
      console.error("Generation error:", error);
      const err = error instanceof Error ? error : new Error("Generation failed");
      callbacks.onError?.(err);
    }
  }

  stopGeneration(): void {
    if (this.context) {
      try {
        this.context.stopCompletion();
      } catch (error) {
        console.warn("Error stopping completion:", error);
      }
    }
  }

  getSystemInfo(): string | null {
    return this.context?.systemInfo ?? null;
  }

  getModelInfo(): { desc?: string; size?: number; nParams?: number } | null {
    if (!this.context?.model) return null;
    return {
      desc: this.context.model.desc,
      size: this.context.model.size,
      nParams: this.context.model.nParams,
    };
  }
}

// Export singleton instance
export const llmService = new LLMService();

// Utility to generate unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
