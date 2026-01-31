import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface AdvancedParametersModalProps {
  visible: boolean;
  onClose: () => void;
  values: {
    temperature: string;
    topP: string;
    topK: string;
    minP: string;
    maxTokens: string;
    repeatPenalty: string;
  };
  onValuesChange: (values: AdvancedParametersModalProps["values"]) => void;
  onSave: () => void;
  onReset: () => void;
}

interface ParameterInputProps {
  label: string;
  description: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType: "decimal-pad" | "number-pad";
  placeholder: string;
}

function ParameterInput({
  label,
  description,
  value,
  onChangeText,
  keyboardType,
  placeholder,
}: ParameterInputProps) {
  const borderColor = useThemeColor({}, "border");
  const iconColor = useThemeColor({}, "text");

  return (
    <View style={styles.parameterRow}>
      <View style={styles.parameterInfo}>
        <ThemedText style={styles.parameterLabel}>{label}</ThemedText>
        <ThemedText style={styles.parameterDescription}>{description}</ThemedText>
      </View>
      <TextInput
        style={[styles.parameterInput, { backgroundColor: borderColor + "40", color: iconColor }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={iconColor + "60"}
      />
    </View>
  );
}

export function AdvancedParametersModal({
  visible,
  onClose,
  values,
  onValuesChange,
  onSave,
  onReset,
}: AdvancedParametersModalProps) {
  const cardBackground = useThemeColor({}, "cardBackground");
  const iconColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");

  const updateValue = (key: keyof typeof values, value: string) => {
    onValuesChange({ ...values, [key]: value });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Advanced Parameters</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <ParameterInput
              label="Temperature"
              description="Controls randomness (0 = deterministic, 2 = creative)"
              value={values.temperature}
              onChangeText={text => updateValue("temperature", text)}
              keyboardType="decimal-pad"
              placeholder="0.7"
            />

            <ParameterInput
              label="Top-P (Nucleus Sampling)"
              description="Cumulative probability threshold (0.1 = focused, 1.0 = diverse)"
              value={values.topP}
              onChangeText={text => updateValue("topP", text)}
              keyboardType="decimal-pad"
              placeholder="0.95"
            />

            <ParameterInput
              label="Top-K"
              description="Limit to top K tokens (1 = greedy, 100 = diverse)"
              value={values.topK}
              onChangeText={text => updateValue("topK", text)}
              keyboardType="number-pad"
              placeholder="40"
            />

            <ParameterInput
              label="Min-P"
              description="Minimum probability filter (0 = disabled, 0.1 = moderate)"
              value={values.minP}
              onChangeText={text => updateValue("minP", text)}
              keyboardType="decimal-pad"
              placeholder="0.05"
            />

            <ParameterInput
              label="Max Tokens"
              description="Maximum response length (1 - 4096)"
              value={values.maxTokens}
              onChangeText={text => updateValue("maxTokens", text)}
              keyboardType="number-pad"
              placeholder="512"
            />

            <ParameterInput
              label="Repeat Penalty"
              description="Penalize repeated tokens (1 = none, 2 = strong)"
              value={values.repeatPenalty}
              onChangeText={text => updateValue("repeatPenalty", text)}
              keyboardType="decimal-pad"
              placeholder="1.1"
            />
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.resetButton, { borderColor }]}
              onPress={onReset}
            >
              <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { backgroundColor: tintColor }]}
              onPress={onSave}
            >
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
