import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  bottomInset?: number;
}

export function ChatInput({ onSend, disabled, bottomInset = 0 }: ChatInputProps) {
  const [text, setText] = useState("");

  const backgroundColor = useThemeColor({}, "inputBackground");
  const inputBackgroundColor = useThemeColor({}, "inputFieldBackground");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholder");
  const tintColor = useThemeColor({}, "tint");
  const userBubbleText = useThemeColor({}, "userBubbleText");

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText("");
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

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
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: canSend ? tintColor : "transparent" }]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-up" size={20} color={canSend ? userBubbleText : placeholderColor} />
        </TouchableOpacity>
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
});
