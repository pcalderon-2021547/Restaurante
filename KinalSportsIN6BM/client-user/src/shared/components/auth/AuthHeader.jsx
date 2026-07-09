import { View, Text, StyleSheet } from "react-native";
import { AUTH_COLORS, AUTH_FONTS } from "../../constants/theme";

const AuthHeader = ({ eyebrow, title }) => (
  <View style={styles.container}>
    <View style={styles.brandRow}>
      <Text style={styles.logo}>🍽️</Text>
      <Text style={styles.brand}>Restaurante</Text>
    </View>

    <Text style={styles.eyebrow}>{eyebrow}</Text>
    <Text style={styles.title}>{title}</Text>

    <View style={styles.ruleRow}>
      <View style={styles.rule} />
      <Text style={styles.ruleLabel}>Acceso restringido</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 28 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 26 },
  logo: { fontSize: 30 },
  brand: {
    fontFamily: AUTH_FONTS.heading, fontSize: 14, fontWeight: "600",
    letterSpacing: 3, textTransform: "uppercase", color: AUTH_COLORS.gold,
  },
  eyebrow: {
    fontSize: 12, fontWeight: "300", color: AUTH_COLORS.textSubtle,
    letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6,
  },
  title: {
    fontFamily: AUTH_FONTS.heading, fontSize: 30, fontWeight: "400",
    color: AUTH_COLORS.cream, marginBottom: 18,
  },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rule: { width: 32, height: 1, backgroundColor: AUTH_COLORS.gold, opacity: 0.6 },
  ruleLabel: { fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: AUTH_COLORS.textSubtle },
});

export default AuthHeader;