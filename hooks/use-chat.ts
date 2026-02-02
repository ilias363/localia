import { llmService } from "@/services/llm";
import { useConversationStore } from "@/stores/conversation-store";
import { useModelStore } from "@/stores/model-store";
import { useSettingsStore } from "@/stores/settings-store";
import { generateTitle } from "@/utils";
import { useRef, useState } from "react";
import { useShallow } from "zustand/shallow";

export function useChat() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef(false);
  const streamingContentRef = useRef("");
  const streamingThinkingRef = useRef("");

  // Consolidate conversation store subscriptions with useShallow
  const { conversations, activeConversationId } = useConversationStore(
    useShallow(state => ({
      conversations: state.conversations,
      activeConversationId: state.activeConversationId,
    })),
  );

  // Actions don't trigger re-renders, use getState
  const {
    addMessage,
    updateMessage,
    updateMessageThinking,
    updateMessageStats,
    createConversation,
    updateConversationTitle,
  } = useConversationStore.getState();

  // Consolidate model store subscriptions with useShallow
  const { models, modelStates, selectedModelId, loadedModels } = useModelStore(
    useShallow(state => ({
      models: state.models,
      modelStates: state.modelStates,
      selectedModelId: state.selectedModelId,
      loadedModels: state.loadedModels,
    })),
  );

  // Consolidate settings store subscriptions with useShallow
  const { temperature, topP, topK, minP, maxTokens, repeatPenalty } = useSettingsStore(
    useShallow(state => ({
      temperature: state.temperature,
      topP: state.topP,
      topK: state.topK,
      minP: state.minP,
      maxTokens: state.maxTokens,
      repeatPenalty: state.repeatPenalty,
    })),
  );

  // Derive values from reactive state
  const activeConversation = activeConversationId
    ? conversations.find(c => c.id === activeConversationId)
    : null;
  const selectedModel = selectedModelId ? models.find(m => m.id === selectedModelId) : null;
  const selectedModelPath = selectedModelId ? loadedModels[selectedModelId] : null;
  const modelReady = selectedModelId ? modelStates[selectedModelId]?.status === "ready" : false;
  const messages = activeConversation?.messages ?? [];

  const sendMessage = async (content: string) => {
    if (isGenerating) return;

    // Check if model is ready
    if (!modelReady || !selectedModel || !selectedModelPath) {
      console.warn("Cannot send message: No model loaded");
      return;
    }

    let conversationId = activeConversationId;
    let isNewConversation = false;
    if (!conversationId) {
      const newConversation = createConversation();
      conversationId = newConversation.id;
      isNewConversation = true;
    }

    // Add user message
    const userMessage = addMessage(conversationId, {
      role: "user",
      content,
    });

    // Update conversation title based on first message
    if (isNewConversation || messages.length === 0) {
      updateConversationTitle(conversationId, generateTitle(content));
    }

    // Add empty assistant message for streaming (with model info)
    const assistantMessage = addMessage(conversationId, {
      role: "assistant",
      content: "",
      modelId: selectedModel.id,
      modelName: selectedModel.name,
    });

    setIsGenerating(true);
    setStreamingMessageId(assistantMessage.id);
    setIsThinking(false);
    abortRef.current = false;
    streamingContentRef.current = "";
    streamingThinkingRef.current = "";

    try {
      await llmService.generateResponse(
        [...messages, userMessage],
        {
          onToken: token => {
            if (abortRef.current) return;
            streamingContentRef.current += token;
            updateMessage(conversationId!, assistantMessage.id, streamingContentRef.current);
          },
          onThinkingToken: token => {
            if (abortRef.current) return;
            if (!isThinking) setIsThinking(true);
            streamingThinkingRef.current += token;
            updateMessageThinking(
              conversationId!,
              assistantMessage.id,
              streamingThinkingRef.current,
            );
          },
          onThinkingComplete: () => {
            setIsThinking(false);
          },
          onComplete: stats => {
            if (stats) {
              updateMessageStats(conversationId!, assistantMessage.id, stats);
            }
            setIsGenerating(false);
            setStreamingMessageId(null);
            setIsThinking(false);
          },
          onError: error => {
            console.error("Generation error:", error);
            updateMessage(
              conversationId!,
              assistantMessage.id,
              "Sorry, an error occurred. Please try again.",
            );
            setIsGenerating(false);
            setStreamingMessageId(null);
            setIsThinking(false);
          },
        },
        selectedModel,
        { temperature, topP, topK, minP, maxTokens, repeatPenalty },
      );
    } catch {
      setIsGenerating(false);
      setStreamingMessageId(null);
    }
  };

  const stopGeneration = () => {
    abortRef.current = true;
    llmService.stopGeneration();
    setIsGenerating(false);
    setStreamingMessageId(null);
  };

  return {
    messages,
    isGenerating,
    isThinking,
    isModelReady: modelReady,
    activeModel: selectedModel,
    streamingMessageId,
    sendMessage,
    stopGeneration,
  };
}
