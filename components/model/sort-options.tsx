import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useHaptics } from "@/hooks/use-haptics";
import { useAllThemeColors } from "@/hooks/use-theme-colors";

export type SortField = "size" | "name" | "quant";
export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: "size", label: "Size" },
  { value: "name", label: "Name" },
  { value: "quant", label: "Quant" },
];

interface SortOptionsProps {
  sort: SortState;
  onSortChange: (field: SortField) => void;
}

export function SortOptions({ sort, onSortChange }: SortOptionsProps) {
  const { triggerLight } = useHaptics();
  const colors = useAllThemeColors();
  const { cardBackground, tint: tintColor } = colors;

  const handleSortChange = (field: SortField) => {
    triggerLight();
    onSortChange(field);
  };

  return (
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
  );
}

const styles = StyleSheet.create({
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
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
});
