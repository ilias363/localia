import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, View } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";

import { ConversationList, DrawerFooter, DrawerHeader } from "@/components/drawer";
import { useHaptics } from "@/hooks/use-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useConversationStore } from "@/stores/conversation-store";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.8;

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  insets: EdgeInsets;
}

export function SideDrawer({ visible, onClose, insets }: SideDrawerProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const { triggerLight } = useHaptics();

  const backgroundColor = useThemeColor({}, "background");

  const conversations = useConversationStore(state => state.conversations);
  const activeConversationId = useConversationStore(state => state.activeConversationId);
  const deleteConversation = useConversationStore(state => state.deleteConversation);
  const setActiveConversation = useConversationStore(state => state.setActiveConversation);

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
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: "100%",
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
});
