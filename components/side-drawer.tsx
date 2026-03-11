import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, View } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";
import { useShallow } from "zustand/shallow";

import { ConversationList, DrawerFooter, DrawerHeader } from "@/components/drawer";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/use-haptics";
import { useAllThemeColors } from "@/hooks/use-theme-colors";
import { useConversationStore } from "@/stores/conversation-store";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.8;

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  insets: EdgeInsets;
  blurTarget: React.RefObject<View | null>;
}

export function SideDrawer({ visible, onClose, insets, blurTarget }: SideDrawerProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const { triggerLight } = useHaptics();
  const colorScheme = useColorScheme();

  const { background: backgroundColor, border: borderColor } = useAllThemeColors();
  const blurTint = colorScheme === "dark" ? "dark" : "light";
  const drawerOverlayColor = `${backgroundColor}D9`;
  const backdropOverlayColor =
    colorScheme === "dark" ? "rgba(3, 7, 18, 0.38)" : "rgba(255, 255, 255, 0.16)";

  // Consolidate conversation store subscriptions with useShallow
  const { conversations, activeConversationId } = useConversationStore(
    useShallow(state => ({
      conversations: state.conversations,
      activeConversationId: state.activeConversationId,
    })),
  );

  // Get actions from getState (they don't trigger re-renders)
  const { deleteConversation, setActiveConversation } = useConversationStore.getState();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: visible ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, slideAnim, backdropAnim]);

  const handleNewChat = () => {
    triggerLight();
    setActiveConversation(null);
    onClose();
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    onClose();
  };

  const handleSettings = () => {
    triggerLight();
    onClose();
    router.push("/settings");
  };

  return (
    <View style={styles.overlay} pointerEvents={visible ? "auto" : "none"}>
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <BlurView
          blurMethod="dimezisBlurViewSdk31Plus"
          blurTarget={blurTarget}
          intensity={32}
          tint={blurTint}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.backdropOverlay, { backgroundColor: backdropOverlayColor }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <View style={[styles.drawerSurface, { borderRightColor: `${borderColor}55` }]}>
          <BlurView
            blurMethod="dimezisBlurViewSdk31Plus"
            blurTarget={blurTarget}
            intensity={56}
            tint={blurTint}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.drawerFill, { backgroundColor: drawerOverlayColor }]} />

          <View style={styles.drawerContent}>
            <DrawerHeader onNewChat={handleNewChat} />

            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={deleteConversation}
            />

            <DrawerFooter onSettings={handleSettings} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    flexDirection: "row",
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFill,
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: "100%",
  },
  drawerSurface: {
    flex: 1,
    overflow: "hidden",
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  drawerFill: {
    ...StyleSheet.absoluteFill,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
});
