import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface ModelSectionHeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export function ModelSectionHeader({ icon, title, subtitle }: ModelSectionHeaderProps) {
  const tintColor = useThemeColor({}, "tint");

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={16} color={tintColor} />
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      </View>
      <ThemedText style={styles.sectionSubtitle}>{subtitle}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.5,
    marginLeft: 24,
  },
});
