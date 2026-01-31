import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface EmptySearchResultsProps {
  query?: string;
}

export function EmptySearchResults({ query }: EmptySearchResultsProps) {
  const iconColor = useThemeColor({}, "text");

  return (
    <View style={styles.noResults}>
      <Ionicons name="search-outline" size={48} color={iconColor} style={{ opacity: 0.3 }} />
      <ThemedText style={styles.noResultsText}>No models found</ThemedText>
      <ThemedText style={styles.noResultsSubtext}>
        {query ? "Try a different search term" : "No models available"}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
