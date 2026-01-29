import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    inputBackground: "#f5f5f5",
    inputFieldBackground: "#ffffff",
    placeholder: "#999",
    border: "#e0e0e0",
    cardBackground: "#f5f5f5",
    userBubble: tintColorLight,
    userBubbleText: "#ffffff",
    assistantBubble: "#f0f0f0",
    danger: "#ff4444",
    success: "#4caf50",
    warning: "#ff9800",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    inputBackground: "#1a1a1a",
    inputFieldBackground: "#2a2a2a",
    placeholder: "#666",
    border: "#333",
    cardBackground: "#1a1a1a",
    userBubble: tintColorDark,
    userBubbleText: "#000000",
    assistantBubble: "#2a2a2a",
    danger: "#ff4444",
    success: "#4caf50",
    warning: "#ff9800",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
