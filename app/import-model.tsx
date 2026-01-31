import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SUPPORTED_CHAT_TEMPLATES } from "@/constants/models";
import { useHaptics } from "@/hooks/use-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useModelStore } from "@/stores/model-store";

export default function ImportModelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    fileUri: string;
    fileName: string;
    fileSize?: string;
  }>();
  const { triggerMedium, triggerSuccess, triggerError } = useHaptics();

  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "cardBackground");
  const borderColor = useThemeColor({}, "border");

  const importModel = useModelStore(state => state.importModel);

  const [isImporting, setIsImporting] = useState(false);
  const [form, setForm] = useState({
    name: params.fileName?.replace(".gguf", "") ?? "",
    provider: "Custom",
    description: "Imported GGUF model",
    quantization: "Unknown",
    contextLength: "2048",
    chatTemplate: "",
  });

  const fileSize = params.fileSize ? parseInt(params.fileSize, 10) : undefined;

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
  };

  const handleCancel = () => {
    triggerMedium();
    router.back();
  };

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
        <View style={[styles.fileCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={[styles.fileIconContainer, { backgroundColor: tintColor + "20" }]}>
            <Ionicons name="document" size={28} color={tintColor} />
          </View>
          <View style={styles.fileInfo}>
            <ThemedText style={styles.fileName} numberOfLines={2}>
              {params.fileName}
            </ThemedText>
            {fileSize && (
              <ThemedText style={styles.fileSize}>
                {(fileSize / (1024 * 1024)).toFixed(1)} MB
              </ThemedText>
            )}
          </View>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <ThemedText style={styles.sectionTitle}>Model Information</ThemedText>

          <View style={styles.formGroup}>
            <ThemedText style={styles.formLabel}>Name *</ThemedText>
            <TextInput
              style={[
                styles.formInput,
                { backgroundColor: cardBackground, color: iconColor, borderColor },
              ]}
              placeholder="Enter model name"
              placeholderTextColor={iconColor + "60"}
              value={form.name}
              onChangeText={text => setForm(f => ({ ...f, name: text }))}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.formLabel}>Provider</ThemedText>
            <TextInput
              style={[
                styles.formInput,
                { backgroundColor: cardBackground, color: iconColor, borderColor },
              ]}
              placeholder="e.g., TheBloke, unsloth"
              placeholderTextColor={iconColor + "60"}
              value={form.provider}
              onChangeText={text => setForm(f => ({ ...f, provider: text }))}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.formLabel}>Description</ThemedText>
            <TextInput
              style={[
                styles.formInput,
                { backgroundColor: cardBackground, color: iconColor, borderColor },
              ]}
              placeholder="Brief description of the model"
              placeholderTextColor={iconColor + "60"}
              value={form.description}
              onChangeText={text => setForm(f => ({ ...f, description: text }))}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <ThemedText style={styles.formLabel}>Quantization</ThemedText>
              <TextInput
                style={[
                  styles.formInput,
                  { backgroundColor: cardBackground, color: iconColor, borderColor },
                ]}
                placeholder="e.g., Q4_K_M"
                placeholderTextColor={iconColor + "60"}
                value={form.quantization}
                onChangeText={text => setForm(f => ({ ...f, quantization: text }))}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <ThemedText style={styles.formLabel}>Context Length</ThemedText>
              <TextInput
                style={[
                  styles.formInput,
                  { backgroundColor: cardBackground, color: iconColor, borderColor },
                ]}
                placeholder="e.g., 2048"
                placeholderTextColor={iconColor + "60"}
                value={form.contextLength}
                onChangeText={text => setForm(f => ({ ...f, contextLength: text }))}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Chat Template Section */}
        <View style={styles.formSection}>
          <ThemedText style={styles.sectionTitle}>Chat Template *</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Select the chat format used by this model
          </ThemedText>

          <View style={styles.templateGrid}>
            {SUPPORTED_CHAT_TEMPLATES.map(template => (
              <TouchableOpacity
                key={template}
                style={[
                  styles.templateChip,
                  { borderColor: form.chatTemplate === template ? tintColor : borderColor },
                  form.chatTemplate === template && { backgroundColor: tintColor + "20" },
                ]}
                onPress={() => setForm(f => ({ ...f, chatTemplate: template }))}
                activeOpacity={0.7}
              >
                <ThemedText
                  style={[
                    styles.templateChipText,
                    form.chatTemplate === template && { color: tintColor, fontWeight: "600" },
                  ]}
                >
                  {template}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { borderColor }]}
            onPress={handleCancel}
            disabled={isImporting}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.importButton,
              (!form.name.trim() || !form.chatTemplate || isImporting) && { opacity: 0.5 },
            ]}
            onPress={handleImport}
            disabled={!form.name.trim() || !form.chatTemplate || isImporting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[tintColor, `${tintColor}DD`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.importButtonGradient}
            >
              {isImporting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="download-outline" size={20} color="#fff" />
              )}
              <ThemedText style={styles.importButtonText}>
                {isImporting ? "Importing..." : "Import"}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isImporting && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingCard, { backgroundColor: cardBackground }]}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={styles.loadingText}>Importing model...</ThemedText>
            <ThemedText style={styles.loadingSubtext}>Copying file to app storage</ThemedText>
          </View>
        </View>
      )}
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
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  fileIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
    gap: 4,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
  },
  fileSize: {
    fontSize: 14,
    opacity: 0.6,
  },
  formSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: -4,
  },
  formGroup: {
    gap: 6,
  },
  formRow: {
    flexDirection: "row",
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  templateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  templateChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  templateChipText: {
    fontSize: 15,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  importButton: {},
  importButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  importButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    gap: 16,
    minWidth: 200,
  },
  loadingText: {
    fontSize: 17,
    fontWeight: "600",
  },
  loadingSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
});
