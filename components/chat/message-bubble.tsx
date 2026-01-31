import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/stores/settings-store";
import type { Message } from "@/types";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const statsForNerdsEnabled = useSettingsStore(s => s.statsForNerdsEnabled);

  const userBubbleColor = useThemeColor({}, "userBubble");
  const assistantBubbleColor = useThemeColor({}, "assistantBubble");
  const userTextColor = useThemeColor({}, "userBubbleText");
  const assistantTextColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const subtleTextColor = useThemeColor({}, "icon");

  const showStats = statsForNerdsEnabled && !isUser && !isStreaming && message.stats;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          { backgroundColor: isUser ? userBubbleColor : assistantBubbleColor },
        ]}
      >
        {/* Show animated dots when streaming with no content */}
        {isStreaming && message.content.length === 0 ? (
          <StreamingDots color={tintColor} />
        ) : (
          <ThemedText
            style={[styles.messageText, { color: isUser ? userTextColor : assistantTextColor }]}
          >
            {message.content}
            {isStreaming && (
              <ThemedText style={[styles.cursor, { color: tintColor }]}>▎</ThemedText>
            )}
          </ThemedText>
        )}
      </View>
      {showStats ? (
        <View style={styles.statsRow}>
          <ThemedText style={[styles.statsText, { color: subtleTextColor }]}>
            {message.stats!.tokensGenerated} tokens • {message.stats!.tokensPerSecond.toFixed(1)}{" "}
            tok/s • {(message.stats!.generationTimeMs / 1000).toFixed(1)}s
          </ThemedText>
          <ThemedText style={styles.timestamp}>{formatTime(message.timestamp)}</ThemedText>
        </View>
      ) : (
        <ThemedText style={styles.timestamp}>
          {isStreaming ? "Generating..." : formatTime(message.timestamp)}
        </ThemedText>
      )}
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
  timestamp: {
    fontSize: 11,
    opacity: 0.5,
    marginHorizontal: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginHorizontal: 4,
  },
  statsText: {
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
});
