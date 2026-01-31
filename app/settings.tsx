import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AdvancedParametersModal, SettingRow, SettingToggle } from "@/components/settings";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card, Divider, SectionTitle } from "@/components/ui";
import { useHaptics } from "@/hooks/use-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useConversationStore } from "@/stores/conversation-store";
import { useModelStore } from "@/stores/model-store";
import { useSettingsStore } from "@/stores/settings-store";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { triggerLight, triggerMedium, triggerSuccess, triggerWarning } = useHaptics();
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "text");
  const dangerColor = useThemeColor({}, "danger");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");

  const conversations = useConversationStore(state => state.conversations);
  const clearAllConversations = useConversationStore(state => state.clearAllConversations);

  // Subscribe to reactive state values for proper re-renders
  const models = useModelStore(state => state.models);
  const activeModelId = useModelStore(state => state.activeModelId);
  const modelStates = useModelStore(state => state.modelStates);

  // Derive computed values
  const activeModel = activeModelId ? models.find(m => m.id === activeModelId) : null;
  const modelReady = activeModelId ? modelStates[activeModelId]?.status === "ready" : false;

  // Settings from store
  const hapticEnabled = useSettingsStore(state => state.hapticEnabled);
  const setHapticEnabled = useSettingsStore(state => state.setHapticEnabled);
  const statsForNerdsEnabled = useSettingsStore(state => state.statsForNerdsEnabled);
  const setStatsForNerdsEnabled = useSettingsStore(state => state.setStatsForNerdsEnabled);
  const temperature = useSettingsStore(state => state.temperature);
  const setTemperature = useSettingsStore(state => state.setTemperature);
  const topP = useSettingsStore(state => state.topP);
  const setTopP = useSettingsStore(state => state.setTopP);
  const topK = useSettingsStore(state => state.topK);
  const setTopK = useSettingsStore(state => state.setTopK);
  const minP = useSettingsStore(state => state.minP);
  const setMinP = useSettingsStore(state => state.setMinP);
  const maxTokens = useSettingsStore(state => state.maxTokens);
  const setMaxTokens = useSettingsStore(state => state.setMaxTokens);
  const repeatPenalty = useSettingsStore(state => state.repeatPenalty);
  const setRepeatPenalty = useSettingsStore(state => state.setRepeatPenalty);

  // App version from Expo Constants
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  // Advanced parameters modal state
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [advancedParams, setAdvancedParams] = useState({
    temperature: temperature.toString(),
    topP: topP.toString(),
    topK: topK.toString(),
    minP: minP.toString(),
    maxTokens: maxTokens.toString(),
    repeatPenalty: repeatPenalty.toString(),
  });

  const handleClearAllChats = () => {
    if (conversations.length === 0) {
      Alert.alert("No Conversations", "There are no conversations to clear.");
      return;
    }

    triggerWarning();
    Alert.alert(
      "Clear All Conversations",
      `Are you sure you want to delete all ${conversations.length} conversation${conversations.length > 1 ? "s" : ""}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            triggerMedium();
            clearAllConversations();
          },
        },
      ],
    );
  };

  const handleGitHub = () => {
    triggerLight();
    Linking.openURL("https://github.com/ilias363/localia");
  };

  const handleAdvancedParameters = () => {
    triggerLight();
    setAdvancedParams({
      temperature: temperature.toString(),
      topP: topP.toString(),
      topK: topK.toString(),
      minP: minP.toString(),
      maxTokens: maxTokens.toString(),
      repeatPenalty: repeatPenalty.toString(),
    });
    setShowAdvancedModal(true);
  };

  const handleSaveAdvancedParameters = () => {
    const newTemp = parseFloat(advancedParams.temperature);
    const newTopP = parseFloat(advancedParams.topP);
    const newTopK = parseInt(advancedParams.topK, 10);
    const newMinP = parseFloat(advancedParams.minP);
    const newMaxTokens = parseInt(advancedParams.maxTokens, 10);
    const newRepeatPenalty = parseFloat(advancedParams.repeatPenalty);

    if (isNaN(newTemp) || newTemp < 0 || newTemp > 2) {
      Alert.alert("Invalid Temperature", "Temperature must be between 0 and 2.");
      return;
    }
    if (isNaN(newTopP) || newTopP < 0 || newTopP > 1) {
      Alert.alert("Invalid Top-P", "Top-P must be between 0 and 1.");
      return;
    }
    if (isNaN(newTopK) || newTopK < 1 || newTopK > 100) {
      Alert.alert("Invalid Top-K", "Top-K must be between 1 and 100.");
      return;
    }
    if (isNaN(newMinP) || newMinP < 0 || newMinP > 1) {
      Alert.alert("Invalid Min-P", "Min-P must be between 0 and 1.");
      return;
    }
    if (isNaN(newMaxTokens) || newMaxTokens < 1 || newMaxTokens > 4096) {
      Alert.alert("Invalid Max Tokens", "Max tokens must be between 1 and 4096.");
      return;
    }
    if (isNaN(newRepeatPenalty) || newRepeatPenalty < 1 || newRepeatPenalty > 2) {
      Alert.alert("Invalid Repeat Penalty", "Repeat penalty must be between 1 and 2.");
      return;
    }

    setTemperature(newTemp);
    setTopP(newTopP);
    setTopK(newTopK);
    setMinP(newMinP);
    setMaxTokens(newMaxTokens);
    setRepeatPenalty(newRepeatPenalty);
    triggerSuccess();
    setShowAdvancedModal(false);
  };

  const handleResetAdvancedParameters = () => {
    triggerMedium();
    setAdvancedParams({
      temperature: "0.7",
      topP: "0.95",
      topK: "40",
      minP: "0.05",
      maxTokens: "512",
      repeatPenalty: "1.1",
    });
  };

  const handleModelPress = () => {
    triggerLight();
    router.push("/model-manager" as const as "/settings");
  };

  const handleBack = () => {
    triggerLight();
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={tintColor} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Settings</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Model Section */}
        <SectionTitle>Model</SectionTitle>
        <Card>
          <SettingRow
            icon="cube-outline"
            iconColor={tintColor}
            label={activeModel?.name ?? "No Model Selected"}
            value={modelReady ? "Ready to use" : "Setup required"}
            onPress={handleModelPress}
            showChevron
            statusDot={{
              color: modelReady ? successColor : warningColor,
              visible: true,
            }}
          />
        </Card>

        {/* Generation Section */}
        <SectionTitle>Generation</SectionTitle>
        <Card>
          <SettingRow
            icon="options-outline"
            iconColor="#EC4899"
            label="Advanced Parameters"
            value={`Temp: ${temperature} · Top-P: ${topP} · Max: ${maxTokens}`}
            onPress={handleAdvancedParameters}
            showChevron
          />
        </Card>

        {/* App Section */}
        <SectionTitle>App</SectionTitle>
        <Card>
          <SettingToggle
            icon="phone-portrait-outline"
            iconColor="#6366F1"
            label="Haptic Feedback"
            value="Vibrate on actions"
            enabled={hapticEnabled}
            onToggle={setHapticEnabled}
          />
          <Divider />
          <SettingToggle
            icon="analytics-outline"
            iconColor="#10B981"
            label="Stats for Nerds"
            value="Show generation stats"
            enabled={statsForNerdsEnabled}
            onToggle={setStatsForNerdsEnabled}
          />
        </Card>

        {/* Data Section */}
        <SectionTitle>Data</SectionTitle>
        <Card>
          <SettingRow
            icon="trash-outline"
            iconColor={dangerColor}
            label="Clear All Conversations"
            labelColor={dangerColor}
            value={`${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`}
            onPress={handleClearAllChats}
          />
        </Card>

        {/* About Section */}
        <SectionTitle>About</SectionTitle>
        <Card>
          <SettingRow
            icon="information-circle-outline"
            iconColor="#10B981"
            label="Version"
            value={appVersion}
          />
          <Divider />
          <SettingRow
            icon="logo-github"
            iconColor={iconColor}
            label="Source Code"
            value="View on GitHub"
            onPress={handleGitHub}
            showChevron
          />
        </Card>

        <ThemedText style={styles.footerText}>
          Localia runs AI models locally on your device.{"\n"}
          Your conversations never leave your phone.
        </ThemedText>
      </ScrollView>

      {/* Advanced Parameters Modal */}
      <AdvancedParametersModal
        visible={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
        values={advancedParams}
        onValuesChange={setAdvancedParams}
        onSave={handleSaveAdvancedParameters}
        onReset={handleResetAdvancedParameters}
      />
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
  footerText: {
    fontSize: 13,
    opacity: 0.35,
    textAlign: "center",
    marginTop: 32,
    lineHeight: 20,
  },
});
