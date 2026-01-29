import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { Message } from "@/services/mock-llm";
import { StyleSheet, View } from "react-native";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const userBubbleColor = useThemeColor({}, "userBubble");
  const assistantBubbleColor = useThemeColor({}, "assistantBubble");
  const userTextColor = useThemeColor({}, "userBubbleText");
  const assistantTextColor = useThemeColor({}, "text");

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          { backgroundColor: isUser ? userBubbleColor : assistantBubbleColor },
        ]}
      >
        <ThemedText
          style={[styles.messageText, { color: isUser ? userTextColor : assistantTextColor }]}
        >
          {message.content}
          {isStreaming && <ThemedText style={styles.cursor}>▊</ThemedText>}
        </ThemedText>
      </View>
      <ThemedText style={styles.timestamp}>{formatTime(message.timestamp)}</ThemedText>
    </View>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    maxWidth: "85%",
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  assistantContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  cursor: {
    opacity: 0.7,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 4,
    marginHorizontal: 4,
  },
});
