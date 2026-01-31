import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ModelCard } from "@/components/model";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useHaptics } from "@/hooks/use-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";
import { llmService } from "@/services/llm";
import { useModelStore } from "@/stores/model-store";
import type { ModelInfo } from "@/types";

// Sort options
type SortField = "size" | "name" | "quant";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: "size", label: "Size" },
  { value: "name", label: "Name" },
  { value: "quant", label: "Quant" },
];

function sortModels(models: ModelInfo[], sort: SortState): ModelInfo[] {
  return [...models].sort((a, b) => {
    let comparison = 0;

    switch (sort.field) {
      case "size":
        comparison = a.sizeBytes - b.sizeBytes;
        break;
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "quant":
        // Sort by quantization level (higher bits = less compression)
        const getQuantLevel = (q: string) => {
          if (q.startsWith("Q8")) return 8;
          if (q.startsWith("Q6")) return 6;
          if (q.startsWith("Q5")) return 5;
          if (q.startsWith("Q4")) return 4;
          if (q.startsWith("Q3")) return 3;
          if (q.startsWith("Q2")) return 2;
          return 0;
        };
        comparison = getQuantLevel(a.quantization) - getQuantLevel(b.quantization);
        break;
    }

    return sort.direction === "asc" ? comparison : -comparison;
  });
}

export default function ModelManagerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { triggerLight, triggerMedium, triggerSuccess, triggerError } = useHaptics();
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "cardBackground");
  const successColor = useThemeColor({}, "success");
  const borderColor = useThemeColor({}, "border");

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ field: "size", direction: "asc" });

  // Helper to get model state
  const getModelState = (modelId: string) => {
    return modelStates[modelId] ?? { status: "not-downloaded" as const, progress: 0 };
  };

  // Filter models by search query
  const filteredModels = (() => {
    if (!searchQuery.trim()) return models;
    const query = searchQuery.toLowerCase();
    return models.filter(
      m =>
        m.name.toLowerCase().includes(query) ||
        m.quantization.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query),
    );
  })();

  // Split models into downloaded and available
  const downloadedModels = filteredModels.filter(m => {
    const state = getModelState(m.id);
    return state.status === "downloaded" || state.status === "ready" || state.status === "loading";
  });

  const availableModels = filteredModels.filter(m => {
    const state = getModelState(m.id);
    return (
      state.status === "not-downloaded" ||
      state.status === "downloading" ||
      state.status === "error"
    );
  });

  // Sort available models
  const sortedAvailableModels = sortModels(availableModels, sort);

  // Count downloaded models (from all models, not filtered)
  const downloadedCount = models.filter(m => {
    const state = getModelState(m.id);
    return state.status === "downloaded" || state.status === "ready" || state.status === "loading";
  }).length;

  const handleSortChange = (field: SortField) => {
    triggerLight();
    setSort(prev => {
      if (prev.field === field) {
        // Toggle direction
        return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      // New field, default to ascending
      return { field, direction: "asc" };
    });
  };

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
    triggerMedium();
    setIsImporting(true);
    try {
      const importedModel = await importModel();
      if (importedModel) {
        triggerSuccess();
        Alert.alert(
          "Model Imported",
          `"${importedModel.name}" has been imported successfully. You can now load it.`,
        );
      }
    } catch (error) {
      triggerError();
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
            colors={[`${tintColor}45`, `${tintColor}15`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.importCardGradient}
          >
            <View style={[styles.importIconContainer, { backgroundColor: tintColor + "20" }]}>
              {isImporting ? (
                <ActivityIndicator size="small" color={tintColor} />
              ) : (
                <Ionicons name="add-circle-outline" size={22} color={tintColor} />
              )}
            </View>
            <View style={styles.importTextContainer}>
              <ThemedText style={styles.importTitle}>Import Custom Model</ThemedText>
              <ThemedText style={styles.importSubtitle}>Add a GGUF file from device</ThemedText>
            </View>
            <View style={[styles.importArrow, { backgroundColor: tintColor + "15" }]}>
              <Ionicons name="arrow-forward" size={14} color={tintColor} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor }]}>
          <Ionicons name="search" size={18} color={iconColor} style={{ opacity: 0.5 }} />
          <TextInput
            style={[styles.searchInput, { color: iconColor }]}
            placeholder="Search models..."
            placeholderTextColor={iconColor + "60"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={iconColor} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          )}
        </View>

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

        {/* Available Models Section with Sort */}
        {sortedAvailableModels.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="cloud-download-outline" size={16} color={tintColor} />
                <ThemedText style={styles.sectionTitle}>Available Models</ThemedText>
              </View>
              <ThemedText style={styles.sectionSubtitle}>
                {sortedAvailableModels.length} models available
              </ThemedText>
            </View>

            {/* Sort Options */}
            <View style={styles.sortRow}>
              <ThemedText style={styles.sortLabel}>Sort:</ThemedText>
              <View style={styles.sortOptions}>
                {SORT_FIELDS.map(field => {
                  const isActive = sort.field === field.value;
                  const arrow = isActive ? (sort.direction === "asc" ? "↑" : "↓") : "";
                  return (
                    <TouchableOpacity
                      key={field.value}
                      style={[
                        styles.sortButton,
                        { backgroundColor: cardBackground },
                        isActive && { backgroundColor: tintColor + "20" },
                      ]}
                      onPress={() => handleSortChange(field.value)}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={[styles.sortButtonText, isActive && { color: tintColor }]}>
                        {field.label} {arrow}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Model List */}
            {sortedAvailableModels.map((model, index) => (
              <ModelCard
                key={model.id}
                model={model}
                state={getModelState(model.id)}
                isActive={activeModel?.id === model.id}
                onDownload={() => handleDownload(model.id)}
                onCancelDownload={() => handleCancelDownload(model.id)}
                onDelete={() => handleDelete(model.id)}
                onLoad={() => handleLoad(model.id)}
                isLast={index === sortedAvailableModels.length - 1}
              />
            ))}
          </>
        )}

        {/* No results */}
        {searchQuery && filteredModels.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={48} color={iconColor} style={{ opacity: 0.3 }} />
            <ThemedText style={styles.noResultsText}>No models found</ThemedText>
            <ThemedText style={styles.noResultsSubtext}>Try a different search term</ThemedText>
          </View>
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
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: 16,
  },
  importCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  importIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  importTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  importTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  importSubtitle: {
    fontSize: 12,
    opacity: 0.5,
  },
  importArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  sortLabel: {
    fontSize: 13,
    opacity: 0.5,
  },
  sortOptions: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    opacity: 0.6,
  },
  noResultsSubtext: {
    fontSize: 14,
    opacity: 0.4,
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
