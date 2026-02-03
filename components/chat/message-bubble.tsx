import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/stores/settings-store";
import type { Message } from "@/types";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { MarkdownRenderer } from "./markdown-renderer";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  isThinking?: boolean;
}

export function MessageBubble({ message, isStreaming, isThinking }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const statsForNerdsEnabled = useSettingsStore(s => s.statsForNerdsEnabled);
  const [thinkingExpanded, setThinkingExpanded] = useState(false);

  const userBubbleColor = useThemeColor({}, "userBubble");
  const assistantBubbleColor = useThemeColor({}, "assistantBubble");
  const userTextColor = useThemeColor({}, "userBubbleText");
  const assistantTextColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const subtleTextColor = useThemeColor({}, "icon");

  const showStats = statsForNerdsEnabled && !isUser && !isStreaming && message.stats;
  const hasThinking = !isUser && (message.thinking || isThinking);
  const hasContent = message.content.length > 0;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {/* Model name header for assistant messages */}
      {!isUser && message.modelName && (
        <View style={styles.modelHeader}>
          <ThemedText style={[styles.modelName, { color: subtleTextColor }]}>
            {message.modelName}
          </ThemedText>
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          { backgroundColor: isUser ? userBubbleColor : assistantBubbleColor },
        ]}
      >
        {/* Thinking indicator - simple inline version */}
        {hasThinking && (
          <Pressable
            onPress={() => setThinkingExpanded(!thinkingExpanded)}
            style={styles.thinkingRow}
          >
            <ThemedText style={[styles.thinkingIndicator, { color: tintColor }]}>
              {isThinking ? "🤔 Thinking..." : "💡 Thought"}
            </ThemedText>
            {!isThinking && message.thinking && (
              <ThemedText style={[styles.thinkingToggle, { color: tintColor }]}>
                {thinkingExpanded ? "hide" : "show"}
              </ThemedText>
            )}
          </Pressable>
        )}

        {/* Expanded thinking content */}
        {thinkingExpanded && message.thinking && !isThinking && (
          <View style={[styles.thinkingContent, { borderColor: subtleTextColor }]}>
            <ThemedText style={[styles.thinkingText, { color: subtleTextColor }]}>
              {message.thinking}
            </ThemedText>
          </View>
        )}

        {/* Streaming thinking content */}
        {isThinking && message.thinking && (
          <View style={[styles.thinkingContent, { borderColor: subtleTextColor }]}>
            <ThemedText style={[styles.thinkingText, { color: subtleTextColor }]}>
              {message.thinking}
              <ThemedText style={[styles.cursor, { color: tintColor }]}>▎</ThemedText>
            </ThemedText>
          </View>
        )}

        {/* Show animated dots when streaming with no content */}
        {isStreaming && !hasContent && !isThinking ? (
          <StreamingDots color={tintColor} />
        ) : hasContent ? (
          isUser ? (
            <ThemedText
              style={[styles.messageText, { color: userTextColor }]}
            >
              {message.content.trimStart()}
            </ThemedText>
          ) : (
            <View style={styles.markdownContainer}>
              <MarkdownRenderer
                content={message.content.trimStart()}
                textColor={assistantTextColor}
              />
              {isStreaming && (
                <ThemedText style={[styles.cursor, { color: tintColor }]}>▎</ThemedText>
              )}
            </View>
          )
        ) : null}
      </View>

      {/* Metadata row - aligned based on message sender */}
      <View style={[styles.metaRow, isUser ? styles.metaRowUser : styles.metaRowAssistant]}>
        <ThemedText style={[styles.timestamp, { color: subtleTextColor }]}>
          {isStreaming ? "Generating..." : formatTime(message.timestamp)}
        </ThemedText>
        {showStats ? (
          <ThemedText style={[styles.statsText, { color: subtleTextColor }]}>
            {message.stats!.tokensGenerated} tok • {message.stats!.tokensPerSecond.toFixed(1)} tok/s
            • {(message.stats!.generationTimeMs / 1000).toFixed(1)}s
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

// Animated streaming dots component with wave effect
function StreamingDots({ color }: { color: string }) {
  const dot1Scale = useSharedValue(0.6);
  const dot2Scale = useSharedValue(0.6);
  const dot3Scale = useSharedValue(0.6);

  useEffect(() => {
    const duration = 350;

    const animation = (delay: number) =>
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1.2, { duration, easing: Easing.out(Easing.ease) }),
            withTiming(0.6, { duration, easing: Easing.in(Easing.ease) }),
          ),
          -1,
          false,
        ),
      );

    dot1Scale.value = animation(0);
    dot2Scale.value = animation(150);
    dot3Scale.value = animation(300);
  }, [dot1Scale, dot2Scale, dot3Scale]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot1Scale.value }],
    opacity: 0.5 + dot1Scale.value * 0.4,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot2Scale.value }],
    opacity: 0.5 + dot2Scale.value * 0.4,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot3Scale.value }],
    opacity: 0.5 + dot3Scale.value * 0.4,
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot1Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot2Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot3Style]} />
    </View>
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
    fontWeight: "300",
    fontSize: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    paddingHorizontal: 4,
    gap: 6,
  },
  metaRowUser: {
    justifyContent: "flex-end",
  },
  metaRowAssistant: {
    justifyContent: "space-between",
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
    fontWeight: "500",
  },
  modelHeader: {
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  modelName: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.7,
  },
  statsText: {
    fontSize: 11,
  },
  separator: {
    fontSize: 11,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  thinkingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 4,
  },
  thinkingIndicator: {
    fontSize: 12,
    fontWeight: "600",
  },
  thinkingToggle: {
    fontSize: 11,
    opacity: 0.7,
  },
  thinkingContent: {
    borderTopWidth: StyleSheet.hairlineWidth,
    opacity: 0.85,
  },
  thinkingText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: "italic",
  },
  markdownContainer: {
    flexShrink: 1,
  },
});
