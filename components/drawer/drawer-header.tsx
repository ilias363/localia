import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAllThemeColors } from "@/hooks/use-theme-colors";

// Import app icons
const appIconLight = require("@/assets/icons/app-icon-light.png");
const appIconDark = require("@/assets/icons/app-icon-dark.png");

interface DrawerHeaderProps {
  onNewChat: () => void;
}

export function DrawerHeader({ onNewChat }: DrawerHeaderProps) {
  const { border: borderColor, text: textColor } = useAllThemeColors();
  const colorScheme = useColorScheme();
  const appIcon = colorScheme === "dark" ? appIconLight : appIconDark;

  return (
    <View style={[styles.header, { borderBottomColor: borderColor }]}>
      {/* App branding */}
      <View style={styles.branding}>
        <Image
          source={appIcon}
          style={styles.appIcon}
          contentFit="contain"
          allowDownscaling={false}
        />
        <ThemedText style={styles.appName}>LocalIA</ThemedText>
      </View>

      <TouchableOpacity
        style={[styles.newChatButton, { borderColor }]}
        onPress={onNewChat}
        activeOpacity={0.7}
      >
        <Ionicons name="add-outline" size={20} color={textColor} />
        <ThemedText style={styles.newChatText}>New Chat</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 4,
  },
  branding: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
  },
  appTagline: {
    fontSize: 12,
    fontWeight: "500",
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  newChatText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
