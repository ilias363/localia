import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useConversationStore } from "@/stores/conversation-store";
import { useState } from "react";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const borderColor = useThemeColor({}, "border");
  const cardBackground = useThemeColor({}, "cardBackground");
  const iconColor = useThemeColor({}, "text");
  const dangerColor = useThemeColor({}, "danger");
  const tintColor = useThemeColor({}, "tint");
  const successColor = useThemeColor({}, "success");

  const { clearAllConversations, conversations } = useConversationStore();

  // Local settings state (will be persisted later)
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [streamingEnabled, setStreamingEnabled] = useState(true);

  const handleClearAllChats = () => {
    if (conversations.length === 0) {
      Alert.alert("No Conversations", "There are no conversations to clear.");
      return;
    }

    Alert.alert(
      "Clear All Conversations",
      `Are you sure you want to delete all ${conversations.length} conversation${conversations.length > 1 ? "s" : ""}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => clearAllConversations(),
        },
      ],
    );
  };

  const handleGitHub = () => {
    Linking.openURL("https://github.com");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={tintColor} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Settings</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <ThemedText style={styles.sectionTitle}>Model</ThemedText>
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: tintColor + "20" }]}>
                <Ionicons name="cube-outline" size={20} color={tintColor} />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingLabel}>Current Model</ThemedText>
                <ThemedText style={styles.settingValue}>Mock Model v1.0</ThemedText>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: successColor }]} />
              <ThemedText style={[styles.statusText, { color: successColor }]}>Active</ThemedText>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: "#8B5CF620" }]}>
                <Ionicons name="cloud-download-outline" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingLabel}>Model Library</ThemedText>
                <ThemedText style={styles.settingValue}>Browse & download models</ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={iconColor} style={{ opacity: 0.4 }} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: "#F5920020" }]}>
                <Ionicons name="folder-open-outline" size={20} color="#F59200" />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingLabel}>Import GGUF</ThemedText>
                <ThemedText style={styles.settingValue}>Load from device storage</ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={iconColor} style={{ opacity: 0.4 }} />
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.sectionTitle}>Generation</ThemedText>
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: "#0EA5E920" }]}>
                <Ionicons name="text-outline" size={20} color="#0EA5E9" />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingLabel}>Streaming</ThemedText>
                <ThemedText style={styles.settingValue}>Show tokens as generated</ThemedText>
              </View>
            </View>
            <Switch
              value={streamingEnabled}
              onValueChange={setStreamingEnabled}
              trackColor={{ false: borderColor, true: tintColor + "80" }}
              thumbColor={streamingEnabled ? tintColor : "#f4f3f4"}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: "#EC489920" }]}>
                <Ionicons name="options-outline" size={20} color="#EC4899" />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingLabel}>Advanced Parameters</ThemedText>
                <ThemedText style={styles.settingValue}>Temperature, top-p, etc.</ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={iconColor} style={{ opacity: 0.4 }} />
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.sectionTitle}>App</ThemedText>
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: "#6366F120" }]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#6366F1" />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingLabel}>Haptic Feedback</ThemedText>
                <ThemedText style={styles.settingValue}>Vibrate on actions</ThemedText>
              </View>
            </View>
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{ false: borderColor, true: tintColor + "80" }}
              thumbColor={hapticEnabled ? tintColor : "#f4f3f4"}
            />
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Data</ThemedText>
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <TouchableOpacity style={styles.settingRow} onPress={handleClearAllChats}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: dangerColor + "20" }]}>
                <Ionicons name="trash-outline" size={20} color={dangerColor} />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={[styles.settingLabel, { color: dangerColor }]}>
                  Clear All Conversations
                </ThemedText>
                <ThemedText style={styles.settingValue}>
                  {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.sectionTitle}>About</ThemedText>
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: "#10B98120" }]}>
                <Ionicons name="information-circle-outline" size={20} color="#10B981" />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingLabel}>Version</ThemedText>
                <ThemedText style={styles.settingValue}>1.0.0</ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <TouchableOpacity style={styles.settingRow} onPress={handleGitHub}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: iconColor + "15" }]}>
                <Ionicons name="logo-github" size={20} color={iconColor} />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingLabel}>Source Code</ThemedText>
                <ThemedText style={styles.settingValue}>View on GitHub</ThemedText>
              </View>
            </View>
            <Ionicons name="open-outline" size={18} color={iconColor} style={{ opacity: 0.4 }} />
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.footerText}>
          Localia runs AI models locally on your device.{"\n"}
          Your conversations never leave your phone.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.4,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 14,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    paddingHorizontal: 14,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingValue: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginLeft: 62,
  },
  footerText: {
    fontSize: 13,
    opacity: 0.35,
    textAlign: "center",
    marginTop: 32,
    lineHeight: 20,
  },
});
