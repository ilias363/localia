import { Ionicons } from "@expo/vector-icons";
import {
  impactAsync,
  ImpactFeedbackStyle,
  notificationAsync,
  NotificationFeedbackType,
} from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ModelCard } from "@/components/model";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { llmService } from "@/services/llm";
import { useModelStore } from "@/stores/model-store";

export default function ModelManagerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "cardBackground");
  const successColor = useThemeColor({}, "success");

  const models = useModelStore(state => state.models);
  const modelStates = useModelStore(state => state.modelStates);
  const activeModelId = useModelStore(state => state.activeModelId);
  const downloadModel = useModelStore(state => state.downloadModel);
  const cancelDownload = useModelStore(state => state.cancelDownload);
  const deleteModel = useModelStore(state => state.deleteModel);
  const loadModel = useModelStore(state => state.loadModel);
  const unloadModel = useModelStore(state => state.unloadModel);
  const importModel = useModelStore(state => state.importModel);
  const setModelError = useModelStore(state => state.setModelError);
  const setModelReady = useModelStore(state => state.setModelReady);
  const updateModelState = useModelStore(state => state.updateModelState);

  // Derive active model from reactive state
  const activeModel = activeModelId ? models.find(m => m.id === activeModelId) : null;

  const [isImporting, setIsImporting] = useState(false);

  // Helper to get model state
  const getModelState = (modelId: string) => {
    return modelStates[modelId] ?? { status: "not-downloaded" as const, progress: 0 };
  };

  // Split models into downloaded and available
  const downloadedModels = models.filter(m => {
    const state = getModelState(m.id);
    return state.status === "downloaded" || state.status === "ready" || state.status === "loading";
  });

  const availableModels = models.filter(m => {
    const state = getModelState(m.id);
    return (
      state.status === "not-downloaded" ||
      state.status === "downloading" ||
      state.status === "error"
    );
  });

  // Count downloaded models
  const downloadedCount = downloadedModels.length;

  const handleDownload = async (modelId: string) => {
    await downloadModel(modelId);
  };

  const handleCancelDownload = (modelId: string) => {
    cancelDownload(modelId);
  };

  const handleDelete = async (modelId: string) => {
    // Unload if this is the active model
    if (activeModel?.id === modelId) {
      await llmService.unloadModel();
      await unloadModel();
    }
    await deleteModel(modelId);
  };

  const handleLoad = async (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return;

    const currentState = getModelState(modelId);
    if (!currentState.localPath) {
      Alert.alert("Error", "Model file not found. Please download it first.");
      return;
    }

    // Start loading state
    await loadModel(modelId);

    try {
      // Actually load the model using llmService
      await llmService.loadModel(model, currentState.localPath, {
        onProgress: progress => {
          updateModelState(modelId, { progress });
        },
        onComplete: () => {
          setModelReady(modelId, currentState.localPath!);
        },
        onError: error => {
          setModelError(modelId, error.message);
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load model";
      setModelError(modelId, message);
      throw error;
    }
  };

  const handleImport = async () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    setIsImporting(true);
    try {
      const importedModel = await importModel();
      if (importedModel) {
        notificationAsync(NotificationFeedbackType.Success);
        Alert.alert(
          "Model Imported",
          `"${importedModel.name}" has been imported successfully. You can now load it.`,
        );
      }
    } catch (error) {
      notificationAsync(NotificationFeedbackType.Error);
      const message = error instanceof Error ? error.message : "Failed to import model";
      // Don't show alert for user cancellation
      if (!message.toLowerCase().includes("cancel")) {
        Alert.alert("Import Error", message);
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Hero Header */}
      <View style={[styles.heroHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
              <ThemedText style={styles.statNumber}>{models.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Available</ThemedText>
            </View>
            <View style={[styles.statItem, { backgroundColor: cardBackground }]}>
              <ThemedText style={[styles.statNumber, { color: successColor }]}>
                {downloadedCount}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Downloaded</ThemedText>
            </View>
            <View style={[styles.statItem, { backgroundColor: cardBackground }]}>
              <ThemedText style={[styles.statNumber, { color: tintColor }]}>
                {activeModel ? 1 : 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Active</ThemedText>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Import Section */}
        <TouchableOpacity
          style={[styles.importCard, { borderColor: tintColor + "40" }]}
          onPress={handleImport}
          disabled={isImporting}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[`${tintColor}15`, `${tintColor}05`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.importCardGradient}
          >
            <View style={[styles.importIconContainer, { backgroundColor: tintColor + "20" }]}>
              {isImporting ? (
                <ActivityIndicator size="small" color={tintColor} />
              ) : (
                <Ionicons name="add-circle-outline" size={28} color={tintColor} />
              )}
            </View>
            <View style={styles.importTextContainer}>
              <ThemedText style={styles.importTitle}>Import Custom Model</ThemedText>
              <ThemedText style={styles.importSubtitle}>
                Add a GGUF model file from your device
              </ThemedText>
            </View>
            <View style={[styles.importArrow, { backgroundColor: tintColor + "15" }]}>
              <Ionicons name="arrow-forward" size={18} color={tintColor} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Your Models Section */}
        {downloadedModels.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="folder-open-outline" size={16} color={tintColor} />
                <ThemedText style={styles.sectionTitle}>Your Models</ThemedText>
              </View>
              <ThemedText style={styles.sectionSubtitle}>Downloaded and ready to use</ThemedText>
            </View>

            {downloadedModels.map((model, index) => (
              <ModelCard
                key={model.id}
                model={model}
                state={getModelState(model.id)}
                isActive={activeModel?.id === model.id}
                onDownload={() => handleDownload(model.id)}
                onCancelDownload={() => handleCancelDownload(model.id)}
                onDelete={() => handleDelete(model.id)}
                onLoad={() => handleLoad(model.id)}
                isLast={index === downloadedModels.length - 1}
              />
            ))}

            {/* Spacer between sections */}
            <View style={{ height: 16 }} />
          </>
        )}

        {/* Available Models Section */}
        {availableModels.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="cloud-download-outline" size={16} color={tintColor} />
                <ThemedText style={styles.sectionTitle}>Available Models</ThemedText>
              </View>
              <ThemedText style={styles.sectionSubtitle}>
                Optimized for mobile performance
              </ThemedText>
            </View>

            {availableModels.map((model, index) => (
              <ModelCard
                key={model.id}
                model={model}
                state={getModelState(model.id)}
                isActive={activeModel?.id === model.id}
                onDownload={() => handleDownload(model.id)}
                onCancelDownload={() => handleCancelDownload(model.id)}
                onDelete={() => handleDelete(model.id)}
                onLoad={() => handleLoad(model.id)}
                isLast={index === availableModels.length - 1}
              />
            ))}
          </>
        )}

        {/* Info Footer */}
        <View style={styles.footer}>
          <Ionicons
            name="lock-closed-outline"
            size={14}
            color={iconColor}
            style={{ opacity: 0.4 }}
          />
          <ThemedText style={styles.footerText}>
            Models run locally. Your data stays on device.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  importCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: 28,
  },
  importCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  importIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  importTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  importTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  importSubtitle: {
    fontSize: 14,
    opacity: 0.5,
  },
  importArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.5,
    marginLeft: 24,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 13,
    opacity: 0.4,
  },
});
