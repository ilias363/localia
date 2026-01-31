import { getDocumentAsync } from "expo-document-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShallow } from "zustand/shallow";

import {
  EmptySearchResults,
  ImportModelCard,
  ModelCard,
  ModelLibraryFooter,
  ModelLibraryHeader,
  ModelSectionHeader,
  SortOptions,
  type SortField,
  type SortState,
} from "@/components/model";
import { ThemedView } from "@/components/themed-view";
import { LoadingOverlay, SearchBar } from "@/components/ui";
import { useHaptics } from "@/hooks/use-haptics";
import { llmService } from "@/services/llm";
import { useModelStore } from "@/stores/model-store";
import type { ModelInfo } from "@/types";

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
  const { triggerMedium, triggerSuccess, triggerError } = useHaptics();

  // Consolidate store subscriptions for better performance
  const { models, modelStates, activeModelId } = useModelStore(
    useShallow(state => ({
      models: state.models,
      modelStates: state.modelStates,
      activeModelId: state.activeModelId,
    })),
  );

  // Get actions separately (they don't cause re-renders)
  const {
    downloadModel,
    cancelDownload,
    deleteModel,
    loadModel,
    unloadModel,
    importModel,
    setModelError,
    setModelReady,
    updateModelState,
  } = useModelStore.getState();

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
    setSort(prev => {
      if (prev.field === field) {
        return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { field, direction: "asc" };
    });
  };

  const handleDownload = async (modelId: string) => {
    downloadModel(modelId);
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

  const handlePickFile = async () => {
    triggerMedium();
    try {
      const result = await getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];

      // Validate file extension
      if (!asset.name.toLowerCase().endsWith(".gguf")) {
        Alert.alert("Error", "Please select a GGUF model file");
        return;
      }

      // Check if this file matches a supported model
      const existingModel = models.find(m => m.fileName === asset.name);
      if (existingModel) {
        // Model is already in the list, just import the file directly
        Alert.alert(
          "Supported Model Detected",
          `"${existingModel.name}" is already in your model library. Would you like to add the file?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Add File",
              onPress: () => {
                setIsImporting(true);
                setTimeout(async () => {
                  try {
                    await importModel({
                      name: existingModel.name,
                      provider: existingModel.provider,
                      description: existingModel.description,
                      quantization: existingModel.quantization,
                      contextLength: existingModel.contextLength,
                      chatTemplate: existingModel.chatTemplate,
                      fileUri: asset.uri,
                      fileName: asset.name,
                      fileSize: asset.size,
                    });
                    triggerSuccess();
                    Alert.alert("Success", `"${existingModel.name}" has been added.`);
                  } catch (error) {
                    triggerError();
                    const message = error instanceof Error ? error.message : "Failed to import";
                    Alert.alert("Error", message);
                  } finally {
                    setIsImporting(false);
                  }
                }, 100);
              },
            },
          ],
        );
        return;
      }

      // Navigate to import screen with file info
      router.push({
        pathname: "/import-model" as const,
        params: {
          fileUri: asset.uri,
          fileName: asset.name,
          fileSize: asset.size?.toString(),
        },
      } as any);
    } catch (error) {
      triggerError();
      const message = error instanceof Error ? error.message : "Failed to pick file";
      Alert.alert("Error", message);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Hero Header */}
      <View style={{ paddingTop: insets.top }}>
        <ModelLibraryHeader
          totalModels={models.length}
          downloadedCount={downloadedCount}
          activeCount={activeModel ? 1 : 0}
          onBack={() => router.back()}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Import Section */}
        <ImportModelCard onPress={handlePickFile} />
        <View style={styles.spacer} />

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search models..."
        />
        <View style={styles.spacerLarge} />

        {/* Your Models Section */}
        {downloadedModels.length > 0 && (
          <>
            <ModelSectionHeader
              icon="folder-open-outline"
              title="Your Models"
              subtitle="Downloaded and ready to use"
            />

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

            <View style={styles.spacer} />
          </>
        )}

        {/* Available Models Section with Sort */}
        {sortedAvailableModels.length > 0 && (
          <>
            <ModelSectionHeader
              icon="cloud-download-outline"
              title="Available Models"
              subtitle={`${sortedAvailableModels.length} models available`}
            />

            <SortOptions sort={sort} onSortChange={handleSortChange} />
            <View style={styles.spacerSmall} />

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
        {searchQuery && filteredModels.length === 0 && <EmptySearchResults query={searchQuery} />}

        {/* Info Footer */}
        <ModelLibraryFooter />
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isImporting}
        title="Importing model..."
        subtitle="Copying file to app storage"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  spacer: {
    height: 16,
  },
  spacerSmall: {
    height: 14,
  },
  spacerLarge: {
    height: 20,
  },
});
