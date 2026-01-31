import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface DrawerFooterProps {
  onSettings: () => void;
}

export function DrawerFooter({ onSettings }: DrawerFooterProps) {
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");

  return (
    <View style={[styles.bottomActions, { borderTopColor: borderColor }]}>
      <TouchableOpacity style={styles.actionButton} onPress={onSettings} activeOpacity={0.7}>
        <Ionicons name="settings-outline" size={20} color={textColor} />
        <ThemedText style={styles.actionText}>Settings</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomActions: {
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 10,
  },
  actionText: {
    fontSize: 15,
  },
});
