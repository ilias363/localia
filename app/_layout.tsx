import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useModelStore } from "@/stores/model-store";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialize = useModelStore(state => state.initialize);

  // Initialize model store on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Get background color for current theme to prevent white flash during transitions
  const backgroundColor = colorScheme === "dark" ? Colors.dark.background : Colors.light.background;

  return (
    <KeyboardProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="settings" options={{ animation: "none" }} />
          <Stack.Screen name="model-manager" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="import-model" options={{ animation: "slide_from_bottom" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </KeyboardProvider>
  );
}
