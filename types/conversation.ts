// Conversation-related type definitions

import type { Message } from "./message";

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number; // Unix timestamp in milliseconds
  updatedAt: number; // Unix timestamp in milliseconds
}
