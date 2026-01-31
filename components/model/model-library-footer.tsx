import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

export function ModelLibraryFooter() {
  const iconColor = useThemeColor({}, "text");

  return (
    <View style={styles.footer}>
      <Ionicons name="lock-closed-outline" size={14} color={iconColor} style={{ opacity: 0.4 }} />
      <ThemedText style={styles.footerText}>
        Models run locally. Your data stays on device.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 13,
    opacity: 0.4,
  },
});
