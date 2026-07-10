import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, FONT_SIZE } from "../../constants/theme";

const OutlineButton = ({ title, onPress, loading, disabled, style, small, color }) => {
  const borderColor = color || COLORS.gold;
  const textColor = color || COLORS.gold;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, { borderColor }, (disabled || loading) && styles.disabled, small && styles.small, style]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }, small && styles.textSmall]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.warmDark,
  },
  small: { paddingVertical: 8, paddingHorizontal: 14, alignSelf: "flex-start" },
  disabled: { opacity: 0.5 },
  text: { color: COLORS.gold, fontSize: 13, fontWeight: "600", letterSpacing: 0.5 },
  textSmall: { fontSize: 11 },
});

export default OutlineButton;