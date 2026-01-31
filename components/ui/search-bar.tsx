import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAllThemeColors } from "@/hooks/use-theme-colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = "Search..." }: SearchBarProps) {
  const { text: iconColor, cardBackground, border: borderColor } = useAllThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: cardBackground, borderColor }]}>
      <Ionicons name="search" size={18} color={iconColor} style={{ opacity: 0.5 }} />
      <TextInput
        style={[styles.input, { color: iconColor }]}
        placeholder={placeholder}
        placeholderTextColor={iconColor + "60"}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <Ionicons name="close-circle" size={18} color={iconColor} style={{ opacity: 0.5 }} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
});
