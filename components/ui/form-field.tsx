import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  required?: boolean;
  description?: string;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  required = false,
  description,
}: FormFieldProps) {
  const iconColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "cardBackground");
  const borderColor = useThemeColor({}, "border");

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>
        {label}
        {required && " *"}
      </ThemedText>
      {description && <ThemedText style={styles.description}>{description}</ThemedText>}
      <TextInput
        style={[styles.input, { backgroundColor: cardBackground, color: iconColor, borderColor }]}
        placeholder={placeholder}
        placeholderTextColor={iconColor + "60"}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },
  description: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: -2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});
