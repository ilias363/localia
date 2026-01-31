import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightContent?: React.ReactNode;
  labelColor?: string;
  showChevron?: boolean;
  statusDot?: {
    color: string;
    visible: boolean;
  };
}

export function SettingRow({
  icon,
  iconColor,
  label,
  value,
  onPress,
  rightContent,
  labelColor,
  showChevron = false,
  statusDot,
}: SettingRowProps) {
  const textColor = useThemeColor({}, "text");

  const content = (
    <>
      <View style={styles.settingInfo}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.settingTextContainer}>
          <ThemedText style={[styles.settingLabel, labelColor && { color: labelColor }]}>
            {label}
          </ThemedText>
          {value && <ThemedText style={styles.settingValue}>{value}</ThemedText>}
        </View>
      </View>
      <View style={styles.rightSection}>
        {statusDot?.visible && (
          <View style={[styles.statusDot, { backgroundColor: statusDot.color }]} />
        )}
        {rightContent}
        {showChevron && (
          <Ionicons name="chevron-forward" size={18} color={textColor} style={{ opacity: 0.4 }} />
        )}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.settingRow}>{content}</View>;
}

interface SettingToggleProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

export function SettingToggle({
  icon,
  iconColor,
  label,
  value,
  enabled,
  onToggle,
}: SettingToggleProps) {
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");

  return (
    <SettingRow
      icon={icon}
      iconColor={iconColor}
      label={label}
      value={value}
      rightContent={
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: borderColor, true: tintColor + "80" }}
          thumbColor={enabled ? tintColor : "#f4f3f4"}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    paddingHorizontal: 14,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingValue: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
});
