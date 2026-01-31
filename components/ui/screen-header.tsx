import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useHaptics } from "@/hooks/use-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightContent?: React.ReactNode;
  showBorder?: boolean;
}

export function ScreenHeader({
  title,
  onBack,
  leftIcon = "chevron-back",
  rightContent,
  showBorder = true,
}: ScreenHeaderProps) {
  const { triggerLight } = useHaptics();
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "text");

  const handleBack = () => {
    triggerLight();
    onBack?.();
  };

  return (
    <View
      style={[
        styles.header,
        showBorder && { borderBottomColor: borderColor, borderBottomWidth: 1 },
      ]}
    >
      {onBack ? (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons
            name={leftIcon}
            size={28}
            color={leftIcon === "chevron-back" ? tintColor : iconColor}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      <ThemedText style={styles.title}>{title}</ThemedText>
      {rightContent ?? <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 44,
  },
});
