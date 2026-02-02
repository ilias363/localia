import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  cardMargin: {
    marginBottom: 10,
  },
  activeGlow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  progressBar: {
    height: "100%",
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modelName: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  quantBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quantText: {
    fontSize: 13,
    fontWeight: "700",
  },
  infoColumn: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sizeText: {
    fontSize: 11,
    opacity: 0.5,
  },
  primaryButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionButtonGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secondaryActionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteIconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 6,
  },
  activePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 18,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  providerText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
