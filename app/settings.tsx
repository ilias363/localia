import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useConversationStore } from "@/stores/conversation-store";
import { useModelStore } from "@/stores/model-store";
import { useSettingsStore } from "@/stores/settings-store";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const borderColor = useThemeColor({}, "border");
  const cardBackground = useThemeColor({}, "cardBackground");
  const iconColor = useThemeColor({}, "text");
  const dangerColor = useThemeColor({}, "danger");
  const tintColor = useThemeColor({}, "tint");
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
  const [tempTemperature, setTempTemperature] = useState(temperature.toString());
  const [tempTopP, setTempTopP] = useState(topP.toString());
  const [tempTopK, setTempTopK] = useState(topK.toString());
  const [tempMinP, setTempMinP] = useState(minP.toString());
  const [tempMaxTokens, setTempMaxTokens] = useState(maxTokens.toString());
  const [tempRepeatPenalty, setTempRepeatPenalty] = useState(repeatPenalty.toString());

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
    Linking.openURL("https://github.com/ilias363/localia");
  };

  const handleAdvancedParameters = () => {
    setTempTemperature(temperature.toString());
    setTempTopP(topP.toString());
    setTempTopK(topK.toString());
    setTempMinP(minP.toString());
    setTempMaxTokens(maxTokens.toString());
    setTempRepeatPenalty(repeatPenalty.toString());
    setShowAdvancedModal(true);
  };

  const handleSaveAdvancedParameters = () => {
    const newTemp = parseFloat(tempTemperature);
    const newTopP = parseFloat(tempTopP);
    const newTopK = parseInt(tempTopK, 10);
    const newMinP = parseFloat(tempMinP);
    const newMaxTokens = parseInt(tempMaxTokens, 10);
    const newRepeatPenalty = parseFloat(tempRepeatPenalty);

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
    setShowAdvancedModal(false);
  };

  const handleResetAdvancedParameters = () => {
    setTempTemperature("0.7");
    setTempTopP("0.95");
    setTempTopK("40");
    setTempMinP("0.05");
    setTempMaxTokens("512");
    setTempRepeatPenalty("1.1");
  };

  const handleModelPress = () => {
    router.push("/model-manager" as const as "/settings");
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
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleModelPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: tintColor + "20" }]}>
                <Ionicons name="cube-outline" size={20} color={tintColor} />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingLabel}>
                  {activeModel?.name ?? "No Model Selected"}
                </ThemedText>
                <ThemedText style={styles.settingValue}>
                  {modelReady ? "Ready to use" : "Setup required"}
                </ThemedText>
              </View>
            </View>
            <View style={styles.settingRowRight}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: modelReady ? successColor : warningColor },
                ]}
              />
              <Ionicons
                name="chevron-forward"
                size={18}
                color={iconColor}
                style={{ opacity: 0.4 }}
              />
            </View>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.sectionTitle}>Generation</ThemedText>
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <TouchableOpacity style={styles.settingRow} onPress={handleAdvancedParameters}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: "#EC489920" }]}>
                <Ionicons name="options-outline" size={20} color="#EC4899" />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingLabel}>Advanced Parameters</ThemedText>
                <ThemedText style={styles.settingValue}>
                  Temp: {temperature} · Top-P: {topP} · Max: {maxTokens}
                </ThemedText>
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
                <ThemedText style={styles.settingValue}>{appVersion}</ThemedText>
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

      {/* Advanced Parameters Modal */}
      <Modal
        visible={showAdvancedModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAdvancedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Advanced Parameters</ThemedText>
              <TouchableOpacity onPress={() => setShowAdvancedModal(false)}>
                <Ionicons name="close" size={24} color={iconColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.parameterRow}>
                <View style={styles.parameterInfo}>
                  <ThemedText style={styles.parameterLabel}>Temperature</ThemedText>
                  <ThemedText style={styles.parameterDescription}>
                    Controls randomness (0 = deterministic, 2 = creative)
                  </ThemedText>
                </View>
                <TextInput
                  style={[
                    styles.parameterInput,
                    { backgroundColor: borderColor + "40", color: iconColor },
                  ]}
                  value={tempTemperature}
                  onChangeText={setTempTemperature}
                  keyboardType="decimal-pad"
                  placeholder="0.7"
                  placeholderTextColor={iconColor + "60"}
                />
              </View>

              <View style={styles.parameterRow}>
                <View style={styles.parameterInfo}>
                  <ThemedText style={styles.parameterLabel}>Top-P (Nucleus Sampling)</ThemedText>
                  <ThemedText style={styles.parameterDescription}>
                    Cumulative probability threshold (0.1 = focused, 1.0 = diverse)
                  </ThemedText>
                </View>
                <TextInput
                  style={[
                    styles.parameterInput,
                    { backgroundColor: borderColor + "40", color: iconColor },
                  ]}
                  value={tempTopP}
                  onChangeText={setTempTopP}
                  keyboardType="decimal-pad"
                  placeholder="0.95"
                  placeholderTextColor={iconColor + "60"}
                />
              </View>

              <View style={styles.parameterRow}>
                <View style={styles.parameterInfo}>
                  <ThemedText style={styles.parameterLabel}>Top-K</ThemedText>
                  <ThemedText style={styles.parameterDescription}>
                    Limit to top K tokens (1 = greedy, 100 = diverse)
                  </ThemedText>
                </View>
                <TextInput
                  style={[
                    styles.parameterInput,
                    { backgroundColor: borderColor + "40", color: iconColor },
                  ]}
                  value={tempTopK}
                  onChangeText={setTempTopK}
                  keyboardType="number-pad"
                  placeholder="40"
                  placeholderTextColor={iconColor + "60"}
                />
              </View>

              <View style={styles.parameterRow}>
                <View style={styles.parameterInfo}>
                  <ThemedText style={styles.parameterLabel}>Min-P</ThemedText>
                  <ThemedText style={styles.parameterDescription}>
                    Minimum probability filter (0 = disabled, 0.1 = moderate)
                  </ThemedText>
                </View>
                <TextInput
                  style={[
                    styles.parameterInput,
                    { backgroundColor: borderColor + "40", color: iconColor },
                  ]}
                  value={tempMinP}
                  onChangeText={setTempMinP}
                  keyboardType="decimal-pad"
                  placeholder="0.05"
                  placeholderTextColor={iconColor + "60"}
                />
              </View>

              <View style={styles.parameterRow}>
                <View style={styles.parameterInfo}>
                  <ThemedText style={styles.parameterLabel}>Max Tokens</ThemedText>
                  <ThemedText style={styles.parameterDescription}>
                    Maximum response length (1 - 4096)
                  </ThemedText>
                </View>
                <TextInput
                  style={[
                    styles.parameterInput,
                    { backgroundColor: borderColor + "40", color: iconColor },
                  ]}
                  value={tempMaxTokens}
                  onChangeText={setTempMaxTokens}
                  keyboardType="number-pad"
                  placeholder="512"
                  placeholderTextColor={iconColor + "60"}
                />
              </View>

              <View style={styles.parameterRow}>
                <View style={styles.parameterInfo}>
                  <ThemedText style={styles.parameterLabel}>Repeat Penalty</ThemedText>
                  <ThemedText style={styles.parameterDescription}>
                    Penalize repeated tokens (1 = none, 2 = strong)
                  </ThemedText>
                </View>
                <TextInput
                  style={[
                    styles.parameterInput,
                    { backgroundColor: borderColor + "40", color: iconColor },
                  ]}
                  value={tempRepeatPenalty}
                  onChangeText={setTempRepeatPenalty}
                  keyboardType="decimal-pad"
                  placeholder="1.1"
                  placeholderTextColor={iconColor + "60"}
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.resetButton, { borderColor }]}
                onPress={handleResetAdvancedParameters}
              >
                <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: tintColor }]}
                onPress={handleSaveAdvancedParameters}
              >
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  settingRowRight: {
    flexDirection: "row",
    alignItems: "center",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  modalScroll: {
    marginBottom: 8,
  },
  parameterRow: {
    marginBottom: 16,
  },
  parameterInfo: {
    marginBottom: 8,
  },
  parameterLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  parameterDescription: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 2,
  },
  parameterInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  resetButton: {
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {},
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
