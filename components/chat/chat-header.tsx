import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface ChatHeaderProps {
  modelName: string;
  isConnected: boolean;
  onMenuPress?: () => void;
  onNewChatPress?: () => void;
}

export function ChatHeader({
  modelName,
  isConnected,
  onMenuPress,
  onNewChatPress,
}: ChatHeaderProps) {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const iconColor = useThemeColor({}, "text");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");

  return (
    <View style={[styles.container, { backgroundColor, borderBottomColor: borderColor }]}>
      <TouchableOpacity style={styles.iconButton} onPress={onMenuPress} activeOpacity={0.7}>
        <Ionicons name="menu-outline" size={26} color={iconColor} />
      </TouchableOpacity>

      <View style={styles.modelInfo}>
        <View style={styles.modelNameRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? successColor : warningColor },
            ]}
          />
          <ThemedText style={styles.modelName} numberOfLines={1}>
            {modelName}
          </ThemedText>
        </View>
      </View>

      <TouchableOpacity style={styles.iconButton} onPress={onNewChatPress} activeOpacity={0.7}>
        <Ionicons name="create-outline" size={24} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  iconButton: {
    padding: 8,
  },
  modelInfo: {
    flex: 1,
    alignItems: "center",
  },
  modelNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  modelName: {
    fontSize: 16,
    fontWeight: "600",
  },
});
