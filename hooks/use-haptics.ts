import {
  impactAsync,
  ImpactFeedbackStyle,
  notificationAsync,
  NotificationFeedbackType,
} from "expo-haptics";

import { useSettingsStore } from "@/stores/settings-store";

/**
 * Custom hook for haptic feedback that respects the user's haptic settings.
 * Works on both iOS and Android.
 */
export function useHaptics() {
  const hapticEnabled = useSettingsStore(state => state.hapticEnabled);

  const triggerImpact = async (style: ImpactFeedbackStyle = ImpactFeedbackStyle.Medium) => {
    if (hapticEnabled) {
      await impactAsync(style);
    }
  };

  const triggerNotification = async (
    type: NotificationFeedbackType = NotificationFeedbackType.Success,
  ) => {
    if (hapticEnabled) {
      await notificationAsync(type);
    }
  };

  const triggerLight = async () => {
    if (hapticEnabled) {
      await impactAsync(ImpactFeedbackStyle.Light);
    }
  };

  const triggerMedium = async () => {
    if (hapticEnabled) {
      await impactAsync(ImpactFeedbackStyle.Medium);
    }
  };

  const triggerHeavy = async () => {
    if (hapticEnabled) {
      await impactAsync(ImpactFeedbackStyle.Heavy);
    }
  };

  const triggerSuccess = async () => {
    if (hapticEnabled) {
      await notificationAsync(NotificationFeedbackType.Success);
    }
  };

  const triggerError = async () => {
    if (hapticEnabled) {
      await notificationAsync(NotificationFeedbackType.Error);
    }
  };

  const triggerWarning = async () => {
    if (hapticEnabled) {
      await notificationAsync(NotificationFeedbackType.Warning);
    }
  };

  return {
    hapticEnabled,
    triggerImpact,
    triggerNotification,
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerError,
    triggerWarning,
  };
}

// Re-export types for convenience
export { ImpactFeedbackStyle, NotificationFeedbackType };

