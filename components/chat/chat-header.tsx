import { ThemedText } from "@/components/themed-text";
import { useHaptics } from "@/hooks/use-haptics";
import { useAllThemeColors } from "@/hooks/use-theme-colors";
import type { ModelInfo } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ModelPicker } from "./model-picker";

export interface LoadedModelOption {
  model: ModelInfo;
  isSelected: boolean;
}

interface ChatHeaderProps {
  modelName: string;
  isConnected: boolean;
  loadedModels: LoadedModelOption[];
  onMenuPress?: () => void;
  onNewChatPress?: () => void;
  onSelectModel?: (modelId: string) => void;
}

export function ChatHeader({
  modelName,
  isConnected,
  loadedModels,
  onMenuPress,
  onNewChatPress,
  onSelectModel,
}: ChatHeaderProps) {
  const { triggerLight } = useHaptics();
  const colors = useAllThemeColors();
  const {
    background: backgroundColor,
    border: borderColor,
    text: iconColor,
    success: successColor,
    warning: warningColor,
    tint: tintColor,
  } = colors;

  const [showModelPicker, setShowModelPicker] = useState(false);

  const handleMenuPress = () => {
    triggerLight();
    onMenuPress?.();
  };

  const handleNewChatPress = () => {
    triggerLight();
    onNewChatPress?.();
  };

  const handleModelPress = () => {
    triggerLight();
    setShowModelPicker(true);
  };

  const handleSelectModel = (modelId: string) => {
    onSelectModel?.(modelId);
  };

  const hasLoadedModels = loadedModels.length > 0;

  return (
    <>
      <View style={[styles.container, { backgroundColor, borderBottomColor: borderColor }]}>
        <TouchableOpacity style={styles.iconButton} onPress={handleMenuPress} activeOpacity={0.7}>
          <Ionicons name="menu-outline" size={26} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modelSelector}
          onPress={handleModelPress}
          activeOpacity={0.7}
        >
          {hasLoadedModels ? (
            <>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? successColor : warningColor },
                ]}
              />
              <ThemedText style={styles.modelName} numberOfLines={1}>
                {modelName}
              </ThemedText>
            </>
          ) : (
            <>
              <Ionicons name="add-circle" size={18} color={tintColor} />
              <ThemedText style={[styles.loadModelText, { color: tintColor }]}>
                Load Model
              </ThemedText>
            </>
          )}
          <Ionicons
            name="chevron-down"
            size={14}
            color={hasLoadedModels ? iconColor : tintColor}
            style={styles.chevron}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleNewChatPress}
          activeOpacity={0.7}
          disabled={!hasLoadedModels}
        >
          <Ionicons
            name="create-outline"
            size={24}
            color={iconColor}
            style={{ opacity: hasLoadedModels ? 1 : 0.3 }}
          />
        </TouchableOpacity>
      </View>

      <ModelPicker
        visible={showModelPicker}
        onClose={() => setShowModelPicker(false)}
        loadedModels={loadedModels}
        onSelectModel={handleSelectModel}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  modelSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modelName: {
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
  },
  loadModelText: {
    fontSize: 15,
    fontWeight: "600",
  },
  chevron: {
    opacity: 0.5,
  },
});
