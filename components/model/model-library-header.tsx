import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAllThemeColors } from "@/hooks/use-theme-colors";

interface ModelLibraryHeaderProps {
  totalModels: number;
  downloadedCount: number;
  loadedCount: number;
  onBack: () => void;
  onUnloadAll?: () => void;
}

export function ModelLibraryHeader({
  totalModels,
  downloadedCount,
  loadedCount,
  onBack,
  onUnloadAll,
}: ModelLibraryHeaderProps) {
  const colors = useAllThemeColors();
  const {
    tint: tintColor,
    text: iconColor,
    cardBackground,
    success: successColor,
    warning: warningColor,
  } = colors;

  return (
    <View style={styles.heroHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} color={iconColor} />
      </TouchableOpacity>

      <View style={styles.heroContent}>
        <View style={styles.heroIconWrapper}>
          <LinearGradient
            colors={[tintColor, `${tintColor}99`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroIconGradient}
          >
            <Ionicons name="cube" size={32} color="#ffffff" />
          </LinearGradient>
        </View>
        <ThemedText style={styles.heroTitle}>Model Library</ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          Download and manage AI models for offline use
        </ThemedText>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statItem, { backgroundColor: cardBackground }]}>
            <ThemedText style={styles.statNumber}>{totalModels}</ThemedText>
            <ThemedText style={styles.statLabel}>Available</ThemedText>
          </View>
          <View style={[styles.statItem, { backgroundColor: cardBackground }]}>
            <ThemedText style={[styles.statNumber, { color: successColor }]}>
              {downloadedCount}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Downloaded</ThemedText>
          </View>
          <View style={[styles.statItem, { backgroundColor: cardBackground }]}>
            <ThemedText style={[styles.statNumber, { color: tintColor }]}>{loadedCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Loaded</ThemedText>
          </View>
        </View>

        {/* Unload All Button - only show when models are loaded */}
        {loadedCount > 0 && onUnloadAll && (
          <TouchableOpacity
            style={[styles.unloadAllButton, { backgroundColor: warningColor }]}
            onPress={onUnloadAll}
            activeOpacity={0.8}
          >
            <Ionicons name="power" size={14} color="#ffffff" />
            <ThemedText style={styles.unloadAllText}>Unload All</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
    marginBottom: 8,
  },
  heroContent: {
    alignItems: "center",
  },
  heroIconWrapper: {
    marginBottom: 16,
  },
  heroIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "600",
    paddingBottom: 4,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: "center",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    minWidth: 90,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.5,
    fontWeight: "500",
  },
  unloadAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  unloadAllText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
});
