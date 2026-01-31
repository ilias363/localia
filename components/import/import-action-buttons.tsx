import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface ImportActionButtonsProps {
  onCancel: () => void;
  onImport: () => void;
  isImporting: boolean;
  disabled: boolean;
}

export function ImportActionButtons({
  onCancel,
  onImport,
  isImporting,
  disabled,
}: ImportActionButtonsProps) {
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");

  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={[styles.button, styles.cancelButton, { borderColor }]}
        onPress={onCancel}
        disabled={isImporting}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.importButton, (disabled || isImporting) && { opacity: 0.5 }]}
        onPress={onImport}
        disabled={disabled || isImporting}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[tintColor, `${tintColor}DD`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.importButtonGradient}
        >
          {isImporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="download-outline" size={20} color="#fff" />
          )}
          <ThemedText style={styles.importButtonText}>
            {isImporting ? "Importing..." : "Import"}
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  importButton: {},
  importButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  importButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
