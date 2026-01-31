import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatTemplateSelector, FileInfoCard, ImportActionButtons } from "@/components/import";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FormField, LoadingOverlay } from "@/components/ui";
import { SUPPORTED_CHAT_TEMPLATES } from "@/constants/models";
import { useHaptics } from "@/hooks/use-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useModelStore } from "@/stores/model-store";

interface ImportFormState {
  name: string;
  provider: string;
  description: string;
  quantization: string;
  contextLength: string;
  chatTemplate: string;
}

export default function ImportModelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    fileUri: string;
    fileName: string;
    fileSize?: string;
  }>();
  const { triggerMedium, triggerSuccess, triggerError } = useHaptics();

  const iconColor = useThemeColor({}, "text");

  const importModel = useModelStore(state => state.importModel);

  const [isImporting, setIsImporting] = useState(false);
  const [form, setForm] = useState<ImportFormState>({
    name: params.fileName?.replace(".gguf", "") ?? "",
    provider: "Custom",
    description: "Imported GGUF model",
    quantization: "Unknown",
    contextLength: "2048",
    chatTemplate: "",
  });

  const fileSize = params.fileSize ? parseInt(params.fileSize, 10) : undefined;

  const updateForm = <K extends keyof ImportFormState>(key: K, value: ImportFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleImport = async () => {
    if (!params.fileUri || !params.fileName) {
      Alert.alert("Error", "No file selected");
      return;
    }
    if (!form.name.trim()) {
      Alert.alert("Error", "Model name is required");
      return;
    }
    if (!form.chatTemplate) {
      Alert.alert("Error", "Please select a chat template");
      return;
    }

    setIsImporting(true);

    // Use setTimeout to ensure the loading overlay renders before the synchronous file copy
    setTimeout(async () => {
      try {
        const importedModel = await importModel({
          name: form.name.trim(),
          provider: form.provider.trim() || "Custom",
          description: form.description.trim() || "Imported GGUF model",
          quantization: form.quantization.trim() || "Unknown",
          contextLength: parseInt(form.contextLength, 10) || 2048,
          chatTemplate: form.chatTemplate,
          fileUri: params.fileUri,
          fileName: params.fileName,
          fileSize,
        });
        if (importedModel) {
          triggerSuccess();
          Alert.alert(
            "Model Imported",
            `"${importedModel.name}" has been imported successfully. You can now load it.`,
            [{ text: "OK", onPress: () => router.back() }],
          );
        }
      } catch (error) {
        triggerError();
        const message = error instanceof Error ? error.message : "Failed to import model";
        Alert.alert("Import Error", message);
      } finally {
        setIsImporting(false);
      }
    }, 100);
  };

  const handleCancel = () => {
    triggerMedium();
    router.back();
  };

  const isFormValid = form.name.trim() && form.chatTemplate;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="close" size={28} color={iconColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Import Model</ThemedText>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected file info */}
        <FileInfoCard fileName={params.fileName} fileSize={fileSize} />

        {/* Form - Model Information */}
        <View style={styles.formSection}>
          <ThemedText style={styles.sectionTitle}>Model Information</ThemedText>

          <FormField
            label="Name"
            value={form.name}
            onChangeText={value => updateForm("name", value)}
            placeholder="Enter model name"
            required
          />

          <FormField
            label="Provider"
            value={form.provider}
            onChangeText={value => updateForm("provider", value)}
            placeholder="e.g., TheBloke, unsloth"
          />

          <FormField
            label="Description"
            value={form.description}
            onChangeText={value => updateForm("description", value)}
            placeholder="Brief description of the model"
          />

          <View style={styles.formRow}>
            <View style={styles.formRowHalf}>
              <FormField
                label="Quantization"
                value={form.quantization}
                onChangeText={value => updateForm("quantization", value)}
                placeholder="e.g., Q4_K_M"
              />
            </View>
            <View style={styles.formRowHalf}>
              <FormField
                label="Context Length"
                value={form.contextLength}
                onChangeText={value => updateForm("contextLength", value)}
                placeholder="e.g., 2048"
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Chat Template Section */}
        <ChatTemplateSelector
          templates={SUPPORTED_CHAT_TEMPLATES}
          selectedTemplate={form.chatTemplate}
          onSelect={template => updateForm("chatTemplate", template)}
        />

        {/* Action Buttons */}
        <ImportActionButtons
          onCancel={handleCancel}
          onImport={handleImport}
          isImporting={isImporting}
          disabled={!isFormValid}
        />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 24,
  },
  formSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  formRow: {
    flexDirection: "row",
    gap: 16,
  },
  formRowHalf: {
    flex: 1,
  },
});
