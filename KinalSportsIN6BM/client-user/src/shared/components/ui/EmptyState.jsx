import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_SIZE } from "../../constants/theme";

const EmptyState = ({ message }) => (
  <View style={styles.center}>
    <Text style={styles.text}>{message || "No hay datos disponibles"}</Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 150, padding: 24 },
  text: { fontFamily: "serif", fontSize: 18, color: COLORS.textMuted, textAlign: "center" },
});

export default EmptyState;