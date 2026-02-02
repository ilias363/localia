import { useState } from "react";
import { Alert } from "react-native";

import { useHaptics } from "@/hooks/use-haptics";
import type { ModelInfo } from "@/types";

interface UseModelCardActionsProps {
  model: ModelInfo;
  onDownload: () => Promise<void>;
  onCancelDownload: () => void;
  onPauseDownload: () => Promise<void>;
  onResumeDownload: () => Promise<void>;
  onDelete: () => Promise<void>;
  onLoad: () => Promise<void>;
  onUnload: () => Promise<void>;
  onSelect: () => void;
}

export function useModelCardActions({
  model,
  onDownload,
  onCancelDownload,
  onPauseDownload,
  onResumeDownload,
  onDelete,
  onLoad,
  onUnload,
  onSelect,
}: UseModelCardActionsProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { triggerMedium, triggerHeavy, triggerSuccess, triggerError } = useHaptics();

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

  const handlePauseDownload = async () => {
    triggerMedium();
    try {
      await onPauseDownload();
    } catch (error) {
      triggerError();
      const message = error instanceof Error ? error.message : "Failed to pause download";
      Alert.alert("Pause Error", message);
    }
  };

  const handleResumeDownload = async () => {
    triggerMedium();
    try {
      await onResumeDownload();
    } catch (error) {
      triggerError();
      const message = error instanceof Error ? error.message : "Failed to resume download";
      Alert.alert("Resume Error", message);
    }
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

  const handleUnload = async () => {
    triggerMedium();
    setIsActionLoading(true);
    try {
      await onUnload();
      triggerSuccess();
    } catch (error) {
      triggerError();
      const message = error instanceof Error ? error.message : "Failed to unload model";
      Alert.alert("Unload Error", message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSelect = () => {
    triggerMedium();
    onSelect();
    triggerSuccess();
  };

  return {
    isActionLoading,
    handleDownload,
    handleLoad,
    handleCancelDownload,
    handlePauseDownload,
    handleResumeDownload,
    handleDelete,
    handleUnload,
    handleSelect,
  };
}
