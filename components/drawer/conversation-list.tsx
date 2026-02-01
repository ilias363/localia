import { Ionicons } from "@expo/vector-icons";
import { Alert, SectionList, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useHaptics } from "@/hooks/use-haptics";
import { useAllThemeColors } from "@/hooks/use-theme-colors";
import type { Conversation } from "@/types";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

interface Section {
  title: string;
  data: Conversation[];
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function groupConversationsIntoSections(conversations: Conversation[]): Section[] {
  const groups: Record<string, Conversation[]> = {};

  for (const conv of conversations) {
    const dateKey = formatDate(conv.updatedAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(conv);
  }

  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

function ConversationItem({
  conversation,
  isActive,
  textColor,
  cardBackground,
  onSelect,
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  textColor: string;
  cardBackground: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.conversationItem, isActive && { backgroundColor: cardBackground }]}
      onPress={() => onSelect(conversation.id)}
      activeOpacity={0.7}
    >
      <Ionicons
        name="chatbubble-outline"
        size={16}
        color={textColor}
        style={styles.conversationIcon}
      />
      <ThemedText style={styles.conversationTitle} numberOfLines={1}>
        {conversation.title}
      </ThemedText>
      <TouchableOpacity
        onPress={() => onDelete(conversation.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.deleteButton}
      >
        <Ionicons name="close" size={16} color={textColor} style={{ opacity: 0.5 }} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: ConversationListProps) {
  const { triggerLight, triggerMedium, triggerWarning } = useHaptics();
  const { cardBackground, text: textColor } = useAllThemeColors();

  const sections = groupConversationsIntoSections(conversations);

  const handleSelectConversation = (id: string) => {
    triggerLight();
    onSelectConversation(id);
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
          onDeleteConversation(id);
        },
      },
    ]);
  };

  if (conversations.length === 0) {
    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons name="chatbubbles-outline" size={40} color={textColor} style={{ opacity: 0.2 }} />
        <ThemedText style={styles.emptyText}>No conversations yet</ThemedText>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      renderItem={({ item }) => (
        <ConversationItem
          conversation={item}
          isActive={item.id === activeConversationId}
          textColor={textColor}
          cardBackground={cardBackground}
          onSelect={handleSelectConversation}
          onDelete={handleDeleteConversation}
        />
      )}
      renderSectionHeader={({ section }) => (
        <ThemedText style={styles.dateHeader}>{section.title}</ThemedText>
      )}
      keyExtractor={item => item.id}
      style={styles.conversationList}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
}

const styles = StyleSheet.create({
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
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    opacity: 0.4,
    fontSize: 13,
  },
});
