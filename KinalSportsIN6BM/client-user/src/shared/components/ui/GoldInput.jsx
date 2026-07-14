import { useState } from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_SIZE } from "../../constants/theme";

const GoldInput = ({ label, error, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.group}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, focused && styles.inputFocused, error && styles.inputError]}
        placeholderTextColor={COLORS.textMuted}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  group: { marginBottom: 16, width: "100%" },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 1.4, textTransform: "uppercase", color: COLORS.textMuted, marginBottom: 6 },
  input: {
    width: "100%", backgroundColor: COLORS.warmDark, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text, fontSize: 15, fontWeight: "300",
  },
  inputFocused: { borderColor: COLORS.gold, borderWidth: 1.5 },
  inputError: { borderColor: COLORS.error },
  error: { fontSize: 12, color: COLORS.error, marginTop: 4 },
});

export default GoldInput;