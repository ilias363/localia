import { generateId, generateResponse, type Message } from "@/services/mock-llm";
import { useConversationStore } from "@/stores/conversation-store";
import { useCallback, useRef, useState } from "react";

export function useChat() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const abortRef = useRef(false);
  const streamingContentRef = useRef("");

  const {
    activeConversationId,
    getActiveConversation,
    addMessage,
    updateMessage,
    createConversation,
  } = useConversationStore();

  const activeConversation = getActiveConversation();
  const messages = activeConversation?.messages ?? [];

  const sendMessage = useCallback(
    async (content: string) => {
      if (isGenerating) return;

      let conversationId = activeConversationId;
      if (!conversationId) {
        conversationId = createConversation();
      }

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      addMessage(conversationId, userMessage);
      addMessage(conversationId, assistantMessage);

      setIsGenerating(true);
      setStreamingMessageId(assistantMessage.id);
      abortRef.current = false;
      streamingContentRef.current = "";

      try {
        await generateResponse([...messages, userMessage], {
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
        });
      } catch {
        setIsGenerating(false);
        setStreamingMessageId(null);
      }
    },
    [messages, isGenerating, activeConversationId, addMessage, updateMessage, createConversation],
  );

  const stopGeneration = useCallback(() => {
    abortRef.current = true;
    setIsGenerating(false);
    setStreamingMessageId(null);
  }, []);

  return {
    messages,
    isGenerating,
    streamingMessageId,
    sendMessage,
    stopGeneration,
  };
}
