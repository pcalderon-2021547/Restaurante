import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS } from "../../constants/theme";

const DangerButton = ({ title, onPress, loading, disabled, style, small }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    disabled={disabled || loading}
    style={[styles.button, (disabled || loading) && styles.disabled, small && styles.small, style]}
  >
    {loading ? <ActivityIndicator color={COLORS.error} /> : <Text style={[styles.text, small && styles.textSmall]}>{title}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(224,90,90,0.1)",
  },
  small: { paddingVertical: 8, paddingHorizontal: 14, alignSelf: "flex-start" },
  disabled: { opacity: 0.5 },
  text: { color: COLORS.error, fontSize: 13, fontWeight: "600" },
  textSmall: { fontSize: 11 },
});

export default DangerButton;