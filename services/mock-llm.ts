// Mock LLM service to simulate local model behavior

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: () => void;
  onError?: (error: Error) => void;
}

const MOCK_RESPONSES = [
  "I'm a local AI assistant running on your device. How can I help you today?",
  "That's an interesting question! Let me think about it... Based on my understanding, I would say that the key factors to consider are the context and your specific needs.",
  "Great point! I appreciate you sharing that with me. Here's my perspective on this matter.",
  "I understand what you're looking for. Let me break this down step by step for you.",
  "Thanks for asking! This is something I can definitely help with. Here's what I know about it.",
];

// Simulates token-by-token streaming like a real LLM
export async function generateResponse(
  messages: Message[],
  callbacks: StreamCallbacks,
): Promise<void> {
  const lastUserMessage = messages.filter(m => m.role === "user").pop();

  // Pick a response based on message content or random
  let response: string;
  if (
    lastUserMessage?.content.toLowerCase().includes("hello") ||
    lastUserMessage?.content.toLowerCase().includes("hi")
  ) {
    response =
      "Hello! I'm your local AI assistant. I'm running entirely on your device, which means our conversation stays private. What would you like to chat about?";
  } else if (lastUserMessage?.content.toLowerCase().includes("help")) {
    response =
      "I'm here to help! As a local AI, I can assist you with various tasks like answering questions, brainstorming ideas, explaining concepts, and having conversations. What do you need help with?";
  } else {
    response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
  }

  // Simulate thinking delay
  await sleep(300 + Math.random() * 500);

  // Stream tokens with realistic timing
  const words = response.split(" ");
  for (let i = 0; i < words.length; i++) {
    const token = i === 0 ? words[i] : " " + words[i];
    callbacks.onToken(token);
    await sleep(30 + Math.random() * 70); // Variable delay between tokens
  }

  callbacks.onComplete();
}

// Utility function
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate unique IDs for messages
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
