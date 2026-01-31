import { useHaptics } from "@/hooks/use-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  modelLoaded?: boolean;
  bottomInset?: number;
}

export function ChatInput({
  onSend,
  onStop,
  disabled,
  isGenerating = false,
  modelLoaded = true,
  bottomInset = 0,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const router = useRouter();
  const { triggerLight, triggerMedium } = useHaptics();

  const backgroundColor = useThemeColor({}, "inputBackground");
  const inputBackgroundColor = useThemeColor({}, "inputFieldBackground");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholder");
  const tintColor = useThemeColor({}, "tint");
  const userBubbleText = useThemeColor({}, "userBubbleText");
  const warningColor = useThemeColor({}, "warning");
  const dangerColor = useThemeColor({}, "danger");

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled && modelLoaded) {
      triggerLight();
      onSend(trimmed);
      setText("");
    }
  };

  const handleStop = () => {
    triggerMedium();
    onStop?.();
  };

  const canSend = text.trim().length > 0 && !disabled && modelLoaded;

  // Show model required message if no model is loaded
  if (!modelLoaded) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <TouchableOpacity
          style={[styles.modelRequiredContainer, { backgroundColor: warningColor + "15" }]}
          onPress={() => router.push("/model-manager" as const as "/settings")}
          activeOpacity={0.7}
        >
          <Ionicons name="cube-outline" size={20} color={warningColor} />
          <View style={styles.modelRequiredText}>
            <ThemedText style={[styles.modelRequiredTitle, { color: warningColor }]}>
              No Model Loaded
            </ThemedText>
            <ThemedText style={styles.modelRequiredSubtitle}>
              Tap to download or select a model
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={warningColor} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Type a message..."
          placeholderTextColor={placeholderColor}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        {isGenerating ? (
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: dangerColor }]}
            onPress={handleStop}
            activeOpacity={0.7}
          >
            <Ionicons name="stop" size={16} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: canSend ? tintColor : "transparent" }]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={canSend ? userBubbleText : placeholderColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  modelRequiredContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  modelRequiredText: {
    flex: 1,
  },
  modelRequiredTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 1,
  },
  modelRequiredSubtitle: {
    fontSize: 13,
    opacity: 0.6,
  },
});
