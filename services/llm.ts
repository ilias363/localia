// LLM Service - integrates with llama.rn for local model inference

import { CHAT_TEMPLATES, DEFAULT_GENERATION_PARAMS } from "@/constants/models";
import type {
  GenerationParams,
  Message,
  ModelInfo,
  ModelLoadCallbacks,
  StreamCallbacks,
} from "@/types";
import { initLlama, releaseAllLlama, type LlamaContext } from "llama.rn";

// Re-export types for convenience
export type { GenerationParams, Message, ModelLoadCallbacks, StreamCallbacks } from "@/types";

// Loaded context info
interface LoadedContext {
  context: LlamaContext;
  localPath: string;
  modelInfo: ModelInfo;
}

// Multi-model LLM context manager
class LLMService {
  // Map of modelId -> context info for multi-model support
  private contexts: Map<string, LoadedContext> = new Map();
  // Currently selected model for generation
  private _selectedModelId: string | null = null;
  // Loading state per model
  private loadingModels: Set<string> = new Set();

  get isModelLoaded(): boolean {
    return this.contexts.size > 0;
  }

  get selectedModelId(): string | null {
    return this._selectedModelId;
  }

  get loadedModelCount(): number {
    return this.contexts.size;
  }

  getLoadedModelIds(): string[] {
    return Array.from(this.contexts.keys());
  }

  isModelLoadedById(modelId: string): boolean {
    return this.contexts.has(modelId);
  }

  async loadModel(
    modelInfo: ModelInfo,
    localPath: string,
    callbacks?: ModelLoadCallbacks,
  ): Promise<void> {
    // Check if already loaded
    if (this.contexts.has(modelInfo.id)) {
      console.log(`Model ${modelInfo.id} already loaded`);
      callbacks?.onComplete?.();
      return;
    }

    if (this.loadingModels.has(modelInfo.id)) {
      throw new Error(`Model ${modelInfo.id} is already loading`);
    }

    this.loadingModels.add(modelInfo.id);

    try {
      // Prepare model path - ensure it has proper URI format
      let modelPath = localPath;
      if (!modelPath.startsWith("file://")) {
        modelPath = `file://${localPath}`;
      }

      const context = await initLlama(
        {
          model: modelPath,
          n_ctx: modelInfo.contextLength || DEFAULT_GENERATION_PARAMS.n_ctx,
          n_gpu_layers: DEFAULT_GENERATION_PARAMS.n_gpu_layers,
          n_threads: DEFAULT_GENERATION_PARAMS.n_threads,
          use_mlock: DEFAULT_GENERATION_PARAMS.use_mlock,
          use_mmap: DEFAULT_GENERATION_PARAMS.use_mmap,
        },
        (progress: number) => {
          callbacks?.onProgress?.(progress);
        },
      );

      this.contexts.set(modelInfo.id, { context, localPath, modelInfo });

      // Auto-select if first loaded model
      if (!this._selectedModelId) {
        this._selectedModelId = modelInfo.id;
      }

      console.log(`Model ${modelInfo.id} loaded successfully (${this.contexts.size} total loaded)`);
      callbacks?.onComplete?.();
    } catch (error) {
      console.error(`Failed to load model ${modelInfo.id}:`, error);

      const err = error instanceof Error ? error : new Error("Failed to load model");
      callbacks?.onError?.(err);
      throw err;
    } finally {
      this.loadingModels.delete(modelInfo.id);
    }
  }

  async unloadModel(modelId?: string): Promise<void> {
    // If no modelId provided, unload the selected model (legacy behavior)
    const targetId = modelId ?? this._selectedModelId;
    if (!targetId) return;

    const loaded = this.contexts.get(targetId);
    if (loaded) {
      try {
        await loaded.context.release();
      } catch (error) {
        console.warn(`Error releasing context for ${targetId}:`, error);
      }
      this.contexts.delete(targetId);

      // If this was the selected model, select another or clear
      if (this._selectedModelId === targetId) {
        const remainingIds = Array.from(this.contexts.keys());
        this._selectedModelId = remainingIds.length > 0 ? remainingIds[0] : null;
      }

      console.log(`Model ${targetId} unloaded (${this.contexts.size} remaining)`);
    }
  }

  async releaseAll(): Promise<void> {
    try {
      await releaseAllLlama();
    } catch (error) {
      console.warn("Error releasing all contexts:", error);
    }
    this.contexts.clear();
    this._selectedModelId = null;
    console.log("All models unloaded");
  }

  selectModel(modelId: string): boolean {
    if (this.contexts.has(modelId)) {
      this._selectedModelId = modelId;
      return true;
    }
    return false;
  }

  async generateResponse(
    messages: Message[],
    callbacks: StreamCallbacks,
    modelInfo?: ModelInfo,
    params?: GenerationParams,
  ): Promise<void> {
    // Use the specified model or fall back to selected model
    const targetModelId = modelInfo?.id ?? this._selectedModelId;
    const loaded = targetModelId ? this.contexts.get(targetModelId) : null;

    if (!loaded) {
      callbacks.onError?.(new Error("No model loaded"));
      return;
    }

    const context = loaded.context;
    const effectiveModelInfo = modelInfo ?? loaded.modelInfo;

    try {
      // Build prompt using chat template
      const template =
        CHAT_TEMPLATES[effectiveModelInfo?.chatTemplate as keyof typeof CHAT_TEMPLATES] ||
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

      const result = await context.completion(
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

      // Extract stats from completion result
      const stats = result?.timings
        ? {
          tokensGenerated: result.timings.predicted_n,
          tokensPerSecond: result.timings.predicted_per_second,
          generationTimeMs: result.timings.predicted_ms,
          promptTokens: result.timings.prompt_n,
          promptTimeMs: result.timings.prompt_ms,
        }
        : undefined;

      callbacks.onComplete(stats);
    } catch (error) {
      console.error("Generation error:", error);
      const err = error instanceof Error ? error : new Error("Generation failed");
      callbacks.onError?.(err);
    }
  }

  stopGeneration(modelId?: string): void {
    // Stop on specific model or all models if none specified
    if (modelId) {
      const loaded = this.contexts.get(modelId);
      if (loaded) {
        try {
          loaded.context.stopCompletion();
        } catch (error) {
          console.warn(`Error stopping completion for ${modelId}:`, error);
        }
      }
    } else {
      // Stop on all loaded models
      for (const [id, loaded] of this.contexts) {
        try {
          loaded.context.stopCompletion();
        } catch (error) {
          console.warn(`Error stopping completion for ${id}:`, error);
        }
      }
    }
  }

  getSystemInfo(modelId?: string): string | null {
    const targetId = modelId ?? this._selectedModelId;
    const loaded = targetId ? this.contexts.get(targetId) : null;
    return loaded?.context?.systemInfo ?? null;
  }

  getModelInfo(modelId?: string): { desc?: string; size?: number; nParams?: number } | null {
    const targetId = modelId ?? this._selectedModelId;
    const loaded = targetId ? this.contexts.get(targetId) : null;
    if (!loaded?.context?.model) return null;
    return {
      desc: loaded.context.model.desc,
      size: loaded.context.model.size,
      nParams: loaded.context.model.nParams,
    };
  }
}

// Export singleton instance
export const llmService = new LLMService();

// Utility to generate unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
