import { ThemedText } from "@/components/themed-text";
import { useHaptics } from "@/hooks/use-haptics";
import { useAllThemeColors } from "@/hooks/use-theme-colors";
import type { ModelInfo } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface LoadedModelOption {
  model: ModelInfo;
  isSelected: boolean;
}

interface ModelPickerProps {
  visible: boolean;
  onClose: () => void;
  loadedModels: LoadedModelOption[];
  onSelectModel: (modelId: string) => void;
}

export function ModelPicker({ visible, onClose, loadedModels, onSelectModel }: ModelPickerProps) {
  const { triggerMedium, triggerLight } = useHaptics();
  const router = useRouter();
  const colors = useAllThemeColors();
  const { border: borderColor, tint: tintColor, cardBackground, success: successColor } = colors;

  const handleSelectModel = (modelId: string) => {
    triggerMedium();
    onSelectModel(modelId);
    onClose();
  };

  const handleGoToModelManager = () => {
    triggerLight();
    onClose();
    router.push("/model-manager");
  };

  const hasLoadedModels = loadedModels.length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View
          style={[styles.modalContent, { backgroundColor: cardBackground }]}
          onStartShouldSetResponder={() => true}
        >
          <ThemedText style={styles.modalTitle}>
            {hasLoadedModels ? "Switch Model" : "No Model Loaded"}
          </ThemedText>

          {/* Model list */}
          {hasLoadedModels && (
            <ScrollView style={styles.modelList} showsVerticalScrollIndicator={false}>
              {loadedModels.map(({ model, isSelected }) => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelOption,
                    { borderColor: isSelected ? successColor : borderColor },
                    isSelected && { backgroundColor: `${successColor}10` },
                  ]}
                  onPress={() => handleSelectModel(model.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.modelOptionContent}>
                    <ThemedText style={styles.modelOptionName} numberOfLines={1}>
                      {model.name}
                    </ThemedText>
                    <ThemedText style={styles.modelOptionQuant}>
                      {model.quantization} • {model.size}
                    </ThemedText>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={successColor} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Empty state */}
          {!hasLoadedModels && (
            <ThemedText style={styles.emptyText}>Load a model to start chatting</ThemedText>
          )}

          {/* Model Manager button */}
          <TouchableOpacity
            style={[styles.managerButton, { backgroundColor: tintColor }]}
            onPress={handleGoToModelManager}
            activeOpacity={0.8}
          >
            <Ionicons name="apps" size={16} color="#ffffff" />
            <ThemedText style={styles.managerButtonText}>
              {hasLoadedModels ? "Manage Models" : "Open Model Library"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 300,
    borderRadius: 16,
    padding: 16,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  modelList: {
    maxHeight: 200,
    marginBottom: 12,
  },
  modelOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  modelOptionContent: {
    flex: 1,
    marginRight: 8,
  },
  modelOptionName: {
    fontSize: 14,
    fontWeight: "500",
  },
  modelOptionQuant: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: "center",
    marginBottom: 16,
  },
  managerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  managerButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
