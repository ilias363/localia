import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface FileInfoCardProps {
  fileName: string;
  fileSize?: number;
}

export function FileInfoCard({ fileName, fileSize }: FileInfoCardProps) {
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const borderColor = useThemeColor({}, "border");

  return (
    <View style={[styles.fileCard, { backgroundColor: cardBackground, borderColor }]}>
      <View style={[styles.fileIconContainer, { backgroundColor: tintColor + "20" }]}>
        <Ionicons name="document" size={28} color={tintColor} />
      </View>
      <View style={styles.fileInfo}>
        <ThemedText style={styles.fileName} numberOfLines={2}>
          {fileName}
        </ThemedText>
        {fileSize && (
          <ThemedText style={styles.fileSize}>
            {(fileSize / (1024 * 1024)).toFixed(1)} MB
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  fileIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
    gap: 4,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
  },
  fileSize: {
    fontSize: 14,
    opacity: 0.6,
  },
});
