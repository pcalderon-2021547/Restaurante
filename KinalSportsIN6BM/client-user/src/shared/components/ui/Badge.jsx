import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_SIZE } from "../../constants/theme";

const Badge = ({ text, variant = "gold" }) => {
  const colorMap = {
    gold: { bg: "rgba(201,168,76,0.1)", text: COLORS.gold, border: "rgba(201,168,76,0.3)" },
    success: { bg: "rgba(52,211,153,0.1)", text: COLORS.success, border: "rgba(52,211,153,0.3)" },
    danger: { bg: "rgba(224,90,90,0.1)", text: COLORS.error, border: "rgba(224,90,90,0.3)" },
    warning: { bg: "rgba(224,168,90,0.1)", text: COLORS.warning, border: "rgba(224,168,90,0.3)" },
    info: { bg: "rgba(126,184,247,0.1)", text: COLORS.info, border: "rgba(126,184,247,0.3)" },
  };
  const colors = colorMap[variant] || colorMap.gold;
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  text: { fontSize: 11, fontWeight: "600" },
});

export default Badge;