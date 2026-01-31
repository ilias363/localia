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
  const abortRef = useRef(false);
  const streamingContentRef = useRef("");

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
    updateMessageStats,
    createConversation,
    updateConversationTitle,
  } = useConversationStore.getState();

  // Consolidate model store subscriptions with useShallow
  const { models, modelStates, activeModelId, activeModelPath } = useModelStore(
    useShallow(state => ({
      models: state.models,
      modelStates: state.modelStates,
      activeModelId: state.activeModelId,
      activeModelPath: state.activeModelPath,
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
  const activeModel = activeModelId ? models.find(m => m.id === activeModelId) : null;
  const modelReady = activeModelId ? modelStates[activeModelId]?.status === "ready" : false;
  const messages = activeConversation?.messages ?? [];

  const sendMessage = async (content: string) => {
    if (isGenerating) return;

    // Check if model is ready
    if (!modelReady || !activeModel || !activeModelPath) {
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

    // Add empty assistant message for streaming
    const assistantMessage = addMessage(conversationId, {
      role: "assistant",
      content: "",
    });

    setIsGenerating(true);
    setStreamingMessageId(assistantMessage.id);
    abortRef.current = false;
    streamingContentRef.current = "";

    try {
      await llmService.generateResponse(
        [...messages, userMessage],
        {
          onToken: token => {
            if (abortRef.current) return;
            streamingContentRef.current += token;
            updateMessage(conversationId!, assistantMessage.id, streamingContentRef.current);
          },
          onComplete: stats => {
            if (stats) {
              updateMessageStats(conversationId!, assistantMessage.id, stats);
            }
            setIsGenerating(false);
            setStreamingMessageId(null);
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
          },
        },
        activeModel,
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
    isModelReady: modelReady,
    activeModel,
    streamingMessageId,
    sendMessage,
    stopGeneration,
  };
}
