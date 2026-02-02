import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

// Import app icons
const appIconLight = require("@/assets/icons/app-icon-light.png");
const appIconDark = require("@/assets/icons/app-icon-dark.png");

interface EmptyStateProps {
  modelLoaded?: boolean;
}

export function EmptyState({ modelLoaded = true }: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const appIcon = colorScheme === "dark" ? appIconLight : appIconDark;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer]}>
        <Image
          source={appIcon}
          style={styles.appIcon}
          contentFit="contain"
          allowDownscaling={false}
        />
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
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 16,
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
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
