import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";

interface SectionTitleProps {
  children: string;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return <ThemedText style={styles.title}>{children}</ThemedText>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.4,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
});
