import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { useHaptics } from "@/hooks/use-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { ModelInfo, ModelState } from "@/types";

interface ModelCardProps {
  model: ModelInfo;
  state: ModelState;
  isActive: boolean;
  onDownload: () => Promise<void>;
  onCancelDownload: () => void;
  onDelete: () => Promise<void>;
  onLoad: () => Promise<void>;
  isLast?: boolean;
}

export function ModelCard({
  model,
  state,
  isActive,
  onDownload,
  onCancelDownload,
  onDelete,
  onLoad,
  isLast = false,
}: ModelCardProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { triggerMedium, triggerHeavy, triggerSuccess, triggerError } = useHaptics();

  const cardBackground = useThemeColor({}, "cardBackground");
  const tintColor = useThemeColor({}, "tint");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const dangerColor = useThemeColor({}, "danger");
  const textColor = useThemeColor({}, "text");

  const progressWidth = useSharedValue(0);

  // Update progress animation in useEffect to avoid writing during render
  useEffect(() => {
    if (state.status === "downloading") {
      progressWidth.value = withTiming(state.progress, { duration: 300 });
    } else if (state.status === "downloaded" || state.status === "ready") {
      progressWidth.value = withTiming(100, { duration: 300 });
    } else {
      progressWidth.value = withTiming(0, { duration: 300 });
    }
  }, [state.status, state.progress, progressWidth]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleDownload = async () => {
    triggerMedium();
    try {
      onDownload().catch(error => {
        triggerError();
        const message = error instanceof Error ? error.message : "Download failed";
        if (!message.toLowerCase().includes("cancel")) {
          Alert.alert("Download Error", message);
        }
      });
    } catch (error) {
      triggerError();
      const message = error instanceof Error ? error.message : "Download failed";
      if (!message.toLowerCase().includes("cancel")) {
        Alert.alert("Download Error", message);
      }
    }
  };

  const handleLoad = async () => {
    triggerMedium();
    setIsActionLoading(true);
    try {
      await onLoad();
      triggerSuccess();
    } catch (error) {
      triggerError();
      const message = error instanceof Error ? error.message : "Failed to load model";
      Alert.alert("Load Error", message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelDownload = () => {
    triggerMedium();
    onCancelDownload();
  };

  const handleDelete = () => {
    triggerHeavy();
    Alert.alert(
      "Delete Model",
      `Are you sure you want to delete "${model.name}"? You'll need to download it again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsActionLoading(true);
            try {
              await onDelete();
              triggerSuccess();
            } catch (error) {
              triggerError();
              const message = error instanceof Error ? error.message : "Failed to delete model";
              Alert.alert("Delete Error", message);
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const getStatusConfig = () => {
    switch (state.status) {
      case "ready":
        return {
          color: successColor,
          icon: "checkmark-circle" as const,
          text: isActive ? "Active" : "Ready",
        };
      case "loading":
        return {
          color: warningColor,
          icon: "hourglass-outline" as const,
          text: state.progress > 0 ? `Loading ${state.progress.toFixed(1)}%` : "Loading...",
        };
      case "downloading":
        return {
          color: tintColor,
          icon: "cloud-download" as const,
          text: state.progress > 0 ? `Downloading ${state.progress.toFixed(1)}%` : "Downloading...",
        };
      case "downloaded":
        return {
          color: successColor,
          icon: "checkmark-done" as const,
          text: "Downloaded",
        };
      case "error":
        return {
          color: dangerColor,
          icon: "alert-circle" as const,
          text: "Error",
        };
      default:
        return {
          color: textColor,
          icon: "cloud-outline" as const,
          text: "Not downloaded",
        };
    }
  };

  const statusConfig = getStatusConfig();

  const renderPrimaryAction = () => {
    if (isActionLoading && state.status !== "downloading") {
      return (
        <View style={[styles.primaryButton, { backgroundColor: tintColor }]}>
          <ActivityIndicator size="small" color="#ffffff" />
        </View>
      );
    }

    switch (state.status) {
      case "not-downloaded":
        return (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={handleDownload}
            disabled={isActionLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="cloud-download" size={20} color="#ffffff" />
          </TouchableOpacity>
        );

      case "downloading":
        return (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: dangerColor }]}
            onPress={handleCancelDownload}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="#ffffff" />
          </TouchableOpacity>
        );

      case "downloaded":
        return (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: successColor }]}
            onPress={handleLoad}
            disabled={isActionLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={20} color="#ffffff" />
          </TouchableOpacity>
        );

      case "loading":
        return (
          <View style={[styles.primaryButton, { backgroundColor: warningColor }]}>
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        );

      case "ready":
        if (isActive) {
          return (
            <View style={[styles.activeBadge, { backgroundColor: successColor + "20" }]}>
              <View style={[styles.activePulse, { backgroundColor: successColor }]} />
              <ThemedText style={[styles.activeText, { color: successColor }]}>Active</ThemedText>
            </View>
          );
        }
        return (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={handleLoad}
            disabled={isActionLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-horizontal" size={20} color="#ffffff" />
          </TouchableOpacity>
        );

      case "error":
        return (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: warningColor }]}
            onPress={handleDownload}
            disabled={isActionLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color="#ffffff" />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  const canDelete = state.status === "downloaded" || state.status === "ready";

  // Extract short name (just quantization) for compact display
  const shortName = model.quantization;

  return (
    <View style={[styles.card, { backgroundColor: cardBackground }, !isLast && styles.cardMargin]}>
      {/* Active indicator glow */}
      {isActive && (
        <LinearGradient
          colors={[`${successColor}20`, `${successColor}00`]}
          style={styles.activeGlow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}

      {/* Download progress bar */}
      {state.status === "downloading" && (
        <View style={styles.progressContainer}>
          <Animated.View
            style={[styles.progressBar, { backgroundColor: tintColor }, progressStyle]}
          />
        </View>
      )}

      <View style={styles.content}>
        {/* Model Name Row */}
        <View style={styles.nameRow}>
          <ThemedText style={styles.modelName} numberOfLines={1}>
            {model.name}
          </ThemedText>
          {isActive && <View style={[styles.activeIndicator, { backgroundColor: successColor }]} />}
        </View>

        {/* Compact Header Row */}
        <View style={styles.headerRow}>
          {/* Left: Quantization badge + Status/Size column */}
          <View style={styles.leftSection}>
            <View style={[styles.quantBadge, { backgroundColor: tintColor + "15" }]}>
              <ThemedText style={[styles.quantText, { color: tintColor }]}>{shortName}</ThemedText>
            </View>
            <View style={styles.infoColumn}>
              <View style={styles.statusRow}>
                <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
                <ThemedText style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.text}
                </ThemedText>
              </View>
              <ThemedText style={styles.sizeText}>{model.size}</ThemedText>
            </View>
          </View>

          {/* Right: Actions */}
          <View style={styles.actionsRow}>
            {canDelete && (
              <TouchableOpacity
                style={[styles.deleteIconButton, { backgroundColor: dangerColor + "12" }]}
                onPress={handleDelete}
                disabled={isActionLoading}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={dangerColor} />
              </TouchableOpacity>
            )}
            {renderPrimaryAction()}
          </View>
        </View>

        {/* Description - full text */}
        <ThemedText style={styles.description}>{model.description}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  cardMargin: {
    marginBottom: 10,
  },
  activeGlow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  progressBar: {
    height: "100%",
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modelName: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  quantBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quantText: {
    fontSize: 13,
    fontWeight: "700",
  },
  infoColumn: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sizeText: {
    fontSize: 11,
    opacity: 0.5,
  },
  primaryButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deleteIconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  activePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 18,
  },
});
