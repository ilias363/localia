import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface ChatTemplateSelectorProps {
  templates: readonly string[];
  selectedTemplate: string;
  onSelect: (template: string) => void;
}

export function ChatTemplateSelector({
  templates,
  selectedTemplate,
  onSelect,
}: ChatTemplateSelectorProps) {
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Chat Template *</ThemedText>
      <ThemedText style={styles.subtitle}>Select the chat format used by this model</ThemedText>

      <View style={styles.templateGrid}>
        {templates.map(template => (
          <TouchableOpacity
            key={template}
            style={[
              styles.templateChip,
              { borderColor: selectedTemplate === template ? tintColor : borderColor },
              selectedTemplate === template && { backgroundColor: tintColor + "20" },
            ]}
            onPress={() => onSelect(template)}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.templateChipText,
                selectedTemplate === template && { color: tintColor, fontWeight: "600" },
              ]}
            >
              {template}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: -4,
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
});
