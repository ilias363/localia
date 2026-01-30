import type { Conversation, Message } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { zustandStorage } from "./mmkv";

// Store version for migrations
const STORE_VERSION = 1;

// State shape
interface ConversationStoreState {
  conversations: Conversation[];
  activeConversationId: string | null;
  _hasHydrated: boolean;
}

// Actions
interface ConversationStoreActions {
  // Hydration
  setHasHydrated: (state: boolean) => void;

  // Getters
  getActiveConversation: () => Conversation | null;
  getConversation: (id: string) => Conversation | undefined;

  // Conversation management
  createConversation: (title?: string) => Conversation;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  setActiveConversation: (id: string | null) => void;
  updateConversationTitle: (id: string, title: string) => void;

  // Message management
  addMessage: (conversationId: string, message: Omit<Message, "id" | "timestamp">) => Message;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  clearMessages: (conversationId: string) => void;
}

type ConversationStore = ConversationStoreState & ConversationStoreActions;

// Helper to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const useConversationStore = create<ConversationStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        conversations: [],
        activeConversationId: null,
        _hasHydrated: false,

        // Hydration setter
        setHasHydrated: (state: boolean) => {
          set({ _hasHydrated: state });
        },

        // Getters
        getActiveConversation: () => {
          const { conversations, activeConversationId } = get();
          if (!activeConversationId) return null;
          return conversations.find(c => c.id === activeConversationId) ?? null;
        },

        getConversation: (id: string) => {
          return get().conversations.find(c => c.id === id);
        },

        // Conversation management
        createConversation: (title?: string) => {
          const newConversation: Conversation = {
            id: generateId(),
            title: title ?? "New Chat",
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          set(state => ({
            conversations: [newConversation, ...state.conversations],
            activeConversationId: newConversation.id,
          }));

          return newConversation;
        },

        deleteConversation: (id: string) => {
          set(state => {
            const filtered = state.conversations.filter(c => c.id !== id);
            const newActiveId =
              state.activeConversationId === id
                ? (filtered[0]?.id ?? null)
                : state.activeConversationId;

            return {
              conversations: filtered,
              activeConversationId: newActiveId,
            };
          });
        },

        clearAllConversations: () => {
          set({ conversations: [], activeConversationId: null });
        },

        setActiveConversation: (id: string | null) => {
          set({ activeConversationId: id });
        },

        updateConversationTitle: (id: string, title: string) => {
          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === id ? { ...c, title, updatedAt: Date.now() } : c,
            ),
          }));
        },

        // Message management
        addMessage: (conversationId: string, message: Omit<Message, "id" | "timestamp">) => {
          const newMessage: Message = {
            ...message,
            id: generateId(),
            timestamp: Date.now(),
          };

          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conversationId
                ? {
                  ...c,
                  messages: [...c.messages, newMessage],
                  updatedAt: Date.now(),
                }
                : c,
            ),
          }));

          return newMessage;
        },

        updateMessage: (conversationId: string, messageId: string, content: string) => {
          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conversationId
                ? {
                  ...c,
                  messages: c.messages.map(m => (m.id === messageId ? { ...m, content } : m)),
                  updatedAt: Date.now(),
                }
                : c,
            ),
          }));
        },

        deleteMessage: (conversationId: string, messageId: string) => {
          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conversationId
                ? {
                  ...c,
                  messages: c.messages.filter(m => m.id !== messageId),
                  updatedAt: Date.now(),
                }
                : c,
            ),
          }));
        },

        clearMessages: (conversationId: string) => {
          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conversationId
                ? {
                  ...c,
                  messages: [],
                  updatedAt: Date.now(),
                }
                : c,
            ),
          }));
        },
      }),
      {
        name: "conversation-store",
        version: STORE_VERSION,
        storage: createJSONStorage(() => zustandStorage),

        // Only persist data fields, not functions or transient state
        partialize: state => ({
          conversations: state.conversations,
          activeConversationId: state.activeConversationId,
        }),

        // Deep merge persisted state with current state
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<ConversationStoreState> | undefined;
          return {
            ...currentState,
            conversations: persisted?.conversations ?? currentState.conversations,
            activeConversationId:
              persisted?.activeConversationId ?? currentState.activeConversationId,
          };
        },

        // Handle hydration completion
        onRehydrateStorage: () => {
          return (state, error) => {
            if (error) {
              console.error("Conversation store hydration failed:", error);
            } else {
              state?.setHasHydrated(true);
            }
          };
        },

        // Migration handler for future schema changes
        migrate: (persistedState, version) => {
          const state = persistedState as Partial<ConversationStoreState>;

          if (version < 1) {
            // Future migrations go here
            // Example: return { ...state, newField: defaultValue };
          }

          return state as ConversationStoreState;
        },
      },
    ),
  ),
);

// Selector hooks for optimized re-renders
export const useConversations = () => useConversationStore(state => state.conversations);
export const useActiveConversationId = () =>
  useConversationStore(state => state.activeConversationId);
export const useHasHydrated = () => useConversationStore(state => state._hasHydrated);

// Legacy compatibility exports for easier migration
export const ConversationProvider = ({ children }: { children: React.ReactNode }) => children;
