import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShallow } from "zustand/shallow";

import { ChatHeader, ChatInput, EmptyState, MessageBubble } from "@/components/chat";
import { SideDrawer } from "@/components/side-drawer";
import { ThemedView } from "@/components/themed-view";
import { useChat } from "@/hooks/use-chat";
import { llmService } from "@/services/llm";
import { useConversationStore } from "@/stores/conversation-store";
import { useModelStore } from "@/stores/model-store";
import type { Message } from "@/types";

export default function ChatScreen() {
  const flatListRef = useRef<FlatList<Message>>(null);
  const insets = useSafeAreaInsets();
  const {
    messages,
    isGenerating,
    isThinking,
    isModelReady,
    activeModel,
    streamingMessageId,
    sendMessage,
    stopGeneration,
  } = useChat();
  const setActiveConversation = useConversationStore(state => state.setActiveConversation);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Get loaded models for the switcher
  const { models, loadedModels, selectedModelId } = useModelStore(
    useShallow(state => ({
      models: state.models,
      loadedModels: state.loadedModels,
      selectedModelId: state.selectedModelId,
    })),
  );
  const { selectModel } = useModelStore.getState();

  // Build loaded model options for the header
  const loadedModelOptions = Object.keys(loadedModels)
    .map(modelId => {
      const model = models.find(m => m.id === modelId);
      if (!model) return null;
      return {
        model,
        isSelected: modelId === selectedModelId,
      };
    })
    .filter(Boolean) as { model: (typeof models)[0]; isSelected: boolean }[];

  const handleMenuPress = () => {
    setDrawerVisible(true);
  };

  const handleNewChatPress = () => {
    setActiveConversation(null);
  };

  const handleSelectModel = (modelId: string) => {
    // Update both LLM service and store
    llmService.selectModel(modelId);
    selectModel(modelId);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      isStreaming={item.id === streamingMessageId}
      isThinking={item.id === streamingMessageId && isThinking}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <View style={[styles.topSafeArea, { paddingTop: insets.top }]}>
        <ChatHeader
          modelName={activeModel?.name ?? "No Model"}
          isConnected={isModelReady}
          loadedModels={loadedModelOptions}
          onMenuPress={handleMenuPress}
          onNewChatPress={handleNewChatPress}
          onSelectModel={handleSelectModel}
        />
      </View>

      <KeyboardAvoidingView style={styles.chatContainer} behavior="padding">
        {messages.length === 0 ? (
          <EmptyState modelLoaded={isModelReady} />
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
        <ChatInput
          onSend={sendMessage}
          onStop={stopGeneration}
          disabled={isGenerating}
          isGenerating={isGenerating}
          modelLoaded={isModelReady}
        />
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
