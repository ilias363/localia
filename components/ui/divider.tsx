import { StyleSheet, View } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

interface DividerProps {
  marginLeft?: number;
}

export function Divider({ marginLeft = 62 }: DividerProps) {
  const borderColor = useThemeColor({}, "border");

  return <View style={[styles.divider, { backgroundColor: borderColor, marginLeft }]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
  },
});
