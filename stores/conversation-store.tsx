import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { generateId } from "@/services/mock-llm";
import type { Message } from "@/services/mock-llm";

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  getActiveConversation: () => Conversation | null;
  clearAllConversations: () => void;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const createConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);

    return newConversation.id;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const newConversations = prev.filter((c) => c.id !== id);
      return newConversations;
    });
    setActiveConversationId((currentId) => {
      if (currentId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        return remaining[0]?.id ?? null;
      }
      return currentId;
    });
  }, [conversations]);

  const setActiveConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
  }, []);

  const addMessage = useCallback((conversationId: string, message: Message) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== conversationId) return conv;

        const isFirstUserMessage =
          message.role === "user" && conv.messages.filter((m) => m.role === "user").length === 0;
        const title = isFirstUserMessage
          ? message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "")
          : conv.title;

        return {
          ...conv,
          title,
          messages: [...conv.messages, message],
          updatedAt: new Date(),
        };
      })
    );
  }, []);

  const updateMessage = useCallback((conversationId: string, messageId: string, content: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== conversationId) return conv;

        return {
          ...conv,
          messages: conv.messages.map((msg) =>
            msg.id === messageId ? { ...msg, content } : msg
          ),
          updatedAt: new Date(),
        };
      })
    );
  }, []);

  const getActiveConversation = useCallback(() => {
    return conversations.find((c) => c.id === activeConversationId) ?? null;
  }, [conversations, activeConversationId]);

  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setActiveConversationId(null);
  }, []);

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        activeConversationId,
        createConversation,
        deleteConversation,
        setActiveConversation,
        addMessage,
        updateMessage,
        getActiveConversation,
        clearAllConversations,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationStore() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversationStore must be used within a ConversationProvider");
  }
  return context;
};
