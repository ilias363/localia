import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export function EmptyState() {
  const iconColor = useThemeColor({}, "tint");

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}>
        <Ionicons name="chatbubbles-outline" size={48} color={iconColor} />
      </View>
      <ThemedText style={styles.title}>Welcome to Localia</ThemedText>
      <ThemedText style={styles.subtitle}>
        Your private AI assistant running locally on your device.
        {"\n"}Start a conversation below!
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 24,
  },
});
