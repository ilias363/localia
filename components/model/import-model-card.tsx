import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAllThemeColors } from "@/hooks/use-theme-colors";

interface ImportModelCardProps {
  onPress: () => void;
}

export function ImportModelCard({ onPress }: ImportModelCardProps) {
  const { tint: tintColor } = useAllThemeColors();

  return (
    <TouchableOpacity
      style={[styles.importCard, { borderColor: tintColor + "40" }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[`${tintColor}45`, `${tintColor}15`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.importCardGradient}
      >
        <View style={[styles.importIconContainer, { backgroundColor: tintColor + "20" }]}>
          <Ionicons name="add-circle-outline" size={22} color={tintColor} />
        </View>
        <View style={styles.importTextContainer}>
          <ThemedText style={styles.importTitle}>Import Custom Model</ThemedText>
          <ThemedText style={styles.importSubtitle}>Add a GGUF file from device</ThemedText>
        </View>
        <View style={[styles.importArrow, { backgroundColor: tintColor + "15" }]}>
          <Ionicons name="arrow-forward" size={14} color={tintColor} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  importCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  importCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  importIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  importTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  importTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  importSubtitle: {
    fontSize: 12,
    opacity: 0.5,
  },
  importArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
