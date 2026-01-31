import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useHaptics } from "@/hooks/use-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useConversationStore } from "@/stores/conversation-store";
import type { Conversation } from "@/types";

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
  const { triggerLight, triggerMedium, triggerWarning } = useHaptics();

  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const cardBackground = useThemeColor({}, "cardBackground");
  const textColor = useThemeColor({}, "text");

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
    triggerLight();
    setActiveConversation(id);
    onClose();
  };

  const handleSettings = () => {
    triggerLight();
    onClose();
    router.push("/settings");
  };

  const handleDeleteConversation = (id: string) => {
    triggerWarning();
    Alert.alert("Delete Conversation", "Are you sure you want to delete this conversation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          triggerMedium();
          deleteConversation(id);
        },
      },
    ]);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const groupedConversations = conversations.reduce(
    (groups, conv) => {
      const dateKey = formatDate(conv.updatedAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(conv);
      return groups;
    },
    {} as Record<string, Conversation[]>,
  );

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
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <TouchableOpacity
              style={[styles.newChatButton, { borderColor }]}
              onPress={handleNewChat}
              activeOpacity={0.7}
            >
              <Ionicons name="add-outline" size={20} color={textColor} />
              <ThemedText style={styles.newChatText}>New Chat</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.conversationList} showsVerticalScrollIndicator={false}>
            {Object.entries(groupedConversations).map(([dateGroup, convs]) => (
              <View key={dateGroup}>
                <ThemedText style={styles.dateHeader}>{dateGroup}</ThemedText>
                {convs.map(conv => (
                  <TouchableOpacity
                    key={conv.id}
                    style={[
                      styles.conversationItem,
                      conv.id === activeConversationId && {
                        backgroundColor: cardBackground,
                      },
                    ]}
                    onPress={() => handleSelectConversation(conv.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color={textColor}
                      style={styles.conversationIcon}
                    />
                    <ThemedText style={styles.conversationTitle} numberOfLines={1}>
                      {conv.title}
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() => handleDeleteConversation(conv.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="close" size={16} color={textColor} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            {conversations.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={40}
                  color={textColor}
                  style={{ opacity: 0.2 }}
                />
                <ThemedText style={styles.emptyText}>No conversations yet</ThemedText>
              </View>
            )}
          </ScrollView>

          <View style={[styles.bottomActions, { borderTopColor: borderColor }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSettings}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color={textColor} />
              <ThemedText style={styles.actionText}>Settings</ThemedText>
            </TouchableOpacity>
          </View>
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
  header: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 4,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  newChatText: {
    fontSize: 15,
    fontWeight: "500",
  },
  conversationList: {
    flex: 1,
  },
  dateHeader: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.4,
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  conversationIcon: {
    marginRight: 10,
    opacity: 0.5,
  },
  conversationTitle: {
    flex: 1,
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    opacity: 0.4,
    fontSize: 13,
  },
  bottomActions: {
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 10,
  },
  actionText: {
    fontSize: 15,
  },
});
