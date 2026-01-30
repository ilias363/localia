import { llmService } from "@/services/llm";
import { useConversationStore } from "@/stores/conversation-store";
import { useModelStore } from "@/stores/model-store";
import { useRef, useState } from "react";

export function useChat() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const abortRef = useRef(false);
  const streamingContentRef = useRef("");

  // Reactive conversation state
  const conversations = useConversationStore(state => state.conversations);
  const activeConversationId = useConversationStore(state => state.activeConversationId);
  const addMessage = useConversationStore(state => state.addMessage);
  const updateMessage = useConversationStore(state => state.updateMessage);
  const createConversation = useConversationStore(state => state.createConversation);

  // Reactive model state
  const models = useModelStore(state => state.models);
  const modelStates = useModelStore(state => state.modelStates);
  const activeModelId = useModelStore(state => state.activeModelId);
  const activeModelPath = useModelStore(state => state.activeModelPath);

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
    if (!conversationId) {
      const newConversation = createConversation();
      conversationId = newConversation.id;
    }

    // Add user message
    const userMessage = addMessage(conversationId, {
      role: "user",
      content,
    });

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
          onComplete: () => {
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
