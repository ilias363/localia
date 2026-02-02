import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { useAllThemeColors } from "@/hooks/use-theme-colors";

import { styles } from "./styles";
import type { ModelCardProps, StatusConfig } from "./types";
import { useModelCardActions } from "./use-model-card-actions";

export function ModelCard({
  model,
  state,
  isSelected,
  isLoaded,
  onDownload,
  onCancelDownload,
  onPauseDownload,
  onResumeDownload,
  onDelete,
  onLoad,
  onUnload,
  onSelect,
  isLast = false,
}: ModelCardProps) {
  // Get all colors at once to reduce redundant hook calls
  const colors = useAllThemeColors();
  const cardBackground = colors.cardBackground;
  const tintColor = colors.tint;
  const successColor = colors.success;
  const warningColor = colors.warning;
  const dangerColor = colors.danger;
  const textColor = colors.text;

  const {
    isActionLoading,
    handleDownload,
    handleLoad,
    handleCancelDownload,
    handlePauseDownload,
    handleResumeDownload,
    handleDelete,
    handleUnload,
    handleSelect,
  } = useModelCardActions({
    model,
    onDownload,
    onCancelDownload,
    onPauseDownload,
    onResumeDownload,
    onDelete,
    onLoad,
    onUnload,
    onSelect,
  });

  const progressWidth = useSharedValue(0);

  // Update progress animation in useEffect to avoid writing during render
  useEffect(() => {
    if (state.status === "downloading" || state.status === "paused") {
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

  const getStatusConfig = (): StatusConfig => {
    switch (state.status) {
      case "ready":
        return {
          color: successColor,
          icon: "checkmark-circle",
          text: isSelected ? "Selected" : isLoaded ? "Loaded" : "Ready",
        };
      case "loading":
        return {
          color: warningColor,
          icon: "hourglass-outline",
          text: state.progress > 0 ? `Loading ${state.progress.toFixed(1)}%` : "Loading...",
        };
      case "downloading":
        return {
          color: tintColor,
          icon: "cloud-download",
          text: state.progress > 0 ? `Downloading ${state.progress.toFixed(1)}%` : "Downloading...",
        };
      case "paused":
        return {
          color: warningColor,
          icon: "pause-circle",
          text: state.progress > 0 ? `Paused ${state.progress.toFixed(1)}%` : "Paused",
        };
      case "downloaded":
        return {
          color: successColor,
          icon: "checkmark-done",
          text: "Downloaded",
        };
      case "error":
        return {
          color: dangerColor,
          icon: "alert-circle",
          text: "Error",
        };
      default:
        return {
          color: textColor,
          icon: "cloud-outline",
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
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={[styles.secondaryActionButton, { backgroundColor: warningColor }]}
              onPress={handlePauseDownload}
              activeOpacity={0.8}
            >
              <Ionicons name="pause" size={18} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryActionButton, { backgroundColor: dangerColor }]}
              onPress={handleCancelDownload}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        );

      case "paused":
        return (
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={[styles.secondaryActionButton, { backgroundColor: successColor }]}
              onPress={handleResumeDownload}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={18} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryActionButton, { backgroundColor: dangerColor }]}
              onPress={handleCancelDownload}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
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
        if (isSelected) {
          // Currently selected model - show active badge and unload option
          return (
            <View style={styles.actionButtonGroup}>
              <View style={[styles.selectedBadge, { backgroundColor: successColor + "20" }]}>
                <View style={[styles.activePulse, { backgroundColor: successColor }]} />
                <ThemedText style={[styles.activeText, { color: successColor }]}>
                  Selected
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.secondaryActionButton, { backgroundColor: warningColor }]}
                onPress={handleUnload}
                disabled={isActionLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="power" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          );
        }
        if (isLoaded) {
          // Loaded but not selected - show select and unload options
          return (
            <View style={styles.actionButtonGroup}>
              <TouchableOpacity
                style={[styles.secondaryActionButton, { backgroundColor: tintColor }]}
                onPress={handleSelect}
                disabled={isActionLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark" size={18} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryActionButton, { backgroundColor: warningColor }]}
                onPress={handleUnload}
                disabled={isActionLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="power" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          );
        }
        // Ready but not loaded - allow loading
        return (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={handleLoad}
            disabled={isActionLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={20} color="#ffffff" />
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

  const canDelete = state.status === "downloaded" || (state.status === "ready" && !isLoaded);

  // Extract short name (just quantization) for compact display
  const shortName = model.quantization;

  return (
    <View style={[styles.card, { backgroundColor: cardBackground }, !isLast && styles.cardMargin]}>
      {/* Active indicator glow */}
      {isSelected && (
        <LinearGradient
          colors={[`${successColor}20`, `${successColor}00`]}
          style={styles.activeGlow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}
      {/* Loaded indicator glow (lighter than selected) */}
      {isLoaded && !isSelected && (
        <LinearGradient
          colors={[`${tintColor}15`, `${tintColor}00`]}
          style={styles.activeGlow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}

      {/* Download progress bar */}
      {(state.status === "downloading" || state.status === "paused") && (
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              { backgroundColor: state.status === "paused" ? warningColor : tintColor },
              progressStyle,
            ]}
          />
        </View>
      )}

      <View style={styles.content}>
        {/* Model Name Row */}
        <View style={styles.nameRow}>
          <ThemedText style={styles.modelName} numberOfLines={1}>
            {model.name}
          </ThemedText>
          {isSelected && (
            <View style={[styles.activeIndicator, { backgroundColor: successColor }]} />
          )}
          {isLoaded && !isSelected && (
            <View style={[styles.activeIndicator, { backgroundColor: tintColor }]} />
          )}
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

        {/* Provider info */}
        <View style={styles.providerRow}>
          <Ionicons name="person-circle-outline" size={12} color={textColor + "60"} />
          <ThemedText style={[styles.providerText, { color: textColor + "60" }]}>
            {model.provider}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
