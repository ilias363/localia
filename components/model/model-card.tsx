import { Ionicons } from "@expo/vector-icons";
import {
  impactAsync,
  ImpactFeedbackStyle,
  notificationAsync,
  NotificationFeedbackType,
} from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
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
    impactAsync(ImpactFeedbackStyle.Medium);
    setIsActionLoading(true);
    try {
      await onDownload();
      notificationAsync(NotificationFeedbackType.Success);
    } catch (error) {
      notificationAsync(NotificationFeedbackType.Error);
      const message = error instanceof Error ? error.message : "Download failed";
      if (!message.toLowerCase().includes("cancel")) {
        Alert.alert("Download Error", message);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLoad = async () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    setIsActionLoading(true);
    try {
      await onLoad();
      notificationAsync(NotificationFeedbackType.Success);
    } catch (error) {
      notificationAsync(NotificationFeedbackType.Error);
      const message = error instanceof Error ? error.message : "Failed to load model";
      Alert.alert("Load Error", message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelDownload = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    onCancelDownload();
  };

  const handleDelete = () => {
    impactAsync(ImpactFeedbackStyle.Heavy);
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
              notificationAsync(NotificationFeedbackType.Success);
            } catch (error) {
              notificationAsync(NotificationFeedbackType.Error);
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
          text: `${state.progress.toFixed(1)}%`,
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
        {/* Header Row */}
        <View style={styles.headerRow}>
          {/* Model Icon */}
          <View style={[styles.modelIcon, { backgroundColor: tintColor + "15" }]}>
            <Ionicons name="cube" size={24} color={tintColor} />
            {/* Size badge */}
            <View style={[styles.sizeBadge, { backgroundColor: cardBackground }]}>
              <ThemedText style={styles.sizeText}>{model.size}</ThemedText>
            </View>
          </View>

          {/* Model Info */}
          <View style={styles.modelInfo}>
            <View style={styles.titleRow}>
              <ThemedText style={styles.modelName} numberOfLines={1}>
                {model.name}
              </ThemedText>
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: successColor }]} />
              )}
            </View>
            <View style={styles.statusRow}>
              <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
              <ThemedText style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </ThemedText>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {canDelete && (
              <TouchableOpacity
                style={[styles.deleteIconButton, { backgroundColor: dangerColor + "12" }]}
                onPress={handleDelete}
                disabled={isActionLoading}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color={dangerColor} />
              </TouchableOpacity>
            )}
            {renderPrimaryAction()}
          </View>
        </View>

        {/* Description */}
        <ThemedText style={styles.description} numberOfLines={2}>
          {model.description}
        </ThemedText>

        {/* Tags Row */}
        <View style={styles.tagsRow}>
          <View style={[styles.tag, { backgroundColor: textColor + "08" }]}>
            <Ionicons
              name="speedometer-outline"
              size={12}
              color={textColor}
              style={{ opacity: 0.6 }}
            />
            <ThemedText style={styles.tagText}>{model.quantization}</ThemedText>
          </View>
          <View style={[styles.tag, { backgroundColor: textColor + "08" }]}>
            <Ionicons
              name="document-text-outline"
              size={12}
              color={textColor}
              style={{ opacity: 0.6 }}
            />
            <ThemedText style={styles.tagText}>
              {model.contextLength.toLocaleString()} ctx
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  cardMargin: {
    marginBottom: 16,
  },
  activeGlow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  progressBar: {
    height: "100%",
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  modelIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  sizeBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sizeText: {
    fontSize: 10,
    fontWeight: "700",
    opacity: 0.7,
  },
  modelInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  modelName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  primaryButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    gap: 8,
  },
  deleteIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
  },
  activePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.6,
  },
});
