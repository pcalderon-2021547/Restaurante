import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONT_SIZE } from "../../constants/theme";

const GoldButton = ({ title, onPress, loading, disabled, style, small }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    disabled={disabled || loading}
    style={[styles.wrapper, (disabled || loading) && styles.disabled, small && styles.wrapperSmall, style]}
  >
    <LinearGradient
      colors={[COLORS.gold, COLORS.goldLight, COLORS.gold]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, small && styles.gradientSmall]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.obsidian} />
      ) : (
        <Text style={[styles.text, small && styles.textSmall]}>{title}</Text>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  wrapper: { width: "100%", borderRadius: 6, overflow: "hidden" },
  wrapperSmall: { width: "auto", alignSelf: "flex-start" },
  disabled: { opacity: 0.45 },
  gradient: { paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  gradientSmall: { paddingVertical: 10, paddingHorizontal: 16 },
  text: { color: COLORS.obsidian, fontSize: 13, fontWeight: "600", letterSpacing: 2, textTransform: "uppercase" },
  textSmall: { fontSize: 11, letterSpacing: 1.2 },
});

export default GoldButton;