import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAllThemeColors } from "@/hooks/use-theme-colors";

interface DrawerHeaderProps {
  onNewChat: () => void;
}

export function DrawerHeader({ onNewChat }: DrawerHeaderProps) {
  const { border: borderColor, text: textColor } = useAllThemeColors();

  return (
    <View style={[styles.header, { borderBottomColor: borderColor }]}>
      <TouchableOpacity
        style={[styles.newChatButton, { borderColor }]}
        onPress={onNewChat}
        activeOpacity={0.7}
      >
        <Ionicons name="add-outline" size={20} color={textColor} />
        <ThemedText style={styles.newChatText}>New Chat</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 4,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  newChatText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
