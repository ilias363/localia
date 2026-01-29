import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatHeader, ChatInput, EmptyState, MessageBubble } from "@/components/chat";
import { SideDrawer } from "@/components/side-drawer";
import { ThemedView } from "@/components/themed-view";
import { useChat } from "@/hooks/use-chat";
import type { Message } from "@/services/mock-llm";
import { useConversationStore } from "@/stores/conversation-store";

export default function ChatScreen() {
  const flatListRef = useRef<FlatList<Message>>(null);
  const insets = useSafeAreaInsets();
  const { messages, isGenerating, streamingMessageId, sendMessage } = useChat();
  const { setActiveConversation } = useConversationStore();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleMenuPress = () => {
    setDrawerVisible(true);
  };

  const handleNewChatPress = () => {
    setActiveConversation(null);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} isStreaming={item.id === streamingMessageId} />
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <View style={[styles.topSafeArea, { paddingTop: insets.top }]}>
        <ChatHeader
          modelName="Mock Model v1.0"
          isConnected={false}
          onMenuPress={handleMenuPress}
          onNewChatPress={handleNewChatPress}
        />
      </View>

      <KeyboardAvoidingView style={styles.chatContainer} behavior="padding">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}
        <ChatInput onSend={sendMessage} disabled={isGenerating} bottomInset={insets.bottom} />
      </KeyboardAvoidingView>

      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} insets={insets} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSafeArea: {},
  chatContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 16,
  },
});
