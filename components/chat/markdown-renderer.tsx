import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/use-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as Clipboard from "expo-clipboard";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";

interface MarkdownRendererProps {
  content: string;
  textColor: string;
  isStreaming?: boolean;
}

// Streaming cursor character to append
const STREAMING_CURSOR = "▎";

export function MarkdownRenderer({
  content,
  textColor,
  isStreaming = false,
}: MarkdownRendererProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { triggerSuccess } = useHaptics();

  const codeBackground = useThemeColor({}, "inputBackground");
  const codeBorder = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const subtleTextColor = useThemeColor({}, "icon");

  const codeTextColor = isDark ? "#e6edf3" : "#24292e";

  // Append cursor to content when streaming
  const displayContent = isStreaming ? content + STREAMING_CURSOR : content;

  const handleCopyCode = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      triggerSuccess();
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const markdownStyles = StyleSheet.create({
    body: {
      color: textColor,
      fontSize: 16,
      lineHeight: 22,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 8,
    },
    // Inline code
    code_inline: {
      backgroundColor: codeBackground,
      color: tintColor,
      fontFamily: Fonts?.mono ?? "monospace",
      fontSize: 14,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: codeBorder,
    },
    // Code block (fenced)
    fence: {
      backgroundColor: codeBackground,
      color: codeTextColor,
      fontFamily: Fonts?.mono ?? "monospace",
      fontSize: 13,
      lineHeight: 20,
      padding: 12,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: codeBorder,
      marginVertical: 8,
      overflow: "hidden",
    },
    code_block: {
      backgroundColor: codeBackground,
      color: codeTextColor,
      fontFamily: Fonts?.mono ?? "monospace",
      fontSize: 13,
      lineHeight: 20,
      padding: 12,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: codeBorder,
      marginVertical: 8,
    },
    // Strong/bold text
    strong: {
      fontWeight: "700",
    },
    // Emphasis/italic text
    em: {
      fontStyle: "italic",
    },
    // Strike-through
    s: {
      textDecorationLine: "line-through",
    },
    // Links
    link: {
      color: tintColor,
      textDecorationLine: "underline",
    },
    // Blockquote
    blockquote: {
      backgroundColor: codeBackground,
      borderLeftWidth: 3,
      borderLeftColor: tintColor,
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 8,
      borderRadius: 4,
    },
    // Lists
    bullet_list: {
      marginVertical: 4,
    },
    ordered_list: {
      marginVertical: 4,
    },
    list_item: {
      flexDirection: "row",
      marginVertical: 2,
    },
    bullet_list_icon: {
      color: textColor,
      marginRight: 8,
      marginTop: 4,
    },
    ordered_list_icon: {
      color: textColor,
      marginRight: 8,
    },
    // Headings
    heading1: {
      fontSize: 24,
      fontWeight: "700",
      marginTop: 16,
      marginBottom: 8,
      color: textColor,
    },
    heading2: {
      fontSize: 20,
      fontWeight: "700",
      marginTop: 14,
      marginBottom: 6,
      color: textColor,
    },
    heading3: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 12,
      marginBottom: 4,
      color: textColor,
    },
    heading4: {
      fontSize: 16,
      fontWeight: "600",
      marginTop: 10,
      marginBottom: 4,
      color: textColor,
    },
    heading5: {
      fontSize: 15,
      fontWeight: "600",
      marginTop: 8,
      marginBottom: 4,
      color: textColor,
    },
    heading6: {
      fontSize: 14,
      fontWeight: "600",
      marginTop: 8,
      marginBottom: 4,
      color: textColor,
    },
    // Horizontal rule
    hr: {
      backgroundColor: codeBorder,
      height: 1,
      marginVertical: 12,
    },
    // Tables
    table: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: codeBorder,
      borderRadius: 6,
      marginVertical: 8,
      overflow: "hidden",
    },
    thead: {
      backgroundColor: codeBackground,
    },
    th: {
      padding: 8,
      fontWeight: "600",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: codeBorder,
    },
    tr: {
      flexDirection: "row",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: codeBorder,
    },
    td: {
      padding: 8,
      flex: 1,
    },
  });

  // Custom rules to add copy functionality to code blocks
  const rules = {
    fence: (node: any, _children: any, _parent: any, styles: any, _inheritedStyles: any = {}) => {
      const codeContent = node.content || "";
      const language = node.sourceInfo || "";

      return (
        <View key={node.key} style={componentStyles.codeBlockContainer}>
          {/* Header with language and copy button */}
          <View
            style={[
              componentStyles.codeBlockHeader,
              { backgroundColor: codeBackground, borderColor: codeBorder },
            ]}
          >
            <Text style={[componentStyles.codeLanguage, { color: subtleTextColor }]}>
              {language || "code"}
            </Text>
            <Pressable
              onPress={() => handleCopyCode(codeContent)}
              style={({ pressed }) => [
                componentStyles.copyButton,
                pressed && componentStyles.copyButtonPressed,
              ]}
            >
              <Text style={[componentStyles.copyButtonText, { color: tintColor }]}>Copy</Text>
            </Pressable>
          </View>
          {/* Code content */}
          <Text
            style={[
              styles.fence,
              { marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 },
            ]}
          >
            {codeContent.replace(/\n$/, "")}
          </Text>
        </View>
      );
    },
    code_block: (
      node: any,
      _children: any,
      _parent: any,
      styles: any,
      _inheritedStyles: any = {},
    ) => {
      const codeContent = node.content || "";

      return (
        <View key={node.key} style={componentStyles.codeBlockContainer}>
          <View
            style={[
              componentStyles.codeBlockHeader,
              { backgroundColor: codeBackground, borderColor: codeBorder },
            ]}
          >
            <Text style={[componentStyles.codeLanguage, { color: subtleTextColor }]}>code</Text>
            <Pressable
              onPress={() => handleCopyCode(codeContent)}
              style={({ pressed }) => [
                componentStyles.copyButton,
                pressed && componentStyles.copyButtonPressed,
              ]}
            >
              <Text style={[componentStyles.copyButtonText, { color: tintColor }]}>Copy</Text>
            </Pressable>
          </View>
          <Text
            style={[
              styles.code_block,
              { marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 },
            ]}
          >
            {codeContent.replace(/\n$/, "")}
          </Text>
        </View>
      );
    },
  };

  return (
    <Markdown style={markdownStyles} rules={rules}>
      {displayContent}
    </Markdown>
  );
}

const componentStyles = StyleSheet.create({
  codeBlockContainer: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  codeBlockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
  },
  codeLanguage: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "lowercase",
  },
  copyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  copyButtonPressed: {
    opacity: 0.7,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
