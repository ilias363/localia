import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAllThemeColors } from "@/hooks/use-theme-colors";

interface LoadingOverlayProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
}

export function LoadingOverlay({ visible, title = "Loading...", subtitle }: LoadingOverlayProps) {
  const { cardBackground, tint: tintColor } = useAllThemeColors();

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    gap: 16,
    minWidth: 200,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});
